"""Authorized D1 -> GitHub runner -> ephemeral SQLite restore check.

No dump, records, signed URLs or session hashes are logged or uploaded. Temporary
files are private and removed on completion/failure. Not a durable backup service.
"""
import gzip
import subprocess
import hashlib
import json
import os
from pathlib import Path
import signal
import sqlite3
import sys
import tempfile
import time
import urllib.parse
import urllib.request

EXPECTED_ACCOUNT = '05c3eb3b0c05413d604a3f0fb6522940'
EXPECTED_DATABASE = '40c86354-202d-4b69-b7f1-9cb604932a79'
MAX_BYTES = 32 * 1024 * 1024


class HTTPSRedirectsOnly(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, new_url):
        if urllib.parse.urlsplit(new_url).scheme != 'https':
            raise ValueError('HTTPS required')
        return super().redirect_request(request, fp, code, message, headers, new_url)


def restore_and_verify(sql):
    with sqlite3.connect(':memory:') as db:
        db.execute('PRAGMA temp_store=MEMORY')
        db.executescript(sql.decode('utf-8'))
        if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise ValueError('Integrity check failed')
        if db.execute('PRAGMA foreign_key_check').fetchall():
            raise ValueError('Foreign key check failed')
        if not db.execute("SELECT version FROM schema_migrations WHERE version='0031_simple_pilot'").fetchone():
            raise ValueError('Expected integrated schema missing')
        if db.execute("SELECT 1 FROM seat_claims WHERE status IN('held','confirmed') GROUP BY departure_id,seat_number HAVING COUNT(*)>1 LIMIT 1").fetchone():
            raise ValueError('Duplicate active seat')
        if db.execute('''SELECT 1 FROM standard_vehicle_slots a JOIN standard_vehicle_slots b
          ON a.vehicle_id=b.vehicle_id AND a.id<b.id AND a.active=1 AND b.active=1
          AND a.starts_at<b.ends_at AND a.ends_at>b.starts_at LIMIT 1''').fetchone():
            raise ValueError('Overlapping vehicle slots')
        counts = {name: db.execute('SELECT COUNT(*) FROM ' + name).fetchone()[0]
                  for name in ['bookings', 'standard_custom_bookings', 'departures']}
        if counts['bookings'] + counts['standard_custom_bookings'] == 0:
            raise ValueError('Expected populated development database')
        return {'tables': db.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'").fetchone()[0],
                'rowCounts': counts, 'integrity': 'ok', 'foreignKeys': 'ok',
                'activeSeatsUnique': True, 'vehicleSlotsDoNotOverlap': True}


def main():
    phase = 'configuration'
    try:
        account = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
        token = os.environ.get('CLOUDFLARE_API_TOKEN')
        config = json.loads((Path(__file__).parent / 'wrangler.json').read_text())
        database = config['d1_databases'][0]['database_id']
        if account != EXPECTED_ACCOUNT or database != EXPECTED_DATABASE or not token:
            raise ValueError('Expected authorized development account/database')
        endpoint = f'https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{database}/export'

        def export(body):
            req = urllib.request.Request(endpoint, data=json.dumps(body).encode(), method='POST',
                headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=30) as response:
                data = json.load(response)
            if not data.get('success'):
                raise RuntimeError('D1 export rejected')
            return data['result']

        save_backup=os.environ.get('RUTASEC_PRIVATE_BACKUP')=='true'
        backup_key=None
        if save_backup:
            phase='R2 privacy verification'
            base=f'https://api.cloudflare.com/client/v4/accounts/{account}/r2/buckets/rutasec-dev-files/domains/'
            def private_metadata(path):
                request=urllib.request.Request(base+path,headers={'Authorization':'Bearer '+token})
                with urllib.request.urlopen(request,timeout=30) as r: data=json.load(r)
                if not data.get('success'):raise RuntimeError('Bucket privacy not verified')
                return data['result']
            if private_metadata('managed').get('enabled') is not False:raise RuntimeError('Public bucket is not a backup destination')
            custom=private_metadata('custom')
            domains=custom.get('domains') if isinstance(custom,dict) else custom
            if not isinstance(domains,list):raise RuntimeError('Custom domain privacy not verified')
            if any(d.get('enabled',True) for d in domains):raise RuntimeError('Bucket has a public domain')
        phase = 'D1 export'
        state = export({'output_format': 'polling'})
        for _ in range(15):
            if state.get('status') == 'complete':
                break
            if state.get('status') == 'error' or state.get('error'):
                raise RuntimeError('D1 export failed')
            time.sleep(2)
            state = export({'output_format': 'polling', 'current_bookmark': state['at_bookmark']})
        if state.get('status') != 'complete':
            raise TimeoutError('D1 export incomplete')
        signed_url = state['result']['signed_url']
        if urllib.parse.urlsplit(signed_url).scheme != 'https':
            raise ValueError('HTTPS required')
        phase = 'temporary download'
        # Signed capability only; never forward the Cloudflare API bearer token.
        req = urllib.request.Request(signed_url, headers={'User-Agent': 'Mozilla/5.0 RutasEC authorized restore verification'})
        opener = urllib.request.build_opener(HTTPSRedirectsOnly())
        result = None
        with tempfile.TemporaryDirectory(prefix='rutasec-authorized-restore-') as directory:
            dump = Path(directory) / 'snapshot.sql'
            fd = os.open(dump, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
            with os.fdopen(fd, 'wb') as output, opener.open(req, timeout=30) as response:
                size = 0
                while chunk := response.read(65536):
                    size += len(chunk)
                    if size > MAX_BYTES:
                        raise ValueError('Dump exceeds bounded runner check size')
                    output.write(chunk)
            phase = 'SQLite restore and verification'
            sql = dump.read_bytes()
            result = restore_and_verify(sql)
            result.update({'restore': 'PASS', 'sha256': hashlib.sha256(sql).hexdigest()})
            if save_backup:
                phase='private R2 backup and round-trip verification'
                packed=gzip.compress(sql,mtime=0);archive=Path(directory)/'backup.sql.gz';archive.write_bytes(packed);os.chmod(archive,0o600)
                backup_key='rutasec-dev-files/backups/d1/'+time.strftime('%Y-%m-%d',time.gmtime())+'/'+hashlib.sha256(sql).hexdigest()+'.sql.gz'
                restored=Path(directory)/'readback.sql.gz'
                for args in [['put',backup_key,'--file',str(archive)],['get',backup_key,'--file',str(restored)]]:
                    command=['npx','wrangler','r2','object',*args,'--remote','--config','wrangler.json']
                    process=subprocess.run(command,cwd=Path(__file__).parent,capture_output=True,timeout=90)
                    if process.returncode:raise RuntimeError('Private R2 backup operation failed')
                if restored.read_bytes()!=packed:raise ValueError('Backup read-back mismatch')
                restore_and_verify(gzip.decompress(restored.read_bytes()))
                result['backupReadBackVerified']=True
        # Emit safe metadata only AFTER the temporary directory was removed.
        result.update({'temporaryDumpRemoved': not Path(directory).exists(),
                       'artifactsPublished': False, 'durableBackupCreated': bool(backup_key)})
        print(json.dumps(result))
    except Exception as error:
        # No traceback/URLs/SQL/error payloads: these may contain sensitive data.
        print(json.dumps({'restore': 'FAIL', 'phase': phase, 'errorType': type(error).__name__,
                          'artifactsPublished': False}), file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == '__main__':
    signal.signal(signal.SIGTERM, lambda *_: sys.exit(143))
    main()

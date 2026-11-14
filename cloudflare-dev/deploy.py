"""J1 infrastructure only. Run from repo root; secrets come from environment.

Creates/reuses named DEV resources, applies idempotent schema, deploys probe.
Does not deploy the demo, seed data, expose business APIs or enable payments.
"""
import json
import os
from pathlib import Path
import urllib.error
import urllib.request

ACCOUNT = os.environ['CLOUDFLARE_ACCOUNT_ID']
TOKEN = os.environ['CLOUDFLARE_API_TOKEN']
NAME = 'rutasec-api-dev'
DATABASE = 'rutasec-dev'
BUCKET = 'rutasec-dev-files'
ROOT = Path(__file__).resolve().parent


def api(path, method='GET', body=None, content_type='application/json'):
    if body is not None and not isinstance(body, bytes):
        body = json.dumps(body).encode()
    request = urllib.request.Request(
        f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}{path}',
        data=body, method=method,
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': content_type})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            result = json.load(response)
    except urllib.error.HTTPError as error:
        result = json.load(error)
    if not result.get('success'):
        raise RuntimeError(f'{method} {path}: {result.get("errors")}')
    return result.get('result')


def deploy(source, database_id):
    boundary = 'rutasec-dev-upload-boundary'
    metadata = {'main_module': 'worker.mjs', 'compatibility_date': '2026-11-01',
                'bindings': [{'type': 'd1', 'name': 'DB', 'id': database_id},
                             {'type': 'r2_bucket', 'name': 'BUCKET', 'bucket_name': BUCKET}]}
    parts = []
    for name, filename, mime, content in [
        ('metadata', None, 'application/json', json.dumps(metadata)),
        ('worker.mjs', 'worker.mjs', 'application/javascript+module', source),
    ]:
        disposition = f'Content-Disposition: form-data; name="{name}"'
        if filename:
            disposition += f'; filename="{filename}"'
        parts.append(f'--{boundary}\r\n{disposition}\r\nContent-Type: {mime}\r\n\r\n{content}\r\n')
    payload = (''.join(parts) + f'--{boundary}--\r\n').encode()
    result = api(f'/workers/scripts/{NAME}', 'PUT', payload,
                 f'multipart/form-data; boundary={boundary}')
    # API uploads may reset workers.dev availability; restore it on every upload,
    # including rollback, rather than only during the first deployment.
    api(f'/workers/scripts/{NAME}/subdomain', 'POST', {'enabled': True})
    return result


def main():
    # Preflight all access before mutations. Refuse to overwrite an existing Worker:
    # subsequent updates require reviewing its deployment and using deploy() explicitly.
    scripts = api('/workers/scripts')
    if any(s['id'] == NAME for s in scripts):
        raise RuntimeError('Worker already exists. Inspect active deployment before updating.')
    databases = api('/d1/database?per_page=100')
    buckets = api('/r2/buckets')['buckets']
    subdomain = api('/workers/subdomain')['subdomain']
    db = next((d for d in databases if d['name'] == DATABASE), None)
    if db is None:
        db = api('/d1/database', 'POST', {'name': DATABASE})
    database_id = db['uuid']
    if not any(b['name'] == BUCKET for b in buckets):
        api('/r2/buckets', 'POST', {'name': BUCKET, 'storageClass': 'Standard'})
    sql = (ROOT.parent / 'sync-service/migrations/0001_initial.sql').read_text()
    result = api(f'/d1/database/{database_id}/query', 'POST', {'sql': sql})
    if any(not r.get('success') for r in result):
        raise RuntimeError('Migration statement failed')
    config = {'name': NAME, 'main': 'worker.mjs', 'compatibility_date': '2026-11-01',
              'workers_dev': True,
              'd1_databases': [{'binding': 'DB', 'database_name': DATABASE,
                               'database_id': database_id, 'migrations_dir': '../sync-service/migrations'}],
              'r2_buckets': [{'binding': 'BUCKET', 'bucket_name': BUCKET}]}
    (ROOT / 'wrangler.json').write_text(json.dumps(config, indent=2) + '\n')
    deployment = deploy((ROOT / 'worker.mjs').read_text(), database_id)
    print(json.dumps({'url': f'https://{NAME}.{subdomain}.workers.dev/health',
                      'database_id': database_id, 'bucket': BUCKET,
                      'deployment_id': deployment.get('deployment_id')}, indent=2))


if __name__ == '__main__':
    main()

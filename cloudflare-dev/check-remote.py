"""Remote DEV-only persistence, R2 write/read/cleanup and source rollback check.

Uses the same environment credentials as deploy.py. Temporarily deploys a health
probe, then restores the checked-in source in finally. Never targets demo.
"""
import json
from pathlib import Path
import runpy
import subprocess
import time

ROOT = Path(__file__).resolve().parent
m = runpy.run_path(str(ROOT / 'deploy.py'))
config = json.loads((ROOT / 'wrangler.json').read_text())
db = config['d1_databases'][0]['database_id']
base = 'https://rutasec-api-dev.drbrownlabs.workers.dev'


def query(sql, params=None):
    result = m['api'](f'/d1/database/{db}/query', 'POST',
                      {'sql': sql, 'params': params or []})
    assert all(r.get('success') for r in result), 'D1 query failed'
    return result


def http(path='/health', method='GET'):
    # Python urllib's default agent receives CF error 1010 on workers.dev.
    response = subprocess.check_output([
        'curl', '--fail-with-body', '-sS', '--max-time', '20', '-X', method,
        '-A', 'Mozilla/5.0 RutasEC development verification', base + path], text=True)
    return json.loads(response)


def observe(revision):
    for attempt in range(10):
        try:
            state = http('/health?check=' + str(time.time_ns()))
            if state['revision'] == revision and state['ok']:
                return state
        except (subprocess.CalledProcessError, json.JSONDecodeError):
            pass
        time.sleep(2)
    raise AssertionError('Expected revision not observed')


marker = 'j1-infrastructure-persistence-check'
try:
    query('INSERT INTO users(id,display_name) VALUES(?,?)',
          [marker, 'Fictitious infrastructure check'])
    assert query('SELECT id FROM users WHERE id=?', [marker])[0]['results'] == [{'id': marker}]
    print('D1 independent write/read: PASS', flush=True)
finally:
    query('DELETE FROM users WHERE id=?', [marker])
assert query('SELECT id FROM users WHERE id=?', [marker])[0]['results'] == []
print('D1 cleanup: PASS', flush=True)

source = (ROOT / 'worker.mjs').read_text()
probe = source.replace('j1-infrastructure-v1', 'j1-persistence-rollback-v2')
probe = probe.replace('await env.BUCKET.list({ limit: 1 });', '''
      const key = 'checks/j1-' + crypto.randomUUID();
      try {
        await env.BUCKET.put(key, 'fictitious-infrastructure-check');
        const object = await env.BUCKET.get(key);
        if (!object || await object.text() !== 'fictitious-infrastructure-check') {
          throw new Error('R2 persistence check failed');
        }
      } finally {
        await env.BUCKET.delete(key);
      }
      if ((await env.BUCKET.list({ prefix: key, limit: 1 })).objects.length) {
        throw new Error('R2 cleanup failed');
      }
''')
try:
    m['deploy'](probe, db)
    observe('j1-persistence-rollback-v2')
    print('R2 put/get/delete and temporary revision: PASS', flush=True)
finally:
    restored = m['deploy'](source, db)
    print('Restored version:', restored.get('deployment_id'), flush=True)
observe('j1-infrastructure-v1')
print('Source rollback observed on public endpoint: PASS', flush=True)
for path, method, expected in [('/api/bookings', 'GET', 404), ('/health', 'POST', 405)]:
    status = subprocess.check_output(['curl', '-sS', '--max-time', '20',
        '-o', '/dev/null', '-w', '%{http_code}', '-X', method, base + path], text=True)
    assert int(status) == expected, (method, path, status)
    print(method, path, status, 'PASS', flush=True)

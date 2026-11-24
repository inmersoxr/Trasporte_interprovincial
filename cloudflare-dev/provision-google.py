"""Activate Google on the existing API from runner secrets; never print credentials."""
import json
import os
import re
import subprocess


def provision(env=None, run=None, public_client_id=None):
    env = os.environ if env is None else env
    run = subprocess.run if run is None else run
    client = env.get('GOOGLE_CLIENT_ID', '') or public_client_id or ''
    secret = env.get('GOOGLE_CLIENT_SECRET', '')
    if not env.get('GOOGLE_CLIENT_ID') and not secret:
        print('Google credentials not supplied to this run; existing Worker secrets preserved.')
        return
    if not client or not secret:
        raise ValueError('Configure both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in GitHub Actions secrets.')
    if not re.fullmatch(r'[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com', client):
        raise ValueError('GOOGLE_CLIENT_ID is not a Google Web application client ID.')
    if not 10 <= len(secret) <= 4096 or any(c.isspace() for c in secret):
        raise ValueError('GOOGLE_CLIENT_SECRET has an invalid format.')
    result = run(['node_modules/.bin/wrangler', 'secret', 'bulk', '--config', 'wrangler.json'],
                 input=json.dumps({'GOOGLE_CLIENT_ID': client, 'GOOGLE_CLIENT_SECRET': secret}),
                 text=True, capture_output=True, env=env, timeout=120)
    if result.returncode:
        raise RuntimeError('Google secret upload failed. Check Cloudflare permissions; credential values and command output were withheld.')
    print('Google credential pair configured on rutasec-api-dev. No values printed.')


if __name__ == '__main__':
    try:
        with open('wrangler.json', encoding='utf8') as source:
            public_client_id = json.load(source).get('vars', {}).get('GOOGLE_CLIENT_ID')
        provision(public_client_id=public_client_id)
    except (ValueError, RuntimeError, subprocess.SubprocessError):
        raise SystemExit('Google configuration could not complete. Supply a valid credential pair and check Worker secret permissions; no credential values logged.')

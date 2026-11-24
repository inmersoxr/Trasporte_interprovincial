"""OAuth routing smoke test: no Google account or fake login is created."""
import email.parser
import json
import os
import pathlib
import subprocess
import tempfile
import urllib.parse


def get(url):
    with tempfile.TemporaryDirectory(prefix='rutasec-oauth-check-') as folder:
        headers_path = pathlib.Path(folder) / 'headers'
        body_path = pathlib.Path(folder) / 'body'
        r = subprocess.run(['curl', '--silent', '--show-error', '--max-time', '25',
                            '--dump-header', str(headers_path), '--output', str(body_path),
                            '--write-out', '%{http_code}', url], capture_output=True, text=True)
        if r.returncode:
            raise SystemExit('Could not reach the public OAuth endpoint; response details withheld.')
        blocks = [b for b in headers_path.read_text().split('\n\n') if b.startswith('HTTP/')]
        headers = email.parser.Parser().parsestr(blocks[-1].partition('\n')[2])
        return int(r.stdout), headers, body_path.read_text()


with open('wrangler.json', encoding='utf8') as source:
    client_id = os.environ.get('GOOGLE_CLIENT_ID') or json.load(source).get('vars', {}).get('GOOGLE_CLIENT_ID')
for origin, prefix in [('https://rutasec-web-dev.drbrownlabs.workers.dev', '/standard-api'),
                       ('https://rutasec-admin-dev.drbrownlabs.workers.dev', '/platform-api')]:
    status, _, body = get(origin + prefix + '/auth/config')
    assert status == 200
    config = json.loads(body)
    if not config['google']:
        if client_id or os.environ.get('GOOGLE_CLIENT_SECRET'):
            raise SystemExit('Google credentials supplied but OAuth remains disabled.')
        print(origin + ': Google awaits credential configuration; no login claimed.')
        continue
    status, headers, _ = get(origin + prefix + '/auth/google/start')
    assert status == 302
    target = urllib.parse.urlparse(headers['Location'])
    args = urllib.parse.parse_qs(target.query)
    assert target.scheme == 'https' and target.netloc == 'accounts.google.com'
    assert target.path == '/o/oauth2/v2/auth'
    assert args['redirect_uri'] == [origin + prefix + '/auth/google/callback']
    assert args['response_type'] == ['code'] and args['code_challenge_method'] == ['S256']
    assert set(args['scope'][0].split()) == {'openid', 'email', 'profile'}
    assert all(args.get(k) for k in ['state', 'nonce', 'code_challenge', 'client_id'])
    if client_id:
        assert args['client_id'] == [client_id]
    cookies = headers.get_all('Set-Cookie') or []
    assert any('__Host-rutasec_oauth=' in c and 'HttpOnly' in c and 'Secure' in c for c in cookies)
    print(origin + ': Google redirect, callback, PKCE and secure state cookie verified; real login still requires account consent.')

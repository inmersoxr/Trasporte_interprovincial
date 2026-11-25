"""Explicit, manual first-owner provisioning; no web bootstrap or automatic grants."""
import json, os, re, sys, urllib.request
ACCOUNT='05c3eb3b0c05413d604a3f0fb6522940'
DATABASE='40c86354-202d-4b69-b7f1-9cb604932a79'
SQL="""INSERT INTO platform_admins(user_id,role)
SELECT id,'owner' FROM users WHERE id=? AND status='active'
AND NOT EXISTS(SELECT 1 FROM platform_admins)
RETURNING user_id,role"""
def query(token,sql,params):
    request=urllib.request.Request(f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/d1/database/{DATABASE}/query',data=json.dumps({'sql':sql,'params':params}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(request,timeout=30) as response:
        result=json.load(response)
    if not result.get('success') or not result.get('result',[{}])[0].get('success'):
        raise ValueError('Query failed')
    return result['result'][0].get('results',[])
def main():
    user=os.environ.get('BOOTSTRAP_USER_ID','')
    if not re.fullmatch(r'[0-9a-fA-F-]{36}',user) or os.environ.get('CLOUDFLARE_ACCOUNT_ID')!=ACCOUNT:
        raise ValueError('Explicit user UUID and expected development account required')
    token=os.environ['CLOUDFLARE_API_TOKEN']
    existing=query(token,'SELECT user_id,role FROM platform_admins',[])
    if existing:
        if len(existing)==1 and existing[0]=={'user_id':user,'role':'owner'}:
            print('ownerAlreadyConfigured=true');return
        raise ValueError('Platform authority already configured; bootstrap cannot replace it')
    assigned=query(token,SQL,[user])
    if assigned!=[{'user_id':user,'role':'owner'}]:
        raise ValueError('Active user missing or bootstrap already consumed')

    print('ownerGranted=true; environment=development; noCredentialsPublished=true')
if __name__=='__main__':
    try:main()
    except Exception:
        print('::error::Platform owner bootstrap refused; verify explicit user, existing authority and development configuration',file=sys.stderr)
        sys.exit(1)

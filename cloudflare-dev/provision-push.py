"""Provision an application key pair on the existing Worker, never print secrets."""
import os,json,urllib.request,subprocess
account=os.environ['CLOUDFLARE_ACCOUNT_ID'];token=os.environ['CLOUDFLARE_API_TOKEN']
base=f'https://api.cloudflare.com/client/v4/accounts/{account}/workers/scripts/rutasec-api-dev/secrets'
def call(method,data=None):
 request=urllib.request.Request(base,data=json.dumps(data).encode() if data else None,method=method,headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'})
 with urllib.request.urlopen(request,timeout=30) as r:result=json.load(r)
 if not result.get('success'):raise RuntimeError('Cloudflare did not accept the push configuration')
 return result['result']
names={s['name'] for s in call('GET')};needed={'VAPID_PUBLIC_KEY','VAPID_PRIVATE_KEY'}
if needed<=names:print('Push application keys already configured')
elif needed&names:raise RuntimeError('Push configuration is incomplete; restore the matching key pair before enabling subscriptions')
else:
 code="const k=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const p=Buffer.from(await crypto.subtle.exportKey('raw',k.publicKey)).toString('base64url');const j=await crypto.subtle.exportKey('jwk',k.privateKey);process.stdout.write(JSON.stringify({VAPID_PUBLIC_KEY:p,VAPID_PRIVATE_KEY:j.d}));"
 keys=json.loads(subprocess.check_output(['node','--input-type=module','-e',code]))
 for name,value in keys.items():call('PUT',{'name':name,'text':value,'type':'secret_text'})
 print('Push application keys configured on the existing development API; no external messaging provider added')

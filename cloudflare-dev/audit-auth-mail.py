"""Read-only deployment preflight: metadata only; never print keys or email contents."""
import json,os,urllib.request
ACCOUNT='05c3eb3b0c05413d604a3f0fb6522940'
def main():
 if os.environ.get('CLOUDFLARE_ACCOUNT_ID')!=ACCOUNT:raise ValueError('Wrong account')
 token=os.environ['CLOUDFLARE_API_TOKEN']
 req=urllib.request.Request('https://api.cloudflare.com/client/v4/zones?account.id='+ACCOUNT+'&per_page=50',headers={'Authorization':'Bearer '+token})
 try:
  with urllib.request.urlopen(req,timeout=30) as response:data=json.load(response)
  if not data.get('success'):raise ValueError('Not readable')
  print(json.dumps({'mailPreflight':True,'zonesReadable':True,'zoneCount':len(data['result']),'rutasecDomainCount':sum('rutasec' in z['name'].lower() for z in data['result'])}))
 except Exception:print(json.dumps({'mailPreflight':True,'zonesReadable':False,'zoneCount':None}))
if __name__=='__main__':main()

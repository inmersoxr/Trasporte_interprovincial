import {googleProvider} from './google-provider.mjs';
import {handleAuth,APP_ORIGIN,COOKIE,STATE_COOKIE} from '../identity.mjs';
import {verifiedIdentity,stmt,rows,hash,failure} from '../standard-api.mjs';
export async function verifiedActor({mf,db},subject){
 const provider=await googleProvider(subject),env={DB:db,...provider.env},core={identity:r=>verifiedIdentity(r,{DB:db}),stmt,rows,hash,failure};
 const start=await handleAuth(new Request(APP_ORIGIN+'/auth/google/start'),env,core),target=await provider.authorize(start.headers.get('Location'));target.pathname='/auth/google/callback';
 const response=await handleAuth(new Request(target,{headers:{Cookie:STATE_COOKIE+'='+target.searchParams.get('state')}}),env,core,provider.network);
 const cookie=response.headers.getSetCookie().find(c=>c.startsWith(COOKIE+'=')).split(';')[0];
 const raw=(path,body)=>mf.dispatchFetch(APP_ORIGIN+'/api'+path,{method:body?'POST':'GET',headers:{Cookie:cookie,Origin:APP_ORIGIN,'Content-Type':'application/json'},body:body?JSON.stringify({...body,requestId:body.requestId||crypto.randomUUID()}):undefined});
 return{cookie,raw,call:async(path,body)=>{const response=await raw(path,body);return{status:response.status,data:await response.json()};}};
}

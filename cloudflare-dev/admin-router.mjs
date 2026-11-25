// Separate hostname and asset set, same RutasEC backend and identity database.
export default {async fetch(request,env){const url=new URL(request.url);
 if(url.pathname.startsWith('/platform-api/')){const path=url.pathname.slice('/platform-api'.length);
  if(!path.startsWith('/api/platform/')&&!path.startsWith('/auth/'))return new Response('Not found',{status:404});url.pathname=path;const result=await env.PLATFORM_API.fetch(new Request(url,request));return result;
 }
 if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405});
 const result=await env.ASSETS.fetch(request);const headers=new Headers(result.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");return new Response(result.body,{status:result.status,headers});
}};

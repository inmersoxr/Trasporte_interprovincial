// Appended to an unchanged demo bundle at build time. Parity data has its own R2.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if(url.pathname==='/')return new Response(null,{status:302,headers:{Location:'/standard/'+url.search,'Cache-Control':'no-store'}});
    if(url.pathname==='/demo')return new Response(null,{status:302,headers:{Location:'/demo/'+url.search,'Cache-Control':'no-store'}});
    if(url.pathname.startsWith('/demo/')){
      url.pathname=url.pathname.slice('/demo'.length);
      return env.ASSETS.fetch(new Request(url,request));
    }
    if (url.pathname.startsWith('/standard-api/')) {
      url.pathname = url.pathname.slice('/standard-api'.length);
      return env.STANDARD_API.fetch(new Request(url, request));
    }
    if (url.pathname.startsWith('/api/')) {
      return parityWorker.fetch(request, { BUCKET: env.PARITY_BUCKET });
    }
    return env.ASSETS.fetch(request);
  }
};

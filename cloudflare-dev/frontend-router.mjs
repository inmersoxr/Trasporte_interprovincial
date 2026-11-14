// Appended to an unchanged demo bundle at build time. Parity data has its own R2.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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

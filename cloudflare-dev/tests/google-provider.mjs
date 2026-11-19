// Local, explicitly simulated Google transport. No requests to a real account.
const b64 = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
export async function googleProvider(subject = 'test-google-user') {
  const pair = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  const jwk = {...await crypto.subtle.exportKey('jwk',pair.publicKey),kid:'local-test-key',use:'sig'}, tokens = new Map();
  const env = {GOOGLE_CLIENT_ID:'local-google-client',GOOGLE_CLIENT_SECRET:'local-google-secret'};
  async function authorize(url, extra = {}) {
    const target = new URL(url), code = crypto.randomUUID();
    const claims = {iss:'https://accounts.google.com',aud:env.GOOGLE_CLIENT_ID,sub:subject,email:subject+'@example.com',email_verified:true,name:subject,nonce:target.searchParams.get('nonce'),iat:Date.now()/1000,exp:Date.now()/1000+300,...extra};
    const content = b64({alg:'RS256',kid:jwk.kid}) + '.' + b64(claims);
    tokens.set(code, content + '.' + Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(content))).toString('base64url'));
    const callback = new URL(target.searchParams.get('redirect_uri'));
    callback.search = new URLSearchParams({state:target.searchParams.get('state'),code});
    return callback;
  }
  async function network(url, options) {
    if (url === 'https://oauth2.googleapis.com/token') {
      const token = tokens.get(options.body.get('code'));
      if (!token) return Response.json({error:'invalid_grant'},{status:400});
      return Response.json({id_token:token});
    }
    if (url === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({keys:[jwk]});
    throw new Error('Unexpected external request in local Google simulation');
  }
  return {env,authorize,network};
}

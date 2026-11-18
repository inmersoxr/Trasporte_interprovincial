import {handlePlatform} from './platform-api.mjs';
import {handleAuth} from './identity.mjs';
import {identity,stmt,rows,hash,failure,integer,text,command} from './standard-api.mjs';
import { handleStandard } from './standard-api.mjs';
// Isolated development API. The original demo Worker/ledger are never imported.
const REVISION = 'g1-platform-admin-v1';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if(path.startsWith('/auth/')){try{return await handleAuth(request,env,{identity,stmt,rows,hash,failure});}catch(error){return json({error:error.status?error.message:'No se pudo completar el acceso'},error.status||503);}}
    if (path.startsWith('/api/')) {
      try {
        const result = path.startsWith('/api/platform/')?await handlePlatform(request,env,{identity,stmt,rows,hash,failure,integer,text,command}):await handleStandard(request, env);
        return result instanceof Response ? result : result ? json(result) : json({ error: 'Not found' }, 404);
      } catch (error) {
        return json({ error: error.status ? error.message : 'No se pudo completar la operación' }, error.status || 503);
      }
    }
    if (path !== '/health') return json({ error: 'Not found' }, 404);
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    try {
      const migration = await env.DB.prepare(
        'SELECT version FROM schema_migrations WHERE version = ?'
      ).bind('0013_platform_admin').first();
      // List one object only; never publish object names or content.
      await env.BUCKET.list({ limit: 1 });
      if (!migration || migration.version !== '0013_platform_admin') throw new Error('Migration missing');
      return json({ service: 'RutasEC development', environment: 'development',
        revision: REVISION, ok: true, d1: true, r2: true,
        schema: migration.version, payments: 'disabled' });
    } catch {
      // Infrastructure errors must not expose credentials, SQL or account data.
      return json({ service: 'RutasEC development', environment: 'development',
        revision: REVISION, ok: false, error: 'Development storage unavailable' }, 503);
    }
  }
};

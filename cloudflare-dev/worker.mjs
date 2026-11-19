import {scheduledTasks} from './standard-jobs.mjs';
import {renewSchedules} from './standard-recurring.mjs';
import {dispatchPush} from './standard-notifications.mjs';
import {handlePlatform} from './platform-api.mjs';
import {handleAuth} from './identity.mjs';
import {verifiedIdentity,stmt,rows,hash,failure,integer,text,command} from './standard-api.mjs';
import { handleStandard } from './standard-api.mjs';
// Isolated development API. The original demo Worker/ledger are never imported.
const REVISION = 'integrated-dispatch-operations-v1';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async scheduled(event,env,ctx){ctx.waitUntil(scheduledTasks(event,env));},
  async fetch(request, env,ctx) {
    const path = new URL(request.url).pathname;
    const identity = request => verifiedIdentity(request, env);
    if(path.startsWith('/auth/')){try{return await handleAuth(request,env,{identity,stmt,rows,hash,failure});}catch(error){return json({error:error.status?error.message:'No se pudo completar el acceso'},error.status||503);}}
    if (path.startsWith('/api/')) {
      try {
        const result = path.startsWith('/api/platform/')?await handlePlatform(request,env,{identity,stmt,rows,hash,failure,integer,text,command}):await handleStandard(request, env);
        if(request.method==='POST'&&env.VAPID_PUBLIC_KEY&&/^\/api\/(private-|bookings|departure-change|booking-change|private-service-change|operations)/.test(path)&&ctx?.waitUntil)ctx.waitUntil(dispatchPush(env));
        return result instanceof Response ? result : result ? json(result) : json({ error: 'Not found' }, 404);
      } catch (error) {
        if(/UNIQUE constraint failed: vehicles.plate/.test(error.message))return json({error:'La placa ya está registrada en otra ficha de vehículo'},409);
        if(/UNIQUE constraint failed: standard_drivers/.test(error.message))return json({error:'Esta licencia ya tiene una ficha en tu operadora'},409);
        if(/capacity_reserved|vehicle_identity_locked/.test(error.message))return json({error:'El vehículo tiene asientos o reservas vigentes que deben conservarse'},409);
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
      ).bind('0024_service_changes').first();
      // List one object only; never publish object names or content.
      await env.BUCKET.list({ limit: 1 });
      if (!migration || migration.version !== '0024_service_changes') throw new Error('Migration missing');
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

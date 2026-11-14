// Isolated infrastructure probe. The demo Worker and ledger are never imported.
export const REVISION = 'j1-infrastructure-v1';

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path !== '/health') return json({ error: 'Not found' }, 404);
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    try {
      const migration = await env.DB.prepare(
        'SELECT version FROM schema_migrations WHERE version = ?'
      ).bind('0001_initial').first();
      // List one object only; never publish object names or content.
      await env.BUCKET.list({ limit: 1 });
      if (!migration) throw new Error('Migration missing');
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

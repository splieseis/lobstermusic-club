// POST /api/admin/approve/:id - Approve a pending song (protected)

export async function onRequest(context) {
    const { request, env, params } = context;
    
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    // Simple admin auth via header (set ADMIN_KEY in Cloudflare env vars)
    const adminKey = request.headers.get('X-Admin-Key');
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const songId = params.id;
    
    try {
        await env.DB.prepare(`
            UPDATE songs SET status = 'approved' WHERE id = ?
        `).bind(songId).run();
        
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

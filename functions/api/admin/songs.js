// GET /api/admin/songs - List ALL songs including pending (protected)

export async function onRequest(context) {
    const { request, env } = context;
    
    // Simple admin auth
    const adminKey = request.headers.get('X-Admin-Key');
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const { results } = await env.DB.prepare(`
            SELECT * FROM songs ORDER BY created_at DESC
        `).all();
        
        return Response.json({ success: true, songs: results || [] });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

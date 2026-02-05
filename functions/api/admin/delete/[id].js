// POST /api/admin/delete/:id - Delete a song

export async function onRequest(context) {
    const { request, env, params } = context;
    
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    const adminKey = request.headers.get('X-Admin-Key');
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        // Also delete any votes for this song
        await env.DB.prepare(`DELETE FROM votes WHERE song_id = ?`).bind(params.id).run();
        await env.DB.prepare(`DELETE FROM songs WHERE id = ?`).bind(params.id).run();
        
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

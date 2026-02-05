// POST /api/vote/:id - Vote for a song

export async function onRequest(context) {
    const { request, env, params } = context;
    
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    const songId = params.id;
    
    if (!songId) {
        return Response.json({
            success: false,
            error: 'Missing song ID'
        }, { status: 400 });
    }
    
    try {
        // Get voter IP for rate limiting (basic protection)
        const voterIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const voteKey = `${songId}:${voterIp}`;
        
        // Check if this IP already voted for this song
        const existingVote = await env.DB.prepare(`
            SELECT id FROM votes WHERE vote_key = ?
        `).bind(voteKey).first();
        
        if (existingVote) {
            return Response.json({
                success: false,
                error: 'You already voted for this song!'
            }, { status: 400 });
        }
        
        // Check song exists and is approved
        const song = await env.DB.prepare(`
            SELECT id, status, featured FROM songs WHERE id = ?
        `).bind(songId).first();
        
        if (!song) {
            return Response.json({
                success: false,
                error: 'Song not found'
            }, { status: 404 });
        }
        
        if (song.status !== 'approved' && !song.featured) {
            return Response.json({
                success: false,
                error: 'Cannot vote for pending songs'
            }, { status: 400 });
        }
        
        // Record vote
        await env.DB.prepare(`
            INSERT INTO votes (id, song_id, vote_key, created_at)
            VALUES (?, ?, ?, datetime('now'))
        `).bind(crypto.randomUUID(), songId, voteKey).run();
        
        // Increment vote count
        await env.DB.prepare(`
            UPDATE songs SET votes = votes + 1 WHERE id = ?
        `).bind(songId).run();
        
        // Get new vote count
        const updated = await env.DB.prepare(`
            SELECT votes FROM songs WHERE id = ?
        `).bind(songId).first();
        
        return Response.json({
            success: true,
            votes: updated?.votes || 0
        });
        
    } catch (error) {
        console.error('Error voting:', error);
        return Response.json({
            success: false,
            error: 'Failed to record vote'
        }, { status: 500 });
    }
}

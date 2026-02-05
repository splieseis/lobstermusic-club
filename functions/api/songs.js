// GET /api/songs - List all approved songs + user's pending submissions

export async function onRequest(context) {
    const { env } = context;
    
    try {
        // Get all approved/featured songs
        const { results } = await env.DB.prepare(`
            SELECT id, title, artist, suno_url, votes, status, featured, created_at
            FROM songs
            WHERE status = 'approved' OR featured = 1
            ORDER BY featured DESC, votes DESC, created_at DESC
        `).all();
        
        return Response.json({
            success: true,
            songs: results || []
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
        return Response.json({
            success: false,
            error: 'Failed to fetch songs'
        }, { status: 500 });
    }
}

// POST /api/submit - Submit a new song

export async function onRequest(context) {
    const { request, env } = context;
    
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    try {
        const body = await request.json();
        const { artist, title, sunoUrl } = body;
        
        // Validation
        if (!artist || !title || !sunoUrl) {
            return Response.json({
                success: false,
                error: 'Missing required fields: artist, title, sunoUrl'
            }, { status: 400 });
        }
        
        // Validate Suno URL format
        if (!sunoUrl.includes('suno.com')) {
            return Response.json({
                success: false,
                error: 'Invalid Suno URL. Must be a suno.com link.'
            }, { status: 400 });
        }
        
        // Check for duplicate URL
        const existing = await env.DB.prepare(`
            SELECT id FROM songs WHERE suno_url = ?
        `).bind(sunoUrl).first();
        
        if (existing) {
            return Response.json({
                success: false,
                error: 'This song has already been submitted!'
            }, { status: 400 });
        }
        
        // Generate unique ID
        const id = crypto.randomUUID();
        
        // Insert song (pending approval)
        await env.DB.prepare(`
            INSERT INTO songs (id, title, artist, suno_url, votes, status, featured, created_at)
            VALUES (?, ?, ?, ?, 0, 'pending', 0, datetime('now'))
        `).bind(id, title.slice(0, 100), artist.slice(0, 50), sunoUrl).run();
        
        return Response.json({
            success: true,
            message: 'Song submitted! Awaiting approval.',
            id
        });
        
    } catch (error) {
        console.error('Error submitting song:', error);
        return Response.json({
            success: false,
            error: 'Failed to submit song'
        }, { status: 500 });
    }
}

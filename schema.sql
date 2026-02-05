-- Lobster Music Club Database Schema

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    suno_url TEXT NOT NULL UNIQUE,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    featured INTEGER DEFAULT 0,    -- 1 = featured/pinned
    created_at TEXT DEFAULT (datetime('now'))
);

-- Votes table (for tracking who voted)
CREATE TABLE IF NOT EXISTS votes (
    id TEXT PRIMARY KEY,
    song_id TEXT NOT NULL,
    vote_key TEXT NOT NULL UNIQUE, -- song_id:ip combo to prevent double voting
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (song_id) REFERENCES songs(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_votes ON songs(votes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_song ON votes(song_id);

-- Insert the first featured song (Lobster in the Machine)
INSERT OR IGNORE INTO songs (id, title, artist, suno_url, votes, status, featured)
VALUES (
    'lobster-machine-001',
    'Lobster in the Machine',
    'Simerdinger',
    'https://suno.com/song/8f717226-fa4c-4071-8f7b-91cd7878c51a',
    0,
    'approved',
    1
);

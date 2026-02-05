// === LOBSTER MUSIC CLUB - THE CHAOS ENGINE === 🦞

const API_BASE = '/api';

// Contest end date (stored in DB, but fallback to 7 days from page load)
let CONTEST_END = new Date();
CONTEST_END.setDate(CONTEST_END.getDate() + 7);

// === API CALLS ===
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    return response.json();
}

// === LOAD SONGS ===
async function loadSongs() {
    const grid = document.getElementById('songsGrid');
    
    try {
        const data = await apiCall('/songs');
        
        if (!data.songs || data.songs.length === 0) {
            grid.innerHTML = '<p class="loading">No songs yet... Be the first to submit! 🦞</p>';
            return;
        }
        
        // Get user's votes from localStorage
        const myVotes = JSON.parse(localStorage.getItem('lobster-voted') || '[]');
        
        // Sort by votes (highest first), then by featured
        const songs = data.songs.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return b.votes - a.votes;
        });
        
        grid.innerHTML = songs.map(song => {
            const hasVoted = myVotes.includes(song.id);
            const sunoId = extractSunoId(song.suno_url);
            
            return `
                <div class="song-card ${song.featured ? 'featured' : ''} ${song.status === 'pending' ? 'pending' : ''}">
                    <div class="song-header">
                        <div class="song-info">
                            <h3>${escapeHtml(song.title)}</h3>
                            <span class="artist">by ${escapeHtml(song.artist)}</span>
                        </div>
                        ${song.featured ? '<span class="song-badge">👑 FEATURED</span>' : ''}
                        ${song.status === 'pending' ? '<span class="song-badge pending">⏳ PENDING</span>' : ''}
                    </div>
                    ${song.status === 'approved' || song.featured ? `
                        <div class="suno-embed">
                            <iframe 
                                src="https://suno.com/embed/${sunoId}" 
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy">
                            </iframe>
                        </div>
                        <div class="vote-section">
                            <button 
                                class="vote-btn ${hasVoted ? 'voted' : ''}" 
                                onclick="vote('${song.id}')"
                                ${hasVoted ? 'disabled' : ''}
                            >
                                <span class="vote-icon">🦞</span>
                                <span class="vote-text">${hasVoted ? 'CLACKED!' : 'CLACK!'}</span>
                                <span class="vote-count">${song.votes}</span>
                            </button>
                        </div>
                    ` : `
                        <p style="text-align: center; color: var(--ocean-light); padding: 20px;">
                            Awaiting approval... 🦞
                        </p>
                    `}
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Failed to load songs:', error);
        grid.innerHTML = '<p class="loading">Failed to load songs. Try refreshing! 🦞</p>';
    }
}

function extractSunoId(url) {
    // Extract song ID from various Suno URL formats
    const match = url.match(/suno\.com\/(?:song\/)?([a-f0-9-]+)/i);
    return match ? match[1] : url;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// === VOTING ===
async function vote(songId) {
    const myVotes = JSON.parse(localStorage.getItem('lobster-voted') || '[]');
    
    if (myVotes.includes(songId)) {
        showToast('You already clacked this one! 🦞', 'error');
        return;
    }
    
    try {
        const result = await apiCall(`/vote/${songId}`, 'POST');
        
        if (result.success) {
            myVotes.push(songId);
            localStorage.setItem('lobster-voted', JSON.stringify(myVotes));
            
            showToast('🦞 CLACK! Vote recorded!', 'success');
            spawnCelebrationLobsters();
            
            // Reload songs to update vote counts
            loadSongs();
        } else {
            showToast(result.error || 'Vote failed!', 'error');
        }
    } catch (error) {
        console.error('Vote failed:', error);
        showToast('Failed to vote. Try again! 🦞', 'error');
    }
}

// === SUBMIT SONG ===
document.getElementById('submitForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = this.querySelector('.submit-btn');
    btn.disabled = true;
    btn.textContent = '🦞 SUBMITTING... 🦞';
    
    const formData = {
        artist: document.getElementById('artistName').value,
        title: document.getElementById('songTitle').value,
        sunoUrl: document.getElementById('sunoUrl').value
    };
    
    try {
        const result = await apiCall('/submit', 'POST', formData);
        
        if (result.success) {
            showToast('🦞 Song submitted! Awaiting approval.', 'success');
            this.reset();
            spawnCelebrationLobsters();
            loadSongs();
        } else {
            showToast(result.error || 'Submission failed!', 'error');
        }
    } catch (error) {
        console.error('Submit failed:', error);
        showToast('Failed to submit. Try again! 🦞', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '🦞 SUBMIT YOUR BANGER 🦞';
    }
});

// === DANCING LOBSTERS BACKGROUND ===
function createDancingLobsters() {
    const container = document.getElementById('lobsterContainer');
    const lobsterCount = 15;
    
    for (let i = 0; i < lobsterCount; i++) {
        const lobster = document.createElement('div');
        lobster.className = 'dancing-lobster';
        lobster.textContent = '🦞';
        lobster.style.left = Math.random() * 100 + '%';
        lobster.style.top = Math.random() * 100 + '%';
        lobster.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
        lobster.style.animationDelay = Math.random() * 2 + 's';
        lobster.style.opacity = 0.3 + Math.random() * 0.4;
        container.appendChild(lobster);
    }
}

// === CELEBRATION LOBSTERS ===
function spawnCelebrationLobsters() {
    const container = document.getElementById('lobsterContainer');
    
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const lobster = document.createElement('div');
            lobster.className = 'dancing-lobster';
            lobster.textContent = '🦞';
            lobster.style.left = Math.random() * 100 + '%';
            lobster.style.top = '100%';
            lobster.style.fontSize = '3rem';
            lobster.style.opacity = '1';
            lobster.style.transition = 'top 2s ease-out, opacity 2s';
            
            container.appendChild(lobster);
            
            setTimeout(() => {
                lobster.style.top = '-10%';
                lobster.style.opacity = '0';
            }, 50);
            
            setTimeout(() => lobster.remove(), 2000);
        }, i * 100);
    }
}

// === COUNTDOWN TIMER ===
function updateCountdown() {
    const now = new Date();
    const diff = CONTEST_END - now;
    
    if (diff <= 0) {
        document.getElementById('days').textContent = '0';
        document.getElementById('hours').textContent = '0';
        document.getElementById('minutes').textContent = '0';
        document.getElementById('seconds').textContent = '0';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = '') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// === SPARKLE CURSOR EFFECT ===
const sparkles = ['✨', '🦞', '⭐', '💫', '🌟'];
let lastSparkle = 0;

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle < 100) return;
    lastSparkle = now;
    
    if (Math.random() > 0.7) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }
});

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    createDancingLobsters();
    updateCountdown();
    loadSongs();
    
    setInterval(updateCountdown, 1000);
    
    console.log('🦞 LOBSTER MUSIC CLUB INITIALIZED 🦞');
    console.log('clack clack clack');
});

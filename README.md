# 🦞 Lobster Music Club

The Official OpenClaw Theme Song Contest

**Stack:** Cloudflare Pages + D1 + Workers

## 🚀 Deployment Guide

### Step 1: Install Wrangler & Login

```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create the D1 Database

```bash
cd lobstermusic-club
wrangler d1 create lobstermusic
```

This will output something like:
```
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy that ID** and paste it into `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "lobstermusic"
database_id = "YOUR-ID-HERE"  # <-- paste here
```

### Step 3: Initialize the Database

```bash
# For production
wrangler d1 execute lobstermusic --remote --file=./schema.sql

# For local dev
wrangler d1 execute lobstermusic --local --file=./schema.sql
```

### Step 4: Set Admin Key (for approving submissions)

```bash
wrangler pages secret put ADMIN_KEY
# Enter a secret key when prompted (e.g., "super-secret-lobster-123")
```

### Step 5: Push to GitHub

```bash
git init
git add .
git commit -m "🦞 Initial lobster deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lobstermusic-club.git
git push -u origin main
```

### Step 6: Connect to Cloudflare Pages

1. Go to https://dash.cloudflare.com
2. Go to **Workers & Pages** → **Create application** → **Pages**
3. Connect your GitHub repo
4. Settings:
   - Build command: (leave empty)
   - Output directory: `public`
5. Go to **Settings** → **Functions** → **D1 database bindings**
   - Variable name: `DB`
   - D1 database: `lobstermusic`
6. Deploy!

### Step 7: Add Custom Domain

1. In Cloudflare dashboard, go to your Pages project
2. **Custom domains** → **Set up a custom domain**
3. Enter: `lobstermusic.club`
4. Buy the domain through Cloudflare or point your existing domain's DNS

## 🧪 Local Development

```bash
npm install
npm run db:init:local  # Init local D1 database
npm run dev            # Start local dev server
```

Open http://localhost:8788

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/songs` | GET | List approved songs |
| `/api/submit` | POST | Submit a new song |
| `/api/vote/:id` | POST | Vote for a song |
| `/api/admin/songs` | GET | List all songs (auth required) |
| `/api/admin/approve/:id` | POST | Approve a song (auth required) |

### Admin Auth

Pass `X-Admin-Key` header with your ADMIN_KEY:
```bash
curl -X GET https://lobstermusic.club/api/admin/songs \
  -H "X-Admin-Key: your-secret-key"

curl -X POST https://lobstermusic.club/api/admin/approve/song-id-here \
  -H "X-Admin-Key: your-secret-key"
```

## 🎨 Features

- 🦞 Dancing lobsters EVERYWHERE
- 🪩 Disco ball vibes  
- 🎵 Suno song embeds
- 🗳️ Community voting (CLACK to vote!)
- ⏰ 7-day countdown timer
- 📝 Song submission with moderation
- ✨ Sparkle cursor trail
- 📱 Fully responsive

## 🦞 clack clack clack

---

Made with lobster energy by the OpenClaw community

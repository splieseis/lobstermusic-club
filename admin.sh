#!/bin/bash
# 🦞 Lobster Music Club Admin Script

export CLOUDFLARE_API_TOKEN="V6sJBKhguCHRvEwxGFWOwUwNO5RPyr_WN7sGGc2A"
export CLOUDFLARE_ACCOUNT_ID="e348afcf7e8ef61c1eb7946c2ee881a8"
DB="lobstermusic"
DIR="$(dirname "$0")"

run_sql() {
    cd "$DIR" && npx wrangler d1 execute $DB --remote --command="$1" 2>/dev/null | grep -A 100 '"results"'
}

case "$1" in
    list)
        echo "🦞 All Songs:"
        run_sql "SELECT id, title, artist, status, votes, featured FROM songs ORDER BY created_at DESC"
        ;;
    pending)
        echo "⏳ Pending Songs:"
        run_sql "SELECT id, title, artist, suno_url FROM songs WHERE status = 'pending'"
        ;;
    approve)
        if [ -z "$2" ]; then
            echo "Usage: ./admin.sh approve <song-id>"
            exit 1
        fi
        echo "✅ Approving song: $2"
        run_sql "UPDATE songs SET status = 'approved' WHERE id = '$2'"
        echo "Done!"
        ;;
    reject)
        if [ -z "$2" ]; then
            echo "Usage: ./admin.sh reject <song-id>"
            exit 1
        fi
        echo "❌ Rejecting song: $2"
        run_sql "UPDATE songs SET status = 'rejected' WHERE id = '$2'"
        ;;
    delete)
        if [ -z "$2" ]; then
            echo "Usage: ./admin.sh delete <song-id>"
            exit 1
        fi
        echo "🗑️ Deleting song: $2"
        run_sql "DELETE FROM songs WHERE id = '$2'"
        echo "Done!"
        ;;
    feature)
        if [ -z "$2" ]; then
            echo "Usage: ./admin.sh feature <song-id>"
            exit 1
        fi
        echo "⭐ Featuring song: $2"
        run_sql "UPDATE songs SET featured = 1, status = 'approved' WHERE id = '$2'"
        ;;
    unfeature)
        if [ -z "$2" ]; then
            echo "Usage: ./admin.sh unfeature <song-id>"
            exit 1
        fi
        run_sql "UPDATE songs SET featured = 0 WHERE id = '$2'"
        ;;
    votes)
        echo "🗳️ Vote Counts:"
        run_sql "SELECT title, artist, votes FROM songs WHERE status = 'approved' OR featured = 1 ORDER BY votes DESC"
        ;;
    *)
        echo "🦞 Lobster Music Club Admin"
        echo ""
        echo "Usage: ./admin.sh <command> [id]"
        echo ""
        echo "Commands:"
        echo "  list      - Show all songs"
        echo "  pending   - Show pending submissions"
        echo "  approve   - Approve a song (needs id)"
        echo "  reject    - Reject a song (needs id)"
        echo "  delete    - Delete a song (needs id)"
        echo "  feature   - Feature a song (needs id)"
        echo "  unfeature - Remove featured status (needs id)"
        echo "  votes     - Show vote leaderboard"
        ;;
esac

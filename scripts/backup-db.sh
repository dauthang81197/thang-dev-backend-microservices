#!/bin/bash

# 💾 Database Backup Script for Course Backend

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${DB_NAME:-course_db}"
DB_USER="${DB_USER:-postgres}"

echo "💾 Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
echo "📦 Backing up PostgreSQL database: $DB_NAME"
docker compose exec -T postgres pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/postgres_${DB_NAME}_${TIMESTAMP}.sql.gz"

# Backup Redis (if needed)
echo "📦 Backing up Redis data..."
docker compose exec -T redis redis-cli BGSAVE
sleep 2
docker compose cp redis:/data/dump.rdb "$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

# List backups
echo ""
echo "✅ Backup completed!"
echo ""
echo "📂 Backup files:"
ls -lh $BACKUP_DIR/*${TIMESTAMP}*
echo ""
echo "📊 Total backup size:"
du -sh $BACKUP_DIR
echo ""

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups (keeping last 7 days)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete

echo "✅ Backup process completed!"
echo "📂 Backups stored in: $BACKUP_DIR"

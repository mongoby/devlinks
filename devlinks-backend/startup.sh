#!/bin/bash
# DevLinks Docker startup script
set -e

echo "=== DevLinks Backend Starting ==="

# Create database tables
python -c "
from app.core.database import engine, Base
from app.models import Category, Link, TIL, MockProject, MockSchema, MockLog
Base.metadata.create_all(bind=engine)
"
echo "[OK] Database tables created."

# Check if data exists
HAS_DATA=$(python -c "
import sqlite3, os
db_url = os.environ.get('DATABASE_URL', 'sqlite:///./data/devlinks.db')
db_path = db_url.replace('sqlite:///', '')
if not os.path.exists(db_path):
    print('no')
else:
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(\"SELECT COUNT(*) FROM links\")
    count = cur.fetchone()[0]
    conn.close()
    print('yes' if count > 0 else 'no')
")

if [ "$HAS_DATA" = "no" ]; then
    echo "Seeding initial data..."
    python seed_mock_data.py
    echo "[OK] Seed data created."
else
    echo "[OK] Data already exists, skipping seed."
fi

# Start the application
echo "=== Starting uvicorn ==="
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

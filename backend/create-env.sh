#!/bin/bash

# Create .env file for database connection
# This script creates a .env file with your system username

USERNAME=$(whoami)

cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_mapping_db
DB_USER=$USERNAME
DB_PASSWORD=
EOF

echo "✓ Created .env file with username: $USERNAME"
echo "  If you have a PostgreSQL password, edit .env and add it to DB_PASSWORD"

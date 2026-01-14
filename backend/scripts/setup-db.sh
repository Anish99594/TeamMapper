#!/bin/bash

# Database setup script
# This script helps set up the database for the application

DB_NAME="team_mapping_db"
DB_USER="${DB_USER:-$USER}"

echo "Setting up database: $DB_NAME"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "✓ Database $DB_NAME already exists"
else
    echo "Creating database $DB_NAME..."
    createdb "$DB_NAME"
    echo "✓ Database created"
fi

# Run schema
echo "Running schema..."
psql -d "$DB_NAME" -f "$(dirname "$0")/../db/schema.sql"

if [ $? -eq 0 ]; then
    echo "✓ Schema applied successfully"
else
    echo "✗ Error applying schema"
    exit 1
fi

echo "✓ Database setup complete!"

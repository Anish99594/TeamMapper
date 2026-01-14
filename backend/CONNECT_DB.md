# Database Connection Guide

## Quick Setup

Since you've already created the database `team_mapping_db`, follow these steps:

### 1. Create .env file

In the `backend` directory, create a `.env` file:

```bash
cd backend
cp env.example .env
```

### 2. Configure .env file

Edit the `.env` file with your PostgreSQL credentials. For Homebrew PostgreSQL on macOS, typically:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_mapping_db
DB_USER=your_username
DB_PASSWORD=
```

**Note:** If you're using the default PostgreSQL setup on macOS with Homebrew, you might not need a password. Leave `DB_PASSWORD` empty or set it to your actual password if you've configured one.

To find your PostgreSQL username:
```bash
whoami
```

### 3. Run the database schema

Connect to your database and run the schema:

```bash
psql -d team_mapping_db -f backend/db/schema.sql
```

Or manually in psql:
```bash
psql team_mapping_db
```

Then paste the contents of `backend/db/schema.sql` (or the app will auto-initialize on first run).

### 4. Start the backend server

```bash
cd backend
npm install
npm start
```

The server will:
- Test the database connection
- Initialize the schema if needed
- Start the API server

You should see:
```
✓ Database connected successfully
  Database: team_mapping_db
  Host: localhost:5432
✓ Database schema initialized successfully
✓ user_team_mappings table verified
✓ Server is running on http://localhost:5000
```

## Troubleshooting

### Connection Refused
- Make sure PostgreSQL is running: `brew services list`
- Start PostgreSQL: `brew services start postgresql@14`

### Authentication Failed
- Check your username: `whoami`
- Try connecting manually: `psql -d team_mapping_db`
- If it works manually, use the same username in `.env`

### Database Does Not Exist
- Create it: `createdb team_mapping_db`
- Or: `psql postgres` then `CREATE DATABASE team_mapping_db;`

### Permission Denied
- Make sure your user has access to the database
- Grant permissions if needed: `GRANT ALL PRIVILEGES ON DATABASE team_mapping_db TO your_username;`

# Quick Start Guide

## Starting the Server

### Option 1: Normal Start
```bash
cd backend
npm start
```

### Option 2: If Port is Busy
```bash
cd backend
./kill-port.sh 5001    # Free port 5001
npm start
```

### Option 3: Use Different Port
Edit `backend/.env`:
```
PORT=5002
```

Then update `frontend/src/App.js` and `frontend/package.json` to match.

## Verify Server is Running

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{"status":"OK","message":"Server is running","database":"connected"}
```

## Common Issues

### Port Already in Use
- **Port 5000**: Used by macOS AirPlay Receiver (system service)
- **Port 5001**: May be used by a previous server instance

**Solution**: 
```bash
./kill-port.sh 5001
npm start
```

### Database Connection Failed
- Check PostgreSQL is running: `brew services list`
- Verify `.env` file has correct credentials
- Test connection: `node test-connection.js`

## Server Status

When server starts successfully, you should see:
```
✓ Database connected successfully
  Database: team_mapping_db
  Host: localhost:5432
✓ Database schema initialized successfully
✓ user_team_mappings table verified

✓ Server is running on http://localhost:5001
✓ API endpoints available at http://localhost:5001/api/mappings
```

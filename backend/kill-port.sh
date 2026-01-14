#!/bin/bash

# Script to kill process on specified port (default: 5001)
PORT=${1:-5001}

echo "Checking for process on port $PORT..."

PIDS=$(lsof -ti:$PORT)

if [ -z "$PIDS" ]; then
    echo "✓ Port $PORT is free"
    exit 0
fi

echo "Found process(es) on port $PORT: $PIDS"
echo "Killing process(es)..."

# Kill all processes on this port
for PID in $PIDS; do
    echo "  Killing PID $PID..."
    kill -9 $PID 2>/dev/null
done

# Wait a moment
sleep 2

# Check if port is free
REMAINING=$(lsof -ti:$PORT 2>/dev/null)
if [ -z "$REMAINING" ]; then
    echo "✓ Port $PORT is now free"
    exit 0
else
    echo "✗ Some processes may still be running. Try: sudo lsof -ti:$PORT | xargs kill -9"
    exit 1
fi

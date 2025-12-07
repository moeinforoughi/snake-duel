#!/bin/bash

# Kill any existing processes on ports 4000 and 8080
echo "Cleaning up existing processes on ports 4000 and 8080..."

# Kill processes on port 4000 (backend)
if lsof -ti:4000 > /dev/null 2>&1; then
    echo "Killing process on port 4000..."
    lsof -ti:4000 | xargs kill -9 2>/dev/null || true
    echo "✓ Port 4000 cleaned"
else
    echo "✓ Port 4000 is free"
fi

# Kill processes on port 8080 (frontend)
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "Killing process on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    echo "✓ Port 8080 cleaned"
else
    echo "✓ Port 8080 is free"
fi

echo "✓ Cleanup complete! Ports are ready."

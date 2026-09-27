#!/usr/bin/env bash
# ==============================================================================
# DARKON AI - SOC Multi-Sector Runner Script
# Launches both the Flask Backend (port 5001) and Vite Frontend (port 5173)
# ==============================================================================

# Ensure we run from the project root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Clean up subprocesses on exit (Ctrl+C)
trap 'kill $(jobs -p) 2>/dev/null' EXIT

echo "=================================================="
echo "🛡️  DARKON AI – Cyber Defense SOC Starting..."
echo "=================================================="

# Check Python virtual environment
PYTHON_BIN="$ROOT_DIR/venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    echo "❌ Virtual environment python not found at $PYTHON_BIN"
    echo "   Using system python3..."
    PYTHON_BIN="python3"
fi

# Clear any stale processes occupying ports 5001 or 5173
lsof -ti :5001 | xargs kill -9 2>/dev/null
lsof -ti :5173 | xargs kill -9 2>/dev/null

# 1. Start Backend in background
echo "🚀 [1/2] Starting Flask Backend on http://127.0.0.1:5001..."
(
    cd "$ROOT_DIR/backend"
    PYTHONPATH="$ROOT_DIR/backend" "$PYTHON_BIN" app.py
) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Frontend in background
echo "🚀 [2/2] Starting Vite Frontend on http://localhost:5173..."
(
    cd "$ROOT_DIR/frontend"
    npm run dev
) &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "✅ DARKON AI SOC IS ONLINE:"
echo "   💻 Frontend: http://localhost:5173"
echo "   ⚙️  Backend:  http://127.0.0.1:5001"
echo "   🔑 Login:    darkon.ai / admin123"
echo "=================================================="
echo "Press Ctrl+C to stop both servers."
echo ""

# Keep running and wait for all background processes
wait

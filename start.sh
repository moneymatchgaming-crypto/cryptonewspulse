#!/bin/bash
echo ""
echo " ========================================="
echo "  CryptoNewsPulse - Starting Admin..."
echo " ========================================="
echo ""

# Check that node_modules exists
if [ ! -d "node_modules" ]; then
  echo " node_modules not found. Running setup first..."
  bash setup.sh
fi

echo " Starting backend server..."
node server.cjs &
BACKEND_PID=$!

echo " Waiting for backend to start..."
sleep 2

echo " Starting frontend..."
node node_modules/vite/bin/vite.js --port 5173 &
FRONTEND_PID=$!

echo " Waiting for frontend to start..."
sleep 3

echo " Opening admin panel in browser..."
if command -v open &> /dev/null; then
  open http://localhost:5173/admin   # macOS
elif command -v xdg-open &> /dev/null; then
  xdg-open http://localhost:5173/admin  # Linux
fi

echo ""
echo " Admin is running at: http://localhost:5173/admin"
echo " Default login: admin / admin123"
echo ""
echo " Press Ctrl+C to stop the server."
echo ""

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID

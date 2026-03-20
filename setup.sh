#!/bin/bash
echo ""
echo " ========================================="
echo "  CryptoNewsPulse - First Time Setup"
echo " ========================================="
echo ""
echo " Installing dependencies..."
echo ""
npm install
if [ $? -ne 0 ]; then
  echo ""
  echo " ERROR: npm install failed. Make sure Node.js is installed."
  echo " Download Node.js from: https://nodejs.org"
  exit 1
fi
echo ""
echo " Setup complete! Run ./start.sh to launch the admin."
echo ""

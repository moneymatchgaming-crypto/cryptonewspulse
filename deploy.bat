@echo off
echo 🚀 Deploying CryptoNewsPulse to Vercel...
echo.

echo 📦 Building project...
npm run build

echo.
echo 🌐 Deploying to Vercel...
npx vercel --prod

echo.
echo ✅ Deployment complete!
pause 
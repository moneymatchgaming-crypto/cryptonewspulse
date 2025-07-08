# RSS2JSON API Setup Instructions

## Step 1: Get Your API Key

1. Go to [https://rss2json.com/](https://rss2json.com/)
2. Click "Get API Key" or "Sign Up"
3. Create a free account
4. Copy your API key from the dashboard

## Step 2: Add API Key to Environment Variables

### For Local Development:
Create a `.env` file in the root directory:
```
VITE_RSS2JSON_API_KEY=your_api_key_here
```

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add a new variable:
   - Name: `VITE_RSS2JSON_API_KEY`
   - Value: `your_api_key_here`
5. Save and redeploy

## Step 3: Test the Setup

The site will now fetch real news from RSS feeds! If the API key is not configured, it will fall back to CoinGecko news API.

## Pricing
- **Free tier**: 1,000 requests per day
- **Paid plans**: Start at $9/month for more requests

## Troubleshooting
- If you see "API key not configured" in the console, make sure you've added the environment variable
- If you get rate limit errors, consider upgrading to a paid plan
- The site will automatically fall back to CoinGecko news if RSS2JSON fails 
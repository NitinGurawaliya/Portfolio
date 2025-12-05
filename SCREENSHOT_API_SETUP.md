# Screenshot API Setup Guide

This guide will help you set up a screenshot API service to automatically capture preview images for projects.

## Option 1: ScreenshotAPI.net (Recommended - Free Tier Available)

### Steps:
1. **Sign up**: Go to [https://screenshotapi.net](https://screenshotapi.net)
2. **Create account**: Register with your email
3. **Get API key**: After signup, you'll get an API key in your dashboard
4. **Add to `.env`**:
   ```env
   SCREENSHOT_API_KEY=your_api_key_here
   SCREENSHOT_API_URL=https://shot.screenshotapi.net/screenshot
   ```

### Pricing:
- Free tier: Limited requests per month
- Paid plans available for higher usage

---

## Option 2: URLBox.io

### Steps:
1. **Sign up**: Go to [https://www.urlbox.io](https://www.urlbox.io)
2. **Create account**: Register and verify your email
3. **Get API key**: Find your API key in the dashboard
4. **Add to `.env`**:
   ```env
   SCREENSHOT_API_KEY=your_api_key_here
   SCREENSHOT_API_URL=https://api.urlbox.io/v1/screenshot
   ```

### Note:
You'll need to update the screenshot route parameters for URLBox format.

---

## Option 3: ScreenshotLayer (Alternative)

### Steps:
1. **Sign up**: Go to [https://screenshotlayer.com](https://screenshotlayer.com)
2. **Get API key**: Available in dashboard after signup
3. **Add to `.env`**:
   ```env
   SCREENSHOT_API_KEY=your_api_key_here
   SCREENSHOT_API_URL=http://api.screenshotlayer.com/api/capture
   ```

---

## Option 4: Use Your Own Puppeteer/Playwright Service

If you prefer to host your own screenshot service:

1. **Set up a serverless function** (Vercel, Netlify, etc.)
2. **Use Puppeteer or Playwright** to capture screenshots
3. **Update the API URL** to point to your service

---

## Quick Setup (ScreenshotAPI.net)

1. Visit: https://screenshotapi.net
2. Click "Sign Up" or "Get Started"
3. Complete registration
4. Copy your API key from the dashboard
5. Add to your `.env.local` file:
   ```env
   SCREENSHOT_API_KEY=your_actual_api_key_here
   SCREENSHOT_API_URL=https://shot.screenshotapi.net/screenshot
   ```
6. Restart your development server

---

## Testing

After setup, test the screenshot API:
```bash
curl -X POST http://localhost:3000/api/portfolio/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## Important Notes

- **Keep your API key secret**: Never commit it to Git
- **Add to `.env.local`**: This file should be in `.gitignore`
- **Free tier limits**: Most services have rate limits on free plans
- **Fallback**: If screenshot fails, the system will use OG images or show placeholders

---

## Current Implementation

The screenshot API is **optional**. If not configured:
- The system will gracefully handle the error
- It will fall back to OG images from `/api/extract-metadata`
- Users will see a placeholder if no image is available

You can enable screenshot capture later without breaking existing functionality.


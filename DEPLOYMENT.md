# TripwiseGO Deployment Guide

This guide explains how to deploy the TripwiseGO Feature Request application to Netlify.

## Netlify Deployment (Recommended)

The application is now configured to work with Netlify Functions, which allows the backend to run serverlessly on Netlify.

### Prerequisites
- GitHub account
- Netlify account
- Google Cloud Service Account (already configured)

### Step 1: Push to GitHub
1. Create a new repository on GitHub
2. Push all files to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/tripwisego-features.git
   git push -u origin main
   ```

### Step 2: Deploy to Netlify
1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `echo "Static site build complete"`
   - **Publish directory**: `.` (root directory)
5. Click "Deploy site"

### Step 3: Enable Netlify Functions
The application automatically detects Netlify deployment and uses Netlify Functions for the backend API.

### Files Included for Netlify:
- `netlify.toml` - Netlify configuration
- `netlify/functions/health.js` - Health check endpoint
- `netlify/functions/upload-feature.js` - Feature upload endpoint
- `netlify/functions/features.js` - Feature retrieval endpoint
- `netlify/functions/package.json` - Dependencies for functions

### How It Works:
1. **Local Development**: Uses Node.js server on `localhost:3000`
2. **Netlify Deployment**: Automatically switches to Netlify Functions
3. **API Endpoints**:
   - Local: `http://localhost:3000/api/health`
   - Netlify: `https://your-site.netlify.app/.netlify/functions/health`

### Testing Deployment:
1. After deployment, visit your Netlify site URL
2. Check the connection status indicator (should show "Server Connected")
3. Try submitting a feature request
4. Verify it appears in the Google Spreadsheet

### Troubleshooting:

#### "Server Unavailable" Error:
1. Check Netlify Functions logs in your Netlify dashboard
2. Ensure all function files are properly deployed
3. Verify Google Sheets API credentials are working

#### Functions Not Working:
1. Check that `netlify/functions/package.json` includes `googleapis` dependency
2. Verify function files are in the correct directory structure
3. Check Netlify build logs for any errors

#### CORS Issues:
- The functions include proper CORS headers for cross-origin requests
- If issues persist, check browser console for specific error messages

### Environment Variables (Optional):
For enhanced security, you can move the service account credentials to environment variables:

1. In Netlify dashboard, go to Site settings > Environment variables
2. Add the following variables:
   - `GOOGLE_PRIVATE_KEY`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PROJECT_ID`
3. Update the function files to use `process.env.VARIABLE_NAME`

### Custom Domain (Optional):
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

## Alternative: External Backend Deployment

If you prefer to deploy the Node.js backend separately (e.g., on Heroku, Railway, or Render):

1. Deploy the Node.js server to your preferred platform
2. Update the `DEPLOYED_BACKEND_URL` in `index.html` (line 125)
3. Deploy the frontend to Netlify as a static site

## Support

If you encounter issues during deployment:
1. Check the browser console for error messages
2. Review Netlify function logs
3. Verify Google Spreadsheet permissions
4. Test API endpoints directly using the URLs shown in browser console

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

### Environment Variables (REQUIRED for JWT Fix):
To fix the "Invalid JWT Signature" error, set up environment variables in Netlify:

1. In Netlify dashboard, go to Site settings > Environment variables
2. Add the following variables:
   - `GOOGLE_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxHmq/G7a8/gsg\nIxjIBr2oQbkgTSKq7Q70syaqUMN+xkQVKxihZLYwYbpSCmmMPtFYiRFk57agy9Y0\nLl4ZyIIIVTgwwY22JHEurJbcJtaasZuBNzAR8Fo8lKg6eL90v9vUh+yRBSdcnyk9\nwVhJEAx/6litBG/aG4t8xszj32pBBW5/pQjsZ/iTLfwZsOPnMm5YTCWGD8uOTN4d\nmrsvYo2gJJuFw1Z+m+e6Kf7wQL5cXWLXpvGivNxZZkouMxBGRVTjm0mtZgaVoJl3\ni7JzIemSlA3pL/OgCq7h5svX/HAwuCwrrtnA8pGcGWSDHrENcj6EDlX+U65fx/ER\nuhwP14aPAgMBAAECggEAHquSN4Kgi6yAF7IMJgMIz3yGBqJkyO1g5B2rqd1vZOIH\nQxUh4Dy00b7yiSdVbJwqGyctFGiNdt2lO4b184gFgFTldIfntq0rzjXDr96n1cTA\nlUkNsWWJ8qiZUvq6yIg6lFxvKhOW49KJzTBQTeKSD4pwjZFRnxaa+mHgc+splpWD\n/9xJp72OpWZ0KM6Ubpw8UJER/emNG0iFVfcklWqSCPMj2VdgDcrGsVMMhIxf6D6q\n3T0fVFLroNz8fhZha7VOk7rmvkVKSlK5aUTlIff31esDt5c4ouC8feMiHVHrkSVt\n+gkFBNnpeIK1KhPSGv3Q9OXqqZkHbjjxr4k5tQIqcQKBgQD6Epm/4MsQZqBjRYVI\n8s9il04CnGA64LFybLF1jMKXW2pwoxB0AckpjxrTK/ANPuLZUPK199vRijbPDxhl\nUOZpCNWOcaHacQ3m6eDlRj1sP20RnH+PtelFk4sD8OX7bCGkC9DajEfRDzYCg18+\n+LOF9rRO5LgmOHF+RB3O8ev4EQKBgQC1USUDLrVcxw0Jjoc7DlvUO1D6v6XdYRZb\n/bAhoZs0DfPL7YhpCAKcgmMlmFRWAwQx+wN9PrUlNQVsulFTZb0SeR58kxlZqZYT\nbdeXuiYU3G7DH7LJoGcEY87zcNZwXhtcrbCQUxaMv159Sa6iwRcawPejsppqIm8j\n6woenpU0nwKBgQDlwPkpZSqsIt3w1wqh/xOyjTjLBUkUTyQ48MwKKA0Qapjca7TO\nIGXlnOkUYyXlxYU+DDUyIkr/tXCtxDyxuSY4EjnC6Xu+6mfPY8mQXHxKW+ulZpd8\nPbHYjroGIOnrmWk/AuwcHw5McSE6JeD4Rh8KUaNPaKwX0XvUeli4rWQTQQKBgEmJ\ng41q4Dukr3D00XvuMug8tnc8SzUiL0NX/JtnQ9802XAYAn82tHhtmXCh+3J2/riW\nqa+eQzG3819JobpFRQ28+dRkhJ+M3EU9A3eSE+faD0IsFQMZfy6UnFa3qQEh6c8I\n0td2G2syIkyGGcIAtjIvmUBXK7FoDdNvfEc24iTZAoGATzJzJA+Ic38MBz+Knvtc\nqu2QrhFEHtTN20zHBzHp5rjba0hY7Dj1HuNG7G4shCN0FXEtqooz5GypZzw0S1oe\n8pam9nIlAnXlc/5nPa0NqaVn4dwTk85iizpQeJEZc70VqqYXXyLt8g5hiQEOwrhf\n9Gfrf0cfJzos+IJH4WG/JQU=\n-----END PRIVATE KEY-----\n`
   - `GOOGLE_CLIENT_EMAIL` = `wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com`
   - `GOOGLE_PROJECT_ID` = `gen-lang-client-0709338611`
3. Redeploy your site after adding the environment variables

**Important**: Make sure to include the `\n` characters in the private key exactly as shown above.

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

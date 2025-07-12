# TripwiseGO Troubleshooting Guide

## "Invalid JWT Signature" Error

This error occurs when the Google Service Account credentials are not properly formatted or configured.

### Solution 1: Use Environment Variables (Recommended)

1. **Go to Netlify Dashboard**
   - Navigate to your site
   - Go to Site settings > Environment variables

2. **Add Environment Variables**
   Add these exact variables:

   **GOOGLE_PRIVATE_KEY**:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCxHmq/G7a8/gsg
   IxjIBr2oQbkgTSKq7Q70syaqUMN+xkQVKxihZLYwYbpSCmmMPtFYiRFk57agy9Y0
   Ll4ZyIIIVTgwwY22JHEurJbcJtaasZuBNzAR8Fo8lKg6eL90v9vUh+yRBSdcnyk9
   wVhJEAx/6litBG/aG4t8xszj32pBBW5/pQjsZ/iTLfwZsOPnMm5YTCWGD8uOTN4d
   mrsvYo2gJJuFw1Z+m+e6Kf7wQL5cXWLXpvGivNxZZkouMxBGRVTjm0mtZgaVoJl3
   i7JzIemSlA3pL/OgCq7h5svX/HAwuCwrrtnA8pGcGWSDHrENcj6EDlX+U65fx/ER
   uhwP14aPAgMBAAECggEAHquSN4Kgi6yAF7IMJgMIz3yGBqJkyO1g5B2rqd1vZOIH
   QxUh4Dy00b7yiSdVbJwqGyctFGiNdt2lO4b184gFgFTldIfntq0rzjXDr96n1cTA
   lUkNsWWJ8qiZUvq6yIg6lFxvKhOW49KJzTBQTeKSD4pwjZFRnxaa+mHgc+splpWD
   /9xJp72OpWZ0KM6Ubpw8UJER/emNG0iFVfcklWqSCPMj2VdgDcrGsVMMhIxf6D6q
   3T0fVFLroNz8fhZha7VOk7rmvkVKSlK5aUTlIff31esDt5c4ouC8feMiHVHrkSVt
   +gkFBNnpeIK1KhPSGv3Q9OXqqZkHbjjxr4k5tQIqcQKBgQD6Epm/4MsQZqBjRYVI
   8s9il04CnGA64LFybLF1jMKXW2pwoxB0AckpjxrTK/ANPuLZUPK199vRijbPDxhl
   UOZpCNWOcaHacQ3m6eDlRj1sP20RnH+PtelFk4sD8OX7bCGkC9DajEfRDzYCg18+
   +LOF9rRO5LgmOHF+RB3O8ev4EQKBgQC1USUDLrVcxw0Jjoc7DlvUO1D6v6XdYRZb
   /bAhoZs0DfPL7YhpCAKcgmMlmFRWAwQx+wN9PrUlNQVsulFTZb0SeR58kxlZqZYT
   bdeXuiYU3G7DH7LJoGcEY87zcNZwXhtcrbCQUxaMv159Sa6iwRcawPejsppqIm8j
   6woenpU0nwKBgQDlwPkpZSqsIt3w1wqh/xOyjTjLBUkUTyQ48MwKKA0Qapjca7TO
   IGXlnOkUYyXlxYU+DDUyIkr/tXCtxDyxuSY4EjnC6Xu+6mfPY8mQXHxKW+ulZpd8
   PbHYjroGIOnrmWk/AuwcHw5McSE6JeD4Rh8KUaNPaKwX0XvUeli4rWQTQQKBgEmJ
   g41q4Dukr3D00XvuMug8tnc8SzUiL0NX/JtnQ9802XAYAn82tHhtmXCh+3J2/riW
   qa+eQzG3819JobpFRQ28+dRkhJ+M3EU9A3eSE+faD0IsFQMZfy6UnFa3qQEh6c8I
   0td2G2syIkyGGcIAtjIvmUBXK7FoDdNvfEc24iTZAoGATzJzJA+Ic38MBz+Knvtc
   qu2QrhFEHtTN20zHBzHp5rjba0hY7Dj1HuNG7G4shCN0FXEtqooz5GypZzw0S1oe
   8pam9nIlAnXlc/5nPa0NqaVn4dwTk85iizpQeJEZc70VqqYXXyLt8g5hiQEOwrhf
   9Gfrf0cfJzos+IJH4WG/JQU=
   -----END PRIVATE KEY-----
   ```

   **GOOGLE_CLIENT_EMAIL**:
   ```
   wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com
   ```

   **GOOGLE_PROJECT_ID**:
   ```
   gen-lang-client-0709338611
   ```

3. **Redeploy Your Site**
   - After adding environment variables, trigger a new deployment
   - Go to Deploys tab and click "Trigger deploy"

### Solution 2: Check Service Account Permissions

1. **Verify Google Spreadsheet Access**
   - Open your Google Spreadsheet
   - Click "Share" button
   - Make sure `wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com` has "Editor" access

2. **Check Service Account Status**
   - Go to Google Cloud Console
   - Navigate to IAM & Admin > Service Accounts
   - Verify the service account is active and not disabled

### Solution 3: Generate New Service Account Key

If the above solutions don't work, the service account key might be expired:

1. **Go to Google Cloud Console**
2. **Navigate to IAM & Admin > Service Accounts**
3. **Find your service account**
4. **Click on it and go to "Keys" tab**
5. **Add Key > Create new key > JSON**
6. **Download the new key file**
7. **Update the environment variables with the new credentials**

## Other Common Issues

### "Server Unavailable" Error
- Check if Netlify Functions are deployed correctly
- Verify function logs in Netlify dashboard
- Ensure all required files are in the repository

### CORS Errors
- Functions include proper CORS headers
- Check browser console for specific error messages
- Verify the API endpoints are being called correctly

### Function Timeout
- Netlify Functions have a 10-second timeout limit
- Large spreadsheets might take longer to process
- Consider optimizing the data being sent

## Getting Help

1. **Check Netlify Function Logs**
   - Go to Netlify dashboard
   - Navigate to Functions tab
   - Click on a function to see its logs

2. **Check Browser Console**
   - Open browser developer tools
   - Look for error messages in the Console tab
   - Check Network tab for failed requests

3. **Test API Endpoints Directly**
   - Use tools like Postman or curl
   - Test the health endpoint first: `https://your-site.netlify.app/.netlify/functions/health`
   - Then test upload: `https://your-site.netlify.app/.netlify/functions/upload-feature`

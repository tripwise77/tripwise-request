# Generate New Service Account Key

The "Invalid JWT Signature" error usually means the service account key is corrupted, expired, or invalid. Here's how to generate a fresh one:

## Step 1: Create New Service Account Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select your project: `gen-lang-client-0709338611`

2. **Navigate to Service Accounts**
   - Go to: IAM & Admin > Service Accounts
   - Find: `wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com`

3. **Generate New Key**
   - Click on the service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the new key file

## Step 2: Update Netlify Environment Variables

1. **Open the downloaded JSON file**
   - Copy the `private_key` value (including the `-----BEGIN` and `-----END` parts)
   - Copy the `client_email` value
   - Copy the `project_id` value

2. **Update Netlify Environment Variables**
   - Go to your Netlify dashboard
   - Navigate to Site settings > Environment variables
   - Update these variables with the new values:

   ```
   GOOGLE_PRIVATE_KEY = [paste the private_key value here]
   GOOGLE_CLIENT_EMAIL = [paste the client_email value here]
   GOOGLE_PROJECT_ID = [paste the project_id value here]
   ```

3. **Redeploy**
   - Trigger a new deployment in Netlify
   - Test the upload functionality

## Step 3: Alternative - Update Service Account File

If you prefer to update the service account file instead:

1. **Replace service-account.json**
   - Replace the contents of `service-account.json` with the new downloaded file
   - Commit and push to GitHub
   - Netlify will automatically redeploy

## Step 4: Verify Spreadsheet Permissions

Make sure the service account has access to your spreadsheet:

1. **Open your Google Spreadsheet**
   - URL: https://docs.google.com/spreadsheets/d/18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s/edit

2. **Share with Service Account**
   - Click "Share" button
   - Add the service account email: `wanderly-feedback@gen-lang-client-0709338611.iam.gserviceaccount.com`
   - Give it "Editor" permissions
   - Click "Send"

## Step 5: Test the Fix

After updating the credentials:

1. **Test the health endpoint**
   - Visit: `https://your-site.netlify.app/.netlify/functions/health`
   - Should return: `{"status":"OK",...}`

2. **Test feature upload**
   - Try submitting a feature request through your app
   - Check if it appears in the Google Spreadsheet

## Common Issues

### Still Getting JWT Error?
- Make sure the private key includes the `\n` characters exactly as they appear in the JSON
- Verify the service account email is correct
- Check that the service account is not disabled in Google Cloud Console

### Service Account Not Found?
- The service account might have been deleted
- Create a new service account:
  1. Go to IAM & Admin > Service Accounts
  2. Click "Create Service Account"
  3. Name: `wanderly-feedback`
  4. Grant "Editor" role
  5. Create and download the key

### Spreadsheet Access Denied?
- Make sure the service account email is shared with the spreadsheet
- Check that it has "Editor" permissions (not just "Viewer")

## Quick Fix Script

If you want to test with a completely new setup:

1. Create a new Google Spreadsheet
2. Create a new service account
3. Share the spreadsheet with the new service account
4. Update the `SPREADSHEET_ID` in the Netlify functions
5. Update the environment variables with the new credentials

This will eliminate any issues with the current setup and give you a fresh start.

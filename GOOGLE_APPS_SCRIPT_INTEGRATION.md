# Google Apps Script Integration Guide

This document explains how the TripwiseGO application integrates with Google Apps Script for uploading feature requests to Google Sheets.

## Overview

The application now supports two methods for uploading data to Google Sheets:

1. **Google Apps Script Web App** (Primary) - Direct integration with your deployed Apps Script
2. **Backend API** (Fallback) - Server-side integration using Google Sheets API

### Protocol-Specific Behavior

The application automatically detects the protocol and uses the appropriate method:

- **file:// Protocol**: Uses form submission to bypass CORS restrictions
- **http:// / https:// Protocol**: Uses fetch API with CORS support

This ensures the application works whether opened directly as a file or served from a web server.

## Google Apps Script Configuration

### Apps Script URL
```
https://script.google.com/macros/s/AKfycbxor12M8pVKFLGGJ-EUyVUHPjmIUcSiilZOPimrQkprIgmWlG-X39If1naWcPp13jSB/exec
```

### Expected Request Formats

The client-side code tries multiple request formats for maximum compatibility:

#### Feature Submission

**Method 1: JSON POST (Preferred)**
```javascript
{
  "action": "addFeature",
  "data": {
    "id": "1234567890",
    "title": "Feature Title",
    "description": "Feature Description",
    "votes": 0,
    "date": "2024-01-01T00:00:00.000Z",
    "creatorId": "user123"
  }
}
```

**Method 2: FormData POST (Fallback)**
```
action=addFeature
id=1234567890
title=Feature Title
description=Feature Description
votes=0
date=2024-01-01T00:00:00.000Z
creatorId=user123
```

#### Voting System

**Method 1: JSON POST (Preferred)**
```javascript
{
  "action": "vote",
  "data": {
    "featureId": "1234567890",
    "voteType": "up",
    "userId": "user123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Method 2: FormData POST (Fallback)**
```
action=vote
featureId=1234567890
voteType=up
userId=user123
timestamp=2024-01-01T00:00:00.000Z
```

## Apps Script Requirements

Your Google Apps Script should handle the following:

### 1. CORS Configuration
Ensure your Apps Script is deployed with proper permissions:
- Execute as: **Me** (your account)
- Who has access: **Anyone** (for public access) or **Anyone with Google account**

### 2. doPost Function
Your Apps Script should have a `doPost` function that handles incoming requests:

```javascript
function doPost(e) {
  try {
    // Handle JSON requests
    if (e.postData && e.postData.type === 'application/json') {
      const data = JSON.parse(e.postData.contents);

      if (data.action === 'addFeature') {
        return addFeatureToSheet(data.data);
      } else if (data.action === 'vote') {
        return handleVote(data.data);
      }
    }

    // Handle FormData requests
    const params = e.parameter;

    if (params.action === 'addFeature') {
      const featureData = {
        id: params.id,
        title: params.title,
        description: params.description,
        votes: parseInt(params.votes) || 0,
        date: params.date,
        creatorId: params.creatorId
      };
      return addFeatureToSheet(featureData);
    } else if (params.action === 'vote') {
      const voteData = {
        featureId: params.featureId,
        voteType: params.voteType,
        userId: params.userId,
        timestamp: params.timestamp
      };
      return handleVote(voteData);
    }

    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addFeatureToSheet(data) {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Feature Request');

  sheet.appendRow([
    data.id,
    data.title,
    data.description,
    data.votes,
    data.date,
    data.creatorId
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({success: true, message: 'Feature added successfully'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleVote(voteData) {
  const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Feature Request');
  const voteSheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Votes') ||
                   SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').insertSheet('Votes');

  // Check for duplicate votes
  const voteRange = voteSheet.getDataRange();
  const voteValues = voteRange.getValues();

  for (let i = 1; i < voteValues.length; i++) {
    if (voteValues[i][0] === voteData.featureId && voteValues[i][2] === voteData.userId) {
      return ContentService
        .createTextOutput(JSON.stringify({success: false, error: 'User has already voted on this feature'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Record the vote
  voteSheet.appendRow([
    voteData.featureId,
    voteData.voteType,
    voteData.userId,
    voteData.timestamp
  ]);

  // Update vote count in main sheet
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === voteData.featureId) {
      let currentVotes = parseInt(values[i][3]) || 0;
      if (voteData.voteType === 'up') {
        currentVotes += 1;
      } else if (voteData.voteType === 'down') {
        currentVotes = Math.max(currentVotes - 1, 0);
      }
      sheet.getRange(i + 1, 4).setValue(currentVotes);
      break;
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({success: true, message: 'Vote recorded successfully'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3. Optional: doGet Function for Testing
```javascript
function doGet(e) {
  if (e.parameter.action === 'test') {
    return ContentService
      .createTextOutput('Google Apps Script is working!')
      .setMimeType(ContentService.MimeType.TEXT);
  }
  
  return ContentService
    .createTextOutput('Google Apps Script Web App is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

## Client-Side Configuration

### Primary Method Selection
In `index.html`, you can configure which method to use as primary:

```javascript
// Set to true to use Google Apps Script as primary method
const USE_APPS_SCRIPT_PRIMARY = true;
```

### Error Handling
The integration includes comprehensive error handling for:
- Network connectivity issues
- CORS problems
- Authentication errors
- Timeout issues
- Invalid responses

## Testing the Integration

### 1. Using the Test Page
Open `test-apps-script.html` in your browser to test different request methods:
- JSON POST requests
- FormData POST requests
- GET requests (for basic connectivity)
- Full integration test

### 2. Using Browser Console
In the main application, you can test from the browser console:
```javascript
// Test Google Apps Script directly
testGoogleAppsScript();
```

### 3. Manual Testing
1. Open the main application (`index.html`)
2. Click the "+" button to add a feature request
3. Fill in the form and submit
4. **For file:// protocol**: A new tab will open showing the Apps Script response
5. **For http:// protocol**: Check the browser console for detailed logs
6. Verify the data appears in your Google Spreadsheet

### 4. Form Submission Test
Use `test-form-submission.html` to test the form submission method specifically:
- Works from file:// protocol
- Opens response in new tab
- Bypasses CORS restrictions

### 5. Voting System Test
Use `test-voting-system.html` to test the voting functionality:
- Test JSON and FormData voting requests
- Test duplicate vote prevention
- Demo voting interface
- Vote statistics and debugging tools

### 6. Browser Console Testing
In the main application, you can test from the browser console:
```javascript
// Test feature submission
testGoogleAppsScript();

// Test voting system
testVoting(); // Uses first available feature
testVoting('specific-feature-id'); // Vote on specific feature

// Check vote statistics
getVoteStats();
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure your Apps Script is deployed with public access
- Check that the script URL is correct
- Verify the script is published as a web app

#### 2. Authentication Errors
- Make sure the Apps Script has proper permissions
- Check if the script execution policy allows external requests

#### 3. Timeout Issues
- Apps Script responses can be slow (up to 30 seconds timeout is set)
- Check if your script is optimized for performance

#### 4. Invalid Response Format
- Ensure your Apps Script returns proper JSON responses
- Check the response format in browser developer tools

### Debug Steps

1. **Check Network Tab**: Open browser developer tools and check the Network tab for request/response details
2. **Console Logs**: Check browser console for detailed error messages
3. **Apps Script Logs**: Check your Google Apps Script execution logs
4. **Test Page**: Use the dedicated test page to isolate issues

## Response Formats

### Success Response (JSON)
```json
{
  "success": true,
  "message": "Feature added successfully",
  "data": { ... }
}
```

### Error Response (JSON)
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Text Response
If your Apps Script returns plain text, the client will treat it as success unless it contains error keywords like "error", "failed", "exception", or "unauthorized".

## Fallback Behavior

If Google Apps Script fails, the application will automatically fall back to the backend API (if available). The fallback order depends on the `USE_APPS_SCRIPT_PRIMARY` setting:

- **Primary: Apps Script** → Falls back to Backend API
- **Primary: Backend API** → Falls back to Apps Script

This ensures maximum reliability for your users.

# TripwiseGO Feature Request System

A web application that allows users to submit feature requests which are automatically uploaded to a Google Spreadsheet using a service account for authentication.

## Features

- ✅ **Server-only feature request submissions** - No localStorage fallback
- ✅ **Automatic upload to Google Spreadsheet** using service account authentication
- ✅ **Real-time server connectivity monitoring** with automatic reconnection
- ✅ **Mobile-optimized deployment** for Netlify and similar platforms
- ✅ **Enhanced error handling** with specific error messages
- ✅ **Robust CORS configuration** for cross-device compatibility
- ✅ **TripwiseGO logo integration** with fallback support
- ✅ **Responsive design** with modern UI
- ✅ **Connection status indicator** (Server Connected/Unavailable)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Google Cloud Service Account with Sheets API access

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Sheets Access**
   - The service account credentials are already configured in `service-account.json`
   - The spreadsheet ID is set to: `18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s`
   - Make sure the service account has edit access to the spreadsheet

4. **Start the server**
   ```bash
   npm start
   ```

5. **Access the application**
   - **Server Mode (Recommended)**: Open your browser and go to: `http://localhost:3000`
   - **Local Mode**: You can also open `index.html` directly in your browser (features will be saved locally only)

## Usage Modes

### Server Mode (Recommended)
When accessing the application via `http://localhost:3000`:
- ✅ Feature requests are uploaded to Google Spreadsheet
- ✅ Real-time synchronization with the spreadsheet
- ✅ Shows "Connected to Server" status indicator
- ✅ Full functionality including data persistence

### Local Mode
When opening `index.html` directly in a browser:
- ✅ All UI functionality works
- ✅ Feature requests are saved to browser's localStorage
- ⚠️ No upload to Google Spreadsheet
- ⚠️ Shows "Local Mode" status indicator
- ⚠️ Data is only stored locally in the browser

## Deployment

### Netlify Deployment (Fixed!)
This application now works perfectly on Netlify with **Netlify Functions**:

1. **Automatic Environment Detection**: Detects localhost vs Netlify deployment
2. **Netlify Functions Backend**: Uses serverless functions for Google Sheets integration
3. **Cross-Device Compatibility**: Works on both mobile and desktop when deployed
4. **No External Backend Required**: Everything runs on Netlify infrastructure

### Quick Deployment Steps:
1. Push code to GitHub repository
2. Connect repository to Netlify
3. Deploy automatically - no build configuration needed!
4. The app will automatically use Netlify Functions for the backend

**Files for Netlify:**
- `netlify.toml` - Configuration
- `netlify/functions/` - Serverless backend functions
- Automatic API endpoint detection

### Key Deployment Features
- ✅ **Cross-device compatibility**: Works consistently on mobile and desktop
- ✅ **Real-time connectivity monitoring**: Automatically detects server availability
- ✅ **Robust error handling**: Provides clear error messages when server is unavailable
- ✅ **No local storage dependencies**: All data operations require server connectivity

### Deployment Notes
- The application will show "Server Unavailable" if the backend API is not accessible
- Feature submissions are blocked when server is unavailable (no local fallback)
- Cached data may be displayed for viewing, but no new submissions are allowed without server connectivity

## API Endpoints

### POST /api/upload-feature
Upload a new feature request to the Google Spreadsheet.

**Request Body:**
```json
{
  "title": "Feature Title",
  "description": "Feature Description",
  "creatorId": "user-id-optional"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feature request uploaded successfully",
  "data": {
    "id": "1751514667447",
    "title": "Feature Title",
    "description": "Feature Description",
    "votes": 0,
    "date": "2025-07-03T03:51:07.447Z",
    "creatorId": "user-id"
  }
}
```

### GET /api/features
Retrieve all feature requests from the Google Spreadsheet.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1751514667447",
      "title": "Feature Title",
      "description": "Feature Description",
      "votes": 0,
      "date": "2025-07-03T03:51:07.447Z",
      "creatorId": "user-id"
    }
  ]
}
```

### GET /api/health
Health check endpoint to verify the API is running.

## Google Spreadsheet Structure

The system expects the following columns in the "Feature Request" sheet:

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| ID       | Title    | Description | Votes | Date | Creator ID |

## Testing

Run the test script to verify the upload functionality:

```bash
node test-upload.js
```

This will:
1. Upload a test feature request
2. Retrieve all feature requests
3. Display the results

## File Structure

```
├── index.html          # Frontend web application
├── server.js           # Backend Node.js server
├── package.json        # Node.js dependencies
├── service-account.json # Google Cloud service account credentials
├── test-upload.js      # Test script for API functionality
├── style.css           # Additional CSS styles
└── README.md           # This file
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript, Tailwind CSS, Font Awesome
- **Backend**: Node.js, Express.js
- **Database**: Google Sheets (via Google Sheets API)
- **Authentication**: Google Cloud Service Account

## Security Notes

- The service account credentials are included for demonstration purposes
- In production, store credentials securely using environment variables
- Consider implementing rate limiting and input validation for production use

## Support

For issues or questions, please check the console logs in both the browser and server terminal for debugging information.

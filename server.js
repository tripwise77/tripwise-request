const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration for mobile compatibility
app.use(cors({
    origin: true, // Allow all origins for Netlify deployment
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    exposedHeaders: ['Content-Type']
}));

// Handle preflight requests
app.options('*', cors());

// Enhanced body parser with larger limits
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('.'));

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')}`);
    next();
});

// Google Sheets configuration
const SPREADSHEET_ID = '18_dYxomtS1cjaKi6hWTiNHuELOcjnunf-2qOotPML4s';
const SHEET_NAME = 'Feature Request';

// Initialize Google Sheets API
async function initializeGoogleSheets() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const authClient = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: authClient });
        
        return sheets;
    } catch (error) {
        console.error('Error initializing Google Sheets:', error);
        throw error;
    }
}

// Upload feature request to Google Sheets
async function uploadToGoogleSheets(featureData) {
    try {
        const sheets = await initializeGoogleSheets();
        
        const values = [
            [
                featureData.id,
                featureData.title,
                featureData.description,
                featureData.votes || 0,
                featureData.date,
                featureData.creatorId || 'anonymous'
            ]
        ];

        const request = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:F`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        };

        const response = await sheets.spreadsheets.values.append(request);
        console.log('Feature request uploaded successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading to Google Sheets:', error);
        throw error;
    }
}

// Read feature requests from Google Sheets
async function readFromGoogleSheets() {
    try {
        const sheets = await initializeGoogleSheets();
        
        const request = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A2:F`,
        };

        const response = await sheets.spreadsheets.values.get(request);
        const rows = response.data.values;
        
        if (!rows || rows.length === 0) {
            return [];
        }

        const features = rows.map(row => ({
            id: row[0] || '',
            title: row[1] || '',
            description: row[2] || '',
            votes: parseInt(row[3]) || 0,
            date: row[4] || '',
            creatorId: row[5] || 'anonymous'
        }));

        return features;
    } catch (error) {
        console.error('Error reading from Google Sheets:', error);
        throw error;
    }
}

// API Routes

// Upload feature request
app.post('/api/upload-feature', async (req, res) => {
    try {
        console.log('Upload request received:', req.body);

        const { title, description, creatorId } = req.body;

        // Enhanced validation
        if (!title || !description) {
            console.log('Validation failed: missing title or description');
            return res.status(400).json({
                success: false,
                error: 'Title and description are required'
            });
        }

        if (title.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Title must be at least 3 characters long'
            });
        }

        if (description.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Description must be at least 10 characters long'
            });
        }

        const featureData = {
            id: Date.now().toString(),
            title: title.trim(),
            description: description.trim(),
            votes: 0,
            date: new Date().toISOString(),
            creatorId: creatorId || 'anonymous'
        };

        console.log('Attempting to upload to Google Sheets:', featureData);
        await uploadToGoogleSheets(featureData);
        console.log('Successfully uploaded to Google Sheets');

        res.json({
            success: true,
            message: 'Feature request uploaded to Google Spreadsheet successfully',
            data: featureData
        });
    } catch (error) {
        console.error('Error in upload-feature endpoint:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to upload feature request to Google Spreadsheet';
        let statusCode = 500;

        if (error.message.includes('authentication')) {
            errorMessage = 'Google Sheets authentication failed';
            statusCode = 503;
        } else if (error.message.includes('quota')) {
            errorMessage = 'Google Sheets API quota exceeded';
            statusCode = 503;
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            errorMessage = 'Network error connecting to Google Sheets';
            statusCode = 503;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all feature requests
app.get('/api/features', async (req, res) => {
    try {
        const features = await readFromGoogleSheets();
        res.json({ 
            success: true, 
            data: features 
        });
    } catch (error) {
        console.error('Error in features endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to fetch feature requests',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'TripwiseGO Feature Request API is running',
        timestamp: new Date().toISOString()
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  POST /api/upload-feature - Upload a new feature request`);
    console.log(`  GET /api/features - Get all feature requests`);
    console.log(`  GET /api/health - Health check`);
});

module.exports = app;

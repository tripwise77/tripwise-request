const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

// Import Supabase services
const supabaseService = require('./supabase-service');
const votingService = require('./voting-service');
const fileUploadService = require('./file-upload-service');

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

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Serve static files
app.use(express.static('.'));

// Add request logging for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')}`);
    next();
});

// Initialize services on startup
async function initializeServices() {
    try {
        console.log('Initializing Supabase services...');

        // Initialize file upload service (create bucket if needed)
        const bucketResult = await fileUploadService.initializeBucket();
        if (!bucketResult.success) {
            console.warn('File upload service initialization warning:', bucketResult.error);
        }

        console.log('✅ Supabase services initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize services:', error);
        return false;
    }
}

// API Routes

// Upload feature request
app.post('/api/upload-feature', upload.single('attachment'), async (req, res) => {
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

        console.log('Attempting to save to Supabase:', featureData);
        const result = await supabaseService.addFeature(featureData);

        if (!result.success) {
            throw new Error(result.error);
        }

        console.log('Successfully saved to Supabase');

        // Handle file upload if present
        let fileUploadResult = null;
        if (req.file) {
            console.log('Processing file upload:', req.file.originalname);
            fileUploadResult = await fileUploadService.uploadFile(
                req.file,
                result.data.id,
                creatorId || 'anonymous'
            );

            if (!fileUploadResult.success) {
                console.warn('File upload failed:', fileUploadResult.error);
                // Don't fail the entire request if file upload fails
            }
        }

        res.json({
            success: true,
            message: 'Feature request saved successfully',
            data: result.data,
            fileUpload: fileUploadResult
        });
    } catch (error) {
        console.error('Error in upload-feature endpoint:', error);

        // Provide more specific error messages
        let errorMessage = 'Failed to save feature request';
        let statusCode = 500;

        if (error.message.includes('network') || error.message.includes('timeout')) {
            errorMessage = 'Network error connecting to database';
            statusCode = 503;
        } else if (error.message.includes('validation')) {
            errorMessage = 'Validation error: ' + error.message;
            statusCode = 400;
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
        const result = await supabaseService.getFeatures();

        if (!result.success) {
            throw new Error(result.error);
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Error in features endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch feature requests',
            details: error.message
        });
    }
});

// Vote on a feature
app.post('/api/vote', async (req, res) => {
    try {
        const { featureId, voteType, userId } = req.body;

        if (!featureId || !voteType || !userId) {
            return res.status(400).json({
                success: false,
                error: 'featureId, voteType, and userId are required'
            });
        }

        const result = await votingService.voteOnFeature(featureId, voteType, userId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in vote endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record vote',
            details: error.message
        });
    }
});

// Update feature request
app.put('/api/features/:id', async (req, res) => {
    try {
        const featureId = req.params.id;
        const updates = req.body;

        const result = await supabaseService.updateFeature(featureId, updates);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in update feature endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update feature',
            details: error.message
        });
    }
});

// Delete feature request
app.delete('/api/features/:id', async (req, res) => {
    try {
        const featureId = req.params.id;

        const result = await supabaseService.deleteFeature(featureId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in delete feature endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete feature',
            details: error.message
        });
    }
});

// Get files for a feature
app.get('/api/features/:id/files', async (req, res) => {
    try {
        const featureId = req.params.id;

        const result = await fileUploadService.getFeatureFiles(featureId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in get feature files endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get feature files',
            details: error.message
        });
    }
});

// Upload file for a feature
app.post('/api/features/:id/files', upload.single('file'), async (req, res) => {
    try {
        const featureId = req.params.id;
        const { uploadedBy } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided'
            });
        }

        const result = await fileUploadService.uploadFile(
            req.file,
            featureId,
            uploadedBy || 'anonymous'
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in upload file endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file',
            details: error.message
        });
    }
});

// Get user votes
app.get('/api/users/:userId/votes', async (req, res) => {
    try {
        const userId = req.params.userId;

        const result = await votingService.getUserVotes(userId);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in get user votes endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user votes',
            details: error.message
        });
    }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const [featuresStats, votingStats, uploadStats] = await Promise.all([
            supabaseService.getStatistics(),
            votingService.getVotingStatistics(),
            fileUploadService.getUploadStatistics()
        ]);

        res.json({
            success: true,
            data: {
                features: featuresStats.success ? featuresStats.data : null,
                voting: votingStats.success ? votingStats.data : null,
                uploads: uploadStats.success ? uploadStats.data : null,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in statistics endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'TripwiseGO Feature Request API with Supabase is running',
        timestamp: new Date().toISOString()
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 TripwiseGO Feature Request Server is running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints:`);
    console.log(`  POST /api/upload-feature - Upload a new feature request (with optional file)`);
    console.log(`  GET /api/features - Get all feature requests`);
    console.log(`  PUT /api/features/:id - Update a feature request`);
    console.log(`  DELETE /api/features/:id - Delete a feature request`);
    console.log(`  POST /api/vote - Vote on a feature request`);
    console.log(`  GET /api/features/:id/files - Get files for a feature`);
    console.log(`  POST /api/features/:id/files - Upload file for a feature`);
    console.log(`  GET /api/users/:userId/votes - Get user votes`);
    console.log(`  GET /api/statistics - Get system statistics`);
    console.log(`  GET /api/health - Health check`);

    // Initialize services
    await initializeServices();
});

module.exports = app;

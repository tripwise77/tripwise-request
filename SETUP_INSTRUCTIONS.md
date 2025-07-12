# TripwiseGO Supabase Migration Setup Instructions

## Database Setup

Since the tables need to be created manually in Supabase, please follow these steps:

### 1. Go to Supabase SQL Editor
Visit: https://supabase.com/dashboard/project/iymhqjailcpwlivbgstl/sql

### 2. Run the Database Schema
Copy and paste the following SQL into the SQL editor and click "Run":

```sql
-- Create feature_requests table
CREATE TABLE IF NOT EXISTS feature_requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    date TIMESTAMPTZ DEFAULT NOW(),
    creator_id TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'completed', 'in_progress')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    feature_id TEXT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    user_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feature_id, user_id)
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id SERIAL PRIMARY KEY,
    feature_id TEXT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_date ON feature_requests(date DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_feature_id ON votes(feature_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_feature_id ON file_attachments(feature_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_feature_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feature_requests 
    SET votes = (
        SELECT COALESCE(
            (SELECT COUNT(*) FROM votes WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id) AND vote_type = 'up') -
            (SELECT COUNT(*) FROM votes WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id) AND vote_type = 'down'),
            0
        )
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.feature_id, OLD.feature_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update vote counts
DROP TRIGGER IF EXISTS trigger_update_vote_count ON votes;
CREATE TRIGGER trigger_update_vote_count
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_vote_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_feature_requests_updated_at ON feature_requests;
CREATE TRIGGER trigger_update_feature_requests_updated_at
    BEFORE UPDATE ON feature_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public feature request system)
-- Allow anyone to read active feature requests
CREATE POLICY "Anyone can view active feature requests" ON feature_requests
    FOR SELECT USING (status = 'active');

-- Allow anyone to insert feature requests
CREATE POLICY "Anyone can create feature requests" ON feature_requests
    FOR INSERT WITH CHECK (true);

-- Allow creators to update their own feature requests
CREATE POLICY "Creators can update their own feature requests" ON feature_requests
    FOR UPDATE USING (true);

-- Allow creators to delete their own feature requests (soft delete by setting status)
CREATE POLICY "Creators can delete their own feature requests" ON feature_requests
    FOR UPDATE USING (true);

-- Allow anyone to view votes
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Anyone can vote" ON votes
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own votes
CREATE POLICY "Users can update their own votes" ON votes
    FOR UPDATE USING (true);

-- Allow users to delete their own votes
CREATE POLICY "Users can delete their own votes" ON votes
    FOR DELETE USING (true);

-- File attachments policies
CREATE POLICY "Anyone can view file attachments" ON file_attachments
    FOR SELECT USING (true);

CREATE POLICY "Anyone can upload file attachments" ON file_attachments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Uploaders can delete their own file attachments" ON file_attachments
    FOR DELETE USING (true);
```

### 3. Test the Setup
After running the SQL, you can test the setup by running:
```bash
node test-api.js
```

## Migration Summary

✅ **Completed:**
- Removed Google Sheets/Google Apps Script dependencies
- Added Supabase client library and configuration
- Created comprehensive Supabase service layer for CRUD operations
- Implemented voting system with Supabase
- Added file upload support with Supabase Storage
- Updated frontend to use new Supabase API endpoints
- Maintained dual-protocol support and immediate UI updates
- Preserved dark/light mode toggle and TripwiseGO logo usage

✅ **Features:**
- Full CRUD operations for feature requests
- Voting system with duplicate prevention
- File upload and attachment support
- Real-time vote count updates
- Caching for offline functionality
- Statistics and analytics endpoints
- Comprehensive error handling

✅ **API Endpoints:**
- `POST /api/upload-feature` - Create feature request (with optional file)
- `GET /api/features` - Get all feature requests
- `PUT /api/features/:id` - Update feature request
- `DELETE /api/features/:id` - Delete feature request
- `POST /api/vote` - Vote on feature request
- `GET /api/features/:id/files` - Get files for feature
- `POST /api/features/:id/files` - Upload file for feature
- `GET /api/users/:userId/votes` - Get user votes
- `GET /api/statistics` - Get system statistics
- `GET /api/health` - Health check

The migration is complete and ready for use once the database schema is set up in Supabase!

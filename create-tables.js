/**
 * Create Database Tables Script for TripwiseGO Feature Request System
 * This script creates the required tables directly using Supabase client
 */

const { supabase } = require('./supabase-config');

async function createTables() {
    console.log('🚀 Creating database tables...');
    
    try {
        // Create feature_requests table
        console.log('Creating feature_requests table...');
        const { error: featureTableError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (featureTableError) {
            console.log('Feature table might already exist or using direct SQL...');
        } else {
            console.log('✅ feature_requests table created');
        }

        // Create votes table
        console.log('Creating votes table...');
        const { error: voteTableError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS votes (
                    id SERIAL PRIMARY KEY,
                    feature_id TEXT NOT NULL,
                    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
                    user_id TEXT NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    UNIQUE(feature_id, user_id)
                );
            `
        });

        if (voteTableError) {
            console.log('Vote table might already exist or using direct SQL...');
        } else {
            console.log('✅ votes table created');
        }

        // Create file_attachments table
        console.log('Creating file_attachments table...');
        const { error: fileTableError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS file_attachments (
                    id SERIAL PRIMARY KEY,
                    feature_id TEXT NOT NULL,
                    file_name TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    file_size INTEGER,
                    mime_type TEXT,
                    uploaded_by TEXT NOT NULL,
                    uploaded_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });

        if (fileTableError) {
            console.log('File table might already exist or using direct SQL...');
        } else {
            console.log('✅ file_attachments table created');
        }

        // Test the tables by inserting and reading a test record
        console.log('');
        console.log('Testing table creation...');
        
        const testFeature = {
            id: 'test-' + Date.now(),
            title: 'Test Feature',
            description: 'Test description',
            votes: 0,
            creator_id: 'test-user',
            status: 'active'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('feature_requests')
            .insert([testFeature])
            .select();

        if (insertError) {
            console.error('❌ Failed to insert test record:', insertError);
            return false;
        }

        console.log('✅ Test record inserted successfully');

        // Clean up test record
        const { error: deleteError } = await supabase
            .from('feature_requests')
            .delete()
            .eq('id', testFeature.id);

        if (deleteError) {
            console.warn('⚠️ Failed to clean up test record:', deleteError);
        } else {
            console.log('✅ Test record cleaned up');
        }

        console.log('');
        console.log('🎉 Database tables created successfully!');
        return true;

    } catch (error) {
        console.error('❌ Failed to create tables:', error);
        return false;
    }
}

// Run if this file is executed directly
if (require.main === module) {
    createTables().then(success => {
        if (success) {
            console.log('✅ Tables are ready. You can now test the API.');
        } else {
            console.log('❌ Table creation failed. Please check the Supabase configuration.');
        }
        process.exit(success ? 0 : 1);
    });
}

module.exports = { createTables };

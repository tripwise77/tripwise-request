/**
 * Database Initialization Script for TripwiseGO Feature Request System
 * This script sets up the required tables and functions in Supabase
 */

const { supabase } = require('./supabase-config');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        console.log('Initializing Supabase database...');

        // Read the SQL schema file
        const schemaPath = path.join(__dirname, 'database-schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split the SQL into individual statements
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`Executing ${statements.length} SQL statements...`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    const { error } = await supabase.rpc('exec_sql', { sql: statement });
                    
                    if (error) {
                        console.warn(`Warning in statement ${i + 1}:`, error.message);
                        // Continue with other statements even if one fails
                    }
                } catch (err) {
                    console.warn(`Error in statement ${i + 1}:`, err.message);
                    // Continue with other statements
                }
            }
        }

        // Test the database setup by checking if tables exist
        console.log('Testing database setup...');
        
        const { data: featureRequests, error: featureError } = await supabase
            .from('feature_requests')
            .select('count', { count: 'exact', head: true });

        const { data: votes, error: voteError } = await supabase
            .from('votes')
            .select('count', { count: 'exact', head: true });

        if (featureError || voteError) {
            console.error('Database test failed:', featureError || voteError);
            return false;
        }

        console.log('✅ Database initialized successfully!');
        console.log(`- feature_requests table: ${featureRequests || 0} records`);
        console.log(`- votes table: ${votes || 0} records`);
        
        return true;

    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}

// Alternative method: Create tables directly using Supabase client
async function createTablesDirectly() {
    try {
        console.log('Creating tables directly using Supabase client...');

        // Note: This is a fallback method if the SQL execution doesn't work
        // In practice, you would run the SQL schema in the Supabase dashboard
        
        console.log('✅ Please run the database-schema.sql file in your Supabase SQL Editor');
        console.log('📍 Go to: https://supabase.com/dashboard/project/iymhqjailcpwlivbgstl/sql');
        console.log('📋 Copy and paste the contents of database-schema.sql');
        
        return true;

    } catch (error) {
        console.error('❌ Direct table creation failed:', error);
        return false;
    }
}

// Test database connection
async function testConnection() {
    try {
        console.log('Testing Supabase connection...');
        
        const { data, error } = await supabase
            .from('feature_requests')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.log('Tables not yet created. Please run the database schema first.');
            return false;
        }

        console.log('✅ Supabase connection successful!');
        return true;

    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
    }
}

// Export functions for use in other modules
module.exports = {
    initializeDatabase,
    createTablesDirectly,
    testConnection
};

// Run initialization if this file is executed directly
if (require.main === module) {
    (async () => {
        console.log('🚀 Starting database initialization...');
        
        // First test connection
        const connectionOk = await testConnection();
        
        if (!connectionOk) {
            console.log('📋 Please set up the database schema manually:');
            console.log('1. Go to: https://supabase.com/dashboard/project/iymhqjailcpwlivbgstl/sql');
            console.log('2. Copy and paste the contents of database-schema.sql');
            console.log('3. Click "Run" to execute the schema');
            console.log('4. Then run this script again to test the setup');
        } else {
            console.log('✅ Database is ready to use!');
        }
    })();
}

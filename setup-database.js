/**
 * Database Setup Script for TripwiseGO Feature Request System
 * This script helps set up the database schema in Supabase
 */

const { supabase } = require('./supabase-config');

async function setupDatabase() {
    console.log('🚀 Setting up TripwiseGO database schema...');
    
    try {
        // Test connection first
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('feature_requests').select('count', { count: 'exact', head: true });
        
        if (error && error.code === '42P01') {
            console.log('❌ Tables do not exist. Please run the database schema first.');
            console.log('');
            console.log('📋 To set up the database:');
            console.log('1. Go to: https://supabase.com/dashboard/project/iymhqjailcpwlivbgstl/sql');
            console.log('2. Copy and paste the contents of database-schema.sql');
            console.log('3. Click "Run" to execute the schema');
            console.log('4. Then run this script again');
            return false;
        } else if (error) {
            console.error('❌ Database connection error:', error);
            return false;
        }
        
        console.log('✅ Database connection successful!');
        console.log(`📊 Current feature requests: ${data || 0}`);
        
        // Test all tables
        const tables = ['feature_requests', 'votes', 'file_attachments'];
        for (const table of tables) {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
                
            if (error) {
                console.error(`❌ Error accessing ${table}:`, error.message);
                return false;
            }
            
            console.log(`✅ Table ${table}: ${count || 0} records`);
        }
        
        console.log('');
        console.log('🎉 Database setup complete! All tables are ready.');
        return true;
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        return false;
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    setupDatabase().then(success => {
        if (success) {
            console.log('✅ You can now start the server with: npm start');
        } else {
            console.log('❌ Please fix the database setup before starting the server');
        }
        process.exit(success ? 0 : 1);
    });
}

module.exports = { setupDatabase };

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iymhqjailcpwlivbgstl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5bWhxamFpbGNwd2xpdmJnc3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk3MTksImV4cCI6MjA2NzkwNTcxOX0.9y7Wjm5v-c8yL1YuT_3lOFUXcjsZUq72IOZwYzJH3pQ';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;

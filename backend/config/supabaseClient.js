
const { createClient } = require('@supabase/supabase-js');

// Env vars should be loaded by the entry point (server.js)

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase;

try {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL or Key is missing.');
    }
    // Simple validation to check if it looks like a URL
    if (!supabaseUrl.startsWith('http')) {
        throw new Error('Supabase URL must start with http/https.');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.warn('Supabase client failed to initialize:', error.message);
    console.warn('Backend will start but database features will not work.');
    supabase = null; // Or a dummy object if preferred
}

module.exports = supabase;

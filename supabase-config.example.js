// Supabase Configuration Example
// Copy to supabase-config.js and replace with real values

const supabaseConfig = {
  // Get these from: https://supabase.com/dashboard/project/zeeyvgspihtrgcdkrsvx/settings/api
  url: 'https://zeeyvgspihtrgcdkrsvx.supabase.co',
  anonKey: 'YOUR_ANON_KEY_HERE', // Replace with real anon key
  
  // Edge Function URLs (automatically generated)
  functions: {
    openai: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/openai-proxy',
    replicate: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/replicate-proxy'
  }
};

// Export for use in main app
window.supabaseConfig = supabaseConfig;

// Supabase Configuration for Omni-jimmer
// Replace with your actual Supabase project values

const supabaseConfig = {
  // Get these from: https://supabase.com/dashboard/project/zeeyvgspihtrgcdkrsvx/settings/api
  url: 'https://zeeyvgspihtrgcdkrsvx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZXl2Z3NwaWh0cmdjZGtyc3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTUzMzIsImV4cCI6MjA3MTE5MTMzMn0.mk3jXWRsvdwc__JqHGxHsojFmDbIx2PQOQFFJIG1q6A', // Public anon key (safe to expose)
  
  // Edge Function URLs (automatically generated)
  functions: {
    openai: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/openai-proxy',
    replicate: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/replicate-proxy'
  }
};

// Export for use in main app
window.supabaseConfig = supabaseConfig;

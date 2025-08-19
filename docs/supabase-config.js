// Supabase Configuration for GitHub OAuth
// This file contains the configuration needed for GitHub authentication

const supabaseConfig = {
  url: 'https://zeeyvgspihtrgcdkrsvx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZXl2Z3NwaWh0cmdjZGtyc3Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTUzMzIsImV4cCI6MjA3MTE5MTMzMn0.mk3jXWRsvdwc__JqHGxHsojFmDbIx2PQOQFFJIG1q6A',
  
  functions: {
    openai: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/openai-proxy',
    replicate: 'https://zeeyvgspihtrgcdkrsvx.supabase.co/functions/v1/replicate-proxy'
  }
};

// Export for use in main app
window.supabaseConfig = supabaseConfig;

console.log('🔧 Supabase config loaded for GitHub OAuth');

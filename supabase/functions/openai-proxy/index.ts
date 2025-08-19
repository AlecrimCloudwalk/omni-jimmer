import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// SECURITY FIX: Restrict CORS to allowed origins
const allowedOrigins = [
  'https://alecrimcloudwalk.github.io',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // SECURITY FIX: Dynamic CORS origin checking
  const origin = req.headers.get('origin');
  const dynamicCorsHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null'
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: dynamicCorsHeaders })
  }

  try {
    // Get OpenAI API key from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    // SECURITY FIX: Proper Supabase JWT verification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401, headers: dynamicCorsHeaders })
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase client for JWT verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.error('JWT verification failed:', error)
      return new Response('Invalid token', { status: 401, headers: dynamicCorsHeaders })
    }
    
    // Verify domain restriction
    if (!user.email?.endsWith('@cloudwalk.io')) {
      console.error('Domain restriction failed:', user.email)
      return new Response('Access denied - Cloudwalk email required', { status: 403, headers: dynamicCorsHeaders })
    }
    
    console.log('✅ Authenticated user:', user.email)

    // Forward request to OpenAI with server-side API key
    const body = await req.text()
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: body,
    })

    const responseData = await openaiResponse.text()
    
    return new Response(responseData, {
      status: openaiResponse.status,
      headers: {
        ...dynamicCorsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...dynamicCorsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
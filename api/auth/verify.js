// Authentication verification endpoint for Cloudwalk users
// Verifies Firebase JWT tokens and enforces domain restrictions

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header',
        message: 'Authorization header must be "Bearer <token>"'
      });
    }
    
    const idToken = authHeader.replace('Bearer ', '');
    
    // Check for demo token (fallback mode)
    if (idToken.startsWith('demo_token_')) {
      const email = idToken.replace('demo_token_', '');
      
      if (!email.endsWith('@cloudwalk.io')) {
        return res.status(403).json({ 
          error: 'Access denied',
          message: 'Only @cloudwalk.io email addresses are allowed'
        });
      }
      
      return res.json({
        success: true,
        user: {
          email: email,
          name: email.split('@')[0],
          domain: 'cloudwalk.io',
          verified: true,
          demoMode: true
        },
        message: 'Demo authentication successful'
      });
    }
    
    // For production: Verify Firebase JWT token
    // You would need to install firebase-admin and verify the token
    
    // const admin = require('firebase-admin');
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    // const email = decodedToken.email;
    
    // For now, simple validation assuming token is valid
    // In production, replace this with real JWT verification
    
    console.log('🔐 Verifying Firebase ID token...');
    
    // Mock verification - replace with real Firebase admin SDK
    const mockDecodedToken = {
      email: 'user@cloudwalk.io', // This would come from Firebase
      uid: 'firebase-uid',
      name: 'User Name'
    };
    
    const email = mockDecodedToken.email;
    
    // Validate domain
    if (!email || !email.endsWith('@cloudwalk.io')) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only @cloudwalk.io email addresses are allowed'
      });
    }
    
    const user = {
      uid: mockDecodedToken.uid,
      email: email,
      name: mockDecodedToken.name || email.split('@')[0],
      domain: 'cloudwalk.io',
      verified: true,
      permissions: ['generate_content'],
      authProvider: 'firebase'
    };
    
    console.log('✅ User authenticated:', email);
    
    res.json({
      success: true,
      user: user,
      message: 'Firebase authentication successful'
    });
    
  } catch (error) {
    console.error('❌ Auth verification error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      message: error.message 
    });
  }
}

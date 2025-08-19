// Firebase Configuration for Google OAuth
// Note: These are public config values, not secret keys

const firebaseConfig = {
  // Production values - replace with your actual Firebase project
  // Set to null to disable Firebase and use demo mode
  apiKey: null, // "AIzaSyC8X9_YOUR_FIREBASE_API_KEY_HERE",
  authDomain: null, // "cloudwalk-omni-jimmer.firebaseapp.com", 
  projectId: null, // "cloudwalk-omni-jimmer",
  storageBucket: null, // "cloudwalk-omni-jimmer.appspot.com",
  messagingSenderId: null, // "123456789012",
  appId: null // "1:123456789012:web:abcdef123456789012345"
};

// Export for use in auth.js
window.firebaseConfig = firebaseConfig;

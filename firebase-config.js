// Firebase Configuration for Google OAuth
// Note: These are public config values, not secret keys

const firebaseConfig = {
  // Production values - replace with your actual Firebase project
  apiKey: "AIzaSyC8X9_YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "cloudwalk-omni-jimmer.firebaseapp.com", 
  projectId: "cloudwalk-omni-jimmer",
  storageBucket: "cloudwalk-omni-jimmer.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789012345"
};

// Export for use in auth.js
window.firebaseConfig = firebaseConfig;

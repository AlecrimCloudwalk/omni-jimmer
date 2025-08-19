// Real Firebase Google OAuth Authentication for Cloudwalk
// Restricts access to @cloudwalk.io domain only

class CloudwalkAuth {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.allowedDomain = 'cloudwalk.io';
    this.auth = null;
    this.provider = null;
    this.init();
  }

  async init() {
    try {
      console.log('🔥 Initializing Firebase Auth...');
      
      // Load Firebase SDK
      await this.loadFirebaseSDK();
      
      // Initialize Firebase
      await this.initializeFirebase();
      
      // Set up auth state listener
      this.setupAuthStateListener();
      
      console.log('✅ Firebase Auth initialized');
      
    } catch (error) {
      console.error('❌ Firebase Auth initialization failed:', error);
      // Fallback to demo mode
      this.initDemoMode();
    }
  }

  async loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
      // Check if Firebase is already loaded
      if (window.firebase) {
        resolve();
        return;
      }
      
      // Load Firebase SDKs
      const scripts = [
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js'
      ];
      
      let loadedCount = 0;
      
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
          loadedCount++;
          if (loadedCount === scripts.length) {
            console.log('📦 Firebase SDK loaded');
            resolve();
          }
        };
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    });
  }

  async initializeFirebase() {
    // Get config from global or use default
    const config = window.firebaseConfig || {
      // Fallback config - replace with your actual values
      apiKey: "AIzaSyC8X9_YOUR_KEY_HERE",
      authDomain: "cloudwalk-omni-jimmer.firebaseapp.com",
      projectId: "cloudwalk-omni-jimmer"
    };
    
    console.log('🔧 Firebase config:', { ...config, apiKey: config.apiKey.substring(0, 10) + '...' });
    
    // Initialize Firebase
    if (!window.firebase.apps.length) {
      window.firebase.initializeApp(config);
    }
    
    // Get Auth instance
    this.auth = window.firebase.auth();
    
    // Configure Google Provider with domain restriction
    this.provider = new window.firebase.auth.GoogleAuthProvider();
    this.provider.setCustomParameters({
      hd: this.allowedDomain // Restrict to cloudwalk.io domain
    });
    
    console.log('🔑 Google provider configured for domain:', this.allowedDomain);
  }

  setupAuthStateListener() {
    this.auth.onAuthStateChanged((user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'signed out');
      
      if (user) {
        this.handleAuthenticatedUser(user);
      } else {
        this.handleSignedOutUser();
      }
    });
  }

  handleAuthenticatedUser(firebaseUser) {
    console.log('✅ User authenticated:', firebaseUser.email);
    
    // Validate domain
    if (!this.validateUserDomain(firebaseUser.email)) {
      console.warn('🚫 Domain validation failed, signing out');
      this.auth.signOut();
      return;
    }
    
    // Create our user object
    this.user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      picture: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email)}&background=c87ef7&color=fff`,
      domain: firebaseUser.email.split('@')[1],
      loginTime: Date.now(),
      idToken: null // Will be set when needed
    };
    
    this.isAuthenticated = true;
    this.updateAuthUI();
    
    // Get ID token for API calls
    this.refreshIdToken();
  }

  handleSignedOutUser() {
    console.log('👋 User signed out');
    this.user = null;
    this.isAuthenticated = false;
    this.updateAuthUI();
  }

  validateUserDomain(email) {
    if (!email) return false;
    
    const domain = email.split('@')[1];
    const isValid = domain === this.allowedDomain;
    
    if (!isValid) {
      alert(`❌ Access Restricted\n\nThis application is only available to @${this.allowedDomain} email addresses.\n\nYour email: ${email}`);
    }
    
    return isValid;
  }

  async refreshIdToken() {
    try {
      if (this.auth.currentUser) {
        const idToken = await this.auth.currentUser.getIdToken(true);
        this.user.idToken = idToken;
        console.log('🎫 ID token refreshed');
      }
    } catch (error) {
      console.error('❌ Failed to refresh ID token:', error);
    }
  }

  initDemoMode() {
    console.log('🔄 Falling back to demo mode');
    this.loadDemoMode();
  }

  loadDemoMode() {
    // Simplified demo mode
    this.updateAuthUI();
  }

  // Get auth token for API calls
  async getAuthToken() {
    try {
      if (this.auth && this.auth.currentUser) {
        // Real Firebase ID token
        const token = await this.auth.currentUser.getIdToken();
        return token;
      } else if (this.user && this.user.demoMode) {
        // Demo mode - return fake token
        return `demo_token_${this.user.email}`;
      }
      return null;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      return null;
    }
  }

  async signIn() {
    try {
      console.log('🔐 Starting Google Sign-In...');
      
      if (this.auth && this.provider) {
        // Real Firebase Google Auth
        console.log('🔥 Using Firebase Google Auth');
        
        const result = await this.auth.signInWithPopup(this.provider);
        const user = result.user;
        
        console.log('✅ Google Sign-In successful:', user.email);
        
        // Validate domain (additional check)
        if (!this.validateUserDomain(user.email)) {
          await this.auth.signOut();
          throw new Error(`Access restricted to @${this.allowedDomain} emails only`);
        }
        
        // Show success message
        alert(`✅ Welcome ${user.displayName || user.email.split('@')[0]}!\n\nYou're now authenticated with your Cloudwalk account.\nAPI keys are managed automatically.`);
        
        return user;
        
      } else {
        // Fallback demo mode
        console.log('🔄 Using demo mode');
        return this.signInDemo();
      }
      
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        alert('❌ Sign-in cancelled\n\nYou closed the popup before completing sign-in.');
      } else if (error.code === 'auth/popup-blocked') {
        alert('❌ Popup blocked\n\nPlease allow popups for this site and try again.');
      } else {
        alert(`❌ Sign-in failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  async signInDemo() {
    // Demo mode fallback
    const email = prompt('Demo Mode - Enter your Cloudwalk email:');
    
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    const emailDomain = email.split('@')[1];
    if (emailDomain !== this.allowedDomain) {
      throw new Error(`❌ Access restricted to @${this.allowedDomain} emails only`);
    }
    
    // Create demo user object
    this.user = {
      email: email,
      name: email.split('@')[0],
      domain: emailDomain,
      loginTime: Date.now(),
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=c87ef7&color=fff`,
      demoMode: true
    };
    
    this.isAuthenticated = true;
    this.updateAuthUI();
    
    alert(`✅ Demo Mode - Welcome ${this.user.name}!\n\nYou're signed in with demo authentication.`);
    return this.user;
  }

  async signOut() {
    try {
      console.log('🚪 Signing out...');
      
      if (this.auth && this.auth.currentUser) {
        // Real Firebase sign out
        await this.auth.signOut();
        console.log('✅ Firebase sign out complete');
      } else {
        // Demo mode sign out
        this.user = null;
        this.isAuthenticated = false;
        this.updateAuthUI();
      }
      
      alert('👋 Signed out successfully!');
      
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      alert(`❌ Sign out failed: ${error.message}`);
    }
  }

  updateAuthUI() {
    const authContainer = document.getElementById('authContainer');
    const mainApp = document.getElementById('mainApp');
    const apiKeyNotice = document.getElementById('apiKeyNotice');
    
    if (!authContainer || !mainApp) return;
    
    if (this.isAuthenticated && this.user) {
      // Show main app, hide auth
      authContainer.style.display = 'none';
      mainApp.style.display = 'block';
      
      // Hide API key notice (not needed for authenticated users)
      if (apiKeyNotice) apiKeyNotice.style.display = 'none';
      
      // Update user info in header
      this.updateUserInfo();
      
    } else {
      // Show auth, hide main app
      authContainer.style.display = 'block';
      mainApp.style.display = 'none';
    }
  }

  updateUserInfo() {
    let userInfo = document.getElementById('userInfo');
    if (!userInfo && this.user) {
      // Create user info element
      userInfo = document.createElement('div');
      userInfo.id = 'userInfo';
      userInfo.className = 'user-info';
      
      const header = document.querySelector('header');
      if (header) {
        header.appendChild(userInfo);
      }
    }
    
    if (userInfo && this.user) {
      userInfo.innerHTML = `
        <div class="user-profile">
          <img src="${this.user.picture}" alt="${this.user.name}" class="user-avatar">
          <div class="user-details">
            <span class="user-name">${this.user.name}</span>
            <span class="user-email">${this.user.email}</span>
          </div>
          <button onclick="cloudwalkAuth.signOut()" class="sign-out-btn">Sign Out</button>
        </div>
      `;
    }
  }

  // Check if user is authenticated (for protecting app functions)
  requireAuth() {
    if (!this.isAuthenticated) {
      alert('🔐 Please sign in with your Cloudwalk account first');
      return false;
    }
    return true;
  }

  // Get user info for API calls
  getUserInfo() {
    return this.user;
  }
}

// Global instance
window.cloudwalkAuth = new CloudwalkAuth();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CloudwalkAuth;
}

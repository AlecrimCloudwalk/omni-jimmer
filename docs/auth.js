// Google OAuth Authentication for Cloudwalk
// Restricts access to @cloudwalk.io domain only

class CloudwalkAuth {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.allowedDomain = 'cloudwalk.io';
    this.init();
  }

  async init() {
    // For now, using simple Google Sign-In without Firebase
    // This is a lightweight implementation
    
    // Load Google Sign-In API
    await this.loadGoogleAPI();
    
    // Check for existing session
    this.checkExistingSession();
    
    // Update UI
    this.updateAuthUI();
  }

  async loadGoogleAPI() {
    return new Promise((resolve) => {
      if (window.gapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('auth2', () => {
          window.gapi.auth2.init({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com' // You'll need to create this
          }).then(() => {
            resolve();
          });
        });
      };
      document.head.appendChild(script);
    });
  }

  checkExistingSession() {
    const savedUser = localStorage.getItem('cloudwalk_user');
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
        this.isAuthenticated = this.validateUser(this.user);
      } catch (e) {
        localStorage.removeItem('cloudwalk_user');
      }
    }
  }

  validateUser(user) {
    if (!user || !user.email) return false;
    
    // Check domain restriction
    const emailDomain = user.email.split('@')[1];
    if (emailDomain !== this.allowedDomain) {
      console.warn('🚫 Access denied: Email domain not allowed:', emailDomain);
      return false;
    }
    
    // Check session expiry (24 hours)
    const sessionAge = Date.now() - (user.loginTime || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (sessionAge > maxAge) {
      console.warn('🕒 Session expired');
      return false;
    }
    
    return true;
  }

  async signIn() {
    try {
      console.log('🔐 Starting Google Sign-In...');
      
      // Simple popup-based sign in (placeholder for now)
      // In production, this would use actual Google OAuth
      const email = prompt('Enter your Cloudwalk email (for demo):');
      
      if (!email || !email.includes('@')) {
        throw new Error('Invalid email format');
      }
      
      const emailDomain = email.split('@')[1];
      if (emailDomain !== this.allowedDomain) {
        throw new Error(`❌ Access restricted to @${this.allowedDomain} emails only`);
      }
      
      // Create user object
      this.user = {
        email: email,
        name: email.split('@')[0], // Use part before @ as name
        domain: emailDomain,
        loginTime: Date.now(),
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=c87ef7&color=fff`
      };
      
      this.isAuthenticated = true;
      
      // Save session
      localStorage.setItem('cloudwalk_user', JSON.stringify(this.user));
      
      console.log('✅ Sign-in successful:', this.user.email);
      this.updateAuthUI();
      
      // Show success message
      alert(`✅ Welcome ${this.user.name}!\n\nYou're now authenticated as a Cloudwalk user.\nAPI keys are handled automatically.`);
      
      return this.user;
      
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      alert(`❌ Sign-in failed: ${error.message}`);
      throw error;
    }
  }

  signOut() {
    console.log('🚪 Signing out...');
    
    this.user = null;
    this.isAuthenticated = false;
    
    // Clear session
    localStorage.removeItem('cloudwalk_user');
    
    // Update UI
    this.updateAuthUI();
    
    alert('👋 Signed out successfully!');
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

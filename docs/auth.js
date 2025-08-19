// Supabase GitHub OAuth Authentication for Cloudwalk
// Restricts access to @cloudwalk.io domain only

class CloudwalkAuth {
  constructor() {
    this.user = null;
    this.isAuthenticated = false;
    this.allowedDomain = 'cloudwalk.io';
    this.supabase = null;
    this.init();
  }

  async init() {
    try {
      console.log('🔥 Initializing Supabase Auth...');
      
      // Load Supabase SDK
      await this.loadSupabaseSDK();
      
      // Initialize Supabase
      await this.initializeSupabase();
      
      // Set up auth state listener
      this.setupAuthStateListener();
      
      console.log('✅ Supabase Auth initialized');
      
    } catch (error) {
      console.error('❌ Supabase Auth initialization failed:', error);
      // Fallback to demo mode
      this.initDemoMode();
    }
  }

  async loadSupabaseSDK() {
    return new Promise((resolve, reject) => {
      // Check if Supabase is already loaded
      if (window.supabase) {
        resolve();
        return;
      }
      
      // Load Supabase SDK
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@supabase/supabase-js@2.39.3/dist/umd/supabase.js';
      script.onload = () => {
        console.log('📦 Supabase SDK loaded');
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
      document.head.appendChild(script);
    });
  }

  async initializeSupabase() {
    // Get config from global
    const config = window.supabaseConfig;
    
    // Check if Supabase is properly configured
    if (!config || !config.url || !config.anonKey || config.anonKey === 'YOUR_ANON_KEY_HERE' || config.anonKey.length < 30) {
      throw new Error('Supabase not configured - falling back to demo mode');
    }
    
    console.log('🔧 Supabase config valid:', { 
      url: config.url, 
      anonKey: config.anonKey.substring(0, 10) + '...' 
    });
    
    // Initialize Supabase client
    this.supabase = window.supabase.createClient(config.url, config.anonKey);
    
    console.log('🔑 Supabase client initialized for GitHub OAuth');
  }

  setupAuthStateListener() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email || 'signed out');
      
      if (event === 'SIGNED_IN' && session?.user) {
        this.handleAuthenticatedUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        this.handleSignedOutUser();
      }
    });
  }

  handleAuthenticatedUser(supabaseUser) {
    console.log('✅ User authenticated:', supabaseUser.email);
    
    // Validate domain
    if (!this.validateUserDomain(supabaseUser.email)) {
      console.warn('🚫 Domain validation failed, signing out');
      this.supabase.auth.signOut();
      return;
    }
    
    // Create our user object
    this.user = {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      picture: supabaseUser.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.email)}&background=c87ef7&color=fff`,
      domain: supabaseUser.email.split('@')[1],
      loginTime: Date.now(),
      provider: 'github',
      accessToken: null // Will be set when needed
    };
    
    this.isAuthenticated = true;
    this.updateAuthUI();
    
    // Get access token for API calls
    this.refreshAccessToken();
  }

  handleSignedOutUser() {
    console.log('👋 User signed out');
    this.user = null;
    this.isAuthenticated = false;
    this.updateAuthUI();
  }

  // SECURITY FIX: Secure email input dialog to replace prompt()
  showSecureEmailDialog() {
    return new Promise((resolve, reject) => {
      // Create modal overlay
      const overlay = SecurityUtils.createElement('div', '', 'secure-modal-overlay');
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 10000; display: flex; 
        align-items: center; justify-content: center;
      `;
      
      // Create modal dialog
      const modal = SecurityUtils.createElement('div', '', 'secure-modal');
      modal.style.cssText = `
        background: white; padding: 30px; border-radius: 12px; 
        max-width: 400px; width: 90%; box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      `;
      
      // Create form elements
      const title = SecurityUtils.createElement('h3', 'Demo Mode - Cloudwalk Authentication');
      const description = SecurityUtils.createElement('p', 'Enter your @cloudwalk.io email address:');
      description.style.color = '#666';
      
      const input = document.createElement('input');
      input.type = 'email';
      input.placeholder = 'name@cloudwalk.io';
      input.style.cssText = `
        width: 100%; padding: 12px; border: 2px solid #ddd; 
        border-radius: 6px; font-size: 16px; margin: 15px 0;
      `;
      
      const buttonContainer = SecurityUtils.createElement('div');
      buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';
      
      const cancelBtn = SecurityUtils.createElement('button', 'Cancel');
      cancelBtn.style.cssText = 'padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;';
      
      const submitBtn = SecurityUtils.createElement('button', 'Sign In');
      submitBtn.style.cssText = 'padding: 10px 20px; background: #c87ef7; color: white; border: none; border-radius: 6px; cursor: pointer;';
      
      // Event handlers
      const cleanup = () => document.body.removeChild(overlay);
      
      cancelBtn.onclick = () => {
        cleanup();
        reject(new Error('User cancelled'));
      };
      
      const submit = () => {
        const email = input.value.trim();
        if (SecurityUtils.isCloudwalkEmail(email)) {
          cleanup();
          resolve(email);
        } else {
          input.style.borderColor = '#ff4444';
          input.focus();
        }
      };
      
      submitBtn.onclick = submit;
      input.onkeypress = (e) => {
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') cancelBtn.click();
      };
      
      // Assemble modal
      buttonContainer.appendChild(cancelBtn);
      buttonContainer.appendChild(submitBtn);
      modal.appendChild(title);
      modal.appendChild(description);
      modal.appendChild(input);
      modal.appendChild(buttonContainer);
      overlay.appendChild(modal);
      
      // Add to page and focus
      document.body.appendChild(overlay);
      input.focus();
    });
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

  async refreshAccessToken() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.access_token) {
        this.user.accessToken = session.access_token;
        console.log('🎫 Access token refreshed');
      }
    } catch (error) {
      console.error('❌ Failed to refresh access token:', error);
    }
  }

  initDemoMode() {
    console.log('🔄 Falling back to demo mode');
    console.log('ℹ️ To enable real GitHub OAuth, configure Supabase in supabase-config.js');
    this.loadDemoMode();
  }

  loadDemoMode() {
    // Demo mode - show auth UI immediately
    this.updateAuthUI();
    
    // Add info message to auth container
    this.showDemoModeInfo();
  }

  showDemoModeInfo() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'demo-mode-info';
      // SECURITY FIX: Use safe DOM methods instead of innerHTML
      const warningDiv = SecurityUtils.createElement('div');
      warningDiv.style.cssText = 'background: #fef3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;';
      
      const strongEl = SecurityUtils.createElement('strong', '🔧 Demo Mode:');
      const textEl = SecurityUtils.createElement('span', ' Supabase não configurado.');
      const brEl = document.createElement('br');
      const smallEl = SecurityUtils.createElement('small', 'Para GitHub OAuth real, configure ');
      const codeEl = SecurityUtils.createElement('code', 'supabase-config.js');
      
      smallEl.appendChild(codeEl);
      warningDiv.appendChild(strongEl);
      warningDiv.appendChild(textEl);
      warningDiv.appendChild(brEl);
      warningDiv.appendChild(smallEl);
      
      infoDiv.appendChild(warningDiv);
      
      const authCard = authContainer.querySelector('.auth-card');
      if (authCard && !authCard.querySelector('.demo-mode-info')) {
        authCard.insertBefore(infoDiv, authCard.firstChild);
      }
    }
  }

  // Get auth token for API calls
  async getAuthToken() {
    try {
      if (this.supabase) {
        // Real Supabase JWT token
        const { data: { session } } = await this.supabase.auth.getSession();
        return session?.access_token || null;
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
      console.log('🔐 Starting GitHub Sign-In...');
      
      if (this.supabase) {
        // Real Supabase GitHub Auth
        console.log('🔥 Using Supabase GitHub Auth');
        
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: window.location.origin + window.location.pathname
          }
        });
        
        if (error) {
          throw error;
        }
        
        console.log('✅ GitHub Sign-In initiated');
        
        // Note: User will be redirected to GitHub, then back to our app
        // The auth state listener will handle the successful auth
        
        return data;
        
      } else {
        // Fallback demo mode
        console.log('🔄 Using demo mode');
        return this.signInDemo();
      }
      
    } catch (error) {
      console.error('❌ Sign-in failed:', error);
      
      if (error.message.includes('popup')) {
        alert('❌ Popup blocked\n\nPlease allow popups for this site and try again.');
      } else {
        alert(`❌ Sign-in failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  async signInDemo() {
    // SECURITY FIX: Replace prompt() with secure input dialog
    const email = await this.showSecureEmailDialog();
    
    if (!email || !SecurityUtils.isValidEmail(email)) {
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
      
      if (this.supabase) {
        // Real Supabase sign out
        await this.supabase.auth.signOut();
        console.log('✅ Supabase sign out complete');
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
      // SECURITY FIX: Use safe DOM methods instead of innerHTML
      const profileDiv = SecurityUtils.createElement('div', '', 'user-profile');
      
      // Create user avatar
      const imgEl = document.createElement('img');
      imgEl.src = this.user.picture || '';
      imgEl.alt = this.user.name || 'User';
      imgEl.className = 'user-avatar';
      
      // Create user details
      const detailsDiv = SecurityUtils.createElement('div', '', 'user-details');
      const nameSpan = SecurityUtils.createElement('span', this.user.name || '', 'user-name');
      const emailSpan = SecurityUtils.createElement('span', this.user.email || '', 'user-email');
      detailsDiv.appendChild(nameSpan);
      detailsDiv.appendChild(emailSpan);
      
      // Create sign out button
      const signOutBtn = SecurityUtils.createElement('button', 'Sign Out', 'sign-out-btn');
      signOutBtn.onclick = () => cloudwalkAuth.signOut();
      
      // Assemble profile
      profileDiv.appendChild(imgEl);
      profileDiv.appendChild(detailsDiv);
      profileDiv.appendChild(signOutBtn);
      
      userInfo.innerHTML = ''; // Clear existing content safely
      userInfo.appendChild(profileDiv);
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

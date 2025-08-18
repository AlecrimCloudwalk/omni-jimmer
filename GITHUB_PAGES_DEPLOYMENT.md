# 🚀 GitHub Pages Deployment Guide

## ✅ Will it work on GitHub Pages?

**YES!** This application is designed to work on GitHub Pages with some important considerations.

## 🏗️ Architecture Overview

### ✅ What Works on GitHub Pages:
- **Frontend** (docs/ folder) - Static HTML, CSS, JS ✅
- **Direct API calls** to OpenAI and Replicate ✅
- **Client-side logic** including ethnicity randomization ✅
- **No server required** when deployed ✅

### ❌ What Doesn't Work on GitHub Pages:
- **Backend server** (server/ folder) - Node.js/Express ❌
- **Local API proxy** - Only for local development ❌

## 🔄 How It Works

The app uses an `IS_LOCAL` flag to switch between two modes:

### 🏠 Local Development Mode (`IS_LOCAL = true`):
```javascript
// Uses local Node.js server as proxy
fetch(`${API_BASE}/api/gpt/prompts`, {...})
```

### 🌐 Production Mode (`IS_LOCAL = false`):
```javascript
// Direct API calls to OpenAI/Replicate
fetch("https://api.openai.com/v1/chat/completions", {...})
fetch("https://api.replicate.com/v1/models/...", {...})
```

## 📋 Deployment Checklist

### ✅ Ready for GitHub Pages:
- [x] **Static files** in docs/ folder
- [x] **IS_LOCAL detection** working (false on GitHub Pages)
- [x] **Direct API calls** implemented
- [x] **Ethnicity randomization** working client-side
- [x] **No server dependencies** in production
- [x] **CORS headers** properly set for API calls
- [x] **GitHub Actions workflow** created

### 🔧 Required Setup:

1. **Enable GitHub Pages**:
   - Go to Repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: main, Folder: /docs

2. **API Keys Required**:
   - Users need to provide their own OpenAI API key
   - Users need to provide their own Replicate API token
   - Keys are stored in localStorage (optional)

3. **GitHub Actions** (Optional):
   - Workflow file created at `.github/workflows/deploy.yml`
   - Automatically deploys when pushing to main branch

## 🔒 Security Considerations

### ✅ Secure:
- **No API keys in code** - Users provide their own
- **Client-side only** - No server secrets
- **HTTPS by default** on GitHub Pages
- **No impersonation** - Generic characters only

### ⚠️ Important Notes:
- API keys are **visible in browser** (normal for client-side apps)
- Users should use **restricted API keys** with limited permissions
- Consider rate limiting on API providers' side

## 🌐 Expected URL Structure

```
https://username.github.io/omni-jimmer/
```

Or with custom domain (edit docs/CNAME):
```
https://yourcustomdomain.com/
```

## 🧪 Testing

### Local Testing:
```bash
npm run serve
# Serves docs/ folder on http://localhost:5173
# IS_LOCAL will be false, simulating GitHub Pages
```

### Production Features:
- ✅ **Ethnicity randomization** - 10 Brazilian ethnicities
- ✅ **Anti-impersonation** - No real names/companies
- ✅ **No letreiros** - Clean environments
- ✅ **POV camera** descriptions
- ✅ **Horário randomization** 
- ✅ **Regional diversity** - Brazilian cities/regions

## 🚨 Potential Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Using direct API calls with proper headers ✅

### Issue 2: API Key Exposure
**Solution**: Client-side only, users provide own keys ✅

### Issue 3: Rate Limiting
**Solution**: Users responsible for their own API limits ✅

### Issue 4: Ethnicity Randomization
**Solution**: ✅ Fixed - Works client-side now

## 📊 Performance

- **Fast loading** - Static files only
- **CDN delivery** - GitHub Pages CDN
- **No server latency** - Direct API calls
- **Responsive design** - Works on mobile

## 🎯 Ready to Deploy!

The application is **fully compatible** with GitHub Pages and will work perfectly once deployed. Users will need their own API keys, but all functionality including the new ethnicity randomization will work seamlessly.

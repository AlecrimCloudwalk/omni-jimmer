# 🔧 Troubleshooting Guide - Generation Failed Issues

## 🚨 Common Issues & Solutions

### 1. **❌ API Key Problems (Most Common)**

#### **Symptoms:**
- "Please provide your OpenAI API key"
- "Please provide your Replicate API key" 
- "OpenAI API error: 401"
- "Replicate Image API error: 401"

#### **Solutions:**
```bash
✅ OpenAI Key Format: sk-proj-XXXXXXXXX... (starts with "sk-")
✅ Replicate Key Format: r8_XXXXXXXXX... (starts with "r8_")
```

**Check Your Keys:**
1. **OpenAI**: Go to https://platform.openai.com/api-keys
2. **Replicate**: Go to https://replicate.com/account/api-tokens
3. **Format Check**: Use the "Quick Setup" to validate format

#### **Key Requirements:**
- **OpenAI**: Needs **paid account** with credit balance ($5+ recommended)
- **Replicate**: Needs credit balance ($10+ recommended)
- **Permissions**: Both keys need API access enabled

---

### 2. **🌐 Network/CORS Issues**

#### **Symptoms:**
- "NetworkError when attempting to fetch"
- "CORS error" 
- Requests hang indefinitely
- "Failed to fetch" errors

#### **Solutions:**
- **Try different browser** (Chrome, Firefox, Safari)
- **Disable ad blockers** temporarily
- **Check if corsproxy.io is down**: https://corsproxy.io/
- **Try incognito/private mode**

---

### 3. **💰 API Quota/Billing Issues**

#### **Symptoms:**
- "insufficient_quota" 
- "rate_limit_exceeded"
- "payment_required"

#### **Check:**
- **OpenAI Usage**: https://platform.openai.com/usage
- **Replicate Billing**: https://replicate.com/account/billing
- **Daily Limits**: Some keys have daily spending limits

---

### 4. **🌍 Regional Restrictions**

#### **Symptoms:**
- APIs work for some users but not others
- "Service unavailable in your region"

#### **Solutions:**
- **OpenAI**: Available in most countries (check: https://platform.openai.com/docs/supported-countries)
- **Replicate**: Global availability
- **Try VPN** if restricted

---

### 5. **🔍 How to Debug**

#### **Enable Console Debugging:**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Click Generate**
4. **Look for error messages:**

```javascript
// Good signs:
🎲 MASTER SEED for this generation: 123456
🎨 Image Seed: 789012 (Master: 123456)
✅ OpenAI prompt generation successful

// Bad signs:
❌ OpenAI API error: 401 Unauthorized
❌ Replicate Image API error: insufficient_quota
❌ NetworkError when attempting to fetch resource
```

---

### 6. **🧪 Test Each Component**

#### **Step-by-Step Testing:**
1. **Test API Keys**: Paste in "Quick Setup" - should show "Both keys saved successfully!"
2. **Test OpenAI**: Click Generate - should see prompts appear
3. **Test Image Generation**: Enable only "Generate Image" - should see image
4. **Test Video Generation**: Enable only "Generate Video" - should see video

---

### 7. **💻 Browser/Storage Issues**

#### **Symptoms:**
- Keys don't save
- "localStorage is not defined"
- App behaves differently across browsers

#### **Solutions:**
- **Enable cookies/storage** in browser settings
- **Clear localStorage**: Console → `localStorage.clear()` → refresh
- **Try different browser**
- **Disable privacy extensions** temporarily

---

### 8. **🔄 GitHub Pages vs Local Mode**

The app has **two modes**:
- **GitHub Pages**: `https://username.github.io/` (needs API keys in localStorage)
- **Local/Vercel**: Uses serverless functions (keys handled differently)

#### **GitHub Pages Mode Issues:**
- Must input API keys manually
- Uses CORS proxy (corsproxy.io) 
- Depends on browser localStorage

---

## 🆘 Emergency Checklist

**For Users Getting "Generation Failed":**

1. ✅ **Check Console** (F12) for specific error messages
2. ✅ **Verify API Key Format**: OpenAI starts with `sk-`, Replicate with `r8_`
3. ✅ **Check API Balance**: Both platforms need positive credit balance
4. ✅ **Try Different Browser**: Chrome, Firefox, Safari
5. ✅ **Disable Browser Extensions**: Ad blockers, privacy tools
6. ✅ **Test Individual Components**: Enable only one generation type
7. ✅ **Clear Browser Data**: `localStorage.clear()` in console
8. ✅ **Check Network**: Try mobile data vs WiFi

---

## 🔗 Quick Links

- **OpenAI API Keys**: https://platform.openai.com/api-keys
- **OpenAI Usage**: https://platform.openai.com/usage  
- **Replicate Tokens**: https://replicate.com/account/api-tokens
- **Replicate Billing**: https://replicate.com/account/billing
- **CORS Proxy Status**: https://corsproxy.io/

---

## 📞 Getting Help

**Include this info when reporting issues:**

1. **Error Message**: Exact text from console
2. **Browser**: Chrome 120, Firefox 115, etc.
3. **Operating System**: Windows 11, macOS 14, etc.
4. **URL**: Which deployment (github.io, vercel.app, localhost)
5. **API Provider**: Which keys you're using
6. **Console Logs**: Screenshots of F12 console

---

**🎯 Most issues are API key related - double-check format and balance first!**

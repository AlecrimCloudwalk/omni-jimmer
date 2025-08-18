# 🚀 Deploy to Vercel

## Quick Deploy (Recommended)

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "ready for vercel deployment"
git push origin main
```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project" 
   - Connect your GitHub account
   - Select `AlecrimCloudwalk/omni-jimmer` repository
   - Click "Deploy"

3. **Add Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables:
   ```
   OPENAI_API_KEY=sk-your-actual-key
   REPLICATE_API_TOKEN=r8_your-actual-token
   ```

4. **Redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" to pick up the environment variables

## Alternative: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: omni-jimmer
# - Directory: ./
# - Override settings? N

# Add environment variables
vercel env add OPENAI_API_KEY
vercel env add REPLICATE_API_TOKEN

# Redeploy with env vars
vercel --prod
```

## What Gets Deployed

✅ **Frontend**: Static files from `docs/` folder
✅ **API Functions**: Serverless functions from `api/` folder  
✅ **CORS Solved**: No more browser blocking issues
✅ **Environment Variables**: Secure server-side API keys

## URLs After Deployment

- **App**: `https://your-app-name.vercel.app/`
- **API Health**: `https://your-app-name.vercel.app/api/gpt/prompts`

## Testing

1. Open the deployed URL
2. Fill in customer info + Shuffle
3. Check both boxes (Image + Video)
4. Click Generate
5. ✅ Should work without CORS errors!

## Troubleshooting

**Environment Variables Not Working?**
- Check Vercel dashboard → Settings → Environment Variables
- Make sure to redeploy after adding variables

**API Errors?**
- Check Vercel Functions logs in dashboard
- Verify API keys are valid

**Build Fails?**
- Check `package.json` has correct Node.js dependencies
- Ensure `vercel.json` is in project root

## Cost Estimates

- **Vercel**: Free tier (100GB bandwidth, 100GB-hours compute)
- **OpenAI**: ~$0.01 per prompt generation
- **Replicate**: ~$0.10 per image, ~$0.50 per video

For testing: ~$5-10 total for 50 generations.

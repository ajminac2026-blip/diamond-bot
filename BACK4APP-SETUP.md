# Back4App Deployment Guide

## ✅ Step-by-Step Setup:

### 1. Create Account
1. Go to: https://www.back4app.com/
2. Sign up (free account)
3. Verify email

### 2. Create New Container App
1. Click **"Build new app"**
2. Select **"Container as a Service"**
3. Choose **"GitHub"** as source
4. Connect your GitHub account
5. Select repository: `ajminac2026-blip/diamond-bot`
6. Select branch: `main`

### 3. Configure Settings
**Build Settings:**
- Build Method: `Dockerfile`
- Dockerfile Path: `./Dockerfile`

**Port Settings:**
- Container Port: `3000`
- Protocol: `HTTP`

**Resources (Free Tier):**
- CPU: 0.25 vCPU
- Memory: 512 MB
- Storage: 1 GB

### 4. Environment Variables (Optional)
You can add these if needed:
- `NODE_ENV`: `production`
- `PORT`: `3000`

### 5. Deploy
1. Click **"Deploy"** button
2. Wait 5-10 minutes for build to complete
3. You'll get a URL like: `https://diamond-bot-xxxxx.back4app.io`

### 6. Access Admin Panel
- Admin Panel: `https://your-app-url.back4app.io`
- Login: Username: `admin`, Password: `Rubel890`

### 7. First Time Setup
1. Open your app URL
2. Login to admin panel
3. Scan WhatsApp QR code when bot starts
4. Bot is now running 24/7!

## 🔧 Troubleshooting:

**If build fails:**
- Check logs in Back4App dashboard
- Make sure Dockerfile is correct

**If bot doesn't connect:**
- Wait 2-3 minutes after deployment
- Check container logs
- Restart the container

**If admin panel doesn't load:**
- Check if container is running
- Verify port 3000 is exposed
- Check browser console for errors

## 📝 Important Notes:

- Free tier has 250 hours/month (enough for testing)
- Container will sleep after 30 min inactivity (free tier)
- For 24/7 running, upgrade to paid plan ($5/month)
- WhatsApp session stored in container (may lose on restart)

## 🚀 Auto-Deploy:

Once setup, any GitHub push will auto-deploy:
```bash
git add .
git commit -m "update"
git push origin main
```

Back4App will automatically rebuild and redeploy!

## 📞 Support:

- Back4App Docs: https://www.back4app.com/docs
- Community: https://community.back4app.com/

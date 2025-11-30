# 🚀 Deployment Guide - Diamond Bot

## Deploying on Replit

### Step 1: Import from GitHub
1. Go to https://replit.com
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter: `https://github.com/ajminac2026-blip/diamond-bot`
5. Click "Import from GitHub"

### Step 2: Install Dependencies
Replit will automatically install dependencies from `package.json` and `.replit` config.

### Step 3: Run the Bot
Click the green "Run" button or type:
```bash
npm start
```

### Important Notes for Replit:
- ✅ The `.replit` and `replit.nix` files are already configured
- ✅ Chromium and required libraries will be installed automatically
- ✅ Both bot (port 3001) and admin panel (port 3000) will start
- ⚠️ Replit repls go to sleep after inactivity - use a keep-alive service

---

## Deploying on Ubuntu/Debian Server

### Step 1: Install System Dependencies
```bash
chmod +x install-dependencies.sh
sudo ./install-dependencies.sh
```

Or manually:
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser \
  libgbm1 libgtk-3-0 libnss3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libxcomposite1 \
  libxdamage1 libxrandr2 libgbm1 libasound2
```

### Step 2: Install Node.js (if not installed)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 3: Clone and Setup
```bash
git clone https://github.com/ajminac2026-blip/diamond-bot.git
cd diamond-bot
npm install
cd admin-panel
npm install
cd ..
```

### Step 4: Run the Bot
```bash
npm start
# or
node start-all.js
```

---

## Deploying on Render.com

### Step 1: Create New Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Select `diamond-bot`

### Step 2: Configure Service
**Settings:**
- **Name:** diamond-bot
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free or Starter

**Environment Variables:**
- None required (optional: set PORT=3000)

### Step 3: Deploy
Click "Create Web Service" - Render will:
1. Clone your repo
2. Install dependencies
3. Start the bot

---

## Deploying on Railway

### Step 1: Import Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `diamond-bot`

### Step 2: Configure
Railway auto-detects Node.js and installs dependencies.

**Custom Start Command (if needed):**
- Settings → Start Command: `npm start`

### Step 3: Deploy
Railway automatically deploys. Access logs to see QR code.

---

## Deploying on Heroku

### Step 1: Create Procfile
Already created in root:
```
web: npm start
```

### Step 2: Create Heroku App
```bash
heroku login
heroku create diamond-bot-app
```

### Step 3: Add Buildpacks
```bash
heroku buildpacks:add --index 1 heroku/nodejs
heroku buildpacks:add --index 2 https://github.com/heroku/heroku-buildpack-google-chrome
```

### Step 4: Deploy
```bash
git push heroku main
```

### Step 5: Scale
```bash
heroku ps:scale web=1
```

---

## Deploying with PM2 (Production)

### Step 1: Install PM2
```bash
npm install -g pm2
```

### Step 2: Start with PM2
```bash
pm2 start start-all.js --name diamond-bot
pm2 save
pm2 startup
```

### Step 3: Monitor
```bash
pm2 status
pm2 logs diamond-bot
pm2 monit
```

### PM2 Commands:
```bash
pm2 restart diamond-bot  # Restart
pm2 stop diamond-bot     # Stop
pm2 delete diamond-bot   # Remove
pm2 logs diamond-bot     # View logs
```

---

## Environment Variables (Optional)

Create `.env` file:
```env
# Admin Panel
ADMIN_PORT=3000

# Bot API
BOT_PORT=3001

# Production mode
NODE_ENV=production
```

---

## Troubleshooting

### Chromium/Puppeteer Issues on Linux:
```bash
# Install missing libraries
sudo apt-get install -y libgobject-2.0-0 libglib2.0-0

# Set Chromium path
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Port Already in Use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### WhatsApp Session Issues:
```bash
# Delete session and re-scan QR
rm -rf .wwebjs_auth
rm -rf .wwebjs_cache
```

---

## Production Checklist

✅ Change admin credentials in `config/admin-credentials.json`  
✅ Set strong password  
✅ Configure WhatsApp admins in `config/admins.json`  
✅ Set admin PIN in `config/pin.json`  
✅ Backup `config/` folder regularly  
✅ Use PM2 or similar process manager  
✅ Setup SSL/HTTPS for admin panel  
✅ Configure firewall rules  
✅ Setup automatic backups  
✅ Monitor logs regularly  

---

## Keep-Alive Services (For Free Hosting)

### UptimeRobot
1. Go to https://uptimerobot.com
2. Add Monitor
3. Monitor Type: HTTP(s)
4. URL: Your deployed app URL
5. Interval: 5 minutes

### Cron-Job.org
1. Go to https://cron-job.org
2. Create free account
3. Add new cronjob
4. URL: Your app URL
5. Schedule: Every 5 minutes

---

## Recommended Hosting

**Best Options:**
1. ✅ **VPS (DigitalOcean, Linode)** - Full control, best performance
2. ✅ **Railway** - Easy, auto-deploy, free tier
3. ✅ **Render** - Simple, reliable, free tier
4. ⚠️ **Replit** - Easy but sleeps after inactivity
5. ⚠️ **Heroku** - Requires credit card for free plan

**Not Recommended:**
- Vercel/Netlify (serverless, not suitable for persistent connections)
- GitHub Pages (static only)

---

## Support

For deployment issues:
1. Check logs for errors
2. Verify all dependencies installed
3. Ensure ports are not blocked
4. Check firewall settings
5. Review troubleshooting section

**Happy Deploying!** 🚀

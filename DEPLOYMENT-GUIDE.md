# 🚀 Diamond Bot - Critical Fixes & Deployment Guide

## Problems Fixed

### 1. ❌ Socket.IO Disconnect/Reconnect Loop
**Issue**: Bot constantly disconnecting and reconnecting from admin panel
- Missing reconnection settings
- No proper CORS configuration
- Timeout/ping configuration not optimal

**Solution Applied**: Updated Socket.IO initialization with:
- Reconnection enabled with controlled delays (1s → 5s max)
- Max 5 reconnection attempts
- Dual transport: WebSocket + polling fallback
- Proper CORS headers
- Optimized ping interval (25s) and timeout (5s)

### 2. ❌ Puppeteer Missing System Dependencies
**Issue**: Bot crashes on startup with libatk-bridge-2.0.so.0 not found
```
Error: Failed to launch the browser process!
/home/ubuntu/diamond-bot-repo/node_modules/puppeteer-core/.local-chromium/linux-1045629/chrome-linux/chrome: 
error while loading shared libraries: libatk-bridge-2.0.so.0: cannot open shared object file
```

**Root Cause**: Ubuntu server missing critical Chromium/browser rendering libraries

---

## 📋 Deployment Steps

### Step 1: Push Changes to GitHub

```bash
# From your local machine
cd c:\Users\MTB PLC\Desktop\diamond-bot

# Commit Socket.IO fix
git add admin-panel/server.js
git commit -m "🔧 Fix Socket.IO reconnection: add reconnection settings, CORS config, ping optimization"

# Push to GitHub
git push origin main
```

### Step 2: Connect to Ubuntu Server & Install Dependencies

```bash
# SSH into your Ubuntu server
ssh -i "C:\Users\MTB PLC\Downloads\diamond-key.pem" ubuntu@13.60.242.235

# Navigate to repo
cd ~/diamond-bot-repo

# Pull latest changes from GitHub
git pull origin main

# Make the setup script executable
chmod +x setup-puppeteer-deps.sh

# Run the Puppeteer dependencies installer (this will take ~5 minutes)
./setup-puppeteer-deps.sh
```

**What this script does:**
- ✅ Updates system package list
- ✅ Installs Chromium and all browser dependencies
- ✅ Installs missing ATK bridge library (libatk-bridge-2.0-0)
- ✅ Installs rendering libraries (Cairo, X11, etc.)
- ✅ Installs fonts for text rendering
- ✅ Cleans up unnecessary packages

### Step 3: Reinstall Node Dependencies

```bash
# Go to admin panel directory
cd ~/diamond-bot-repo/admin-panel

# Clean install
rm -rf node_modules
npm ci

# Or if using npm install
npm install

# Check if Socket.IO is properly installed
npm list socket.io
```

### Step 4: Restart Services with PM2

```bash
# Kill existing processes (if any are hanging)
pm2 kill

# Wait a moment
sleep 2

# Start all services fresh
pm2 start ecosystem.config.js --update-env

# Or manually start if no ecosystem config
pm2 start server.js --name "admin-panel"
pm2 start ../index.js --name "main-bot"

# Save PM2 config for auto-restart on reboot
pm2 save

# Verify services are running
pm2 list

# Check for errors
pm2 logs --lines 50
```

### Step 5: Verify Everything is Working

```bash
# Check main bot logs for Puppeteer errors
pm2 logs main-bot --lines 50

# Look for:
# ✅ "✅ Connected to Admin Panel" (WITHOUT disconnect cycles)
# ✅ "✅ 🔌 Bot API Server running"
# ❌ Should NOT see: libatk-bridge-2.0.so.0 errors

# Check admin panel logs
pm2 logs admin-panel --lines 20

# Test connection from local machine
# Open browser and go to: http://13.60.242.235:3000
```

---

## 🔍 Troubleshooting

### If Socket.IO Still Disconnecting:

1. **Check Network/Firewall**:
```bash
# From Ubuntu server
sudo ufw status
# Make sure ports 3000 and 3001 are open

# Open ports if needed
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw reload
```

2. **Verify Socket.IO Connection**:
```bash
# On Ubuntu server, check if admin-panel is listening
sudo lsof -i :3000
# Should show Node.js process

# Check if main-bot can reach it
curl -v http://localhost:3000
```

3. **Restart with debug logging**:
```bash
# Add debug logging
DEBUG=socket.io* pm2 start server.js --name "admin-panel" --update-env

# Check logs
pm2 logs admin-panel
```

### If Puppeteer Still Fails:

1. **Check if libraries were installed**:
```bash
# Verify libatk-bridge is present
dpkg -l | grep libatk-bridge
# Should show: ii  libatk-bridge2.0-0

# Check for other missing libraries
ldd /home/ubuntu/diamond-bot-repo/node_modules/puppeteer-core/.local-chromium/linux-1045629/chrome-linux/chrome | grep "not found"
```

2. **Run full Puppeteer setup**:
```bash
# Reinstall Puppeteer with dependencies
cd ~/diamond-bot-repo
npm install --save puppeteer

# This will download Chromium again
```

3. **Use system Chromium instead** (temporary workaround):
```bash
# Edit bot startup file to use system Chromium
# Add to puppeteer launch options:
# executablePath: '/usr/bin/chromium-browser',
```

---

## 📊 Expected Behavior After Fix

### Admin Panel Logs
```
✅ Admin Panel Started Successfully!
📱 Access from this device: http://localhost:3000
```

### Main Bot Logs (GOOD - No More Disconnect Loop)
```
🚀 Starting bot initialization...
✅ Express app created
✅ Connected to Admin Panel
✅ 🔌 Bot API Server running on http://localhost:3001
```

**Should NOT see repeated:**
```
❌ Disconnected from Admin Panel
✅ Connected to Admin Panel
❌ Disconnected from Admin Panel  ← This loop is the problem!
```

---

## 🎯 Quick Reference Commands

```bash
# SSH into server
ssh -i "C:\Users\MTB PLC\Downloads\diamond-key.pem" ubuntu@13.60.242.235

# Pull latest code
cd ~/diamond-bot-repo && git pull origin main

# Install Puppeteer dependencies
./setup-puppeteer-deps.sh

# Restart services
pm2 restart all

# View logs
pm2 logs --lines 50

# Check service status
pm2 list
```

---

## ⚡ Performance Tips

1. **Enable Swap (prevent out-of-memory crashes)**:
```bash
# Add 2GB swap on Ubuntu
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

2. **Monitor system resources**:
```bash
# Watch CPU and memory
pm2 monit

# Or use top
top
```

3. **Set up automatic restarts**:
```bash
# Already done with PM2 save, but verify:
pm2 startup
pm2 save
```

---

## 📞 Support

If issues persist:
1. Check error logs: `pm2 logs main-bot --lines 100`
2. Verify network connectivity between bot and admin panel
3. Ensure all ports are open on server and firewall
4. Reinstall Node modules from scratch if needed
5. Run system updates: `sudo apt-get update && sudo apt-get upgrade -y`


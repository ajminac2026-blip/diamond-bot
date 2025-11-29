#!/bin/bash

# 🔧 QUICK DEPLOYMENT CHECKLIST - Run these commands on Ubuntu server
# Copy & paste each section in order

echo "🚀 DIAMOND BOT - QUICK DEPLOYMENT FIX"
echo "======================================"
echo ""

# Step 1
echo "📍 STEP 1: Pull latest changes from GitHub"
echo "$ cd ~/diamond-bot-repo && git pull origin main"
echo ""
read -p "Press ENTER after running Step 1..."

# Step 2
echo "📍 STEP 2: Install Puppeteer dependencies"
echo "$ chmod +x setup-puppeteer-deps.sh && ./setup-puppeteer-deps.sh"
echo "(This will take 3-5 minutes)"
echo ""
read -p "Press ENTER after running Step 2..."

# Step 3
echo "📍 STEP 3: Reinstall Node dependencies"
echo "$ cd admin-panel && rm -rf node_modules && npm ci"
echo ""
read -p "Press ENTER after running Step 3..."

# Step 4
echo "📍 STEP 4: Restart PM2 services"
echo "$ pm2 kill && sleep 2 && pm2 start ecosystem.config.js --update-env"
echo "OR"
echo "$ pm2 start server.js --name 'admin-panel' && pm2 start ../index.js --name 'main-bot'"
echo ""
read -p "Press ENTER after running Step 4..."

# Step 5
echo "📍 STEP 5: Verify services are running"
echo "$ pm2 list"
echo ""
read -p "Press ENTER after running Step 5..."

# Step 6
echo "📍 STEP 6: Check logs for errors"
echo "$ pm2 logs main-bot --lines 50"
echo ""
echo "✅ LOOKING FOR:"
echo "   - ✅ Connected to Admin Panel"
echo "   - ✅ Bot API Server running"
echo "   - NO disconnect/reconnect loops"
echo "   - NO libatk-bridge-2.0.so.0 errors"
echo ""
echo "❌ ISSUES? Check DEPLOYMENT-GUIDE.md for troubleshooting"
echo ""

# Confirmation
read -p "Press ENTER to finish..."
echo ""
echo "✨ Deployment complete! Monitor logs with: pm2 logs"

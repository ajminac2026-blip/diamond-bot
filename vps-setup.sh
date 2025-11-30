#!/bin/bash

echo "🚀 Diamond Bot VPS Setup Script"
echo "================================"

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Chromium dependencies
echo "📦 Installing Chromium dependencies..."
sudo apt install -y \
    chromium-browser \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Clone repository
echo "📥 Cloning Diamond Bot repository..."
cd /home
git clone https://github.com/ajminac2026-blip/diamond-bot.git
cd diamond-bot

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Start with PM2
echo "🚀 Starting Diamond Bot with PM2..."
pm2 start start-all.js --name diamond-bot
pm2 save
pm2 startup

# Setup firewall
echo "🔒 Setting up firewall..."
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw allow 3001
sudo ufw --force enable

echo ""
echo "✅ Setup Complete!"
echo "================================"
echo "📱 Your Admin Panel URL:"
echo "   http://YOUR_VPS_IP:3000"
echo ""
echo "🔐 Login Credentials:"
echo "   Username: admin"
echo "   Password: Rubel890"
echo ""
echo "📝 Useful Commands:"
echo "   pm2 list          - Show running processes"
echo "   pm2 logs          - Show logs"
echo "   pm2 restart all   - Restart bot"
echo "   pm2 stop all      - Stop bot"
echo ""
echo "🎯 Next Steps:"
echo "   1. Get your VPS IP address"
echo "   2. Open: http://YOUR_VPS_IP:3000"
echo "   3. Login and scan WhatsApp QR code"
echo ""

#!/bin/bash

# Puppeteer Dependencies Installation Script for Ubuntu
# This script installs all necessary system dependencies for running Chromium/Chrome on Ubuntu

echo "📦 Installing Puppeteer Dependencies..."
echo "=========================================="

# Update package list
echo "🔄 Updating package list..."
sudo apt-get update

# Install Chromium dependencies
echo "📥 Installing Chromium and browser dependencies..."
sudo apt-get install -y \
    chromium-browser \
    chromium-codecs-ffmpeg \
    fonts-liberation \
    libappindicator1 \
    libappindicator3-1 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libgbm1 \
    libgcc-s1 \
    libgconf-2-4 \
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
    xdg-utils

# Critical dependencies that may be missing
echo "📥 Installing additional critical libraries..."
sudo apt-get install -y \
    libatk-bridge-2.0-0 \
    gconf-service \
    libasound2 \
    libgconf-2-4 \
    libxss1

# Optional: Install fonts for better rendering
echo "📥 Installing fonts..."
sudo apt-get install -y \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk

# Clean up
echo "🧹 Cleaning up..."
sudo apt-get autoremove -y
sudo apt-get clean

echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "📝 Notes:"
echo "- If running in a Docker container without display, use: DISPLAY= npm start"
echo "- If using headless mode (recommended for server), Puppeteer handles this automatically"
echo "- For more issues, refer to: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md"
echo ""

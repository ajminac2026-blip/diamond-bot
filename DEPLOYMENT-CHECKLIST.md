# 📋 DEPLOYMENT CHECKLIST - PRINT THIS

## Pre-Deployment Checklist (Local Machine)

### Understanding
- [ ] Read `00-START-HERE.md` (understand scope)
- [ ] Read `FIX-SUMMARY.md` (understand fixes)
- [ ] Read `BEFORE-AND-AFTER.md` (understand changes)
- [ ] Review `QUICK-REFERENCE.md` (bookmark this!)

### Git Preparation
- [ ] Check git status: `git status`
- [ ] Review changes: `git diff admin-panel/server.js`
- [ ] All files present:
  - [ ] `admin-panel/server.js` (modified)
  - [ ] `setup-puppeteer-deps.sh` (new)
  - [ ] All `*.md` documentation (new)

### Git Commit
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "🔧 Fix critical bot issues: Socket.IO reconnection loop & Puppeteer dependencies"`
- [ ] Verify: `git log --oneline -1`
- [ ] Push: `git push origin main`
- [ ] Confirm: Repository shows latest commit on GitHub

---

## Deployment Checklist (Ubuntu Server)

### Initial Setup
- [ ] SSH to server: `ssh -i "C:\Users\MTB PLC\Downloads\diamond-key.pem" ubuntu@13.60.242.235`
- [ ] Navigate: `cd ~/diamond-bot-repo`
- [ ] Verify location: `pwd` (should be `/home/ubuntu/diamond-bot-repo`)

### Pull Latest Code
- [ ] Run: `git pull origin main`
- [ ] Verify: `ls -la | grep -E "DEPLOYMENT|setup-puppeteer"`
- [ ] Confirm files exist:
  - [ ] `DEPLOYMENT-GUIDE.md`
  - [ ] `setup-puppeteer-deps.sh`

### Check System Status
- [ ] Disk space: `df -h` (need 2GB+ free)
- [ ] Services running: `pm2 list`
- [ ] Network: `ping google.com` (verify connectivity)

### Install Puppeteer Dependencies
- [ ] Make script executable: `chmod +x setup-puppeteer-deps.sh`
- [ ] Run script: `./setup-puppeteer-deps.sh`
- [ ] Wait for completion (3-5 minutes)
- [ ] Verify no errors in output
- [ ] Check installation: `dpkg -l | grep libatk-bridge`

### Reinstall Node Modules
- [ ] Navigate: `cd admin-panel`
- [ ] Clean install: `rm -rf node_modules && npm ci`
- [ ] Wait for completion
- [ ] Verify: `npm list socket.io | head -5`
- [ ] Navigate back: `cd ..`

### Restart Services
- [ ] Kill PM2: `pm2 kill`
- [ ] Wait: `sleep 2`
- [ ] Restart services: `pm2 start ecosystem.config.js --update-env`
- [ ] Or manually: 
  - [ ] `pm2 start admin-panel/server.js --name "admin-panel"`
  - [ ] `pm2 start index.js --name "main-bot"`

### Save PM2 Configuration
- [ ] Run: `pm2 save`
- [ ] Enable startup: `pm2 startup`
- [ ] Verify: `pm2 list`

---

## Verification Checklist (Post-Deployment)

### Service Status
- [ ] Run: `pm2 list`
- [ ] Check: Both services show `online`
- [ ] Check: CPU/Memory reasonable (<20% each)

### Admin Panel Logs
- [ ] Run: `pm2 logs admin-panel --lines 20`
- [ ] Look for: `Admin Panel Started Successfully!`
- [ ] Check: No errors in output

### Bot Logs (Critical)
- [ ] Run: `pm2 logs main-bot --lines 50`
- [ ] ✅ Look for: `✅ Connected to Admin Panel`
- [ ] ✅ Look for: `✅ Bot API Server running`
- [ ] ❌ Should NOT see: `❌ Disconnected` (repeating)
- [ ] ❌ Should NOT see: `libatk-bridge-2.0.so.0` error
- [ ] ❌ Should NOT see: `Failed to launch browser`

### Connection Stability Test
- [ ] Monitor for 5 minutes: `pm2 logs main-bot`
- [ ] Look for: No disconnect/reconnect cycles
- [ ] Look for: Stable connection maintained
- [ ] Document: Time of first successful connect

### Admin Panel Accessibility
- [ ] Open browser: `http://[SERVER_IP]:3000`
- [ ] Login with credentials
- [ ] Verify: Admin panel loads without errors
- [ ] Verify: No console errors (press F12)
- [ ] Test: Update a group rate (test real-time update)

### Extended Monitoring (10+ minutes)
- [ ] Run: `pm2 logs --lines 100` (watch in terminal)
- [ ] Monitor: No new errors appear
- [ ] Monitor: Connection remains stable
- [ ] Monitor: CPU/Memory stable
- [ ] Timestamp: Note time of successful verification

---

## Feature Verification

### Socket.IO Connection
- [ ] Logs show "Connected to Admin Panel"
- [ ] No disconnect messages for 5+ minutes
- [ ] Admin panel receives real-time updates

### Puppeteer Browser
- [ ] No libatk-bridge errors
- [ ] No "Failed to launch browser" errors
- [ ] If taking screenshots: verify success in logs

### Bot Functionality
- [ ] Bot responds to test messages
- [ ] Admin panel shows incoming messages
- [ ] Real-time updates transmit instantly
- [ ] Due reminders can be sent

---

## Troubleshooting Checkpoints

### If Services Won't Start
- [ ] Check Node modules: `npm list | head -20`
- [ ] Check syntax: `node -c admin-panel/server.js`
- [ ] Check ports: `sudo lsof -i :3000`
- [ ] Clear PM2: `pm2 kill && pm2 start ...`

### If Still Seeing Disconnect Loops
- [ ] Verify Socket.IO config: `grep -A 10 "const io" admin-panel/server.js`
- [ ] Check firewall: `sudo ufw status`
- [ ] Open ports: `sudo ufw allow 3000 3001`
- [ ] Restart with debug: `DEBUG=socket.io* pm2 start server.js`

### If Still Getting Library Errors
- [ ] Rerun script: `./setup-puppeteer-deps.sh`
- [ ] Check installation: `dpkg -l | grep libatk`
- [ ] Check more: `ldd /usr/bin/chromium-browser 2>/dev/null | grep "not found"`

---

## Post-Deployment Tasks

### Backup Current Configuration
- [ ] Run: `pm2 save`
- [ ] Backup config: `cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup`

### Enable Auto-Restart
- [ ] Run: `pm2 startup`
- [ ] Run: `pm2 save`
- [ ] Test: `sudo reboot` (optional, test only if confident)

### Set Up Monitoring (Optional)
- [ ] Run: `pm2 install pm2-auto-pull`
- [ ] Monitor: `pm2 monit`
- [ ] Alerts: `pm2 install pm2-logrotate`

### Documentation
- [ ] Save DEPLOYMENT-GUIDE.md locally
- [ ] Save QUICK-REFERENCE.md for future reference
- [ ] Document any custom configurations made

---

## Success Confirmation

### Minimum Requirements (Must Have All)
- [ ] `pm2 list` shows both services as "online"
- [ ] Admin panel accessible at http://[IP]:3000
- [ ] Bot logs show "✅ Connected to Admin Panel"
- [ ] No disconnect loops for 5+ minutes
- [ ] No libatk-bridge or browser errors

### Nice-to-Have
- [ ] Monitoring dashboard active
- [ ] Auto-restart configured
- [ ] PM2 configuration backed up
- [ ] Documentation on hand

### Final Sign-Off
- [ ] Date/Time verified: _______________
- [ ] Verified by: _______________
- [ ] Notes: _______________

✨ **Deployment Status**: Ready for Production ✨

---

## Quick Copy-Paste Commands

### For Local Machine
```bash
cd c:\Users\MTB PLC\Desktop\diamond-bot
git add .
git commit -m "🔧 Fix critical bot issues: Socket.IO reconnection loop & Puppeteer dependencies"
git push origin main
```

### For Ubuntu Server
```bash
cd ~/diamond-bot-repo && git pull origin main
chmod +x setup-puppeteer-deps.sh && ./setup-puppeteer-deps.sh
cd admin-panel && npm ci && cd ..
pm2 kill && sleep 2 && pm2 start ecosystem.config.js --update-env
pm2 save
pm2 logs main-bot --lines 50
```

---

## Emergency Rollback (If Needed)

```bash
# Revert to previous version
cd ~/diamond-bot-repo
git reset --hard HEAD~1
git clean -fd
npm ci
pm2 restart all
pm2 logs
```

---

## Support Contact

- Documentation: See `00-START-HERE.md`
- Issues: Check `DEPLOYMENT-GUIDE.md` Troubleshooting
- Quick Reference: `QUICK-REFERENCE.md`
- Detailed Info: `BEFORE-AND-AFTER.md`

---

**Checklist Version**: 1.0  
**Date**: November 28, 2025  
**Status**: Ready to Use

**Print this page and check off each item as you complete it!** ✓

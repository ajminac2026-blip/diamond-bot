# 🚀 VPS Setup Guide - Diamond Bot

## 1️⃣ Get Free VPS (DigitalOcean)

### Step 1: Sign Up
1. Go to: https://try.digitalocean.com/freetrialoffer/
2. Sign up with email
3. Verify email
4. Add credit card (only for verification, won't be charged)
5. Get $200 free credit!

### Step 2: Create Droplet (VPS)
1. Click **"Create"** → **"Droplets"**
2. Choose **Ubuntu 22.04 LTS**
3. Choose **Basic Plan** → **$6/month** (1 GB RAM)
4. Choose **Data center** (any region, prefer closer to Bangladesh)
5. **Authentication:** Choose **Password** and set a strong password
6. Click **"Create Droplet"**
7. Wait 1-2 minutes

### Step 3: Get Your IP Address
- You'll see your droplet with an IP like: `143.198.123.45`
- Copy this IP address

---

## 2️⃣ Connect to VPS

### Option A: Using PowerShell (Windows)
```powershell
ssh root@YOUR_VPS_IP
```
Example: `ssh root@143.198.123.45`

Enter the password you set during droplet creation.

### Option B: Using PuTTY (Windows)
1. Download PuTTY: https://www.putty.org/
2. Open PuTTY
3. Enter your VPS IP in "Host Name"
4. Click "Open"
5. Login as: `root`
6. Enter password

---

## 3️⃣ Install Diamond Bot (Automatic)

Once connected to VPS, run these commands:

```bash
# Download setup script
wget https://raw.githubusercontent.com/ajminac2026-blip/diamond-bot/main/vps-setup.sh

# Make it executable
chmod +x vps-setup.sh

# Run setup (takes 5-10 minutes)
./vps-setup.sh
```

That's it! The script will install everything automatically.

---

## 4️⃣ Access Admin Panel

1. Open browser
2. Go to: `http://YOUR_VPS_IP:3000`
3. Login:
   - Username: `admin`
   - Password: `Rubel890`
4. Scan WhatsApp QR code
5. Done! ✅

---

## 5️⃣ Useful Commands

### Check if bot is running:
```bash
pm2 list
```

### View logs:
```bash
pm2 logs diamond-bot
```

### Restart bot:
```bash
pm2 restart diamond-bot
```

### Stop bot:
```bash
pm2 stop diamond-bot
```

### Start bot again:
```bash
pm2 start diamond-bot
```

### Update bot from GitHub:
```bash
cd /home/diamond-bot
git pull origin main
npm install
pm2 restart diamond-bot
```

---

## 6️⃣ Add Custom Domain (Optional)

### If you have a domain (example: mybot.com):

```bash
# Install nginx
sudo apt install -y nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/diamond-bot
```

Paste this:
```nginx
server {
    listen 80;
    server_name mybot.com www.mybot.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/diamond-bot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Point your domain A record to your VPS IP.

---

## 🔒 Security Tips

### Change SSH port (optional):
```bash
sudo nano /etc/ssh/sshd_config
# Change: Port 22 → Port 2222
sudo systemctl restart sshd
```

### Update firewall:
```bash
sudo ufw allow 2222  # New SSH port
sudo ufw delete allow 22
```

---

## 📞 Troubleshooting

### Bot not starting?
```bash
cd /home/diamond-bot
npm install
pm2 restart diamond-bot
pm2 logs
```

### Port already in use?
```bash
sudo lsof -i :3000
sudo kill -9 PID_NUMBER
pm2 restart diamond-bot
```

### Can't access admin panel?
```bash
# Check if ports are open
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 3001
```

---

## 💰 Cost Tracking

- $6/month VPS = $200 credit lasts **33 months**!
- After free credit: Only $6/month (~৳720)

---

## 🎯 Summary

1. ✅ Sign up DigitalOcean → Get $200 credit
2. ✅ Create Ubuntu Droplet
3. ✅ SSH connect
4. ✅ Run setup script
5. ✅ Access at http://YOUR_IP:3000
6. ✅ Login and scan QR code
7. ✅ Bot runs 24/7!

---

Need help? Check logs with: `pm2 logs diamond-bot`

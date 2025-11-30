# 🆓 Oracle Cloud Free Setup - Diamond Bot (Forever Free!)

## ⭐ সারাজীবন Free - কোনো খরচ নেই!

Oracle Cloud **Always Free** tier সারাজীবন free! $0 খরচ।

---

## 1️⃣ Create Oracle Cloud Account

### Step 1: Sign Up
1. Go to: https://www.oracle.com/cloud/free/
2. Click **"Start for free"**
3. Fill in details:
   - Country: Bangladesh (বা যেকোনো)
   - Email: আপনার email
4. Verify email
5. Add credit/debit card (শুধু verify, charge হবে না)
6. Sign in to Console

---

## 2️⃣ Create Free Compute Instance

### Step 1: Go to Instances
1. Oracle Cloud Console এ login করুন
2. Menu (☰) → **Compute** → **Instances**
3. Click **"Create Instance"**

### Step 2: Instance Configuration
**Name:**
```
diamond-bot
```

**Image and Shape:**
1. Click **"Change Image"**
2. Select **"Canonical Ubuntu"** → **Ubuntu 22.04**
3. Click **"Select Image"**

4. Click **"Change Shape"**
5. Select **"Ampere"** (ARM)
6. Choose **VM.Standard.A1.Flex**:
   - **2 OCPU**
   - **12 GB RAM**
   - ✅ **Always Free Eligible**
7. Click **"Select Shape"**

### Step 3: Networking
- Keep default VCN settings
- ✅ **Assign a public IPv4 address** (check this!)

### Step 4: SSH Keys
**Option A: Generate keys (Recommended)**
1. Click **"Generate a key pair for me"**
2. Download **both** private and public keys
3. Save them safely!

**Option B: Upload your own**
- If you have SSH keys, upload public key

### Step 5: Boot Volume
- Keep default (50 GB is enough)

### Step 6: Create!
- Click **"Create"**
- Wait 2-3 minutes
- Copy the **Public IP** address (e.g., 132.145.123.45)

---

## 3️⃣ Configure Firewall (Very Important!)

### Step 1: Open Ports in Oracle Cloud
1. Go to **Compute** → **Instances** → Your instance
2. Click **"Subnet"** link
3. Click your **Security List**
4. Click **"Add Ingress Rules"**

**Add these 3 rules:**

**Rule 1: HTTP**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `80`
- Description: `HTTP`

**Rule 2: Admin Panel**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3000`
- Description: `Admin Panel`

**Rule 3: Bot API**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3001`
- Description: `Bot API`

Click **"Add Ingress Rules"** for each

---

## 4️⃣ Connect to Instance

### Using PowerShell (Windows):

1. Open PowerShell
2. Navigate to where you saved the private key:
```powershell
cd Downloads
```

3. Connect:
```powershell
ssh -i .\ssh-key-XXXX.key ubuntu@YOUR_PUBLIC_IP
```

Example:
```powershell
ssh -i .\ssh-key-2025.key ubuntu@132.145.123.45
```

4. Type `yes` when asked

---

## 5️⃣ Setup Diamond Bot (Automatic!)

Once connected, run these commands:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Download and run setup script
wget https://raw.githubusercontent.com/ajminac2026-blip/diamond-bot/main/vps-setup.sh
chmod +x vps-setup.sh
./vps-setup.sh
```

Wait 5-10 minutes for installation.

### Additional firewall setup inside Ubuntu:
```bash
# Open ports in Ubuntu firewall
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3001 -j ACCEPT
sudo netfilter-persistent save
```

---

## 6️⃣ Access Admin Panel

1. Open browser
2. Go to: `http://YOUR_PUBLIC_IP:3000`

Example: `http://132.145.123.45:3000`

3. Login:
   - Username: `admin`
   - Password: `Rubel890`

4. Scan WhatsApp QR code

5. ✅ Done! Bot running 24/7 forever free!

---

## 7️⃣ Useful Commands

### Check bot status:
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

### Update bot:
```bash
cd /home/diamond-bot
git pull origin main
npm install
pm2 restart diamond-bot
```

---

## 🔒 Security Tips

### Change SSH port:
```bash
sudo nano /etc/ssh/sshd_config
# Change: Port 22 → Port 2222
sudo systemctl restart sshd
```

### Update Oracle firewall for new port:
Add ingress rule for port 2222

---

## 📊 Free Tier Limits

Oracle Always Free includes:
- ✅ 2 VMs (Ampere ARM)
- ✅ 4 OCPU + 24 GB RAM (total)
- ✅ 200 GB storage
- ✅ 10 TB outbound data/month
- ✅ **Forever free - no expiration!**

---

## 🎯 Summary

1. ✅ Sign up Oracle Cloud
2. ✅ Create ARM instance (VM.Standard.A1.Flex)
3. ✅ Configure firewall rules
4. ✅ SSH connect
5. ✅ Run setup script
6. ✅ Access http://YOUR_IP:3000
7. ✅ Forever free! 🎉

---

## 📞 Troubleshooting

### Can't connect via SSH?
- Check if you're using correct private key
- Make sure SSH port 22 is open in security list

### Can't access admin panel?
- Check if port 3000 is open in Oracle security list
- Run iptables commands above
- Check firewall: `sudo ufw status`

### Bot not starting?
```bash
cd /home/diamond-bot
pm2 logs diamond-bot
```

---

## 💰 Cost

**$0.00 forever!** 🎉

Oracle Always Free tier never expires!

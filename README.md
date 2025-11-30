# 💎 Diamond Bot - WhatsApp Trading Bot with Admin Panel

A complete WhatsApp bot system for managing diamond trading with an advanced admin panel.

## 🌟 Features

### WhatsApp Bot
- 🤖 Automated diamond request handling
- 💰 Payment number management (Bkash, Nagad, Rocket, Bank)
- 📊 User balance tracking and ledger system
- 🔄 Dynamic command system
- 📝 Order management with approval workflow
- 💳 Deposit tracking and verification
- 🎯 Group-specific settings and rates
- 📱 Message edit detection for order updates
- 🔔 Auto-deduction system

### Admin Panel (Port 3000)
- 🏠 **Dashboard**: Real-time stats and analytics
- 📊 **Analytics**: 5-day summary charts
- 👥 **User Management**: View/edit user balances and status
- 💳 **Payment Numbers**: Manage payment methods
- 📱 **WhatsApp Admins**: Configure admin access
- ⚙️ **Settings**: Notification sounds, themes, language
- 💬 **Group Messages**: Manage group-specific messages and rates
- 📦 **Orders**: View and manage all orders
- ✅ **Approve Messages**: Customize approval messages
- ✏️ **Edit Message Settings**: Configure message edit responses
- ⌨️ **Command Management**: Add/edit/delete bot commands
- 💳 **Payment Keywords**: Manage payment trigger keywords per method
- 🔐 **Login System**: Secure persistent authentication
- 🌙 **Dark/Light Theme**: Eye-friendly interface
- 🔔 **10+ Notification Sounds**: Customizable alerts

## 📋 Prerequisites

- Node.js v14 or higher
- npm or yarn
- WhatsApp account for bot

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/diamond-bot.git
cd diamond-bot
```

2. **Install dependencies**
```bash
npm install
cd admin-panel
npm install
cd ..
```

3. **Configure credentials**
   
   Edit `config/admin-credentials.json`:
   ```json
   {
     "username": "admin",
     "password": "your_password_here"
   }
   ```

4. **Start the bot**
```bash
node start-all.js
```

5. **Scan QR code**
   - QR code will appear in terminal
   - Scan with WhatsApp (Linked Devices)
   - Wait for "WhatsApp Bot Ready!" message

6. **Access Admin Panel**
   - Open browser: `http://localhost:3000`
   - Login with credentials
   - Default: username: `admin`, password: `Rubel890`

## 🔧 Configuration Files

### Bot Configuration
- `config/database.json` - Main database (groups, orders, users)
- `config/payment-number.json` - Payment methods
- `config/commands.json` - Bot commands
- `config/payment-keywords.json` - Payment trigger keywords
- `config/admins.json` - WhatsApp admin list
- `config/pin.json` - Admin PIN for bot commands
- `config/admin-credentials.json` - Admin panel login

### Admin Panel
- `admin-panel/whatsapp-admins.json` - WhatsApp admin configuration
- `admin-panel/auto-deductions.json` - Auto-deduction logs

## 📱 Bot Commands

### User Commands
- `/help` - Show all available commands
- `/rate` - Show current diamond rate
- `/balance` or `/b` - Check balance
- `/dashboard` or `/d` - View personal dashboard
- `bkash`, `nagad`, `rocket`, `bank` - Get payment numbers
- `payment`, `number` - Get all payment methods

### Admin Commands (with PIN)
- `ধার [amount] [userId]` - Give loan to user
- `মার [amount] [userId]` - Deduct from user
- `[amount] [userId]` - Add to user balance

## 🎨 Admin Panel Features

### Dashboard
- Total users, deposits, orders
- Pending diamonds and amount
- Active groups count
- 5-day analytics chart
- Recent transactions

### User Management
- View all users with balances
- Edit user balance
- Block/unblock users
- View transaction history

### Payment Management
- Add/edit payment methods
- Bkash, Nagad, Rocket, Bank support
- Bank account details
- Custom response messages

### Command Management
- Add custom commands
- Category-based permissions (General, User, Admin, Custom)
- Enable/disable commands
- Response with placeholders ({rate})

### Payment Keywords
- Separate keywords for each payment method
- Bkash, Nagad, Rocket, Bank, All
- Custom response per method
- Real-time keyword updates

### Login System
- Persistent authentication
- "Keep me logged in" option
- Secure token-based sessions
- Logout functionality

## 🎯 How It Works

1. **User sends diamond request** in WhatsApp group
2. **Bot detects** and logs the request
3. **Admin approves** from admin panel
4. **User gets notification** with payment info
5. **User sends screenshot** after payment
6. **Admin verifies** and updates balance
7. **System auto-deducts** on next request

## 🔒 Security

- Password-protected admin panel
- Token-based authentication
- Session management
- WhatsApp admin verification
- PIN-protected admin commands

## 📊 Database Structure

### Users
```json
{
  "userId": {
    "name": "User Name",
    "balance": 1000,
    "status": "active",
    "transactions": []
  }
}
```

### Groups
```json
{
  "groupId": {
    "name": "Group Name",
    "rate": 85,
    "entries": [],
    "settings": {}
  }
}
```

## 🎨 Customization

### Themes
- Dark mode (default)
- Light mode
- Saved in localStorage

### Notification Sounds
- Bell, Chime, Ding, Pop, Swoosh
- Ping, Alert, Notification, Message, Success
- Customizable per admin

### Languages
- Bengali (default)
- English support

## 🐛 Troubleshooting

**Bot not responding:**
- Check if QR code is scanned
- Verify WhatsApp connection
- Check console for errors

**Admin panel not loading:**
- Ensure port 3000 is free
- Check if services are running
- Verify login credentials

**Commands not working:**
- Check commands.json format
- Verify admin WhatsApp ID
- Check PIN configuration

## 📝 Documentation

Detailed documentation available in:
- `QUICK-START.md` - Quick setup guide
- `ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION-SUMMARY.md` - Implementation details
- `PAYMENT-KEYWORDS-FEATURE.md` - Payment keywords system

## 🛠️ Built With

- **Backend**: Node.js, Express.js
- **Bot**: whatsapp-web.js
- **Frontend**: Vanilla JavaScript, Socket.IO
- **Database**: JSON files
- **UI**: Custom CSS with Font Awesome icons

## 📜 License

This project is for educational purposes only.

## 👨‍💻 Author

**Diamond Bot**  
Version 1.0  
© 2025

## 🤝 Support

For issues and questions, create an issue in the repository.

---

**⚠️ Important Notes:**
- Keep credentials secure
- Don't share admin credentials
- Backup database regularly
- Test in dev environment first
- Change default password after first login

**🎉 Happy Trading!** 💎

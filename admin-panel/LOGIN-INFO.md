# 🔐 Admin Panel Login Information

## Login Credentials

**Email:** admin@example.com  
**Password:** admin123

---

## How to Access Admin Panel

1. Start the admin panel server:
   ```
   cd admin-panel
   npm start
   ```

2. Open browser and go to:
   ```
   http://localhost:3000
   ```

3. You will be redirected to the login page automatically

4. Enter the credentials above to login

---

## How to Change Login Credentials

Edit the file: `admin-panel/admin-credentials.json`

```json
{
  "email": "your_new_email@example.com",
  "password": "your_new_password"
}
```

**Note:** Restart the server after changing credentials.

---

## Features

- ✅ **Email/Password Login System**
- ✅ **Session Management** - Stay logged in until logout
- ✅ **Remember Me** - Option to stay logged in after browser close
- ✅ **Secure Authentication** - Token-based authentication
- ✅ **Auto Logout** - Automatic logout on session expiry
- ✅ **No Page Reload** - Smooth navigation without unnecessary reloads

---

## Security Notes

1. **Change default credentials** after first login
2. Keep `admin-credentials.json` secure and never commit to git
3. Use strong passwords in production
4. Consider adding rate limiting for login attempts in production

---

## Logout

Click the **logout icon** (🚪) in the top-right corner of the admin panel to logout.

---

**Created:** November 28, 2025  
**System:** Diamond Bot Admin Panel v2.0

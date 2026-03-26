// utils.js - الدوال المساعدة المشتركة

/** تعديل نص أي عنصر عبر المعرف الخاص به */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

/** تنظيف النصوص لمنع ثغرات XSS */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/** تحديث التاريخ والوقت في الهيدر */
function updateDateTime() {
    const locale = 'en-US';
    const now = new Date();
    const dateStr = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString(locale);
    setText('headerDate', dateStr);
    setText('headerTime', timeStr);
}

/** طلب إذن الإشعارات من المستخدم */
function requestNotificationPermission() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("sw.js")
            .then(reg => {
                console.log("🚀 PWA Service Worker Ready!", reg);
                if ("Notification" in window && Notification.permission !== "granted") {
                    Notification.requestPermission();
                }
            })
            .catch(err => console.error("Service Worker Error", err));
    }
}

/** إرسال إشعار للمتصفح */
function sendNotification(title, body) {
    if (Notification.permission === "granted") {
        // المحاولة عبر الـ Service Worker إذا كان متاحاً (للخلفية)
        navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(title, {
                body: body,
                icon: "https://cdn-icons-png.flaticon.com/512/2906/2906231.png",
                vibrate: [200, 100, 200]
            });
        }).catch(() => {
            // كحل احتياطي إذا فشل الـ SW
            new Notification(title, { body: body });
        });
    }
}
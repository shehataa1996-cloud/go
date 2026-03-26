// gold.js - النسخة النهائية مع رسالة تنبيه للمستخدم
const API_KEY = "goldapi-voxsmn78ual0-io"; 
let currentPrice24 = 0; // تخزين السعر الحالي للحاسبة

// 1. دالة جلب البيانات
async function fetchGoldPrices(forceFetch = false) {
    try {
        // 1. محاولة جلب السعر المخزن مؤقتاً لسرعة العرض
        const cachedPrice = localStorage.getItem('lastGoldPrice');
        if (cachedPrice && !forceFetch) {
            updateUI(parseFloat(cachedPrice));
        }

        // 2. منع كثرة الطلبات (طلب كل 15 دقيقة) لتوفير الحصة المجانية
        const lastFetch = localStorage.getItem('lastGoldFetchTime');
        const now = Date.now();
        if (!forceFetch && lastFetch && (now - lastFetch < 15 * 60 * 1000)) return;

        // جلب سعر الدولار الرسمي من API خارجي لتحديث الفجوة السعرية
        try {
            const bankRes = await fetch("https://open.er-api.com/v6/latest/USD");
            const bankData = await bankRes.json();
            if (bankData && bankData.rates && bankData.rates.EGP) {
                localStorage.setItem('liveBankRate', bankData.rates.EGP);
                console.log("✅ تم تحديث سعر دولار البنك لايف:", bankData.rates.EGP);
            }
        } catch (e) {
            console.warn("⚠️ فشل جلب سعر البنك، سيتم استخدام السعر المخزن أو الافتراضي.");
        }

        // 3. طلب البيانات الحقيقية من API
        const response = await fetch("https://www.goldapi.io/api/XAU/EGP", {
            headers: { 
                "x-access-token": API_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error("GoldAPI Error:", response.status);
            showBackup();
            return;
        }

        // طباعة الرصيد المتبقي من الطلبات في الكونسول
        const remaining = response.headers.get('x-ratelimit-remaining');
        const limit = response.headers.get('x-ratelimit-limit');
        if (remaining) {
            console.log(`📊 رصيد GoldAPI (الذهب): المتبقي ${remaining} من أصل ${limit} طلب لهذا الشهر`);
        }

        const data = await response.json();
        if (data && data.price) {
            localStorage.setItem('lastGoldFetchTime', Date.now());
            updateUI(data.price);
        } else {
            showBackup();
        }

    } catch (error) {
        console.error("Fetch Gold Error:", error);
        showBackup();
    }
}

// 2. دالة تحديث الواجهة
function updateUI(rawPrice) {
    // حفظ السعر في الذاكرة المحلية للاستخدام لاحقاً بدون إنترنت
    localStorage.setItem('lastGoldPrice', rawPrice);

    const adjustmentFactor = 1.025; // نسبة التحويل المحلي
    const adjustedPrice = rawPrice * adjustmentFactor;

    const p24_base = adjustedPrice / 31.1035;
    const p21_base = p24_base * (21/24);

    const p21_sell = Math.round(p21_base);
    const p21_buy = Math.round(p21_sell * 0.985); // سعر الشراء بخصم 1.5% من سعر البيع

    // منطق التنبيه عند تغير السعر بشكل كبير (أكثر من 50 جنيه)
    const lastNotifiedPrice = localStorage.getItem('lastNotifiedPrice');
    if (lastNotifiedPrice) {
        const oldPrice = parseFloat(lastNotifiedPrice);
        const diff = Math.abs(p21_sell - oldPrice);
        if (diff >= 50) { // حد التنبيه: 50 جنيه
            const direction = p21_sell > oldPrice ? "ارتفاع" : "انخفاض";
            if (typeof sendNotification === 'function') {
                sendNotification("تنبيه أسعار الذهب", `حدث ${direction} في السعر بمقدار ${diff} جنيه. السعر الحالي لعيار 21: ${p21_sell} ج.م`);
            }
            localStorage.setItem('lastNotifiedPrice', p21_sell);
        }
    } else {
        localStorage.setItem('lastNotifiedPrice', p21_sell);
    }

    currentPrice24 = Math.round(p24_base); // تحديث السعر العالمي للحاسبة
    setText('gold21_sell', p21_sell);
    setText('gold21_buy', p21_buy);
    setText('gold24_sell', Math.round(p24_base)); // سعر بيع عيار 24
    setText('gold24_buy', Math.round(p24_base * 0.985)); // سعر شراء عيار 24 بخصم 1.5%
    setText('gold18_sell', Math.round(p24_base * (18/24))); // سعر بيع عيار 18
    setText('gold18_buy', Math.round(p24_base * (18/24) * 0.985)); // سعر شراء عيار 18 بخصم 1.5%
    setText('gold14_sell', Math.round(p24_base * (14/24))); // سعر بيع عيار 14
    setText('gold14_buy', Math.round(p24_base * (14/24) * 0.985)); // سعر شراء عيار 14 بخصم 1.5%

    setText('goldCoinPrice', (p21_sell * 8).toLocaleString() + " جنيه");

    // استدعاء دوال التحديث من ملف bullion.js
    if (typeof updateBullionUI === 'function') updateBullionUI(p24_base);
    if (typeof calculateSmartBullion === 'function') calculateSmartBullion();
}

// 3. دالة إظهار رسالة التنبيه (الحل الذي طلبته)
function showPriceNotice() {
    if (document.getElementById('price-alert')) return;

    const noticeText = "⚠️ تنبيه: الأسعار المعروضة استرشادية وقد تختلف عن سعر السوق الفعلي.";

    // إنشاء عنصر الرسالة برمجياً
    const notice = document.createElement('div');
    notice.innerHTML = `
        <div id="price-alert" style="
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(255, 193, 7, 0.95); color: #000; padding: 12px 20px;
            border-radius: 10px; z-index: 10000; text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-weight: bold;
            width: 80%; max-width: 400px; cursor: pointer; border: 2px solid #b8860b;
        ">
            ${noticeText}
        </div>
    `;
    document.body.appendChild(notice);

    // تختفي الرسالة بعد 6 ثوانٍ أو عند الضغط عليها
    setTimeout(() => {
        const el = document.getElementById('price-alert');
        if(el) el.style.display = 'none';
    }, 6000);

    notice.onclick = () => notice.style.display = 'none';
}

function showBackup() {
    // محاولة استخدام السعر المحفوظ أولاً قبل اللجوء للسعر الافتراضي
    const cachedPrice = localStorage.getItem('lastGoldPrice');
    if (cachedPrice) {
        updateUI(parseFloat(cachedPrice));
    } else {
        // سعر افتراضي في حالة عدم وجود أي بيانات سابقة (حوالي 3850 لعيار 24)
        const fallbackGram24 = 3850;
        updateUI((fallbackGram24 * 31.1035) / 1.025);
    }
}
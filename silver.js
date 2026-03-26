// ===============================
// تحميل سعر الفضة
// ===============================

const SILVER_API_KEY = "goldapi-voxsmn78ual0-io"; 
let currentSilverPrice999 = 0; // تخزين السعر للحاسبات الأخرى

async function loadSilverPrice(forceFetch = false) {
    try {
        // 1. عرض السعر المخزن مؤقتاً لسرعة الاستجابة
        const cachedSilver = localStorage.getItem('lastSilverPrice');
        if (cachedSilver && !forceFetch) {
            updateSilverUI(parseFloat(cachedSilver));
        }

        // 2. التحقق من مرور 15 دقيقة لتوفير الحصة المجانية للـ API
        const lastFetch = localStorage.getItem('lastSilverFetchTime');
        const now = Date.now();
        if (!forceFetch && lastFetch && (now - lastFetch < 15 * 60 * 1000)) return;

        const response = await fetch("https://www.goldapi.io/api/XAG/EGP", {
            headers: { 
                "x-access-token": SILVER_API_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            showSilverBackup();
            return;
        }

        // طباعة الرصيد المتبقي من الطلبات في الكونسول
        const remaining = response.headers.get('x-ratelimit-remaining');
        const limit = response.headers.get('x-ratelimit-limit');
        if (remaining) {
            console.log(`📊 رصيد GoldAPI (الفضة): المتبقي ${remaining} من أصل ${limit} طلب لهذا الشهر`);
        }

        const data = await response.json();
        if (data && data.price) {
            localStorage.setItem('lastSilverFetchTime', Date.now());
            localStorage.setItem('lastSilverPrice', data.price);
            updateSilverUI(data.price);
        } else {
            showSilverBackup();
        }
        
        showSilverPriceNotice();

    } catch (error) {
        console.error("Silver Fetch Error:", error);
        showSilverBackup();
    }
}

function showSilverBackup() {
    // جلب آخر سعر كان محفوظاً أو استخدام سعر افتراضي
    const cachedSilver = localStorage.getItem('lastSilverPrice');
    if (cachedSilver) {
        updateSilverUI(parseFloat(cachedSilver));
    } else {
        const backupPriceOunce = 1555; // حوالي 50 جنيه للجرام
        updateSilverUI(backupPriceOunce);
    }
}

// دالة مساعدة لتحويل السعر وعرضه
function updateSilverUI(priceInEGP) {
    // حفظ السعر الخام في الذاكرة
    localStorage.setItem('lastSilverPrice', priceInEGP);

    // عامل التصحيح للسوق المحلي (تقريباً 3% زيادة عن السعر العالمي لتغطية الشحن والجمارك)
    const localAdjustment = 1.03; 
    const adjustedPrice = priceInEGP * localAdjustment;

    // 1. حساب سعر جرام الفضة النقي عيار 999 (الأساس)
    const gram999_sell = adjustedPrice / 31.1035;
    const gram999_buy = gram999_sell * 0.90; // خصم 10% لسعر شراء الفضة القديمة (متعارف عليه)

    currentSilverPrice999 = gram999_sell;

    // منطق التنبيه عند تغير السعر بشكل كبير (أكثر من 2 جنيه)
    const lastNotifiedSilverPrice = localStorage.getItem('lastNotifiedSilverPrice');
    const threshold = 2; // حد التنبيه بالجنيه

    if (lastNotifiedSilverPrice) {
        const oldPrice = parseFloat(lastNotifiedSilverPrice);
        const diff = Math.abs(gram999_sell - oldPrice);
        if (diff >= threshold) {
            const direction = gram999_sell > oldPrice ? "ارتفاع" : "انخفاض";
            if (typeof sendNotification === 'function') {
                sendNotification("تنبيه أسعار الفضة", `حدث ${direction} في السعر بمقدار ${diff.toFixed(2)} جنيه. السعر الحالي لعيار 999: ${Math.round(gram999_sell)} ج.م`);
            }
            localStorage.setItem('lastNotifiedSilverPrice', gram999_sell);
        }
    } else {
        localStorage.setItem('lastNotifiedSilverPrice', gram999_sell);
    }

    // 2. حساب العيارات المختلفة بناءً على النقاء
    // عيار 999 (فضة نقية)
    setText("silver999_sell", Math.round(gram999_sell));
    setText("silver999_buy", Math.round(gram999_buy));

    // عيار 925 (فضة إسترليني - الأكثر شيوعاً)
    setText("silver925_sell", Math.round(gram999_sell * 0.925));
    setText("silver925_buy", Math.round(gram999_buy * 0.925));

    // عيار 900 (العملات الفضية القديمة)
    setText("silver900_sell", Math.round(gram999_sell * 0.900));
    
    // عيار 800 (الأدوات المنزلية الفضية)
    setText("silver800_sell", Math.round(gram999_sell * 0.800));

    // السعر الرئيسي المعروض في الواجهة (غالباً يكون لعيار 925 في المجوهرات)
    setText("silverPrice", Math.round(gram999_sell * 0.925).toLocaleString() + " ج.م");
}

// دالة إظهار رسالة التنبيه الخاصة بالفضة
function showSilverPriceNotice() {
    // منع تكرار الرسالة إذا كانت موجودة بالفعل
    if (document.getElementById('silver-price-alert')) return;

    const noticeText = "⚠️ تنبيه: أسعار الفضة تقريبية وقد تختلف من محل لآخر.";
    const notice = document.createElement('div');
    notice.innerHTML = `
        <div id="silver-price-alert" style="
            position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
            background: rgba(224, 224, 224, 0.95); color: #000; padding: 12px 20px;
            border-radius: 10px; z-index: 10000; text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); font-weight: bold;
            width: 80%; max-width: 400px; cursor: pointer; border: 2px solid #a0a0a0;
        ">
            ${noticeText}
        </div>
    `;
    document.body.appendChild(notice);

    // تختفي الرسالة بعد 6 ثوانٍ
    setTimeout(() => {
        const el = document.getElementById('silver-price-alert');
        if (el && el.parentElement) el.parentElement.remove();
    }, 6000);

    notice.onclick = () => notice.remove();
}

// التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadSilverPrice);
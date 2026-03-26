// bullion.js - منطق السبائك والحاسبة الذكية

/** تحديث شبكة أسعار السبائك الثابتة */
function updateBullionUI(pricePerGram24) {
    setText('bar10g', Math.round(pricePerGram24 * 10).toLocaleString());
    setText('bar31g', Math.round(pricePerGram24 * 31.1035).toLocaleString());
    setText('bar50g', Math.round(pricePerGram24 * 50).toLocaleString());
    setText('bar100g', Math.round(pricePerGram24 * 100).toLocaleString());
}

/** حاسبة المصنعية والضريبة للسبائك */
function calculateSmartBullion() {
    const weightInput = document.getElementById('bullionWeightInput');
    const weight = parseFloat(weightInput?.value) || 0;
    
    // نستخدم currentPrice24 المعرف في gold.js
    if (weight <= 0 || typeof currentPrice24 === 'undefined' || currentPrice24 <= 0) return;

    let workmanshipPerGram = (weight >= 100) ? 35 : (weight >= 31.1 ? 50 : 65);

    const basePrice = weight * currentPrice24;
    const totalWorkmanship = weight * workmanshipPerGram;
    const vat = totalWorkmanship * 0.14; 
    const finalPrice = basePrice + totalWorkmanship + vat;

    setText('calcBasePrice', Math.round(basePrice).toLocaleString());
    setText('calcWorkmanship', Math.round(totalWorkmanship + vat).toLocaleString() + " ج.م");
    setText('calcTotal', Math.round(finalPrice).toLocaleString());
}

// استماع لمدخلات الحاسبة
window.addEventListener('input', (e) => {
    if (e.target.id === 'bullionWeightInput') calculateSmartBullion();
});
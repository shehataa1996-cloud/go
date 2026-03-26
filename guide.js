// guide.js - إدارة بيانات وعرض دليل محلات الصاغة

function initGuide() {
    const container = document.getElementById('guide-list');
    if (!container) return;

    // عرض رسالة "يتوفر قريباً" بدلاً من قائمة المحلات
    container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
            <i class="fas fa-store-alt-slash" style="font-size: 4rem; color: var(--gold); margin-bottom: 25px; display: block; opacity: 0.5;"></i>
            <h2 style="color: var(--gold); margin-bottom: 15px; font-size: 1.5rem;">يتوفر قريباً دليل الصاغة</h2>
            <p style="color: var(--text-gray); font-size: 0.95rem; line-height: 1.6;">
                نحن نعمل حالياً على توفير قائمة بأفضل محلات الصاغة المعتمدة لتقديم أفضل تجربة شراء لك.
                <br>انتظرونا في التحديثات القادمة!
            </p>
        </div>

        <!-- نموذج أضف محلك -->
        <div class="bullion-calculator" style="margin-top: 20px; border-style: dashed;">
            <h3 style="color: var(--gold); margin-bottom: 15px; text-align: center;">🏪 هل أنت صاحب محل صاغة؟</h3>
            <p style="color: var(--text-gray); font-size: 0.85rem; text-align: center; margin-bottom: 20px;">
                انضم إلى دليلنا وتواصل مع آلاف العملاء المهتمين.
            </p>
            <form id="addShopForm" onsubmit="handleShopSubmit(event)">
                <div class="calc-input-group">
                    <label for="shopName">اسم المحل:</label>
                    <input type="text" id="shopName" placeholder="مثلاً: مجوهرات الأمل" required>
                </div>
                <div class="calc-input-group">
                    <label for="shopArea">المنطقة / المدينة:</label>
                    <input type="text" id="shopArea" placeholder="مثلاً: طنطا - شارع الصاغة" required>
                </div>
                <div class="calc-input-group">
                    <label for="shopPhone">رقم التواصل (واتساب):</label>
                    <input type="tel" id="shopPhone" placeholder="01xxxxxxxxx" required>
                </div>
                <div id="logoPreviewContainer" class="logo-preview-container">
                    <p style="color: var(--text-gray); font-size: 0.75rem; margin-bottom: 8px;">معاينة الشعار:</p>
                    <img id="logoPreview" src="" alt="Preview" class="logo-preview-img">
                </div>
                <div class="calc-input-group">
                    <label for="shopLogo">شعار المحل (Logo):</label>
                    <input type="file" id="shopLogo" accept="image/*" style="padding: 10px; font-size: 0.9rem;">
                </div>
                <button type="submit" class="guide-btn map-btn" style="width: 100%; margin-top: 10px; padding: 15px;">
                    <i class="fab fa-whatsapp"></i> إرسال طلب الانضمام
                </button>
            </form>
        </div>
    `;

    // إضافة مستمع حدث لمعاينة الصورة
    const logoInput = document.getElementById('shopLogo');
    const previewContainer = document.getElementById('logoPreviewContainer');
    const previewImage = document.getElementById('logoPreview');

    if (logoInput) {
        logoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                previewContainer.style.display = 'none';
            }
        });
    }
}

/** معالجة إرسال نموذج المحل عبر واتساب */
async function handleShopSubmit(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    const name = document.getElementById('shopName').value;
    const area = document.getElementById('shopArea').value;
    const phone = document.getElementById('shopPhone').value;
    const logoFile = document.getElementById('shopLogo').files[0];

    try {
        // تغيير حالة الزر أثناء الإرسال
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';

        let logoUrl = "";

        // رفع الصورة إلى Firebase Storage إذا وجدت
        if (logoFile) {
            const storageRef = storage.ref('shop_logos/' + Date.now() + '_' + logoFile.name);
            await storageRef.put(logoFile);
            logoUrl = await storageRef.getDownloadURL();
        }

        // حفظ البيانات في مجموعة "shop_requests" في Firestore
        await db.collection('shop_requests').add({
            shopName: sanitizeHTML(name),
            shopArea: sanitizeHTML(area),
            shopPhone: sanitizeHTML(phone),
            shopLogo: logoUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("✅ تم إرسال طلبك بنجاح! سنتواصل معك قريباً.");
        event.target.reset(); // تفريغ النموذج

    } catch (error) {
        console.error("Error adding document: ", error);
        alert("❌ حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// التأكد من بناء الدليل عند التحميل الأولي إذا كان التبويب نشطاً
document.addEventListener('DOMContentLoaded', initGuide);
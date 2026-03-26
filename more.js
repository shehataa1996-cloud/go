// more.js - إدارة قائمة "المزيد"

/** إنشاء وعرض قائمة المزيد */
function initMoreMenu() {
    const container = document.getElementById('more-menu-list');
    if (!container) return;

    const currentLang = localStorage.getItem('lang') || 'ar';
    const user = auth.currentUser || JSON.parse(localStorage.getItem('loggedInUser'));

    // تعريف العناصر المطلوبة
    const menuItems = [
        { 
            id: 'auth_action', 
            icon: user ? 'fa-user-circle' : 'fa-user-lock', 
            text: user ? 'الملف الشخصي' : 'تسجيل الدخول', 
            action: () => switchTab(user ? 'profile' : 'login') 
        },
        { id: 'currency_list', icon: 'fa-list-ul', text: 'قائمة العملات الكاملة', action: () => switchTab('currency') },
        { id: 'bullion_view', icon: 'fa-cubes', text: 'أسعار السبائك', action: () => switchTab('bullion') },
        { id: 'currency_calc', icon: 'fa-calculator', text: 'محول العملات', action: () => switchTab('currency') },
        { id: 'about', icon: 'fa-info-circle', text: 'عن التطبيق', action: () => alert('eDahab v1.0.0') }
    ];

    container.innerHTML = menuItems.map(item => `
        <div class="more-menu-item" onclick="handleMoreAction('${item.id}')">
            <div class="item-right">
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            </div>
            <i class="fas fa-chevron-left"></i>
        </div>
    `).join('');

    // تخزين الدوال برمجياً لسهولة الاستدعاء
    window.moreActions = menuItems.reduce((acc, item) => {
        acc[item.id] = item.action;
        return acc;
    }, {});
}

/** معالجة الضغط على عنصر في القائمة */
function handleMoreAction(id) {
    if (window.moreActions && window.moreActions[id]) {
        window.moreActions[id]();
    }
}
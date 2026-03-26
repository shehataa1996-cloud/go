// profile.js - إدارة عرض بيانات المستخدم وتسجيل الخروج

/** تهيئة وعرض بيانات الملف الشخصي */
function initProfile() {
    // جلب بيانات المستخدم من Firebase أو الذاكرة المحلية
    const user = auth.currentUser || JSON.parse(localStorage.getItem('loggedInUser'));

    if (user) {
        setText('profile-name', user.displayName);
        setText('profile-email', user.email);
        
        const profileImg = document.getElementById('profile-img');
        if (profileImg) {
            profileImg.src = user.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }
    } else {
        // إذا لم يكن هناك مستخدم، نتوجه لصفحة تسجيل الدخول
        switchTab('login');
    }
}

/** تسجيل الخروج */
function handleLogout() {
    auth.signOut().then(() => {
        localStorage.removeItem('loggedInUser');
        location.reload(); // إعادة التحميل لتحديث الواجهة بالكامل
    }).catch((error) => {
        console.error("Logout Error:", error);
    });
}
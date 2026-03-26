const CACHE_NAME = 'edahab-v2';
const ASSETS = [
  'index.html',
  'offline.html',
  'style.css',
  'main.js',
  'utils.js',
  'manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn-icons-png.flaticon.com/512/2906/2906231.png'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// استراتيجية الاستجابة: حاول جلب البيانات من الشبكة أولاً، وإذا فشلت (بدون إنترنت) استخدم التخزين المؤقت
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('offline.html');
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => response || fetch(event.request))
    );
  }
});

// تفعيل الـ Service Worker وتحديث التخزين
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME)
                  .map(cache => caches.delete(cache))
      );
    }).then(() => self.clients.claim())
  );
});
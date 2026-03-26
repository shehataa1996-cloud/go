// news.js - جلب وعرض الأخبار الاقتصادية

let currentNews = []; // تخزين الأخبار الحالية للوصول إليها عند الضغط

const NEWS_SOURCES = [
    {
        name: "سكاي نيوز عربية",
        rssUrl: "https://www.skynewsarabia.com/web/rss/section/7.xml", // رابط قسم الاقتصاد
        logo: "https://www.skynewsarabia.com/favicon.ico",
        category: "اقتصاد"
    },
    {
        name: "العربية نت",
        rssUrl: "https://www.alarabiya.net/rss/economy.xml", // رابط قسم الاقتصاد
        logo: "https://www.alarabiya.net/favicon.ico",
        category: "اقتصاد"
    }
    // يمكنك إضافة المزيد من المصادر هنا
];

async function fetchEconomicNews(forceFetch = false) {
    const newsContainer = document.getElementById('news-list');
    if (!newsContainer) return;

    if (forceFetch) newsContainer.innerHTML = '<p style="text-align:center; padding:20px; color:var(--gold);">🔄 جاري تحديث الأخبار...</p>';

    try {
        // 1. محاولة جلب الأخبار المخزنة مؤقتاً لسرعة العرض الفورية
        const cachedNews = localStorage.getItem('lastNewsData');
        if (cachedNews) {
            currentNews = JSON.parse(cachedNews);
            displayNews(currentNews);
        }

        // 2. منع كثرة الطلبات (طلب كل 30 دقيقة للأخبار) لتوفير البيانات
        const lastFetch = localStorage.getItem('lastNewsFetchTime');
        const now = Date.now();
        if (!forceFetch && lastFetch && (now - lastFetch < 30 * 60 * 1000)) return;

        console.log("🔄 جلب الأخبار الاقتصادية لايف...");
        
        let fetchedNewsItems = [];
        let successfulFetches = 0;

        for (const source of NEWS_SOURCES) {
            try {
                // استخدام محول RSS إلى JSON
                const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rssUrl)}`;
                
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    console.warn(`⚠️ فشل جلب الأخبار من ${source.name}: سيرفر الأخبار استجاب بخطأ: ${response.status}`);
                    continue; // حاول المصدر التالي
                }

                const data = await response.json();

                if (data && data.status === 'ok' && data.items.length > 0) {
                    const sourceNews = data.items.map(item => {
                        // تنظيف الوصف من أي وسوم HTML قد تأتي من المصدر
                        const cleanDesc = item.description.replace(/<[^>]*>/g, '').substring(0, 250) + "...";
                        
                        return {
                            category: source.category,
                            title: item.title,
                            description: cleanDesc,
                            time: new Date(item.pubDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                            pubDate: item.pubDate, // تخزين تاريخ النشر للترتيب
                            link: item.link,
                            source: source.name,
                            sourceLogo: source.logo
                        };
                    });
                    fetchedNewsItems = fetchedNewsItems.concat(sourceNews);
                    successfulFetches++;
                } else {
                    console.warn(`⚠️ لم يتم استلام أخبار صالحة من ${source.name}`);
                }
            } catch (sourceError) {
                console.error(`خطأ أثناء جلب الأخبار من ${source.name}:`, sourceError);
            }
        }

        if (fetchedNewsItems.length > 0) {
            // ترتيب الأخبار حسب تاريخ النشر (الأحدث أولاً)
            fetchedNewsItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            currentNews = fetchedNewsItems;

            // حفظ البيانات في الذاكرة المحلية
            localStorage.setItem('lastNewsData', JSON.stringify(currentNews));
            localStorage.setItem('lastNewsFetchTime', Date.now());

            displayNews(currentNews);
        } else {
            console.warn("⚠️ لم يتم استلام أخبار من المصدر");
            showNewsBackup();
        }
    } catch (error) {
        console.error("خطأ في جلب الأخبار الحقيقية:", error);
        showNewsBackup();
    }
}

function showNewsBackup() {
    const cached = localStorage.getItem('lastNewsData');
    if (cached) {
        currentNews = JSON.parse(cached);
        displayNews(currentNews);
    } else {
        document.getElementById('news-list').innerHTML = '<p style="text-align:center; padding:20px; color:var(--text-gray);">يرجى التأكد من الاتصال بالإنترنت لتحديث الأخبار.</p>';
    }
}

function displayNews(newsArray) {
    const container = document.getElementById('news-list');
    if (!container || !newsArray.length) return;

    container.innerHTML = newsArray.map((item, index) => `
        <div class="news-item" onclick="viewNewsDetail(${index})" style="
            padding: 15px; 
            border-bottom: 1px solid #333; 
            display: flex; 
            align-items: flex-start; 
            gap: 12px;
            background: var(--card-bg);
            margin-bottom: 5px;
            cursor: pointer;
            transition: 0.3s;
        ">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 50px;">
                <img src="${item.sourceLogo}" alt="logo" style="width: 28px; height: 28px; border-radius: 5px; border: 1px solid #444;">
                <span style="font-size: 0.55rem; color: var(--text-gray); text-align: center; line-height: 1.2;">${sanitizeHTML(item.source)}</span>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <div style="display: flex; gap: 5px; align-items: center;">
                        <span style="background: #8a6d3b; color: #fff; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">
                            ${sanitizeHTML(item.category)}
                        </span>
                    </div>
                    <span style="color: #888; font-size: 0.7rem;">${sanitizeHTML(item.time)}</span>
                </div>
                <h4 style="color: var(--text-main); font-size: 0.95rem; line-height: 1.4;">${sanitizeHTML(item.title)}</h4>
            </div>
        </div>
    `).join('');
}

/** فتح نافذة تفاصيل الخبر */
function viewNewsDetail(index) {
    const item = currentNews[index];
    if (!item) return;

    setText('modalTitle', sanitizeHTML(item.title));
    setText('modalDesc', sanitizeHTML(item.description));
    setText('modalCategory', sanitizeHTML(item.category));
    setText('modalTime', sanitizeHTML(item.time));
    
    // إضافة رابط "اقرأ المزيد" للمصدر الأصلي إذا أردت
    document.getElementById('newsModal').classList.add('active');
}

/** إغلاق نافذة الأخبار */
function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('active');
}

// تشغيل الأخبار عند التحميل
document.addEventListener('DOMContentLoaded', fetchEconomicNews);
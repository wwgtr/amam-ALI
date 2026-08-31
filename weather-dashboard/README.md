# لوحة الطقس (Glass Weather)

هذه نسخة من لوحة طقس مصممة بنمط Glassmorphism، باللغة العربية، تستخدم بيانات Open‑Meteo (بدون مفتاح API).

المزايا
- بحث عن المدن (Geocoding عبر Open‑Meteo)
- عرض الطقس الحالي (Current weather)
- توقعات 7 أيام
- تبديل الوحدات ℃ / ℉
- حفظ صورة عالية الجودة للمشهد باستخدام html2canvas
- تصميم متوافق مع الشاشات والـ RTL وتحسينات وصول (ARIA)

كيفية الاختبار محلياً
1. استنخِب المستودع أو نزّل الفرع `weather-dashboard`.
2. افتح سطر الأوامر في مجلد المشروع ثم شغّل خادم ملفات ثابت، مثلاً:
   - Python 3: `python -m http.server 8000`
   - أو: `npx serve .`
3. افتح المتصفح على: `http://localhost:8000/weather-dashboard/index.html` (أو المسار الذي يتناسب إذا فتحت من داخل المجلد).

نشر على GitHub Pages
1. اذهب إلى صفحة المستودع على GitHub.
2. Settings → Pages.
3. Source: اختر Branch = `weather-dashboard` وFolder = `/ (root)` ثم اضغط Save.
4. انتظر قليلاً ثم ستحصل على رابط النشر (مثال: `https://wwgtr.github.io/amam-AL/`).

اقتراحات تحسين إضافية
- دمج هذه الواجهة مع مشروع الأقوال (amam-AL) على صفحة رئيسية تتيح التنقل بين المحتويات.  
- إضافة أيقونات طقس رسومية من OpenWeatherMap أو Weather Icons (يتطلب API أو حزمة أيقونات).  
- إضافة مخطط للساعات (Chart.js) لتفصيل توقع الساعات.  

ملف القائم الآن: `weather-dashboard/` يحتوي على `index.html`, `style.css`, `app.js`.

إذا أردت أستطيع:
- تفعيل GitHub Pages نيابة عنك (لا يدعم الأداة الحالية تغيير إعدادات Pages، لذا سأرشدك أو ترسل لي إذن أوسع).  
- دمج الفرع إلى `main` عبر Pull Request أو دمج مباشر.  
- تحسين الحفظ أو إضافة مشاركة مباشرة إلى Telegram/WhatsApp.

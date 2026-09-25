# MOWAKAL

منصة عربية للخدمات القانونية تربط العملاء بمحامين موثوقين، وتقدم مساحات عمل منفصلة للعميل والمحامي ومدير المنصة.

## المرحلة الحالية

واجهة أمامية عربية بالكامل باتجاه RTL، مبنية كنموذج جامعي قابل للشرح والتطوير.

## التقنيات

- HTML5
- CSS3
- Vanilla JavaScript
- خط Thmanyah Sans محلي

## البنية المخطط لها

المتصفح ← واجهة خلفية API ← MySQL

الواجهة الحالية لا تتصل بقاعدة بيانات مباشرة، وتستخدم بيانات تجريبية منظمة يمكن استبدالها لاحقًا بطلبات API.

## الأدوار

- العميل
- المحامي
- مدير المنصة

## أهم الصفحات

- `frontend/index.html` الصفحة الرئيسية
- `frontend/login.html` تسجيل الدخول التجريبي
- `frontend/register.html` إنشاء الحساب
- `frontend/client/lawyers.html` دليل المحامين
- `frontend/client/lawyer-profile.html` ملف المحامي وطلب الاستشارة
- `frontend/client/dashboard.html` لوحة العميل
- `frontend/client/consultations.html` استشارات العميل
- `frontend/lawyer/dashboard.html` لوحة المحامي
- `frontend/lawyer/cases.html` القضايا
- `frontend/lawyer/clients.html` العملاء
- `frontend/lawyer/documents.html` المستندات
- `frontend/lawyer/calendar.html` التقويم
- `frontend/admin/dashboard.html` لوحة الإدارة

## التشغيل محليًا

من مجلد المشروع شغّل خادمًا محليًا بسيطًا:

```powershell
python -m http.server 4173 --directory frontend
```

ثم افتح:

`http://localhost:4173/`

## تنظيم الملفات

- `frontend/css/` متغيرات التصميم، الأنماط العامة، المكونات، الصفحات العامة ولوحات التحكم.
- `frontend/js/` البيانات التجريبية، التنقل، مكونات الواجهة، منطق الأدلة والاستشارات ولوحات التحكم.
- `frontend/assets/fonts/` أوزان الخط العربي المحلي.
- `backend/` محجوز للواجهة الخلفية المستقبلية.
- `database/` محجوز لمخططات وقواعد البيانات المستقبلية.
- `docs/` محجوز للتوثيق.

## القيود الحالية

- البيانات تجريبية فقط.
- لا توجد مصادقة حقيقية.
- لا توجد قاعدة بيانات أو واجهة خلفية.
- لا يتم حفظ الملفات أو طلبات الاستشارة فعليًا.
- أزرار الأقسام المستقبلية تعرض حالات توضيحية آمنة بدل روابط مكسورة.

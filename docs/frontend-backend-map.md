# خريطة تسليم الواجهة إلى الباكند

هذا المستند يوضح نقاط الربط المتوقعة بين صفحات MOWAKAL وواجهة API مستقبلية. لا توجد اتصالات API فعلية في النسخة الحالية.

| صفحة الواجهة | الإجراء | مصدر المحاكاة | API مستقبلية | HTTP | الكيان |
|---|---|---|---|---|---|
| client/services.html | تحميل كتالوج الخدمات | services | /api/services | GET | LegalService |
| client/new-request.html | إنشاء طلب خدمة | بيانات النموذج | /api/requests | POST | ServiceRequest |
| client/requests.html | تحميل طلبات العميل | requests | /api/requests?clientId=... | GET | ServiceRequest |
| client/request-details.html | عرض تفاصيل الطلب | requests | /api/requests/:id | GET | ServiceRequest |
| lawyer/request-details.html | قبول أو رفض الطلب | حالة محاكاة | /api/requests/:id/status | PATCH | ServiceRequest |
| client/consultations.html | عرض الاستشارات | consultations | /api/consultations?clientId=... | GET | Consultation |
| client/cases.html | عرض القضايا | cases | /api/cases?clientId=... | GET | Case |
| client/documents.html | عرض بيانات المستندات | documents | /api/documents?ownerId=... | GET | Document |
| client/messages.html | تحميل وإرسال رسالة | messages | /api/conversations و /api/messages | GET/POST | Message |
| client/payments.html | عرض الفواتير | payments | /api/payments?clientId=... | GET | Payment |
| admin/lawyer-verifications.html | قائمة طلبات التوثيق | verifications | /api/admin/verifications | GET | LawyerVerification |
| admin/verification-details.html | اعتماد أو رفض محامٍ | حالة محاكاة | /api/admin/verifications/:id | PATCH | LawyerVerification |
| admin/services.html | تفعيل أو تعطيل خدمة | services | /api/admin/services/:id | PATCH | LegalService |
| admin/activity.html | عرض سجل الأنشطة | activities | /api/admin/activity | GET | ActivityEvent |

## ملاحظات التكامل

- يرسل المتصفح الطلبات إلى Backend API فقط؛ لا يوجد اتصال مباشر بقاعدة MySQL.
- معرفات الكيانات مستقرة في بيانات المحاكاة لتسهيل استبدال مصدر البيانات.
- يجب تطبيق المصادقة والصلاحيات والتحقق من الملكية في الباكند، وليس الاعتماد على إخفاء عناصر الواجهة.
- رفع الملفات الحقيقي، المدفوعات، الرسائل الفورية، والإشعارات خارج نطاق هذه النسخة.

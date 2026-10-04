(function () {
  const d = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;
  const live = () => Boolean(window.MOWAKAL_API?.enabled);
  const api = () => window.MOWAKAL_API;
  const e = ui.escapeHtml;
  const pre = () => document.body.dataset.pathPrefix || "../";
  const href = (value) => pre() + value;
  const root = () => document.querySelector("[data-app-root]");
  const qp = (key, fallback) => new URLSearchParams(location.search).get(key) || fallback;
  const find = (list, id) => list.find((item) => item.id === id);
  const service = (id) => find(d.services, id);
  const lawyer = (id) => find(d.lawyers, id);
  const client = (id) => find(d.clients, id);
  const request = (id) => find(d.requests, id);
  const caseFile = (id) => find(d.cases, id);
  const serviceName = (id) => service(id)?.name || "خدمة قانونية";
  const lawyerName = (id) => lawyer(id)?.name || "بانتظار التعيين";
  const clientName = (id) => client(id)?.name || "عميل المنصة";
  const pageLink = (area, page, id) => href(area + "/" + page + (id ? "?id=" + encodeURIComponent(id) : ""));
  const avatar = (initials) => '<span class="avatar avatar--sm avatar--light">' + e(initials || "م") + '</span>';
  const person = (name, sub, initials) => '<div class="person-cell">' + avatar(initials) + '<div><strong>' + e(name) + '</strong><span>' + e(sub) + '</span></div></div>';
  const empty = (title, text) => '<div class="empty-state"><span class="empty-state__icon">□</span><h3>' + e(title || "لا توجد بيانات") + '</h3><p>' + e(text || "ستظهر البيانات هنا عند توفرها.") + '</p></div>';
  const roleMeta = {
    client: { label: "مساحة العميل", user: "سلمان العبدالله", role: "عميل", profile: "client/profile.html" },
    lawyer: { label: "مساحة المحامي", user: "د. نورة العتيبي", role: "محامية مرخصة", profile: "lawyer/profile.html" },
    admin: { label: "إدارة المنصة", user: "مشرف MOWAKAL", role: "مدير النظام", profile: "admin/settings.html" }
  };
  const dashboardHeader = () => {
    const meta = roleMeta[document.body.dataset.role] || roleMeta.client;
    const name = live() ? api().user?.name || meta.user : meta.user;
    return '<header class="dashboard-topbar"><div class="topbar-context"><span class="topbar-breadcrumb">MOWAKAL <b>/</b> ' + e(meta.label) + '</span><strong>مساحة العمل</strong></div><div class="topbar-actions"><label class="topbar-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="ابحث في مساحة العمل" aria-label="بحث عام"></label><a class="topbar-user" href="' + href(meta.profile) + '" aria-label="فتح الملف الشخصي">' + avatar(name.slice(0, 2)) + '<span><strong>' + e(name) + '</strong><small>' + e(meta.role) + '</small></span><span class="topbar-user__chevron" aria-hidden="true">⌄</span></a></div></header>';
  };
  const heading = (title, text, action) => '<div class="page-heading"><div><span class="eyebrow">مساحة العمل</span><h1>' + e(title) + '</h1><p>' + e(text) + '</p></div><div class="page-heading__actions">' + (action || "") + '</div></div>';
  const button = (text, path, cls) => path ? '<a class="' + (cls || "button button--primary") + '" href="' + path + '">' + e(text) + '</a>' : '<button class="' + (cls || "button button--primary") + '" type="button">' + e(text) + '</button>';
  const header = (title, text, action) => '<div class="card-header"><div><h2>' + e(title) + '</h2><p>' + e(text) + '</p></div>' + (action || "") + '</div>';
  const stat = (label, value, hint, tone) => '<article class="card stat-card stat-card--' + (tone || "gold") + '"><span class="stat-card__label">' + e(label) + '</span><strong class="stat-card__value">' + e(value) + '</strong><span class="stat-card__hint">' + e(hint) + '</span></article>';
  const stats = (items) => '<section class="stats-grid">' + items.map((item) => stat(item[0], item[1], item[2], item[3])).join("") + '</section>';
  const tabs = (items) => '<div class="filter-tabs">' + items.map((item, i) => '<button type="button" class="filter-tab ' + (i === 0 ? "is-active" : "") + '" data-filter="' + item[0] + '">' + item[1] + '</button>').join("") + '</div>';
  const toolbar = (action) => '<div class="toolbar"><label class="search-field"><span>⌕</span><input type="search" data-search placeholder="ابحث في السجلات"></label>' + (action || "") + '</div>';
  const info = (items) => '<div class="detail-grid">' + items.map((item) => '<div class="detail-item"><span>' + e(item[0]) + '</span><strong>' + (item[2] ? item[1] : e(item[1])) + '</strong></div>').join("") + '</div>';
  const set = (html) => { root().innerHTML = html; };
  const wrap = (title, text, body, action) => set(dashboardHeader() + heading(title, text, action) + body);

  function usersPage() {
    wrap("المستخدمون", "إدارة حالة الحسابات حسب الدور، من دون عرض بيانات التواصل أو الملف القانوني.", '<section class="card card--padded"><div class="directory-summary"><div><strong data-user-count>٥ حسابات</strong><span>تظهر معرّفات الحساب والدور والحالة فقط.</span></div></div>' + tabs([["all", "كل الحسابات"], ["client", "العملاء"], ["lawyer", "المحامون"], ["admin", "مديرو المنصة"]]) + toolbar('<select class="filter-select" data-user-status><option value="">كل الحالات</option><option value="نشط">نشط</option><option value="موقوف">موقوف</option></select>') + '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>معرّف الحساب</th><th>الدور</th><th>الحالة</th></tr></thead><tbody data-users-table></tbody></table></div></section>');
    const target = document.querySelector("[data-users-table]");
    const search = document.querySelector("[data-search]");
    const status = document.querySelector("[data-user-status]");
    const count = document.querySelector("[data-user-count]");
    const filterButtons = document.querySelectorAll("[data-filter]");
    let roleFilter = "all";
    const roleKey = (role) => role === "عميل" ? "client" : role === "محامٍ" ? "lawyer" : "admin";
    const draw = () => {
      const query = search.value.trim().toLowerCase();
      const list = d.users.filter((item) => {
        const searchable = [item.id, item.role].join(" ").toLowerCase();
        return (roleFilter === "all" || roleKey(item.role) === roleFilter) && (!status.value || item.status === status.value) && (!query || searchable.includes(query));
      });
      count.textContent = list.length + " مستخدمين";
      target.innerHTML = list.length ? list.map((item) => '<tr><td><strong>' + e(item.id) + '</strong></td><td>' + e(item.role) + '</td><td>' + e(item.status) + '</td></tr>').join("") : '<tr><td colspan="3">' + empty("لا توجد نتائج", "جرّب تغيير الفلتر أو عبارة البحث.") + '</td></tr>';
    };
    filterButtons.forEach((buttonEl) => buttonEl.addEventListener("click", () => { filterButtons.forEach((item) => item.classList.remove("is-active")); buttonEl.classList.add("is-active"); roleFilter = buttonEl.dataset.filter; draw(); }));
    search.addEventListener("input", draw);
    status.addEventListener("change", draw);
    draw();
  }

  function adminDashboard() {
    const lawyerCount = d.users.filter((item) => item.role === "محامٍ").length;
    const activeServices = d.services.filter((item) => item.active).length;
    const overview = stats([["حسابات المنصة", String(live() ? d.adminStats.totalUsers : d.users.length), "معرّفات وأدوار فقط", "gold"], ["المحامون الموثقون", String(live() ? d.adminStats.verifiedLawyers : lawyerCount), "عدد إجمالي", "success"], ["الخدمات المتاحة", String(activeServices), "كتالوج عام", "info"], ["أحداث التدقيق", String(d.activities.length), "آخر ١٠٠ حدث", "warning"]]);
    const actions = '<section class="card card--padded"><div class="card-header"><div><h2>إجراءات المنصة</h2><p>إدارة الجوانب العامة من دون فتح محتوى علاقة المحامي بالعميل.</p></div></div><div class="quick-actions">' +
      '<a class="quick-action" href="' + href("admin/users.html") + '"><span>إدارة الحسابات الأساسية</span><span>←</span></a>' +
      '<a class="quick-action" href="' + href("admin/services.html") + '"><span>إدارة الخدمات</span><span>←</span></a>' +
      '<a class="quick-action" href="' + href("admin/reports.html") + '"><span>عرض التقارير المجمّعة</span><span>←</span></a></div></section>';
    const privacyNote = '<section class="card card--padded"><div class="card-header"><div><h2>نطاق لوحة الإدارة</h2><p>لا تعرض هذه المساحة الرسائل أو تفاصيل القضايا أو المستندات أو بيانات الدفع الشخصية.</p></div><span class="badge badge--success">بيانات محدودة</span></div><p class="field-help">' + (live() ? 'تُفرض الصلاحيات وقيود الخصوصية من الخادم.' : 'هذه واجهة ثابتة بلا مصادقة أو خادم؛ لا تربط بها بيانات مستخدمين حقيقية قبل تطبيق الصلاحيات في الـ API.') + '</p></section>';
    wrap("لوحة إدارة المنصة", "مؤشرات عامة ومجمّعة لإدارة إعدادات المنصة وخدماتها.", overview + '<div class="dashboard-grid dashboard-grid--equal">' + actions + privacyNote + '</div>');
  }

  function dashboard(role) {
    if (role === "admin") { adminDashboard(); return; }
    const area = role === "lawyer" ? "lawyer" : role === "admin" ? "admin" : "client";
    const title = role === "lawyer" ? "لوحة المحامي" : role === "admin" ? "لوحة إدارة المنصة" : "لوحة العميل";
    const text = role === "lawyer" ? "اعرف ما يحتاج انتباهك وأدر ملفات عملائك بكفاءة." : role === "admin" ? "تابع مؤشرات التشغيل والطلبات التي تحتاج مراجعة إدارية." : "تابع طلباتك وخطواتك القانونية من مكان واحد.";
    const quick = role === "client" ? [["طلب خدمة جديدة", "client/new-request.html"], ["الخدمات القانونية", "client/services.html"], ["المستندات", "client/documents.html"], ["القضايا", "client/cases.html"]] : role === "lawyer" ? [["مراجعة الطلبات", "lawyer/requests.html"], ["إضافة قضية", "lawyer/cases.html"], ["العملاء", "lawyer/clients.html"], ["فتح التقويم", "lawyer/calendar.html"]] : [["توثيق المحامين", "admin/lawyer-verifications.html"], ["إدارة الطلبات", "admin/requests.html"], ["المستخدمون", "admin/users.html"], ["التقارير", "admin/reports.html"]];
    const requests = d.requests.slice(0, 3).map((item) => '<a class="request-list__item" href="' + pageLink(area, "request-details.html", item.id) + '"><div><strong>' + e(item.title) + '</strong><span>' + e(role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId)) + ' · ' + e(serviceName(item.serviceId)) + '</span></div>' + ui.statusBadge(item.status) + '</a>').join("");
    const activities = live() ? '<li class="activity-item">تظهر تحديثات طلباتك في صفحة الطلبات.</li>' : d.activities.slice(0, 5).map((item) => '<li class="activity-item"><span class="activity-dot activity-dot--info">•</span><div class="activity-item__body"><strong>' + e(item.event) + '</strong><span>' + e(item.actor) + ' · ' + e(item.timestamp) + '</span></div></li>').join("");
    wrap(title, text, '<div class="dashboard-grid dashboard-grid--main"><div class="dashboard-stack"><section class="card card--padded">' + header(role === "admin" ? "طلبات تحتاج مراجعة" : role === "lawyer" ? "طلبات تحتاج قرارًا" : "آخر الطلبات", "أهم الملفات التي تحتاج متابعتك.", button("عرض الكل", href(area + "/requests.html"), "button button--ghost button--small")) + '<div class="request-list">' + requests + '</div></section><section class="card card--padded">' + header("المواعيد القادمة", "الاجتماعات والتسليمات القريبة.") + '<div class="appointment-list">' + d.appointments.slice(0, 3).map((item) => '<div class="appointment-item"><span class="appointment-item__date">' + e(item.date.slice(5).replace("-", "/")) + '<strong>' + e(item.time) + '</strong></span><div><strong>' + e(item.title) + '</strong><span>' + e(role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId)) + '</span></div>' + ui.statusBadge(item.status) + '</div>').join("") + '</div></section></div><div class="dashboard-stack"><section class="card card--padded">' + header("إجراءات سريعة", "اختصر خطوات العمل اليومية.") + '<div class="quick-actions">' + quick.map((item) => '<a class="quick-action" href="' + href(item[1]) + '"><span>' + e(item[0]) + '</span><span>←</span></a>').join("") + '</div></section><section class="card card--padded">' + header("آخر الأنشطة", "سجل مختصر للحركة الأخيرة.") + '<ul class="activity-list">' + activities + '</ul></section></div></div>');
    root().querySelector(".page-heading").insertAdjacentHTML("afterend", stats(live() ? [["إجمالي الطلبات", String(d.requests.length), "المرتبطة بحسابك", "gold"], ["طلبات قيد الإجراء", String(d.requests.filter((item) => !["completed", "rejected"].includes(item.status)).length), "تحتاج متابعة", "info"], ["المواعيد", String(d.appointments.length), "المرتبطة بطلباتك", "success"]] : role === "client" ? [["الطلبات النشطة", "٣", "تحتاج متابعة", "gold"], ["الاستشارات القادمة", "٢", "هذا الأسبوع", "info"], ["القضايا النشطة", "٢", "تحت الإجراء", "success"], ["المدفوعات المعلقة", "١", "تحتاج مراجعة", "warning"]] : [["طلبات جديدة", "٢", "تحتاج قرارًا", "warning"], ["القضايا النشطة", "٢", "قيد المتابعة", "success"], ["الاستشارات القادمة", "٢", "هذا الأسبوع", "info"], ["إجمالي الأعمال", "٧", "ملفات نشطة ومغلقة", "gold"]]));
  }

  function services() {
    wrap("الخدمات القانونية", "اختر الخدمة المناسبة وابدأ طلبك بخطوات واضحة.", '<section class="card card--padded">' + toolbar('<select class="filter-select" data-category><option value="">كل المجالات</option>' + [...new Set(d.services.map((item) => item.category))].map((item) => '<option>' + e(item) + '</option>').join("") + '</select>') + '<div class="service-grid" data-service-grid></div></section>');
    const target = document.querySelector("[data-service-grid]"), search = document.querySelector("[data-search]"), category = document.querySelector("[data-category]");
    const draw = () => { const q = search.value.toLowerCase(); const list = d.services.filter((item) => item.active && (!category.value || category.value === item.category) && (!q || (item.name + item.description).toLowerCase().includes(q))); target.innerHTML = list.length ? list.map((item) => '<article class="card service-card"><div class="service-card__icon">' + e(item.icon) + '</div><span class="badge badge--neutral">' + e(item.category) + '</span><h3>' + e(item.name) + '</h3><p>' + e(item.description) + '</p><div class="service-card__footer"><span>' + e(item.type) + '</span>' + button("طلب الخدمة", href("client/new-request.html?service=" + item.id), "button button--primary button--small") + '</div></article>').join("") : empty("لا توجد خدمات مطابقة", "جرّب تعديل البحث أو المجال."); };
    search.addEventListener("input", draw); category.addEventListener("change", draw); draw();
  }

  function requestsPage(role) {
    const area = role === "lawyer" ? "lawyer" : role === "admin" ? "admin" : "client";
    wrap(role === "client" ? "طلباتي" : role === "lawyer" ? "طلبات العملاء" : "إدارة الطلبات", "تابع دورة الطلبات القانونية من منظور واضح.", '<section class="card card--padded">' + tabs([["all", "الكل"], ["under_review", "قيد المراجعة"], ["waiting_lawyer", "بانتظار المحامي"], ["accepted", "مقبول"], ["in_progress", "قيد التنفيذ"], ["completed", "مكتمل"], ["rejected", "مرفوض"]]) + toolbar() + '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>رقم الطلب</th><th>الخدمة</th><th>' + (role === "client" ? "المحامي" : "العميل") + '</th><th>المدينة</th><th>الحالة</th><th>آخر تحديث</th><th>الإجراء</th></tr></thead><tbody data-request-table></tbody></table></div></section>');
    const target = document.querySelector("[data-request-table]"), search = document.querySelector("[data-search]"), buttons = document.querySelectorAll("[data-filter]"); let selected = "all";
    const draw = () => { const list = d.requests.filter((item) => (selected === "all" || item.status === selected) && (!search.value || (item.id + item.title + serviceName(item.serviceId)).toLowerCase().includes(search.value.toLowerCase()))); target.innerHTML = list.length ? list.map((item) => '<tr><td><a class="table-link" href="' + pageLink(area, "request-details.html", item.id) + '">' + e(item.id) + '</a></td><td><strong>' + e(item.title) + '</strong><span class="table-subtext">' + e(serviceName(item.serviceId)) + '</span></td><td>' + e(role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId)) + '</td><td>' + e(item.city) + '</td><td>' + ui.statusBadge(item.status) + '</td><td>' + e(item.updatedAt) + '</td><td>' + button("التفاصيل", pageLink(area, "request-details.html", item.id), "button button--ghost button--small") + '</td></tr>').join("") : '<tr><td colspan="7">' + empty("لا توجد طلبات", "ستظهر الطلبات هنا عند توفرها.") + '</td></tr>'; };
    buttons.forEach((item) => item.addEventListener("click", () => { buttons.forEach((buttonEl) => buttonEl.classList.remove("is-active")); item.classList.add("is-active"); selected = item.dataset.filter; draw(); })); search.addEventListener("input", draw); draw();
  }

  function requestDetails(role) {
    const item = request(qp("id", "REQ-1001")); if (!item) { wrap("الطلب غير موجود", "تعذر العثور على الطلب المطلوب.", '<section class="card card--padded">' + empty("لم يتم العثور على الطلب", "تحقق من الرقم ثم حاول مرة أخرى.") + '</section>'); return; }
    const area = role === "lawyer" ? "lawyer" : role === "admin" ? "admin" : "client";
    const actions = live() ? { waiting_lawyer: [["accepted", "قبول الطلب"], ["under_review", "طلب معلومات إضافية"], ["rejected", "رفض الطلب"]], under_review: [["accepted", "قبول الطلب"], ["rejected", "رفض الطلب"]], accepted: [["in_progress", "بدء التنفيذ"]], in_progress: [["completed", "إكمال الطلب"]] }[item.status] || [] : [["accepted", "قبول الطلب"], ["under_review", "طلب معلومات إضافية"], ["rejected", "رفض الطلب"]];
    const action = role === "lawyer" ? actions.map(([status, label]) => '<button class="button button--outline" data-request-action="' + status + '">' + label + '</button>').join("") : item.lawyerId ? button("مراسلة الطرف المرتبط", href(area + "/messages.html"), "button button--primary") : "";
    wrap("تفاصيل الطلب", item.id + " · " + item.title, "ملخص الطلب والمستندات والمسار التشغيلي.", action);
    const stepNames = { created: "تم إنشاء الطلب", submitted: "تم إرسال الطلب", waiting_lawyer: "بانتظار قرار المحامي", under_review: "بانتظار معلومات إضافية", reviewed: "تمت مراجعة البيانات", assigned: "تم تعيين المحامي", accepted: "تم قبول الطلب", in_progress: "بدأ تنفيذ الخدمة", completed: "تم إغلاق الطلب", rejected: "لم يُقبل الطلب" }; const current = item.timeline[item.timeline.length - 1];
    root().insertAdjacentHTML("beforeend", '<div class="detail-layout"><div class="detail-main"><section class="card card--padded">' + header("ملخص الطلب", "المعلومات الأساسية المقدمة عند إنشاء الطلب.") + info([["الخدمة", serviceName(item.serviceId)], ["العنوان", item.title], ["الوصف", item.description], ["الأولوية", item.urgency], ["المدينة", item.city], ["تاريخ الإنشاء", item.createdAt], ["الحالة", ui.statusBadge(item.status), true]]) + '</section><section class="card card--padded">' + header("المستندات", "بيانات المستندات المرتبطة بالطلب.") + (item.documentIds.length ? item.documentIds.map((docId) => { const doc = find(d.documents, docId); return '<div class="mini-list__item"><span>□</span><div><strong>' + e(doc?.name) + '</strong><small>' + e(doc?.type) + ' · ' + e(doc?.status) + '</small></div></div>'; }).join("") : empty("لا توجد مستندات")) + '</section></div><aside class="detail-side"><section class="card card--padded">' + header("مسار الطلب", "التحديثات الرئيسية منذ الإرسال.") + '<ol class="timeline">' + item.timeline.map((step, index) => '<li class="timeline__item ' + (step === current ? "is-current" : "is-complete") + '"><span class="timeline__marker">' + (step === current ? index + 1 : "✓") + '</span><div><strong>' + e(stepNames[step]) + '</strong><span>' + (step === current ? "المرحلة الحالية" : "اكتملت") + '</span></div></li>').join("") + '</ol></section><section class="card card--padded">' + header(role === "client" ? "المحامي المعين" : "العميل", "الطرف المرتبط بالطلب.") + person(role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId), role === "client" ? "محامٍ مرخص" : "صاحب الطلب", role === "client" ? lawyer(item.lawyerId)?.initials : client(item.clientId)?.initials) + '</section></aside></div>');
    root().addEventListener("click", async (event) => { const actionEl = event.target.closest("[data-request-action]"); if (!actionEl) return; actionEl.disabled = true; try { if (live()) { const result = await api().request("/api/requests/" + encodeURIComponent(item.id) + "/status", { method: "PATCH", authenticated: true, body: { status: actionEl.dataset.requestAction } }); item.status = result.requestStatus; } else item.status = actionEl.dataset.requestAction; ui.showToast("تم تحديث حالة الطلب بنجاح.", item.status === "rejected" ? "danger" : "success"); if (live()) location.reload(); } catch (error) { ui.showToast(error.message, "danger"); } finally { actionEl.disabled = false; } });
  }

  function consultations() { wrap("الاستشارات", "إدارة الجلسات ومواعيد التواصل مع المحامين.", '<section class="card card--padded">' + tabs([["all", "الكل"], ["pending", "بانتظار الموافقة"], ["scheduled", "مجدولة"], ["completed", "مكتملة"]]) + '<div class="consultation-grid" data-consultation-grid></div></section>'); const target = document.querySelector("[data-consultation-grid]"), buttons = document.querySelectorAll("[data-filter]"); let selected = "all"; const draw = () => { const list = d.consultations.filter((item) => selected === "all" || item.status === selected); target.innerHTML = list.length ? list.map((item) => '<article class="card consultation-card"><div class="consultation-card__top">' + person(lawyerName(item.lawyerId), item.subject, lawyer(item.lawyerId)?.initials) + ui.statusBadge(item.status) + '</div><div class="consultation-card__meta\"><span>' + e(item.id) + '</span><span>' + e(item.date) + ' · ' + e(item.time) + '</span><span>' + e(item.method) + '</span></div><button class="button button--ghost button--small\" data-follow>متابعة</button></article>').join("") : empty("لا توجد استشارات", "ستظهر الجلسات هنا عند توفرها."); }; buttons.forEach((item) => item.addEventListener("click", () => { buttons.forEach((buttonEl) => buttonEl.classList.remove("is-active")); item.classList.add("is-active"); selected = item.dataset.filter; draw(); })); target.addEventListener("click", (event) => { if (event.target.closest("[data-follow]")) ui.showToast("تم تسجيل متابعة الاستشارة.", "success"); }); draw(); }

  function casesPage(role) { wrap("القضايا", "تابع القضايا النشطة والمراحل القادمة لكل ملف.", '<section class="card card--padded">' + tabs([["all", "الكل"], ["new", "جديدة"], ["active", "نشطة"], ["closed", "مغلقة"]]) + '<div class="case-grid" data-case-grid></div></section>'); const target = document.querySelector("[data-case-grid]"), buttons = document.querySelectorAll("[data-filter]"); let selected = "all"; const draw = () => { const list = d.cases.filter((item) => selected === "all" || item.status === selected); target.innerHTML = list.length ? list.map((item) => '<article class="card case-card"><div class="case-card__header"><div><h3>' + e(item.title) + '</h3><p>' + e(item.id) + ' · ' + e(item.type) + '</p></div>' + ui.statusBadge(item.status) + '</div><div class="case-card__meta\"><span>الطرف المرتبط: ' + e(role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId)) + '</span><span>المرحلة: ' + e(item.stage) + '</span><span>التحديث: ' + e(item.updatedAt) + '</span></div>' + button("تفاصيل القضية", pageLink(role === "lawyer" ? "lawyer" : "client", "case-details.html", item.id), "button button--outline button--small") + '</article>').join("") : empty("لا توجد قضايا", "ستظهر القضايا بعد قبول طلب خدمة."); }; buttons.forEach((item) => item.addEventListener("click", () => { buttons.forEach((buttonEl) => buttonEl.classList.remove("is-active")); item.classList.add("is-active"); selected = item.dataset.filter; draw(); })); draw(); }
  function caseDetails(role) { const item = caseFile(qp("id", "CASE-2001")); if (!item) { wrap("القضية غير موجودة", "تعذر العثور على الملف.", '<section class="card card--padded">' + empty("لم يتم العثور على القضية") + '</section>'); return; } wrap("تفاصيل القضية", item.id + " · " + item.title, "ملخص الملف والمواعيد والمستندات والتحديثات.", button("العودة للقضايا", href((role === "lawyer" ? "lawyer" : "client") + "/cases.html"), "button button--outline")); const docs = d.documents.filter((doc) => doc.caseId === item.id); root().insertAdjacentHTML("beforeend", '<div class="detail-layout"><div class="detail-main"><section class="card card--padded">' + header("ملخص القضية", "البيانات الأساسية للملف.") + info([["رقم القضية", item.id], ["العنوان", item.title], ["النوع", item.type], ["الحالة", ui.statusBadge(item.status), true], ["المرحلة الحالية", item.stage], [role === "client" ? "المحامي" : "العميل", role === "client" ? lawyerName(item.lawyerId) : clientName(item.clientId)], ["الموعد القادم", item.nextEvent]]) + '</section><section class="card card--padded">' + header("الملاحظات والتحديثات", "سجل مختصر للعمل المنجز.") + (item.notes.length ? item.notes.map((note) => '<div class="mini-list__item"><span>✓</span><div><strong>' + e(note) + '</strong><small>تم تسجيله ضمن ملاحظات القضية</small></div></div>').join("") : empty("لا توجد ملاحظات")) + '</section></div><aside class="detail-side"><section class="card card--padded">' + header("المستندات", "بيانات المستندات المرتبطة بالقضية.") + (docs.length ? docs.map((doc) => '<div class="mini-list__item"><span>□</span><div><strong>' + e(doc.name) + '</strong><small>' + e(doc.type) + ' · ' + e(doc.status) + '</small></div></div>').join("") : empty("لا توجد مستندات")) + '</section></aside></div>'); }

  function listPage(type) { const data = type === "documents" ? d.documents : type === "payments" ? d.payments : d.clients; const labels = type === "documents" ? ["المستند", "الارتباط", "النوع", "الرفع", "الحالة"] : type === "payments" ? ["الفاتورة", "العميل", "المحامي", "المبلغ", "الحالة", "الاستحقاق"] : ["العميل", "المدينة", "الطلبات", "القضايا", "الحالة"]; const rows = type === "documents" ? data.map((item) => '<tr><td>' + person(item.name, item.id, "□") + '</td><td>' + e(item.requestId || item.caseId || "الملف الشخصي") + '</td><td>' + e(item.type) + '</td><td>' + e(item.uploadedAt) + '</td><td>' + e(item.status) + '</td></tr>').join("") : type === "payments" ? data.map((item) => '<tr><td>' + e(item.invoice) + '</td><td>' + e(clientName(item.clientId)) + '</td><td>' + e(lawyerName(item.lawyerId)) + '</td><td>' + e(item.amount) + '</td><td>' + ui.statusBadge(item.status) + '</td><td>' + e(item.dueDate) + '</td></tr>').join("") : data.map((item) => '<tr><td>' + person(item.name, item.email, item.initials) + '</td><td>' + e(item.city) + '</td><td>' + item.requests + '</td><td>' + item.cases + '</td><td>' + e(item.status === "active" ? "نشط" : "موقوف") + '</td></tr>').join(""); wrap(type === "documents" ? "المستندات" : type === "payments" ? "المدفوعات" : "العملاء", "عرض البيانات المرتبطة بمساحة العمل الحالية.", '<section class="card card--padded">' + toolbar() + '<div class="data-table-wrap"><table class="data-table\"><thead><tr>' + labels.map((item) => '<th>' + item + '</th>').join("") + '</tr></thead><tbody>' + rows + '</tbody></table></div></section>'); }
  function messages(role) {
    wrap("الرسائل", "تواصل مع الأطراف المرتبطة بطلباتك داخل مساحة منظمة.", '<section class="message-layout card"><aside class="conversation-list"><div class="conversation-list__header"><h2>المحادثات</h2><span>' + d.messages.length + '</span></div><div data-conversations></div></aside><div class="conversation-panel" data-panel></div></section>');
    const list = document.querySelector("[data-conversations]");
    const panel = document.querySelector("[data-panel]");
    let active = d.messages[0];
    if (!active) { panel.innerHTML = empty("لا توجد محادثات", "تظهر المحادثات بعد ربط طلبك بمحامٍ."); return; }
    const draw = () => {
      const pid = role === "client" ? active.lawyerId : active.clientId;
      const name = role === "client" ? lawyerName(pid) : clientName(pid);
      panel.innerHTML = '<div class="conversation-panel__header">' + person(name, active.subject, role === "client" ? lawyer(pid)?.initials : client(pid)?.initials) + '</div><div class="message-stream">' + active.messages.map((item) => '<div class="message-bubble ' + (item.from === role ? "is-mine" : "") + '"><p>' + e(item.text) + '</p><small>' + e(item.time) + '</small></div>').join("") + '</div><form class="message-compose"><input name="message" required maxlength="4000" placeholder="اكتب رسالتك هنا..."><button class="button button--primary">إرسال</button></form>';
      panel.querySelector("form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const content = form.elements.message.value.trim();
        if (!content) return;
        const submit = form.querySelector("button");
        submit.disabled = true;
        try {
          const message = live() ? (await api().request("/api/messages", { method: "POST", authenticated: true, body: { requestId: active.id, content } })).message : { from: role, text: content, time: "الآن" };
          active.messages.push(message);
          draw();
          ui.showToast("تم إرسال الرسالة.", "success");
        } catch (error) { ui.showToast(error.message, "danger"); submit.disabled = false; }
      });
    };
    list.innerHTML = d.messages.map((item, index) => { const pid = role === "client" ? item.lawyerId : item.clientId; return '<button class="conversation-item ' + (index === 0 ? "is-active" : "") + '" type="button" data-conversation="' + e(item.id) + '">' + avatar(role === "client" ? lawyer(pid)?.initials : client(pid)?.initials) + '<span><strong>' + e(role === "client" ? lawyerName(pid) : clientName(pid)) + '</strong><small>' + e(item.subject) + '</small></span></button>'; }).join("");
    list.addEventListener("click", (event) => { const selected = event.target.closest("[data-conversation]"); if (!selected) return; active = find(d.messages, selected.dataset.conversation); list.querySelectorAll(".conversation-item").forEach((buttonEl) => buttonEl.classList.remove("is-active")); selected.classList.add("is-active"); draw(); });
    draw();
  }
  function lawyerProfile() {
    const item = d.lawyers[0];
    const cities = ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الطائف", "تبوك", "أبها", "حائل", "جازان", "نجران", "القصيم"];
    const licenseNumber = String(item.license || "").replace(/^رخصة مهنية\s*/, "");
    const digits = (value) => String(value || "").replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
    const fee = Number(digits(item.price).replace(/[^0-9]/g, "")) || 0;
    const selectedCity = cities.includes(item.city) ? item.city : "الرياض";
    const cityOptions = [...new Set([selectedCity, ...cities])].map((city) => '<option value="' + e(city) + '" ' + (city === selectedCity ? "selected" : "") + '>' + e(city) + '</option>').join("");
    const areas = (item.services || []).join("، ");
    const publicProfileUrl = href("client/lawyer-profile.html?id=" + encodeURIComponent(item.id));
    const formMarkup = '<div class="lawyer-profile-editor"><form class="lawyer-profile-form" data-lawyer-profile-form>' +
      '<section class="card card--padded profile-form-section"><div class="card-header"><div><span class="eyebrow">بيانات تظهر للعملاء</span><h2>معلومات مهنية</h2><p>حدّث بيانات الترخيص والخبرة والتخصص وأتعاب الاستشارة.</p></div><span class="badge badge--success">ملف مهني</span></div>' +
      '<div class="form-grid"><label>الاسم المهني<input name="name" required maxlength="100" value="' + e(item.name) + '"></label><label>التخصص الرئيسي<input name="specialty" required maxlength="80" value="' + e(item.specialty) + '" placeholder="مثال: القضايا التجارية"></label><label>رقم الرخصة المهنية<input name="license" required maxlength="60" value="' + e(licenseNumber) + '"></label><label>سنوات الخبرة<input name="experience" type="number" min="0" max="60" required value="' + e(item.experience) + '"></label><label>المدينة<select name="city" required>' + cityOptions + '</select></label><label>أتعاب الاستشارة (ريال)<input name="fee" type="number" min="0" max="100000" step="1" required value="' + e(fee) + '"></label><label>المواعيد المتاحة<input name="availability" type="text" required maxlength="80" value="' + e(item.availability) + '" placeholder="متاح غدًا أو متاحة هذا الأسبوع"></label></div></section>' +
      '<section class="card card--padded profile-form-section"><div class="card-header"><div><span class="eyebrow">عرّف العملاء بخبرتك</span><h2>النبذة المهنية ومجالات الخدمة</h2><p>اكتب نبذة واضحة، وحدّد الأعمال القانونية التي تقدمها.</p></div></div><label>نبذة مهنية<textarea name="bio" required minlength="30" maxlength="700" rows="5" placeholder="اكتب نبذة تشرح خبرتك وطريقتك في مساعدة العملاء">' + e(item.bio) + '</textarea><small class="field-help">من ٣٠ إلى ٧٠٠ حرف. تجنّب إضافة بيانات سرية أو معلومات تخص عملاء سابقين.</small></label><label>مجالات الخدمة<textarea name="services" required rows="3" maxlength="500" placeholder="مثال: العقود التجارية، تأسيس الشركات، تسوية النزاعات">' + e(areas) + '</textarea><small class="field-help">افصل بين المجالات بفاصلة عربية أو سطر جديد؛ سيعرضها ملفك للعميل على شكل وسوم.</small></label></section>' +
      '<section class="card card--padded profile-form-section"><div class="card-header"><div><span class="eyebrow">للتواصل وإدارة الحساب</span><h2>معلومات الحساب</h2><p>هذه البيانات تبقى ضمن إعدادات الحساب ولا تظهر في الملف العام.</p></div></div><div class="form-grid"><label>البريد الإلكتروني<input name="email" type="email" required maxlength="120" value="' + e(item.email || (live() ? "" : "noura@example.sa")) + '"></label><label>رقم الجوال<input name="phone" type="tel" maxlength="20" value="' + e(item.phone || (live() ? "" : "0500000000")) + '"></label></div></section>' +
      '<div class="profile-form-actions"><button class="button button--primary" type="submit">حفظ الملف المهني</button><a class="button button--outline" href="' + publicProfileUrl + '">عرض الملف العام</a><span role="status" aria-live="polite" data-profile-save-status></span></div></form>' +
      '<aside class="profile-live-preview"><section class="card card--padded"><div class="card-header"><div><span class="eyebrow">معاينة مباشرة</span><h2>كيف سيظهر ملفك؟</h2><p>تنعكس التعديلات على صفحتك العامة في هذا المتصفح بعد الحفظ.</p></div></div><div class="profile-preview-identity"><span class="avatar avatar--lg" data-preview-initials>' + e(item.initials) + '</span><div><strong data-preview-name>' + e(item.name) + '</strong><span data-preview-specialty>' + e(item.specialty) + '</span><small data-preview-city>' + e(item.city) + '</small></div></div><div class="profile-preview-block"><h3>نبذة مهنية</h3><p data-preview-bio>' + e(item.bio) + '</p></div><div class="profile-preview-block"><h3>مجالات الخدمة</h3><div class="chips" data-preview-services>' + (item.services || []).map((service) => '<span class="badge badge--neutral">' + e(service) + '</span>').join("") + '</div></div><div class="profile-preview-meta"><span>الخبرة<strong data-preview-experience>' + e(item.experience) + ' سنوات</strong></span><span>أتعاب الاستشارة<strong data-preview-fee>' + e(item.price) + '</strong></span></div><a class="profile-preview-link" href="' + publicProfileUrl + '">فتح صفحة المحامي ←</a></section><p class="profile-storage-note">تُحفظ البيانات في هذا المتصفح حاليًا. ربطها بحسابك على مختلف الأجهزة يتطلب تفعيل الخادم وقاعدة البيانات.</p></aside></div>';
    wrap("الملف المهني", "أكمل بياناتك ليتمكن العملاء من التعرف على خبرتك ومجالات عملك.", formMarkup, button("عرض ملفي للعميل", publicProfileUrl, "button button--outline button--small"));

    const form = document.querySelector("[data-lawyer-profile-form]");
    const editor = form.closest(".lawyer-profile-editor");
    const preview = () => {
      const values = new FormData(form);
      const services = String(values.get("services") || "").split(/[،,؛;\n]/).map((value) => value.trim()).filter(Boolean);
      const name = String(values.get("name") || "").trim();
      const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => (part.match(/[ء-يA-Za-z0-9]/) || [""])[0]).join("") || item.initials;
      editor.querySelector("[data-preview-initials]").textContent = initials;
      editor.querySelector("[data-preview-name]").textContent = name || "اسم المحامي";
      editor.querySelector("[data-preview-specialty]").textContent = values.get("specialty") || "التخصص المهني";
      editor.querySelector("[data-preview-city]").textContent = values.get("city") || "المدينة";
      editor.querySelector("[data-preview-bio]").textContent = values.get("bio") || "ستظهر نبذتك المهنية هنا.";
      editor.querySelector("[data-preview-services]").innerHTML = services.length ? services.map((service) => '<span class="badge badge--neutral">' + e(service) + '</span>').join("") : '<span class="field-help">أضف مجالات الخدمة لتظهر هنا.</span>';
      editor.querySelector("[data-preview-experience]").textContent = (values.get("experience") || "—") + " سنوات";
      const previewFee = Number(values.get("fee"));
      editor.querySelector("[data-preview-fee]").textContent = Number.isFinite(previewFee) ? "من " + new Intl.NumberFormat("ar-SA").format(previewFee) + " ريال" : "—";
    };
    form.elements.services.addEventListener("input", () => {
      if (String(form.elements.services.value).split(/[،,؛;\n]/).some((value) => value.trim())) form.elements.services.setCustomValidity("");
    });
    form.addEventListener("input", () => { preview(); form.querySelector("[data-profile-save-status]").textContent = ""; });
    form.addEventListener("change", preview);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const services = [...new Set(String(values.get("services")).split(/[،,؛;\n]/).map((value) => value.trim()).filter(Boolean))];
      if (!services.length) { form.elements.services.setCustomValidity("أضف مجال خدمة واحدًا على الأقل."); form.elements.services.reportValidity(); return; }
      form.elements.services.setCustomValidity("");
      const name = String(values.get("name")).trim();
      const feeValue = Number(values.get("fee"));
      const profile = {
        name,
        initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => (part.match(/[ء-يA-Za-z0-9]/) || [""])[0]).join("") || item.initials,
        email: String(values.get("email")).trim(),
        phone: String(values.get("phone")).trim(),
        specialty: String(values.get("specialty")).trim(),
        city: String(values.get("city")),
        experience: Number(values.get("experience")),
        license: "رخصة مهنية " + String(values.get("license")).trim(),
        price: "من " + new Intl.NumberFormat("ar-SA").format(feeValue) + " ريالًا",
        availability: String(values.get("availability")),
        bio: String(values.get("bio")).trim(),
        services
      };
      try {
        window.MOWAKAL_DATA.saveLawyerProfile(item.id, profile);
        preview();
        form.querySelector("[data-profile-save-status]").textContent = "تم حفظ الملف المهني وتحديث بيانات العرض.";
        ui.showToast("تم حفظ الملف المهني وتحديث الصفحة العامة على هذا المتصفح.", "success");
      } catch (_) {
        form.querySelector("[data-profile-save-status]").textContent = "تعذر حفظ التعديلات؛ تحقق من إعدادات التخزين في المتصفح.";
        ui.showToast("تعذر حفظ البيانات في هذا المتصفح. حاول مرة أخرى.", "danger");
      }
    });
  }

  function profile(role) {
    if (role === "lawyer") { lawyerProfile(); return; }
    const item = d.clients[0];
    wrap("الملف الشخصي", "راجع بيانات الحساب وحدث المعلومات الأساسية.", '<section class="card card--padded"><div class="profile-cover">' + avatar(item.initials) + '<div><h2>' + e(item.name) + '</h2><p>عميل MOWAKAL</p></div></div><form data-profile><div class="form-grid"><label>الاسم الكامل<input required value="' + e(item.name) + '"></label><label>البريد الإلكتروني<input type="email" required value="' + e(item.email || (live() ? "" : "salman@example.sa")) + '"></label><label>رقم الجوال<input value="' + e(item.phone || (live() ? "" : "0500000000")) + '"></label><label>المدينة<select><option value="' + e(item.city || "") + '">' + e(item.city || (live() ? "اختر المدينة" : "الرياض")) + '</option><option>الرياض</option><option>جدة</option><option>الدمام</option></select></label></div><div class="form-actions"><button class="button button--primary">حفظ التغييرات</button></div></form></section>');
    document.querySelector("[data-profile]").addEventListener("submit", (event) => { event.preventDefault(); ui.showToast("تم حفظ بيانات الحساب بنجاح.", "success"); });
  }
  function clientDetails() { const item = client(qp("id", "CLI-001")); if (!item) { wrap("العميل غير موجود", "تعذر العثور على الملف.", '<section class="card card--padded">' + empty("لم يتم العثور على العميل") + '</section>'); return; } const requests = d.requests.filter((entry) => entry.clientId === item.id), cases = d.cases.filter((entry) => entry.clientId === item.id); wrap("ملف العميل", item.name, "ملخص آمن للطلبات والقضايا والمواعيد والبيانات المالية.", button("العودة للعملاء", href("lawyer/clients.html"), "button button--outline")); root().insertAdjacentHTML("beforeend", '<div class="detail-layout"><div class="detail-main"><section class="card card--padded">' + header("بيانات العميل", "البيانات اللازمة لإدارة العلاقة المهنية.") + info([["الاسم", item.name], ["البريد الإلكتروني", item.email], ["رقم الجوال", item.phone], ["المدينة", item.city], ["حالة الحساب", item.status === "active" ? "نشط" : "موقوف"]]) + '</section><section class="card card--padded">' + header("الطلبات", "الطلبات المرتبطة بهذا العميل.") + requests.map((entry) => '<a class="mini-list__item" href="' + pageLink("lawyer", "request-details.html", entry.id) + '"><span>＋</span><div><strong>' + e(entry.title) + '</strong><small>' + e(entry.id) + ' · ' + ui.statusBadge(entry.status) + '</small></div></a>').join("") + '</section></div><aside class="detail-side"><section class="card card--padded">' + header("القضايا", "ملفات العميل الحالية.") + cases.map((entry) => '<a class="mini-list__item" href="' + pageLink("lawyer", "case-details.html", entry.id) + '"><span>▤</span><div><strong>' + e(entry.title) + '</strong><small>' + ui.statusBadge(entry.status) + '</small></div></a>').join("") + '</section><section class="card card--padded">' + header("ملخص مالي", "معلومات للمتابعة فقط.") + '<div class="financial-summary financial-summary--inline"><div><span>الفواتير</span><strong>٢</strong></div><div><span>المدفوع</span><strong>١٬٠٥٠</strong></div></div></section></aside></div>'); }
  function wizard() { const selected = qp("service", ""); wrap("طلب خدمة جديدة", "أكمل المعلومات على مراحل حتى نوجه طلبك للمحامي المناسب.", '<section class="card card--padded wizard-card"><div class="wizard-steps"><span class="is-active">١. الخدمة</span><span>٢. التفاصيل</span><span>٣. المستندات</span><span>٤. التفضيلات</span><span>٥. المراجعة</span></div><form data-wizard><div class="wizard-step is-active" data-step="0"><h2>ما الخدمة التي تحتاجها؟</h2><div class="option-grid">' + d.services.map((item) => '<label class="select-card"><input type="radio" name="service" value="' + item.id + '" ' + (selected === item.id ? "checked" : "") + ' required><span><strong>' + e(item.name) + '</strong><small>' + e(item.description) + '</small></span></label>').join("") + '</div></div><div class="wizard-step" data-step="1"><h2>تفاصيل الطلب</h2><div class="form-grid"><label>العنوان<input name="title" required placeholder="مثال: مراجعة عقد"></label><label>الأولوية<select name="urgency"><option>عادية</option><option>عالية</option><option>عاجلة</option></select></label><label>المدينة<select name="city"><option>الرياض</option><option>جدة</option><option>الدمام</option></select></label></div><label>الوصف<textarea name="description" required placeholder="اذكر الوقائع والأسئلة التي تحتاج إلى مراجعتها."></textarea></label></div><div class="wizard-step" data-step="2"><h2>المستندات</h2><label class="upload-zone"><input type="file" multiple data-files><span>＋</span><strong>اختر الملفات</strong><small>سيتم تسجيل الأسماء فقط</small></label><div class="selected-files" data-file-names></div></div><div class="wizard-step" data-step="3"><h2>المحامي والموعد</h2><div class="form-grid"><label>المحامي المفضل<select name="lawyer"><option value="">ترشيح من المنصة</option>' + d.lawyers.map((item) => '<option value="' + item.id + '">' + e(item.name) + ' · ' + e(item.specialty) + '</option>').join("") + '</select></label><label>طريقة التواصل<select name="method"><option>مكالمة مرئية</option><option>مكالمة هاتفية</option><option>محادثة نصية</option></select></label><label>التاريخ<input type="date" name="date"></label><label>الوقت<input type="time" name="time"></label></div></div><div class="wizard-step" data-step="4"><h2>المراجعة والإرسال</h2><div data-summary></div></div><div class="wizard-actions"><button type="button" class="button button--outline" data-back hidden>السابق</button><button type="button" class="button button--primary" data-next>التالي</button></div></form></section>'); const form = document.querySelector("[data-wizard]"), steps = [...form.querySelectorAll("[data-step]")], next = form.querySelector("[data-next]"), back = form.querySelector("[data-back]"); let step = 0; const update = () => { steps.forEach((item, index) => item.classList.toggle("is-active", index === step)); back.hidden = step === 0; next.textContent = step === 4 ? "إرسال الطلب" : "التالي"; if (step === 4) { const data = new FormData(form); form.querySelector("[data-summary]").innerHTML = info([["الخدمة", serviceName(data.get("service"))], ["العنوان", data.get("title") || "—"], ["الأولوية", data.get("urgency") || "—"], ["المدينة", data.get("city") || "—"], ["المحامي", data.get("lawyer") ? lawyerName(data.get("lawyer")) : "ترشيح من المنصة"], ["طريقة التواصل", data.get("method") || "—"]]); } }; next.addEventListener("click", () => { if (step < 4) { const invalid = [...steps[step].querySelectorAll("[required]")].find((field) => !field.checkValidity()); if (invalid) { invalid.reportValidity(); return; } step += 1; update(); } else { const newId = "REQ-" + (1005 + Math.floor(Math.random() * 90)); ui.showToast("تم إرسال الطلب " + newId + " بنجاح.", "success"); setTimeout(() => { location.href = href("client/request-details.html?id=" + newId); }, 600); } }); back.addEventListener("click", () => { step -= 1; update(); }); form.querySelector("[data-files]").addEventListener("change", (event) => { form.querySelector("[data-file-names]").innerHTML = [...event.target.files].map((file) => '<span class="badge badge--neutral">' + e(file.name) + '</span>').join(""); }); update(); }
  function calendar() { wrap("المواعيد والتقويم", "خطط لجلساتك ومواعيد التسليم القادمة.", '<section class="calendar-layout"><div class="card card--padded"><div class="calendar-header"><h2>سبتمبر ٢٠٢٦</h2><button class="button button--primary button--small\" data-add-event>إضافة موعد</button></div><div class="calendar-grid">' + Array.from({ length: 30 }, (_, i) => '<button class="calendar-day ' + (i + 1 === 25 ? "is-current" : "") + '" type="button" data-day="' + (i + 1) + '"><span class="calendar-day__number">' + (i + 1) + '</span>' + (i + 1 === 28 ? '<span class="calendar-day__event">مراجعة مدار</span>' : "") + '</button>').join("") + '</div></div><aside class="card card--padded">' + header("المواعيد القادمة", "ترتيب زمني للاجتماعات.") + d.appointments.map((item) => '<div class="mini-list__item"><span>◷</span><div><strong>' + e(item.title) + '</strong><small>' + e(item.date) + ' · ' + e(item.time) + '</small></div></div>').join("") + '</aside></section>'); root().addEventListener("click", (event) => { if (event.target.closest("[data-day]")) ui.showToast("تم تحديد اليوم " + event.target.closest("[data-day]").dataset.day + " سبتمبر.", "success"); if (event.target.closest("[data-add-event]")) ui.showToast("اختر التاريخ والوقت لإضافة الموعد.", "success"); }); }
  function billing() { wrap("الأتعاب والفواتير", "تابع الفواتير والمبالغ المدفوعة والمستحقات.", '<section class="card card--padded"><div class="financial-summary"><div><span>إجمالي الفوترة</span><strong>٤٬٨٥٠ ريال</strong></div><div><span>المدفوع</span><strong>٤٬٠٥٠ ريال</strong></div><div><span>قيد التحصيل</span><strong>٨٠٠ ريال</strong></div></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الفاتورة</th><th>العميل</th><th>الطلب</th><th>المبلغ</th><th>الحالة</th><th>الاستحقاق</th></tr></thead><tbody>' + d.payments.map((item) => '<tr><td>' + e(item.invoice) + '</td><td>' + e(clientName(item.clientId)) + '</td><td>' + e(item.requestId) + '</td><td>' + e(item.amount) + '</td><td>' + ui.statusBadge(item.status) + '</td><td>' + e(item.dueDate) + '</td></tr>').join("") + '</tbody></table></div></section>'); }
  function admin(type) { const maps = { users: ["المستخدمون", ["المستخدم", "الدور", "البريد", "الحالة", "التسجيل"], d.users.map((item) => '<tr><td>' + person(item.name, item.id, item.name.slice(0, 2)) + '</td><td>' + e(item.role) + '</td><td>' + e(item.email) + '</td><td>' + e(item.status) + '</td><td>' + e(item.registeredAt) + '</td></tr>').join("")], lawyers: ["المحامون", ["المحامي", "الترخيص", "التخصص", "المدينة", "التقييم"], d.lawyers.map((item) => '<tr><td>' + person(item.name, item.id, item.initials) + '</td><td>' + e(item.license) + '</td><td>' + e(item.specialty) + '</td><td>' + e(item.city) + '</td><td>' + ui.formatRating(item.rating, item.reviews) + '</td></tr>').join("")], clients: ["العملاء", ["العميل", "المدينة", "الطلبات", "القضايا", "الحالة"], d.clients.map((item) => '<tr><td>' + person(item.name, item.email, item.initials) + '</td><td>' + e(item.city) + '</td><td>' + item.requests + '</td><td>' + item.cases + '</td><td>' + e(item.status === "active" ? "نشط" : "موقوف") + '</td></tr>').join("")], consultations: ["الاستشارات", ["الرقم", "الموضوع", "العميل", "المحامي", "التاريخ", "الحالة"], d.consultations.map((item) => '<tr><td>' + e(item.id) + '</td><td>' + e(item.subject) + '</td><td>' + e(clientName(item.clientId)) + '</td><td>' + e(lawyerName(item.lawyerId)) + '</td><td>' + e(item.date) + '</td><td>' + ui.statusBadge(item.status) + '</td></tr>').join("")], cases: ["القضايا", ["الرقم", "العنوان", "العميل", "المحامي", "النوع", "الحالة"], d.cases.map((item) => '<tr><td>' + e(item.id) + '</td><td>' + e(item.title) + '</td><td>' + e(clientName(item.clientId)) + '</td><td>' + e(lawyerName(item.lawyerId)) + '</td><td>' + e(item.type) + '</td><td>' + ui.statusBadge(item.status) + '</td></tr>').join("")], documents: ["المستندات", ["المستند", "المالك", "الارتباط", "النوع", "الرفع"], d.documents.map((item) => '<tr><td>' + person(item.name, item.id, "□") + '</td><td>' + e(clientName(item.ownerId)) + '</td><td>' + e(item.requestId || item.caseId || "—") + '</td><td>' + e(item.type) + '</td><td>' + e(item.uploadedAt) + '</td></tr>').join("")], payments: ["المدفوعات", ["الفاتورة", "العميل", "المحامي", "المبلغ", "الحالة", "الاستحقاق"], d.payments.map((item) => '<tr><td>' + e(item.invoice) + '</td><td>' + e(clientName(item.clientId)) + '</td><td>' + e(lawyerName(item.lawyerId)) + '</td><td>' + e(item.amount) + '</td><td>' + ui.statusBadge(item.status) + '</td><td>' + e(item.dueDate) + '</td></tr>').join("")], reviews: ["التقييمات", ["العميل", "المحامي", "التقييم", "النص", "التاريخ"], d.reviews.map((item) => '<tr><td>' + e(item.client) + '</td><td>' + e(item.lawyer) + '</td><td><span class=\"review-stars\">' + "★".repeat(item.rating) + '</span></td><td>' + e(item.text) + '</td><td>' + e(item.date) + '</td></tr>').join("")], activity: ["سجل الأنشطة", ["الحدث", "المنفذ", "الهدف", "الوقت", "النوع"], d.activities.map((item) => '<tr><td>' + e(item.event) + '</td><td>' + e(item.actor) + '</td><td>' + e(item.target) + '</td><td>' + e(item.timestamp) + '</td><td>' + e(item.type) + '</td></tr>').join("")] }; const item = maps[type]; if (!item) return; wrap(item[0], "بيانات تشغيلية قابلة للربط لاحقًا بالباكند.", '<section class="card card--padded">' + toolbar() + '<div class="data-table-wrap"><table class="data-table"><thead><tr>' + item[1].map((label) => '<th>' + label + '</th>').join("") + '</tr></thead><tbody>' + item[2] + '</tbody></table></div></section>'); }
  function activityPage() {
    const rows = d.activities.map((item) => '<tr><td>' + e(item.event) + '</td><td>' + e(item.actor) + '</td><td>' + e(item.target) + '</td><td>' + e(item.timestamp) + '</td><td>' + e(item.type) + '</td></tr>').join("");
    wrap("سجل التدقيق", "أحداث إدارية عامة بمعرّفات مختصرة، من دون محتوى المستخدمين أو ملفاتهم.", '<section class="card card--padded"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الحدث</th><th>المنفذ</th><th>المورد</th><th>الوقت</th><th>النوع</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">' + empty("لا توجد أحداث مسجلة") + '</td></tr>') + '</tbody></table></div></section>');
  }
  function verifications() { admin("verifications"); const body = '<section class="card card--padded">' + toolbar() + '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>المحامي</th><th>الترخيص</th><th>التخصص</th><th>المدينة</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>' + d.verifications.map((item) => '<tr><td>' + person(item.name, item.id, item.name.slice(0, 2)) + '</td><td>' + e(item.license) + '</td><td>' + e(item.specialty) + '</td><td>' + e(item.city) + '</td><td>' + ui.statusBadge(item.status) + '</td><td>' + button("مراجعة", href("admin/verification-details.html?id=" + item.id), "button button--outline button--small") + '</td></tr>').join("") + '</tbody></table></div></section>'; set(heading("توثيق المحامين", "راجع الطلبات المهنية قبل اعتماد الحسابات.") + body); }
  function verificationDetails() { const item = find(d.verifications, qp("id", "VER-001")); if (!item) { wrap("طلب التوثيق غير موجود", "تعذر العثور على الطلب.", '<section class="card card--padded">' + empty("لم يتم العثور على الطلب") + '</section>'); return; } wrap("تفاصيل التوثيق", item.name, "راجع المعلومات المهنية وبيانات المستندات قبل اتخاذ القرار.", button("العودة للطلبات", href("admin/lawyer-verifications.html"), "button button--outline")); root().insertAdjacentHTML("beforeend", '<div class="detail-layout"><section class="card card--padded">' + header("المعلومات المهنية", "بيانات مقدمة من المحامي.") + info([["الاسم", item.name], ["رقم الترخيص", item.license], ["التخصص", item.specialty], ["المدينة", item.city], ["سنوات الخبرة", item.experience], ["الحالة", ui.statusBadge(item.status), true]]) + '</section><aside class="card card--padded">' + header("الإجراءات", "تحديث محاكٍ لحالة الطلب.") + '<div class="stack-actions"><button class="button button--primary\" data-verification=\"approved\">اعتماد المحامي</button><button class="button button--outline\" data-verification=\"more_info\">طلب معلومات إضافية</button><button class="button button--danger\" data-verification=\"rejected\">رفض الطلب</button></div></aside></div>'); root().addEventListener("click", (event) => { const action = event.target.closest("[data-verification]"); if (action) { item.status = action.dataset.verification; ui.showToast("تم تحديث حالة طلب التوثيق.", action.dataset.verification === "rejected" ? "danger" : "success"); } }); }
  function adminServices() { set(heading("الخدمات القانونية", "إدارة كتالوج الخدمات المتاحة للعملاء.", '<section class="card card--padded">' + toolbar('<button class="button button--primary button--small\" data-add-service>إضافة خدمة</button>') + '<div class="data-table-wrap"><table class="data-table"><thead><tr><th>الخدمة</th><th>المجال</th><th>النوع</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>' + d.services.map((item) => '<tr><td>' + person(item.name, item.id, item.icon) + '</td><td>' + e(item.category) + '</td><td>' + e(item.type) + '</td><td>' + (item.active ? ui.statusBadge("active", "نشطة") : "موقوفة") + '</td><td><button class="button button--ghost button--small\" data-service-toggle>تفعيل / تعطيل</button></td></tr>').join("") + '</tbody></table></div></section>')); document.querySelector("[data-add-service]")?.addEventListener("click", () => ui.showToast("أدخل بيانات الخدمة من نموذج الإضافة.", "success")); }
  function reports() { wrap("التقارير", "ملخصات تشغيلية قابلة للربط لاحقًا بمصادر البيانات الفعلية.", '<div class="report-grid"><article class="card card--padded"><h2>أداء الطلبات</h2><p>توزيع الطلبات حسب الحالة خلال الشهر الحالي.</p><div class="report-bars"><span style="width:82%"><b>مكتملة</b><i>٣٤٪</i></span><span style="width:64%"><b>قيد التنفيذ</b><i>٢٨٪</i></span><span style="width:42%"><b>قيد المراجعة</b><i>١٨٪</i></span></div></article><article class="card card--padded"><h2>رضا العملاء</h2><p>متوسط التقييمات المنشورة.</p><strong class="report-number">٤٫٨ / ٥</strong><div class="review-stars">★★★★★</div></article><article class="card card--padded"><h2>التوثيق المهني</h2><p>طلبات مكتملة البيانات.</p><strong class="report-number">٨٦٪</strong></article></div>'); }
  function settings() { wrap("الإعدادات", "إعدادات عامة قابلة للتوسعة مع ربط لوحة الإدارة بالباكند.", '<section class="card card--padded"><form data-settings><div class="form-grid"><label>اسم المنصة<input value="MOWAKAL" required></label><label>البريد الإداري<input type="email" value="admin@mowakal.sa" required></label><label>المنطقة الزمنية<select><option>Asia/Riyadh</option></select></label><label>لغة الواجهة<select><option>العربية</option></select></label></div><label class="check-row"><input type="checkbox" checked> تفعيل إشعارات مراجعة التوثيق</label><label class="check-row"><input type="checkbox" checked> تسجيل الأحداث الإدارية</label><div class="form-actions"><button class="button button--primary\">حفظ الإعدادات</button></div></form></section>'); document.querySelector("[data-settings]").addEventListener("submit", (event) => { event.preventDefault(); ui.showToast("تم حفظ إعدادات المنصة.", "success"); }); }
  function init() { const page = document.body.dataset.appPage; if (!page) return; const map = { "client-dashboard": () => dashboard("client"), "client-services": services, "client-requests": () => requestsPage("client"), "client-request-details": () => requestDetails("client"), "client-new-request": wizard, "client-consultations": consultations, "client-cases": () => casesPage("client"), "client-case-details": () => caseDetails("client"), "client-appointments": () => { wrap("المواعيد", "نظّم مواعيدك القادمة وتابع الاجتماعات السابقة.", '<section class="card card--padded">' + header("قائمة المواعيد", "المواعيد المرتبطة بطلباتك.") + d.appointments.map((item) => '<div class="appointment-item"><span class="appointment-item__date">' + e(item.date) + '<strong>' + e(item.time) + '</strong></span><div><strong>' + e(item.title) + '</strong><span>' + e(lawyerName(item.lawyerId)) + '</span></div>' + ui.statusBadge(item.status) + '</div>').join("") + '</section>'); }, "client-documents": () => listPage("documents"), "client-messages": () => messages("client"), "client-payments": () => listPage("payments"), "client-reviews": () => admin("reviews"), "client-profile": () => profile("client"), "lawyer-dashboard": () => dashboard("lawyer"), "lawyer-requests": () => requestsPage("lawyer"), "lawyer-request-details": () => requestDetails("lawyer"), "lawyer-consultations": consultations, "lawyer-cases": () => casesPage("lawyer"), "lawyer-case-details": () => caseDetails("lawyer"), "lawyer-clients": () => listPage("clients"), "lawyer-client-details": clientDetails, "lawyer-documents": () => listPage("documents"), "lawyer-calendar": calendar, "lawyer-messages": () => messages("lawyer"), "lawyer-billing": billing, "lawyer-reviews": () => admin("reviews"), "lawyer-profile": () => profile("lawyer"), "admin-dashboard": () => dashboard("admin"), "admin-users": () => admin("users"), "admin-clients": () => admin("clients"), "admin-lawyers": () => admin("lawyers"), "admin-verifications": verifications, "admin-verification-details": verificationDetails, "admin-services": adminServices, "admin-requests": () => requestsPage("admin"), "admin-request-details": () => requestDetails("admin"), "admin-consultations": () => admin("consultations"), "admin-cases": () => admin("cases"), "admin-documents": () => admin("documents"), "admin-payments": () => admin("payments"), "admin-reviews": () => admin("reviews"), "admin-activity": activityPage, "admin-reports": reports, "admin-settings": settings }; (map[page] || (() => wrap("الصفحة غير متاحة", "تعذر فتح الصفحة المطلوبة.", '<section class="card card--padded">' + empty("الصفحة غير متاحة") + '</section>')))(); }
  const adminReadablePages = new Set(["admin-dashboard", "admin-users", "admin-services", "admin-activity", "admin-reports", "admin-settings"]);
  function restrictedAdminPage() {
    wrap("هذه الصفحة خارج لوحة الإدارة العامة", "محتوى المستخدمين والعلاقة المهنية لا يُعرض من هذه المساحة.", '<section class="card card--padded"><div class="empty-state"><span class="empty-state__icon" aria-hidden="true">◈</span><h2>المحتوى غير متاح هنا</h2><p>للحفاظ على الخصوصية، لا تعرض لوحة الإدارة العامة تفاصيل الطلبات أو القضايا أو الاستشارات أو المستندات أو المدفوعات أو التقييمات أو التوثيق.</p><p class="field-help">هذا تقييد للواجهة فقط؛ حماية البيانات الحقيقية تتطلب صلاحيات يفرضها الخادم.</p><a class="button button--primary" href="' + href("admin/dashboard.html") + '">العودة إلى لوحة الإدارة</a></div></section>');
  }
  function enhanceLivePage() {
    if (!live()) return;
    const page = document.body.dataset.appPage;
    const sidebarName = document.querySelector(".sidebar-user__copy strong");
    if (sidebarName) sidebarName.textContent = api().user?.name || "";
    if (page === "client-new-request") {
      const form = document.querySelector("[data-wizard]");
      const upload = form.querySelector("[data-files]");
      upload.disabled = true;
      upload.closest("label").replaceWith(Object.assign(document.createElement("p"), { className: "field-help", textContent: "رفع المستندات غير متاح حاليًا. لا تختَر ملفات حساسة قبل تفعيل التخزين الآمن." }));
      form.querySelectorAll('[name="date"], [name="time"], [name="method"]').forEach((field) => field.closest("label").hidden = true);
      form.querySelector('[data-step="3"] h2').textContent = "المحامي المفضل";
      form.querySelector("[data-next]").addEventListener("click", () => { form.querySelectorAll("[data-summary] .detail-item").forEach((row) => { if (row.querySelector("span")?.textContent === "طريقة التواصل") row.remove(); }); });
      form.querySelector("[data-next]").addEventListener("click", async (event) => {
        if (!form.querySelector('[data-step="4"]').classList.contains("is-active")) return;
        event.stopImmediatePropagation();
        const buttonEl = event.currentTarget;
        buttonEl.disabled = true;
        const values = new FormData(form);
        try {
          const result = await api().request("/api/requests", { method: "POST", authenticated: true, body: { serviceId: values.get("service"), title: values.get("title"), description: values.get("description"), urgency: values.get("urgency"), city: values.get("city"), lawyerId: values.get("lawyer") || null } });
          location.href = pageLink("client", "request-details.html", result.requestId);
        } catch (error) { ui.showToast(error.message, "danger"); buttonEl.disabled = false; }
      }, true);
    }
    if (page === "client-profile") {
      const form = document.querySelector("[data-profile]");
      const fields = form.querySelectorAll("input, select");
      fields[1].readOnly = true;
      form.addEventListener("submit", async (event) => {
        event.stopImmediatePropagation(); event.preventDefault();
        const submit = form.querySelector("button"); submit.disabled = true;
        try { const result = await api().request("/api/me", { method: "PATCH", authenticated: true, body: { name: fields[0].value, phone: fields[2].value, city: fields[3].value } }); api().user = result.user; ui.showToast("تم حفظ بيانات الحساب.", "success"); }
        catch (error) { ui.showToast(error.message, "danger"); }
        finally { submit.disabled = false; }
      }, true);
    }
    if (page === "lawyer-profile") {
      const form = document.querySelector("[data-lawyer-profile-form]");
      if (!api().user?.verified) {
        document.querySelectorAll(".profile-preview-link, .profile-form-actions a, .page-heading__actions a").forEach((link) => { link.hidden = true; });
        form.insertAdjacentHTML("afterbegin", '<p class="field-help">ملفك بانتظار التوثيق. لن يظهر للعملاء حتى تتم مراجعته.</p>');
      }
      form.elements.email.readOnly = true;
      form.elements.phone.readOnly = true;
      document.querySelector(".profile-storage-note").textContent = "تُحفظ التعديلات في حسابك. تغيير رقم الرخصة يعيد الملف للمراجعة قبل ظهوره للعملاء.";
      form.addEventListener("submit", async (event) => {
        event.stopImmediatePropagation(); event.preventDefault();
        if (!form.reportValidity()) return;
        const values = new FormData(form);
        const services = [...new Set(String(values.get("services")).split(/[،,؛;\n]/).map((item) => item.trim()).filter(Boolean))];
        const submit = form.querySelector('[type="submit"]'); submit.disabled = true;
        try {
          const result = await api().request("/api/me/lawyer-profile", { method: "PATCH", authenticated: true, body: { name: values.get("name"), specialty: values.get("specialty"), license: values.get("license"), experience: Number(values.get("experience")), city: values.get("city"), fee: Number(values.get("fee")), availability: values.get("availability"), bio: values.get("bio"), services } });
          d.lawyers[0] = { ...result.lawyer, email: api().user.email, phone: api().user.phone };
          form.querySelector("[data-profile-save-status]").textContent = result.lawyer.verified ? "تم حفظ الملف المهني." : "تم الحفظ، والملف بانتظار التوثيق.";
          ui.showToast("تم حفظ الملف المهني.", "success");
        } catch (error) { ui.showToast(error.message, "danger"); }
        finally { submit.disabled = false; }
      }, true);
    }
  }
  const initPlatform = () => {
    if (live() && document.body.dataset.appPage === "lawyer-client-details") {
      const item = client(qp("id", ""));
      if (!item) { wrap("العميل غير متاح", "لا يمكن عرض إلا العملاء المرتبطين بطلباتك.", empty("لم يتم العثور على العميل")); return; }
      const requests = d.requests.filter((entry) => entry.clientId === item.id);
      wrap("ملف العميل", item.name, '<section class="card card--padded">' + info([["الاسم", item.name], ["البريد الإلكتروني", item.email], ["الجوال", item.phone || "—"], ["المدينة", item.city || "—"]]) + header("الطلبات المرتبطة", "تُعرض طلبات هذا العميل المسندة إليك فقط.") + (requests.length ? requests.map((entry) => '<a class="mini-list__item" href="' + pageLink("lawyer", "request-details.html", entry.id) + '">' + e(entry.title) + '</a>').join("") : empty("لا توجد طلبات")) + '</section>');
      return;
    }
    if (live() && document.body.dataset.appPage === "admin-services") {
      const draw = () => {
        wrap("الخدمات القانونية", "إدارة إتاحة الخدمات في الكتالوج العام.", '<section class="card card--padded"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الخدمة</th><th>المجال</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>' + d.services.map((item) => '<tr><td>' + e(item.name) + '</td><td>' + e(item.category) + '</td><td>' + (item.active ? "متاحة" : "موقوفة") + '</td><td><button type="button" class="button button--outline button--small" data-service-id="' + e(item.id) + '">' + (item.active ? "إيقاف" : "تفعيل") + '</button></td></tr>').join("") + '</tbody></table></div></section>');
        root().querySelectorAll("[data-service-id]").forEach((buttonEl) => buttonEl.addEventListener("click", async () => {
          const item = d.services.find((entry) => entry.id === buttonEl.dataset.serviceId);
          buttonEl.disabled = true;
          try { await api().request("/api/admin/services/" + encodeURIComponent(item.id), { method: "PATCH", authenticated: true, body: { active: !item.active } }); item.active = !item.active; draw(); ui.showToast("تم تحديث الخدمة.", "success"); }
          catch (error) { ui.showToast(error.message, "danger"); buttonEl.disabled = false; }
        }));
      };
      draw(); return;
    }
    if (live() && document.body.dataset.appPage === "admin-reports") {
      const counts = d.adminStats.requestCounts || {};
      wrap("تقارير المنصة", "مؤشرات مجمعة دون محتوى الطلبات.", stats([["المستخدمون", String(d.adminStats.totalUsers), "حسابات المنصة", "gold"], ["المحامون الموثقون", String(d.adminStats.verifiedLawyers), "ملفات مهنية معتمدة", "success"], ["الطلبات النشطة", String(Object.entries(counts).filter(([status]) => !["completed", "rejected"].includes(status)).reduce((sum, [, total]) => sum + total, 0)), "دون تفاصيل شخصية", "info"]]));
      return;
    }
    if (live() && document.body.dataset.appPage === "admin-settings") { wrap("الإعدادات", "تدار إعدادات الاتصال والصلاحيات من بيئة الخادم.", '<section class="card card--padded">' + empty("لا توجد إعدادات قابلة للتعديل هنا", "لا يُعرض نموذج حفظ صوري في الوضع المتصل.") + '</section>'); return; }
    if (live() && new Set(["client-consultations", "client-cases", "client-case-details", "client-documents", "client-payments", "client-reviews", "lawyer-consultations", "lawyer-cases", "lawyer-case-details", "lawyer-documents", "lawyer-calendar", "lawyer-billing", "lawyer-reviews"]).has(document.body.dataset.appPage)) { wrap("الخدمة قيد التفعيل", "لا توجد بيانات أو إجراءات فعلية لهذه الصفحة بعد.", '<section class="card card--padded">' + empty("الخدمة غير متاحة حاليًا", "لن نعرض بيانات تجريبية ضمن حسابك.") + '</section>'); return; }
    if (document.body.dataset.role === "admin" && !adminReadablePages.has(document.body.dataset.appPage)) {
      restrictedAdminPage();
      return;
    }
    if (document.body.dataset.appPage === "admin-users") {
      usersPage();
      return;
    }
    init();
    enhanceLivePage();
  };
  window.MOWAKAL_PLATFORM = { init: initPlatform };
})();

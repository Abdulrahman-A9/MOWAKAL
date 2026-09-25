(function () {
  const data = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;

  function stat(label, value, hint) {
    return `<article class="card stat-card"><span class="stat-card__label">${label}</span><strong class="stat-card__value">${value}</strong><span class="stat-card__hint">${hint}</span></article>`;
  }

  function activityList() {
    return data.activities.map((item) => `<li class="activity-item"><span class="avatar avatar--sm avatar--${item.tone === "warning" ? "light" : "default"}" aria-hidden="true">${item.icon}</span><span class="activity-item__body"><strong>${item.title}</strong><span>${item.detail}</span></span></li>`).join("");
  }

  function renderClientDashboard() {
    const target = document.querySelector("[data-client-dashboard]");
    if (!target) return;
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">مساحتك القانونية</span><h1>مرحبًا، سلمان</h1><p>تابع استشاراتك القادمة واستكشف محاميًا مناسبًا لاحتياجك.</p></div><div class="page-heading__actions"><a class="button button--primary" href="lawyers.html">⌕ العثور على محامٍ</a></div></div><section class="stats-grid">${stat("الاستشارات النشطة", "٢", "طلبان قيد المتابعة")}${stat("طلبات قيد المراجعة", "١", "بانتظار رد المحامي")}${stat("استشارات مكتملة", "٨", "خلال هذا العام")}${stat("الموعد القادم", "٢٨", "سبتمبر · الساعة ٥:٠٠ م")}</section><div class="dashboard-grid"><section class="card card--padded"><div class="card-header"><div><h2>الموعد القادم</h2><p>استشارة مؤكدة مع د. نورة العتيبي.</p></div><span class="badge badge--success">مؤكد</span></div><div class="appointment"><div class="appointment__date"><strong>٢٨</strong><span>سبتمبر</span></div><div><h3>مراجعة عقد شراكة</h3><p>الأحد · ٥:٠٠ مساءً · مكالمة فيديو</p><span class="muted">رقم الطلب CONS-1048</span></div><a class="button button--outline button--small" href="consultations.html">عرض التفاصيل</a></div></section><section class="card card--padded"><div class="card-header"><div><h2>إجراءات سريعة</h2><p>ابدأ من الخطوة التي تحتاجها الآن.</p></div></div><div class="quick-actions"><a class="quick-action" href="lawyers.html"><span>ابحث عن محامٍ متخصص</span><span>←</span></a><a class="quick-action" href="consultations.html"><span>راجع سجل الاستشارات</span><span>←</span></a></div></section></div><div class="dashboard-grid" style="margin-top:20px"><section class="card card--padded"><div class="card-header"><div><h2>آخر الاستشارات</h2><p>نظرة سريعة على أحدث الطلبات.</p></div><a class="text-link" href="consultations.html">عرض الكل</a></div><div class="consultation-list">${data.consultations.slice(0, 3).map((item) => `<div class="consultation-row"><div class="person-cell"><span class="avatar avatar--sm avatar--light">${item.initials}</span><div><strong>${item.lawyer}</strong><span>${item.subject}</span></div></div>${ui.statusBadge(item.status)}</div>`).join("")}</div></section><section class="card card--padded"><div class="card-header"><div><h2>ملاحظة مهمة</h2><p>حافظ على وضوح معلومات قضيتك.</p></div></div><div class="notice"><span class="icon" aria-hidden="true">i</span><p>كلما كان وصفك للحالة أوضح، ساعد ذلك المحامي على الاستعداد للاستشارة بشكل أفضل.</p></div></section></div>`;
  }

  function renderLawyerDashboard() {
    const target = document.querySelector("[data-lawyer-dashboard]");
    if (!target) return;
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">مساحة المحامي</span><h1>صباح الخير، د. نورة</h1><p>إليك أهم ما يحتاج إلى انتباهك في مساحة العمل اليوم.</p></div><div class="page-heading__actions"><a class="button button--primary" href="cases.html">+ إضافة قضية</a></div></div><section class="stats-grid">${stat("القضايا النشطة", "١٢", "٣ قضايا تحتاج تحديثًا")}${stat("إجمالي العملاء", "٢٨", "٤ عملاء جدد هذا الشهر")}${stat("طلبات الاستشارة", "٥", "طلبان جديدان اليوم")}${stat("المواعيد القادمة", "٤", "أقربها غدًا")}</section><div class="dashboard-grid"><section class="card card--padded"><div class="card-header"><div><h2>طلبات تحتاج قرارًا</h2><p>راجع الطلبات الجديدة وحدد الخطوة التالية.</p></div><span class="badge badge--warning">٥ طلبات</span></div><div class="request-list">${data.consultations.slice(0, 3).map((item) => `<div class="request-row"><div class="person-cell"><span class="avatar avatar--sm avatar--light">${item.initials}</span><div><strong>${item.lawyer}</strong><span>${item.subject}</span></div></div><span class="muted">${item.date}</span><div class="request-row__actions"><button class="button button--outline button--small" type="button" data-request-action>مراجعة</button></div></div>`).join("")}</div></section><section class="card card--padded"><div class="card-header"><div><h2>المواعيد القادمة</h2><p>هذا الأسبوع</p></div><a class="text-link" href="calendar.html">التقويم</a></div><div class="timeline"><div class="timeline__item"><span class="timeline__time">غدًا<br><strong>١٠:٠٠ ص</strong></span><div><strong>مراجعة اتفاقية خدمات</strong><span>مع شركة أفق للاستشارات</span></div></div><div class="timeline__item"><span class="timeline__time">٢٨ سبتمبر<br><strong>٥:٠٠ م</strong></span><div><strong>جلسة متابعة</strong><span>قضية MOW-2048</span></div></div></div></section></div><div class="dashboard-grid" style="margin-top:20px"><section class="card card--padded"><div class="card-header"><div><h2>آخر القضايا</h2><p>القضايا التي تم تحديثها مؤخرًا.</p></div><a class="text-link" href="cases.html">عرض الكل</a></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>القضية</th><th>العميل</th><th>الحالة</th><th>آخر تحديث</th></tr></thead><tbody>${data.cases.slice(0, 4).map((item) => `<tr><td><strong>${item.id}</strong><br><span class="muted">${item.title}</span></td><td>${item.client}</td><td>${ui.statusBadge(item.status)}</td><td>${item.updated}</td></tr>`).join("")}</tbody></table></div></section><section class="card card--padded"><div class="card-header"><div><h2>تنبيهات العمل</h2><p>نقاط تستحق انتباهك.</p></div></div><ul class="activity-list">${activityList()}</ul></section></div>`;
    target.addEventListener("click", (event) => { if (event.target.closest("[data-request-action]")) ui.showToast("راجع بيانات الحالة لاتخاذ القرار المناسب.", "success"); });
  }

  function renderCases() {
    const target = document.querySelector("[data-cases-grid]");
    if (!target) return;
    const tabs = document.querySelectorAll("[data-case-filter]");
    const apply = (filter) => {
      const list = filter === "all" ? data.cases : data.cases.filter((item) => item.status === filter);
      target.innerHTML = list.length ? list.map((item) => `<article class="card case-card"><div class="case-card__header"><div><h3>${item.title}</h3><p>${item.id} · ${item.type}</p></div>${ui.statusBadge(item.status)}</div><div class="case-card__meta"><span>العميل: ${item.client}</span><span>آخر تحديث: ${item.updated}</span></div></article>`).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>لا توجد قضايا بهذا التصنيف</h3><p>ستظهر القضايا هنا عند إنشاء ملف جديد.</p></div>`;
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => { tabs.forEach((item) => item.classList.remove("is-active")); tab.classList.add("is-active"); apply(tab.dataset.caseFilter); }));
    apply("all");
    document.querySelector("[data-new-case]")?.addEventListener("click", () => ui.showToast("لإنشاء قضية جديدة، استكمل بيانات العميل وموضوع القضية.", "success"));
  }

  function renderClients() {
    const target = document.querySelector("[data-clients-table]");
    if (!target) return;
    const search = document.querySelector("[data-client-search]");
    const apply = () => {
      const value = search.value.trim().toLowerCase();
      const list = data.clients.filter((client) => `${client.name} ${client.email}`.toLowerCase().includes(value));
      target.innerHTML = list.length ? list.map((client) => `<tr><td><div class="person-cell"><span class="avatar avatar--sm avatar--light">${client.initials}</span><div><strong>${client.name}</strong><span>${client.email}</span></div></div></td><td>${ui.statusBadge(client.status === "نشطة" ? "active" : "closed")}</td><td>${client.fees}</td><td><button class="button button--ghost button--small" type="button" data-client-action>عرض الملف</button></td></tr>`).join("") : `<tr><td colspan="4"><div class="empty-state"><h3>لا توجد نتائج</h3><p>جرّب اسمًا أو بريدًا مختلفًا.</p></div></td></tr>`;
    };
    search.addEventListener("input", apply);
    document.querySelector("[data-add-client]")?.addEventListener("click", () => ui.showToast("لإضافة عميل جديد، ابدأ بإدخال بياناته الأساسية.", "success"));
    apply();
  }

  function renderDocuments() {
    const target = document.querySelector("[data-documents-table]");
    if (!target) return;
    const filters = document.querySelectorAll("[data-document-filter]");
    const apply = (filter) => {
      const list = filter === "all" ? data.documents : data.documents.filter((item) => item.category === filter);
      target.innerHTML = list.map((doc) => `<tr><td><div class="person-cell"><span class="document-icon" aria-hidden="true">▤</span><div><strong>${doc.name}</strong><span>${doc.type}</span></div></div></td><td>${doc.type}</td><td>${doc.date}</td><td>${doc.by}</td><td><button class="button button--ghost button--small" type="button" data-document-action>فتح</button></td></tr>`).join("");
    };
    filters.forEach((filter) => filter.addEventListener("click", () => { filters.forEach((item) => item.classList.remove("is-active")); filter.classList.add("is-active"); apply(filter.dataset.documentFilter); }));
    document.querySelector("[data-document-file]")?.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) ui.showToast(`تم اختيار الملف «${file.name}». سيظهر بعد التحقق من نوعه وحجمه.`, "success");
    });
    apply("all");
  }

  function renderCalendar() {
    const grid = document.querySelector("[data-calendar-grid]");
    if (!grid) return;
    const monthLabel = document.querySelector("[data-calendar-month]");
    const date = new Date(2026, 8, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    monthLabel.textContent = "سبتمبر ٢٠٢٦";
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const weekdays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
    const cells = weekdays.map((day) => `<span class="calendar-grid__weekday">${day}</span>`).join("");
    let dayCells = "";
    for (let index = 0; index < firstDay; index += 1) dayCells += `<span class="calendar-day is-empty" aria-hidden="true"></span>`;
    for (let day = 1; day <= days; day += 1) {
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const event = data.calendarEvents.find((entry) => entry.date === key);
      dayCells += `<button class="calendar-day ${day === 25 ? "is-current" : ""}" type="button" data-calendar-day="${key}"><span class="calendar-day__number">${day}</span>${event ? `<span class="calendar-day__event">${event.title}</span>` : ""}</button>`;
    }
    grid.innerHTML = cells + dayCells;
    grid.addEventListener("click", (event) => { const day = event.target.closest("[data-calendar-day]"); if (day) ui.showToast(`تم اختيار يوم ${day.dataset.calendarDay}.`, "success"); });
    document.querySelector("[data-add-event]")?.addEventListener("click", () => ui.showToast("لإضافة موعد، اختر اليوم ثم أدخل تفاصيل الاجتماع.", "success"));
  }

  function renderAdminDashboard() {
    const target = document.querySelector("[data-admin-dashboard]");
    if (!target) return;
    target.innerHTML = `<div class="page-heading"><div><span class="eyebrow">إدارة المنصة</span><h1>نظرة عامة على MOWAKAL</h1><p>تابع صحة المنصة وطلبات توثيق المحامين من مساحة واحدة.</p></div><div class="page-heading__actions"><button class="button button--outline" type="button" data-coming-soon>تصدير تقرير</button></div></div><section class="stats-grid">${stat("إجمالي المستخدمين", "١,٢٤٨", "هذا الشهر")}${stat("المحامون المسجلون", "١٨٦", "منهم ١٤٢ موثّقًا")}${stat("طلبات التوثيق", "١٢", "بحاجة إلى مراجعة")}${stat("الاستشارات", "٣٧٤", "خلال الشهر الحالي")}</section><div class="dashboard-grid"><section id="verifications" class="card"><div class="card-header card--padded" style="padding-bottom:0"><div><h2>طلبات توثيق المحامين</h2><p>تحقق من المستندات والبيانات قبل اعتماد الحساب.</p></div><span class="badge badge--warning">١٢ قيد المراجعة</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>المتقدم</th><th>التخصص</th><th>تاريخ الطلب</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>${data.adminVerifications.map((item) => `<tr><td><div class="person-cell"><span class="avatar avatar--sm avatar--light">${item.initials}</span><div><strong>${item.name}</strong><span>طلب توثيق مهني</span></div></div></td><td>${item.specialty}</td><td>${item.submitted}</td><td>${ui.statusBadge(item.status)}</td><td><button class="button button--outline button--small" type="button" data-review-verification>مراجعة</button></td></tr>`).join("")}</tbody></table></div></section><section id="activity" class="card card--padded"><div class="card-header"><div><h2>نشاط المنصة</h2><p>آخر العمليات التي تحتاج إلى متابعة.</p></div></div><ul class="activity-list">${activityList()}</ul></section></div>`;
    target.addEventListener("click", (event) => { if (event.target.closest("[data-review-verification]")) ui.showToast("راجع المستندات والبيانات قبل اتخاذ قرار الاعتماد.", "success"); });
  }

  window.MOWAKAL_DASHBOARD = { renderAdminDashboard, renderCalendar, renderCases, renderClientDashboard, renderClients, renderDocuments, renderLawyerDashboard };
})();

(function () {
  const data = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;

  function renderConsultations(list, target) {
    target.innerHTML = list.length ? list.map((item) => `<article class="card consultation-card"><div class="consultation-card__top"><div class="person-cell"><span class="avatar avatar--sm avatar--light">${item.initials}</span><div><strong>${ui.escapeHtml(item.lawyer)}</strong><span>${ui.escapeHtml(item.subject)}</span></div></div>${ui.statusBadge(item.status)}</div><div class="consultation-card__meta"><span>رقم الطلب: ${item.id}</span><span>التاريخ المطلوب: ${item.date}</span></div><button class="button button--outline button--small" type="button" data-consultation-action="${item.id}">${item.action}</button></article>`).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>لا توجد استشارات بهذه الحالة</h3><p>ستظهر طلباتك هنا عند إرسال أول طلب استشارة.</p><a class="button button--primary button--small" href="lawyers.html">العثور على محامٍ</a></div>`;
  }

  function initConsultations() {
    const target = document.querySelector("[data-consultations-list]");
    if (!target) return;
    const tabs = document.querySelectorAll("[data-consultation-filter]");
    const apply = (filter) => {
      const filtered = filter === "all" ? data.consultations : data.consultations.filter((item) => item.status === filter);
      renderConsultations(filtered, target);
    };
    tabs.forEach((tab) => tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      apply(tab.dataset.consultationFilter);
    }));
    target.addEventListener("click", (event) => {
      if (event.target.closest("[data-consultation-action]")) ui.showToast("هذه معاينة للواجهة. سيُفتح ملف الاستشارة الكامل بعد ربط الواجهة الخلفية.", "warning");
    });
    apply("all");
  }

  window.MOWAKAL_CONSULTATIONS = { initConsultations, renderConsultations };
})();

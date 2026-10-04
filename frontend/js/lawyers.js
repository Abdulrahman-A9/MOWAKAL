(function () {
  const data = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;

  function lawyerCard(lawyer) {
    return `<article class="card lawyer-card">
      <div class="lawyer-card__top">
        <div class="lawyer-card__identity">
          <span class="avatar avatar--${lawyer.accent === "light" ? "light" : "default"}" aria-hidden="true">${ui.escapeHtml(lawyer.initials)}</span>
          <div><h3>${ui.escapeHtml(lawyer.name)}</h3><p>${ui.escapeHtml(lawyer.specialty)}</p></div>
        </div>
        ${lawyer.verified ? '<span class="badge badge--success">✓ موثّق</span>' : ""}
      </div>
      <div class="lawyer-card__meta"><span>⌁ ${ui.escapeHtml(lawyer.city)}</span><span>◷ ${lawyer.experience} سنوات خبرة</span></div>
      <p class="lawyer-card__description">${ui.escapeHtml(lawyer.bio)}</p>
      <div class="lawyer-card__footer"><span class="rating">${ui.formatRating(lawyer.rating, lawyer.reviews)}</span><a class="button button--outline button--small" href="lawyer-profile.html?id=${encodeURIComponent(lawyer.id)}">عرض الملف</a></div>
    </article>`;
  }

  function renderLawyers(list, target) {
    target.innerHTML = list.length ? list.map(lawyerCard).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>لم نعثر على محامين مطابقين</h3><p>جرّب تغيير التخصص أو المدينة أو اكتب كلمة بحث مختلفة.</p><button class="button button--outline button--small" type="button" data-clear-filters>مسح الفلاتر</button></div>`;
  }

  function initDirectory() {
    const target = document.querySelector("[data-lawyers-grid]");
    if (!target) return;
    const search = document.querySelector("[data-lawyer-search]");
    const specialty = document.querySelector("[data-lawyer-specialty]");
    const city = document.querySelector("[data-lawyer-city]");
    const count = document.querySelector("[data-lawyer-count]");
    const params = new URLSearchParams(window.location.search);
    if (params.get("search")) search.value = params.get("search");
    if (params.get("specialty")) specialty.value = params.get("specialty");

    const apply = () => {
      const searchValue = search.value.trim().toLowerCase();
      const selectedSpecialty = specialty.value;
      const selectedCity = city.value;
      const filtered = data.lawyers.filter((lawyer) => {
        const matchesSearch = !searchValue || [lawyer.name, lawyer.specialty, lawyer.city, lawyer.bio].join(" ").toLowerCase().includes(searchValue);
        const matchesSpecialty = !selectedSpecialty || lawyer.specialty === selectedSpecialty;
        const matchesCity = !selectedCity || lawyer.city === selectedCity;
        return matchesSearch && matchesSpecialty && matchesCity;
      });
      count.textContent = `${filtered.length} محامين متاحين`;
      renderLawyers(filtered, target);
    };

    [search, specialty, city].forEach((control) => control.addEventListener("input", apply));
    target.addEventListener("click", (event) => {
      if (event.target.closest("[data-clear-filters]")) {
        search.value = "";
        specialty.value = "";
        city.value = "";
        apply();
      }
    });
    apply();
  }

  function initProfile() {
    const profile = document.querySelector("[data-lawyer-profile]");
    if (!profile) return;
    const id = new URLSearchParams(window.location.search).get("id") || data.lawyers[0]?.id;
    const lawyer = data.lawyers.find((entry) => entry.id === id);
    if (!lawyer) { profile.innerHTML = '<section class="card card--padded"><h2>ملف المحامي غير متاح</h2><a class="button button--outline" href="lawyers.html">العودة للدليل</a></section>'; return; }
    profile.innerHTML = `<div class="profile-header">
      <span class="avatar avatar--lg avatar--${lawyer.accent === "light" ? "light" : "default"}" aria-hidden="true">${ui.escapeHtml(lawyer.initials)}</span>
      <div class="profile-header__copy"><span class="badge badge--success">✓ محامٍ موثّق</span><h2>${ui.escapeHtml(lawyer.name)}</h2><p>${ui.escapeHtml(lawyer.specialty)} · ${ui.escapeHtml(lawyer.city)}</p><span class="rating">${ui.formatRating(lawyer.rating, lawyer.reviews)}</span></div>
      <div class="profile-header__actions"><button class="button button--primary" type="button" data-modal-open="consultationModal">طلب استشارة</button><a class="button button--outline" href="lawyers.html">العودة للدليل</a></div>
    </div>
    <div class="dashboard-grid dashboard-grid--equal">
      <section class="card card--padded"><div class="card-header"><div><h3>نبذة مهنية</h3><p>تعرف على الخبرة والخدمات التي يقدمها المحامي.</p></div></div><p>${ui.escapeHtml(lawyer.bio)}</p><h3 style="margin-top:24px">مجالات الخدمة</h3><div class="chips">${lawyer.services.map((service) => `<span class="badge badge--neutral">${ui.escapeHtml(service)}</span>`).join("")}</div></section>
      <aside class="card card--padded"><div class="card-header"><div><h3>معلومات مهنية</h3><p>بيانات موثقة داخل المنصة.</p></div></div><div class="summary-list"><div class="summary-list__item"><span>رقم الرخصة</span><strong>${ui.escapeHtml(lawyer.license)}</strong></div><div class="summary-list__item"><span>الخبرة</span><strong>${lawyer.experience} سنوات</strong></div><div class="summary-list__item"><span>المدينة</span><strong>${ui.escapeHtml(lawyer.city)}</strong></div><div class="summary-list__item"><span>أتعاب الاستشارة</span><strong>${ui.escapeHtml(lawyer.price)}</strong></div><div class="summary-list__item"><span>المواعيد</span><strong>${ui.escapeHtml(lawyer.availability)}</strong></div></div></aside>
    </div>
    ${window.MOWAKAL_API?.enabled ? '' : '<section class="card card--padded" style="margin-top:20px"><div class="card-header"><div><h3>آراء العملاء</h3><p>تقييمات مختارة من عملاء سابقين.</p></div><span class="badge badge--success">' + ui.escapeHtml(lawyer.rating) + ' من 5</span></div><div class="dashboard-grid dashboard-grid--equal"><blockquote class="quote">“تعامل واضح واحترافي، ساعدني على فهم الخيارات النظامية واتخاذ القرار المناسب.”<footer>— عميل موثّق</footer></blockquote><blockquote class="quote">“الاستشارة كانت منظمة ومباشرة، مع متابعة ممتازة بعد اللقاء.”<footer>— عميلة موثّقة</footer></blockquote></div></section>'}`;

    const modalForm = document.querySelector("[data-consultation-form]");
    if (window.MOWAKAL_API?.enabled && (!window.MOWAKAL_API.hasToken || window.MOWAKAL_API.user?.role !== "client")) {
      profile.querySelector("[data-modal-open]")?.addEventListener("click", (event) => { event.preventDefault(); event.stopImmediatePropagation(); window.location.href = "../login.html"; }, true);
    }
    if (window.MOWAKAL_API?.enabled) modalForm.querySelectorAll('[name="date"], [name="time"]').forEach((field) => { field.closest(".field").hidden = true; field.required = false; });
    modalForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (window.MOWAKAL_API?.enabled) {
        if (!window.MOWAKAL_API.hasToken || window.MOWAKAL_API.user?.role !== "client") { window.location.href = "../login.html"; return; }
        const submit = modalForm.querySelector('[type="submit"]'); submit.disabled = true;
        try {
          const result = await window.MOWAKAL_API.request("/api/requests", { method: "POST", authenticated: true, body: { serviceId: "SERV-001", title: modalForm.elements.subject.value, description: modalForm.elements.description.value, lawyerId: lawyer.id } });
          ui.closeModal(document.getElementById("consultationModal"));
          window.location.href = "request-details.html?id=" + encodeURIComponent(result.requestId);
        } catch (error) { ui.showToast(error.message, "danger"); submit.disabled = false; }
        return;
      }
      ui.closeModal(document.getElementById("consultationModal"));
      ui.showToast("تم إرسال طلب الاستشارة بنجاح. سنخبرك عند تحديث حالته.");
      modalForm.reset();
    });
  }

  window.MOWAKAL_LAWYERS = { initDirectory, initProfile, lawyerCard, renderLawyers };
})();

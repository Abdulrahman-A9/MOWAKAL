(function () {
  function getPrefix() {
    return document.body.dataset.pathPrefix || "";
  }

  function publicHeader() {
    const host = document.getElementById("publicHeader");
    if (!host) return;
    const prefix = getPrefix();
    const current = document.body.dataset.page || "";
    host.innerHTML = `
      <header class="public-header">
        <div class="container public-header__inner">
          <a class="brand" href="${prefix}index.html" aria-label="العودة إلى الصفحة الرئيسية">
            <span class="brand__mark" aria-hidden="true">م</span>
            <span class="brand__copy">MOWAKAL<small>منصة الخدمات القانونية</small></span>
          </a>
          <button class="mobile-nav-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" data-public-nav-toggle>☰</button>
          <nav class="public-nav" aria-label="التنقل الرئيسي" data-public-nav>
            <a class="public-nav__link ${current === "home" ? "is-active" : ""}" href="${prefix}index.html">الرئيسية</a>
            <a class="public-nav__link ${current === "lawyers" ? "is-active" : ""}" href="${prefix}client/lawyers.html">العثور على محامٍ</a>
            <a class="public-nav__link" href="${prefix}index.html#how-it-works">كيف تعمل المنصة؟</a>
          </nav>
          <div class="public-header__actions">
            <a class="button button--outline button--small" href="${prefix}login.html">تسجيل الدخول</a>
            <a class="button button--primary button--small" href="${prefix}register.html">إنشاء حساب</a>
          </div>
        </div>
      </header>`;

    const toggle = host.querySelector("[data-public-nav-toggle]");
    const nav = host.querySelector("[data-public-nav]");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function sidebarMarkup(role) {
    const prefix = getPrefix();
    const groups = {
      client: {
        label: "مساحة العميل",
        user: ["سلمان العبدالله", "عميل"],
        items: [
          ["⌂", "لوحة التحكم", `${prefix}client/dashboard.html`, "client-dashboard"],
          ["⌕", "العثور على محامٍ", `${prefix}client/lawyers.html`, "lawyers"],
          ["◫", "الاستشارات", `${prefix}client/consultations.html`, "consultations"],
          ["✉", "الرسائل", "", "", "يتطلب صلاحية"]
        ]
      },
      lawyer: {
        label: "مساحة المحامي",
        user: ["د. نورة العتيبي", "محامية مرخصة"],
        items: [
          ["⌂", "لوحة التحكم", `${prefix}lawyer/dashboard.html`, "lawyer-dashboard"],
          ["▣", "القضايا", `${prefix}lawyer/cases.html`, "cases"],
          ["♙", "العملاء", `${prefix}lawyer/clients.html`, "clients"],
          ["▤", "المستندات", `${prefix}lawyer/documents.html`, "documents"],
          ["◷", "التقويم", `${prefix}lawyer/calendar.html`, "calendar"],
          ["◌", "الفوترة", "", "", "يتطلب صلاحية"]
        ]
      },
      admin: {
        label: "إدارة المنصة",
        user: ["مشرف MOWAKAL", "مدير النظام"],
        items: [
          ["⌂", "لوحة التحكم", `${prefix}admin/dashboard.html`, "admin-dashboard"],
          ["♙", "المستخدمون", "", "", "يتطلب صلاحية"],
          ["✓", "توثيق المحامين", `${prefix}admin/dashboard.html#verifications`, "admin-dashboard"],
          ["◌", "نشاط المنصة", `${prefix}admin/dashboard.html#activity`, "admin-dashboard"],
          ["▤", "التقارير", "", "", "يتطلب صلاحية"]
        ]
      }
    };
    const config = groups[role] || groups.client;
    const current = document.body.dataset.page || "";
    const items = config.items.map(([icon, label, href, page, soon]) => {
      if (!href) {
        return `<button class="sidebar-link sidebar-link--disabled" type="button" data-coming-soon><span class="sidebar-link__label"><span class="icon" aria-hidden="true">${icon}</span>${label}</span><small>${soon}</small></button>`;
      }
      return `<a class="sidebar-link ${current === page ? "is-active" : ""}" href="${href}"><span class="sidebar-link__label"><span class="icon" aria-hidden="true">${icon}</span>${label}</span></a>`;
    }).join("");

    return `
      <aside class="dashboard-sidebar" aria-label="القائمة الجانبية">
        <button class="sidebar-close" type="button" aria-label="إغلاق القائمة" data-sidebar-close>×</button>
        <a class="brand" href="${prefix}index.html" aria-label="MOWAKAL">
          <span class="brand__mark" aria-hidden="true">م</span>
          <span class="brand__copy">MOWAKAL<small>منصة الخدمات القانونية</small></span>
        </a>
        <span class="sidebar-label">${config.label}</span>
        <nav class="sidebar-nav">${items}</nav>
        <div class="sidebar-user">
          <span class="avatar avatar--sm avatar--light" aria-hidden="true">${config.user[0].slice(0, 2)}</span>
          <span class="sidebar-user__copy"><strong>${config.user[0]}</strong><span>${config.user[1]}</span></span>
        </div>
      </aside>`;
  }

  function dashboardSidebar() {
    const host = document.getElementById("dashboardSidebar");
    if (!host) return;
    host.innerHTML = sidebarMarkup(document.body.dataset.role);
    const backdrop = document.querySelector("[data-sidebar-backdrop]");
    const close = host.querySelector("[data-sidebar-close]");
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const setOpen = (open) => {
      document.body.classList.toggle("sidebar-open", open);
      toggle?.setAttribute("aria-expanded", String(open));
    };
    toggle?.addEventListener("click", () => setOpen(true));
    close?.addEventListener("click", () => setOpen(false));
    backdrop?.addEventListener("click", () => setOpen(false));
  }

  function initNavigation() {
    publicHeader();
    dashboardSidebar();
  }

  window.MOWAKAL_NAV = { initNavigation };
})();

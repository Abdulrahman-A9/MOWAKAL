(function () {
  function prefix() { return document.body.dataset.pathPrefix || ""; }

  const configs = {
    client: {
      label: "مساحة العميل",
      user: ["سلمان العبدالله", "عميل"],
      groups: [
        { label: "الرئيسية", items: [["⌂", "لوحة التحكم", "client/dashboard.html", "client-dashboard"]] },
        { label: "الخدمات والملفات", items: [["▣", "الخدمات القانونية", "client/services.html", "client-services"], ["♙", "المحامون", "client/lawyers.html", "lawyers"], ["＋", "طلباتي", "client/requests.html", "client-requests"], ["◌", "استشاراتي", "client/consultations.html", "client-consultations"], ["▤", "قضاياي", "client/cases.html", "client-cases"]] },
        { label: "المتابعة", items: [["◷", "المواعيد", "client/appointments.html", "client-appointments"], ["□", "المستندات", "client/documents.html", "client-documents"], ["✉", "الرسائل", "client/messages.html", "client-messages"], ["ر", "المدفوعات", "client/payments.html", "client-payments"], ["★", "التقييمات", "client/reviews.html", "client-reviews"]] },
        { label: "الحساب", items: [["⚙", "الملف الشخصي", "client/profile.html", "client-profile"]] }
      ]
    },
    lawyer: {
      label: "مساحة المحامي",
      user: ["د. نورة العتيبي", "محامية مرخصة"],
      groups: [
        { label: "الرئيسية", items: [["⌂", "لوحة التحكم", "lawyer/dashboard.html", "lawyer-dashboard"]] },
        { label: "إدارة العمل", items: [["＋", "الطلبات الجديدة", "lawyer/requests.html", "lawyer-requests"], ["◌", "الاستشارات", "lawyer/consultations.html", "lawyer-consultations"], ["▤", "القضايا", "lawyer/cases.html", "lawyer-cases"], ["♙", "العملاء", "lawyer/clients.html", "lawyer-clients"], ["□", "المستندات", "lawyer/documents.html", "lawyer-documents"]] },
        { label: "التواصل والمال", items: [["◷", "المواعيد", "lawyer/calendar.html", "lawyer-calendar"], ["✉", "الرسائل", "lawyer/messages.html", "lawyer-messages"], ["ر", "الأتعاب والفواتير", "lawyer/billing.html", "lawyer-billing"], ["★", "التقييمات", "lawyer/reviews.html", "lawyer-reviews"]] },
        { label: "الحساب", items: [["⚙", "الملف المهني", "lawyer/profile.html", "lawyer-profile"]] }
      ]
    },
    admin: {
      label: "إدارة المنصة",
      user: ["مشرف MOWAKAL", "مدير النظام"],
      groups: [
        { label: "الرئيسية", items: [["⌂", "لوحة التحكم", "admin/dashboard.html", "admin-dashboard"]] },
        { label: "المستخدمون", items: [["♙", "المستخدمون", "admin/users.html", "admin-users"], ["✓", "توثيق المحامين", "admin/lawyer-verifications.html", "admin-verifications"]] },
        { label: "التشغيل", items: [["▣", "الخدمات القانونية", "admin/services.html", "admin-services"], ["＋", "الطلبات", "admin/requests.html", "admin-requests"], ["◌", "الاستشارات", "admin/consultations.html", "admin-consultations"], ["▤", "القضايا", "admin/cases.html", "admin-cases"], ["□", "المستندات", "admin/documents.html", "admin-documents"], ["ر", "المدفوعات", "admin/payments.html", "admin-payments"]] },
        { label: "المراجعة والتقارير", items: [["★", "التقييمات", "admin/reviews.html", "admin-reviews"], ["↗", "سجل الأنشطة", "admin/activity.html", "admin-activity"], ["▥", "التقارير", "admin/reports.html", "admin-reports"]] },
        { label: "النظام", items: [["⚙", "الإعدادات", "admin/settings.html", "admin-settings"]] }
      ]
    }
  };

  function renderLink(current, item) {
    const [icon, label, link, page] = item;
    return `<a class="sidebar-link ${current === page ? "is-active" : ""}" href="${prefix()}${link}"><span class="sidebar-link__label"><span class="icon" aria-hidden="true">${icon}</span>${label}</span></a>`;
  }

  function sidebarMarkup(role) {
    const config = configs[role] || configs.client;
    const current = document.body.dataset.appPage || document.body.dataset.page || "";
    const groups = config.groups.map((group) => `<section class="sidebar-section"><h2 class="sidebar-section__title">${group.label}</h2><div class="sidebar-section__links">${group.items.map((item) => renderLink(current, item)).join("")}</div></section>`).join("");
    return `<aside class="dashboard-sidebar" aria-label="القائمة الجانبية"><button class="sidebar-close" type="button" aria-label="إغلاق القائمة" data-sidebar-close>×</button><a class="brand" href="${prefix()}index.html" aria-label="العودة للرئيسية"><span class="brand__mark" aria-hidden="true">م</span><span class="brand__copy"><strong>MOWAKAL</strong><small>منصة الخدمات القانونية</small></span></a><div class="sidebar-context"><span class="sidebar-label">${config.label}</span><span class="sidebar-context__status"><i></i> متصل الآن</span></div><nav class="sidebar-nav">${groups}</nav><div class="sidebar-user"><span class="avatar avatar--sm avatar--light" aria-hidden="true">${config.user[0].slice(0, 2)}</span><span class="sidebar-user__copy"><strong>${config.user[0]}</strong><span>${config.user[1]}</span></span><span class="sidebar-user__chevron" aria-hidden="true">‹</span></div></aside>`;
  }

  function publicHeaderMarkup() {
    const current = document.body.dataset.page || "";
    const home = prefix() + "index.html";
    const howItWorks = current === "home" ? "#how-it-works" : home + "#how-it-works";
    const services = current === "home" ? "#services" : home + "#services";
    return `<header class="public-header"><div class="container public-header__inner"><a class="brand" href="${home}" aria-label="العودة إلى الصفحة الرئيسية"><span class="brand__mark" aria-hidden="true">م</span><span class="brand__copy"><strong>MOWAKAL</strong><small>منصة الخدمات القانونية</small></span></a><nav class="public-nav" id="public-nav" aria-label="التنقل الرئيسي"><a class="public-nav__link ${current === "home" ? "is-active" : ""}" href="${home}">الرئيسية</a><a class="public-nav__link ${current === "lawyers" || current === "lawyer-profile" ? "is-active" : ""}" href="${prefix()}client/lawyers.html">المحامون</a><a class="public-nav__link" href="${services}">الخدمات</a><a class="public-nav__link" href="${howItWorks}">كيف تعمل</a></nav><div class="public-header__actions"><a class="button button--outline button--small" href="${prefix()}login.html">تسجيل الدخول</a><a class="button button--primary button--small" href="${prefix()}register.html">إنشاء حساب</a><button class="mobile-nav-toggle" type="button" aria-label="فتح القائمة" aria-expanded="false" aria-controls="public-nav" data-public-nav-toggle>☰</button></div></div></header>`;
  }

  function initPublicHeader() {
    const host = document.getElementById("publicHeader");
    if (!host) return;
    host.innerHTML = publicHeaderMarkup();
    const toggle = host.querySelector("[data-public-nav-toggle]");
    const nav = host.querySelector(".public-nav");
    toggle?.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle?.setAttribute("aria-expanded", "false");
    }));
  }

  function initNavigation() {
    const host = document.getElementById("dashboardSidebar");
    if (!host) return;
    host.innerHTML = sidebarMarkup(document.body.dataset.role);
    const layout = document.querySelector(".dashboard-layout");
    const backdrop = document.querySelector("[data-sidebar-backdrop]");
    const close = host.querySelector("[data-sidebar-close]");
    const toggle = document.querySelector("[data-sidebar-toggle]");
    const setOpen = (value) => {
      document.body.classList.toggle("sidebar-open", value);
      layout?.classList.toggle("sidebar-open", value);
      backdrop?.classList.toggle("is-visible", value);
      toggle?.setAttribute("aria-expanded", String(value));
    };
    toggle?.addEventListener("click", () => setOpen(!layout?.classList.contains("sidebar-open")));
    close?.addEventListener("click", () => setOpen(false));
    backdrop?.addEventListener("click", () => setOpen(false));
  }

  window.MOWAKAL_NAV = { initNavigation, initPublicHeader, sidebarMarkup, publicHeaderMarkup };
})();

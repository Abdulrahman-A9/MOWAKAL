(function () {
  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const role = form.querySelector("[name=role]").value;
      const routes = { client: "client/dashboard.html", lawyer: "lawyer/dashboard.html", admin: "admin/dashboard.html" };
      window.MOWAKAL_UI.showToast("تم تسجيل الدخول بنجاح. جارٍ فتح مساحتك...");
      window.setTimeout(() => { window.location.href = routes[role] || routes.client; }, 650);
    });
  }

  function initRegister() {
    const form = document.querySelector("[data-register-form]");
    if (!form) return;
    const buttons = form.querySelectorAll("[data-register-role]");
    const panels = form.querySelectorAll("[data-role-panel]");
    const setRoleState = (role) => {
      buttons.forEach((item) => item.classList.toggle("is-active", item.dataset.registerRole === role));
      panels.forEach((panel) => {
        const active = panel.dataset.rolePanel === role;
        panel.hidden = !active;
        panel.querySelectorAll("input, select, textarea").forEach((control) => {
          control.disabled = !active;
          control.required = active;
        });
      });
      form.dataset.selectedRole = role;
    };
    buttons.forEach((button) => button.addEventListener("click", () => setRoleState(button.dataset.registerRole)));
    setRoleState(new URLSearchParams(window.location.search).get("role") === "lawyer" ? "lawyer" : "client");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const activePanel = form.querySelector(`[data-role-panel="${form.dataset.selectedRole}"]`);
      const passwords = activePanel.querySelectorAll("input[type=password]");
      const password = passwords[0];
      const confirm = passwords[1];
      if (password.value !== confirm.value) {
        window.MOWAKAL_UI.showToast("تأكد من تطابق كلمتي المرور قبل المتابعة.", "warning");
        confirm.focus();
        return;
      }
      window.MOWAKAL_UI.showToast("تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.");
      window.setTimeout(() => { window.location.href = "login.html"; }, 700);
    });
  }

  function initHome() {
    const target = document.querySelector("[data-home-lawyers]");
    if (target) window.MOWAKAL_LAWYERS.renderLawyers(window.MOWAKAL_DATA.lawyers.slice(0, 3), target);
    const searchForm = document.querySelector("[data-home-search]");
    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = searchForm.querySelector("[name=search]").value.trim();
      const specialty = searchForm.querySelector("[name=specialty]").value;
      const query = new URLSearchParams();
      if (value) query.set("search", value);
      if (specialty) query.set("specialty", specialty);
      window.location.href = `client/lawyers.html${query.toString() ? `?${query}` : ""}`;
    });
  }

  function initPage() {
    if (document.body.dataset.appPage && window.MOWAKAL_PLATFORM) {
      window.MOWAKAL_PLATFORM.init();
      return;
    }
    const page = document.body.dataset.page;
    if (page === "home") initHome();
    if (page === "login") initLogin();
    if (page === "register") initRegister();
    if (page === "lawyers") window.MOWAKAL_LAWYERS.initDirectory();
    if (page === "lawyer-profile") window.MOWAKAL_LAWYERS.initProfile();
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.MOWAKAL_NAV.initNavigation();
    window.MOWAKAL_UI.bindUI();
    initPage();
    document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });
  });
})();

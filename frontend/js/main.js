(function () {
  const data = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;
  const configUrl = new URL("../api-config.json", document.currentScript.src);
  const api = {
    baseUrl: null,
    user: null,
    get enabled() { return this.baseUrl !== null; },
    get hasToken() { return Boolean(sessionStorage.getItem("mowakal_token")); },
    async configure() {
      const response = await fetch(configUrl);
      if (!response.ok) throw new Error("تعذر تحميل إعدادات الاتصال");
      const config = await response.json();
      if (config.apiBaseUrl !== null && typeof config.apiBaseUrl !== "string") throw new Error("عنوان API غير صالح");
      this.baseUrl = config.apiBaseUrl === null ? null : (config.apiBaseUrl.trim().replace(/\/$/, "") || window.location.origin);
    },
    async request(path, { method = "GET", body, authenticated = false } = {}) {
      if (!this.enabled) throw new Error("الخادم غير مفعّل");
      const token = sessionStorage.getItem("mowakal_token");
      if (authenticated && !token) throw new Error("يلزم تسجيل الدخول");
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(this.baseUrl + path, {
          method,
          headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(authenticated ? { Authorization: "Bearer " + token } : {}) },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 401 && authenticated) sessionStorage.removeItem("mowakal_token");
          throw new Error(result.message || "تعذر إكمال الطلب");
        }
        return result;
      } catch (error) {
        if (error.name === "AbortError") throw new Error("انتهت مهلة الاتصال بالخادم");
        if (error instanceof TypeError) throw new Error("تعذر الاتصال بالخادم");
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
  };
  window.MOWAKAL_API = api;

  const initials = (name) => String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
  const roles = { client: "عميل", lawyer: "محامٍ", admin: "مدير النظام", verifier: "مراجع التوثيق" };
  const statuses = { active: "نشط", suspended: "موقوف" };
  const routeFor = (role) => ({ client: "client/dashboard.html", lawyer: "lawyer/dashboard.html", admin: "admin/dashboard.html", verifier: "verifier/dashboard.html" }[role]);
  const appRoot = () => document.querySelector("[data-app-root]");
  const showLoadError = (message) => {
    const root = appRoot() || document.querySelector("main");
    if (root) root.innerHTML = '<section class="card card--padded"><h1>تعذر تحميل الصفحة</h1><p>' + ui.escapeHtml(message) + '</p><button class="button button--primary" type="button" data-retry-load>إعادة المحاولة</button></section>';
    root?.querySelector("[data-retry-load]")?.addEventListener("click", () => window.location.reload());
  };
  const publicData = async () => {
    const [services, lawyers] = await Promise.all([api.request("/api/services"), api.request("/api/lawyers")]);
    data.services = services.services;
    data.lawyers = lawyers.lawyers;
  };
  const emptyPrivateCollections = () => {
    for (const key of ["clients", "requests", "consultations", "cases", "appointments", "documents", "messages", "payments", "reviews", "verifications", "activities"]) data[key] = [];
  };
  const hydrate = async (role) => {
    const result = await api.request("/api/me", { authenticated: true });
    api.user = result.user;
    if (result.user.role !== role) throw new Error("هذا الحساب لا يملك صلاحية هذه المساحة");
    if (role === "admin") {
      const [users, services, activity, stats] = await Promise.all([
        api.request("/api/admin/users", { authenticated: true }),
        api.request("/api/admin/services", { authenticated: true }),
        api.request("/api/admin/activity", { authenticated: true }),
        api.request("/api/admin/stats", { authenticated: true })
      ]);
      data.users = users.users.map((item) => ({ id: item.id, role: roles[item.role] || item.role, status: statuses[item.status] || item.status }));
      data.services = services.services;
      data.activities = activity.activities;
      data.adminStats = stats.stats;
      return;
    }
    emptyPrivateCollections();
    await publicData();
    if (role === "lawyer" && !result.user.verified) {
      const profile = await api.request("/api/me/lawyer-profile", { authenticated: true });
      data.lawyers = [{ ...profile.lawyer, email: result.user.email, phone: result.user.phone || "" }, ...data.lawyers];
      data.currentUser = result.user;
      if (document.body.dataset.appPage !== "lawyer-profile") { window.location.replace("profile.html"); return false; }
      return;
    }
    const [requests, conversations, appointments] = await Promise.all([
      api.request("/api/requests", { authenticated: true }),
      api.request("/api/conversations", { authenticated: true }),
      api.request("/api/appointments", { authenticated: true })
    ]);
    data.requests = requests.requests;
    data.messages = conversations.conversations;
    data.appointments = appointments.appointments.map((item) => ({ ...item, time: item.date ? new Date(item.date).toLocaleTimeString("ar-SA", { hour: "numeric", minute: "2-digit" }) : "", date: item.date ? String(item.date).slice(0, 10) : "" }));
    data.currentUser = result.user;
    if (role === "client") {
      data.clients = [{ id: result.user.id, name: result.user.name, initials: initials(result.user.name), email: result.user.email, phone: result.user.phone || "", city: result.user.city || "", status: "active", requests: data.requests.length, cases: 0 }];
      return;
    }
    const [profile, clients] = await Promise.all([
      api.request("/api/me/lawyer-profile", { authenticated: true }),
      api.request("/api/clients", { authenticated: true })
    ]);
    data.lawyers = [{ ...profile.lawyer, email: result.user.email, phone: result.user.phone || "" }, ...data.lawyers.filter((item) => item.id !== profile.lawyer.id)];
    data.clients = clients.clients;
  };
  const addLogout = () => {
    const host = document.querySelector(".sidebar-user");
    if (!host || host.querySelector("[data-logout]")) return;
    const button = document.createElement("button");
    button.className = "button button--outline button--small";
    button.type = "button";
    button.dataset.logout = "";
    button.textContent = "تسجيل الخروج";
    button.addEventListener("click", () => {
      sessionStorage.removeItem("mowakal_token");
      api.user = null;
      window.location.href = "../login.html";
    });
    host.insertAdjacentElement("afterend", button);
  };

  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    if (!form) return;
    if (api.enabled) form.querySelector("[name=role]")?.closest(".field")?.setAttribute("hidden", "");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!api.enabled) {
        const role = form.querySelector("[name=role]").value;
        ui.showToast("تم تسجيل الدخول بنجاح. جارٍ فتح مساحتك...");
        window.setTimeout(() => { window.location.href = routeFor(role) || routeFor("client"); }, 650);
        return;
      }
      const submit = form.querySelector("[type=submit]");
      submit.disabled = true;
      try {
        const result = await api.request("/api/auth/login", { method: "POST", body: { email: form.elements.email.value, password: form.elements.password.value } });
        const destination = routeFor(result.user.role);
        if (!destination) throw new Error("لا توجد مساحة مخصصة لهذا الدور بعد");
        sessionStorage.setItem("mowakal_token", result.token);
        window.location.href = destination;
      } catch (error) {
        ui.showToast(error.message, "danger");
        submit.disabled = false;
      }
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
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const role = form.dataset.selectedRole;
      const active = form.querySelector('[data-role-panel="' + role + '"]');
      const passwords = active.querySelectorAll("input[type=password]");
      if (passwords[0].value !== passwords[1].value) {
        ui.showToast("تأكد من تطابق كلمتي المرور قبل المتابعة.", "warning");
        passwords[1].focus();
        return;
      }
      if (!api.enabled) {
        ui.showToast("تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.");
        window.setTimeout(() => { window.location.href = "login.html"; }, 700);
        return;
      }
      const field = (name) => active.querySelector('[name="' + name + '"]')?.value;
      const body = role === "lawyer" ? {
        name: field("lawyerFullName"), email: field("lawyerEmail"), phone: field("lawyerPhone"),
        password: passwords[0].value, role, license: field("license"), specialty: field("specialization"), experience: Number(field("experience"))
      } : { name: field("fullName"), email: field("email"), phone: field("phone"), password: passwords[0].value, role };
      const submit = form.querySelector("[type=submit]");
      submit.disabled = true;
      try {
        await api.request("/api/auth/register", { method: "POST", body });
        ui.showToast("تم إنشاء الحساب. يمكنك تسجيل الدخول الآن.", "success");
        window.setTimeout(() => { window.location.href = "login.html"; }, 700);
      } catch (error) {
        ui.showToast(error.message, "danger");
        submit.disabled = false;
      }
    });
  }

  function initHome() {
    const target = document.querySelector("[data-home-lawyers]");
    if (target) window.MOWAKAL_LAWYERS.renderLawyers(data.lawyers.slice(0, 3), target);
    const searchForm = document.querySelector("[data-home-search]");
    searchForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = new URLSearchParams();
      const value = searchForm.querySelector("[name=search]").value.trim();
      const specialty = searchForm.querySelector("[name=specialty]").value;
      if (value) query.set("search", value);
      if (specialty) query.set("specialty", specialty);
      window.location.href = "client/lawyers.html" + (query.toString() ? "?" + query : "");
    });
  }

  async function initVerifier() {
    if (!api.hasToken) { window.location.href = "../login.html"; return; }
    const account = await api.request("/api/me", { authenticated: true });
    if (account.user.role !== "verifier") throw new Error("هذه المساحة مخصصة لمراجع التوثيق فقط");
    api.user = account.user;
    const root = appRoot();
    const draw = async () => {
      const result = await api.request("/api/verifications", { authenticated: true });
      root.innerHTML = '<div class="page-heading"><div><span class="eyebrow">مساحة مراجعة مستقلة</span><h1>توثيق المحامين</h1><p>راجع بيانات الترخيص المهنية فقط. لا تتضمن هذه الصفحة طلبات العملاء أو رسائلهم.</p></div><div class="page-heading__actions"><button type="button" class="button button--outline" data-verifier-logout>تسجيل الخروج</button></div></div><section class="card card--padded"><div class="data-table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>رقم الترخيص</th><th>التخصص</th><th>المدينة</th><th>الخبرة</th><th>القرار</th></tr></thead><tbody>' + (result.verifications.length ? result.verifications.map((item) => '<tr><td>' + ui.escapeHtml(item.name) + '</td><td>' + ui.escapeHtml(item.license) + '</td><td>' + ui.escapeHtml(item.specialty) + '</td><td>' + ui.escapeHtml(item.city || "—") + '</td><td>' + ui.escapeHtml(item.experience) + '</td><td><button type="button" class="button button--primary button--small" data-verification-id="' + ui.escapeHtml(item.id) + '" data-decision="approved">اعتماد</button> <button type="button" class="button button--outline button--small" data-verification-id="' + ui.escapeHtml(item.id) + '" data-decision="rejected">رفض</button></td></tr>').join("") : '<tr><td colspan="6">لا توجد ملفات بانتظار المراجعة.</td></tr>') + '</tbody></table></div></section>';
      root.querySelector("[data-verifier-logout]").addEventListener("click", () => { sessionStorage.removeItem("mowakal_token"); location.href = "../login.html"; });
      root.querySelectorAll("[data-decision]").forEach((button) => button.addEventListener("click", async () => {
        const decision = button.dataset.decision;
        if (!window.confirm(decision === "approved" ? "اعتماد هذا المحامي؟" : "رفض ملف هذا المحامي؟")) return;
        root.querySelectorAll('[data-verification-id="' + button.dataset.verificationId + '"]').forEach((item) => { item.disabled = true; });
        try { await api.request("/api/verifications/" + encodeURIComponent(button.dataset.verificationId), { method: "PATCH", authenticated: true, body: { decision } }); ui.showToast("تم تسجيل قرار المراجعة.", "success"); await draw(); }
        catch (error) { ui.showToast(error.message, "danger"); root.querySelectorAll('[data-verification-id="' + button.dataset.verificationId + '"]').forEach((item) => { item.disabled = false; }); }
      }));
    };
    await draw();
  }

  async function initPage() {
    await api.configure();
    const role = document.body.dataset.role;
    const page = document.body.dataset.page;
    if (role === "verifier" && document.body.dataset.appPage === "verifier-dashboard") {
      if (!api.enabled) throw new Error("تحتاج مساحة المراجعة إلى خادم موصول");
      await initVerifier();
      return;
    }
    if (role && document.body.dataset.appPage && window.MOWAKAL_PLATFORM) {
      if (api.enabled) {
        if (!api.hasToken) { window.location.href = "../login.html"; return; }
        if (await hydrate(role) === false) return;
        addLogout();
      }
      window.MOWAKAL_PLATFORM.init();
      return;
    }
    if (api.enabled && ["home", "lawyers", "lawyer-profile", "service-request"].includes(page)) {
      await publicData();
      if (["service-request", "lawyer-profile"].includes(page) && api.hasToken) {
        const result = await api.request("/api/me", { authenticated: true });
        api.user = result.user;
      }
    }
    if (page === "home") initHome();
    if (page === "service-request") window.MOWAKAL_PUBLIC_REQUEST.init();
    if (page === "login") initLogin();
    if (page === "register") initRegister();
    if (page === "lawyers") window.MOWAKAL_LAWYERS.initDirectory();
    if (page === "lawyer-profile") window.MOWAKAL_LAWYERS.initProfile();
  }

  document.addEventListener("DOMContentLoaded", () => {
    window.MOWAKAL_NAV.initNavigation();
    window.MOWAKAL_NAV.initPublicHeader();
    ui.bindUI();
    initPage().catch((error) => showLoadError(error.message));
    document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });
  });
})();

(function () {
  const data = window.MOWAKAL_DATA;
  const ui = window.MOWAKAL_UI;
  const escape = ui.escapeHtml;
  const steps = ["الخدمة", "التفاصيل", "المرفقات", "التفضيلات", "المراجعة"];

  function serviceFromQuery() {
    const id = new URLSearchParams(window.location.search).get("service");
    return data.services.find((item) => item.id === id && item.active)?.id || "";
  }

  function stepMarkup(selectedService) {
    return [
      '<section class="wizard-step is-active" data-step="0"><h2>ما الخدمة التي تحتاجها؟</h2><p class="public-request-step-note">اختر الخدمة الأقرب إلى احتياجك، ويمكنك تغييرها قبل الإرسال.</p><div class="option-grid">' + data.services.filter((item) => item.active).map((item) => '<label class="select-card"><input type="radio" name="service" value="' + escape(item.id) + '" ' + (selectedService === item.id ? "checked" : "") + ' required><span><strong>' + escape(item.name) + '</strong><small>' + escape(item.description) + '</small></span></label>').join("") + '</div></section>',
      '<section class="wizard-step" data-step="1"><h2>تفاصيل الطلب</h2><p class="public-request-step-note">أضف معلومات التواصل ووصفًا موجزًا لمساعدتنا على توجيه طلبك.</p><div class="form-grid"><label>الاسم<input name="name" autocomplete="name" required placeholder="الاسم الكامل"></label><label>البريد الإلكتروني<input name="email" type="email" autocomplete="email" required placeholder="name@example.com"></label><label>رقم الجوال<input name="phone" type="tel" autocomplete="tel" required placeholder="05xxxxxxxx"></label><label>عنوان الطلب<input name="title" required placeholder="مثال: مراجعة عقد توريد"></label><label>الأولوية<select name="urgency"><option>عادية</option><option>عالية</option><option>عاجلة</option></select></label><label>المدينة<select name="city" required><option value="">اختر المدينة</option><option>الرياض</option><option>جدة</option><option>الدمام</option><option>مكة المكرمة</option><option>المدينة المنورة</option></select></label></div><label class="public-request-description">وصف الطلب<textarea name="description" required placeholder="اكتب ملخصًا للوقائع أو الأسئلة التي تحتاج إلى مراجعتها."></textarea></label></section>',
      '<section class="wizard-step" data-step="2"><h2>المرفقات</h2><p class="public-request-step-note">أرفق الملفات التي تساعد على فهم طلبك. هذه الخطوة اختيارية.</p><label class="upload-zone"><input type="file" multiple data-request-files><span aria-hidden="true">＋</span><strong>اختر ملفات من جهازك</strong><small>يمكنك المتابعة دون إرفاق ملفات</small></label><div class="selected-files" data-request-file-names></div></section>',
      '<section class="wizard-step" data-step="3"><h2>تفضيلات التواصل</h2><p class="public-request-step-note">حدّد طريقة التواصل والموعد الذي يناسبك، أو اترك الموعد فارغًا.</p><div class="form-grid"><label>المحامي المفضل<select name="lawyer"><option value="">ترشيح محامٍ مناسب</option>' + data.lawyers.map((item) => '<option value="' + escape(item.id) + '">' + escape(item.name) + ' · ' + escape(item.specialty) + '</option>').join("") + '</select></label><label>طريقة التواصل<select name="method"><option>مكالمة مرئية</option><option>مكالمة هاتفية</option><option>محادثة نصية</option></select></label><label>التاريخ المفضل<input type="date" name="date"></label><label>الوقت المفضل<input type="time" name="time"></label></div></section>',
      '<section class="wizard-step" data-step="4"><h2>راجع طلبك</h2><p class="public-request-step-note">تأكد من التفاصيل قبل إكمال الطلب.</p><div class="public-request-summary" data-request-summary></div></section>'
    ].join("");
  }

  function init() {
    const form = document.querySelector("[data-public-request]");
    if (!form) return;
    const api = window.MOWAKAL_API;
    if (api.enabled && (!api.hasToken || api.user?.role !== "client")) {
      const host = document.querySelector("[data-request-steps]");
      form.hidden = true;
      host.insertAdjacentHTML("afterend", '<section class="card card--padded"><h2>سجّل الدخول لإرسال طلبك</h2><p>تُحفظ تفاصيل الطلب في حساب العميل، ولا نجمع وقائع قانونية قبل تسجيل الدخول.</p><a class="button button--primary" href="login.html">تسجيل الدخول</a></section>');
      return;
    }
    const progress = document.querySelector("[data-request-progress]");
    const stepHost = document.querySelector("[data-request-steps]");
    const next = document.querySelector("[data-request-next]");
    const back = document.querySelector("[data-request-back]");
    const success = document.querySelector("[data-request-success]");
    const selectedService = serviceFromQuery();
    let currentStep = 0;
    progress.innerHTML = steps.map((label, index) => '<span class="' + (index === 0 ? "is-active" : "") + '" data-progress-step="' + index + '"' + (index === 0 ? ' aria-current="step"' : "") + '>' + (index + 1) + ". " + label + '</span>').join("");
    stepHost.innerHTML = stepMarkup(selectedService);
    if (api.enabled) {
      for (const name of ["name", "email", "phone"]) {
        const field = form.elements[name];
        field.value = api.user?.[name] || "";
        field.readOnly = true;
        if (name === "phone") field.required = false;
      }
      const upload = form.querySelector("[data-request-files]");
      upload.disabled = true;
      upload.closest("label").replaceWith(Object.assign(document.createElement("p"), { className: "field-help", textContent: "رفع الملفات غير متاح حاليًا. لا تختَر مستندات حساسة قبل تفعيل التخزين الآمن." }));
      form.querySelectorAll('[name="date"], [name="time"], [name="method"]').forEach((field) => { field.closest("label").hidden = true; });
      form.querySelector('[data-step="3"] h2').textContent = "المحامي المفضل";
      form.querySelector('[data-step="3"] p').textContent = "اختر محاميًا من الدليل أو اترك الاختيار للمنصة. تحديد موعد الاستشارة يتم لاحقًا بعد قبول الطلب.";
    }
    const panels = [...stepHost.querySelectorAll("[data-step]")];

    const selectedServiceName = (serviceId) => data.services.find((item) => item.id === serviceId)?.name || "—";
    const selectedLawyerName = (lawyerId) => data.lawyers.find((item) => item.id === lawyerId)?.name || "ترشيح محامٍ مناسب";
    const summaryRow = (label, value) => '<div class="public-request-summary__row"><span>' + escape(label) + '</span><strong>' + escape(value || "—") + '</strong></div>';

    function renderSummary() {
      const values = new FormData(form);
      const summary = form.querySelector("[data-request-summary]");
      summary.innerHTML = [
        summaryRow("الخدمة", selectedServiceName(values.get("service"))),
        summaryRow("الاسم", values.get("name")),
        summaryRow("البريد الإلكتروني", values.get("email")),
        summaryRow("رقم الجوال", values.get("phone")),
        summaryRow("عنوان الطلب", values.get("title")),
        summaryRow("الأولوية", values.get("urgency")),
        summaryRow("المدينة", values.get("city")),
        summaryRow("وصف الطلب", values.get("description")),
        summaryRow("المحامي المفضل", selectedLawyerName(values.get("lawyer"))),
        ...(api.enabled ? [] : [summaryRow("طريقة التواصل", values.get("method")), summaryRow("التاريخ والوقت", [values.get("date"), values.get("time")].filter(Boolean).join(" · "))])
      ].join("");
    }

    function render() {
      panels.forEach((panel, index) => panel.classList.toggle("is-active", index === currentStep));
      progress.querySelectorAll("[data-progress-step]").forEach((item, index) => {
        item.classList.toggle("is-active", index === currentStep);
        if (index === currentStep) item.setAttribute("aria-current", "step");
        else item.removeAttribute("aria-current");
      });
      back.hidden = currentStep === 0;
      next.textContent = currentStep === panels.length - 1 ? (api.enabled ? "إرسال الطلب" : "عرض ملخص الطلب") : "التالي";
      if (currentStep === panels.length - 1) renderSummary();
      panels[currentStep].querySelector("h2")?.focus({ preventScroll: true });
    }

    function showSuccess() {
      const summary = form.querySelector("[data-request-summary]").innerHTML;
      form.hidden = true;
      progress.hidden = true;
      success.hidden = false;
      success.innerHTML = '<span class="public-request-success__icon" aria-hidden="true">✓</span><span class="eyebrow">اكتملت مراجعة التفاصيل</span><h2>ملخص طلبك جاهز</h2><p>راجع المعلومات التي أدخلتها في الملخص أدناه قبل إكمال تواصلك بشأن الخدمة.</p><div class="public-request-summary public-request-success__summary">' + summary + '</div><div class="public-request-success__actions"><a class="button button--primary" href="index.html">العودة للرئيسية</a><a class="button button--outline" href="client/lawyers.html">استعراض المحامين</a></div>';
    }

    next.addEventListener("click", async () => {
      if (currentStep < panels.length - 1) {
        const invalid = [...panels[currentStep].querySelectorAll("[required]")].find((field) => !field.checkValidity());
        if (invalid) {
          invalid.reportValidity();
          invalid.focus();
          return;
        }
        currentStep += 1;
        render();
        return;
      }
      if (!api.enabled) { showSuccess(); return; }
      const values = new FormData(form);
      next.disabled = true;
      try {
        const result = await api.request("/api/requests", { method: "POST", authenticated: true, body: { serviceId: values.get("service"), title: values.get("title"), description: values.get("description"), urgency: values.get("urgency"), city: values.get("city"), lawyerId: values.get("lawyer") || null } });
        form.hidden = true;
        progress.hidden = true;
        success.hidden = false;
        success.innerHTML = '<h2>تم إرسال الطلب</h2><p>رقم طلبك: ' + escape(result.requestId) + '</p><a class="button button--primary" href="client/request-details.html?id=' + encodeURIComponent(result.requestId) + '">متابعة الطلب</a>';
      } catch (error) { ui.showToast(error.message, "danger"); next.disabled = false; }
    });
    back.addEventListener("click", () => {
      if (currentStep === 0) return;
      currentStep -= 1;
      render();
    });
    form.querySelector("[data-request-files]")?.addEventListener("change", (event) => {
      form.querySelector("[data-request-file-names]").innerHTML = [...event.target.files].map((file) => '<span class="badge badge--neutral">' + escape(file.name) + '</span>').join("");
    });
    render();
  }

  window.MOWAKAL_PUBLIC_REQUEST = { init };
})();

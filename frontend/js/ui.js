(function () {
  function ensureToastRegion() {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  function showToast(message, tone) {
    const region = ensureToastRegion();
    const toast = document.createElement("div");
    toast.className = `toast toast--${tone || "success"}`;
    toast.innerHTML = `<span class="icon" aria-hidden="true">${tone === "warning" ? "!" : "✓"}</span><span>${message}</span>`;
    region.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4200);
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    const firstControl = modal.querySelector("input, select, textarea, button");
    if (firstControl) firstControl.focus();
  }

  function closeModal(modal) {
    const element = typeof modal === "string" ? document.getElementById(modal) : modal;
    if (!element) return;
    element.hidden = true;
    document.body.classList.remove("modal-open");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatRating(rating, reviews) {
    return `<span class="star-rating" aria-label="تقييم ${rating} من 5">★★★★★</span><span>${rating} (${reviews})</span>`;
  }

  function statusBadge(status) {
    const map = {
      pending: ["قيد المراجعة", "warning"],
      accepted: ["مقبولة", "success"],
      completed: ["مكتملة", "neutral"],
      rejected: ["مرفوضة", "danger"],
      active: ["نشطة", "success"],
      closed: ["مغلقة", "neutral"]
    };
    const entry = map[status] || [status, "neutral"];
    return `<span class="badge badge--${entry[1]}">${entry[0]}</span>`;
  }

  function bindUI() {
    document.addEventListener("click", (event) => {
      const openTrigger = event.target.closest("[data-modal-open]");
      if (openTrigger) openModal(openTrigger.dataset.modalOpen);

      const closeTrigger = event.target.closest("[data-modal-close]");
      if (closeTrigger) closeModal(closeTrigger.closest(".modal-backdrop"));

      if (event.target.classList.contains("modal-backdrop")) closeModal(event.target);

      const comingSoon = event.target.closest("[data-coming-soon]");
      if (comingSoon) showToast("هذا القسم مُجهّز للمرحلة القادمة من المنصة.", "warning");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(closeModal);
      }
    });
  }

  window.MOWAKAL_UI = {
    bindUI,
    closeModal,
    escapeHtml,
    formatRating,
    openModal,
    showToast,
    statusBadge
  };
})();

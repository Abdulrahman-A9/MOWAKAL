(function () {
  const data = window.MOWAKAL_DATA || {};
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[char]));
  const toneFor = (status) => ({ completed: "success", accepted: "success", approved: "success", paid: "success", scheduled: "success", active: "success", in_progress: "info", under_review: "warning", waiting_lawyer: "warning", pending: "warning", more_info: "warning", rejected: "danger", cancelled: "danger", unpaid: "danger" }[status] || "neutral");
  const labelFor = (status, fallback = "الحالة") => Object.values(data.statusLabels || {}).reduce((label, group) => label || group[status], "") || fallback;
  function statusBadge(status, fallback) { return `<span class="badge badge--${toneFor(status)}">${escapeHtml(labelFor(status, fallback))}</span>`; }
  function showToast(message, tone = "info") {
    let host = document.querySelector("[data-toast-host]");
    if (!host) { host = document.createElement("div"); host.className = "toast-host"; host.dataset.toastHost = ""; document.body.appendChild(host); }
    const toast = document.createElement("div"); toast.className = `toast toast--${tone}`; toast.innerHTML = `<span class="toast__icon">${tone === "success" ? "✓" : tone === "danger" ? "!" : "i"}</span><span>${escapeHtml(message)}</span>`; host.appendChild(toast); window.setTimeout(() => toast.remove(), 3600);
  }
  function openModal(id) { const modal = typeof id === "string" ? document.getElementById(id) : id; modal?.removeAttribute("hidden"); modal?.querySelector("button, input, select, textarea")?.focus(); }
  function closeModal(id) { const modal = typeof id === "string" ? document.getElementById(id) : id; modal?.setAttribute("hidden", ""); }
  function formatRating(rating, reviews) { return `<span class="rating"><span aria-hidden="true">★</span> ${rating} <small>(${reviews} تقييم)</small></span>`; }
  function bindUI() {
    document.addEventListener("click", (event) => {
      const open = event.target.closest("[data-modal-open]"); if (open) openModal(open.dataset.modalOpen);
      const close = event.target.closest("[data-modal-close]"); if (close) closeModal(close.closest(".modal"));
      if (event.target.classList.contains("modal")) closeModal(event.target);
    });
    document.querySelectorAll("[data-coming-soon]").forEach((button) => button.addEventListener("click", () => showToast("هذه الإضافة متاحة ضمن مساحة العمل الحالية.", "info")));
  }
  window.MOWAKAL_UI = { escapeHtml, statusBadge, showToast, openModal, closeModal, formatRating, bindUI, toneFor, labelFor };
})();

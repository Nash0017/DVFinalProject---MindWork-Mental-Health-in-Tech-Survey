/**
 * @file main.js
 * @description Dashboard controller for the Mental Health in Tech Survey visualisation.
 *              Handles: tab navigation, filter controls, KPI updates,
 *              and orchestrates the rendering/re-rendering of all D3 charts.
 *
 * Authors: Nashama Asim (FA23-BDS-056) · Naqiya Ezzy (FA23-BDS-064)
 * Course:  DSC327 — Data Visualization Techniques
 */

"use strict";

/* ══════════════════════════════════════════════════════════════
   ENTRY POINT — wait for DOM
══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initFilters();
  initTabs();
  renderAll();
  initResizeObserver();
});

/* ══════════════════════════════════════════════════════════════
   1.  FILTERS
══════════════════════════════════════════════════════════════ */

/**
 * Populates all filter <select> elements and attaches change listeners.
 */
function initFilters() {
  populateSelect("filter-country",      "country",      RAW_DATA);
  populateSelect("filter-gender",       "gender",       RAW_DATA);
  populateSelect("filter-company-size", "no_employees", RAW_DATA);

  document.getElementById("filter-country")
    .addEventListener("change", e => { FILTERS.country = e.target.value; renderAll(); });

  document.getElementById("filter-gender")
    .addEventListener("change", e => { FILTERS.gender = e.target.value; renderAll(); });

  document.getElementById("filter-company-size")
    .addEventListener("change", e => { FILTERS.no_employees = e.target.value; renderAll(); });

  document.getElementById("filter-remote")
    .addEventListener("change", e => { FILTERS.remote_work = e.target.value; renderAll(); });

  document.getElementById("filter-reset")
    .addEventListener("click", () => {
      FILTERS.country      = "all";
      FILTERS.gender       = "all";
      FILTERS.no_employees = "all";
      FILTERS.remote_work  = "all";
      ["filter-country","filter-gender","filter-company-size","filter-remote"]
        .forEach(id => { document.getElementById(id).value = "all"; });
      renderAll();
    });
}

/* ══════════════════════════════════════════════════════════════
   2.  TAB NAVIGATION
══════════════════════════════════════════════════════════════ */

/**
 * Attaches click listeners to tab buttons and shows/hides panels.
 */
function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels  = document.querySelectorAll(".tab-panel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      panels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");

      /* Re-render charts in the newly visible tab so they size correctly. */
      const data = getFilteredData();
      renderTabCharts(btn.dataset.tab, data);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   3.  KPI STRIP
══════════════════════════════════════════════════════════════ */

/**
 * Computes and updates all KPI card values from the filtered dataset.
 * @param {Object[]} data
 */
function updateKPIs(data) {
  const total   = data.length;
  const treated = data.filter(d => d.treatment === "Yes").length;
  const treatPct = total > 0 ? ((treated / total) * 100).toFixed(1) : "0.0";

  const remote  = data.filter(d => d.remote_work === "Yes").length;
  const remotePct = total > 0 ? ((remote / total) * 100).toFixed(1) : "0.0";

  const oftenPct = total > 0
    ? ((data.filter(d => d.work_interfere === "Often").length / total) * 100).toFixed(1)
    : "0.0";

  const benefitPct = total > 0
    ? ((data.filter(d => d.benefits === "Yes").length / total) * 100).toFixed(1)
    : "0.0";

  setText("kpi-total",   total.toLocaleString());
  setText("kpi-treated", treatPct + "%");
  setText("kpi-remote",  remotePct + "%");
  setText("kpi-often",   oftenPct + "%");

  setText("kpi-total-sub",   `of ${RAW_DATA.length} total respondents`);
  setText("kpi-treated-sub", "sought mental health treatment");
  setText("kpi-remote-sub",  "work remotely ≥50% of time");
  setText("kpi-often-sub",   "report frequent work interference");
}

/* Helper — safely sets textContent */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ══════════════════════════════════════════════════════════════
   4.  RENDER ORCHESTRATION
══════════════════════════════════════════════════════════════ */

/**
 * Full re-render: updates KPIs and all charts in the active tab.
 */
function renderAll() {
  const data = getFilteredData();
  updateKPIs(data);

  /* Determine which tab is active */
  const activeBtn = document.querySelector(".tab-btn.active");
  const activeTab = activeBtn ? activeBtn.dataset.tab : "tab-overview";
  renderTabCharts(activeTab, data);
}

/**
 * Renders only the charts belonging to the given tab.
 * Avoids unnecessary work on hidden panels.
 *
 * @param {string}   tabId
 * @param {Object[]} data
 */
function renderTabCharts(tabId, data) {
  switch (tabId) {
    case "tab-overview":
      renderCountryBar(data);
      renderDonutChart(data);
      renderAgeHistogram(data);
      break;

    case "tab-treatment":
      renderFamilyTreatment(data);
      renderGenderTreatment(data);
      renderBenefitsTreatment(data);
      break;

    case "tab-workplace":
      renderHeatmap(data);
      renderRemoteTreatment(data);
      renderSupportChart(data);
      break;

    case "tab-demographics":
      renderBubbleChart(data);
      break;

    default:
      break;
  }
}

/* ══════════════════════════════════════════════════════════════
   5.  RESPONSIVE RESIZE
══════════════════════════════════════════════════════════════ */

/**
 * Re-renders charts when the window is resized (debounced 200 ms).
 */
function initResizeObserver() {
  let timeout;
  window.addEventListener("resize", () => {
    clearTimeout(timeout);
    timeout = setTimeout(renderAll, 200);
  });
}

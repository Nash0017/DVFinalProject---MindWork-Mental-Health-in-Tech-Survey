/**
 * @file utils.js
 * @description Shared utility functions for the Mental Health Visualisation dashboard.
 *              Provides filtering, aggregation, tooltip, and responsive-sizing helpers.
 */

"use strict";

/* ──────────────────────────────────────────────────────────────
   1. GLOBAL STATE
────────────────────────────────────────────────────────────── */

/**
 * Holds the currently active filter values.
 * Mutated in-place by applyFilters(); read by every chart's render function.
 */
const FILTERS = {
  country:     "all",
  gender:      "all",
  no_employees:"all",
  remote_work: "all",
};

/* ──────────────────────────────────────────────────────────────
   2. DATA HELPERS
────────────────────────────────────────────────────────────── */

/**
 * Returns the subset of RAW_DATA that satisfies all active filters.
 * @returns {Object[]} Filtered data rows.
 */
function getFilteredData() {
  return RAW_DATA.filter(d => {
    if (FILTERS.country      !== "all" && d.country      !== FILTERS.country)      return false;
    if (FILTERS.gender       !== "all" && d.gender        !== FILTERS.gender)       return false;
    if (FILTERS.no_employees !== "all" && d.no_employees  !== FILTERS.no_employees) return false;
    if (FILTERS.remote_work  !== "all" && d.remote_work   !== FILTERS.remote_work)  return false;
    return true;
  });
}

/**
 * Counts occurrences of each unique value for a given field.
 * @param {Object[]} data
 * @param {string}   field
 * @returns {Object} { value: count, … }
 */
function countBy(data, field) {
  return data.reduce((acc, d) => {
    const key = d[field] || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Groups data by a key field and optionally sub-keys.
 * @param {Object[]} data
 * @param {string}   keyField
 * @returns {Map}
 */
function groupBy(data, keyField) {
  return d3.group(data, d => d[keyField]);
}

/**
 * Calculates what % of a group sought treatment.
 * @param {Object[]} group
 * @returns {number} 0–100
 */
function treatmentRate(group) {
  if (!group || group.length === 0) return 0;
  return (group.filter(d => d.treatment === "Yes").length / group.length) * 100;
}

/**
 * Returns the top-N entries of an object sorted by value descending.
 * @param {Object} counts
 * @param {number} n
 * @returns {Array<{key, value}>}
 */
function topN(counts, n) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
}

/* ──────────────────────────────────────────────────────────────
   3. TOOLTIP HELPER
────────────────────────────────────────────────────────────── */

const tooltip = d3.select("#global-tooltip");

/**
 * Positions and shows the shared tooltip.
 * @param {MouseEvent} event  — Browser mouse event.
 * @param {string}     html   — Inner HTML to display.
 */
function showTooltip(event, html) {
  tooltip
    .style("opacity", 1)
    .html(html)
    .style("left", (event.pageX + 14) + "px")
    .style("top",  (event.pageY - 28) + "px");
}

/** Hides the shared tooltip. */
function hideTooltip() {
  tooltip.style("opacity", 0);
}

/* ──────────────────────────────────────────────────────────────
   4. DIMENSION HELPER
────────────────────────────────────────────────────────────── */

/**
 * Returns the available pixel width of a container element.
 * @param {string} selector — CSS selector for the chart container.
 * @returns {number}
 */
function getContainerWidth(selector) {
  const el = document.querySelector(selector);
  return el ? el.getBoundingClientRect().width : 600;
}

/* ──────────────────────────────────────────────────────────────
   5. FILTER POPULATION HELPERS
────────────────────────────────────────────────────────────── */

/**
 * Populates a <select> element with unique sorted values from a data field.
 * @param {string}   selectId — The element id (without #).
 * @param {string}   field    — Data field to extract values from.
 * @param {Object[]} data     — Full dataset.
 */
function populateSelect(selectId, field, data) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const values = [...new Set(data.map(d => d[field]))].sort();
  values.forEach(val => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    select.appendChild(opt);
  });
}

/* ──────────────────────────────────────────────────────────────
   6. ANIMATION HELPER
────────────────────────────────────────────────────────────── */

/**
 * Standard easing for bar/area transitions.
 */
const TRANSITION = () => d3.transition().duration(600).ease(d3.easeCubicOut);

/* ──────────────────────────────────────────────────────────────
   7. NUMBER FORMAT
────────────────────────────────────────────────────────────── */

/**
 * Formats a percentage to one decimal place.
 * @param {number} val
 * @returns {string}
 */
function pct(val) {
  return d3.format(".1f")(val) + "%";
}

/**
 * @file heatmap.js
 * @description Heatmap showing the count of respondents by company size (rows)
 *              and how often mental health interferes with work (columns).
 *              Colour encodes cell frequency; tooltips show raw counts and %.
 */

"use strict";

/**
 * Renders (or re-renders) the work-interference heatmap.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderHeatmap(data) {
  const containerId = "#chart-heatmap";
  const container   = document.querySelector(containerId);
  if (!container) return;

  /* ── Axes ── */
  const xValues = WORK_INTERFERE_ORDER;
  const yValues = COMPANY_SIZE_ORDER;

  /* ── Margins & dimensions ── */
  const margin = { top: 20, right: 30, bottom: 56, left: 120 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 380);
  const width  = totalW - margin.left - margin.right;
  const height = yValues.length * 52;

  /* ── Build frequency matrix ── */
  const matrix = {};
  yValues.forEach(row => {
    matrix[row] = {};
    xValues.forEach(col => { matrix[row][col] = 0; });
  });
  data.forEach(d => {
    const r = d.no_employees;
    const c = d.work_interfere;
    if (matrix[r] && c in matrix[r]) matrix[r][c]++;
  });

  /* ── Flat cell array ── */
  const cells = [];
  yValues.forEach(row => {
    xValues.forEach(col => {
      cells.push({ row, col, value: matrix[row][col] });
    });
  });

  const maxVal = d3.max(cells, d => d.value) || 1;

  /* ── Colour scale — cream → deep periwinkle ── */
  const colourScale = d3.scaleSequential()
    .domain([0, maxVal])
    .interpolator(d3.interpolate("#f5f0ff", "#6878d0"));

  /* ── Clear old ── */
  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── Scales ── */
  const x = d3.scaleBand().domain(xValues).range([0, width]).padding(0.08);
  const y = d3.scaleBand().domain(yValues).range([0, height]).padding(0.08);

  /* ── X axis ── */
  svg.append("g")
    .attr("class","axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text")
        .attr("fill","#7068a8")
        .attr("font-size","12px")
        .attr("font-weight","500")
        .attr("dy","1.4em");
    });

  /* ── Y axis ── */
  svg.append("g")
    .attr("class","axis")
    .call(d3.axisLeft(y).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text")
        .attr("fill","#4a3f80")
        .attr("font-size","11.5px")
        .attr("font-weight","500")
        .attr("dx","-6px");
    });

  /* ── Axis labels ── */
  svg.append("text")
    .attr("x", width / 2).attr("y", height + 50)
    .attr("text-anchor","middle")
    .attr("fill","#7068a8").attr("font-size","12px")
    .text("Frequency of Work Interference");

  /* ── Cells ── */
  svg.selectAll(".heatmap-cell")
    .data(cells)
    .join("rect")
    .attr("class","heatmap-cell")
    .attr("x", d => x(d.col))
    .attr("y", d => y(d.row))
    .attr("width",  x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("rx", 6).attr("ry", 6)
    .attr("fill", "#f5f0ff")
    .on("mousemove", (event, d) => {
      const rowTotal = xValues.reduce((s, c) => s + matrix[d.row][c], 0);
      const share    = rowTotal > 0 ? ((d.value / rowTotal) * 100).toFixed(1) : "0.0";
      showTooltip(event, `
        <strong>${d.row}</strong><br/>
        Work interference: <b>${d.col}</b><br/>
        Count: <b>${d.value}</b><br/>
        % of company size: <b>${share}%</b>
      `);
    })
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("fill", d => colourScale(d.value));

  /* ── Cell text (count) ── */
  svg.selectAll(".cell-label")
    .data(cells)
    .join("text")
    .attr("class","cell-label")
    .attr("x", d => x(d.col) + x.bandwidth() / 2)
    .attr("y", d => y(d.row) + y.bandwidth() / 2 + 5)
    .attr("text-anchor","middle")
    .attr("font-size","13px")
    .attr("font-weight","600")
    .attr("fill", d => d.value > maxVal * 0.55 ? "#fff" : "#5050a0")
    .text(d => d.value > 0 ? d.value : "");

  /* ── Colour legend ── */
  const legendW = 150, legendH = 10;
  const legendX = width - legendW;
  const legendY = height + 40;

  const defs  = svg.append("defs");
  const gradId = "heatmap-grad";
  const grad  = defs.append("linearGradient").attr("id", gradId);
  grad.append("stop").attr("offset","0%").attr("stop-color","#f5f0ff");
  grad.append("stop").attr("offset","100%").attr("stop-color","#6878d0");

  svg.append("rect")
    .attr("x", legendX).attr("y", legendY)
    .attr("width", legendW).attr("height", legendH)
    .attr("rx", 4)
    .attr("fill", `url(#${gradId})`);

  svg.append("text")
    .attr("x", legendX).attr("y", legendY - 4)
    .attr("fill","#9990c0").attr("font-size","10px")
    .text("Low");

  svg.append("text")
    .attr("x", legendX + legendW).attr("y", legendY - 4)
    .attr("text-anchor","end")
    .attr("fill","#9990c0").attr("font-size","10px")
    .text("High");
}

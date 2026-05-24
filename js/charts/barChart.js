/**
 * @file barChart.js
 * @description Horizontal bar chart — Top-10 countries by respondent count.
 *              Supports animated enter/update/exit transitions and rich tooltips.
 */

"use strict";

/**
 * Renders (or re-renders) the country bar chart.
 * Called on page load and whenever filters change.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderCountryBar(data) {
  const containerId = "#chart-country";
  const container   = document.querySelector(containerId);
  if (!container) return;

  /* ── Dimensions ── */
  const margin = { top: 16, right: 56, bottom: 28, left: 130 };
  const width  = Math.max(container.getBoundingClientRect().width - 24, 320)
                   - margin.left - margin.right;
  const barHeight = 28;

  /* ── Compute top-10 countries ── */
  const counts = countBy(data, "country");
  const top10  = topN(counts, 10);

  const height = top10.length * (barHeight + 10) - 10;

  /* ── Remove old SVG ── */
  d3.select(containerId).select("svg").remove();

  if (top10.length === 0) {
    d3.select(containerId).append("p")
      .attr("class", "no-data-msg")
      .text("No data for current filters.");
    return;
  }

  /* ── SVG ── */
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  width  + margin.left + margin.right)
    .attr("height", height + margin.top  + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── Scales ── */
  const xMax = d3.max(top10, d => d.value);
  const x = d3.scaleLinear()
    .domain([0, xMax])
    .range([0, width])
    .nice();

  const y = d3.scaleBand()
    .domain(top10.map(d => d.key))
    .range([0, height])
    .padding(0.28);

  /* ── Colour scale (pastel blues, graded) ── */
  const colour = d3.scaleSequential()
    .domain([0, top10.length - 1])
    .interpolator(d3.interpolate("#c8dcf5", "#7aaee0"));

  /* ── X axis ── */
  svg.append("g")
    .attr("class", "axis axis-x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickSize(-height).tickFormat(d3.format("d")))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick line").attr("stroke","#e8e4f5").attr("stroke-dasharray","3,3");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  /* ── Y axis ── */
  svg.append("g")
    .attr("class", "axis axis-y")
    .call(d3.axisLeft(y).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text")
        .attr("fill","#4a3f80")
        .attr("font-size","12px")
        .attr("font-weight","500");
    });

  /* ── Bars ── */
  svg.selectAll(".bar")
    .data(top10)
    .join(
      enter => enter.append("rect")
        .attr("class","bar")
        .attr("x", 0)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("rx", 6).attr("ry", 6)
        .attr("fill", (_, i) => colour(i))
        .attr("width", 0)
        .call(e => e.transition(TRANSITION())
          .attr("width", d => x(d.value))),

      update => update.call(u => u.transition(TRANSITION())
        .attr("y", d => y(d.key))
        .attr("width", d => x(d.value))
        .attr("fill", (_, i) => colour(i))),

      exit => exit.call(ex => ex.transition(TRANSITION())
        .attr("width", 0).remove())
    )
    /* ── Tooltips ── */
    .on("mousemove", (event, d) => {
      const total = data.length;
      const pctVal = ((d.value / total) * 100).toFixed(1);
      showTooltip(event, `
        <strong>${d.key}</strong><br/>
        Respondents: <b>${d.value}</b><br/>
        Share: <b>${pctVal}%</b>
      `);
    })
    .on("mouseleave", hideTooltip);

  /* ── Value labels ── */
  svg.selectAll(".bar-label")
    .data(top10)
    .join("text")
    .attr("class","bar-label")
    .attr("x", d => x(d.value) + 6)
    .attr("y", d => y(d.key) + y.bandwidth() / 2 + 4)
    .attr("fill","#6a60a0")
    .attr("font-size","11px")
    .attr("font-weight","600")
    .text(d => d.value);
}

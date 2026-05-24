/**
 * @file bubbleChart.js
 * @description Three charts for the Workplace & Demographics tabs:
 *    1. renderBubbleChart     — Age vs work-interference scatter/bubble chart.
 *    2. renderRemoteTreatment — Remote vs on-site treatment rate comparison.
 *    3. renderSupportChart    — Employer support index (lollipop chart).
 */

"use strict";

/* ══════════════════════════════════════════════════════════════
   1.  BUBBLE / SCATTER: Age vs Work Interference
══════════════════════════════════════════════════════════════ */

/**
 * Renders an age × work-interference scatter chart.
 * Bubble size = count in that cell, colour = treatment rate.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderBubbleChart(data) {
  const containerId = "#chart-bubble";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 24, right: 40, bottom: 60, left: 100 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 380);
  const width  = totalW - margin.left - margin.right;
  const height = 280;

  /* ── Bin ages into 5-yr groups and cross-tabulate with work_interfere ── */
  const ageBins = [[18,25],[25,32],[32,39],[39,46],[46,55],[55,70]];
  const wiLevels = WORK_INTERFERE_ORDER;

  const cells = [];
  ageBins.forEach(([lo, hi]) => {
    wiLevels.forEach(wi => {
      const subset = data.filter(d => +d.age >= lo && +d.age < hi && d.work_interfere === wi);
      const yes    = subset.filter(d => d.treatment === "Yes").length;
      cells.push({
        ageMid: (lo + hi) / 2,
        ageLabel: `${lo}–${hi}`,
        wi,
        count: subset.length,
        treatRate: subset.length > 0 ? (yes / subset.length) * 100 : 0,
      });
    });
  });

  const maxCount = d3.max(cells, d => d.count) || 1;

  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── Scales ── */
  const x = d3.scalePoint()
    .domain(ageBins.map(b => `${b[0]}–${b[1]}`))
    .range([0, width]).padding(0.5);

  const y = d3.scalePoint()
    .domain(wiLevels)
    .range([height, 0]).padding(0.5);

  const r = d3.scaleSqrt()
    .domain([0, maxCount])
    .range([0, 28]);

  const colour = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolate(PALETTE.mint, PALETTE.lavender));

  /* ── Gridlines ── */
  svg.selectAll(".grid-x")
    .data(ageBins.map(b => `${b[0]}–${b[1]}`)).join("line")
    .attr("class","grid-x")
    .attr("x1", d => x(d)).attr("x2", d => x(d))
    .attr("y1", 0).attr("y2", height)
    .attr("stroke","#ede8f8").attr("stroke-dasharray","4,3");

  svg.selectAll(".grid-y")
    .data(wiLevels).join("line")
    .attr("class","grid-y")
    .attr("x1", 0).attr("x2", width)
    .attr("y1", d => y(d)).attr("y2", d => y(d))
    .attr("stroke","#ede8f8").attr("stroke-dasharray","4,3");

  /* ── Axes ── */
  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#7068a8").attr("font-size","11px").attr("dy","1.6em");
    });

  svg.append("g").call(d3.axisLeft(y).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","11.5px").attr("font-weight","500");
    });

  /* ── Axis labels ── */
  svg.append("text")
    .attr("x", width/2).attr("y", height + 50)
    .attr("text-anchor","middle")
    .attr("fill","#9990c0").attr("font-size","12px")
    .text("Age Group");

  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2).attr("y", -82)
    .attr("text-anchor","middle")
    .attr("fill","#9990c0").attr("font-size","12px")
    .text("Work Interference Frequency");

  /* ── Bubbles ── */
  svg.selectAll(".bubble")
    .data(cells.filter(d => d.count > 0))
    .join("circle")
    .attr("class","bubble")
    .attr("cx", d => x(d.ageLabel))
    .attr("cy", d => y(d.wi))
    .attr("r", 0)
    .attr("fill", d => colour(d.treatRate))
    .attr("stroke","#fff").attr("stroke-width",2)
    .attr("opacity", 0.88)
    .on("mousemove", (event, d) =>
      showTooltip(event, `
        <strong>Age ${d.ageLabel}</strong><br/>
        Work interference: <b>${d.wi}</b><br/>
        Count: <b>${d.count}</b><br/>
        Treatment rate: <b>${d.treatRate.toFixed(1)}%</b>
      `))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("r", d => r(d.count));

  /* ── Bubble size legend ── */
  const sizeLegend = svg.append("g")
    .attr("transform", `translate(${width - 160}, 4)`);

  sizeLegend.append("text")
    .attr("y", -4).attr("fill","#9990c0").attr("font-size","10px").text("Bubble size = count");

  [1, Math.round(maxCount/2), maxCount].forEach((v, i) => {
    const cx = i * 48 + 20;
    sizeLegend.append("circle")
      .attr("cx", cx).attr("cy", 26)
      .attr("r", r(v))
      .attr("fill","none").attr("stroke","#b0a8d8").attr("stroke-width",1.5);
    sizeLegend.append("text")
      .attr("x", cx).attr("y", 26 + r(v) + 12)
      .attr("text-anchor","middle")
      .attr("fill","#9990c0").attr("font-size","9px")
      .text(v);
  });
}

/* ══════════════════════════════════════════════════════════════
   2.  REMOTE WORK vs TREATMENT  (grouped vertical bars)
══════════════════════════════════════════════════════════════ */

/**
 * Renders the remote work vs treatment comparison chart.
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderRemoteTreatment(data) {
  const containerId = "#chart-remote-treatment";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 24, right: 24, bottom: 60, left: 52 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 260);
  const width  = totalW - margin.left - margin.right;
  const height = 220;

  /* ── Aggregate ── */
  const cats = ["Yes", "No"];
  const agg = cats.map(remote => {
    const subset = data.filter(d => d.remote_work === remote);
    const yes    = subset.filter(d => d.treatment === "Yes").length;
    const rate   = subset.length > 0 ? (yes / subset.length) * 100 : 0;
    return { remote, rate, count: subset.length, yes };
  }).filter(d => d.count > 0);

  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const labels = { "Yes": "Remote Workers", "No": "On-site Workers" };
  const colours= { "Yes": PALETTE.mint, "No": PALETTE.peach };

  const x = d3.scaleBand()
    .domain(agg.map(d => d.remote))
    .range([0, width]).padding(0.45);
  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]).nice();

  /* ── Grid ── */
  svg.append("g").attr("class","grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll("line").attr("stroke","#ede8f8").attr("stroke-dasharray","3,3");
    });

  /* ── Axes ── */
  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0).tickFormat(d => labels[d]))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","12px").attr("font-weight","500").attr("dy","1.6em");
    });

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  /* ── Bars ── */
  svg.selectAll(".remote-bar")
    .data(agg).join("rect")
    .attr("class","remote-bar")
    .attr("x", d => x(d.remote))
    .attr("y", height)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("rx", 8)
    .attr("fill", d => colours[d.remote])
    .on("mousemove", (event, d) =>
      showTooltip(event, `<strong>${labels[d.remote]}</strong><br/>Treatment rate: <b>${d.rate.toFixed(1)}%</b><br/>Respondents: <b>${d.count}</b>`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("y", d => y(d.rate))
    .attr("height", d => height - y(d.rate));

  /* ── Labels ── */
  svg.selectAll(".remote-label")
    .data(agg).join("text")
    .attr("x", d => x(d.remote) + x.bandwidth() / 2)
    .attr("y", d => y(d.rate) - 8)
    .attr("text-anchor","middle")
    .attr("fill","#4a3f80").attr("font-size","16px").attr("font-weight","700")
    .text(d => d.rate.toFixed(1) + "%");
}

/* ══════════════════════════════════════════════════════════════
   3.  EMPLOYER SUPPORT INDEX  (lollipop chart)
══════════════════════════════════════════════════════════════ */

/**
 * Renders a lollipop chart showing the % of respondents who answered
 * "Yes" for each of four employer support dimensions.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderSupportChart(data) {
  const containerId = "#chart-support";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 16, right: 56, bottom: 32, left: 152 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 280);
  const width  = totalW - margin.left - margin.right;

  /* ── Dimensions ── */
  const metrics = [
    { key: "benefits",        label: "Provides Benefits",   field: "benefits" },
    { key: "care_options",    label: "Care Options Known",  field: "care_options" },
    { key: "wellness_program",label: "Wellness Programme",  field: "wellness_program" },
    { key: "seek_help",       label: "Help Resources",      field: "seek_help" },
    { key: "anonymity",       label: "Anonymity Assured",   field: "anonymity" },
  ];

  const agg = metrics.map(m => ({
    label: m.label,
    pct: data.length > 0
      ? (data.filter(d => d[m.field] === "Yes").length / data.length) * 100
      : 0,
  }));

  const barH = 36;
  const height = agg.length * (barH + 12);

  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const y = d3.scaleBand().domain(agg.map(d => d.label)).range([0, height]).padding(0.4);

  const colourScale = d3.scaleSequential()
    .domain([0, agg.length - 1])
    .interpolator(d3.interpolate(PALETTE.mint, PALETTE.blue));

  /* ── X axis ── */
  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  /* ── Y axis ── */
  svg.append("g").call(d3.axisLeft(y).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","11.5px").attr("font-weight","500").attr("dx","-6px");
    });

  /* ── Track lines ── */
  svg.selectAll(".lollipop-track")
    .data(agg).join("line")
    .attr("class","lollipop-track")
    .attr("x1", 0).attr("x2", width)
    .attr("y1", d => y(d.label) + y.bandwidth() / 2)
    .attr("y2", d => y(d.label) + y.bandwidth() / 2)
    .attr("stroke","#ede8f8").attr("stroke-width", 1.5).attr("stroke-dasharray","3,3");

  /* ── Lollipop stems ── */
  svg.selectAll(".lollipop-stem")
    .data(agg).join("line")
    .attr("class","lollipop-stem")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", d => y(d.label) + y.bandwidth() / 2)
    .attr("y2", d => y(d.label) + y.bandwidth() / 2)
    .attr("stroke", (_, i) => colourScale(i)).attr("stroke-width", 2.5)
    .transition(TRANSITION().duration(700))
    .attr("x2", d => x(d.pct));

  /* ── Lollipop heads ── */
  svg.selectAll(".lollipop-head")
    .data(agg).join("circle")
    .attr("class","lollipop-head")
    .attr("cx", 0)
    .attr("cy", d => y(d.label) + y.bandwidth() / 2)
    .attr("r", 8)
    .attr("fill", (_, i) => colourScale(i))
    .attr("stroke","#fff").attr("stroke-width", 2)
    .on("mousemove", (event, d) =>
      showTooltip(event, `<strong>${d.label}</strong><br/>Employer offers: <b>${d.pct.toFixed(1)}%</b>`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("cx", d => x(d.pct));

  /* ── Value labels ── */
  svg.selectAll(".lollipop-val")
    .data(agg).join("text")
    .attr("class","lollipop-val")
    .attr("x", d => x(d.pct) + 14)
    .attr("y", d => y(d.label) + y.bandwidth() / 2 + 5)
    .attr("fill","#5050a0").attr("font-size","12px").attr("font-weight","700")
    .text(d => d.pct.toFixed(1) + "%");
}

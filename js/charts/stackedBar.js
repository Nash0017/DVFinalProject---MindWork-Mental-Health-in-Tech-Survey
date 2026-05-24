/**
 * @file stackedBar.js
 * @description Three grouped/stacked bar charts for the Treatment Analysis tab:
 *    1. renderFamilyTreatment — Family history vs treatment (grouped bars).
 *    2. renderGenderTreatment — Gender vs treatment rate (horizontal bars).
 *    3. renderBenefitsTreatment — Employer benefits vs treatment (stacked bars).
 */

"use strict";

/* ══════════════════════════════════════════════════════════════
   1.  FAMILY HISTORY vs TREATMENT  (grouped vertical bar chart)
══════════════════════════════════════════════════════════════ */

/**
 * Renders the family history vs treatment grouped bar chart.
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderFamilyTreatment(data) {
  const containerId = "#chart-family-treatment";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 24, right: 24, bottom: 64, left: 48 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 280);
  const width  = totalW - margin.left - margin.right;
  const height = 240;

  /* ── Aggregate ── */
  const groups = ["Yes", "No"];   // family_history
  const subGroups = ["Treatment: Yes", "Treatment: No"];

  const agg = groups.map(fh => {
    const subset = data.filter(d => d.family_history === fh);
    return {
      key: fh === "Yes" ? "Has Family History" : "No Family History",
      "Treatment: Yes": subset.filter(d => d.treatment === "Yes").length,
      "Treatment: No":  subset.filter(d => d.treatment === "No").length,
    };
  });

  const maxVal = d3.max(agg, d => Math.max(d["Treatment: Yes"], d["Treatment: No"])) || 1;

  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().domain(agg.map(d => d.key)).range([0, width]).padding(0.3);
  const x1 = d3.scaleBand().domain(subGroups).range([0, x0.bandwidth()]).padding(0.08);
  const y  = d3.scaleLinear().domain([0, maxVal]).range([height, 0]).nice();

  const colours = { "Treatment: Yes": PALETTE.blue, "Treatment: No": PALETTE.pink };

  /* ── Grid ── */
  svg.append("g").attr("class","grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll("line").attr("stroke","#ede8f8").attr("stroke-dasharray","3,3");
    });

  /* ── Axes ── */
  svg.append("g").attr("transform",`translate(0,${height})`)
    .call(d3.axisBottom(x0).tickSize(0))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","12px").attr("font-weight","500").attr("dy","1.6em");
    });

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  /* ── Bar groups ── */
  const group = svg.selectAll(".family-group")
    .data(agg).join("g")
    .attr("class","family-group")
    .attr("transform", d => `translate(${x0(d.key)},0)`);

  group.selectAll("rect")
    .data(d => subGroups.map(sg => ({ key: sg, value: d[sg] })))
    .join("rect")
    .attr("x",  d => x1(d.key))
    .attr("y",  height)
    .attr("width",  x1.bandwidth())
    .attr("height", 0)
    .attr("rx", 5)
    .attr("fill", d => colours[d.key])
    .on("mousemove", (event, d) => showTooltip(event, `<strong>${d.key}</strong><br/>Count: <b>${d.value}</b>`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("y",      d => y(d.value))
    .attr("height", d => height - y(d.value));

  /* ── Legend ── */
  const lg = svg.append("g").attr("transform", `translate(0,${height + 44})`);
  subGroups.forEach((sg, i) => {
    const g = lg.append("g").attr("transform",`translate(${i * 150}, 0)`);
    g.append("rect").attr("width",11).attr("height",11).attr("rx",3).attr("fill", colours[sg]);
    g.append("text").attr("x",16).attr("y",10).attr("fill","#6060a0").attr("font-size","11px").text(sg);
  });
}

/* ══════════════════════════════════════════════════════════════
   2.  GENDER vs TREATMENT RATE  (horizontal bars)
══════════════════════════════════════════════════════════════ */

/**
 * Renders the gender vs treatment-rate horizontal bar chart.
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderGenderTreatment(data) {
  const containerId = "#chart-gender-treatment";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 24, right: 70, bottom: 40, left: 72 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 280);
  const width  = totalW - margin.left - margin.right;

  /* ── Aggregate ── */
  const genders = ["Male", "Female", "Other"];
  const agg = genders.map(g => {
    const subset = data.filter(d => d.gender === g);
    const rate   = subset.length > 0
      ? (subset.filter(d => d.treatment === "Yes").length / subset.length) * 100
      : 0;
    return { gender: g, rate, count: subset.length };
  }).filter(d => d.count > 0);

  const barH = 42;
  const height = agg.length * (barH + 14) + 10;

  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const y = d3.scaleBand().domain(agg.map(d => d.gender)).range([0, height]).padding(0.32);

  const colourMap = { Male: PALETTE.blue, Female: PALETTE.pink, Other: PALETTE.lavender };

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
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","13px").attr("font-weight","600");
    });

  /* ── Background track bars ── */
  svg.selectAll(".bar-track")
    .data(agg).join("rect")
    .attr("class","bar-track")
    .attr("x", 0).attr("y", d => y(d.gender))
    .attr("width", width).attr("height", y.bandwidth())
    .attr("rx", 6).attr("fill","#f0edf8");

  /* ── Value bars ── */
  svg.selectAll(".bar-rate")
    .data(agg).join("rect")
    .attr("class","bar-rate")
    .attr("x", 0).attr("y", d => y(d.gender))
    .attr("height", y.bandwidth()).attr("rx", 6)
    .attr("fill", d => colourMap[d.gender] || PALETTE.blue)
    .attr("width", 0)
    .on("mousemove", (event, d) =>
      showTooltip(event, `<strong>${d.gender}</strong><br/>Treatment rate: <b>${d.rate.toFixed(1)}%</b><br/>Sample: <b>${d.count}</b>`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("width", d => x(d.rate));

  /* ── Percentage labels ── */
  svg.selectAll(".rate-label")
    .data(agg).join("text")
    .attr("class","rate-label")
    .attr("x",  d => x(d.rate) + 6)
    .attr("y",  d => y(d.gender) + y.bandwidth() / 2 + 5)
    .attr("fill","#5050a0").attr("font-size","13px").attr("font-weight","700")
    .text(d => d.rate.toFixed(1) + "%");

  /* ── X axis label ── */
  svg.append("text")
    .attr("x", width / 2).attr("y", height + 36)
    .attr("text-anchor","middle")
    .attr("fill","#9990c0").attr("font-size","11px")
    .text("% who sought mental health treatment");
}

/* ══════════════════════════════════════════════════════════════
   3.  BENEFITS vs TREATMENT  (stacked 100% bar chart)
══════════════════════════════════════════════════════════════ */

/**
 * Renders the employer benefits vs treatment stacked bar chart.
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderBenefitsTreatment(data) {
  const containerId = "#chart-benefits-treatment";
  const container   = document.querySelector(containerId);
  if (!container) return;

  const margin = { top: 24, right: 30, bottom: 72, left: 130 };
  const totalW = Math.max(container.getBoundingClientRect().width - 24, 380);
  const width  = totalW - margin.left - margin.right;
  const height = 200;

  /* ── Aggregate by benefits category ── */
  const benefitVals = ["Yes", "No", "Don't know"];
  const agg = benefitVals.map(b => {
    const subset = data.filter(d => d.benefits === b);
    const yes    = subset.filter(d => d.treatment === "Yes").length;
    const no     = subset.filter(d => d.treatment === "No").length;
    const total  = yes + no;
    return {
      benefits: b,
      yes, no, total,
      yesPct: total > 0 ? (yes / total) * 100 : 0,
      noPct:  total > 0 ? (no  / total) * 100 : 0,
    };
  }).filter(d => d.total > 0);

  d3.select(containerId).select("svg").remove();

  if (agg.length === 0) return;

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
  const y = d3.scaleBand().domain(agg.map(d => d.benefits)).range([0, height]).padding(0.32);

  /* ── Axes ── */
  svg.append("g").attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  svg.append("g").call(d3.axisLeft(y).tickSize(0))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll(".tick text").attr("fill","#4a3f80").attr("font-size","12px").attr("font-weight","600").attr("dx","-6px");
    });

  /* ── Y axis title ── */
  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2).attr("y", -118)
    .attr("text-anchor","middle")
    .attr("fill","#7068a8").attr("font-size","11px")
    .text("Employer Mental Health Benefits");

  /* ── "No treatment" segment (right portion, pink) ── */
  svg.selectAll(".seg-no")
    .data(agg).join("rect")
    .attr("class","seg-no")
    .attr("x", d => x(d.yesPct))
    .attr("y", d => y(d.benefits))
    .attr("height", y.bandwidth())
    .attr("rx", 0).attr("fill", PALETTE.pink)
    .attr("width", 0)
    .on("mousemove",(event,d) =>
      showTooltip(event, `Benefits: <b>${d.benefits}</b><br/>No treatment: <b>${d.no}</b> (${d.noPct.toFixed(1)}%)`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("width", d => x(d.noPct));

  /* ── "Yes treatment" segment (left, blue) ── */
  svg.selectAll(".seg-yes")
    .data(agg).join("rect")
    .attr("class","seg-yes")
    .attr("x", 0)
    .attr("y", d => y(d.benefits))
    .attr("height", y.bandwidth())
    .attr("rx", 0).attr("fill", PALETTE.blue)
    .attr("width", 0)
    .on("mousemove",(event,d) =>
      showTooltip(event, `Benefits: <b>${d.benefits}</b><br/>Sought treatment: <b>${d.yes}</b> (${d.yesPct.toFixed(1)}%)`))
    .on("mouseleave", hideTooltip)
    .transition(TRANSITION().duration(700))
    .attr("width", d => x(d.yesPct));

  /* ── Percentage labels inside bars ── */
  svg.selectAll(".pct-label-yes")
    .data(agg).join("text")
    .attr("x", d => x(d.yesPct) / 2)
    .attr("y", d => y(d.benefits) + y.bandwidth() / 2 + 5)
    .attr("text-anchor","middle")
    .attr("fill","#fff").attr("font-size","12px").attr("font-weight","700")
    .text(d => d.yesPct > 10 ? d.yesPct.toFixed(0)+"%" : "");

  svg.selectAll(".pct-label-no")
    .data(agg).join("text")
    .attr("x", d => x(d.yesPct) + x(d.noPct) / 2)
    .attr("y", d => y(d.benefits) + y.bandwidth() / 2 + 5)
    .attr("text-anchor","middle")
    .attr("fill","#fff").attr("font-size","12px").attr("font-weight","700")
    .text(d => d.noPct > 10 ? d.noPct.toFixed(0)+"%" : "");

  /* ── Legend ── */
  const lg = svg.append("g").attr("transform", `translate(0, ${height + 44})`);
  [{label:"Sought Treatment", colour:PALETTE.blue},{label:"No Treatment", colour:PALETTE.pink}]
    .forEach((item, i) => {
      const g = lg.append("g").attr("transform",`translate(${i * 160}, 0)`);
      g.append("rect").attr("width",11).attr("height",11).attr("rx",3).attr("fill",item.colour);
      g.append("text").attr("x",16).attr("y",10).attr("fill","#6060a0").attr("font-size","11px").text(item.label);
    });

  /* ── N annotation ── */
  agg.forEach(d => {
    svg.append("text")
      .attr("x", width + 8)
      .attr("y", y(d.benefits) + y.bandwidth() / 2 + 5)
      .attr("fill","#9990c0").attr("font-size","10px")
      .text(`n=${d.total}`);
  });
}

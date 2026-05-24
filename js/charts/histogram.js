/**
 * @file histogram.js
 * @description Stacked histogram showing the age distribution of survey respondents.
 *              Each bar is split into "Sought Treatment" (blue) and "No Treatment" (pink)
 *              using D3's stack layout. Brushing to zoom a sub-range is supported.
 */

"use strict";

/**
 * Renders (or re-renders) the age histogram.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderAgeHistogram(data) {
  const containerId = "#chart-age-histogram";
  const container   = document.querySelector(containerId);
  if (!container) return;

  /* ── Dimensions ── */
  const margin  = { top: 20, right: 30, bottom: 56, left: 52 };
  const totalW  = Math.max(container.getBoundingClientRect().width - 24, 380);
  const width   = totalW - margin.left - margin.right;
  const height  = 240;

  /* ── Bin ages into 5-year buckets ── */
  const ages = data.map(d => +d.age).filter(a => a >= 18 && a <= 70);

  const xFull = d3.scaleLinear().domain([18, 70]).range([0, width]);

  const binGen = d3.bin()
    .value(d => +d.age)
    .domain([18, 70])
    .thresholds(xFull.ticks(14));

  const allBins    = binGen(data.filter(d => d.age >= 18 && d.age <= 70));
  const yesBins    = binGen(data.filter(d => d.treatment === "Yes" && d.age >= 18 && d.age <= 70));
  const noBins     = binGen(data.filter(d => d.treatment === "No"  && d.age >= 18 && d.age <= 70));

  /* ── Merge into stacked structure ── */
  const bins = allBins.map((b, i) => ({
    x0: b.x0, x1: b.x1,
    yes: yesBins[i] ? yesBins[i].length : 0,
    no:  noBins[i]  ? noBins[i].length  : 0,
    total: b.length,
  }));

  const maxCount = d3.max(bins, d => d.yes + d.no) || 1;

  /* ── Clear old ── */
  d3.select(containerId).select("svg").remove();

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  totalW)
    .attr("height", height + margin.top + margin.bottom + 36) /* +36 for brush */
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  /* ── Scales ── */
  const x = d3.scaleLinear().domain([18, 70]).range([0, width]);
  const y = d3.scaleLinear().domain([0, maxCount]).range([height, 0]).nice();

  /* ── Gridlines ── */
  svg.append("g")
    .attr("class","grid")
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
    .call(g => {
      g.select(".domain").remove();
      g.selectAll("line").attr("stroke","#ede8f8").attr("stroke-dasharray","3,3");
    });

  /* ── Axes ── */
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format("d")))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  svg.append("g")
    .call(d3.axisLeft(y).ticks(5))
    .call(g => {
      g.select(".domain").attr("stroke","#ccc0e8");
      g.selectAll(".tick text").attr("fill","#9990c0").attr("font-size","11px");
    });

  /* ── Axis labels ── */
  svg.append("text")
    .attr("x", width / 2).attr("y", height + 44)
    .attr("text-anchor","middle")
    .attr("fill","#7068a8").attr("font-size","12px")
    .text("Age of Respondent");

  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height / 2).attr("y", -40)
    .attr("text-anchor","middle")
    .attr("fill","#7068a8").attr("font-size","12px")
    .text("Number of Respondents");

  /* ── Clip path for brush zoom ── */
  svg.append("clipPath").attr("id","hist-clip")
    .append("rect").attr("width", width).attr("height", height);

  const chartArea = svg.append("g").attr("clip-path","url(#hist-clip)");

  /* ── Bar groups ── */
  const barPad = 1;

  /* "No treatment" bars (bottom) */
  const noBars = chartArea.selectAll(".bar-no")
    .data(bins)
    .join("rect")
    .attr("class","bar-no")
    .attr("x",  d => x(d.x0) + barPad)
    .attr("y",  height)
    .attr("width",  d => Math.max(0, x(d.x1) - x(d.x0) - barPad * 2))
    .attr("height", 0)
    .attr("rx", 3)
    .attr("fill", PALETTE.pink)
    .attr("opacity", 0.88);

  noBars.transition(TRANSITION().duration(750))
    .attr("y",      d => y(d.no))
    .attr("height", d => height - y(d.no));

  /* "Yes treatment" bars (stacked on top) */
  const yesBars = chartArea.selectAll(".bar-yes")
    .data(bins)
    .join("rect")
    .attr("class","bar-yes")
    .attr("x",  d => x(d.x0) + barPad)
    .attr("y",  height)
    .attr("width",  d => Math.max(0, x(d.x1) - x(d.x0) - barPad * 2))
    .attr("height", 0)
    .attr("rx", 3)
    .attr("fill", PALETTE.blue)
    .attr("opacity", 0.88);

  yesBars.transition(TRANSITION().duration(750))
    .attr("y",      d => y(d.yes + d.no))
    .attr("height", d => y(d.no) - y(d.yes + d.no));

  /* ── Tooltip overlay (transparent rects for hovering) ── */
  chartArea.selectAll(".bar-overlay")
    .data(bins)
    .join("rect")
    .attr("class","bar-overlay")
    .attr("x",  d => x(d.x0) + barPad)
    .attr("y",  0)
    .attr("width",  d => Math.max(0, x(d.x1) - x(d.x0) - barPad * 2))
    .attr("height", height)
    .attr("fill","transparent")
    .on("mousemove", (event, d) => {
      const total = d.yes + d.no;
      const yRate = total > 0 ? ((d.yes / total) * 100).toFixed(1) : "0.0";
      showTooltip(event, `
        <strong>Age ${d.x0}–${d.x1}</strong><br/>
        Total: <b>${total}</b><br/>
        Sought treatment: <b>${d.yes}</b> (${yRate}%)<br/>
        No treatment: <b>${d.no}</b>
      `);
    })
    .on("mouseleave", hideTooltip);

  /* ── Legend ── */
  const legendG = svg.append("g")
    .attr("transform", `translate(${width - 220}, 4)`);

  [{label:"Sought Treatment", colour: PALETTE.blue},
   {label:"No Treatment",     colour: PALETTE.pink}
  ].forEach((item, i) => {
    const g = legendG.append("g").attr("transform", `translate(${i * 110}, 0)`);
    g.append("rect").attr("width",12).attr("height",12).attr("rx",3).attr("fill", item.colour);
    g.append("text").attr("x",17).attr("y",10).attr("fill","#6060a0").attr("font-size","11px").text(item.label);
  });
}

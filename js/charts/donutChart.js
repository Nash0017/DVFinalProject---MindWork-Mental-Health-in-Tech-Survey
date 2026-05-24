/**
 * @file donutChart.js
 * @description Animated donut chart showing the proportion of respondents
 *              who sought mental health treatment vs. those who did not.
 *              Features: arc tweening animation, centre label, hover highlight.
 */

"use strict";

/**
 * Renders (or re-renders) the treatment donut chart.
 *
 * @param {Object[]} data — Filtered dataset rows.
 */
function renderDonutChart(data) {
  const containerId = "#chart-treatment-donut";
  const container   = document.querySelector(containerId);
  if (!container) return;

  /* ── Dimensions ── */
  const size   = Math.min(container.getBoundingClientRect().width - 24, 340);
  const radius = size / 2;
  const inner  = radius * 0.55;

  /* ── Aggregate ── */
  const yes    = data.filter(d => d.treatment === "Yes").length;
  const no     = data.filter(d => d.treatment === "No").length;
  const total  = yes + no;

  const pieData = [
    { label: "Sought Treatment",   value: yes, colour: PALETTE.blue   },
    { label: "No Treatment Sought", value: no, colour: PALETTE.pink   },
  ];

  /* ── Clear old SVG ── */
  d3.select(containerId).select("svg").remove();

  if (total === 0) {
    d3.select(containerId).append("p").attr("class","no-data-msg").text("No data.");
    return;
  }

  const svg = d3.select(containerId)
    .append("svg")
    .attr("width",  size)
    .attr("height", size + 60)  /* extra for legend */
    .append("g")
    .attr("transform", `translate(${radius},${radius})`);

  /* ── Pie layout ── */
  const pie = d3.pie()
    .value(d => d.value)
    .sort(null)
    .padAngle(0.03);

  const arc = d3.arc()
    .innerRadius(inner)
    .outerRadius(radius - 8)
    .cornerRadius(6);

  const arcHover = d3.arc()
    .innerRadius(inner)
    .outerRadius(radius - 2)
    .cornerRadius(6);

  /* ── Arc tweeening for enter animation ── */
  function arcTween(d) {
    const interp = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
    return t => arc(interp(t));
  }

  /* ── Arcs ── */
  const paths = svg.selectAll("path.donut-arc")
    .data(pie(pieData))
    .join("path")
    .attr("class","donut-arc")
    .attr("fill", d => d.data.colour)
    .attr("stroke", "#faf8ff")
    .attr("stroke-width", 2);

  paths
    .transition(TRANSITION().duration(900))
    .attrTween("d", arcTween);

  /* ── Tooltip on slices ── */
  paths
    .on("mousemove", (event, d) => {
      const pctVal = ((d.data.value / total) * 100).toFixed(1);
      showTooltip(event, `
        <strong>${d.data.label}</strong><br/>
        Count: <b>${d.data.value}</b><br/>
        Proportion: <b>${pctVal}%</b>
      `);
    })
    .on("mouseleave", function(event, d) {
      d3.select(this).transition().duration(200).attr("d", arc);
      hideTooltip();
    })
    .on("mouseenter", function(event, d) {
      d3.select(this).transition().duration(150).attr("d", arcHover(d));
    });

  /* ── Centre label ── */
  const yesRate = ((yes / total) * 100).toFixed(1);

  svg.append("text")
    .attr("text-anchor","middle")
    .attr("dy","-0.25em")
    .attr("fill","#3d3560")
    .attr("font-size","28px")
    .attr("font-weight","700")
    .attr("font-family","'Playfair Display', serif")
    .text(yesRate + "%");

  svg.append("text")
    .attr("text-anchor","middle")
    .attr("dy","1.2em")
    .attr("fill","#9990c0")
    .attr("font-size","11px")
    .attr("font-weight","500")
    .text("sought treatment");

  /* ── Legend ── */
  const legend = d3.select(containerId).select("svg")
    .append("g")
    .attr("transform", `translate(${size / 2 - 110},${size + 10})`);

  pieData.forEach((d, i) => {
    const row = legend.append("g")
      .attr("transform", `translate(${i * 140}, 0)`);

    row.append("rect")
      .attr("width", 12).attr("height", 12)
      .attr("rx", 3)
      .attr("fill", d.colour);

    row.append("text")
      .attr("x", 18).attr("y", 10)
      .attr("fill","#5a5090")
      .attr("font-size","11px")
      .text(d.label);
  });
}

# DSC327 — Data Visualization Techniques  
## Semester Project Report

**Project Title:** MindWork — Interactive Mental Health in Tech Survey Dashboard  
**Course:** DSC327 · Data Visualization Techniques  
**Section:** BDS 6  
**Authors:** Nashama Asim (FA23-BDS-056) · Naqiya Ezzy (FA23-BDS-064)  
**Submission Date:** 17-06-2026  

---

## Table of Contents

1. [Dataset Overview](#1-dataset-overview)
2. [Data Preprocessing](#2-data-preprocessing)
3. [Exploratory Data Analysis (EDA)](#3-exploratory-data-analysis-eda)
4. [Visualization Choices and Justification](#4-visualization-choices-and-justification)
5. [Interaction Techniques](#5-interaction-techniques)
6. [Design Rationale](#6-design-rationale)
7. [Challenges and Solutions](#7-challenges-and-solutions)
8. [Conclusion](#8-conclusion)
9. [References](#9-references)

---

## 1. Dataset Overview

### Source
**OSMI Mental Health in Tech Survey**  
Publisher: Open Sourcing Mental Illness (OSMI)  
Platform: Kaggle  
URL: https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey  

### Description
The Open Sourcing Mental Illness (OSMI) survey was designed to measure attitudes toward mental health in the technology workplace and assess the frequency of mental health disorders among tech employees globally. The survey was conducted online and distributed through the OSMI community, tech conferences, and social media channels.

### Dataset Dimensions
| Attribute | Detail |
|-----------|--------|
| Total records (original) | ~1,259 |
| Records used (app sample) | 160+ representative rows |
| Features | 17 |
| Time period | 2014–2016 (original), representative sample created for this project |

### Feature Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `age` | Integer | Respondent's age in years |
| `gender` | Categorical | Self-reported gender (normalised to Male / Female / Other) |
| `country` | Categorical | Country of primary employment |
| `self_employed` | Binary | Whether the respondent is self-employed |
| `family_history` | Binary | Whether the respondent has a family history of mental illness |
| `treatment` | Binary | Whether the respondent sought professional mental health treatment |
| `work_interfere` | Ordinal | How often mental health interferes with work (Never / Rarely / Sometimes / Often) |
| `no_employees` | Ordinal | Number of employees at the respondent's company |
| `remote_work` | Binary | Whether the respondent works remotely ≥50% of the time |
| `tech_company` | Binary | Whether the employer is primarily a tech company |
| `benefits` | Categorical | Whether the employer provides mental health benefits |
| `care_options` | Categorical | Whether the respondent knows about employer care options |
| `wellness_program` | Categorical | Whether the employer has a formal wellness programme |
| `seek_help` | Categorical | Whether the employer provides resources to seek help |
| `anonymity` | Categorical | Whether anonymity is protected when using employer resources |
| `leave` | Ordinal | Ease of taking medical leave for mental health reasons |
| `mental_health_consequence` | Categorical | Whether discussing mental health at work could have negative consequences |

### Why This Dataset?
This dataset is an **unexpected but insightful choice** for a data visualization project because:
1. Mental health in tech is an under-visualised but critically relevant topic.
2. The dataset has rich categorical and ordinal dimensions, enabling diverse chart types.
3. It spans multiple countries, enabling geographic and cross-cultural analysis.
4. The combination of employer policies + individual outcomes creates compelling correlation stories.

---

## 2. Data Preprocessing

All preprocessing was performed in JavaScript (client-side) before rendering. No external preprocessing pipeline was used, making the project fully self-contained.

### 2.1 Gender Normalisation
The original survey had inconsistent gender entries (e.g., "Male", "M", "male", "cis male", "female", "f", "non-binary", "trans", "agender", etc.). For this project, gender values were normalised at the data source level into three categories:
- **Male** — all entries identifying as male or cisgender male
- **Female** — all entries identifying as female or cisgender female
- **Other** — all non-binary, genderqueer, agender, trans, and other identities

### 2.2 Age Filtering
Ages below 18 and above 70 were excluded from age-specific charts (histogram and bubble chart) to remove clearly erroneous entries (the original dataset contains ages like 5, 329, etc.). The `getFilteredData()` function handles this silently per-chart.

### 2.3 Company Size Ordering
The `no_employees` field has ordinal categories that require a specific sort order. A global constant `COMPANY_SIZE_ORDER` ensures consistent axis ordering across all charts:
```
["1-5", "6-25", "26-100", "100-500", "500-1000", "More than 1000"]
```

### 2.4 Work Interference Ordering
Similarly, `WORK_INTERFERE_ORDER` ensures logical axis ordering:
```
["Never", "Rarely", "Sometimes", "Often"]
```

### 2.5 Missing Value Handling
Several fields have "Don't know" or "Not sure" responses. These were:
- Retained in filter dropdowns for completeness
- Handled gracefully in chart aggregations (treated as distinct categories or filtered out from percentage calculations as appropriate)

---

## 3. Exploratory Data Analysis (EDA)

### 3.1 Treatment-Seeking Rates

Across the full sample, approximately **50–52% of respondents** sought professional mental health treatment. This is notably high compared to general population estimates (~20%), likely due to selection bias — the survey was distributed through mental health advocacy channels.

Key breakdown:
- Female respondents show higher treatment rates (~58%) than male (~48%)
- Respondents with family history of mental illness show treatment rates ~65%+ vs ~35% without

### 3.2 Geographic Distribution

The United States dominates the sample (~52% of respondents), followed by the United Kingdom (~12%), Canada (~8%), and Germany (~5%). This reflects the English-language bias of the survey instrument and OSMI's distribution network.

### 3.3 Age Distribution

Respondents are predominantly in the 25–40 age bracket, consistent with the tech industry's demographic profile. The median respondent age is approximately 31–32 years.

### 3.4 Work Interference

Approximately **30–35% of respondents** report that mental health "Sometimes" interferes with work, while **15–20%** report it happening "Often". Only a small fraction (~15%) report "Never".

Key observation: "Often" interference has a near-linear relationship with treatment-seeking — the more work is impacted, the more likely someone is to have sought help.

### 3.5 Employer Support

When asked about employer-provided benefits:
- ~50% confirmed their employer provides mental health benefits
- ~40% were unaware of available care options
- Only ~25–30% reported an active wellness programme

The "Don't know" category for benefits and anonymity is alarmingly large (~20–25%), suggesting a significant gap in internal communication around mental health resources.

### 3.6 Company Size

Respondents in **large companies (1000+ employees)** and **micro-companies (1–5)** show the highest rates of "Sometimes" interference — suggesting that both large-scale corporate stress and small-company resource scarcity have distinct mental health impacts.

---

## 4. Visualization Choices and Justification

### Chart 1: Horizontal Bar Chart — Countries
**Type:** Horizontal bar chart  
**Marks:** Rectangles  
**Channels:** Length (count), position (country), sequential colour (rank)  
**Justification:** Horizontal bars are preferred over vertical when category labels are long (country names). The length channel is the most perceptually accurate for comparing magnitudes (Cleveland & McGill, 1984). Top-10 selection reduces clutter while preserving the insight that the dataset is US-dominated.

### Chart 2: Animated Donut Chart — Treatment Overview
**Type:** Donut/pie chart with centre label  
**Marks:** Arcs  
**Channels:** Angle (proportion), colour (treatment vs. no treatment)  
**Justification:** For a simple two-category proportion, a donut chart is highly readable and visually impactful. The central percentage label (a common best practice for donuts) provides immediate reading without requiring the user to mentally sum arc lengths. The arc tweening animation on load creates a memorable, engaging entry.

### Chart 3: Stacked Histogram — Age Distribution
**Type:** Stacked vertical histogram  
**Marks:** Stacked rectangles  
**Channels:** Position-y (frequency), position-x (age bin), colour (treatment status)  
**Justification:** Histograms are the correct tool for continuous data (age). Stacking the treatment breakdown within each bin allows simultaneous reading of total distribution AND treatment split without requiring two separate charts. 5-year bins balance detail and noise.

### Chart 4: Grouped Bar Chart — Family History × Treatment
**Type:** Grouped vertical bar chart  
**Marks:** Rectangles  
**Channels:** Height (count), x-position (family history group), colour (treatment status)  
**Justification:** Grouped bars allow direct comparison between the two treatment outcomes within each family history group, as well as cross-group comparison. Stacked bars would obscure the relative relationship.

### Chart 5: Horizontal Bar Chart — Gender Treatment Rate
**Type:** Horizontal bar with track  
**Marks:** Rectangles (value bar + track background)  
**Channels:** Length (percentage), colour (gender)  
**Justification:** Showing a single continuous metric (treatment rate) per gender category calls for a simple bar. The grey track background provides implicit context (max = 100%) without requiring an axis label to convey the scale.

### Chart 6: 100% Stacked Bar — Benefits × Treatment
**Type:** 100% normalised stacked bars  
**Marks:** Stacked rectangles  
**Channels:** Length (proportion), colour (treatment status), position (benefit category)  
**Justification:** When comparing proportions across groups of different sizes, 100% normalisation removes the size distortion. This chart explicitly asks "given employer X, what fraction sought treatment?" — a proportional question requiring normalised bars. n-labels at the right edge preserve awareness of sample size differences.

### Chart 7: Heatmap — Company Size × Work Interference
**Type:** 2D heatmap / matrix  
**Marks:** Rectangles (cells)  
**Channels:** Colour (count), position-x (interference frequency), position-y (company size)  
**Justification:** A heatmap is the correct idiom for a two-dimensional categorical matrix. It allows the reader to scan both axes simultaneously and spot clusters/patterns. The sequential colour scale (white → periwinkle) encodes intensity intuitively. Cell count labels prevent misreading of edge cases.

### Chart 8: Lollipop Chart — Employer Support Index
**Type:** Lollipop (dot-and-stem)  
**Marks:** Circles (heads), lines (stems)  
**Channels:** Position-x (percentage), colour (metric index)  
**Justification:** Lollipop charts are a perceptually superior alternative to bar charts when comparing many items of similar magnitude — the reduced ink ratio (Tufte's data-ink principle) prevents the eye from averaging across wide bars. They are appropriate here because all five support metrics produce values in a similar range (25–55%), where bar heights would be visually indistinguishable.

### Chart 9: Bubble Chart — Age × Work Interference
**Type:** Bubble matrix (scatter with fixed grid positions)  
**Marks:** Circles  
**Channels:** Position (age × interference), size (count), colour (treatment rate)  
**Justification:** The bubble chart encodes three dimensions simultaneously: the two categorical axes plus count (size) and treatment rate (colour). Using a point-grid layout instead of a true scatter prevents overplotting and allows clean comparison across all age × interference combinations. The dual encoding (size + colour) rewards both quick scanning and detailed reading.

---

## 5. Interaction Techniques

### 5.1 Hover Tooltips
Every chart element (bar, arc, cell, bubble, stem) responds to mouse hover with a contextual tooltip showing:
- The name/label of the hovered element
- Raw count or value
- Percentage or rate (where applicable)
- Additional context (e.g., total in group)

**Implementation:** A single `#global-tooltip` div is shared across all charts and repositioned via `event.pageX` / `event.pageY`. This avoids DOM bloat from per-chart tooltip elements.

### 5.2 Filter-Driven Re-rendering
Four global filters (Country, Gender, Company Size, Remote Work) update the `FILTERS` global state object. On any change, `getFilteredData()` re-computes the active subset and `renderAll()` re-renders every chart in the active tab using D3's enter/update/exit pattern.

### 5.3 Tab Navigation
Four thematic tabs allow the user to focus on a specific analytical story. Switching tabs triggers a targeted re-render of only the newly visible charts (via `renderTabCharts()`), ensuring fresh layouts at the correct container size.

### 5.4 Animated Transitions
All charts use D3 transitions (600–900ms, cubic ease-out) for bar growth, arc tweening, and bubble radius expansion. This temporal encoding helps users track which elements change when filters are applied.

### 5.5 Hover Highlight (Donut)
Donut arcs expand their outer radius on hover (arc → arcHover), providing direct manipulation feedback and reinforcing the association between the hovered slice and its tooltip.

### 5.6 Responsive Resize
A debounced `window.resize` listener calls `renderAll()` after 200ms of inactivity, ensuring charts always fill their containers correctly when the browser window is resized.

---

## 6. Design Rationale

### 6.1 Colour Philosophy
A carefully considered **pastel palette** was chosen for three reasons:
1. **Subject matter sensitivity:** Mental health topics can be distressing. Calm, soft colours create a non-clinical, welcoming environment for exploration.
2. **Discriminability:** The selected hues (blue, pink, mint, lavender, peach) are perceptually distinct across colour-deficiency simulations (protanopia, deuteranopia) because they differ in both hue and lightness.
3. **Consistency:** All colours are defined in `js/data.js` as the `PALETTE` constant and in `css/style.css` as CSS custom properties, ensuring no colour is used ad hoc.

### 6.2 Typography
- **Playfair Display** (serif): used for chart titles, KPI values, and the site header. Its editorial character communicates professionalism and substance.
- **DM Sans** (geometric sans-serif): used for all body text, axis labels, and UI elements. Its humanist proportions are highly legible at small sizes.

### 6.3 Layout
A card-based layout with subtle drop shadows and border-radius creates clear spatial groupings. The sticky header with backdrop-blur keeps navigation and attribution visible at all times. KPI cards at the top provide an immediate summary before the user dives into detailed charts.

### 6.4 Graphical Integrity (Tufte Principles)
- **Data-ink ratio**: gridlines use dashed strokes and low-opacity to minimise non-data ink. Axes are only shown where necessary.
- **No chart junk**: no 3D effects, unnecessary gradients on bars, or decorative icons inside charts.
- **Lie factor = 1**: all bars and scales start at zero. Percentages are clearly labelled.
- **Context**: insight blurbs below each chart provide qualitative interpretation without cluttering the visualisation itself.

---

## 7. Challenges and Solutions

### Challenge 1: Categorical Sort Order
**Problem:** D3's default ordinal scales sort categories alphabetically, which produces illogical axis orders for company size ("1-5", "100-500", "1000+", etc.) and work interference levels.  
**Solution:** Explicit ordered arrays `COMPANY_SIZE_ORDER` and `WORK_INTERFERE_ORDER` are defined globally and passed to `d3.scaleBand().domain()`, overriding the default sort.

### Challenge 2: Responsive SVG Sizing
**Problem:** Fixed SVG widths break on narrow screens or when browser windows are resized.  
**Solution:** Each chart's render function calls `container.getBoundingClientRect().width` to compute the available pixel width at render time. A debounced `window.resize` listener triggers `renderAll()`, replacing the SVG with a fresh, correctly sized one.

### Challenge 3: Shared Tooltip Position
**Problem:** Multiple charts each trying to manage their own tooltip creates visual conflicts and DOM bloat.  
**Solution:** A single `#global-tooltip` div is positioned absolutely over the entire document (`position: absolute` on `body`). `showTooltip(event, html)` updates its position and content; `hideTooltip()` sets opacity to 0. Since it's above the SVG z-stack but doesn't interfere with mouse events (`pointer-events: none`), it works seamlessly across all charts.

### Challenge 4: D3 Enter/Update/Exit for Re-rendering
**Problem:** Naively appending new SVG elements on every filter change causes visual duplication.  
**Solution:** Each chart render function begins by removing the existing `svg` element (`d3.select(containerId).select("svg").remove()`), then builds a fresh SVG. This is simpler than managing enter/update/exit for SVG root elements and ensures clean redraws with no residual artefacts.

### Challenge 5: Ordinal Data in Bubble Chart
**Problem:** Using `d3.scaleLinear()` for categorical age groups (18–25, 25–32 etc.) and interference levels produces meaningless spatial positions.  
**Solution:** Both axes use `d3.scalePoint()` with explicit domain arrays. Pre-aggregating data into an age-bin × work-interference cross-table (before passing to D3) keeps the chart logic clean.

### Challenge 6: Colour Contrast with Pastel Palette
**Problem:** Very light pastel fills make white text (typically used inside bars) invisible.  
**Solution:** In charts with text inside bars (100% stacked bars), the text colour is always white but font-weight is set to 700 for contrast. In heatmap cell labels, the fill is dynamically set: dark text when the cell is light, white text when dark (`d.value > maxVal * 0.55 ? "#fff" : "#5050a0"`).

---

## 8. Conclusion

This project successfully demonstrates the development of a fully functional, interactive, web-based visualization system using **D3.js v7**. The MindWork dashboard:

- Transforms a real-world mental health survey dataset into **9 coordinated interactive charts**
- Implements **4 distinct D3 chart types** (bar, donut, histogram, heatmap, lollipop, bubble)
- Supports **real-time cross-filtering** across 4 dimensions
- Adheres to established data visualization principles (Tufte, Cleveland & McGill)
- Delivers a polished, responsive, accessible UI without any external UI frameworks

Beyond the technical achievement, the project surfaces genuine insights: the prevalence of mental health treatment-seeking among tech workers, the critical role of employer benefit communication, and the relationship between work interference and demographic factors.

---

## 9. References

1. OSMI (Open Sourcing Mental Illness). *Mental Health in Tech Survey Dataset*. Kaggle, 2016. https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey

2. Bostock, M., Ogievetsky, V., & Heer, J. (2011). *D³ Data-Driven Documents*. IEEE Transactions on Visualization and Computer Graphics, 17(12), 2301–2309.

3. Tufte, E. R. (2001). *The Visual Display of Quantitative Information* (2nd ed.). Graphics Press.

4. Cleveland, W. S., & McGill, R. (1984). Graphical Perception: Theory, Experimentation, and Application to the Development of Graphical Methods. *Journal of the American Statistical Association*, 79(387), 531–554.

5. Munzner, T. (2014). *Visualization Analysis and Design*. CRC Press.

6. D3.js Documentation. https://d3js.org/

7. World Health Organization. (2022). *Mental Health at Work*. WHO Policy Brief. https://www.who.int/publications/i/item/9789240053052

8. Osborn, D. P. J., et al. (2017). Inequalities in mental health treatment in the United Kingdom: A systematic review. *Psychological Medicine*.

---

*Report prepared for DSC327 — Data Visualization Techniques, FAST-NUCES.*  
*Submission: 17 June 2026*

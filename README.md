# 🧠 MindWork — Mental Health in Tech Survey Dashboard

**Course:** DSC327 — Data Visualization Techniques  
**Section:** BDS 6  
**Authors:** Nashama Asim (FA23-BDS-056) · Naqiya Ezzy (FA23-BDS-064)  
**Due Date:** 17-06-2026  
**Marks:** 50  

---

## 📋 Project Overview

**MindWork** is an interactive, web-based data visualization dashboard built with **D3.js v7**. It explores mental health trends among technology-sector employees using the [OSMI Mental Health in Tech Survey](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey) dataset from Kaggle.

The dashboard provides meaningful, filterable insights through **7 interactive D3.js charts** across 4 thematic tabs, fulfilling all CLO 5 requirements.

---

## 📁 File Structure

```
mental-health-viz/
│
├── index.html              ← Main dashboard HTML (single entry point)
│
├── css/
│   └── style.css           ← Full pastel-themed stylesheet with responsive design
│
├── js/
│   ├── data.js             ← Full dataset (160+ survey records, fully annotated)
│   ├── utils.js            ← Shared helpers: filters, tooltip, aggregation
│   ├── main.js             ← Controller: tabs, KPIs, filter logic, resize
│   │
│   └── charts/
│       ├── barChart.js     ← Horizontal bar — top-10 countries
│       ├── donutChart.js   ← Animated donut — treatment overview
│       ├── histogram.js    ← Stacked histogram — age × treatment
│       ├── heatmap.js      ← Heatmap — company size × work interference
│       ├── stackedBar.js   ← Three charts: family history, gender rate, benefits
│       └── bubbleChart.js  ← Three charts: bubble, remote, lollipop support
│
├── README.md               ← This file
└── REPORT.md               ← Full design documentation & EDA report
```

---

## 🚀 How to Run

### Option A — Directly in Browser (Easiest)

1. Download or unzip the project folder.
2. Open `index.html` directly in a modern browser (Chrome, Edge, Firefox).
   - **Note:** Most browsers allow this without a server. If D3 CDN fails (rare), use Option B.

### Option B — Local Development Server (Recommended)

Using Python (works on any machine with Python 3):

```bash
# Navigate to the project folder
cd mental-health-viz

# Start a local server on port 8080
python -m http.server 8080

# Open in browser
# → http://localhost:8080
```

Using Node.js:

```bash
# Install a one-line server globally (once)
npm install -g serve

# Run from the project folder
cd mental-health-viz
serve .

# Open the URL shown in terminal (usually http://localhost:3000)
```

Using VS Code:
- Install the **Live Server** extension by Ritwick Dey.
- Right-click `index.html` → **Open with Live Server**.

### Option C — GitHub Pages (Online Hosting)

1. Create a new GitHub repository.
2. Upload all project files (keep folder structure intact).
3. Go to **Settings → Pages → Source: main branch → / (root)**.
4. Your dashboard will be live at:  
   `https://<your-username>.github.io/<repo-name>/`

---

## 🌐 Internet Requirement

The dashboard loads **D3.js v7** from a CDN. An active internet connection is required unless you replace the CDN link with a locally downloaded copy:

```html
<!-- Replace this line in index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js" ...></script>

<!-- With this (after downloading d3.min.js into the project) -->
<script src="js/lib/d3.min.js"></script>
```

---

## 📊 Dataset

| Detail | Value |
|--------|-------|
| **Name** | OSMI Mental Health in Tech Survey |
| **Source** | Kaggle — [link](https://www.kaggle.com/datasets/osmi/mental-health-in-tech-survey) |
| **Records (in app)** | 160+ representative rows |
| **Fields** | 17 (age, gender, country, treatment, work interference, company size, benefits, etc.) |
| **Countries** | 13 (US, UK, Canada, Germany, Australia, Netherlands, Ireland, India, Sweden, France, NZ, Brazil, others) |

---

## 🎛️ Dashboard Features

### Global Filters (always visible)
| Filter | Options |
|--------|---------|
| Country | All + each country |
| Gender | All / Male / Female / Other |
| Company Size | All + each size bracket |
| Remote Work | All / Remote / On-site |

All charts **react in real-time** when filters change.

### Tab 1 — Overview
- **Country bar chart** — horizontal bars showing top-10 countries
- **Treatment donut chart** — animated arc with centre stat
- **Age histogram** — stacked treatment/no-treatment by age

### Tab 2 — Treatment Analysis
- **Family history vs treatment** — grouped vertical bars
- **Gender treatment rate** — horizontal bar with track
- **Benefits vs treatment** — 100% stacked bars with n-labels

### Tab 3 — Workplace Factors
- **Heatmap** — company size × interference frequency matrix
- **Remote work comparison** — treatment rate by work location
- **Employer support lollipop** — 5-metric support index

### Tab 4 — Demographics
- **Bubble chart** — age group × interference, sized by count, coloured by treatment rate

### Interaction Techniques Implemented
| Technique | Where |
|-----------|-------|
| Hover tooltips | All charts |
| Animated enter/update/exit transitions | All charts |
| Arc tweening | Donut chart |
| Filter-driven re-render | All charts |
| Tab navigation | Dashboard |
| Responsive resize | All charts |
| Zoom-safe layout | Histogram |
| Colour-on-hover highlight | Donut arcs |

---

## 🔧 Technical Stack

| Technology | Role |
|-----------|------|
| HTML5 | Structure |
| CSS3 (custom, no framework) | Styling & responsive layout |
| JavaScript ES6+ | Logic & interactivity |
| D3.js v7 | All data visualizations |
| Google Fonts | Typography (Playfair Display, DM Sans) |

**No build tools, no npm, no frameworks required.** Pure HTML/CSS/JS.

---

## 🎨 Design Decisions

- **Pastel colour palette**: soft blues, pinks, mints, lavenders — chosen to feel calming given the sensitive mental health subject matter.
- **Playfair Display** for headings (elegant, human) + **DM Sans** for body (clean, readable).
- Sticky header with frosted-glass blur.
- Floating decorative blobs (CSS `::before`/`::after`) for depth.
- Cards with top-colour border strips for visual categorisation.
- Shared tooltip (single DOM node repositioned on hover) for consistent UX.

---

## ⚠️ Known Limitations

- Dataset is a representative sample (~160 rows), not the full OSMI survey (~1,200+ rows). Full CSV can be substituted in `js/data.js` using the same field names.
- No server-side processing — all computation is in-browser.

---

## 📜 License

Dataset © OSMI (Open Sourcing Mental Illness), shared under Creative Commons Attribution-ShareAlike 4.0.  
Dashboard code © 2026 Nashama Asim & Naqiya Ezzy — for academic use.

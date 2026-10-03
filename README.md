# FlashGuard AI — Before the Water

**Street-level flood warnings that tell people what to do, before the water arrives.**

Weather forecasts tell people rain is coming. FlashGuard tells them which street will flood, when, why, and what to do about it. One prediction serves three users: residents, councils and the SES.

Built for Climate Hack-tion 2026 (COP31 Climate Innovation Hackathon), *Build for 2035* track.

---

## Try it

| | |
|---|---|
| Live app | `index.html` (also `app.html`) |
| Pitch presentation | `pitch.html` |

Open either file in a modern browser, or deploy the folder to Vercel (`vercel --prod`). No build step and no install.

Direct links to views: `#elwood-resident`, `#elwood-council`, `#elwood-ses`, `#elwood-futures`, `#lismore-futures`, `#lismore-ses`.

**Controls:** choose a place (top left) · choose a user (tabs) · drag the timeline · press play (or Space) · drag the divider in Two Futures.

---

## What it does

### Two places, one engine
- **Elwood VIC — flash flood.** Water arrives in minutes. Move cars, clear drains.
- **Lismore NSW — river flood at night.** Get people out before the water comes in.

### Residents
- Live countdown to water at your door, with four plain-English reasons (rain, ground height, tide, soil)
- Safe route to higher ground, found by a shortest-dry-path search
- Alerts by app, SMS and voice call in English, Easy English, Chinese and Vietnamese
- One-tap **"I'm safe" / "I need help"** check-in, with a live rescue tracker

### Councils
- Streets ranked by risk, vulnerable sites (aged care, schools, social housing) on the map
- Which drains to clear and by when, plus infrastructure projects ranked by cost vs damage avoided

### SES
- Predicted calls for help every 10 minutes, and a heatmap of the next 30 minutes
- Live rescue queue ranked by **risk, not call order** (water depth, people, medical and mobility needs)
- Doorknock list of homes that haven't replied and will have deep water

### Two Futures
The same storm, split down the middle. Left: nobody acts. Right: people act on FlashGuard alerts.

| Simulated result | Without | With FlashGuard |
|---|---|---|
| Elwood damage (one evening) | $18.5M | $4.0M |
| Elwood homes flooded | 225 | 48 |
| Most urgent callers reached in | 73 min | 20 min |
| Lismore people inside flooded homes | 3,064 | 717 |
| Lismore calls still waiting at 4:30 am | 320 | 0 |

*All data is simulated to show how the system works. These are illustrative estimates, not forecasts.*

---

## How it works

```
Forecast  →  Impact  →  Action  →  Rescue
(rain, river,   (depth per     (alerts and     (check-ins,
 tide, ground,   street, time)  to-do lists)    triage)
 drains)
```

`engine.js` holds the flood engine. For each place it:

1. Builds a terrain grid (ground height, creeks and rivers, low basins).
2. Runs a rainfall forecast (and river inflow for Lismore) through a simple catchment storage model to get water level over time.
3. Works out depth and flood time for every street, home, parked car and vulnerable site.
4. Finds a safe route with Dijkstra's algorithm over streets, avoiding deep water.
5. Generates rescue requests and schedules crews, comparing call-order dispatch with risk-ranked triage.

The model runs entirely in the browser, so every number on screen updates live as you move the timeline.

### Path to real data (next step)
Bureau of Meteorology rainfall and river forecasts · Geoscience Australia elevation (LiDAR) · council drainage networks · tide gauges · historical SES call data. We would validate the model against the February 2022 Lismore flood.

---

## Built with

HTML · CSS · JavaScript · Canvas 2D (flood maps) · Three.js / WebGL (3D street scene in the pitch) · Web Speech API (voice alerts) · Web Audio API (rain sound) · Vercel (hosting) · Google Fonts · Claude (AI coding assistant)

## Repository layout

```
index.html / app.html   Live app (single self-contained file)
pitch.html              Interactive pitch (N = presenter notes, 3 = three-minute cut)
vercel.json             Hosting config
engine.js               Flood engine: terrain, rainfall, water levels, routing, rescue triage
app.js                  App interface: map rendering, views, check-ins, alerts
app-layout.html         App markup and styles
pitch.js                Pitch logic, Two Futures 3D scene
pitch-layout.html       Pitch markup and styles
```

The readable source files are also bundled into `index.html` and `pitch.html`, so the app runs with no build step.

## Sources for context
- Lismore City Council — Flood history (14.4 m peak, 28 Feb 2022)
- Bureau of Meteorology — State of the Climate 2024 (short-duration rainfall intensity)

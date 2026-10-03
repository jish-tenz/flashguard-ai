/* ===== FlashGuard impact engine (simulated, illustrative) ===== */
const FGE = (() => {
  const W = 96, H = 60, T = 150, ER = 2, EW = W * ER, EH = H * ER;

  function hash(x, y) {
    let h = Math.round(x * 1000) * 374761393 + Math.round(y * 1000) * 668265263;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = t => t * t * (3 - 2 * t);
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    const u = s(xf), v = s(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const fbm = (x, y) => vnoise(x, y) * .5 + vnoise(x * 2.1, y * 2.1) * .25 + vnoise(x * 4.3, y * 4.3) * .125;
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx - px, qy = ay + t * dy - py; return Math.sqrt(qx * qx + qy * qy);
  }
  function polyDist(px, py, pts) {
    let b = 1e9;
    for (let i = 0; i < pts.length - 1; i++) b = Math.min(b, segDist(px, py, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
    return b;
  }
  const g = (t, m, s) => Math.exp(-(((t - m) / s) ** 2) / 2);

  function build(C) {
    const coast = C.coastX || (() => -1e9);
    const elevAt = (x, y) => C.terrain(x, y, { fbm, polyDist, coast });
    const elev = new Float32Array(EW * EH), bay = new Uint8Array(EW * EH), shimmer = new Float32Array(EW * EH);
    for (let j = 0; j < EH; j++) for (let i = 0; i < EW; i++) {
      const x = (i + .5) / ER, y = (j + .5) / ER, k = j * EW + i;
      elev[k] = elevAt(x, y); bay[k] = x < coast(y) ? 1 : 0; shimmer[k] = fbm(x * .35, y * .35);
    }
    const elevG = (x, y) => {
      const i = Math.max(0, Math.min(EW - 1, Math.floor(x * ER))), j = Math.max(0, Math.min(EH - 1, Math.floor(y * ER)));
      return elev[j * EW + i];
    };
    const rain = new Float32Array(T + 1);
    for (let t = 0; t <= T; t++) rain[t] = C.rainBase + C.rainBursts.reduce((s, b) => s + b[0] * g(t, b[1], b[2]), 0);
    function waterLevel(kBoost, boostFrom) {
      const wl = new Float32Array(T + 1); let S = C.S0;
      for (let t = 0; t <= T; t++) {
        const k = t >= boostFrom ? C.k * kBoost : C.k;
        S += rain[t] / 60 + (C.inflow ? C.inflow(t) : 0) - k * S; S = Math.max(0, S);
        wl[t] = C.wlBase + S * C.wlScale;
      }
      return wl;
    }
    const WL = { A: waterLevel(1, 999), B: waterLevel(C.kBoost, C.ACT + 8) };
    const peakT = Array.from(WL.A).indexOf(Math.max(...WL.A));
    const depthAt = (f, x, y, t) => Math.max(0, WL[f][Math.max(0, Math.min(T, Math.round(t)))] - elevG(x, y));
    const firstT = (f, level) => { for (let t = 0; t <= T; t++) if (WL[f][t] > level) return t; return null; };

    const streets = C.streets.map(s => ({ name: s.name, pts: s.pts }));
    streets.forEach(s => {
      const smp = [];
      for (let i = 0; i < s.pts.length - 1; i++) {
        const [ax, ay] = s.pts[i], [bx, by] = s.pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.ceil(L / .5);
        for (let k = 0; k < n; k++) smp.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n]);
      }
      smp.push(s.pts[s.pts.length - 1]); s.smp = smp; s.smpE = smp.map(p => elevG(p[0], p[1]));
      s.bridge = smp.map(p => C.rivers.some(r => polyDist(p[0], p[1], r.pts) < r.clear * .8));
      s.minElev = Math.min(...s.smpE.filter((e, i) => !s.bridge[i]));
      s.peak = Math.max(0, WL.A[peakT] - s.minElev);
      s.peakB = Math.max(0, WL.B[peakT] - s.minElev);
      s.floodT = firstT('A', s.minElev + .15);
    });
    const onStreet = (x, y, r = .9) => streets.some(s => polyDist(x, y, s.pts) < r);
    const nearestStreet = (x, y) => streets.reduce((b, s) => { const d = polyDist(x, y, s.pts); return d < b.d ? { d, s } : b; }, { d: 1e9 }).s;

    /* homes */
    const homes = [];
    const sp = C.homeSpacing;
    for (let y = 1; y < H - 1; y += sp) for (let x = 1; x < W - 1; x += sp) {
      const jx = x + (hash(x * 13, y * 7) - .5) * sp * .7, jy = y + (hash(x * 3, y * 17) - .5) * sp * .7;
      if (jx < coast(jy) + 2.6) continue;
      if (onStreet(jx, jy, 1.1)) continue;
      if (C.rivers.some(r => polyDist(jx, jy, r.pts) < r.clear)) continue;
      if (hash(jx * 31, jy * 29) < C.homeSkip) continue;
      const e = elevG(jx, jy), floor = e + 0.22 + hash(jx * 7, jy * 5) * .12;
      homes.push({ x: jx, y: jy, floor });
    }
    homes.forEach((h, i) => {
      h.i = i;
      h.tA = firstT('A', h.floor);
      h.sandbag = !C.river && h.tA !== null && h.tA - C.ACT > 15 && hash(i, 77) < .6;
      h.evac = !!C.river && h.tA !== null && h.tA - C.ACT > 15 && hash(i, 78) < .84;
      h.tB = firstT('B', h.floor + (h.sandbag ? .25 : 0));
      h.street = nearestStreet(h.x, h.y).name;
      h.no = 1 + Math.floor(hash(i, 5) * 48);
      h.people = 1 + Math.floor(hash(i, 9) * C.peoplePerHome * 1.6);
      const needs = [];
      if (hash(i, 11) < .22) needs.push('Elderly');
      if (hash(i, 12) < .3) needs.push('Children');
      if (hash(i, 13) < .09) needs.push('Medical');
      if (hash(i, 14) < .07) needs.push('Disability');
      h.needs = needs;
    });

    /* vehicles */
    const cars = [];
    streets.forEach((s, si) => s.smp.forEach((p, k) => {
      if (k % 3 || hash(si * 91, k * 13) < .45) return;
      const e = elevG(p[0], p[1]), tA = firstT('A', e + .3);
      const moved = tA !== null && tA - C.ACT > 12 && hash(si * 3, k * 41) < .86;
      cars.push({ x: p[0] + .45, y: p[1] + .2, tA, moved, k: hash(si, k) });
    }));

    const sites = C.sites.map(s => ({ ...s }));
    sites.forEach(s => { s.elev = elevG(s.x, s.y); s.peak = Math.max(0, WL.A[peakT] - s.elev); s.tA = firstT('A', s.elev + .1); });

    const me = { ...C.me }; me.elev = elevG(me.x, me.y); me.floodT = firstT('A', me.elev + .15); me.peak = Math.max(0, WL.A[peakT] - me.elev);
    const safe = { ...C.safe }; safe.elev = elevG(safe.x, safe.y);

    /* safe route */
    function route() {
      const N = W * H, dist = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), done = new Uint8Array(N), cost = new Float32Array(N);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const px = x + .5, py = y + .5, d = depthAt('A', px, py, peakT - 8);
        let c = onStreet(px, py, .8) ? 1 : 7;
        if (px < coast(py) + .5) c = 1e6;
        if (C.rivers.some(r => polyDist(px, py, r.pts) < .9) && !onStreet(px, py, .8)) c = 1e6;
        if (d > .12 && Math.hypot(px - me.x, py - me.y) > 3.5) c = 1e6;
        cost[y * W + x] = c;
      }
      const s = Math.floor(me.y) * W + Math.floor(me.x), goal = Math.floor(safe.y) * W + Math.floor(safe.x);
      dist[s] = 0; const open = [s];
      while (open.length) {
        let bi = 0; for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
        const u = open.splice(bi, 1)[0]; if (done[u]) continue; done[u] = 1; if (u === goal) break;
        const ux = u % W, uy = (u / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const vx = ux + dx, vy = uy + dy; if (vx < 0 || vy < 0 || vx >= W || vy >= H) continue;
          const v = vy * W + vx, nd = dist[u] + cost[v] * (dx && dy ? 1.414 : 1);
          if (nd < dist[v]) { dist[v] = nd; prev[v] = u; open.push(v); }
        }
      }
      const path = []; let c = goal; while (c !== -1) { path.push([c % W + .5, ((c / W) | 0) + .5]); c = prev[c]; }
      path.reverse(); path[0] = [me.x, me.y]; path.push([safe.x, safe.y]);
      const sm = path.map((p, i) => { if (i === 0 || i === path.length - 1) return p; const a = path[i - 1], b = path[i + 1]; return [(a[0] + p[0] * 2 + b[0]) / 4, (a[1] + p[1] * 2 + b[1]) / 4]; });
      let len = 0; for (let i = 1; i < sm.length; i++) len += Math.hypot(sm[i][0] - sm[i - 1][0], sm[i][1] - sm[i - 1][1]);
      return { pts: sm, metres: Math.round(len * C.metresPerCell / 10) * 10 };
    }
    const safeRoute = route();

    /* outcomes */
    function outcomes(f) {
      const hf = homes.filter(h => (f === 'A' ? h.tA : h.tB) !== null);
      const cf = cars.filter(c => c.tA !== null && !(f === 'B' && c.moved)).length;
      const sitesHit = sites.filter(s => s.tA !== null).length;
      const inside = f === 'B' ? hf.filter(h => !h.evac) : hf;
      const people = inside.reduce((s, h) => s + h.people, 0);
      return { homes: hf.length, cars: cf, callouts: Math.round(inside.length * .55 + cf * .3 + (f === 'A' ? sitesHit * 6 : sitesHit)), people, damage: Math.round(hf.length * C.damageHome * (f === 'B' && C.river ? .85 : 1) + cf * C.damageCar) };
    }
    const OUT = { A: outcomes('A'), B: outcomes('B') };
    function calloutCurve(f) {
      const bins = new Array(15).fill(0);
      homes.forEach(h => { const t = f === 'A' ? h.tA : h.tB; if (t !== null && !(f === 'B' && h.evac)) bins[Math.min(14, Math.floor(t / 10))] += .55; });
      cars.forEach(c => { if (c.tA !== null && !(f === 'B' && c.moved)) bins[Math.min(14, Math.floor(c.tA / 10))] += .3; });
      return bins.map(Math.round);
    }
    const CURVE = { A: calloutCurve('A'), B: calloutCurve('B') };

    /* rescue requests and triage */
    function requests(f) {
      const out = [];
      homes.forEach(h => {
        const tf = f === 'A' ? h.tA : h.tB; if (tf === null) return;
        if (f === 'B' && h.evac) return;
        const pk = Math.max(0, WL[f][peakT] - h.floor);
        const pHelp = C.helpRate * (f === 'A' ? 1.25 : 1) * (pk > .6 ? 1.6 : 1) * (h.needs.length ? 1.5 : 1);
        if (hash(h.i, f === 'A' ? 21 : 22) > pHelp) return;
        const t = Math.min(T, tf + Math.round(hash(h.i, 23) * (f === 'A' ? 14 : 8)));
        const level = pk > .9 ? 'Chest' : pk > .45 ? 'Waist' : 'Knee';
        out.push({ id: 'h' + h.i, x: h.x, y: h.y, t, people: h.people, needs: h.needs, level, peakDepth: pk, addr: `${h.no} ${h.street}`, home: h });
      });
      return out;
    }
    const prio = r => r.peakDepth * 60 + r.needs.length * 22 + r.people * 4 + (r.needs.includes('Medical') ? 15 : 0);
    function schedule(reqs, mode) {
      const base = C.staging.filter(s => s.crew);
      const firstCall = Math.min(...reqs.map(r => r.t), T);
      const crews = Array.from({ length: mode === 'triage' ? C.crews : (C.crewsA || C.crews) }, (_, i) => {
        const b = base[i % base.length];
        return mode === 'triage' ? { x: b.x, y: b.y, n: b.n, free: C.ACT + 12 } : { x: C.depot[0], y: C.depot[1], n: b.n, free: firstCall + C.mobilise };
      });
      reqs.forEach(r => { r.p = prio(r); r.assign = null; r.reach = null; r.done = null; r.crew = null; r.prioLabel = r.p > 80 ? 'P1' : r.p > 45 ? 'P2' : 'P3'; });
      for (let t = 0; t <= T + 60; t++) {
        for (const c of crews) {
          if (c.free > t) continue;
          const pend = reqs.filter(r => r.t <= t && r.assign === null);
          if (!pend.length) break;
          pend.sort((a, b) => mode === 'triage' ? (b.p + (t - b.t) * 1.2) - (a.p + (t - a.t) * 1.2) : a.t - b.t);
          const r = pend[0], d = Math.hypot(r.x - c.x, r.y - c.y);
          const travel = Math.round(3 + d * C.travelPerCell + (mode === 'fifo' ? C.locatePenalty : 0));
          r.assign = t; r.reach = t + travel; r.done = r.reach + 7; r.crew = c.n; r.crewXY = [c.x, c.y];
          c.free = r.done; c.x = r.x; c.y = r.y;
        }
      }
      return reqs;
    }
    const REQ = { A: schedule(requests('A'), 'fifo'), B: schedule(requests('B'), 'triage') };
    const waitStats = f => {
      const all = REQ[f], end = T + 60, wait = r => (r.reach === null ? end : r.reach) - r.t;
      const hi = all.filter(r => r.prioLabel === 'P1');
      const avg = a => a.length ? Math.round(a.reduce((s, r) => s + wait(r), 0) / a.length) : 0;
      return { p1: avg(hi), all: avg(all), n: all.length, late: all.filter(r => wait(r) > 45).length, unreached: all.filter(r => r.reach === null).length };
    };
    const WAIT = { A: waitStats('A'), B: waitStats('B') };

    const clock = t => {
      const m = C.startMin + Math.round(t); let h = Math.floor(m / 60) % 24; const mm = m % 60;
      const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(mm).padStart(2, '0')} ${ap}`;
    };

    return { C, W, H, T, NOW: C.NOW, ACT: C.ACT, ER, EW, EH, elev, bay, shimmer, rain, WL, peakT, depthAt, elevG, coast, rivers: C.rivers, streets, homes, cars, sites, me, safe, safeRoute, OUT, CURVE, REQ, WAIT, schedule, prio, clock, hash, polyDist };
  }

  /* ---------------- places ---------------- */
  const melbCoast = y => 9 + 2.6 * Math.sin(y * 0.11 + 1) + 1.4 * Math.sin(y * 0.31);
  const elster = [[97, 13], [80, 17], [64, 24], [50, 28], [40, 32], [28, 38], [16, 42], [5, 43]];
  const mcx = y => melbCoast(y) + 1.6;
  const MELB = {
    id: 'melb', startMin: 16 * 60, NOW: 47, ACT: 52,
    coastX: melbCoast,
    rivers: [{ name: 'Elster Creek', pts: elster, w: .32, clear: 1.6 }],
    terrain(x, y, u) {
      const c = u.coast(y);
      if (x < c) return -1 - (c - x) * 0.1;
      let e = 0.25 + (x - c) * 0.052 + (u.fbm(x * 0.07 + 3, y * 0.07 + 7) - 0.44) * 1.5;
      const dc = u.polyDist(x, y, elster); e -= 1.25 * Math.exp(-dc * dc / 12);
      e -= 0.95 * Math.exp(-((x - 33) ** 2 + (y - 29) ** 2) / 45);
      e -= 0.65 * Math.exp(-((x - 53) ** 2 + (y - 41) ** 2) / 34);
      e -= 0.45 * Math.exp(-((x - 20) ** 2 + (y - 18) ** 2) / 30);
      return Math.max(0.04, e);
    },
    rainBase: 2.5, rainBursts: [[26, 64, 10], [88, 94, 13], [14, 122, 8]],
    S0: 9, k: 0.02, kBoost: 1.75, wlBase: -0.5, wlScale: 0.042,
    streets: [
      { name: 'Ormond Esplanade', pts: [4, 12, 20, 28, 36, 44, 52, 58].map(y => [mcx(y), y]) },
      { name: 'Glen Huntly Rd', pts: [[mcx(21), 21], [30, 22], [52, 23.5], [74, 24], [95, 25]] },
      { name: 'Ormond Rd', pts: [[mcx(9), 9], [36, 11], [62, 12], [95, 9]] },
      { name: 'Mitford St', pts: [[30, 3], [32, 16], [33.5, 30], [35, 44], [36, 58]] },
      { name: 'Tennyson St', pts: [[45, 3], [46, 20], [47, 40], [48, 58]] },
      { name: 'Docker St', pts: [[mcx(34), 34], [32, 34.5], [48, 35.5], [64, 36]] },
      { name: 'Byron St', pts: [[24, 47], [40, 46.5], [56, 46], [72, 47]] },
      { name: 'Marine Pde', pts: [[mcx(53), 53], [30, 53], [52, 54], [72, 55.5]] },
      { name: 'Broadway', pts: [[60, 3], [61, 22], [62, 40], [63, 58]] },
      { name: 'Brighton Rd', pts: [[80, 2], [81, 20], [82, 40], [83, 58]] },
    ],
    labelAt: { 'Ormond Esplanade': .62, 'Glen Huntly Rd': .62, 'Ormond Rd': .55, 'Mitford St': .12, 'Tennyson St': .08, 'Docker St': .55, 'Byron St': .7, 'Marine Pde': .7, 'Broadway': .12, 'Brighton Rd': .1 },
    bigLabels: [{ text: 'PORT PHILLIP BAY', x: 4.2, y: 30, ang: -Math.PI / 2, color: 'rgba(120,170,220,.55)' }, { text: 'ELSTER CREEK', x: 70, y: 19.4, ang: -0.41, color: 'rgba(120,180,240,.7)' }],
    sites: [
      { name: 'Elster Lodge aged care', kind: 'Aged care', x: 37, y: 33, people: 64 },
      { name: 'Elwood Primary School', kind: 'School', x: 43, y: 31.5, people: 410 },
      { name: 'Marine Pde early learning', kind: 'Childcare', x: 53.5, y: 40.5, people: 58 },
      { name: 'Docker St social housing', kind: 'Low mobility', x: 26, y: 36.5, people: 120 },
    ],
    me: { x: 33.9, y: 30.5, label: '14 Mitford St' },
    safe: { x: 81.2, y: 29, label: 'Brighton Rd car park' },
    staging: [{ x: 81.5, y: 23.5, n: 'Rescue crew 1', label: 'Rescue crews · staged', crew: true }, { x: 81.5, y: 40, n: 'Rescue crew 2', crew: true }, { x: 62, y: 15, n: 'Sandbag trailer', label: 'Sandbag trailer' }],
    crews: 5, travelPerCell: .3, locatePenalty: 8, depot: [95, 2], mobilise: 15,
    homeSpacing: 1.25, homeSkip: .35, peoplePerHome: 2.4, helpRate: .1,
    metresPerCell: 22, damageHome: 78000, damageCar: 21000,
  };

  /* Lismore: Wilsons River and Leycester Creek confluence */
  const wilsons = [[92, -1], [76, 8], [62, 17], [50, 26], [45, 33], [41, 42], [38, 52], [36, 61]];
  const leycester = [[-1, 13], [12, 17], [24, 21], [36, 25], [47, 29.5]];
  const LIS = {
    id: 'lis', startMin: 60, NOW: 47, ACT: 52,
    coastX: null,
    rivers: [
      { name: 'Wilsons River', pts: wilsons, w: .6, clear: 1.9 },
      { name: 'Leycester Creek', pts: leycester, w: .42, clear: 1.6 },
    ],
    terrain(x, y, u) {
      const dw = u.polyDist(x, y, wilsons), dl = u.polyDist(x, y, leycester);
      const d = Math.min(dw, dl * 1.1);
      let e = 0.35 + Math.min(d, 26) * 0.065 + (u.fbm(x * 0.08 + 5, y * 0.08 + 9) - 0.45) * 1.1;
      e += Math.max(0, x - 66) * 0.11;
      e -= 1.6 * Math.exp(-dw * dw / 7) + 1.2 * Math.exp(-dl * dl / 5);
      e -= 0.75 * Math.exp(-((x - 40) ** 2 + (y - 13) ** 2) / 70);
      e -= 0.95 * Math.exp(-((x - 21) ** 2 + (y - 42) ** 2) / 95);
      e -= 0.3 * Math.exp(-((x - 57) ** 2 + (y - 33) ** 2) / 30);
      return Math.max(0.04, e);
    },
    rainBase: 6, rainBursts: [[30, 40, 14], [64, 82, 16], [26, 118, 12]],
    inflow: t => 0.34 * Math.exp(-(((t - 98) / 26) ** 2) / 2),
    river: true, S0: 14, k: 0.016, kBoost: 1, wlBase: -0.8, wlScale: 0.046,
    streets: [
      { name: 'Terania St', pts: [[38, 1], [40, 9], [42, 17], [45, 23]] },
      { name: 'Bridge St', pts: [[22, 5], [30, 10], [38, 16], [46, 21]] },
      { name: 'Molesworth St', pts: [[56, 16], [55, 26], [52, 36], [50, 46]] },
      { name: 'Keen St', pts: [[62, 20], [61, 30], [59, 40], [58, 50]] },
      { name: 'Woodlark St', pts: [[28, 30], [40, 31], [54, 31], [72, 32]] },
      { name: 'Ballina St', pts: [[54, 38], [68, 39], [82, 40], [95, 41]] },
      { name: 'Union St', pts: [[6, 48], [18, 44], [30, 39], [42, 36]] },
      { name: 'Casino St', pts: [[4, 30], [16, 33], [26, 37], [32, 46], [34, 58]] },
      { name: 'Uralba St', pts: [[64, 50], [78, 52], [94, 54]] },
      { name: 'Bruxner Hwy', pts: [[72, 2], [80, 14], [88, 26], [95, 32]] },
    ],
    labelAt: { 'Terania St': .15, 'Bridge St': .25, 'Molesworth St': .5, 'Keen St': .55, 'Woodlark St': .82, 'Ballina St': .75, 'Union St': .25, 'Casino St': .2, 'Uralba St': .6, 'Bruxner Hwy': .55 },
    bigLabels: [
      { text: 'WILSONS RIVER', x: 69, y: 11.4, ang: -0.56, color: 'rgba(120,180,240,.8)' },
      { text: 'LEYCESTER CREEK', x: 15, y: 16.6, ang: 0.32, color: 'rgba(120,180,240,.7)' },
      { text: 'NORTH LISMORE', x: 30, y: 4, ang: 0, color: 'rgba(200,214,232,.32)', size: 12 },
      { text: 'SOUTH LISMORE', x: 14, y: 55, ang: 0, color: 'rgba(200,214,232,.32)', size: 12 },
      { text: 'CBD', x: 66, y: 26, ang: 0, color: 'rgba(200,214,232,.32)', size: 12 },
      { text: 'GIRARDS HILL', x: 82, y: 47, ang: 0, color: 'rgba(200,214,232,.32)', size: 12 },
    ],
    sites: [
      { name: 'Caravan park, North Lismore', kind: 'Caravan park', x: 34, y: 12, people: 85 },
      { name: 'Aged care home, South Lismore', kind: 'Aged care', x: 24, y: 40.5, people: 72 },
      { name: 'Social housing, South Lismore', kind: 'Low mobility', x: 17, y: 45, people: 140 },
      { name: 'Primary school, North Lismore', kind: 'School', x: 47, y: 15, people: 260 },
    ],
    me: { x: 40.6, y: 8.6, label: '22 Terania St' },
    safe: { x: 90, y: 24, label: 'Southern Cross University evacuation centre' },
    staging: [
      { x: 78, y: 36.5, n: 'SES flood rescue 1', label: 'SES flood rescue · Ballina St', crew: true },
      { x: 66, y: 20, n: 'Community boat (verified)', label: 'Community boats · verified', crew: true },
      { x: 78, y: 20, n: 'SES flood rescue 2', crew: true },
    ],
    crews: 11, crewsA: 6, travelPerCell: .4, locatePenalty: 14, depot: [95, 58], mobilise: 22,
    homeSpacing: 1.15, homeSkip: .3, peoplePerHome: 2.5, helpRate: .14,
    metresPerCell: 26, damageHome: 125000, damageCar: 21000,
  };

  return { build, places: { melb: MELB, lis: LIS } };
})();
if (typeof module !== 'undefined') module.exports = FGE;

/* ===== FlashGuard app ===== */
(() => {
  const $ = s => document.querySelector(s);
  const built = {};
  let F, C, P, D; // engine output, config, place copy, derived numbers
  const S = { place: 'melb', mode: 'resident', t: 47, playing: false, split: .5, route: false, layers: { homes: true, vuln: true, heat: true }, hl: null, checks: new Set(), startReal: performance.now(), checkin: null, form: null, myReq: null, lang: 'en' };
  const fmt = n => Math.round(n).toLocaleString('en-AU');
  const money = n => '$' + (n / 1e6).toFixed(1) + 'M';
  const cm = d => Math.round(d * 100) + ' cm';
  const km = m => (m / 1000).toFixed(1) + ' km';
  const lerpWL = (f, t) => { const a = Math.floor(t), b = Math.min(F.T, a + 1), u = t - a; return F.WL[f][a] * (1 - u) + F.WL[f][b] * u; };
  const clock = t => F.clock(t);
  const hm = t => { const m = C.startMin + Math.round(t); return [Math.floor(m / 60) % 24, m % 60]; };
  const zhTime = t => { const [h, m] = hm(t), p = h < 6 ? '凌晨' : h < 12 ? '上午' : h < 18 ? '下午' : '晚上'; return `${p}${h % 12 || 12}:${String(m).padStart(2, '0')}`; };
  const vnTime = t => { const [h, m] = hm(t), p = h < 12 ? 'sáng' : h < 18 ? 'chiều' : 'tối'; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${p}`; };

  /* ---------- place copy ---------- */
  const UI = {
    melb: {
      slug: 'elwood', short: 'Elwood', when: 'Thursday · 4:47 pm · Elwood, Melbourne', kind: 'Flash flood',
      intro2: 'The forecast says heavy rain.',
      intro3: m => `It doesn't say your street goes under in <em>${m} minutes</em>.`,
      card: ['Elwood, Melbourne', 'Flash flood. Water rises in minutes, not hours.'],
      tag: 'Simulated scenario · Elster Creek catchment',
      elevUnit: 'above sea level',
      home: 'Your street · 14 Mitford St',
      why: () => [
        ['Rain', `<b>${Math.round(D.peakRain)} mm/h burst</b> forecast at ${clock(D.peakRainT)}. Drains here are sized for about 30 mm/h.`],
        ['Ground', `Your door sits <b>${F.me.elev.toFixed(2)} m</b> above sea level, lower than ${D.lowerThan}% of homes in Elwood.`],
        ['Tide', 'A <b>high tide</b> in the bay slows Elster Creek from draining until about 7:10 pm.'],
        ['Soil', 'Two days of rain have <b>saturated the ground</b>, so most new rain runs straight off.'],
      ],
      alert: () => ({ title: 'Move your car in the next 25 minutes', text: `Parking on Mitford St is under <b>30 cm by ${clock(F.me.floodT + 4)}</b>, enough to write off most cars. Brighton Rd car park is <b>${km(F.safeRoute.metres)}</b> away and <b>${(F.safe.elev - F.me.elev).toFixed(1)} m higher</b>.` }),
      checklist: () => [
        ['car', 'Move your car to higher ground', `Brighton Rd car park, ${km(F.safeRoute.metres)} away`],
        ['lift', 'Lift valuables and power boards above 1 m', `Water at your door may reach ${cm(F.me.peak)}`],
        ['bag', 'Sandbag front and rear doors', 'Free sandbags at the Broadway trailer until 5:20 pm'],
        ['nb', 'Check on your neighbour at no. 18', 'Registered as needing help to leave'],
        ['kit', 'Pack medicines, documents and a charged phone', `Be ready to leave by ${clock(F.me.floodT - 15)}`],
      ],
      sms: {
        en: m => `FlashGuard FLOOD ALERT: Water is expected at 14 Mitford St at ${clock(F.me.floodT)} (${m} min). Move your car to Brighton Rd car park now. Don't drive through water. Reply 1 if safe, 2 if you need help.`,
        easy: () => `Flood warning. Water will come to your house soon. It will come at ${clock(F.me.floodT)}. Move your car to a high place now. Do not drive in water. Text 1 if you are safe. Text 2 if you need help.`,
        zh: m => `FlashGuard 洪水警报：预计${zhTime(F.me.floodT)}洪水将到达 Mitford St 14号（还有${m}分钟）。请立即把车移到 Brighton Rd 停车场。切勿驾车涉水。安全请回复1，需要帮助请回复2。`,
        vi: m => `Cảnh báo lũ FlashGuard: Nước dự kiến đến 14 Mitford St lúc ${vnTime(F.me.floodT)} (còn ${m} phút). Hãy di chuyển xe đến bãi đỗ xe Brighton Rd ngay. Không lái xe qua vùng nước ngập. Trả lời 1 nếu an toàn, 2 nếu cần giúp đỡ.`,
      },
      reach: [['App alert', 58], ['SMS', 27], ['Voice call', 9], ['Doorknock', 3]],
      council: { eyebrow: 'Council operations · next 2 hours', recTitle: s => `Clear pits and grates on ${s.name}`, recText: s => `Leaf litter from Tuesday's wind is likely to block inlets. With network pits cleared and pumps pre-started, modelled peak here drops from ${cm(s.peak)} to ${cm(s.peakB)}.`, recHead: 'Drain inspections before the storm', recBy: s => s.floodT - 22 },
      infra: [['Tidal pump station at the Elster Creek outfall', '$7.2M', '$2.9M', '4.1'], ['Underground storage under Mitford St reserve', '$4.6M', '$1.4M', '3.2'], ['Raingardens and permeable parking, Docker St', '$1.1M', '$0.3M', '2.6']],
      ses: { eyebrow: 'VIC SES · Bayside unit' },
      prepos: () => [
        ['Flood rescue crews to Brighton Rd', 'by 5:10 pm', `Dry access from high ground into the Mitford St basin, where ${F.streets.find(s => s.name === 'Mitford St').homes} homes flood.`],
        ['Sandbag trailer to Broadway', 'by 5:00 pm', 'Broadway stays dry all evening and is a 6 minute walk for most at-risk households.'],
      ],
      fut: { lede: () => `Drag the divider on the map. Left, everyone waits for the water. Right, FlashGuard's alerts go out at ${clock(F.ACT)} and people act on them.`, hero: 'damage', climate: "Short, intense bursts like this are becoming more frequent as the climate warms, and drains built for last century's rain can't keep up. Adaptation isn't only concrete. It's also what people do in the hour before." },
      acts: () => [
        [F.ACT, `<b>${fmt(F.OUT.A.people)} residents</b> in ${D.atRisk.length} at-risk homes get a street-level alert with a countdown, by app, SMS or voice call.`],
        [F.ACT + 4, `<b>${D.carsMoved} of ${D.carsAtRisk} cars</b> in the flood path move to higher ground.`],
        [F.ACT + 8, 'Council clears <b>blocked pits</b> on the top 3 hotspots and starts pumps early.'],
        [F.ACT + 10, `<b>${D.sandbagged} households</b> sandbag doors from the Broadway trailer.`],
        [F.ACT + 13, 'SES doorknocks <b>Elster Lodge</b>, stages crews on dry ground and triages every call for help.'],
      ],
    },
    lis: {
      slug: 'lismore', short: 'Lismore', when: 'Monday · 1:47 am · North Lismore, NSW', kind: 'River flood',
      intro2: 'The river warning says major flooding.',
      intro3: m => `It doesn't say the water reaches your bed in <em>${m} minutes</em>, while your street is asleep.`,
      card: ['Lismore, NSW', 'River flood. Same engine, overnight, in the dark.'],
      tag: 'Simulated scenario · Wilsons River and Leycester Creek',
      elevUnit: 'above the normal river level',
      home: 'Your home · 22 Terania St, North Lismore',
      why: () => [
        ['River', `Wilsons River is rising about <b>${D.riseRate} cm an hour</b> and is forecast to peak at ${clock(F.peakT)}.`],
        ['Rain', `<b>${Math.round(D.peakRain)} mm/h bursts</b> over the catchment since midnight, on ground that's already soaked.`],
        ['Ground', `Your floor sits <b>${F.me.elev.toFixed(1)} m</b> ${'above the normal river level'}, in the low part of North Lismore.`],
        ['Night', `It's ${clock(F.NOW)}. Most of your street is asleep with phones on silent, so FlashGuard calls instead of just texting.`],
      ],
      alert: () => ({ title: 'Leave now, while the road out is still dry', text: `Bridge St goes under at <b>${clock(D.bridgeSt.floodT)}</b>, cutting the way out of North Lismore. Southern Cross University evacuation centre is <b>${km(F.safeRoute.metres)}</b> away and <b>${(F.safe.elev - F.me.elev).toFixed(1)} m higher</b>. Take your car with you.` }),
      checklist: () => [
        ['wake', 'Wake everyone and leave together', `Bridge St closes at ${clock(D.bridgeSt.floodT)}`],
        ['car', 'Take your car to higher ground', 'It will be under water if it stays in the street'],
        ['lift', 'Put papers, photos and valuables up high', `Water inside may reach ${cm(F.me.peak)}`],
        ['nb', 'Check on your neighbour at no. 24', 'Lives alone, registered as needing help to leave'],
        ['kit', 'Take medicines, chargers and pet supplies', 'The evacuation centre has beds and food'],
      ],
      sms: {
        en: m => `FlashGuard FLOOD ALERT: The river will reach 22 Terania St at about ${clock(F.me.floodT)} (${m} min). Bridge St closes at ${clock(D.bridgeSt.floodT)}. Wake everyone and leave now for the SCU evacuation centre. Reply 1 if safe, 2 if you need help.`,
        easy: () => 'Flood warning. The river will come into your house tonight. Wake up everyone. Leave your house now. Go to the evacuation centre at the university. Text 1 if you are safe. Text 2 if you need help.',
        zh: m => `FlashGuard 洪水警报：河水预计${zhTime(F.me.floodT)}到达 Terania St 22号（还有${m}分钟）。Bridge St 将于${zhTime(D.bridgeSt.floodT)}封闭。请叫醒所有人，立即前往 SCU 疏散中心。安全请回复1，需要帮助请回复2。`,
        vi: m => `Cảnh báo lũ FlashGuard: Nước sông dự kiến đến 22 Terania St khoảng ${vnTime(F.me.floodT)} (còn ${m} phút). Đường Bridge St sẽ bị ngập lúc ${vnTime(D.bridgeSt.floodT)}. Hãy đánh thức mọi người và rời đi ngay đến trung tâm sơ tán SCU. Trả lời 1 nếu an toàn, 2 nếu cần giúp đỡ.`,
      },
      reach: [['App alert', 41], ['SMS', 28], ['Voice call', 18], ['Doorknock and siren', 9]],
      council: { eyebrow: 'Council operations · overnight', recTitle: s => `Close floodgates and stormwater outlets near ${s.name}`, recText: s => `Stops the river backing up through drains before it overtops. Water reaches ${s.name} at ${clock(s.floodT)}, peaking at ${cm(s.peak)}.`, recHead: 'Close before the river arrives', recBy: s => s.floodT - 20 },
      infra: [['Voluntary buyback and house raising, North Lismore', '$38M', '$9.6M', '3.4'], ['More river gauges and street sirens upstream', '$2.4M', '$0.7M', '3.1'], ['Raise the Bruxner Hwy evacuation route', '$21M', '$4.1M', '2.2']],
      ses: { eyebrow: 'NSW SES · Northern Rivers' },
      prepos: () => [
        ['Flood rescue boats to Ballina St', 'by 2:05 am', 'Ballina St stays dry and reaches North and South Lismore by water once the roads close.'],
        ['Activate verified community boats', 'by 2:00 am', 'Local boat owners, registered and checked in advance. FlashGuard gives them P2 and P3 jobs so SES crews take the hardest rescues.'],
        ['Open the Southern Cross University evacuation centre', 'by 1:55 am', 'On high ground, stays dry, and on the safe route from North Lismore.'],
      ],
      fut: { lede: () => `Drag the divider on the map. Left, people wait for the water and then call for help. Right, FlashGuard's alerts go out at ${clock(F.ACT)} and people leave in time.`, hero: 'people', climate: 'Northern Rivers floods are getting bigger as the climate warms. In 2022, rescue services were overwhelmed and many people were saved by neighbours in their own boats. The homes will still flood. FlashGuard makes sure people aren\'t inside them, and that help goes to whoever needs it most.' },
      acts: () => [
        [F.ACT, `<b>${fmt(F.OUT.A.people)} people</b> in ${D.atRisk.length} homes in the flood path get an alert, and a voice call if they don't open it.`],
        [F.ACT + 3, 'Southern Cross University evacuation centre opens, and the safe route goes out with every alert.'],
        [F.ACT + 6, `<b>${D.evacuated} households</b> leave before the water, taking ${D.carsMoved} cars to higher ground.`],
        [F.ACT + 9, 'SES boats are staged on Ballina St, and <b>verified community boats</b> are activated through the app.'],
        [F.ACT + 12, 'Every call for help is triaged by water depth, people and needs, so the most urgent are reached first.'],
      ],
    },
  };
  const LANGS = [['en', 'English', 'en-AU'], ['easy', 'Easy English', 'en-AU'], ['zh', '中文', 'zh-CN'], ['vi', 'Tiếng Việt', 'vi-VN']];

  /* ---------- derived ---------- */
  function derive() {
    D = {};
    D.minsLeft = F.me.floodT - F.NOW;
    F.streets.forEach(s => {
      s.homes = F.homes.filter(h => h.tA !== null && F.polyDist(h.x, h.y, s.pts) < 2.6).length;
      s.vuln = F.sites.filter(v => v.tA !== null && F.polyDist(v.x, v.y, s.pts) < 3).length;
      s.score = s.floodT === null ? 0 : s.peak * 40 + s.homes * .8 + s.vuln * 15 + (150 - s.floodT) * .1;
    });
    D.hot = F.streets.filter(s => s.floodT !== null).sort((a, b) => b.score - a.score);
    D.first = F.streets.filter(s => s.floodT !== null).sort((a, b) => a.floodT - b.floodT)[0];
    D.bridgeSt = F.streets.find(s => s.name === 'Bridge St');
    D.atRisk = F.homes.filter(h => h.tA !== null);
    D.carsMoved = F.cars.filter(c => c.moved).length;
    D.carsAtRisk = F.cars.filter(c => c.tA !== null).length;
    D.sandbagged = F.homes.filter(h => h.sandbag).length;
    D.evacuated = F.homes.filter(h => h.evac).length;
    D.peakRain = Math.max(...F.rain); D.peakRainT = Array.from(F.rain).indexOf(D.peakRain);
    D.lowerThan = 100 - Math.round(100 * F.homes.filter(h => h.floor - .25 < F.me.elev).length / F.homes.length);
    D.riseRate = Math.round((F.WL.A[F.NOW + 10] - F.WL.A[F.NOW]) * 600);
    // check-ins (FlashGuard world)
    const reqByHome = {}; F.REQ.B.forEach(r => { if (r.home) reqByHome[r.home.i] = r; });
    D.atRisk.forEach(h => {
      h.req = reqByHome[h.i] || null;
      const replies = F.hash(h.i, 32) < (C.river ? .86 : .8);
      h.safeT = h.req ? null : replies ? F.ACT + 3 + Math.round(F.hash(h.i, 31) * 45) : null;
      h.deep = F.WL.A[F.peakT] - h.floor > .3;
    });
  }

  /* ---------- canvas ---------- */
  const stage = $('#stage'), cv = $('#map'), ctx = cv.getContext('2d');
  let dpr = 1, cw = 0, ch = 0, sc = 1, ox = 0, oy = 0;
  const X = x => ox + x * sc, Y = y => oy + y * sc;
  const terr = document.createElement('canvas'), base = document.createElement('canvas');
  const wcv = { A: document.createElement('canvas'), B: document.createElement('canvas') }, wimg = {};

  function buildTerrain() {
    terr.width = F.EW; terr.height = F.EH;
    const c = terr.getContext('2d'), im = c.createImageData(F.EW, F.EH), d = im.data, N = F.EW * F.EH;
    for (let j = 0; j < F.EH; j++) for (let i = 0; i < F.EW; i++) {
      const k = j * F.EW + i, p = k * 4;
      if (F.bay[k]) { const v = i / F.EW; d[p] = 6; d[p + 1] = 18 + v * 30; d[p + 2] = 34 + v * 50; d[p + 3] = 255; continue; }
      const e = F.elev[k];
      const ex = F.elev[Math.min(k + 1, N - 1)] - F.elev[Math.max(k - 1, 0)];
      const ey = F.elev[Math.min(k + F.EW, N - 1)] - F.elev[Math.max(k - F.EW, 0)];
      const shade = Math.max(-1, Math.min(1, (-ex - ey) * 6));
      let l = 15 + Math.min(e, 4) * 4.2 + shade * 6;
      const band = Math.floor(e / .5), kr = i < F.EW - 1 ? k + 1 : k, kd = j < F.EH - 1 ? k + F.EW : k;
      if ((!F.bay[kr] && Math.floor(F.elev[kr] / .5) !== band) || (!F.bay[kd] && Math.floor(F.elev[kd] / .5) !== band)) l += 9;
      d[p] = l * .86; d[p + 1] = l * .98; d[p + 2] = l * 1.22; d[p + 3] = 255;
    }
    c.putImageData(im, 0, 0);
    ['A', 'B'].forEach(f => { wcv[f].width = F.EW; wcv[f].height = F.EH; wimg[f] = wcv[f].getContext('2d').createImageData(F.EW, F.EH); });
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1); cw = r.width; ch = r.height;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    sc = Math.max(cw / F.W, ch / F.H);
    ox = (cw - F.W * sc) / 2; oy = (ch - F.H * sc) / 2;
    if (cw < 520) ox = Math.min(0, Math.max(cw - F.W * sc, cw / 2 - (F.me.x + 8) * sc));
    base.width = cv.width; base.height = cv.height;
    const b = base.getContext('2d'); b.setTransform(dpr, 0, 0, dpr, 0, 0);
    b.imageSmoothingEnabled = true; b.imageSmoothingQuality = 'high';
    b.drawImage(terr, X(0), Y(0), F.W * sc, F.H * sc);
    b.lineJoin = b.lineCap = 'round';
    for (const rv of F.rivers) {
      b.beginPath(); rv.pts.forEach((p, i) => i ? b.lineTo(X(p[0]), Y(p[1])) : b.moveTo(X(p[0]), Y(p[1])));
      b.strokeStyle = 'rgba(60,140,225,.6)'; b.lineWidth = Math.max(1.5, sc * rv.w); b.stroke();
    }
    const g = b.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * .35, cw / 2, ch / 2, Math.max(cw, ch) * .75);
    g.addColorStop(0, 'rgba(5,8,13,0)'); g.addColorStop(1, 'rgba(5,8,13,.55)');
    b.fillStyle = g; b.fillRect(0, 0, cw, ch);
    drawTimeline();
  }

  function waterLayer(f, t, time) {
    const im = wimg[f], d = im.data, wl = lerpWL(f, t), N = F.EW * F.EH;
    for (let k = 0; k < N; k++) {
      const p = k * 4;
      if (F.bay[k]) { d[p + 3] = 0; continue; }
      const dep = wl - F.elev[k];
      if (dep <= 0) { d[p + 3] = 0; continue; }
      const n = Math.min(1, dep / .9), s = Math.sin(time * 1.3 + F.shimmer[k] * 16) * .5 + .5;
      d[p] = 150 - n * 128 + s * 22; d[p + 1] = 214 - n * 120 + s * 18; d[p + 2] = 255 - n * 50;
      let a = .34 + n * .56; if (dep < .05) a *= .35 + dep / .05 * .65;
      d[p + 3] = a * 255;
    }
    wcv[f].getContext('2d').putImageData(im, 0, 0);
    return wcv[f];
  }
  const depthCol = (dep, a = 1) => dep > .3 ? `rgba(255,79,97,${a})` : dep > .12 ? `rgba(255,140,70,${a})` : dep > .03 ? `rgba(255,178,62,${a})` : `rgba(190,206,228,${a * .26})`;

  function drawWorld(f, t, time) {
    ctx.drawImage(waterLayer(f, t, time), X(0), Y(0), F.W * sc, F.H * sc);
    const wl = lerpWL(f, t);
    if (S.layers.homes) {
      const hs = Math.max(1.6, sc * .44);
      for (const h of F.homes) {
        const tf = f === 'A' ? h.tA : h.tB, wet = tf !== null && tf <= t;
        if (wet && f === 'B' && h.evac) { ctx.strokeStyle = 'rgba(255,79,97,.9)'; ctx.lineWidth = 1; ctx.strokeRect(X(h.x) - hs / 2 + .5, Y(h.y) - hs / 2 + .5, hs - 1, hs - 1); continue; }
        ctx.fillStyle = wet ? 'rgba(255,79,97,.95)' : (f === 'B' && h.sandbag && t >= F.ACT + 6 ? 'rgba(60,216,162,.75)' : 'rgba(160,180,206,.26)');
        ctx.fillRect(X(h.x) - hs / 2, Y(h.y) - hs / 2, hs, hs);
      }
    }
    ctx.lineCap = 'round'; ctx.lineWidth = Math.max(1.8, sc * .34);
    for (const s of F.streets) {
      for (let i = 0; i < s.smp.length - 1; i++) {
        const dep = wl - s.smpE[i];
        ctx.strokeStyle = s.bridge[i] ? 'rgba(220,230,244,.55)' : depthCol(dep, dep > .03 ? .95 : 1);
        ctx.beginPath(); ctx.moveTo(X(s.smp[i][0]), Y(s.smp[i][1])); ctx.lineTo(X(s.smp[i + 1][0]), Y(s.smp[i + 1][1])); ctx.stroke();
      }
    }
    const cs = Math.max(2, sc * .4);
    for (const c of F.cars) {
      if (f === 'B' && c.moved && t >= F.ACT + 4 + c.k * 20) continue;
      ctx.fillStyle = c.tA !== null && c.tA <= t ? '#ff4f61' : 'rgba(234,241,249,.75)';
      ctx.fillRect(X(c.x) - cs * .7, Y(c.y) - cs * .4, cs * 1.4, cs * .8);
    }
  }
  function strokePath(pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); }
  function label(text, x, y, ang = 0, color = 'rgba(200,214,232,.8)', size = 9.5) {
    ctx.save(); ctx.translate(x, y); if (ang > Math.PI / 2 || ang < -Math.PI / 2) ang += Math.PI; ctx.rotate(ang);
    ctx.font = `600 ${size}px Geist, system-ui, sans-serif`; try { ctx.letterSpacing = '1.2px'; } catch (e) { }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3.5; ctx.strokeStyle = 'rgba(5,8,13,.85)'; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
  }
  function pill(text, x, y, bg, fg) {
    ctx.font = '600 11px Geist, system-ui, sans-serif'; try { ctx.letterSpacing = '0px'; } catch (e) { }
    const w = ctx.measureText(text).width + 16, h = 22;
    let px = Math.max(8 + w / 2, Math.min(cw - 8 - w / 2, x));
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(px - w / 2, y - h - 12, w, h, 11); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, px, y - h / 2 - 12);
  }

  /* rain */
  const drops = Array.from({ length: 420 }, () => ({ x: Math.random(), y: Math.random(), l: .6 + Math.random() * .8, v: .7 + Math.random() * .6 }));
  function drawRain(c, w, h, intensity, peak, dt) {
    const n = Math.round(30 + intensity / peak * (drops.length - 30));
    c.strokeStyle = 'rgba(190,222,255,.22)'; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i < n; i++) {
      const d = drops[i]; d.y += d.v * dt * 1.4; d.x += d.v * dt * .18; if (d.y > 1.05) { d.y = -.05; d.x = Math.random(); } if (d.x > 1) d.x -= 1;
      const L = 10 + d.l * 14 * (.5 + intensity / peak);
      c.moveTo(d.x * w, d.y * h); c.lineTo(d.x * w + L * .13, d.y * h + L);
    }
    c.stroke();
  }

  /* request status at time t */
  function reqState(r, t) {
    if (r.t > t) return 'future';
    if (r.reach !== null && r.reach <= t) return 'reached';
    if (r.assign !== null && r.assign <= t) return 'enroute';
    return 'waiting';
  }

  function render(time, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.drawImage(base, 0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const t = S.t, fut = S.mode === 'futures';
    if (fut) {
      const sx = cw * S.split;
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sx, ch); ctx.clip(); drawWorld('A', t, time); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(sx, 0, cw - sx, ch); ctx.clip(); drawWorld('B', t, time); ctx.restore();
    } else drawWorld('A', t, time);

    if (S.hl) {
      ctx.save(); ctx.shadowColor = 'rgba(159,220,255,.9)'; ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(234,241,249,.95)';
      ctx.lineWidth = Math.max(3, sc * .6); strokePath(S.hl.pts); ctx.stroke(); ctx.restore();
    }

    if (S.mode === 'ses') {
      if (S.layers.heat) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const r = sc * 3.4;
        for (const h of D.atRisk) {
          if (h.tA > t + 30 || h.tA < t - 25) continue;
          const g = ctx.createRadialGradient(X(h.x), Y(h.y), 0, X(h.x), Y(h.y), r);
          g.addColorStop(0, 'rgba(255,120,60,.14)'); g.addColorStop(1, 'rgba(255,60,60,0)');
          ctx.fillStyle = g; ctx.fillRect(X(h.x) - r, Y(h.y) - r, r * 2, r * 2);
        }
        ctx.restore();
      }
      C.staging.forEach(p => {
        const s = Math.max(8, sc * 1.1);
        ctx.fillStyle = p.crew ? '#ffb23e' : '#9fdcff'; ctx.fillRect(X(p.x) - s / 2, Y(p.y) - s / 2, s, s);
        ctx.strokeStyle = 'rgba(5,8,13,.9)'; ctx.lineWidth = 2; ctx.strokeRect(X(p.x) - s / 2, Y(p.y) - s / 2, s, s);
        if (p.label) label(p.label.toUpperCase(), X(p.x), Y(p.y) + s + 6, 0, '#ffd38e', 9);
      });
      drawRequests(t, time, true);
    }

    for (const s of F.streets) {
      const u = C.labelAt[s.name] ?? .5, i = Math.floor(u * (s.smp.length - 2)), a = s.smp[i], b = s.smp[i + 1];
      label(s.name.toUpperCase(), X(a[0]), Y(a[1]) + (Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) ? 0 : -sc * .9), Math.atan2(Y(b[1]) - Y(a[1]), X(b[0]) - X(a[0])));
    }
    C.bigLabels.forEach(l => label(l.text, X(l.x), Y(l.y), l.ang, l.color, l.size || 10));

    if ((S.mode === 'council' && S.layers.vuln) || S.mode === 'ses') {
      for (const v of F.sites) {
        const wet = v.tA !== null && v.tA <= t, s = Math.max(7, sc * .9);
        ctx.save(); ctx.translate(X(v.x), Y(v.y)); ctx.rotate(Math.PI / 4);
        ctx.fillStyle = wet ? '#ff4f61' : (v.tA !== null ? '#ffb23e' : '#3cd8a2');
        ctx.fillRect(-s / 2, -s / 2, s, s); ctx.strokeStyle = 'rgba(5,8,13,.9)'; ctx.lineWidth = 2; ctx.strokeRect(-s / 2, -s / 2, s, s); ctx.restore();
        if (wet) { ctx.strokeStyle = `rgba(255,79,97,${.5 + .5 * Math.sin(time * 4)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X(v.x), Y(v.y), s * 1.3, 0, 7); ctx.stroke(); }
        label(v.kind.toUpperCase(), X(v.x), Y(v.y) - s - 4, 0, '#eaf1f9', 9);
      }
    }

    if (S.mode === 'resident') {
      if (S.route) {
        ctx.save(); ctx.setLineDash([sc * .7, sc * .55]); ctx.lineDashOffset = -time * 18;
        ctx.shadowColor = 'rgba(60,216,162,.8)'; ctx.shadowBlur = 10;
        ctx.strokeStyle = '#3cd8a2'; ctx.lineWidth = Math.max(2.5, sc * .42); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        strokePath(F.safeRoute.pts); ctx.stroke(); ctx.restore();
        ctx.fillStyle = '#3cd8a2'; ctx.beginPath(); ctx.arc(X(F.safe.x), Y(F.safe.y), Math.max(5, sc * .6), 0, 7); ctx.fill();
        pill('Higher ground · +' + (F.safe.elev - F.me.elev).toFixed(1) + ' m', X(F.safe.x), Y(F.safe.y), '#3cd8a2', '#04140e');
      }
      if (S.myReq) drawRequests(t, time, false);
      const me = F.me, r = Math.max(5, sc * .6), pulse = (time % 1.6) / 1.6;
      ctx.strokeStyle = `rgba(234,241,249,${1 - pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(X(me.x), Y(me.y), r + pulse * r * 3.2, 0, 7); ctx.stroke();
      ctx.fillStyle = '#eaf1f9'; ctx.beginPath(); ctx.arc(X(me.x), Y(me.y), r, 0, 7); ctx.fill();
      ctx.fillStyle = '#05080d'; ctx.beginPath(); ctx.arc(X(me.x), Y(me.y), r * .45, 0, 7); ctx.fill();
      const dep = Math.max(0, lerpWL('A', t) - me.elev);
      pill(dep > .02 ? `You · ${cm(dep)} at your door` : `You · ${me.label}`, X(me.x), Y(me.y), dep > .15 ? '#ff4f61' : '#eaf1f9', dep > .15 ? '#fff' : '#05080d');
    }
    drawRain(ctx, cw, ch, F.rain[Math.min(F.T, Math.floor(t))], D.peakRain, dt);
  }

  function drawRequests(t, time, all) {
    const list = all ? F.REQ.B : [S.myReq];
    for (const r of list) {
      const st = reqState(r, t); if (st === 'future') continue;
      const x = X(r.x), y = Y(r.y), s = Math.max(4, sc * .55);
      if (st === 'enroute') {
        const u = Math.min(1, (t - r.assign) / Math.max(1, r.reach - r.assign));
        const cx = X(r.crewXY[0] + (r.x - r.crewXY[0]) * u), cy = Y(r.crewXY[1] + (r.y - r.crewXY[1]) * u);
        ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(255,178,62,.75)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
        ctx.fillStyle = '#ffb23e'; ctx.beginPath(); ctx.arc(cx, cy, s * .9, 0, 7); ctx.fill();
        ctx.strokeStyle = '#05080d'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      if (st === 'reached') { ctx.fillStyle = 'rgba(60,216,162,.9)'; ctx.beginPath(); ctx.arc(x, y, s * .7, 0, 7); ctx.fill(); continue; }
      const pulse = ((time + (r.p % 1)) % 1.2) / 1.2;
      ctx.strokeStyle = `rgba(255,79,97,${1 - pulse})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, s + pulse * s * 2.6, 0, 7); ctx.stroke();
      ctx.fillStyle = st === 'enroute' ? '#ffb23e' : '#ff4f61'; ctx.beginPath(); ctx.arc(x, y, s, 0, 7); ctx.fill();
      if (r.id === 'me' && all) pill('YOU', x, y, '#52b6ff', '#05080d');
    }
  }

  /* ---------- timeline ---------- */
  const tl = $('#tl'), tctx = tl.getContext('2d'), scrub = $('#scrub');
  function drawTimeline() {
    const r = tl.getBoundingClientRect(); if (!r.width || !F) return;
    tl.width = r.width * dpr; tl.height = r.height * dpr; const c = tctx; c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = r.width, h = r.height, top = 16, bot = h - 16, tx = t => t / F.T * w;
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.025)'; c.fillRect(0, top, tx(F.NOW), bot - top);
    const bw = w / (F.T + 1);
    for (let t = 0; t <= F.T; t++) {
      const v = F.rain[t] / D.peakRain, bh = v * (bot - top - 4), past = t <= S.t;
      c.fillStyle = v > .6 ? (past ? 'rgba(159,220,255,.95)' : 'rgba(159,220,255,.4)') : (past ? 'rgba(82,182,255,.8)' : 'rgba(82,182,255,.3)');
      c.fillRect(t * bw + .3, bot - bh, Math.max(1, bw - .6), bh);
    }
    const line = (f, col) => {
      c.beginPath();
      for (let t = 0; t <= F.T; t++) { const d = Math.max(0, F.WL[f][t] - F.me.elev); const y = bot - Math.min(1, d) * (bot - top - 4); t ? c.lineTo(tx(t), y) : c.moveTo(tx(t), y); }
      c.strokeStyle = col; c.lineWidth = 1.5; c.stroke();
    };
    line('A', 'rgba(255,79,97,.85)');
    if (S.mode === 'futures' && !C.river) line('B', 'rgba(60,216,162,.9)');
    c.font = '500 10px "Geist Mono", ui-monospace, monospace'; c.fillStyle = '#5e6c82'; c.textBaseline = 'alphabetic';
    [0, 30, 60, 90, 120, 150].forEach(t => { c.textAlign = t === 0 ? 'left' : t === 150 ? 'right' : 'center'; c.fillText(clock(t).replace(/ (am|pm)/, ''), tx(t), h - 2); });
    c.strokeStyle = 'rgba(234,241,249,.5)'; c.setLineDash([2, 3]); c.beginPath(); c.moveTo(tx(F.NOW), top - 4); c.lineTo(tx(F.NOW), bot); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#8d9cb2'; c.textAlign = 'center'; c.fillText('NOW', tx(F.NOW), 10);
    c.fillStyle = '#ff4f61'; c.beginPath(); c.arc(tx(F.me.floodT), bot - .15 * (bot - top - 4), 3, 0, 7); c.fill();
    c.fillText('YOUR DOOR', Math.min(w - 30, tx(F.me.floodT)), 10);
    const px = tx(S.t);
    c.fillStyle = '#eaf1f9'; c.fillRect(px - 1, top - 6, 2, bot - top + 6);
    c.beginPath(); c.arc(px, top - 6, 4.5, 0, 7); c.fill();
  }

  function syncT(fromInput) {
    if (!fromInput) scrub.value = Math.round(S.t);
    const t = Math.round(S.t), d = t - F.NOW;
    $('#hudTime').textContent = clock(t);
    const sub = $('#hudSub');
    sub.textContent = d === 0 ? 'Now · latest forecast' : d > 0 ? `Forecast · +${d} min` : `Observed · ${d} min`;
    sub.className = 'sub' + (d > 0 ? ' fc' : '');
    scrub.setAttribute('aria-valuetext', `${clock(t)}, ${d >= 0 ? '+' : ''}${d} minutes`);
    drawTimeline(); updateDyn();
  }
  scrub.addEventListener('input', () => { setPlaying(false); S.t = +scrub.value; syncT(true); });
  const playBtn = $('#play'), playIco = $('#playIco');
  function setPlaying(on) {
    S.playing = on;
    playIco.innerHTML = on ? '<path d="M5 3.5h3v11H5zM10 3.5h3v11h-3z" fill="currentColor"/>' : '<path d="M5 3.5v11l9-5.5z" fill="currentColor"/>';
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play the storm');
  }
  function play(from, to) { if (from !== undefined) S.t = from; S.stopAt = to ?? F.T; setPlaying(true); }
  playBtn.addEventListener('click', () => { if (S.playing) setPlaying(false); else play(S.t >= F.T - 1 ? F.NOW : S.t, F.T); });
  document.addEventListener('keydown', e => { if (e.code === 'Space' && !introOpen && e.target === document.body) { e.preventDefault(); playBtn.click(); } });

  let cdEl = null;
  function tickCountdown() {
    if (!cdEl || !cdEl.isConnected) return;
    const left = Math.max(0, D.minsLeft * 60 - (performance.now() - S.startReal) / 1000);
    const txt = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
    if (cdEl.firstChild.nodeValue !== txt) cdEl.firstChild.nodeValue = txt;
  }

  /* ---------- panel pieces ---------- */
  const foot = '<p class="foot">Simulated scenario for demonstration. Terrain, rainfall and impacts are modelled, not live data.</p>';

  function checkinHTML() {
    const t = Math.round(S.t), wet = t >= F.me.floodT;
    if (S.checkin === 'safe') {
      const n = D.atRisk.filter(h => h.safeT !== null && h.safeT <= Math.max(t, F.ACT + 20)).length;
      return `<div class="status-card safe"><div class="hd"><b>You're marked safe</b><span class="pill dry">Shared</span></div>
        <p>Your household, and the SES, can see you're OK, so no crew is sent to your door. ${fmt(n)} other households nearby have checked in safe.</p>
        <div><button class="btn sm" data-ci="reset">Change my status</button></div></div>`;
    }
    if (S.checkin === 'form') {
      const fm = S.form, needs = ['Elderly', 'Children', 'Medical', 'Disability', 'Pets'], levels = ['Ankle', 'Knee', 'Waist', 'Chest'];
      return `<div class="form" role="group" aria-label="Request rescue">
        <h4>Request rescue</h4>
        <div class="field"><span class="lbl">People with you</span><div class="stepper"><button data-ci="minus" aria-label="Fewer people">−</button><output id="ppl">${fm.people}</output><button data-ci="plus" aria-label="More people">+</button></div></div>
        <div class="field"><span class="lbl">Anyone who needs extra help</span><div class="chips">${needs.map(n => `<button class="chip" data-need="${n}" aria-pressed="${fm.needs.has(n)}">${n}</button>`).join('')}</div></div>
        <div class="field"><span class="lbl">Water inside right now</span><div class="chips">${levels.map(n => `<button class="chip" data-level="${n}" aria-pressed="${fm.level === n}">${n}</button>`).join('')}</div></div>
        <p class="note">Your location is sent automatically. If your battery is low, we'll keep your place in the queue.</p>
        <div class="form-actions"><button class="btn danger" data-ci="send">Send rescue request</button><button class="btn sm" data-ci="reset">Cancel</button></div>
      </div>`;
    }
    if (S.checkin === 'sent' && S.myReq) return `<div class="status-card" id="myStatus">${myStatusHTML()}</div>`;
    return `<div class="sec">
      <div class="sec-h"><h3>${wet ? "Water is at your door. Tell us you're OK" : 'When the water comes, check in'}</h3><span>1 tap</span></div>
      <div class="checkin">
        <button class="big-btn safe" data-ci="safe">I'm safe<small>No one needs to come</small></button>
        <button class="big-btn help" data-ci="help">I need help<small>Goes straight to the rescue queue</small></button>
      </div></div>`;
  }

  function queueRank(r, t) {
    const live = F.REQ.B.filter(x => x.t <= t && (x.assign === null || x.assign > t));
    const score = x => x.p + (t - x.t) * 1.2;
    return 1 + live.filter(x => x !== r && score(x) > score(r)).length;
  }
  function myStatusHTML() {
    const r = S.myReq, t = Math.round(S.t), st = reqState(r, t);
    const steps = [
      ['Request received', r.t, st !== 'future'],
      [`Prioritised ${r.prioLabel}`, r.t, st !== 'future'],
      [`${r.crew || 'Crew'} assigned`, r.assign, st === 'enroute' || st === 'reached'],
      ['On the way', r.assign, st === 'enroute' || st === 'reached'],
      ['Crew with you', r.reach, st === 'reached'],
    ];
    const nowIdx = steps.findIndex(s => !s[2]);
    let big = '', line = '';
    if (st === 'reached') { big = 'Help is here'; line = `${r.crew} reached you at ${clock(r.reach)}. Follow the crew's instructions.`; }
    else if (st === 'enroute') { big = `${Math.max(1, r.reach - t)}<small>min away</small>`; line = `${r.crew} is on the way. Stay where you are, move to the highest point and keep a light on.`; }
    else if (st === 'waiting') { big = `#${queueRank(r, t)}<small>in the queue</small>`; line = `Priority ${r.prioLabel}. You're ranked by water depth, people and needs, not by who called first. Stay on the highest floor.`; }
    else { big = 'Sending'; line = `Request will send at ${clock(r.t)}.`; }
    return `<div class="hd"><b>Rescue request · ${r.people} ${r.people === 1 ? 'person' : 'people'}${r.needs.length ? ' · ' + r.needs.join(', ') : ''}</b><span class="pill ${r.prioLabel === 'P1' ? 'p1' : r.prioLabel === 'P2' ? 'p2' : 'p3'}">${r.prioLabel}</span></div>
      <div class="eta">${big}</div><p>${line}</p>
      <div class="track">${steps.map((s, i) => `<div class="stp ${s[2] ? 'done' : i === nowIdx ? 'now' : ''}"><i></i><span>${s[0]}</span><time>${s[2] && s[1] !== null ? clock(s[1]) : ''}</time></div>`).join('')}</div>
      <p class="note">Press play or drag the timeline to follow the rescue. <button class="linkbtn" data-ci="cancel">Cancel request</button></p>`;
  }

  function deliverHTML() {
    const L = LANGS.find(l => l[0] === S.lang), body = P.sms[S.lang](D.minsLeft);
    return `<div class="deliver">
      <div class="sec-h"><h3>How this alert reaches everyone</h3><span>no app needed</span></div>
      <div class="langs" role="group" aria-label="Alert language">${LANGS.map(l => `<button class="chip" data-lang="${l[0]}" aria-pressed="${l[0] === S.lang}">${l[1]}</button>`).join('')}</div>
      <div class="phone"><div class="notch"></div><div class="ph-top"><span>${clock(F.ACT)}</span><span>SMS</span></div>
        <div class="sms-from"><b>FlashGuard</b>Emergency alert</div>
        <div class="bubble" lang="${L[2]}">${body}</div>
        <div class="reply"><span>1</span><span>2</span></div>
      </div>
      <div style="display:flex;justify-content:center"><button class="btn sm water" id="voiceBtn"><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6v4h3l4 3V3L6 6z" fill="currentColor"/><path d="M12 5.5a3.5 3.5 0 0 1 0 5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Play the voice call</button></div>
      <div class="reach">${P.reach.map(r => `<div class="reach-row"><span>${r[0]}</span><span class="b"><i style="width:${r[1]}%"></i></span><span class="n">${r[1]}%</span></div>`).join('')}
        <p class="note">Share of at-risk homes reached by each channel. Anyone who doesn't reply goes on the SES doorknock list.</p></div>
    </div>`;
  }

  function speak() {
    try {
      const synth = window.speechSynthesis; if (!synth) throw 0;
      synth.cancel();
      const L = LANGS.find(l => l[0] === S.lang);
      const text = P.sms[S.lang](D.minsLeft).replace(/FlashGuard/g, 'Flash Guard');
      const u = new SpeechSynthesisUtterance(text); u.lang = L[2]; u.rate = .95;
      const v = synth.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith(L[2].slice(0, 2).toLowerCase()));
      if (v) u.voice = v;
      synth.speak(u);
    } catch (e) { const b = $('#voiceBtn'); if (b) b.textContent = 'Voice isn\'t available in this browser'; }
  }

  /* ---------- views ---------- */
  const views = {
    resident() {
      const items = P.checklist(), done = items.filter(i => S.checks.has(i[0])).length, al = P.alert();
      return `
      <div class="sec"><div class="eyebrow">${P.home}</div><h2 class="h-display">Water reaches your door in</h2></div>
      <div class="count-card">
        <div class="k">Severe ${P.kind.toLowerCase()} risk · confidence 87%</div>
        <div class="count" id="cd">00:00<small>min</small></div>
        <div class="s">Expected at <b>${clock(F.me.floodT)}</b>. Peaks at <b>${cm(F.me.peak)}</b> around <b>${clock(F.peakT)}</b>.</div>
        <div class="risk-steps"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>
        <div class="risk-lbl"><span>Low</span><span>Moderate</span><span>High</span><b>Severe</b></div>
      </div>
      <div id="checkin">${checkinHTML()}</div>
      <div class="alert">
        <div class="t"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 1.5 17h17z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 8v4M10 14.5v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>${al.title}</div>
        <p>${al.text}</p>
        <div><button class="btn sm water" id="routeBtn" aria-pressed="${S.route}">${S.route ? 'Hide safe route' : 'Show safe route'}</button></div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Why your risk is high</h3><span>4 signals</span></div>
        <dl class="why">${P.why().map(w => `<div><dt>${w[0]}</dt><dd>${w[1]}</dd></div>`).join('')}</dl>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Before the water</h3><span id="chkN">${done} of ${items.length} done</span></div>
        <div class="prog"><i id="chkBar" style="width:${done / items.length * 100}%"></i></div>
        <div class="checks">${items.map(i => `<label class="chk"><input type="checkbox" id="chk-${i[0]}" data-k="${i[0]}" ${S.checks.has(i[0]) ? 'checked' : ''}><span>${i[1]}<small>${i[2]}</small></span></label>`).join('')}</div>
      </div>
      ${deliverHTML()}
      <p class="note">Never drive or walk through floodwater; 15 cm of moving water can float a small car. Life-threatening emergency: <b>000</b>. SES flood and storm help: <b>132 500</b>.</p>
      ${foot}`;
    },
    council() {
      const hot = D.hot, maxPk = Math.max(...hot.map(s => s.peak)), K = P.council;
      return `
      <div class="sec"><div class="eyebrow">${K.eyebrow}</div><h2 class="h-display">${hot.length} streets will flood. Here's where to act first.</h2></div>
      <div class="kpis">
        <div class="kpi"><div class="v crit">${fmt(D.atRisk.length)}</div><div class="l">Homes over floor level</div></div>
        <div class="kpi"><div class="v">${clock(D.first.floodT)}</div><div class="l">First flooding · ${D.first.name}</div></div>
        <div class="kpi"><div class="v">${F.sites.filter(s => s.tA !== null).length} of ${F.sites.length}</div><div class="l">Vulnerable sites affected</div></div>
        <div class="kpi"><div class="v">${money(F.OUT.A.damage)}</div><div class="l">Damage if nobody acts</div></div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Ranked hotspots</h3><span>tap to locate</span></div>
        <div class="rank">${hot.map((s, i) => `<button class="rk${S.hl === s ? ' on' : ''}" data-street="${s.name}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span><span class="nm">${s.name}</span><br><span class="ds">Floods ${clock(s.floodT)} · ${s.homes} homes${s.vuln ? ' · ' + s.vuln + ' vulnerable site' + (s.vuln > 1 ? 's' : '') : ''}</span></span><span><div class="dep" style="color:${s.peak > .5 ? '#ff8a96' : '#ffc36e'}">${cm(s.peak)}</div><div class="meter"><i style="width:${s.peak / maxPk * 100}%;background:${s.peak > .5 ? 'var(--crit)' : 'var(--warn)'}"></i></div></span></button>`).join('')}</div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Map layers</h3></div>
        <div class="toggles">
          <button class="tog" data-layer="vuln" aria-pressed="${S.layers.vuln}" style="--c:var(--warn)"><i></i>Vulnerable communities</button>
          <button class="tog" data-layer="homes" aria-pressed="${S.layers.homes}" style="--c:var(--crit)"><i></i>Homes at risk</button>
        </div>
        <div class="rank">${F.sites.map(v => `<div class="rk" style="cursor:default"><span class="n">◆</span><span><span class="nm">${v.name}</span><br><span class="ds">${v.kind} · ${v.people} people</span></span><span>${v.tA === null ? '<span class="pill dry">Stays dry</span>' : `<span class="pill ${v.tA - F.NOW < 45 ? 'p1' : 'p2'}">${clock(v.tA)}</span>`}</span></div>`).join('')}</div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>${K.recHead}</h3><span>crews: 3</span></div>
        ${hot.slice(0, 3).map(s => `<div class="rec"><div class="top2"><b>${K.recTitle(s)}</b><span class="when">by ${clock(Math.max(F.NOW + 5, K.recBy(s)))}</span></div><p>${K.recText(s)}</p></div>`).join('')}
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Infrastructure priorities</h3><span>illustrative estimates</span></div>
        <div class="tbl"><table class="infra"><thead><tr><th>Project</th><th class="num">Cost</th><th class="num">Avoided / yr</th><th class="num">BCR</th></tr></thead>
          <tbody>${P.infra.map(r => `<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td class="num">${r[2]}</td><td class="num">${r[3]}</td></tr>`).join('')}</tbody></table></div>
        <p class="note">Ranked by damage avoided over 30 years against this storm, replayed under 2050 rainfall intensity.</p>
      </div>
      ${foot}`;
    },
    ses() {
      const A = F.CURVE.A, B = F.CURVE.B, mx = Math.max(...A, 1), peakBin = A.indexOf(mx);
      const bins = A.map((v, i) => i).filter(i => i >= 5 && i <= 13);
      const W = 340, Hh = 130, bw = W / bins.length;
      const svg = `<svg viewBox="0 0 ${W} ${Hh + 22}" role="img" aria-label="Predicted callouts per 10 minutes">
        ${[0, .5, 1].map(f => `<line x1="0" x2="${W}" y1="${Hh - f * (Hh - 10)}" y2="${Hh - f * (Hh - 10)}" stroke="rgba(150,182,224,.12)"/>`).join('')}
        ${bins.map((i, k) => { const ha = A[i] / mx * (Hh - 10), hb = B[i] / mx * (Hh - 10); return `<rect x="${k * bw + 5}" y="${Hh - ha}" width="${bw / 2 - 5}" height="${ha}" rx="3" fill="#ff4f61"/><rect x="${k * bw + bw / 2 + 1}" y="${Hh - hb}" width="${bw / 2 - 5}" height="${hb}" rx="3" fill="#3cd8a2" opacity=".85"/>${A[i] ? `<text x="${k * bw + bw / 4 + 2}" y="${Hh - ha - 5}" fill="#eaf1f9" font-size="10" font-family="Geist Mono, monospace" text-anchor="middle">${A[i]}</text>` : ''}<text x="${k * bw + bw / 2}" y="${Hh + 16}" fill="#5e6c82" font-size="10" font-family="Geist Mono, monospace" text-anchor="middle">${clock(i * 10).replace(/ (am|pm)/, '')}</text>`; }).join('')}
      </svg>`;
      const sitesSorted = F.sites.filter(s => s.tA !== null).sort((a, b) => a.tA - b.tA);
      const act = { 'Aged care': 'Doorknock and move residents to safety', 'Low mobility': 'Doorknock and help residents leave', 'Caravan park': 'Wake every van and move people out', 'School': 'Notify staff and close the grounds', 'Childcare': 'Notify staff before opening', };
      return `
      <div class="sec"><div class="eyebrow">${P.ses.eyebrow}</div><h2 class="h-display">${F.OUT.A.callouts} calls for help are coming. The first wave lands at ${clock(peakBin * 10)}.</h2></div>
      <div class="kpis">
        <div class="kpi"><div class="v crit" id="kNeed">0</div><div class="l">Need help right now</div></div>
        <div class="kpi"><div class="v" id="kCrews">0</div><div class="l">Crews on a rescue</div></div>
        <div class="kpi"><div class="v" id="kSafe">0</div><div class="l">Households checked in safe</div></div>
        <div class="kpi"><div class="v" id="kSilent">0</div><div class="l">No reply, deep water coming</div></div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Live rescue queue</h3><span id="qTime">ranked by risk, not call order</span></div>
        <div class="rank" id="queue"></div>
      </div>
      <div class="knock" id="knock"></div>
      <div class="chart">
        <div class="sec-h" style="margin-bottom:8px"><h3>Predicted calls for help per 10 min</h3><span>heatmap = next 30 min</span></div>
        ${svg}
        <div class="lg"><span><i style="background:#ff4f61"></i>If nobody acts</span><span><i style="background:#3cd8a2"></i>With FlashGuard alerts</span></div>
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Pre-position now</h3><span>${P.prepos().length} actions</span></div>
        ${P.prepos().map(r => `<div class="rec"><div class="top2"><b>${r[0]}</b><span class="when">${r[1]}</span></div><p>${r[2]}</p></div>`).join('')}
      </div>
      <div class="sec">
        <div class="sec-h"><h3>Vulnerable sites</h3><span>ranked by time</span></div>
        <div class="rank">
          ${sitesSorted.map((s, i) => `<div class="rk" style="cursor:default"><span class="pill ${i < 2 ? 'p1' : 'p2'}">${i < 2 ? 'P1' : 'P2'}</span><span><span class="nm">${s.name}</span><br><span class="ds">${s.people} people, floods ${clock(s.tA)}. ${act[s.kind] || 'Warn and assist'} by ${clock(Math.max(F.NOW + 5, s.tA - 20))}.</span></span><span></span></div>`).join('')}
          <div class="rk" style="cursor:default"><span class="pill p2">P2</span><span><span class="nm">Close ${D.first.name}</span><br><span class="ds">First street to flood, ${clock(D.first.floodT)}. Barriers in by ${clock(Math.max(F.NOW + 5, D.first.floodT - 15))}.</span></span><span></span></div>
        </div>
      </div>
      <div class="toggles"><button class="tog" data-layer="heat" aria-pressed="${S.layers.heat}" style="--c:#ff784a"><i></i>Calls-for-help heatmap</button></div>
      ${foot}`;
    },
    futures() {
      const hp = P.fut.hero === 'people';
      return `
      <div class="sec">
        <div class="eyebrow">Two Futures · same ${C.river ? 'flood' : 'storm'}</div>
        <h2 class="h-display">The ${C.river ? 'river' : 'rain'} is identical. <em>What people do in the next ${D.minsLeft} minutes is not.</em></h2>
        <p class="lede">${P.fut.lede()}</p>
      </div>
      <div class="fut-hero">
        <div class="eyebrow" id="futBy"></div>
        <div class="save"><span id="futSave">0</span></div>
        <p id="futLine"></p>
      </div>
      <div class="vs">
        <div class="row"><span id="vsBy">By ${clock(S.t)}</span><span class="a">Waits</span><span class="b">Acts</span></div>
        <div class="row"><span>Homes flooded</span><span class="a" id="vH1">0</span><span class="b" id="vH2">0</span></div>
        <div class="row"><span>People inside flooded homes</span><span class="a" id="vP1">0</span><span class="b" id="vP2">0</span></div>
        <div class="row"><span>Cars written off</span><span class="a" id="vC1">0</span><span class="b" id="vC2">0</span></div>
        <div class="row"><span>Calls for help</span><span class="a" id="vS1">0</span><span class="b" id="vS2">0</span></div>
        <div class="row"><span>Damage</span><span class="a" id="vD1">$0</span><span class="b" id="vD2">$0</span></div>
      </div>
      <div class="vs">
        <div class="row"><span>Rescue · whole night</span><span class="a">Waits</span><span class="b">Acts</span></div>
        <div class="row"><span>Most urgent callers reached in</span><span class="a">${F.WAIT.A.p1} min</span><span class="b">${F.WAIT.B.p1} min</span></div>
        <div class="row"><span>Calls still waiting at ${clock(F.T + 60)}</span><span class="a">${F.WAIT.A.unreached}</span><span class="b">${F.WAIT.B.unreached}</span></div>
      </div>
      <div><button class="btn primary" id="runNight">Play the ${C.river ? 'night' : 'evening'}
        <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true"><path d="M5 3.5v11l9-5.5z" fill="currentColor"/></svg></button></div>
      <div class="sec">
        <div class="sec-h"><h3>What changed on the right</h3></div>
        <ul class="acts">${P.acts().map(a => `<li><time>${clock(a[0])}</time><span>${a[1]}</span></li>`).join('')}</ul>
      </div>
      <p class="climate">${P.fut.climate}</p>
      ${C.river ? '<p class="note">Hollow red squares on the right are flooded homes that people already left.</p>' : ''}
      ${foot}`;
    },
  };

  /* ---------- panel wiring ---------- */
  const panel = $('#panel');
  function renderPanel() {
    panel.innerHTML = `<div class="view">${views[S.mode]()}</div>`;
    cdEl = $('#cd'); tickCountdown();
    wirePanel(); updateDyn();
  }
  function wirePanel() {
    const rb = $('#routeBtn'); if (rb) rb.onclick = () => { S.route = !S.route; rb.setAttribute('aria-pressed', S.route); rb.textContent = S.route ? 'Hide safe route' : 'Show safe route'; };
    panel.querySelectorAll('.chk input').forEach(i => i.onchange = () => {
      i.checked ? S.checks.add(i.dataset.k) : S.checks.delete(i.dataset.k);
      $('#chkN').textContent = `${S.checks.size} of 5 done`; $('#chkBar').style.width = S.checks.size / 5 * 100 + '%';
    });
    panel.querySelectorAll('[data-street]').forEach(b => b.onclick = () => {
      const s = F.streets.find(x => x.name === b.dataset.street); S.hl = S.hl === s ? null : s;
      panel.querySelectorAll('[data-street]').forEach(x => x.classList.toggle('on', !!S.hl && x.dataset.street === S.hl.name));
      if (S.hl && S.t < S.hl.floodT) { S.t = Math.min(F.T, S.hl.floodT + 8); syncT(false); }
    });
    panel.querySelectorAll('[data-layer]').forEach(b => b.onclick = () => { const k = b.dataset.layer; S.layers[k] = !S.layers[k]; b.setAttribute('aria-pressed', S.layers[k]); });
    panel.querySelectorAll('[data-lang]').forEach(b => b.onclick = () => { S.lang = b.dataset.lang; try { speechSynthesis.cancel(); } catch (e) { } const d = panel.querySelector('.deliver'); d.outerHTML = deliverHTML(); wirePanel(); });
    const vb = $('#voiceBtn'); if (vb) vb.onclick = speak;
    const rn = $('#runNight'); if (rn) rn.onclick = () => play(F.NOW, F.T);
    wireCheckin();
  }
  function rerenderCheckin() { const el = $('#checkin'); if (el) { el.innerHTML = checkinHTML(); wireCheckin(); } }
  function wireCheckin() {
    const el = $('#checkin'); if (!el) return;
    el.querySelectorAll('[data-ci]').forEach(b => b.onclick = () => {
      const a = b.dataset.ci;
      if (a === 'safe') S.checkin = 'safe';
      else if (a === 'help') { S.checkin = 'form'; S.form = { people: 3, needs: new Set(), level: Math.round(S.t) >= F.me.floodT ? 'Knee' : 'Ankle' }; }
      else if (a === 'reset') { S.checkin = null; }
      else if (a === 'minus') { S.form.people = Math.max(1, S.form.people - 1); $('#ppl').textContent = S.form.people; return; }
      else if (a === 'plus') { S.form.people = Math.min(12, S.form.people + 1); $('#ppl').textContent = S.form.people; return; }
      else if (a === 'send') sendRequest();
      else if (a === 'cancel') { F.REQ.B = F.REQ.B.filter(r => r.id !== 'me'); F.schedule(F.REQ.B, 'triage'); S.myReq = null; S.checkin = null; }
      rerenderCheckin();
    });
    el.querySelectorAll('[data-need]').forEach(b => b.onclick = () => { const n = b.dataset.need; S.form.needs.has(n) ? S.form.needs.delete(n) : S.form.needs.add(n); b.setAttribute('aria-pressed', S.form.needs.has(n)); });
    el.querySelectorAll('[data-level]').forEach(b => b.onclick = () => { S.form.level = b.dataset.level; el.querySelectorAll('[data-level]').forEach(x => x.setAttribute('aria-pressed', x.dataset.level === S.form.level)); });
  }
  function sendRequest() {
    const fm = S.form, lv = { Ankle: .1, Knee: .45, Waist: .9, Chest: 1.3 }[fm.level];
    F.REQ.B = F.REQ.B.filter(r => r.id !== 'me');
    const r = { id: 'me', x: F.me.x, y: F.me.y, t: Math.max(F.NOW, Math.round(S.t)), people: fm.people, needs: [...fm.needs].filter(n => n !== 'Pets'), level: fm.level, peakDepth: Math.max(F.me.peak, lv), addr: F.me.label, you: true };
    F.REQ.B.push(r); F.schedule(F.REQ.B, 'triage');
    S.myReq = r; S.checkin = 'sent';
  }

  function cumulative(f, t) {
    const hs = F.homes.filter(h => { const x = f === 'A' ? h.tA : h.tB; return x !== null && x <= t; });
    const inside = f === 'B' ? hs.filter(h => !h.evac) : hs;
    const cars = F.cars.filter(c => c.tA !== null && c.tA <= t && !(f === 'B' && c.moved)).length;
    const calls = F.REQ[f].filter(r => r.t <= t && r.id !== 'me').length;
    return { homes: hs.length, people: inside.reduce((s, h) => s + h.people, 0), cars, calls, damage: Math.round(hs.length * C.damageHome * (f === 'B' && C.river ? .85 : 1) + cars * C.damageCar) };
  }

  function updateDyn() {
    const t = Math.round(S.t), set = (id, v) => { const e = $(id); if (e) e.innerHTML = v; };
    if (S.mode === 'futures' && $('#vH1')) {
      const a = cumulative('A', t), b = cumulative('B', t);
      set('#vH1', fmt(a.homes)); set('#vH2', fmt(b.homes)); set('#vP1', fmt(a.people)); set('#vP2', fmt(b.people));
      set('#vC1', a.cars); set('#vC2', b.cars); set('#vS1', a.calls); set('#vS2', b.calls);
      set('#vD1', money(a.damage)); set('#vD2', money(b.damage)); set('#vsBy', `By ${clock(t)}`);
      if (P.fut.hero === 'people') {
        set('#futBy', `People kept out of floodwater by ${clock(t)}`); set('#futSave', fmt(a.people - b.people));
        set('#futLine', a.homes ? `The same ${fmt(a.homes)} homes flood on both sides. On the right, most of them are empty, and ${fmt(a.calls - b.calls)} fewer people are calling for rescue.` : 'Nothing has flooded yet. Press play or drag the timeline.');
      } else {
        set('#futBy', `Damage avoided by ${clock(t)}`); set('#futSave', money(a.damage - b.damage));
        set('#futLine', a.homes ? `${fmt(a.homes - b.homes)} fewer homes flooded and ${fmt(a.calls - b.calls)} fewer calls for rescue, in one suburb, in one evening.` : 'Nothing has flooded yet. Press play or drag the timeline.');
      }
    }
    if (S.mode === 'ses' && $('#queue')) {
      const live = F.REQ.B.filter(r => r.t <= t);
      const waiting = live.filter(r => reqState(r, t) === 'waiting'), enroute = live.filter(r => reqState(r, t) === 'enroute');
      const safeN = D.atRisk.filter(h => h.safeT !== null && h.safeT <= t).length + (S.checkin === 'safe' ? 1 : 0);
      const silent = t < F.ACT ? 0 : D.atRisk.filter(h => h.deep && !(h.safeT !== null && h.safeT <= t) && !(h.req && h.req.t <= t)).length;
      set('#kNeed', waiting.length + enroute.length); set('#kCrews', enroute.length); set('#kSafe', fmt(safeN)); set('#kSilent', fmt(silent));
      const score = r => r.p + (t - r.t) * 1.2;
      const shown = [...waiting.sort((a, b) => score(b) - score(a)), ...enroute.sort((a, b) => a.reach - b.reach), ...live.filter(r => reqState(r, t) === 'reached' && r.reach > t - 6)].slice(0, 7);
      const you = S.myReq && live.includes(S.myReq) && !shown.includes(S.myReq) ? [S.myReq] : [];
      set('#queue', [...you, ...shown].length ? [...you, ...shown].map(r => {
        const st = reqState(r, t);
        const sTxt = st === 'waiting' ? `<span class="st wait">Waiting ${t - r.t} min</span>` : st === 'enroute' ? `<span class="st go">${r.crew}<br>ETA ${Math.max(1, r.reach - t)} min</span>` : `<span class="st ok">Reached ${clock(r.reach)}</span>`;
        return `<div class="rk${r.id === 'me' ? ' you' : ''}" style="cursor:default"><span class="pill ${r.prioLabel === 'P1' ? 'p1' : r.prioLabel === 'P2' ? 'p2' : 'p3'}">${r.prioLabel}</span><span><span class="nm">${r.addr}</span>${r.id === 'me' ? '<span class="youtag">YOU</span>' : ''}<br><span class="ds">${r.people} ${r.people === 1 ? 'person' : 'people'} · ${r.needs.length ? r.needs.join(', ') : 'no extra needs'} · ${r.level.toLowerCase()}-deep</span></span>${sTxt}</div>`;
      }).join('') : `<div class="empty">No calls for help yet at ${clock(t)}. Drag the timeline forward or press play.</div>`);
      set('#qTime', `${clock(t)} · ranked by risk, not call order`);
      if (t < F.ACT) set('#knock', 'Check-ins open when the first alert goes out at ' + clock(F.ACT) + '.');
      else {
        const byStreet = {}; D.atRisk.filter(h => h.deep && !(h.safeT !== null && h.safeT <= t) && !(h.req && h.req.t <= t)).forEach(h => byStreet[h.street] = (byStreet[h.street] || 0) + 1);
        const top = Object.entries(byStreet).sort((a, b) => b[1] - a[1])[0];
        set('#knock', top ? `<b>Doorknock list · ${fmt(silent)} homes</b><br>They haven't replied to any alert and will have more than 30 cm of water inside. Start with ${top[0]} (${top[1]} homes).` : '<b>Everyone in deep water has replied.</b>');
      }
    }
    if (S.mode === 'resident' && S.checkin === 'sent' && $('#myStatus')) { $('#myStatus').innerHTML = myStatusHTML(); wireCheckin(); }
  }

  /* ---------- tabs & places ---------- */
  const tabs = [...document.querySelectorAll('.tab')], ind = $('#tabInd');
  function placeInd() { const a = tabs.find(t => t.getAttribute('aria-selected') === 'true'); if (a) { ind.style.left = a.offsetLeft + 'px'; ind.style.width = a.offsetWidth + 'px'; } }
  function defaultT(m) { return m === 'resident' ? F.NOW : m === 'council' ? F.peakT - 6 : m === 'ses' ? F.me.floodT + 3 : F.peakT; }
  function setHash() { try { history.replaceState(null, '', '#' + P.slug + '-' + S.mode); } catch (e) { } }
  function setMode(m, opts = {}) {
    S.mode = m; S.hl = null;
    tabs.forEach(t => t.setAttribute('aria-selected', t.dataset.mode === m)); placeInd();
    const fut = m === 'futures';
    ['#lblA', '#lblB', '#handle'].forEach(id => $(id).hidden = !fut);
    if (fut) { S.split = .5; placeHandle(); }
    if (!opts.keepT) S.t = Math.max(S.t, defaultT(m));
    setHash(); renderPanel(); syncT(false);
  }
  tabs.forEach(t => t.addEventListener('click', () => { setPlaying(false); setMode(t.dataset.mode); }));

  const plcBtns = [...document.querySelectorAll('.plc')];
  function setPlace(id, opts = {}) {
    S.place = id; C = FGE.places[id]; P = UI[id];
    F = built[id] || (built[id] = FGE.build(C));
    derive(); buildTerrain(); resize();
    plcBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.place === id));
    Object.assign(S, { t: F.NOW, route: false, checks: new Set(), checkin: null, myReq: null, hl: null, startReal: performance.now() });
    F.REQ.B = F.REQ.B.filter(r => r.id !== 'me'); F.schedule(F.REQ.B, 'triage');
    $('#liveRun').textContent = `Forecast run ${clock(F.NOW)}`;
    $('#hudTag').textContent = P.tag;
    $('#introWhen').textContent = P.when; $('#introL2').textContent = P.intro2; $('#introL3').innerHTML = P.intro3(D.minsLeft);
    if (opts.announce) {
      const pc = $('#placeCard'); pc.hidden = false; pc.innerHTML = `<span>${P.kind}</span><b>${P.card[0]}</b><p>${P.card[1]}</p>`;
      pc.style.animation = 'none'; void pc.offsetWidth; pc.style.animation = '';
      clearTimeout(setPlace.tm); setPlace.tm = setTimeout(() => pc.hidden = true, 2900);
    }
    setMode(opts.mode || S.mode);
  }
  plcBtns.forEach(b => b.addEventListener('click', () => { if (b.dataset.place === S.place) return; setPlaying(false); setPlace(b.dataset.place, { announce: true }); }));

  /* split handle */
  const handle = $('#handle');
  function placeHandle() { handle.style.left = S.split * 100 + '%'; handle.setAttribute('aria-valuenow', Math.round(S.split * 100)); }
  let dragging = false;
  const moveSplit = e => { const r = stage.getBoundingClientRect(); S.split = Math.max(.04, Math.min(.96, (e.clientX - r.left) / r.width)); placeHandle(); };
  handle.addEventListener('pointerdown', e => { dragging = true; handle.setPointerCapture(e.pointerId); moveSplit(e); });
  handle.addEventListener('pointermove', e => dragging && moveSplit(e));
  handle.addEventListener('pointerup', () => dragging = false);
  handle.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') S.split = Math.max(.04, S.split - .05); else if (e.key === 'ArrowRight') S.split = Math.min(.96, S.split + .05); else return; e.preventDefault(); placeHandle(); });
  stage.addEventListener('click', e => { if (S.mode === 'futures' && e.target === cv) moveSplit(e); });

  /* intro */
  const intro = $('#intro'), ir = $('#introRain'), ictx = ir.getContext('2d');
  let introOpen = true;
  function sizeIntro() { ir.width = innerWidth * dpr; ir.height = innerHeight * dpr; }
  function closeIntro(auto = true) {
    if (!introOpen) return; introOpen = false; intro.classList.add('gone');
    S.startReal = performance.now();
    setMode('resident', { keepT: true }); S.t = F.NOW; syncT(false);
    if (auto && !matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => play(F.NOW, F.me.floodT + 6), 900);
  }
  function openIntro() {
    setPlaying(false); introOpen = true; intro.classList.remove('gone');
    intro.querySelectorAll('.i1,.i2,.i3,.i4,.i5,.flash').forEach(el => { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; });
    $('#enter').focus();
  }
  $('#enter').onclick = () => closeIntro(true);
  $('#skip').onclick = () => closeIntro(false);
  $('#replay').onclick = openIntro;
  document.addEventListener('keydown', e => { if (introOpen && e.key === 'Escape') closeIntro(false); });

  /* loop */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; const time = now / 1000;
    if (S.playing) {
      S.t = Math.min(F.T, S.t + dt * 11);
      if (S.t >= S.stopAt) { S.t = S.stopAt; setPlaying(false); }
      syncT(false);
    }
    if (!introOpen) render(time, dt);
    else { ictx.setTransform(dpr, 0, 0, dpr, 0, 0); ictx.clearRect(0, 0, innerWidth, innerHeight); drawRain(ictx, innerWidth, innerHeight, 60, 75, dt); }
    tickCountdown();
    requestAnimationFrame(frame);
  }

  /* boot */
  window.addEventListener('resize', () => { resize(); sizeIntro(); placeInd(); });
  dpr = Math.min(2, window.devicePixelRatio || 1); sizeIntro();
  const tok = (location.hash || '').slice(1).split('-');
  const startPlace = tok.includes('lismore') ? 'lis' : 'melb';
  const startMode = ['resident', 'council', 'ses', 'futures'].find(m => tok.includes(m));
  if (startMode || tok.includes('lismore')) { introOpen = false; intro.classList.add('gone'); }
  setPlace(startPlace, { mode: startMode || 'resident' });
  if (document.fonts) document.fonts.ready.then(() => { placeInd(); drawTimeline(); });
  requestAnimationFrame(frame);
})();

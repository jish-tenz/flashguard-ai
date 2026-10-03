/* ===== FlashGuard pitch ===== */
(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const slides = $$('.slide');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- presenter notes ---------- */
  const N = [
    { t: "Floods don't wait", time: '0:15', script: 'Stand still. Say nothing for three seconds. Click. Let the second line land. Then: "Hi, I\'m [name]. This is FlashGuard."', visual: 'Pure black. Two lines of large serif type, centred. Faint rain only.', anim: 'Line one sharpens out of a blur. Line two waits for your click.', inter: 'None. The silence is the interaction.', react: 'They stop typing and look up.', trans: 'Hard cut into the question, as if the storm just started.' },
    { t: 'What would you do?', time: '0:30', script: '"Hands up. Severe weather warning, Elwood, tonight. Stay home? Drive? Move your car?" Click the most popular answer. "Here\'s the thing. Every one of those is right on one street and dangerous on another."', visual: 'Three big answer cards. After the vote, three street cards: red, amber, green.', anim: 'Unchosen answers dim. Street cards rise in together with the verdict.', inter: 'Room votes by show of hands; you click the winner. Pressing → reveals without a vote.', react: '"Huh. It depends on the street." That is the whole thesis, felt before it is said.', trans: 'Cards dissolve; rain thickens into Australia.' },
    { t: 'This is already happening', time: '0:25', script: '"Lismore, 28 February 2022. Fourteen point four metres. More than two metres above any flood before it. People waited on rooftops. And the rain itself is changing: short bursts are already about 10% more intense in some regions."', visual: 'Three stats, each with its own instrument: a river gauge, rising bars, a rainfall spike.', anim: 'Gauge fills past the old record line; number counts to 14.4. Bars grow. Spike draws.', inter: 'None. Let the gauge do the talking.', react: 'Silence when the water passes the dashed record line.', trans: 'Fade to the warning card.' },
    { t: 'The problem', time: '0:20', script: '"This is what a warning says. And these are the questions people actually have at 4:47 on a Thursday." Click through the four questions. "A warning tells you what\'s coming. Nobody tells you what to do."', visual: 'A plain official-style warning card, then four question pills.', anim: 'One question per click. The last line arrives on its own.', inter: 'Click per question. Skipped in the 3-minute cut.', react: 'Recognition. Every judge has felt this.', trans: 'Rain eases almost to nothing for the reveal.' },
    { t: 'FlashGuard', time: '0:15', script: '"We don\'t predict weather. We predict impact. FlashGuard turns a forecast into street-level decisions: which street, when, why, and what to do. Before the water."', visual: 'The shield draws itself, wordmark below, tagline in italic serif.', anim: 'Shield stroke draws, then the wave, then the tick. Text rises after.', inter: 'None.', react: 'A product, not a project.', trans: 'Straight into the demo while the energy is up.' },
    { t: 'Live demo', time: '0:45 (0:30 in the cut)', script: 'Click "Open the live app". Let the intro play once if time allows, otherwise skip it. Show the countdown, press play, watch Mitford St go red, read ONE "why" signal aloud. Do not explain the interface. If the app fails, this slide is the demo: the countdown on the left is live.', visual: 'A product screen with a ticking countdown and four risk signals.', anim: 'Countdown ticks in real time.', inter: 'Switch to the live app, then come back.', react: '"That\'s my street." Specific beats general.', trans: 'Back to the deck. Phone buzzes.' },
    { t: 'Your phone buzzes', time: '0:15', script: 'Pick one judge by name. "4:52 pm. Your phone buzzes. Act now, or ignore?" Click their answer. Whatever they choose: "Let\'s see both."', visual: 'A phone with a lock-screen alert, two huge choices beside it.', anim: 'Phone shakes twice as the slide opens.', inter: 'One judge decides. Their answer is carried into the next slide.', react: 'They are now inside the story.', trans: 'Auto-advances to Two Futures after their choice.' },
    { t: 'Two futures', time: '0:30', script: '"Same storm. Same street. Left, nobody acts. Right, people act on the alert." Then stop talking. Let the surge hit on the left in slow motion. At the end, read the green number slowly.', visual: 'Mitford St in 3D at dusk, split down the middle. Left: water swallows parked cars, they turn red and drift, a red light pulses. Right: cars drive away, sandbags at every door, water stops at the kerb.', anim: 'Ten seconds, 4:47 to 5:51 pm. Halfway, the left side surges in slow motion with a red flash, camera shake and a low thud (turn sound on with S). If the laptop cannot run 3D, the 2D street plays instead automatically.', inter: 'The judge\'s choice is badged on their side. Replay button for Q&A.', react: 'A physical flinch at the surge. This is the moment they retell to other judges.', trans: 'Cut to how it reaches people.' },
    { t: 'Resident view', time: '0:20', script: '"It reaches everyone, without an app. SMS and voice calls in plain and Easy English, Chinese, Vietnamese. A safe route. And one tap: I\'m safe, or I need help."', visual: 'Three phones: rotating SMS languages, a safe route map, the check-in buttons.', anim: 'SMS cycles languages. Route dashes towards higher ground.', inter: 'None. Skipped in the 3-minute cut.', react: 'Inclusion answered before anyone asks.', trans: 'From the person asking for help to the people coming.' },
    { t: 'SES view', time: '0:25', script: '"Every call is ranked by risk, not by who called first. Watch the queue reorder." Pause on a reorder. "In Elwood the most urgent callers are reached in 20 minutes, not 73. In Lismore, 320 people still waiting at 4:30 am becomes zero."', visual: 'A live queue on the left, three before-and-after numbers on the right.', anim: 'New calls arrive and the list re-sorts itself.', inter: 'None. The reordering is the point.', react: '"That would have saved lives in 2022."', trans: 'Answer the question they are about to ask.' },
    { t: 'Why AI?', time: '0:25', script: '"Three models. Impact: which street, how deep, when. Priority: who needs help first. Allocation: where crews and boats should wait. Today the demo runs on simulated data. In production it plugs into BoM, Geoscience Australia elevation, council drains and SES call history, and we validate against Lismore 2022."', visual: 'Inputs on the left, three model cards in the middle, outcome on the right.', anim: 'Inputs appear, then each model on its own click, then the outcome.', inter: 'Four clicks.', react: 'Credibility. The hardest question is already answered.', trans: 'Into the numbers.' },
    { t: 'Impact', time: '0:15', script: 'Read only two numbers: "$14.6 million in one suburb in one evening. Two thousand three hundred people out before the river came in." Point at the label: "simulated, and we say so."', visual: 'Three huge green numbers with one-line labels.', anim: 'Numbers count up from zero.', inter: 'None.', react: 'Scale, and trust because you labelled it honestly.', trans: 'Zoom out to why this matters for the climate.' },
    { t: 'Climate relevance', time: '0:15', script: '"This isn\'t awareness. It\'s adaptation. We can\'t stop the water, but we can change what people do in the hour before it. And this November, Australia leads the negotiations at COP31."', visual: 'The word Awareness struck through in red; Adaptation glowing.', anim: 'Strike-through draws across.', inter: 'None. Skipped in the 3-minute cut; say the line on the vision slide instead.', react: 'Clear fit with the theme and with COP31.', trans: 'Rings expand outward.' },
    { t: 'The vision', time: '0:15', script: '"Floods first. Then storms, heatwaves. Same loop every time: forecast, impact, action. Built for Lismore. Ready for Kathmandu."', visual: 'Concentric rings growing from flash floods to a climate resilience platform.', anim: 'Rings appear one by one from the centre.', inter: 'None.', react: 'This is a company, not a hackathon toy.', trans: 'Fade to black.' },
    { t: 'Before the water', time: '0:10', script: 'Read line one. Click. Read line two. Click. Say "Before the water." Then stop talking. Do not say thank you until they react.', visual: 'Black. Two lines, then the signature.', anim: 'Each line arrives on a click.', inter: 'None.', react: 'The line they quote a week later.', trans: 'Hold on the signature for questions.' },
  ];

  /* ---------- state ---------- */
  let cur = 0, step = 0, short = false, choice = null, sound = false;
  const maxStep = el => Math.max(0, ...[...el.querySelectorAll('[data-step]')].map(e => +e.dataset.step));
  const order = () => slides.map((s, i) => i).filter(i => !(short && slides[i].dataset.short === 'skip'));

  function applySteps() {
    slides[cur].querySelectorAll('[data-step]').forEach(e => e.classList.toggle('in', +e.dataset.step <= step));
  }
  function go(i, st = 0) {
    if (i < 0 || i >= slides.length) return;
    const prev = cur;
    slides.forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('past', k < i); s.setAttribute('aria-hidden', k !== i); });
    cur = i; step = st; applySteps();
    if (prev !== i) leave(prev);
    enter(i);
    const o = order(), pos = o.indexOf(i) + 1;
    $('#progBar').style.width = (pos / o.length * 100) + '%';
    $('#count').textContent = `${String(pos).padStart(2, '0')} / ${String(o.length).padStart(2, '0')}`;
    rainTarget = +(slides[i].dataset.rain || .4);
    fillNotes();
    try { history.replaceState(null, '', '#s' + (i + 1)); } catch (e) { }
    if (i > 0) $('#hint').classList.add('gone');
  }
  function next() {
    const m = maxStep(slides[cur]);
    if (slides[cur].id === 's-vote' && step === 0) { vote(null); return; }
    if (step < m) { step++; applySteps(); return; }
    const o = order(), k = o.indexOf(cur); if (k < o.length - 1) go(o[k + 1]);
  }
  function prev() {
    if (step > 0) { step--; applySteps(); return; }
    const o = order(), k = o.indexOf(cur); if (k > 0) { const j = o[k - 1]; go(j, maxStep(slides[j])); }
  }

  function fillNotes() {
    const n = N[cur];
    $('#nIdx').textContent = `Slide ${cur + 1} of ${slides.length}${slides[cur].dataset.short === 'skip' ? ' · skipped in 3-min cut' : ''}`;
    $('#nTitle').textContent = n.t; $('#nTime').textContent = 'About ' + n.time;
    $('#nScript').textContent = n.script; $('#nVisual').textContent = n.visual; $('#nAnim').textContent = n.anim;
    $('#nInter').textContent = n.inter; $('#nReact').textContent = n.react; $('#nTrans').textContent = n.trans;
  }
  function toggleNotes(force) {
    const open = force ?? !$('#notes').classList.contains('open');
    $('#notes').classList.toggle('open', open); $('#bNotes').setAttribute('aria-pressed', open);
  }

  /* ---------- per-slide enter / leave ---------- */
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function leave(i) {
    timers.splice(0).forEach(clearTimeout);
    if (slides[i].id === 's-tf') tf.running = false;
    if (slides[i].id === 's-ses') clearInterval(q.iv);
    if (slides[i].id === 's-res') clearInterval(res.iv);
    if (slides[i].id === 's-demo') clearInterval(demo.iv);
  }
  function enter(i) {
    const id = slides[i].id;
    if (id === 's-ctx') ctxEnter();
    if (id === 's-demo') demoEnter();
    if (id === 's-decide') { const p = $('#buzzPhone'); p.classList.remove('buzz'); void p.offsetWidth; p.classList.add('buzz'); }
    if (id === 's-tf') tfStart();
    if (id === 's-res') resEnter();
    if (id === 's-ses') qEnter();
    if (id === 's-imp') countUp();
    if (id === 's-vis') { $$('.ring').forEach(r => r.classList.remove('in')); [...$$('.ring')].reverse().forEach((r, k) => later(() => r.classList.add('in'), 250 + k * 420)); }
  }

  /* vote */
  function vote(c) {
    const box = $('#choices');
    if (c) { box.classList.add('voted'); box.querySelectorAll('.choice').forEach(b => b.classList.toggle('sel', b.dataset.c === c)); }
    const v = $('#verdict');
    v.innerHTML = c ? `You chose <b>${c.toLowerCase()}</b>. <b>Right on one street, dangerous on another.</b> Most people don't actually know, because the answer depends on which street you're on.`
      : '<b>Most people don\'t actually know.</b> Because the right answer depends on which street you\'re on.';
    step = 1; applySteps();
  }
  $$('#choices .choice').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); vote(b.dataset.c); }));

  /* decide */
  $$('#aiBtns .big-choice').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation(); choice = b.dataset.d;
    $('#aiBtns').classList.add('decided'); $$('#aiBtns .big-choice').forEach(x => x.classList.toggle('sel', x === b));
    later(() => go(order()[order().indexOf(cur) + 1]), 900);
  }));

  /* context slide */
  function ctxEnter() {
    const f = $('#lisFill'); f.style.transition = 'none'; f.style.height = '0'; void f.offsetWidth; f.style.transition = ''; later(() => f.style.height = '96%', 300);
    const el = $('#lisH'), t0 = performance.now() + 300;
    const tick = () => { const u = Math.min(1, Math.max(0, (performance.now() - t0) / 2600)); el.textContent = (14.4 * (1 - Math.pow(1 - u, 3))).toFixed(1); if (u < 1 && slides[cur].id === 's-ctx') requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const bars = $('#ctxBars'); bars.innerHTML = '';
    const vals = [38, 41, 40, 44, 43, 47, 46, 50, 52, 55, 54, 60];
    vals.forEach((v, k) => { const i = document.createElement('i'); if (k > 8) i.className = 'hi'; bars.appendChild(i); later(() => i.style.height = v * 1.6 + '%', 200 + k * 90); });
    const pts = []; for (let x = 0; x <= 300; x += 5) { const y = 112 - 96 * Math.exp(-(((x - 190) / 24) ** 2)) - 18 * Math.exp(-(((x - 120) / 18) ** 2)) - 3 * Math.sin(x * .3); pts.push([x, y]); }
    const sp = $('#ctxSpark'), sf = $('#ctxSparkF'); let k = 0;
    const grow = () => { k = Math.min(pts.length, k + 2); const d = 'M' + pts.slice(0, k).map(p => p.join(' ')).join(' L'); sp.setAttribute('d', d); sf.setAttribute('d', d + ` L${pts[k - 1][0]} 120 L0 120Z`); if (k < pts.length && slides[cur].id === 's-ctx') requestAnimationFrame(grow); };
    requestAnimationFrame(grow);
  }

  /* demo countdown */
  const demo = {};
  function demoEnter() {
    const t0 = performance.now(), el = $('#demoCd');
    const upd = () => { const left = Math.max(0, 43 * 60 - (performance.now() - t0) / 1000); el.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(Math.floor(left % 60)).padStart(2, '0')}`; };
    upd(); demo.iv = setInterval(upd, 250);
  }

  /* count up */
  function countUp() {
    $$('[data-count]').forEach(el => {
      const end = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = performance.now() + 250;
      const tick = () => { const u = Math.min(1, Math.max(0, (performance.now() - t0) / 1800)), v = end * (1 - Math.pow(1 - u, 3)); el.textContent = pre + (dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-AU')) + suf; if (u < 1 && slides[cur].id === 's-imp') requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }

  /* resident */
  const res = {};
  const SMS = [
    ['English', 'FlashGuard FLOOD ALERT: Water is expected at 14 Mitford St at 5:30 pm (43 min). Move your car to Brighton Rd car park now. Don\'t drive through water. Reply 1 if safe, 2 if you need help.'],
    ['Easy English', 'Flood warning. Water will come to your house soon. It will come at 5:30 pm. Move your car to a high place now. Do not drive in water. Text 1 if you are safe. Text 2 if you need help.'],
    ['中文', 'FlashGuard 洪水警报：预计下午5:30洪水将到达 Mitford St 14号（还有43分钟）。请立即把车移到 Brighton Rd 停车场。切勿驾车涉水。安全请回复1，需要帮助请回复2。'],
    ['Tiếng Việt', 'Cảnh báo lũ FlashGuard: Nước dự kiến đến 14 Mitford St lúc 5:30 chiều (còn 43 phút). Hãy di chuyển xe đến bãi đỗ xe Brighton Rd ngay. Không lái xe qua vùng nước ngập. Trả lời 1 nếu an toàn, 2 nếu cần giúp đỡ.'],
  ];
  function resEnter() {
    let k = 0; const show = () => { const b = $('#smsBody'); b.style.opacity = 0; later(() => { $('#smsLang').textContent = SMS[k][0]; b.textContent = SMS[k][1]; b.style.opacity = 1; k = (k + 1) % SMS.length; }, 300); };
    show(); res.iv = setInterval(show, 2800);
  }

  /* SES queue */
  const q = { rows: [], iv: null };
  const CALLS = [
    { n: '7 Marine Pde', d: '3 people · knee-deep', p: 'P2', s: 58 },
    { n: '12 Glen Huntly Rd', d: '2 people · ankle-deep', p: 'P3', s: 28 },
    { n: '52 Ormond Rd', d: '1 person · car stalled in water', p: 'P2', s: 52 },
    { n: '18 Mitford St', d: '4 people · elderly, child · chest-deep', p: 'P1', s: 96 },
    { n: '31 Docker St', d: '2 people · medical · waist-deep', p: 'P1', s: 88 },
    { n: 'Elster Lodge aged care', d: '64 residents · ground floor taking water', p: 'P1', s: 99 },
    { n: '9 Byron St', d: '5 people · disability · waist-deep', p: 'P1', s: 90 },
    { n: '3 Tennyson St', d: '2 people · water at the door', p: 'P3', s: 24 },
  ];
  function qRender(newKey) {
    const box = $('#queue');
    const before = {}; box.querySelectorAll('.qrow').forEach(r => before[r.dataset.k] = r.getBoundingClientRect().top);
    const sorted = [...q.rows].sort((a, b) => b.s - a.s).slice(0, 6);
    box.innerHTML = sorted.map((r, i) => `<div class="qrow${r.n === newKey ? ' new' : ''}" data-k="${r.n}"><span class="pill ${r.p.toLowerCase()}">${r.p}</span><span><span class="nm">${r.n}</span><br><span class="ds">${r.d}</span></span><span class="st ${i < 2 ? 'g' : 'w'}">${i < 2 ? `Crew ${i + 1}<br>ETA ${3 + i * 4} min` : `Waiting ${r.w} min`}</span></div>`).join('');
    if (reduce) return;
    box.querySelectorAll('.qrow').forEach(r => {
      const b = before[r.dataset.k]; if (b === undefined) return;
      const dy = b - r.getBoundingClientRect().top; if (!dy) return;
      r.style.transition = 'none'; r.style.transform = `translateY(${dy}px)`;
      requestAnimationFrame(() => requestAnimationFrame(() => { r.style.transition = ''; r.style.transform = ''; }));
    });
  }
  function qEnter() {
    q.rows = CALLS.slice(0, 3).map((c, i) => ({ ...c, w: 6 - i * 2 })); let k = 3; qRender();
    q.iv = setInterval(() => {
      q.rows.forEach(r => r.w++);
      if (k < CALLS.length) { const c = { ...CALLS[k], w: 0 }; q.rows.push(c); k++; qRender(c.n); }
      else { qRender(); clearInterval(q.iv); }
    }, 1700);
  }

  /* ---------- Two Futures canvas ---------- */
  const tf = { running: false, t: 0 };
  const tfc = $('#tfCanvas'), tctx = tfc.getContext('2d');
  const OUT = { A: { h: 225, c: 46, s: 150, d: 18.5 }, B: { h: 48, c: 10, s: 31, d: 4.0 } };
  const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);
  function tfStart() {
    const L = $('#tfL'), R = $('#tfR');
    L.innerHTML = 'IGNORE' + (choice === 'ignore' ? '<span class="you">YOUR CHOICE</span>' : '');
    R.innerHTML = 'ACT NOW' + (choice === 'act' ? '<span class="you">YOUR CHOICE</span>' : '');
    $('#tfPunch').innerHTML = '';
    tf.p = 0; tf.last = 0; tf.surged = false; tf.slowUntil = 0; tf.shake = 0; tf.running = true; tf.done = false;
    $('#tfCap').classList.remove('on');
  }
  function thud() {
    if (!audio || !sound) return;
    try {
      const A = audio.A, o = A.createOscillator(), g = A.createGain(), t = A.currentTime;
      o.frequency.setValueAtTime(92, t); o.frequency.exponentialRampToValueAtTime(26, t + .7);
      g.gain.setValueAtTime(.7, t); g.gain.exponentialRampToValueAtTime(.001, t + .9);
      o.connect(g).connect(A.destination); o.start(); o.stop(t + 1);
    } catch (e) { }
  }
  function surge() {
    tf.surged = true; tf.slowUntil = performance.now() + 2200; tf.shake = 1;
    const f = $('#tfFlash'); f.classList.add('hit'); setTimeout(() => f.classList.remove('hit'), 90);
    setTimeout(() => { f.classList.add('hit'); setTimeout(() => f.classList.remove('hit'), 70); thud(); }, 700);
    thud(); $('#tfCap').classList.add('on'); setTimeout(() => $('#tfCap').classList.remove('on'), 3200);
  }
  $('#tfReplay').addEventListener('click', e => { e.stopPropagation(); tfStart(); });

  function house(c, x, base, w, h, lit, flooded, time) {
    c.fillStyle = '#121b28'; c.fillRect(x, base - h, w, h);
    c.beginPath(); c.moveTo(x - w * .06, base - h); c.lineTo(x + w / 2, base - h - h * .38); c.lineTo(x + w * 1.06, base - h); c.closePath(); c.fillStyle = '#0e1622'; c.fill();
    c.strokeStyle = 'rgba(150,182,224,.18)'; c.lineWidth = 1; c.strokeRect(x + .5, base - h + .5, w - 1, h - 1);
    const ww = w * .22, wh = h * .24;
    [[.16, .28], [.62, .28]].forEach(([u, v]) => {
      const flick = flooded ? (Math.sin(time * 9 + x) > .2 ? 1 : .25) : 1;
      c.fillStyle = flooded ? `rgba(255,79,97,${.75 * flick})` : lit ? 'rgba(255,206,140,.85)' : 'rgba(255,206,140,.2)';
      c.fillRect(x + w * u, base - h + h * v, ww, wh);
    });
    c.fillStyle = '#0a1019'; c.fillRect(x + w * .42, base - h * .42, w * .16, h * .42);
  }
  function car(c, x, y, w, col, tilt) {
    c.save(); c.translate(x + w / 2, y); c.rotate(tilt);
    c.fillStyle = col; c.beginPath(); c.roundRect(-w / 2, -w * .26, w, w * .26, w * .06); c.fill();
    c.beginPath(); c.roundRect(-w * .28, -w * .44, w * .56, w * .2, w * .07); c.fill();
    c.fillStyle = '#05080d'; [-.3, .3].forEach(u => { c.beginPath(); c.arc(u * w, 0, w * .09, 0, 7); c.fill(); });
    c.fillStyle = 'rgba(255,240,200,.9)'; c.fillRect(w * .44, -w * .2, w * .06, w * .06);
    c.restore();
  }
  function drawHalf(c, x0, W, H, side, t, time) {
    c.save(); c.beginPath(); c.rect(x0, 0, W, H); c.clip();
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#060c16'); g.addColorStop(1, '#0b1422'); c.fillStyle = g; c.fillRect(x0, 0, W, H);
    // skyline
    c.fillStyle = 'rgba(30,44,64,.6)';
    for (let i = 0; i < 9; i++) { const bw = W * .09, bh = H * (.12 + ((i * 37) % 10) / 40); c.fillRect(x0 + i * W * .115, H * .58 - bh, bw, bh); }
    const ground = H * .74, road = H * .86;
    c.fillStyle = '#0d1520'; c.fillRect(x0, ground, W, H - ground);
    c.fillStyle = '#0a111b'; c.fillRect(x0, road - H * .05, W, H * .14);
    c.strokeStyle = 'rgba(234,241,249,.12)'; c.setLineDash([W * .03, W * .03]); c.beginPath(); c.moveTo(x0, road + H * .025); c.lineTo(x0 + W, road + H * .025); c.stroke(); c.setLineDash([]);
    // water level (surface y)
    const rise = ease((t - .18) / .62);
    const peakY = side === 'A' ? ground - H * .2 : road - H * .075;
    const surf = H * 1.02 + (peakY - H * 1.02) * rise;
    // houses
    const hw = W * .17, hh = H * .3;
    const floors = [ground, ground, ground + H * .065, ground];
    for (let i = 0; i < 4; i++) {
      const hx = x0 + W * (.05 + i * .24), base = floors[i] + (i === 2 ? 0 : 0);
      const flooded = side === 'A' ? surf < base - H * .02 : (i === 2 && surf < road - H * .06);
      house(c, hx, base, hw, hh, true, flooded, time);
      if (side === 'B' && t > .22) { c.fillStyle = 'rgba(196,164,108,.9)'; for (let k = 0; k < 3; k++) { c.beginPath(); c.ellipse(hx + hw * (.42 + k * .06), base - 4 - (k % 2) * 4, hw * .06, 4, 0, 0, 7); c.fill(); } }
      if (flooded && side === 'A' && t > .55) {
        const on = Math.sin(time * 6 + i) > 0; c.fillStyle = on ? '#ff4f61' : 'rgba(255,79,97,.25)';
        c.beginPath(); c.arc(hx + hw / 2, base - hh - hh * .45, 5, 0, 7); c.fill();
        c.font = '600 10px Geist, sans-serif'; c.textAlign = 'center'; c.fillText('SOS', hx + hw / 2, base - hh - hh * .45 - 10);
      }
    }
    // cars
    const cw = W * .12;
    for (let i = 0; i < 3; i++) {
      let cx = x0 + W * (.1 + i * .3), cy = road, tilt = 0, col = '#c9d4e3';
      if (side === 'B') { const go = ease((t - .1 - i * .04) / .22); cx += go * W * 1.1; }
      else if (surf < road - H * .02) { const f = Math.min(1, (road - H * .02 - surf) / (H * .1)); cy = Math.min(road, surf + cw * .2) + Math.sin(time * 2 + i) * 3 * f; tilt = Math.sin(time * 1.5 + i * 2) * .08 * f; col = `rgb(${201 + 54 * f},${212 - 133 * f},${227 - 130 * f})`; }
      car(c, cx, cy, cw, col, tilt);
    }
    // water
    if (surf < H) {
      const wg = c.createLinearGradient(0, surf, 0, H); wg.addColorStop(0, 'rgba(110,190,255,.62)'); wg.addColorStop(1, 'rgba(18,80,180,.9)');
      c.fillStyle = wg; c.beginPath(); c.moveTo(x0, H);
      for (let x = 0; x <= W; x += 6) c.lineTo(x0 + x, surf + Math.sin(x * .045 + time * 2.2) * 3 + Math.sin(x * .11 - time * 3) * 1.5);
      c.lineTo(x0 + W, H); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(200,235,255,.5)'; c.lineWidth = 1.2; c.beginPath();
      for (let x = 0; x <= W; x += 6) c.lineTo(x0 + x, surf + Math.sin(x * .045 + time * 2.2) * 3 + Math.sin(x * .11 - time * 3) * 1.5); c.stroke();
    }
    // rescue boat on B
    if (side === 'B' && t > .72) {
      const u = ease((t - .72) / .25), bx = x0 + W * (1.05 - .5 * u), by = Math.min(surf, road) + Math.sin(time * 2) * 2;
      c.fillStyle = '#ffb23e'; c.beginPath(); c.moveTo(bx - 26, by - 8); c.lineTo(bx + 26, by - 8); c.lineTo(bx + 18, by + 2); c.lineTo(bx - 20, by + 2); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,240,200,.95)'; c.beginPath(); c.arc(bx - 22, by - 10, 3, 0, 7); c.fill();
      const lg = c.createRadialGradient(bx - 22, by - 10, 0, bx - 22, by - 10, 60); lg.addColorStop(0, 'rgba(255,230,170,.25)'); lg.addColorStop(1, 'rgba(255,230,170,0)'); c.fillStyle = lg; c.fillRect(bx - 82, by - 70, 120, 120);
    }
    // rain
    c.strokeStyle = 'rgba(190,222,255,.22)'; c.lineWidth = 1; c.beginPath();
    for (let i = 0; i < 70; i++) { const rx = x0 + ((i * 97.3 + time * 60 * (1 + (i % 3) * .2)) % W), ry = ((i * 53.7 + time * 520 * (1 + (i % 4) * .15)) % H); c.moveTo(rx, ry); c.lineTo(rx + 2, ry + 14); }
    c.stroke();
    if (side === 'A') { c.fillStyle = 'rgba(255,40,60,.05)'; c.fillRect(x0, 0, W, H); }
    c.restore();
  }
  function tfFrame(time, dt) {
    const r = $('#tfStage').getBoundingClientRect(); if (!r.width) return;
    const dpr = Math.min(2, devicePixelRatio || 1), W = r.width, H = r.height;
    if (tf.running) {
      const now = performance.now(), rdt = Math.min(.25, (now - (tf.last || now)) / 1000); tf.last = now;
      const slow = now < tf.slowUntil ? .2 : 1;
      tf.p = reduce ? 1 : Math.min(1, tf.p + rdt / 10 * slow);
      if (!tf.surged && tf.p >= .5) surge();
    }
    const t = tf.running ? tf.p : tf.done ? 1 : 0;
    tf.shake *= .93;
    if (T3) { try { T3.frame(W, H, t, time, tf.shake); } catch (e) { T3 = null; $('#tf3d').hidden = true; $('#tfCanvas').hidden = false; } }
    if (!T3) {
      if (tfc.width !== Math.round(W * dpr)) { tfc.width = Math.round(W * dpr); tfc.height = Math.round(H * dpr); }
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawHalf(tctx, 0, W / 2, H, 'A', t, time); drawHalf(tctx, W / 2, W / 2, H, 'B', t, time);
      tctx.fillStyle = 'rgba(238,243,250,.9)'; tctx.fillRect(W / 2 - 1, 0, 2, H);
    }
    const mins = 47 + Math.round(64 * ease(t / .9)), hh = 4 + Math.floor(mins / 60), mm = mins % 60;
    $('#tfClock').textContent = `${hh}:${String(mm).padStart(2, '0')} pm`;
    const u = ease((t - .3) / .6);
    const set = (id, v) => { const e = $(id); if (e.textContent !== v) e.textContent = v; };
    set('#aH', Math.round(OUT.A.h * u) + ''); set('#aC', Math.round(OUT.A.c * u) + ''); set('#aS', Math.round(OUT.A.s * u) + ''); set('#aD', '$' + (OUT.A.d * u).toFixed(1) + 'M');
    set('#bH', Math.round(OUT.B.h * u) + ''); set('#bC', Math.round(OUT.B.c * u) + ''); set('#bS', Math.round(OUT.B.s * u) + ''); set('#bD', '$' + (OUT.B.d * u).toFixed(1) + 'M');
    if (t >= 1 && tf.running) {
      tf.running = false; tf.done = true;
      const lead = choice === 'ignore' ? 'You chose to ignore it. On the right, your neighbours didn\'t. ' : choice === 'act' ? 'You acted. ' : '';
      $('#tfPunch').innerHTML = `${lead}<em>$14.6M</em> avoided. 177 fewer homes flooded. One suburb, one evening.`;
    }
  }


  /* ---------- Two Futures in 3D (falls back to 2D if WebGL or the library is missing) ---------- */
  let T3 = (() => { try {
    if (!window.THREE) return null;
    const cv = $('#tf3d'); let R;
    try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); if (!R.getContext()) return null; } catch (e) { return null; }
    cv.hidden = false; $('#tfCanvas').hidden = true;
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const sc = new THREE.Scene(); sc.background = new THREE.Color(0x0b1420); sc.fog = new THREE.Fog(0x0b1420, 10, 62);
    sc.add(new THREE.HemisphereLight(0x8aa8cc, 0x15100c, .72));
    const moon = new THREE.DirectionalLight(0xa9c8ff, .35); moon.position.set(8, 14, 6); sc.add(moon);
    const M = (c, o) => new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}));
    const box = (w, h, d, m, x, y, z, parent) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); (parent || sc).add(b); return b; };
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    box(9, .1, 140, M(0x151b22), 0, -.05, -50);
    box(220, .1, 220, M(0x0a0e13), 0, -.22, -50);
    [-5.6, 5.6].forEach(x => box(2.2, .26, 140, M(0x272d35), x, .08, -50));
    for (let z = 14; z > -80; z -= 4) box(.14, .02, 1.6, M(0x7d8790), 0, .02, z);
    const wc = document.createElement('canvas'); wc.width = 64; wc.height = 64;
    { const x = wc.getContext('2d'); x.fillStyle = '#141b24'; x.fillRect(0, 0, 64, 64); [[8, 18], [38, 18]].forEach(([a, b]) => { x.fillStyle = rnd() > .25 ? '#ffcf8a' : '#2a3442'; x.fillRect(a, b, 18, 22); }); x.fillStyle = '#0b1016'; x.fillRect(27, 34, 10, 30); }
    const wt = new THREE.CanvasTexture(wc), hm = new THREE.MeshLambertMaterial({ map: wt, emissive: 0x4a4436, emissiveMap: wt });
    const roofM = M(0x1b222c), fenceM = M(0x2d343d);
    const houses = [];
    [-1, 1].forEach(s => {
      for (let z = 10; z > -95; z -= 8.5 + rnd() * 2) {
        const w = 6 + rnd() * 1.4, h = rnd() > .7 ? 5.4 : 3.2, x = s * (10.2 + w / 2 - 3);
        const b = box(w * .8, h, 6, hm, x, h / 2, z); houses.push(b);
        const roof = new THREE.Mesh(new THREE.CylinderGeometry(0, w * .62, 1.7, 4), roofM); roof.rotation.y = Math.PI / 4; roof.position.set(x, h + .85, z); sc.add(roof);
        box(.12, .9, 6.2, fenceM, s * 6.9, .45, z);
      }
    });
    const gc = document.createElement('canvas'); gc.width = gc.height = 64;
    { const x = gc.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }
    const gt = new THREE.CanvasTexture(gc);
    const glow = (c, s, x, y, z, o) => { const p = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, color: c, blending: THREE.AdditiveBlending, transparent: true, opacity: o || .8, depthWrite: false })); p.scale.set(s, s, 1); p.position.set(x, y, z); sc.add(p); return p; };
    for (let z = 8; z > -80; z -= 14) [-5, 5].forEach(x => { box(.16, 5.6, .16, M(0x333a42), x, 2.8, z); glow(0xffc98a, 3, x, 5.6, z, .85); });
    // street sign
    const sgc = document.createElement('canvas'); sgc.width = 256; sgc.height = 64;
    { const x = sgc.getContext('2d'); x.fillStyle = '#1e5aa8'; x.fillRect(0, 0, 256, 64); x.strokeStyle = '#fff'; x.lineWidth = 4; x.strokeRect(4, 4, 248, 56); x.fillStyle = '#fff'; x.font = 'bold 34px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('MITFORD ST', 128, 34); }
    box(.1, 2.8, .1, M(0x444b55), 5.4, 1.4, -5);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .45), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sgc), side: THREE.DoubleSide })); sign.position.set(5.4, 2.75, -5); sign.rotation.y = -Math.PI / 3.2; sc.add(sign);
    // cars
    const carMesh = (c) => {
      const g = new THREE.Group(), m = M(c);
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .7, 4), m); body.position.y = .55; g.add(body);
      const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, .6, 2), M(0x10161e)); cab.position.set(0, 1.15, -.2); g.add(cab);
      sc.add(g); g.userData = { m, base: new THREE.Color(c) }; return g;
    };
    const cols = [0x6b7280, 0x8a5a44, 0x4b5f7a, 0x9aa0a6, 0x5c6b5a];
    const cars = [[-3.4, 4], [3.4, -2], [-3.4, -9], [3.4, -15], [-3.4, -22], [3.4, -30], [-3.4, -38], [3.4, -46]].map((a, i) => { const c = carMesh(cols[i % cols.length]); c.userData.x = a[0]; c.userData.z = a[1]; c.userData.k = i; return c; });
    const hero = carMesh(0x2f7fd0); hero.userData.x = 2.3; hero.userData.z = 3; hero.userData.k = 99;
    cars.push(hero);
    const RED = new THREE.Color(0xff4f61);
    // sandbags
    const bags = new THREE.Group(); const bagM = M(0xb89766);
    houses.forEach(h => { if (Math.abs(h.position.z) > 50) return; const s = Math.sign(h.position.x); for (let k = 0; k < 4; k++) box(.6, .28, .4, bagM, s * 7.35, .14 + (k > 1 ? .28 : 0), h.position.z + (k % 2 ? .35 : -.35), bags); });
    sc.add(bags);
    // water
    const wg = new THREE.PlaneGeometry(26, 140, 26, 70);
    const water = new THREE.Mesh(wg, new THREE.MeshPhongMaterial({ color: 0x1d6f9e, transparent: true, opacity: .66, shininess: 90, specular: 0x9fdcff }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, -.4, -50); sc.add(water);
    const wbase = Float32Array.from(wg.attributes.position.array);
    const redL = new THREE.PointLight(0xff4f61, 0, 18); redL.position.set(0, 3, -4); sc.add(redL);
    // rain
    const N = 1600, rp = new Float32Array(N * 6), ry = new Float32Array(N);
    for (let i = 0; i < N; i++) { const x = rnd() * 30 - 15, z = rnd() * 60 - 50; ry[i] = rnd() * 22; rp.set([x, 0, z, x, 0, z], i * 6); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
    const rainL = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xa3ddff, transparent: true, opacity: .35 })); rainL.frustumCulled = false; sc.add(rainL);
    const cam = new THREE.PerspectiveCamera(58, 1, .1, 200);
    let lastT = 0, sizeW = 0, sizeH = 0;

    function level(side, t) {
      const base = ease((t - .16) / .6);
      if (side === 'A') return 1.3 * base + .28 * ease((t - .5) / .05) * (t < .8 ? 1 : 1 - ease((t - .8) / .2) * .4);
      return .3 * base;
    }
    function apply(side, t, time) {
      const L = level(side, t);
      water.position.y = -.42 + L;
      const w = wg.attributes.position.array;
      for (let i = 0; i < w.length; i += 3) w[i + 2] = Math.sin(wbase[i] * .8 + time * 1.7) * .05 * (.4 + L) + Math.cos(wbase[i + 1] * .6 + time * 1.2) * .035;
      wg.attributes.position.needsUpdate = true;
      cars.forEach(c => {
        const u = c.userData; let x = u.x, z = u.z, y = 0, rot = 0;
        if (side === 'B') {
          const moved = u.k === 99 || u.k % 4 !== 3;
          if (moved) { const go = ease((t - .06 - (u.k === 99 ? 0 : u.k * .025)) / .26); z -= go * 90; x += go * (u.x > 0 ? -1.2 : 1.2) * Math.min(1, go * 4); }
          u.m.color.copy(u.base);
        } else {
          const sub = Math.max(0, Math.min(1, (L - .35) / .6));
          y = sub * .35 + Math.sin(time * 1.8 + u.k) * .06 * sub; rot = Math.sin(time * 1.2 + u.k * 2) * .12 * sub;
          u.m.color.copy(u.base).lerp(RED, sub);
        }
        c.position.set(x, y, z); c.rotation.set(rot * .4, rot, rot * .3);
      });
      bags.visible = side === 'B' && t > .2;
      redL.intensity = side === 'A' && L > .7 ? 1.2 + Math.sin(time * 5) * .8 : 0;
      sc.background.setHex(side === 'A' ? 0x0d1420 : 0x0b1420);
    }
    function frame(W, H, t, time, shake) {
      if (W !== sizeW || H !== sizeH) { R.setSize(W, H, false); sizeW = W; sizeH = H; }
      const dt = Math.min(.05, time - lastT || .016); lastT = time;
      const p = rg.attributes.position.array;
      for (let i = 0; i < N; i++) { let y = ry[i] - 22 * dt; if (y < 0) y += 22; ry[i] = y; p[i * 6 + 1] = y; p[i * 6 + 4] = y - 1.1; }
      rg.attributes.position.needsUpdate = true;
      const camZ = 13 - 5 * ease(t / .9), half = W / 2;
      cam.aspect = half / H; cam.updateProjectionMatrix();
      R.setScissorTest(true);
      ['A', 'B'].forEach((side, k) => {
        apply(side, t, time);
        cam.position.set(1.4 + (side === 'A' ? (Math.random() - .5) * shake * .5 : 0), 2.5 + Math.sin(time * 1.4) * .02 + (side === 'A' ? (Math.random() - .5) * shake * .4 : 0), camZ);
        cam.lookAt(0, 1.1, camZ - 22);
        R.setViewport(k * half, 0, half, H); R.setScissor(k * half, 0, half, H);
        R.render(sc, cam);
      });
      R.setScissorTest(false);
    }
    return { frame };
  } catch (e) { $('#tf3d').hidden = true; $('#tfCanvas').hidden = false; return null; } })();
  if (T3) $('#tfStage').insertAdjacentHTML('beforeend', '<span style="position:absolute;left:50%;top:0;bottom:0;width:2px;margin-left:-1px;background:rgba(238,243,250,.9);box-shadow:0 0 16px rgba(163,221,255,.6);pointer-events:none"></span>');

  /* ---------- background rain + sound ---------- */
  const rc = $('#rain'), rctx = rc.getContext('2d');
  let rainLevel = .25, rainTarget = .25;
  const drops = Array.from({ length: 500 }, () => ({ x: Math.random(), y: Math.random(), v: .6 + Math.random() * .7, l: .5 + Math.random() }));
  function sizeRain() { const d = Math.min(2, devicePixelRatio || 1); rc.width = innerWidth * d; rc.height = innerHeight * d; rctx.setTransform(d, 0, 0, d, 0, 0); }
  let audio = null;
  function startSound() {
    try {
      const A = new (window.AudioContext || window.webkitAudioContext)();
      const len = A.sampleRate * 3, buf = A.createBuffer(1, len, A.sampleRate), d = buf.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3.5 + w * .05; }
      const src = A.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = A.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
      const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
      const gain = A.createGain(); gain.gain.value = 0;
      src.connect(hp).connect(lp).connect(gain).connect(A.destination); src.start();
      audio = { A, gain };
    } catch (e) { audio = null; }
  }
  function toggleSound() {
    sound = !sound; $('#bSound').setAttribute('aria-pressed', sound);
    if (sound && !audio) startSound();
    if (audio) { if (audio.A.state === 'suspended') audio.A.resume(); audio.gain.gain.setTargetAtTime(sound ? .12 + rainLevel * .28 : 0, audio.A.currentTime, .4); }
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; const time = now / 1000;
    rainLevel += (rainTarget - rainLevel) * Math.min(1, dt * 1.5);
    rctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!reduce) {
      const n = Math.round(drops.length * rainLevel);
      rctx.strokeStyle = 'rgba(190,222,255,.16)'; rctx.lineWidth = 1; rctx.beginPath();
      for (let i = 0; i < n; i++) { const d = drops[i]; d.y += d.v * dt * 1.3; d.x += d.v * dt * .15; if (d.y > 1.05) { d.y = -.05; d.x = Math.random(); } if (d.x > 1) d.x -= 1; const L = 8 + d.l * 14; rctx.moveTo(d.x * innerWidth, d.y * innerHeight); rctx.lineTo(d.x * innerWidth + L * .12, d.y * innerHeight + L); }
      rctx.stroke();
    }
    if (audio && sound) audio.gain.gain.setTargetAtTime(.12 + rainLevel * .28, audio.A.currentTime, .6);
    if (slides[cur].id === 's-tf') tfFrame(time, dt);
    if (slides[cur].id === 's-res') miniMap(time);
    requestAnimationFrame(loop);
  }

  /* mini safe-route map */
  const mm = $('#miniMap'), mctx = mm.getContext('2d');
  function miniMap(time) {
    const r = mm.getBoundingClientRect(); if (!r.width) return;
    const d = Math.min(2, devicePixelRatio || 1), W = r.width, H = r.height;
    if (mm.width !== Math.round(W * d)) { mm.width = Math.round(W * d); mm.height = Math.round(H * d); }
    const c = mctx; c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = '#0a1019'; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(190,206,228,.16)'; c.lineWidth = 3;
    [.2, .45, .7].forEach(u => { c.beginPath(); c.moveTo(0, H * u); c.lineTo(W, H * u + 8); c.stroke(); c.beginPath(); c.moveTo(W * u, 0); c.lineTo(W * u + 10, H); c.stroke(); });
    const g = c.createRadialGradient(W * .3, H * .62, 0, W * .3, H * .62, W * (.32 + .03 * Math.sin(time))); g.addColorStop(0, 'rgba(60,140,240,.65)'); g.addColorStop(1, 'rgba(60,140,240,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(255,79,97,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, H * .7); c.lineTo(W * .48, H * .7 + 4); c.stroke();
    c.save(); c.setLineDash([8, 7]); c.lineDashOffset = -time * 22; c.strokeStyle = '#3cd8a2'; c.lineWidth = 3.5; c.shadowColor = 'rgba(60,216,162,.8)'; c.shadowBlur = 10;
    c.beginPath(); c.moveTo(W * .3, H * .62); c.lineTo(W * .45, H * .45 + 2); c.lineTo(W * .7, H * .45 + 6); c.lineTo(W * .72, H * .2); c.lineTo(W * .86, H * .2); c.stroke(); c.restore();
    c.fillStyle = '#eef3fa'; c.beginPath(); c.arc(W * .3, H * .62, 6, 0, 7); c.fill();
    c.fillStyle = '#3cd8a2'; c.beginPath(); c.arc(W * .86, H * .2, 7, 0, 7); c.fill();
    c.font = '600 11px Geist, sans-serif'; c.fillStyle = '#a9f3d9'; c.textAlign = 'right'; c.fillText('Higher ground +4 m', W - 10, H * .2 - 14);
    c.fillStyle = '#eef3fa'; c.textAlign = 'left'; c.fillText('You', W * .3 + 10, H * .62 + 4);
  }

  /* ---------- input ---------- */
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { if (k === 'Enter' && e.target.closest('button,a')) return; e.preventDefault(); next(); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'n' || k === 'N') toggleNotes();
    else if (k === 's' || k === 'S') toggleSound();
    else if (k === 'f' || k === 'F') { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { }); } catch (err) { } }
    else if (k === '3') toggleShort();
    else if (k === 'Escape') toggleNotes(false);
    else if (k === 'Home') go(0);
  });
  $('#deck').addEventListener('click', e => { if (e.target.closest('button,a,.notes')) return; if (e.clientX < innerWidth * .2) prev(); else next(); });
  let tx = null;
  $('#deck').addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  $('#deck').addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) (dx < 0 ? next : prev)(); tx = null; }, { passive: true });
  $('#bNext').onclick = next; $('#bPrev').onclick = prev;
  $('#bNotes').onclick = () => toggleNotes(); $('#nClose').onclick = () => toggleNotes(false);
  $('#bSound').onclick = toggleSound;
  function toggleShort() { short = !short; $('#bShort').setAttribute('aria-pressed', short); if (short && slides[cur].dataset.short === 'skip') { const o = order(); go(o.find(i => i > cur) ?? o[o.length - 1]); } else go(cur, step); }
  $('#bShort').onclick = toggleShort;

  /* boot */
  window.addEventListener('resize', sizeRain); sizeRain();
  const m = /^#s(\d+)$/.exec(location.hash || ''); const start = m ? Math.min(slides.length, Math.max(1, +m[1])) - 1 : 0;
  go(start);
  if (start === 0) later(() => { step = 0; applySteps(); }, 50);
  requestAnimationFrame(loop);
})();

// Roadmap animation engine
(function () {
  const PHASES = [
    {
      id: '01', when: 'T+0', day: 0, label: 'Funding close',
      title: 'Funding close',
      desc: 'SAFEs and sponsor pledges signed. Founder list opens. Capital allocation locked.',
      icon: 'icon-lock',
      capital: 0, ready: 0, risk: 'low',
      deliv: ['SAFE / equity instruments executed', 'Sponsor pledges confirmed ($5K–$25K tier)', 'Founder list landing page live', 'Quarterly investor update cadence set']
    },
    {
      id: '02', when: 'T+30', day: 30, label: 'Prototype tooling',
      title: 'Prototype tooling',
      desc: 'CAD freeze on RV Pouch v1. NFC card and QR sheet supplier samples in hand.',
      icon: 'icon-beaker',
      capital: 18, ready: 18, risk: 'low',
      deliv: ['RV Pouch CAD frozen + 3D-printed mocks', 'NFC card prototypes (3 finishes)', 'QR sheet adhesive samples tested', 'Tracker-pocket fitment validated']
    },
    {
      id: '03', when: 'T+75', day: 75, label: 'Photo + web MVP',
      title: 'Photo + web MVP',
      desc: 'Hero photography shot. Recovery web flow MVP shipped. NFC tap → claim flow working end-to-end.',
      icon: 'icon-camera',
      capital: 38, ready: 42, risk: 'medium',
      deliv: ['Hero + lifestyle photography (4 SKUs)', 'Recovery web app MVP deployed', 'NFC tap → claim flow live', 'Brand system applied across surfaces']
    },
    {
      id: '04', when: 'T+105', day: 105, label: 'Pre-launch + creator',
      title: 'Pre-launch + creator drop',
      desc: 'Founder list early-bird opens. Creator labels seeded to 12 niche creators. Press kit out.',
      icon: 'icon-rocket',
      capital: 55, ready: 62, risk: 'medium',
      deliv: ['Founder list early-bird offer live', 'Creator labels seeded (12 partners)', 'Press kit + first-wave outreach', 'Kickstarter draft locked']
    },
    {
      id: '05', when: 'T+140', day: 140, label: 'MOQ + manufacture',
      title: 'MOQ + manufacture',
      desc: 'DDP run greenlit. First production lot in motion. QA spec approved with manufacturer.',
      icon: 'icon-factory',
      capital: 82, ready: 84, risk: 'high',
      deliv: ['DDP run scheduled with manufacturer', 'QA spec sheet signed', 'First production lot in motion', 'Packaging finalized + printed']
    },
    {
      id: '06', when: 'T+180', day: 180, label: 'First ship',
      title: 'First ship',
      desc: 'Founder list orders fulfilled. Recovery web 1.0 live. Post-mortem + V1.5 brief drafted.',
      icon: 'icon-truck',
      capital: 100, ready: 100, risk: 'low',
      deliv: ['Founder list orders shipped', 'Recovery web 1.0 in production', 'NPS + recovery rate metrics on dash', 'V1.5 SessionVault brief drafted']
    }
  ];

  const READINESS_MODULES = [
    { key: 'Industrial design', max: 100, gate: 30 },
    { key: 'Photo + brand',     max: 100, gate: 75 },
    { key: 'Recovery web',      max: 100, gate: 75 },
    { key: 'NFC + QR firmware', max: 100, gate: 105 },
    { key: 'MOQ + manufacture', max: 100, gate: 140 },
    { key: 'Fulfillment',       max: 100, gate: 180 }
  ];

  // Risk distribution per phase: [low%, med%, high%]
  const RISK = [
    [85, 12, 3],
    [70, 25, 5],
    [55, 35, 10],
    [50, 35, 15],
    [30, 40, 30],
    [70, 20, 10]
  ];

  const DURATION_MS = 22000; // 22s for full 180-day sweep — snappier
  const TRACK_PAD = 4; // %
  const BOOT_DELAY_MS = 1350;

  // ===== Build timeline nodes =====
  const track = document.getElementById('tlTrack');
  const ticksWrap = document.getElementById('tlTicks');
  const heroTimeline = document.getElementById('heroTimeline');
  const bootLine = document.getElementById('bootLine');
  const bootText = document.getElementById('bootText');

  // 7 ticks
  for (let i = 0; i < 7; i++) {
    const t = document.createElement('span');
    ticksWrap.appendChild(t);
  }

  PHASES.forEach((p, i) => {
    const node = document.createElement('div');
    node.className = 'tl-node';
    node.dataset.idx = i;
    node.style.setProperty('--node-delay', `${220 + (i * 85)}ms`);
    const xPct = TRACK_PAD + (p.day / 180) * (100 - TRACK_PAD * 2);
    node.style.left = xPct + '%';

    const tpl = document.getElementById(p.icon);
    const iconHTML = tpl ? tpl.innerHTML : '';

    node.innerHTML = `
      <span class="when">${p.when}</span>
      <span class="dot"></span>
      <span class="icon-wrap">${iconHTML}</span>
      <span class="label">${p.label}</span>
    `;
    node.addEventListener('click', () => {
      pause();
      setProgress(p.day / 180);
    });
    track.appendChild(node);
  });

  const nodes = [...document.querySelectorAll('.tl-node')];
  const fill = document.getElementById('tlFill');
  const playhead = document.getElementById('tlPlayhead');
  const scrubFill = document.getElementById('scrubFill');
  const scrubHandle = document.getElementById('scrubHandle');
  const scrubber = document.getElementById('scrubber');
  const btnPlay = document.getElementById('btnPlay');
  const btnReset = document.getElementById('btnReset');
  const topClock = document.getElementById('topClock');
  const bottomClock = document.getElementById('bottomClock');
  const hudPhase = document.getElementById('hudPhase');
  const hudDay = document.getElementById('hudDay');
  const hudCapital = document.getElementById('hudCapital');
  const hudReady = document.getElementById('hudReady');
  const hudRisk = document.getElementById('hudRisk');
  const hudGate = document.getElementById('hudGate');

  // ===== Build readiness rows =====
  const readyList = document.getElementById('readyList');
  READINESS_MODULES.forEach((m) => {
    const row = document.createElement('div');
    row.className = 'readiness-row';
    row.innerHTML = `
      <div class="head">
        <span class="label">${m.key}</span>
        <span class="pct" data-pct>0%</span>
      </div>
      <div class="bar">
        <div class="ticks"><span></span><span></span><span></span><span></span><span></span></div>
        <div class="bar-fill" data-fill></div>
      </div>
    `;
    readyList.appendChild(row);
  });

  // ===== Build risk rows =====
  const riskList = document.getElementById('riskList');
  PHASES.forEach((p, i) => {
    const r = RISK[i];
    const row = document.createElement('div');
    row.className = 'risk-row';
    row.dataset.idx = i;
    row.innerHTML = `
      <div class="head">
        <span>P0${i + 1} · ${p.label}</span>
        <span class="level">L ${r[0]}% · M ${r[1]}% · H ${r[2]}%</span>
      </div>
      <div class="stack">
        <i class="low"  data-w="${r[0]}"></i>
        <i class="med"  data-w="${r[1]}"></i>
        <i class="high" data-w="${r[2]}"></i>
      </div>
    `;
    riskList.appendChild(row);
  });

  // ===== Build line graph =====
  const capSvg = document.getElementById('capSvg');
  const W = 600, H = 220, PAD_L = 40, PAD_R = 16, PAD_T = 18, PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const grid = document.getElementById('capGrid');
  const axis = document.getElementById('capAxis');

  // grid: 5 horizontal lines at 0/25/50/75/100
  [0, 25, 50, 75, 100].forEach((v) => {
    const y = PAD_T + innerH - (v / 100) * innerH;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', PAD_L); line.setAttribute('x2', W - PAD_R);
    line.setAttribute('y1', y); line.setAttribute('y2', y);
    grid.appendChild(line);

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('class', 'axis-label');
    lbl.setAttribute('x', 4); lbl.setAttribute('y', y + 3);
    lbl.textContent = v + '%';
    axis.appendChild(lbl);
  });

  // x labels (T+0, +30, +75, +105, +140, +180)
  PHASES.forEach((p) => {
    const x = PAD_L + (p.day / 180) * innerW;
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('class', 'axis-label');
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('x', x); lbl.setAttribute('y', H - 8);
    lbl.textContent = p.when;
    axis.appendChild(lbl);
  });

  function xFor(day) { return PAD_L + (day / 180) * innerW; }
  function yFor(pct) { return PAD_T + innerH - (pct / 100) * innerH; }

  // Build smooth path through phase points
  function buildPath(uptoDay) {
    const pts = [];
    PHASES.forEach((p) => {
      if (p.day <= uptoDay) {
        pts.push([xFor(p.day), yFor(p.capital)]);
      }
    });
    // include current playhead point if between phases
    if (pts.length === 0 || pts[pts.length - 1][0] < xFor(uptoDay)) {
      // interpolate capital at current day
      let prev = PHASES[0];
      let next = PHASES[PHASES.length - 1];
      for (let i = 0; i < PHASES.length - 1; i++) {
        if (uptoDay >= PHASES[i].day && uptoDay <= PHASES[i + 1].day) {
          prev = PHASES[i]; next = PHASES[i + 1]; break;
        }
      }
      const t = (uptoDay - prev.day) / Math.max(1, (next.day - prev.day));
      const cap = prev.capital + (next.capital - prev.capital) * t;
      pts.push([xFor(uptoDay), yFor(cap)]);
    }

    if (pts.length < 2) return { stroke: '', area: '' };
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    const last = pts[pts.length - 1];
    const area = d + ` L ${last[0]} ${PAD_T + innerH} L ${pts[0][0]} ${PAD_T + innerH} Z`;
    return { stroke: d, area };
  }

  const capStroke = document.getElementById('capStroke');
  const capArea = document.getElementById('capArea');
  const capPts = document.getElementById('capPts');

  // pre-place phase points
  PHASES.forEach((p, i) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'pt');
    c.setAttribute('cx', xFor(p.day));
    c.setAttribute('cy', yFor(p.capital));
    c.setAttribute('r', 3.5);
    c.dataset.idx = i;
    capPts.appendChild(c);

    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('class', 'pt-label');
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('x', xFor(p.day));
    lbl.setAttribute('y', yFor(p.capital) - 10);
    lbl.textContent = p.capital + '%';
    lbl.dataset.idx = i;
    capPts.appendChild(lbl);
  });

  // ===== State =====
  let progress = 0; // 0..1 over 180 days
  let playing = false;
  let lastT = null;

  function setBootLabel(text) {
    if (!bootText) {
      return;
    }
    bootText.textContent = text;
  }

  function typeBootLabel() {
    if (!bootText) {
      return;
    }
    const fullText = bootText.dataset.text || 'Roadmap . 180-day estimate';
    setBootLabel('');
    let idx = 0;
    const typeTimer = window.setInterval(() => {
      idx += 1;
      setBootLabel(fullText.slice(0, idx));
      if (idx >= fullText.length) {
        window.clearInterval(typeTimer);
        bootLine?.classList.remove('is-booting');
        bootLine?.classList.add('is-live');
      }
    }, 38);
  }

  function beginHeroBoot() {
    setBootLabel('');
    bootLine?.classList.add('is-booting');
    window.setTimeout(typeBootLabel, 240);
    window.setTimeout(() => {
      heroTimeline?.classList.remove('is-booting');
      heroTimeline?.classList.add('is-live');
      play();
      render();
    }, BOOT_DELAY_MS);
  }

  function currentDay() { return progress * 180; }

  function findCurrentPhase(day) {
    for (let i = PHASES.length - 1; i >= 0; i--) {
      if (day >= PHASES[i].day) return i;
    }
    return 0;
  }

  function interp(day, key) {
    if (day <= PHASES[0].day) return PHASES[0][key];
    if (day >= PHASES[PHASES.length - 1].day) return PHASES[PHASES.length - 1][key];
    for (let i = 0; i < PHASES.length - 1; i++) {
      if (day >= PHASES[i].day && day <= PHASES[i + 1].day) {
        const t = (day - PHASES[i].day) / (PHASES[i + 1].day - PHASES[i].day);
        return PHASES[i][key] + (PHASES[i + 1][key] - PHASES[i][key]) * t;
      }
    }
    return 0;
  }

  function setProgress(p) {
    progress = Math.max(0, Math.min(1, p));
    render();
  }

  function render() {
    const day = currentDay();
    const phaseIdx = findCurrentPhase(day);
    const phase = PHASES[phaseIdx];
    const pctStr = Math.round(progress * 100) + '%';
    const dayStr = String(Math.round(day)).padStart(3, '0');

    // rail fill + playhead
    fill.style.width = (progress * 100) + '%';
    playhead.style.left = (TRACK_PAD + progress * (100 - TRACK_PAD * 2)) + '%';
    scrubFill.style.width = (progress * 100) + '%';
    scrubHandle.style.left = (progress * 100) + '%';

    // clocks
    topClock.textContent = `T+${dayStr}d`;
    bottomClock.textContent = `T+${dayStr} / 180`;

    // node states
    nodes.forEach((n, i) => {
      n.classList.remove('is-active', 'is-current');
      const p = PHASES[i];
      if (day >= p.day && i < phaseIdx) n.classList.add('is-active');
      if (i === phaseIdx) n.classList.add('is-current');
      // also the icon micro animations key off is-current
    });
    // when at exactly t=0, only first as current (no actives)
    if (day === 0) nodes[0].classList.add('is-current');

    // detail panel
    document.getElementById('dStageId').textContent = `PHASE ${phase.id}`;
    document.getElementById('dStageWhen').textContent = `${phase.when} — Day ${phase.day}`;
    document.getElementById('dStageTitle').textContent = phase.title;
    document.getElementById('dStageDesc').textContent = phase.desc;
    const dl = document.getElementById('dStageDeliv');
    dl.innerHTML = phase.deliv.map(d => `<li>${d}</li>`).join('');
    document.getElementById('dCapital').textContent = phase.capital + '%';
    document.getElementById('dReadiness').textContent = phase.ready + '%';
    document.getElementById('dRisk').textContent = phase.risk;

    // hero side
    if (hudPhase) hudPhase.textContent = `${phase.when} · ${phase.title}`;
    if (hudDay) hudDay.textContent = `${dayStr} / 180`;
    if (hudCapital) hudCapital.textContent = Math.round(interp(day, 'capital')) + '%';
    if (hudReady) hudReady.textContent = Math.round(interp(day, 'ready')) + '%';
    if (hudRisk) hudRisk.textContent = phase.risk;
    const next = PHASES[Math.min(phaseIdx + 1, PHASES.length - 1)];
    if (hudGate) hudGate.textContent = next.when;

    // line graph
    const path = buildPath(day);
    capStroke.setAttribute('d', path.stroke);
    capArea.setAttribute('d', path.area);
    [...capPts.querySelectorAll('circle')].forEach((c) => {
      const i = +c.dataset.idx;
      c.classList.toggle('is-current', i === phaseIdx);
      c.style.opacity = (PHASES[i].day <= day) ? 1 : 0.3;
    });
    [...capPts.querySelectorAll('text')].forEach((t) => {
      const i = +t.dataset.idx;
      t.classList.toggle('is-current', i === phaseIdx);
      t.style.opacity = (PHASES[i].day <= day) ? 1 : 0.25;
    });

    // readiness bars
    [...readyList.querySelectorAll('.readiness-row')].forEach((row, i) => {
      const m = READINESS_MODULES[i];
      const pct = Math.max(0, Math.min(100, (day / m.gate) * 100));
      row.querySelector('[data-fill]').style.width = pct + '%';
      row.querySelector('[data-pct]').textContent = Math.round(pct) + '%';
    });

    // risk rows: animate width when reached, highlight current
    [...riskList.querySelectorAll('.risk-row')].forEach((row, i) => {
      const reached = i <= phaseIdx;
      const isCurr = i === phaseIdx;
      row.style.opacity = reached ? 1 : 0.4;
      row.querySelectorAll('i').forEach((seg) => {
        seg.style.width = reached ? (seg.dataset.w + '%') : '0%';
      });
      row.classList.toggle('is-current', isCurr);
    });
    document.getElementById('riskActiveLabel').textContent = `PHASE ${phase.id} · CURRENT`;
  }

  // ===== Animation loop =====
  function tick(ts) {
    if (lastT == null) lastT = ts;
    const dt = ts - lastT;
    lastT = ts;
    if (playing) {
      progress += dt / DURATION_MS;
      if (progress >= 1) { progress = 1; playing = false; updatePlayBtn(); }
      render();
    }
    requestAnimationFrame(tick);
  }

  function updatePlayBtn() {
    btnPlay.classList.toggle('is-on', playing);
    btnPlay.textContent = playing ? '▶ Auto' : '▶ Play';
  }

  function play() { if (progress >= 1) progress = 0; playing = true; updatePlayBtn(); }
  function pause() { playing = false; updatePlayBtn(); }

  btnPlay.addEventListener('click', () => {
    if (playing) pause(); else play();
  });
  btnReset.addEventListener('click', () => {
    progress = 0; playing = true; updatePlayBtn(); render();
  });

  // Scrubber drag
  let dragging = false;
  function scrubFromEvent(e) {
    const rect = scrubber.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setProgress(x / rect.width);
  }
  scrubber.addEventListener('mousedown', (e) => { pause(); dragging = true; scrubFromEvent(e); });
  window.addEventListener('mousemove', (e) => { if (dragging) scrubFromEvent(e); });
  window.addEventListener('mouseup', () => { dragging = false; });
  scrubber.addEventListener('touchstart', (e) => { pause(); dragging = true; scrubFromEvent(e); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (dragging) scrubFromEvent(e); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });

  // initial render + start
  render();
  beginHeroBoot();
  requestAnimationFrame(tick);

  // reveal on scroll — with immediate check + scroll fallback for iframe contexts
  const els = document.querySelectorAll('.reveal');
  function checkAll() {
    els.forEach(el => {
      if (el.classList.contains('is-in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.95 && r.bottom > 0) el.classList.add('is-in');
    });
  }
  requestAnimationFrame(checkAll);
  setTimeout(checkAll, 200);
  window.addEventListener('scroll', checkAll, { passive: true });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => io.observe(el));
})();

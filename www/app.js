(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const SCOOPS = [
    { ml: 100, color: '#f08c8c', size: 1.0 },
    { ml: 50, color: '#f5b950', size: 0.8 },
    { ml: 20, color: '#7cc79a', size: 0.62 },
  ];
  const PRESETS = [40, 60, 80, 100, 120, 140, 160, 180, 200, 240];
  const MIN = 10, MAX = 400;

  // ---------- 保存 ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('milk.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('milk.' + k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  const state = {
    total: store.get('total', 120),
    g100: store.get('g100', 13.5),
    use: store.get('use', { 100: true, 50: true, 20: true }),
  };

  // ---------- 計算 ----------
  function split(total) {
    const hot = Math.round(total * 2 / 3);
    return { hot, cool: total - hot };
  }

  // 使えるスプーンで「ぴったり・最少杯数」の組み合わせを探す（10ml単位）
  function scoopPlan(total, sizes) {
    const unit = 10;
    const n = Math.floor(total / unit);
    const coins = sizes.map((s) => s / unit);
    const INF = 1e9;
    const best = new Array(n + 1).fill(INF);
    const pick = new Array(n + 1).fill(-1);
    best[0] = 0;
    for (let i = 1; i <= n; i++) {
      coins.forEach((c, ci) => {
        if (c <= i && best[i - c] + 1 < best[i]) { best[i] = best[i - c] + 1; pick[i] = ci; }
      });
    }
    // ぴったり作れる最大の量
    let reach = n;
    while (reach > 0 && best[reach] >= INF) reach--;
    const counts = Object.fromEntries(sizes.map((s) => [s, 0]));
    for (let i = reach; i > 0; i -= coins[pick[i]]) counts[sizes[pick[i]]]++;
    return { counts, covered: reach * unit, rest: total - reach * unit };
  }

  // ---------- イラスト ----------
  function scoopSvg(color, size) {
    const w = Math.round(54 * size + 14), h = 42;
    const r = 13 * size + 5;
    return `<svg viewBox="0 0 ${w + 26} ${h}" aria-hidden="true">
      <rect x="${r * 1.6}" y="${h / 2 - 3.5}" width="${w + 26 - r * 1.6 - 2}" height="7" rx="3.5" fill="${color}" opacity=".75"/>
      <ellipse cx="${r + 2}" cy="${h / 2}" rx="${r}" ry="${r * .82}" fill="${color}"/>
      <ellipse cx="${r + 2}" cy="${h / 2 - 1}" rx="${r * .72}" ry="${r * .5}" fill="#fff" opacity=".85"/>
    </svg>`;
  }

  function renderBottle(total, hot) {
    const cap = total <= 160 ? 200 : total <= 240 ? 260 : Math.ceil(total / 40) * 40 + 20;
    const top = 112, bottom = 334, inner = bottom - top;
    const y = (ml) => bottom - (ml / cap) * inner;
    const yHot = y(hot), yTotal = y(Math.min(total, cap));

    let marks = '';
    for (let m = 20; m < cap; m += 20) {
      const my = y(m);
      const major = m % 40 === 0;
      marks += `<line x1="150" x2="${major ? 172 : 164}" y1="${my}" y2="${my}" stroke="#d9b89c" stroke-width="${major ? 2 : 1.4}"/>`;
      if (major) marks += `<text x="146" y="${my + 4}" text-anchor="end" font-size="11" fill="#b49680" font-weight="700">${m}</text>`;
    }

    $('bottle').innerHTML = `
      <defs>
        <clipPath id="bodyClip"><rect x="44" y="98" width="132" height="242" rx="30"/></clipPath>
        <linearGradient id="gHot" x1="0" x2="1"><stop offset="0" stop-color="#ffb487"/><stop offset="1" stop-color="#ff9a66"/></linearGradient>
        <linearGradient id="gCool" x1="0" x2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset="1" stop-color="#74bdf3"/></linearGradient>
      </defs>
      <!-- 乳首 -->
      <path d="M92 64 q0 -26 10 -40 q8 -10 16 0 q10 14 10 40z" fill="#f7d3a8"/>
      <ellipse cx="110" cy="20" rx="7" ry="6" fill="#f7d3a8"/>
      <!-- キャップリング -->
      <rect x="62" y="60" width="96" height="34" rx="10" fill="#f4a6a6"/>
      <rect x="62" y="70" width="96" height="5" fill="#fff" opacity=".35"/>
      <!-- 本体 -->
      <g clip-path="url(#bodyClip)">
        <rect x="44" y="98" width="132" height="242" fill="rgba(255,255,255,.65)"/>
        <rect class="fill" x="44" y="${yHot}" width="132" height="${bottom + 10 - yHot}" fill="url(#gHot)"/>
        <rect class="fill" x="44" y="${yTotal}" width="132" height="${Math.max(0, yHot - yTotal)}" fill="url(#gCool)"/>
        <line x1="44" x2="176" y1="${yHot}" y2="${yHot}" stroke="#fff" stroke-width="2" stroke-dasharray="5 4" opacity=".9"/>
        <rect x="56" y="104" width="12" height="220" rx="6" fill="#fff" opacity=".45"/>
      </g>
      <rect x="44" y="98" width="132" height="242" rx="30" fill="none" stroke="#e8c3a4" stroke-width="4"/>
      ${marks}
      <!-- ラベル -->
      <g font-weight="800" text-anchor="middle">
        <text x="98" y="${Math.min(bottom - 8, (yHot + bottom) / 2 + 6)}" font-size="${(bottom - yHot) > 30 ? 17 : 12}" fill="#fff">お湯 ${hot}</text>
        ${(yHot - yTotal) > 18 ? `<text x="98" y="${(yHot + yTotal) / 2 + 6}" font-size="${(yHot - yTotal) > 30 ? 16 : 12}" fill="#fff">さまし ${total - hot}</text>` : ''}
      </g>`;
  }

  // ---------- 描画 ----------
  function render() {
    const total = state.total;
    const { hot, cool } = split(total);
    const powder = total * state.g100 / 100;

    $('total').value = total;
    $('slider').value = Math.min(total, +$('slider').max);
    $('hot').textContent = hot;
    $('cool').textContent = cool;
    $('hotLine').textContent = hot;
    $('coolLine').textContent = total;
    document.querySelectorAll('.js-hot').forEach((e) => (e.textContent = hot));
    document.querySelectorAll('.js-cool').forEach((e) => (e.textContent = cool));
    document.querySelectorAll('.js-total').forEach((e) => (e.textContent = total));
    $('powder').textContent = fmt(powder);
    $('powderBasis').textContent = `100mlあたり ${fmt(state.g100)}g で計算`;

    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', +c.dataset.v === total));

    renderBottle(total, hot);
    renderScoops(total);
    store.set('total', total);
  }

  function renderScoops(total) {
    const sizes = SCOOPS.filter((s) => state.use[s.ml]).map((s) => s.ml);
    const box = $('scoops');
    box.style.gridTemplateColumns = `repeat(${Math.max(1, sizes.length)}, minmax(0, 1fr))`;
    if (!sizes.length) {
      box.innerHTML = '';
      $('scoopTotal').innerHTML = '<span class="warn">設定で使うスプーンを選んでください</span>';
      return;
    }
    const plan = scoopPlan(total, sizes);
    let half20 = 0;
    let rest = plan.rest;
    if (rest === 10 && state.use[20]) { half20 = 1; rest = 0; }

    box.innerHTML = SCOOPS.filter((s) => state.use[s.ml]).map((s) => {
      const c = plan.counts[s.ml] || 0;
      const half = s.ml === 20 && half20;
      const icons = Array.from({ length: c }, () => scoopSvg(s.color, s.size)).join('') +
        (half ? `<span style="opacity:.55">${scoopSvg(s.color, s.size)}</span>` : '');
      const label = c + (half ? '½' : '');
      const gram = state.g100 * s.ml / 100;
      return `<div class="scoop ${c || half ? '' : 'zero'}" data-s="${s.ml}">
        <span class="name">${s.ml}ml用</span>
        <span class="gram">1杯 ${fmt(gram)}g</span>
        <div class="icons">${icons || '<span class="gram">なし</span>'}</div>
        <span class="count">${label}<small>杯</small></span>
      </div>`;
    }).join('');

    const parts = SCOOPS.filter((s) => plan.counts[s.ml]).map((s) => `${s.ml}ml×${plan.counts[s.ml]}`);
    if (half20) parts.push('20ml×½');
    let msg = parts.length ? `${parts.join(' ＋ ')} ＝ ${total - rest}ml分` : '';
    if (rest > 0) {
      msg += `${msg ? '　' : ''}<span class="warn">のこり ${rest}ml分（約${fmt(state.g100 * rest / 100)}g）はスプーンで量れません</span>`;
    }
    $('scoopTotal').innerHTML = msg;
  }

  function fmt(n) { return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''); }

  function setTotal(v) {
    v = Math.round(Number(v));
    if (!Number.isFinite(v)) return;
    state.total = Math.max(MIN, Math.min(MAX, v));
    render();
  }

  // ---------- イベント ----------
  $('chips').innerHTML = PRESETS.map((v) => `<button class="chip" data-v="${v}">${v}</button>`).join('');
  $('chips').addEventListener('click', (e) => { const b = e.target.closest('.chip'); if (b) setTotal(b.dataset.v); });
  document.querySelectorAll('.step').forEach((b) =>
    b.addEventListener('click', () => setTotal(Math.round((state.total + +b.dataset.step) / 10) * 10)));
  $('slider').addEventListener('input', (e) => setTotal(e.target.value));
  $('total').addEventListener('change', (e) => setTotal(e.target.value));
  $('total').addEventListener('input', (e) => { const v = +e.target.value; if (v >= MIN && v <= MAX) { state.total = Math.round(v); render(); } });
  $('total').addEventListener('focus', (e) => e.target.select());

  const dlg = $('settings');
  $('openSettings').addEventListener('click', () => {
    $('g100').value = state.g100;
    SCOOPS.forEach((s) => ($('use' + s.ml).checked = !!state.use[s.ml]));
    dlg.showModal();
  });
  $('g100').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    if (v > 0 && v <= 40) { state.g100 = v; store.set('g100', v); render(); }
  });
  SCOOPS.forEach((s) => $('use' + s.ml).addEventListener('change', (e) => {
    state.use[s.ml] = e.target.checked; store.set('use', state.use); render();
  }));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  render();

  // ---------- PWA ----------
  const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  if ('serviceWorker' in navigator && !isNative && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();

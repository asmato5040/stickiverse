// ============================================
// STICKIVERSE – Mini-Spiel: Laterne bekleben & zerkratzen
// ============================================
(function () {
  'use strict';
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const SRC = ['gallery-1', 'gallery-2', 'gallery-3', 'gallery-5', 'gallery-6', 'gallery-7'].map(n => 'images/slider/' + n + '.webp');
  const S = 220;                       // Auflösung eines Stickers (offscreen)
  const imgs = [];
  let tool = 'stick', sel = 0, W = 0, H = 0, dpr = 1;
  let stickers = [], ptr = null, last = null, down = false;
  const countEl = document.getElementById('gameCount');

  // ── Bilder laden + Auswahl-Leiste ──
  const tray = document.getElementById('gameTray');
  SRC.forEach((src, i) => {
    const im = new Image(); im.src = src; im.onload = draw; imgs[i] = im;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'game__pick' + (i === 0 ? ' is-on' : '');
    b.setAttribute('aria-label', 'Sticker ' + (i + 1) + ' wählen');
    b.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
    b.onclick = () => { sel = i; setTool('stick'); tray.querySelectorAll('.game__pick').forEach((x, k) => x.classList.toggle('is-on', k === i)); };
    tray.appendChild(b);
  });
  function setTool(t) {
    tool = t;
    document.querySelectorAll('[data-game-tool]').forEach(b => b.classList.toggle('is-on', b.dataset.gameTool === t));
    canvas.style.cursor = t === 'stick' ? 'copy' : 'none';
    draw();
  }
  document.querySelectorAll('[data-game-tool]').forEach(b => b.onclick = () => setTool(b.dataset.gameTool));
  document.getElementById('gameUndo').onclick = () => { stickers.pop(); update(); };
  document.getElementById('gameClear').onclick = () => { stickers = []; update(); };

  // ── Geometrie der Laterne ──
  function lamp() {
    const cx = W / 2, pw = Math.min(150, W * 0.24);
    return {
      cx, pw,
      rects: [
        [cx - pw / 2, 120, pw, H - 120 - 56],            // Mast
        [cx - pw * 0.8, H - 70, pw * 1.6, 40],            // Sockel
        [cx - pw * 0.95, 40, pw * 1.9, 86]                // Lampenkopf
      ]
    };
  }
  function lampPath(c, L) { c.beginPath(); L.rects.forEach(r => c.rect(r[0], r[1], r[2], r[3])); }
  function inLamp(x, y) { return lamp().rects.some(r => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3]); }

  // ── Sticker erzeugen ──
  function make(x, y) {
    const im = imgs[sel]; if (!im || !im.complete) return null;
    const size = 90 + Math.random() * 50, round = Math.random() < 0.6;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'), r = round ? S / 2 : S * 0.18, pad = 6;
    const shape = () => { g.beginPath(); if (round) g.arc(S / 2, S / 2, S / 2 - 1, 0, 7); else g.roundRect(1, 1, S - 2, S - 2, r); };
    shape(); g.fillStyle = '#fff'; g.fill();
    g.save(); g.beginPath();
    if (round) g.arc(S / 2, S / 2, S / 2 - pad, 0, 7); else g.roundRect(pad, pad, S - 2 * pad, S - 2 * pad, r - pad / 2);
    g.clip();
    const k = Math.max(S / im.naturalWidth, S / im.naturalHeight);
    g.drawImage(im, (S - im.naturalWidth * k) / 2, (S - im.naturalHeight * k) / 2, im.naturalWidth * k, im.naturalHeight * k);
    g.restore();
    return { c, g, x: x / W, y: y / H, size, rot: (Math.random() - 0.5) * 0.9 };
  }

  // Punkt (Canvas) -> Sticker-Koordinaten
  function local(s, px, py) {
    const dx = px - s.x * W, dy = py - s.y * H, cos = Math.cos(-s.rot), sin = Math.sin(-s.rot);
    const lx = (dx * cos - dy * sin) / s.size * S + S / 2, ly = (dx * sin + dy * cos) / s.size * S + S / 2;
    return [lx, ly];
  }
  function topAt(px, py) {
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i], [lx, ly] = local(s, px, py);
      if (lx < 0 || ly < 0 || lx >= S || ly >= S) continue;
      if (s.g.getImageData(lx | 0, ly | 0, 1, 1).data[3] > 40) return s;
    }
    return null;
  }

  // ── Zeichnen ──
  function draw() {
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#FFE58A'); bg.addColorStop(1, '#FFF7D6');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(20,18,11,.10)';
    for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) { ctx.beginPath(); ctx.arc(x, y, 1.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#6b6b70'; ctx.fillRect(0, H - 30, W, 30);
    ctx.fillStyle = '#55555a'; ctx.fillRect(0, H - 30, W, 4);

    const L = lamp();
    const mg = ctx.createLinearGradient(L.cx - L.pw, 0, L.cx + L.pw, 0);
    mg.addColorStop(0, '#2b2d33'); mg.addColorStop(.35, '#6a6e78'); mg.addColorStop(.5, '#8d919b'); mg.addColorStop(1, '#2b2d33');
    ctx.strokeStyle = '#14120B'; ctx.lineWidth = 6; lampPath(ctx, L); ctx.stroke();
    ctx.fillStyle = mg; lampPath(ctx, L); ctx.fill();
    ctx.fillStyle = '#FFD23F'; ctx.fillRect(L.cx - L.pw * 0.95 + 6, 52, L.pw * 1.9 - 12, 14);      // Leuchtband

    ctx.save(); lampPath(ctx, L); ctx.clip();
    stickers.forEach(s => {
      ctx.save(); ctx.translate(s.x * W, s.y * H); ctx.rotate(s.rot);
      ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2;
      ctx.drawImage(s.c, -s.size / 2, -s.size / 2, s.size, s.size);
      ctx.restore();
    });
    ctx.restore();

    if (ptr) {
      if (tool === 'stick' && inLamp(ptr[0], ptr[1]) && imgs[sel] && imgs[sel].complete) {
        ctx.save(); ctx.globalAlpha = .55; ctx.translate(ptr[0], ptr[1]);
        ctx.drawImage(imgs[sel], -50, -50, 100, 100); ctx.restore();
      } else if (tool === 'scratch') {
        ctx.save(); ctx.translate(ptr[0], ptr[1]); ctx.rotate(-0.6);
        ctx.fillStyle = '#14120B'; ctx.fillRect(-4, -26, 8, 34);
        ctx.fillStyle = '#c9ccd3'; ctx.beginPath(); ctx.moveTo(-4, 8); ctx.lineTo(4, 8); ctx.lineTo(0, 20); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }
  function update() { if (countEl) countEl.textContent = stickers.length; draw(); }

  // ── Kratzen ──
  function scratch(px, py, fx, fy) {
    const s = topAt(px, py); if (!s) return;
    const [x, y] = local(s, px, py), [x0, y0] = fx == null ? [x, y] : local(s, fx, fy);
    const g = s.g;
    g.save(); g.globalCompositeOperation = 'destination-out';
    g.lineCap = 'round'; g.lineWidth = 12; g.strokeStyle = 'rgba(0,0,0,.45)';
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x, y); g.stroke(); g.restore();
    g.save(); g.globalCompositeOperation = 'source-atop';
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const j = () => (Math.random() - 0.5) * 14;
      g.beginPath(); g.moveTo(x0 + j(), y0 + j()); g.lineTo(x + j(), y + j()); g.stroke();
    }
    g.restore();
  }

  // ── Eingaben ──
  function pos(e) { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; }
  canvas.addEventListener('pointermove', e => {
    ptr = pos(e);
    if (down && tool === 'scratch') { scratch(ptr[0], ptr[1], last && last[0], last && last[1]); last = ptr; }
    draw();
  });
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId); ptr = pos(e); down = true; last = null;
    if (tool === 'stick') {
      if (inLamp(ptr[0], ptr[1])) { const s = make(ptr[0], ptr[1]); if (s) { stickers.push(s); update(); } }
    } else { scratch(ptr[0], ptr[1], null, null); last = ptr; draw(); }
  });
  const up = () => { down = false; last = null; };
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', () => { ptr = null; up(); draw(); });

  function resize() {
    const r = canvas.getBoundingClientRect(); if (!r.width) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = Math.round(Math.min(560, Math.max(420, W * 0.62)));
    canvas.style.height = H + 'px'; canvas.width = W * dpr; canvas.height = H * dpr; draw();
  }
  window.addEventListener('resize', resize);
  resize(); setTool('stick');
})();

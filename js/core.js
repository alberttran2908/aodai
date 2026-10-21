// Core: canvas, loop, input, scenes, UI helpers
window.G = {};
G.W = 1280;
G.H = 720;
G.FONT = "'Be Vietnam Pro','Segoe UI',system-ui,sans-serif";
G.SERIF = "'Playfair Display',Georgia,serif";
G.GAME = "'Baloo 2','Be Vietnam Pro','Segoe UI',sans-serif"; // rounded display face for buttons, banners and numbers
G.C = {
  bg: '#f6ead8', paper: '#fbf4e8', wood: '#b9875a', woodDark: '#8a5d3b',
  ink: '#4a2f27', inkSoft: '#7a5a4c', red: '#b23a48', redDark: '#8c2a37',
  gold: '#d9a441', green: '#4f8a5b', line: '#e2cfb5'
};
G.scenes = {};

G.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
G.lerp = (a, b, t) => a + (b - a) * t;
G.easeOut = (t) => 1 - Math.pow(1 - G.clamp(t, 0, 1), 3);
G.easeBack = (t) => { t = G.clamp(t, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
G.dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
G.rand = (a, b) => a + Math.random() * (b - a);
G.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
G.inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

(function () {
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  G.cv = cv;
  G.ctx = ctx;
  G.scale = 1;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = Math.min(window.innerWidth / G.W, window.innerHeight / G.H);
    const cw = Math.floor(G.W * s), ch = Math.floor(G.H * s);
    cv.style.width = cw + 'px';
    cv.style.height = ch + 'px';
    cv.width = Math.floor(cw * dpr);
    cv.height = Math.floor(ch * dpr);
    G.scale = (cw / G.W) * dpr;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------- Scenes ----------
  G.scene = null;
  G.sceneName = '';
  G.fade = 0;
  G.go = function (name, params) {
    const sc = G.scenes[name];
    if (!sc) { console.error('No scene', name); return; }
    if (G.scene && G.scene.exit) G.scene.exit();
    G.scene = sc;
    G.sceneName = name;
    G.fade = 1;
    G.ui.pressed = null;
    if (sc.enter) sc.enter(params || {});
  };

  // ---------- Toast ----------
  G.toasts = [];
  G.toast = function (msg, color) {
    G.toasts.push({ msg, t: 0, color: color || G.C.ink });
  };

  // ---------- Input ----------
  G.pointer = { x: 0, y: 0, down: false, t: 0 };
  function toLocal(e) {
    const r = cv.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * G.W, y: ((e.clientY - r.top) / r.height) * G.H, t: e.timeStamp };
  }
  cv.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    G.sfx.unlock();
    // phones: the first touch goes fullscreen and holds the screen sideways (Android; iOS ignores this)
    if (e.pointerType === 'touch' && !document.fullscreenElement && !G.triedFull && document.documentElement.requestFullscreen) {
      G.triedFull = true;
      document.documentElement.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape')).catch(() => {});
    }
    const p = toLocal(e);
    Object.assign(G.pointer, p, { down: true });
    const hit = G.ui.hitTest(p);
    if (hit) { G.ui.pressed = hit; return; }
    if (G.scene && G.scene.down) G.scene.down(p, e);
  });
  cv.addEventListener('pointermove', (e) => {
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = toLocal(ev);
      Object.assign(G.pointer, p);
      if (!G.ui.pressed && G.scene && G.scene.move) G.scene.move(p, ev);
    }
  });
  const up = (e) => {
    const p = toLocal(e);
    Object.assign(G.pointer, p, { down: false });
    if (G.ui.pressed) {
      const hit = G.ui.hitTest(p);
      const pr = G.ui.pressed;
      G.ui.pressed = null;
      if (hit && hit.id === pr.id && pr.enabled) { G.sfx.click(); pr.cb(); }
      return;
    }
    if (G.scene && G.scene.up) G.scene.up(p, e);
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  // held keys (by e.code) for continuous controls such as the sewing machine pedal
  G.keys = {};
  window.addEventListener('keydown', (e) => {
    G.keys[e.code] = true;
    if (G.Dialog && G.Dialog.active) { G.Dialog.key(e); return; } // a story scene owns the keyboard
    if (G.scene && G.scene.key) G.scene.key(e);
  });
  window.addEventListener('keyup', (e) => { G.keys[e.code] = false; });
  window.addEventListener('blur', () => { G.keys = {}; });

  // ---------- Immediate-mode UI ----------
  G.ui = {
    hits: [], prevHits: [], pressed: null, anim: {}, dt: 0.016,
    hitTest(p) {
      for (let i = this.prevHits.length - 1; i >= 0; i--) {
        const h = this.prevHits[i];
        if (G.inRect(p, h)) return h;
      }
      return null;
    }
  };

  G.rr = function (c, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  };

  G.text = function (c, str, x, y, o) {
    o = o || {};
    c.font = `${o.weight || 400} ${o.size || 18}px ${o.font || G.FONT}`;
    c.fillStyle = o.color || G.C.ink;
    c.textAlign = o.align || 'left';
    c.textBaseline = o.base || 'middle';
    c.fillText(str, x, y);
  };

  G.wrap = function (c, str, x, y, maxW, lineH, o) {
    o = o || {};
    c.font = `${o.weight || 400} ${o.size || 18}px ${o.font || G.FONT}`;
    const words = String(str).split(' ');
    let line = '', yy = y, lines = [];
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; }
      else line = test;
    }
    if (line) lines.push(line);
    for (const l of lines) { G.text(c, l, x, yy, Object.assign({ base: 'top' }, o)); yy += lineH; }
    return lines.length * lineH;
  };

  // chunky "toy" buttons: a coloured face on a darker lip, inked outline, glossy top; the face sinks when pressed
  G.BTN = {
    primary: { top: '#d65a67', bot: '#b23a48', lip: '#7a2330', txt: '#fff8ec' },
    gold: { top: '#f6cd6a', bot: '#dba43f', lip: '#9a6a1d', txt: '#4a2c22' },
    green: { top: '#79b783', bot: '#4f8a5b', lip: '#2e5a38', txt: '#f6fff2' },
    ghost: { top: '#fffaf0', bot: '#f1e3cb', lip: '#c4a47c', txt: '#4a2c22' },
    off: { top: '#e9dfcf', bot: '#dccfbb', lip: '#b9a68e', txt: '#a39282' }
  };
  G.INK = '#4a2c22';
  // id must be stable per frame for press tracking
  G.button = function (c, id, label, x, y, w, h, cb, o) {
    o = o || {};
    const enabled = o.enabled !== false;
    const hit = { id, x, y, w, h, cb, enabled };
    G.ui.hits.push(hit);
    const hover = enabled && G.inRect(G.pointer, hit);
    const pressed = G.ui.pressed && G.ui.pressed.id === id && hover;
    const P = G.BTN[enabled ? o.style || 'primary' : 'off'] || G.BTN.primary;
    // hover springs the button up a little (per-id easing so it feels physical)
    const A = G.ui.anim, a = A[id] = G.lerp(A[id] || 0, hover && !pressed ? 1 : 0, Math.min(1, (G.ui.dt || 0.016) * 14));
    const r = Math.min(o.r || 14, h * 0.34), lip = Math.max(3, Math.min(6, Math.round(h * 0.13))), sink = pressed ? lip - 1 : 0;
    c.save();
    if (a > 0.01) { const sc = 1 + 0.035 * a, cx = x + w / 2, cy = y + h / 2; c.translate(cx, cy); c.scale(sc, sc); c.translate(-cx, -cy); }
    G.rr(c, x + 1, y + 4, w, h, r); c.fillStyle = 'rgba(50,25,12,0.22)'; c.fill();
    G.rr(c, x, y, w, h, r); c.fillStyle = P.lip; c.fill();
    const fy = y + sink, fh = h - lip;
    const g = c.createLinearGradient(0, fy, 0, fy + fh); g.addColorStop(0, P.top); g.addColorStop(1, P.bot);
    G.rr(c, x, fy, w, fh, r); c.fillStyle = g; c.fill();
    if (a > 0.01) { c.fillStyle = `rgba(255,255,255,${0.14 * a})`; c.fill(); }
    // gloss
    G.rr(c, x + Math.min(10, w * 0.12), fy + 3, w - Math.min(20, w * 0.24), Math.max(3, fh * 0.26), Math.max(2, r - 5));
    c.fillStyle = o.style === 'ghost' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'; c.fill();
    G.rr(c, x, y, w, h, r); c.strokeStyle = enabled ? G.INK : '#a8957f'; c.lineWidth = 2.2; c.stroke();
    G.rr(c, x, fy, w, fh, r); c.lineWidth = 1.4; c.stroke();
    if (o.icon) o.icon(c, x + w / 2, fy + fh / 2);
    const size = o.size || 20, ty = fy + fh / 2 + 1;
    if (o.style !== 'ghost' && enabled) G.text(c, label, x + w / 2, ty + 1.5, { align: 'center', size, weight: 700, font: G.GAME, color: P.lip });
    G.text(c, label, x + w / 2, ty, { align: 'center', size, weight: 700, font: G.GAME, color: P.txt });
    c.restore();
    return hit;
  };

  // ---------- Loop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(G.scale, 0, 0, G.scale, 0, 0);
    ctx.clearRect(0, 0, G.W, G.H);
    G.ui.hits = []; G.ui.dt = dt;
    if (G.scene) {
      if (G.scene.update) G.scene.update(dt);
      G.scene.draw(ctx, dt);
    }
    // story dialog on top of everything; its full-screen hit area swallows clicks meant for the scene
    if (G.Dialog && G.Dialog.active) { G.Dialog.update(dt); G.Dialog.draw(ctx); }
    else if (G.tut && G.state) G.tut.draw(ctx, dt); // first-order coaching from Bà Tư
    // toasts: bottom centre, stacking upwards (the top rows hold navigation)
    let ty = G.H - 200;
    G.toasts = G.toasts.filter((t) => (t.t += dt) < 2.4);
    for (const t of G.toasts) {
      const a = t.t < 0.2 ? t.t / 0.2 : t.t > 2 ? (2.4 - t.t) / 0.4 : 1, pop = 0.7 + 0.3 * G.easeBack(t.t / 0.3);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(G.W / 2, ty + 21); ctx.scale(pop, pop); ctx.translate(-G.W / 2, -ty - 21);
      ctx.font = `700 19px ${G.GAME}`;
      const w = ctx.measureText(t.msg).width + 44;
      G.rr(ctx, G.W / 2 - w / 2 + 1, ty + 5, w, 42, 14); ctx.fillStyle = 'rgba(50,25,12,0.25)'; ctx.fill();
      G.rr(ctx, G.W / 2 - w / 2, ty, w, 42, 14);
      ctx.fillStyle = '#fffaf0'; ctx.fill();
      ctx.strokeStyle = G.INK; ctx.lineWidth = 2.2; ctx.stroke();
      G.text(ctx, t.msg, G.W / 2, ty + 22, { align: 'center', size: 19, weight: 700, font: G.GAME, color: t.color });
      ctx.restore();
      ty -= 48;
    }
    if (G.fade > 0) {
      ctx.fillStyle = `rgba(43,29,24,${G.fade})`;
      ctx.fillRect(0, 0, G.W, G.H);
      G.fade = Math.max(0, G.fade - dt * 4);
    }
    G.ui.prevHits = G.ui.hits;
    requestAnimationFrame(frame);
  }

  // manual stepping (debug/testing when rAF is throttled)
  G.step = function (n, ms) {
    for (let i = 0; i < (n || 1); i++) {
      last -= ms || 16;
      const r = window.requestAnimationFrame;
      window.requestAnimationFrame = () => 0;
      frame(performance.now());
      window.requestAnimationFrame = r;
    }
  };

  G.boot = function () {
    const start = () => {
      G.load();
      try { if (G.net) G.net.init(); } catch (e) { /* offline is fine */ }
      if (G.studio) G.studio.fetchCommunity(); // community bolts (published from GitHub Discussions)
      // a shared dress link (#d=…) opens the viewer instead of the title screen
      // a shared fabric link (#f=…) opens the fabric studio with that design
      const fab = /^#f=/.test(location.hash) && G.studio ? G.studio.dec(location.hash.slice(3)) : null;
      if (fab) G.go('studio', { back: 'title', design: fab, shared: true });
      else G.go(/^#d=/.test(location.hash) && G.scenes.viewer ? 'viewer' : 'title');
      requestAnimationFrame(frame);
    };
    (G.loadAssets ? G.loadAssets() : Promise.resolve()).then(start, start);
  };
})();

// ---------- Shared HUD ----------
G.drawHUD = function (c, title) {
  const s = G.state;
  c.save();
  c.fillStyle = 'rgba(74,47,39,0.92)';
  c.fillRect(0, 0, G.W, 56);
  G.text(c, `Ngày ${s.day}`, 24, 28, { size: 20, weight: 800, color: '#fbe9cf' });
  G.text(c, `Khách ${Math.min(s.dayIndex + 1, s.perDay)}/${s.perDay}`, 120, 28, { size: 16, color: '#e6cdb0' });
  if (title) G.text(c, title, G.W / 2, 28, { size: 20, weight: 600, align: 'center', color: '#fbe9cf' });
  // coins
  G.art.coin(c, G.W - 330, 28, 12);
  G.text(c, String(s.coins), G.W - 312, 28, { size: 20, weight: 800, color: '#ffd77a' });
  // rep
  G.art.flower(c, G.W - 200, 28, 11, '#f28fa6');
  G.text(c, `Uy tín ${s.rep}`, G.W - 182, 28, { size: 18, weight: 600, color: '#fbe9cf' });
  c.restore();
  G.button(c, 'mute', s.muted ? '🔇' : '🔊', G.W - 62, 9, 44, 38, () => { s.muted = !s.muted; G.save(); }, { style: 'ghost', size: 18, r: 10 });
};

G.panel = function (c, x, y, w, h, o) {
  o = o || {};
  G.UI.card(c, x, y, w, h, { r: o.r || 18, fill: o.fill, stroke: o.stroke });
};

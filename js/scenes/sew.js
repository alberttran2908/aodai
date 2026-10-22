// Sewing, Dressmaker style. The cut pieces are pinned on the dress form; pick a seam, then feed the
// fabric under a fixed needle: hold to run the machine and steer the fabric so the dashed line stays
// under the needle. Drift too far and the seam is ruined and must be sewn again; a seam ripper undoes one.
G.scenes.sew = {
  SPEEDS: [2.2, 3.6, 5.2],   // fabric feed, garment units (~cm) per second
  SPEED_NAMES: ['Chậm', 'Vừa', 'Nhanh'],
  FAIL: 2.2,                 // drift that ruins the seam
  Z: 22,                     // machine view zoom (px per unit)
  N: { x: 450, y: 262 },     // needle position on screen
  enter() {
    const j = G.job;
    this.j = j; this.asm = j.asm;
    j.sew = [];
    this.sd = this.asm.seams.map(() => null); // per seam: { stitches, score }
    this.paths = this.asm.seams.map((sm) => G.geo.resample(sm.pts, 0.2, false));
    // sharp corners (V and square necklines): the player must stop, turn the fabric on the needle, go on
    this.corners = this.paths.map((P) => {
      const out = [];
      for (let i = 4; i < P.length - 4; i++) {
        const a1 = Math.atan2(P[i].y - P[i - 4].y, P[i].x - P[i - 4].x), a2 = Math.atan2(P[i + 4].y - P[i].y, P[i + 4].x - P[i].x);
        let d = Math.abs(a2 - a1); if (d > Math.PI) d = 2 * Math.PI - d;
        if (d < 0.78) continue;
        const last = out[out.length - 1];
        if (last && i - last.idx < 10) { if (d > last.ang) { last.idx = i; last.ang = d; } } else out.push({ idx: i, ang: d });
      }
      return out;
    });
    this.sel = 0; this.mode = 'form'; this.t = 0; this.lvl = 1; this.m = null; this.parts = []; this.stampT = undefined; this.bits = []; this.ripAnim = null;
    // dress-form framing: the upper body, where the seams are
    const b = this.asm.bounds, s = this.asm.s, top = -8 * s, bot = 60 * s;
    this.oz = Math.min(820 / (b.w + 8), 600 / (bot - top));
    this.ocx = b.x + b.w / 2; this.ocy = (top + bot) / 2;
    this.ovx = 450; this.ovy = 380;
    this.home = { oz: this.oz, ocx: this.ocx, ocy: this.ocy }; // the upper-body view; seams lower down pan the camera
    this.thread = G.art.isLight(G.jobFabs().than.color) ? '#8c2a37' : '#f6e7c4';
    this.bake();
    // first the cut pieces are pinned onto the dress form, one by one (back, front, sleeves, collar)
    const ORDER = ['back', 'front', 'sleeveR', 'sleeveL', 'collar'];
    j.pinned = j.pinned || {};
    this.pinList = j.pieces.filter((p) => ORDER.includes(p.id)).sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
    if (this.pinList.some((p) => !j.pinned[p.id])) this.mode = 'pin';
    this.pinDrag = null; this.pinTiles = []; this.pinPop = {};
  },
  // the assembled dress rendered once, so the zoomed machine view only has to blit it
  bake() {
    const a = this.asm, b = a.bounds, R = 20;
    const x0 = b.x - 6, y0 = a.topY - 6, x1 = b.x + b.w + 6, y1 = a.hemY + 8 * a.s; // the whole dress: hems are sewn too
    const cv = document.createElement('canvas');
    cv.width = Math.ceil((x1 - x0) * R); cv.height = Math.ceil((y1 - y0) * R);
    const c = cv.getContext('2d');
    c.scale(R, R); c.translate(-x0, -y0);
    G.art.garment(c, a, G.jobFabs(), { trousers: false, buttons: false, still: true, noSheen: true });
    this.baked = { cv, x0, y0, R };
  },
  toScreen(p) { return { x: (p.x - this.ocx) * this.oz + this.ovx, y: (p.y - this.ocy) * this.oz + this.ovy }; },
  // where the form view should look for the selected seam: the upper body, or the seam itself when it runs lower
  frameFor(i) {
    const h = this.home, sm = this.asm.seams[i], s = this.asm.s; if (!sm) return h;
    const b = G.geo.bounds(sm.pts);
    if (b.y + b.h <= 62 * s) return h;
    const m = 10 * s, w = b.w + m * 2, hh = b.h + m * 2;
    return { oz: Math.min(820 / w, 560 / hh, h.oz), ocx: b.x + b.w / 2, ocy: b.y + b.h / 2 };
  },
  // only the thread's own width is free; faster machines get a hair more slack
  dead() { return 0.03 * Math.pow(G.tool('machine').speed, 0.6); },
  // one stitch: the % says how far off the line it went (straight from the distance, nothing rounded up)
  stitchQ(dist) { return G.clamp(1 - Math.max(0, dist - this.dead()) / 1.2, 0, 1); },
  // the shown % is rounded down: 99.6% is still 99%, only a truly clean seam reads 100%
  pct(score) { return Math.floor(score * 100 + 1e-9); },
  // a seam is judged: 99%+ perfect, 95%+ good, 90–94% not good, under 90% badly sewn
  grade(score) {
    const sc = this.pct(score);
    return sc >= 99 ? { key: 'hoanhao', label: 'Hoàn hảo', col: '#2f7a46', good: true }
      : sc >= 95 ? { key: 'tot', label: 'May tốt', col: '#3f8a52', good: true }
      : sc >= 90 ? { key: 'khongtot', label: 'Không tốt', col: '#b8862a' }
      : { key: 'te', label: 'May tệ', col: '#b8323f' };
  },
  allDone() { return this.sd.every((d) => d); },
  nextSel() { const i = this.sd.findIndex((d) => !d); if (i >= 0) this.sel = i; },

  // ---------- machine ----------
  startSeam(i) {
    const P = this.paths[i], k = Math.min(P.length - 1, 4);
    this.sel = i; this.mode = 'machine';
    this.m = { n: { x: P[0].x, y: P[0].y }, th: Math.atan2(P[k].x - P[0].x, P[k].y - P[0].y), idx: 0, dist: 0, off: 0, run: false, mouse: false, acc: 0, vel: 0, wheel: 0, st: [{ x: P[0].x, y: P[0].y, q: 1 }], fail: 0, done: 0 };
    this.sd[i] = null;
  },
  seg(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = G.clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
    const x = a.x + dx * t, y = a.y + dy * t;
    return { x, y, t, d: Math.hypot(p.x - x, p.y - y) };
  },
  // the seam's score: average stitch, minus a little for a wavy line (steering back and forth)
  live() {
    const st = this.m.st, avg = st.reduce((a, s) => a + s.q, 0) / st.length;
    let wob = 0, n = 0;
    for (let i = 1; i < st.length; i++) if (st[i].off !== undefined && st[i - 1].off !== undefined) { wob += Math.abs(st[i].off - st[i - 1].off); n++; }
    return G.clamp(avg - Math.min(0.05, n ? (wob / n) * 0.5 : 0), 0, 1);
  },
  updateMachine(dt) {
    const m = this.m, P = this.paths[this.sel], K = G.keys;
    if (m.fail) { m.fail -= dt; if (m.fail <= 0) this.startSeam(this.sel); return; }
    if (m.done) { m.done -= dt; if (m.done <= 0) { this.mode = 'form'; this.nextSel(); } return; }
    // steering: D/right turns the needle's path to the right (fabric rotates about the needle)
    const steer = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0);
    m.th += steer * 1.5 * dt;
    m.run = !!(K.Space || m.mouse); // no steering assist: every player sews by hand (fair online scores)
    // the machine spins up quickly and the fabric coasts a moment after you let go, so stops must be planned
    // drifting far off the line makes the thread catch: the feed drags and the needle stutters
    m.snag = m.dist > this.FAIL * 0.6;
    if (m.snag && m.vel > 0.03) G.sfx.snag();
    const target = m.run ? this.SPEEDS[this.lvl] * (m.snag ? 0.4 : 1) : 0;
    m.vel += (target - m.vel) * Math.min(1, dt * (target > m.vel ? 12 : 7.5));
    if (m.vel < 0.08) { m.vel = 0; return; }
    const v = m.vel * dt;
    m.wheel += v * 2.2;
    m.n.x += Math.sin(m.th) * v; m.n.y += Math.cos(m.th) * v;
    let best = null, bi = m.idx;
    for (let i = Math.max(0, m.idx - 4); i < Math.min(P.length - 1, m.idx + 30); i++) {
      const pr = this.seg(m.n, P[i], P[i + 1]);
      if (!best || pr.d < best.d) { best = pr; bi = i; }
    }
    m.dist = best.d; m.idx = Math.max(m.idx, bi);
    // signed offset of the line from the needle, across the screen (for the HUD gauge)
    const ex = best.x - m.n.x, ey = best.y - m.n.y;
    m.off = ex * Math.cos(m.th) - ey * Math.sin(m.th);
    m.acc += v;
    if (m.acc >= 0.3) {
      m.acc = 0;
      m.st.push({ x: m.n.x, y: m.n.y, q: this.stitchQ(m.dist), off: m.off });
      G.sfx.stitch();
    }
    if (m.dist > this.FAIL) {
      m.fail = 1.4; m.run = false; m.mouse = false; m.vel = 0; G.sfx.bad();
    } else if (bi >= P.length - 2 && best.t > 0.9) {
      m.st.push({ x: m.n.x, y: m.n.y, q: m.st[m.st.length - 1].q });
      const score = this.live();
      this.sd[this.sel] = { stitches: m.st, score };
      this.j.sew[this.sel] = score;
      if (G.quests && this.grade(score).key === 'hoanhao') G.quests.event('hoanhao');
      m.done = 1.6; m.run = false; m.mouse = false; m.vel = 0;
      // the seam gets a tailor's stamp; a clean one also gets a little burst of sparkles
      this.stampT = 0; this.stampSfx = false;
      if (this.grade(score).good) {
        G.sfx.cheer();
        for (let k = 0; k < 26; k++) { const a = Math.random() * Math.PI * 2, sp = G.rand(120, 360); this.parts.push({ x: this.N.x, y: this.N.y + 40, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: G.rand(0.7, 1.2), t: 0, col: G.pick(['#f6cd6a', '#ffffff', '#e86a7a', '#7fc8a9']) }); }
      } else G.sfx.done();
    }
  },

  // ---------- input ----------
  down(p) {
    if (this.mode === 'pin') {
      const t = this.pinTiles.find((tl) => G.inRect(p, tl));
      if (t) { this.pinDrag = { id: t.id, x: p.x, y: p.y }; G.sfx.click(); }
      return;
    }
    if (this.mode === 'machine') {
      if (p.x < 900 && !this.m.fail && !this.m.done) { this.m.mouse = true; this.lastX = p.x; }
      return;
    }
    if (p.x > 900) return;
    let best = -1, bd = 18;
    this.asm.seams.forEach((sm, i) => {
      const P = sm.pts.map((q) => this.toScreen(q));
      for (let k = 0; k < P.length - 1; k++) { const d = this.seg(p, P[k], P[k + 1]).d; if (d < bd) { bd = d; best = i; } }
    });
    if (best >= 0) { this.sel = best; G.sfx.click(); }
  },
  move(p) {
    if (this.pinDrag) { this.pinDrag.x = p.x; this.pinDrag.y = p.y; return; }
    if (this.mode === 'machine' && this.m.mouse) { this.m.th += (p.x - this.lastX) * 0.006; this.lastX = p.x; }
  },
  up(p) {
    if (this.m) this.m.mouse = false;
    const d = this.pinDrag; this.pinDrag = null;
    if (d && p.x < 900) this.pinPiece(d.id);
  },
  // a piece dropped on the form snaps into place and gets pinned
  pinPiece(id) {
    const j = this.j;
    if (j.pinned[id]) return;
    j.pinned[id] = true; this.pinPop[id] = 0;
    G.sfx.place(); setTimeout(() => G.sfx.click(), 90);
    if (this.pinList.every((p) => j.pinned[p.id])) {
      setTimeout(() => { if (this.mode === 'pin') { this.mode = 'form'; G.sfx.done(); G.toast('Đã ghim xong! Chọn một đường may để bắt đầu.'); } }, 600);
    }
  },
  key(e) {
    if (e.code === 'Space') e.preventDefault();
    if (this.mode === 'pin') return;
    if (this.mode === 'machine') {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') this.lvl = Math.min(2, this.lvl + 1);
      if (e.code === 'KeyS' || e.code === 'ArrowDown') this.lvl = Math.max(0, this.lvl - 1);
      if (e.code === 'Escape') this.mode = 'form';
    } else if (e.code === 'Enter' && !this.sd[this.sel]) this.startSeam(this.sel);
  },
  update(dt) {
    this.t += dt;
    if (this.mode === 'machine') this.updateMachine(dt);
    else if (this.home) {
      // glide the camera to the selected seam
      const f = this.frameFor(this.sel), k = Math.min(1, dt * 6);
      this.oz += (f.oz - this.oz) * k; this.ocx += (f.ocx - this.ocx) * k; this.ocy += (f.ocy - this.ocy) * k;
    }
    if (this.stampT !== undefined) this.stampT += dt;
    for (const id in this.pinPop) this.pinPop[id] = Math.min(1, this.pinPop[id] + dt);
    // the seam ripper runs along the seam: stitches pop one after another, little bits of thread fall away
    const R = this.ripAnim;
    if (R) {
      R.t += dt;
      const target = Math.min(R.n, Math.floor((R.t / 0.7) * R.n)), st = this.sd[R.i] && this.sd[R.i].stitches;
      while (st && R.popped < target) {
        const q = this.toScreen(st[R.popped]);
        if (R.popped % 2 === 0) this.bits.push({ x: q.x, y: q.y, vx: G.rand(-60, 60), vy: G.rand(-90, -30), a: G.rand(0, 6), va: G.rand(-9, 9), t: 0, life: G.rand(0.6, 1) });
        if (R.popped % 3 === 0) G.sfx.snip();
        R.popped++;
      }
      if (R.t >= 0.75) { this.sd[R.i] = null; this.j.sew[R.i] = undefined; this.ripAnim = null; }
    }
    this.bits = (this.bits || []).filter((b) => (b.t += dt) < b.life);
    for (const b of this.bits) { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 380 * dt; b.a += b.va * dt; }
    this.parts = (this.parts || []).filter((p) => (p.t += dt) < p.life);
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; p.vx *= 0.985; }
  },

  // ---------- drawing ----------
  draw(c) {
    if (this.mode === 'machine') this.drawMachine(c); else if (this.mode === 'pin') this.drawPin(c); else this.drawForm(c);
  },
  pinPolys(id) {
    const a = this.asm;
    return ({ back: [a.body], front: [a.body], sleeveR: [a.sleeveR], sleeveL: [a.sleeveL], collar: [a.collar] }[id] || []).filter(Boolean);
  },
  // the dress form with whatever has been pinned so far; pieces still to pin wait on the right
  drawPin(c) {
    const U = G.UI, a = this.asm, j = this.j, s = a.s, B = this.baked;
    G.art.tableBg(c);
    c.save(); c.beginPath(); c.rect(0, 50, 900, G.H - 50); c.clip();
    c.save(); c.translate(this.ovx, this.ovy); c.scale(this.oz, this.oz); c.translate(-this.ocx, -this.ocy);
    this.drawForm3(c, s, a.mx || 1);
    const piece = (id, dark) => {
      const polys = this.pinPolys(id); if (!polys.length) return;
      const pop = this.pinPop[id] !== undefined ? this.pinPop[id] : 1, k = 1 + 0.06 * (1 - G.easeOut(pop * 3));
      c.save(); c.scale(k, k); c.beginPath();
      for (const poly of polys) { poly.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.closePath(); }
      c.clip(); c.drawImage(B.cv, B.x0, B.y0, B.cv.width / B.R, B.cv.height / B.R);
      if (dark) { c.fillStyle = 'rgba(0,0,0,0.22)'; c.fillRect(-60 * s, -20 * s, 120 * s, 120 * s); }
      c.restore();
    };
    if (j.pinned.back && !j.pinned.front) piece('back', true);
    for (const id of ['front', 'sleeveR', 'sleeveL', 'collar']) if (j.pinned[id]) piece(id);
    // where the piece in hand will go
    if (this.pinDrag) {
      c.setLineDash([2.5 / this.oz * 3, 2 / this.oz * 3]); c.lineWidth = 3 / this.oz; c.strokeStyle = `rgba(178,50,63,${0.6 + Math.sin(this.t * 8) * 0.3})`;
      for (const poly of this.pinPolys(this.pinDrag.id)) { c.beginPath(); poly.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.closePath(); c.stroke(); }
      c.setLineDash([]);
    }
    c.restore();
    // pins along the edges of every pinned piece
    const cols = ['#c2414b', '#3f7fbf', '#e0b23c'];
    for (const p of this.pinList) {
      if (!j.pinned[p.id] || (p.id === 'back' && j.pinned.front)) continue;
      for (const poly of this.pinPolys(p.id)) for (let k = 0; k < 6; k++) {
        const q = this.toScreen(poly[Math.floor((poly.length - 1) * (k + 0.5) / 6)]);
        this.pin(c, q.x - 4, q.y - 4, cols[k % 3]);
      }
    }
    c.restore();
    // tray of pieces still to pin
    const x = 910;
    U.card(c, x, 66, 350, 570);
    U.title(c, 'Ghim lên ma-nơ-canh', x + 24, 102, { size: 22 });
    G.wrap(c, 'Kéo từng mảnh thả lên ma-nơ-canh. Thân sau trước, rồi thân trước, tay và cổ.', x + 24, 126, 300, 20, { size: 13, color: U.T.soft, maxLines: 2 });
    this.pinTiles = [];
    const left = this.pinList.filter((p) => !j.pinned[p.id]);
    left.forEach((p, i) => {
      const tx = x + 22 + (i % 2) * 156, ty = 184 + Math.floor(i / 2) * 136, tw = 148, th = 128;
      const drag = this.pinDrag && this.pinDrag.id === p.id;
      this.pinTiles.push({ id: p.id, x: tx, y: ty, w: tw, h: th });
      U.tile(c, tx, ty, tw, th, { hov: G.inRect(G.pointer, { x: tx, y: ty, w: tw, h: th }) });
      if (!drag) this.drawFlat(c, p, tx + tw / 2, ty + 54, tw - 26, 84);
      G.text(c, p.name, tx + tw / 2, ty + th - 14, { size: 13, weight: 700, align: 'center' });
    });
    G.button(c, 'pinall', 'Ghim nhanh tất cả', x + 24, 576, 302, 44, () => { for (const p of left) this.pinPiece(p.id); }, { style: 'ghost', size: 15, r: 22 });
    if (this.pinDrag) {
      const p = this.pinList.find((q) => q.id === this.pinDrag.id);
      c.save(); c.globalAlpha = 0.9; c.translate(this.pinDrag.x, this.pinDrag.y); c.rotate(-0.08);
      this.drawFlat(c, p, 0, 0, 170, 150); c.restore();
    }
    U.hint(c, 'Kéo mảnh vải từ bên phải thả lên ma-nơ-canh để ghim');
    U.topbar(c, 'Ghim áo');
  },
  // a tailor's dress form: padded linen torso with princess seams, wooden neck cap, stand pole
  drawForm3(c, s, mx) {
    const H = [[3.2, -1.2], [8, 1.4], [12.6, 4.2], [14.4, 8], [13.9, 13], [13.6, 18.5], [14.3, 24.5], [12.6, 32], [10.6, 39], [12.6, 47], [14.4, 55], [14.2, 61]];
    const pts = H.map(([x, y]) => ({ x: x * s * mx, y: y * s })).concat(H.slice().reverse().map(([x, y]) => ({ x: -x * s * mx, y: y * s })));
    const smooth = () => {
      c.beginPath(); c.moveTo((pts[0].x + pts[pts.length - 1].x) / 2, (pts[0].y + pts[pts.length - 1].y) / 2);
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; c.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2); }
      c.closePath();
    };
    // stand
    const pg = c.createLinearGradient(-1.4 * s, 0, 1.4 * s, 0); pg.addColorStop(0, '#4a2f1e'); pg.addColorStop(0.5, '#8a5d3b'); pg.addColorStop(1, '#4a2f1e');
    c.fillStyle = pg; c.fillRect(-1.3 * s, 58 * s, 2.6 * s, 40 * s);
    // torso
    smooth();
    const g = c.createLinearGradient(-15 * s * mx, 0, 15 * s * mx, 0);
    g.addColorStop(0, '#c9b08d'); g.addColorStop(0.32, '#f4e8d6'); g.addColorStop(0.55, '#ead9bf'); g.addColorStop(1, '#bfa47f');
    c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(90,60,35,0.45)'; c.lineWidth = 0.35 * s; c.stroke();
    c.save(); smooth(); c.clip();
    // princess and side seams, piped in a darker tape
    c.strokeStyle = 'rgba(110,80,50,0.4)'; c.lineWidth = 0.3 * s;
    for (const m of [-1, 1]) {
      c.beginPath(); c.moveTo(m * 6 * s * mx, 1.5 * s); c.bezierCurveTo(m * 7.4 * s * mx, 22 * s, m * 4.6 * s * mx, 34 * s, m * 6.2 * s * mx, 62 * s); c.stroke();
    }
    c.beginPath(); c.moveTo(0, -1 * s); c.lineTo(0, 62 * s); c.strokeStyle = 'rgba(110,80,50,0.22)'; c.stroke();
    c.fillStyle = 'rgba(90,60,35,0.06)'; for (let y = 0; y < 62; y += 1.2) c.fillRect(-16 * s * mx, y * s, 32 * s * mx, 0.15 * s);
    c.restore();
    // bottom rim and wooden neck cap
    c.beginPath(); c.ellipse(0, 61 * s, 14.2 * s * mx, 1.6 * s, 0, 0, Math.PI); c.fillStyle = '#7a5236'; c.fill();
    c.beginPath(); c.ellipse(0, -1.4 * s, 3.3 * s, 1.3 * s, 0, 0, 7);
    const cg = c.createLinearGradient(-3.3 * s, 0, 3.3 * s, 0); cg.addColorStop(0, '#7a5236'); cg.addColorStop(0.5, '#c08d5a'); cg.addColorStop(1, '#7a5236');
    c.fillStyle = cg; c.fill();
  },
  // a flat cut piece in its fabric, fitted into a w×h box centred on (cx, cy)
  drawFlat(c, p, cx, cy, w, h) {
    const q = p.base, k = Math.min(w / q.w, h / q.h), f = G.CAT.FABRICS[p.fabric];
    c.save(); c.translate(cx - (q.w * k) / 2, cy - (q.h * k) / 2);
    c.beginPath(); q.poly.forEach((v, n) => (n ? c.lineTo(v.x * k, v.y * k) : c.moveTo(v.x * k, v.y * k))); c.closePath();
    c.save(); c.shadowColor = 'rgba(0,0,0,0.3)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = '#000'; c.fill(); c.restore();
    c.save(); c.clip(); c.beginPath(); c.rect(-5, -5, q.w * k + 10, q.h * k + 10); if (f) G.art.fillFabric(c, f.mat, f.color, 18 * k, f.print); c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.2; c.stroke();
    c.restore();
  },
  stitchPath(c, st, w, tf) {
    c.lineCap = 'round';
    // stitches off the line get a glow under the thread, by the seam grades: amber = not good (<95%), red = bad (<90%)
    c.lineWidth = w * 2.6;
    for (let k = 1; k < st.length; k++) {
      if (st[k].q >= 0.95) continue;
      const a = tf ? tf(st[k - 1]) : st[k - 1], b = tf ? tf(st[k]) : st[k];
      c.strokeStyle = st[k].q < 0.9 ? 'rgba(217,83,79,0.55)' : 'rgba(224,170,60,0.45)';
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    }
    c.lineWidth = w;
    for (let k = 1; k < st.length; k++) {
      const a = tf ? tf(st[k - 1]) : st[k - 1], b = tf ? tf(st[k]) : st[k];
      c.strokeStyle = st[k].q < 0.6 ? '#d9534f' : this.thread;
      c.beginPath();
      c.moveTo(a.x + (b.x - a.x) * 0.18, a.y + (b.y - a.y) * 0.18);
      c.lineTo(b.x - (b.x - a.x) * 0.18, b.y - (b.y - a.y) * 0.18);
      c.stroke();
    }
  },
  pin(c, x, y, col) {
    c.strokeStyle = '#b9bcc2'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + 9, y + 9); c.stroke();
    c.beginPath(); c.arc(x, y, 4.2, 0, 7); c.fillStyle = col; c.fill();
    c.beginPath(); c.arc(x - 1.2, y - 1.4, 1.3, 0, 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  },
  drawForm(c) {
    const U = G.UI, j = this.j, asm = this.asm, done = this.allDone();
    G.art.tableBg(c);
    c.save();
    c.beginPath(); c.rect(0, 50, 900, G.H - 50); c.clip();
    c.translate(this.ovx, this.ovy); c.scale(this.oz, this.oz); c.translate(-this.ocx, -this.ocy);
    G.art.garment(c, asm, G.jobFabs(), { trousers: false, buttons: done, still: true });
    c.restore();
    // seams: sewn ones show the real stitches, the selected one glows
    asm.seams.forEach((sm, i) => {
      const P = sm.pts.map((q) => this.toScreen(q));
      if (this.sd[i]) {
        const th = this.thread; if (this.sd[i].byHelper) this.thread = '#6f8fa0'; // the helper's thread
        const st = this.ripAnim && this.ripAnim.i === i ? this.sd[i].stitches.slice(this.ripAnim.popped) : this.sd[i].stitches;
        if (st.length > 1) this.stitchPath(c, st, 2.6, (q) => this.toScreen(q));
        this.thread = th;
        if (this.ripAnim && this.ripAnim.i === i && st.length) {
          // the ripper itself, at the stitch it is cutting
          const q = this.toScreen(st[0]);
          c.save(); c.translate(q.x, q.y); c.rotate(-0.7);
          c.fillStyle = '#c2414b'; G.rr(c, 6, -4, 26, 8, 4); c.fill();
          c.strokeStyle = '#d7dadf'; c.lineWidth = 2; c.beginPath(); c.moveTo(6, 0); c.lineTo(-8, 0); c.stroke();
          c.beginPath(); c.arc(-8, -2, 2.5, 0, 7); c.fillStyle = '#e8eaed'; c.fill();
          c.restore();
        }
        return;
      }
      if (i === this.sel) {
        c.save(); c.strokeStyle = `rgba(178,50,63,${0.35 + Math.sin(this.t * 5) * 0.15})`; c.lineWidth = 12; c.lineCap = 'round';
        c.beginPath(); P.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke(); c.restore();
      }
      c.setLineDash([5, 6]); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2;
      c.beginPath(); P.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke(); c.setLineDash([]);
      // pins hold the pieces on the form until they are sewn
      const cols = ['#c2414b', '#3f7fbf', '#e0b23c'];
      for (let k = 1; k < 4; k++) { const q = P[Math.floor((P.length - 1) * k / 4)]; this.pin(c, q.x - 5, q.y - 5, cols[(i + k) % 3]); }
    });

    for (const b of this.bits || []) {
      c.save(); c.globalAlpha = 1 - b.t / b.life; c.translate(b.x, b.y); c.rotate(b.a);
      c.strokeStyle = this.thread; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(0, 2, 3, 0); c.stroke();
      c.restore();
    }
    const x = 910;
    U.card(c, x, 66, 350, 570);
    U.title(c, 'Đường may', x + 24, 102);
    G.wrap(c, 'Các mảnh đã ghim lên ma-nơ-canh. Chọn một đường may rồi đưa vải qua máy.', x + 24, 130, 300, 21, { size: 14, color: U.T.soft });
    // rows tighten when a design has many seams, so the list always ends above the buttons
    const rowH = Math.min(40, 226 / asm.seams.length);
    let y = 186 + rowH / 2;
    asm.seams.forEach((sm, i) => {
      const d = this.sd[i], on = i === this.sel;
      G.ui.hits.push({ id: 'seam' + i, x: x + 14, y: y - rowH / 2 + 1, w: 322, h: rowH - 2, enabled: true, cb: () => { this.sel = i; } });
      if (on) { G.rr(c, x + 14, y - rowH / 2 + 1, 322, rowH - 2, 10); c.fillStyle = '#f6e6d6'; c.fill(); }
      G.text(c, (d ? '✓ ' : '• ') + sm.name, x + 28, y, { size: rowH < 34 ? 14 : 15, weight: on ? 800 : 600, color: d ? U.T.ok : on ? U.T.accent : U.T.ink });
      const gr = d && this.grade(d.score);
      G.text(c, d ? `${gr.label} · ${this.pct(d.score)}%${d.byHelper ? ' ✋' : ''}` : 'chưa may', x + 322, y, { size: 13, weight: d ? 800 : 500, align: 'right', color: d ? gr.col : U.T.soft });
      y += rowH;
    });
    const sd = this.sd[this.sel];
    if (sd) G.button(c, 'rip', '✂ Tháo chỉ, may lại', x + 24, 432, 302, 46, () => { if (!this.ripAnim) this.ripAnim = { i: this.sel, n: sd.stitches.length, t: 0, popped: 0 }; }, { style: 'ghost', size: 16, r: 23, enabled: !this.ripAnim });
    else G.button(c, 'go', `May “${asm.seams[this.sel].name}”`, x + 24, 432, 302, 50, () => this.startSeam(this.sel), { size: 17, r: 25 });
    // the helper re-sews a seam you already sewed (never instead of you)
    const h = G.staff.current(), left = G.staff.helpLeft(j);
    if (h && sd && !sd.byHelper && left > 0 && sd.score < G.staff.skill()) {
      G.button(c, 'help', `🧑‍🔧 Nhờ ${h.name} may lại (còn ${left})`, x + 24, 486, 302, 40, () => {
        const score = G.staff.helpScore();
        this.sd[this.sel] = { stitches: sd.stitches, score, byHelper: true };
        j.sew[this.sel] = score; j.helped = (j.helped || 0) + 1; G.state.staff.helped++;
        G.sfx.done(); G.toast(`${h.name}: “${G.pick(h.lines)}”`);
      }, { style: 'ghost', size: 14, r: 20 });
    } else if (h && !G.staff.working()) G.text(c, `${h.name} đang nghỉ không lương`, x + 24, 506, { size: 13, color: U.T.soft });
    G.text(c, `Máy: ${G.tool('machine').name}`, x + 24, 560, { size: 13, color: U.T.soft });
    if (done) {
      const avg = this.sd.reduce((a, d) => a + d.score, 0) / this.sd.length;
      G.text(c, `Trung bình: ${this.pct(avg)}%`, x + 24, 614, { size: 18, weight: 800, color: U.T.accent });
    }
    // with an iron in the shop, the dress is pressed before decorating
    const hasIron = (G.state.tools.iron || 0) > 0;
    U.primary(c, 'next', hasIron ? 'Ủi áo →' : 'Trang trí →', () => { j.sew = this.sd.map((d) => d.score); G.go(hasIron ? 'iron' : 'decorate'); }, done);
    const rough = G.job.com.reqs.some((r) => r.type === 'qmax'); // a costume that must look poorly made
    const bad = this.sd.some((d) => d && this.grade(d.score).key === 'te');
    U.hint(c, rough && !done ? 'Khách muốn áo trông xuề xoà — cứ may lệch, xiêu vẹo một chút!' : bad && !rough ? 'Có đường “May tệ” (dưới 90%) — nên tháo chỉ may lại, khách sẽ chê' : done ? 'Đã may xong. Có thể tháo chỉ đường nào chưa ưng để may lại.' : 'Bấm đường may trên áo hoặc trong danh sách • Enter để bắt đầu may');
    U.topbar(c, 'May áo');
  },
  drawMachine(c) {
    const U = G.UI, m = this.m, N = this.N, z = this.Z, P = this.paths[this.sel], B = this.baked;
    G.art.tableBg(c);
    c.save();
    c.beginPath(); c.rect(0, 50, 900, G.H - 50); c.clip();
    // the bed of a vintage black-enamel machine: gold pinstripe, chrome throat plate and bobbin slide
    G.rr(c, 70, 150, 820, 660, 30);
    const bed = c.createLinearGradient(0, 150, 0, 720); bed.addColorStop(0, '#34302d'); bed.addColorStop(1, '#161413');
    c.fillStyle = bed; c.fill();
    G.rr(c, 84, 164, 792, 640, 22); c.strokeStyle = 'rgba(214,176,90,0.55)'; c.lineWidth = 1.6; c.stroke();
    const chrome = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#8f949b'); g.addColorStop(0.45, '#f1f3f5'); g.addColorStop(0.6, '#c6cad0'); g.addColorStop(1, '#7d8289'); return g; };
    G.rr(c, N.x - 84, N.y - 50, 168, 112, 10); c.fillStyle = chrome(N.x - 84, N.x + 84); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#5d6168'; for (const k of [-1, 1]) { G.rr(c, N.x + k * 16 - 3, N.y - 20, 6, 44, 3); c.fill(); }
    for (const [sx, sy] of [[N.x - 66, N.y - 34], [N.x + 66, N.y + 46]]) { c.beginPath(); c.arc(sx, sy, 5, 0, 7); c.fillStyle = '#a9adb3'; c.fill(); c.strokeStyle = '#6f737a'; c.beginPath(); c.moveTo(sx - 3, sy); c.lineTo(sx + 3, sy); c.stroke(); }
    G.rr(c, N.x - 70, N.y + 74, 140, 74, 8); c.fillStyle = chrome(N.x - 70, N.x + 70); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.moveTo(N.x - 70, N.y + 111); c.lineTo(N.x + 70, N.y + 111); c.stroke();
    // the fabric, moved and rotated about the needle
    c.save();
    c.translate(N.x, N.y); c.rotate(m.th); c.scale(z, z); c.translate(-m.n.x, -m.n.y);
    // the second layer being joined peeks out along the seam
    const col = (G.DATA.colors[G.jobFabs().than.color] || { hex: '#b71c1c' }).hex;
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = col; c.lineWidth = 2.2;
    c.beginPath(); P.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.28)'; c.stroke();
    c.save(); c.shadowColor = 'rgba(40,25,15,0.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
    c.drawImage(B.cv, B.x0, B.y0, B.cv.width / B.R, B.cv.height / B.R);
    c.restore();
    // remaining seam line ("marching ants"), stitches already sewn
    const rest = P.slice(m.idx);
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(40,25,20,0.35)'; c.lineWidth = 0.26;
    c.beginPath(); rest.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke();
    c.setLineDash([0.45, 0.35]); c.lineDashOffset = -this.t * 1.6;
    c.strokeStyle = 'rgba(255,255,255,0.95)'; c.lineWidth = 0.13;
    c.beginPath(); rest.forEach((q, n) => (n ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke();
    c.setLineDash([]);
    const end = P[P.length - 1];
    c.beginPath(); c.arc(end.x, end.y, 0.28, 0, 7); c.fillStyle = U.T.bad; c.fill();
    // corners ahead: an orange ring with a turning arrow
    const near = (this.corners[this.sel] || []).find((k) => k.idx > m.idx - 2);
    for (const k of this.corners[this.sel] || []) {
      if (k.idx < m.idx - 2) continue;
      const q = P[k.idx], close = k === near && (k.idx - m.idx) * 0.2 < 1.8, pr = 0.62 + (close ? Math.sin(this.t * 9) * 0.1 : 0);
      c.beginPath(); c.arc(q.x, q.y, pr, 0, 7); c.fillStyle = 'rgba(240,150,40,0.18)'; c.fill();
      c.strokeStyle = '#e8902a'; c.lineWidth = 0.09; c.stroke();
      c.beginPath(); c.arc(q.x, q.y, pr * 0.55, -0.4, Math.PI * 1.3); c.lineWidth = 0.07; c.stroke();
      const ax = q.x + Math.cos(Math.PI * 1.3) * pr * 0.55, ay = q.y + Math.sin(Math.PI * 1.3) * pr * 0.55;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 0.16, ay - 0.04); c.lineTo(ax + 0.03, ay + 0.15); c.closePath(); c.fillStyle = '#e8902a'; c.fill();
    }
    this.cornerNear = near && (near.idx - m.idx) * 0.2 < 1.8 ? near : null;
    this.stitchPath(c, m.st.concat([{ x: m.n.x, y: m.n.y, q: m.st[m.st.length - 1].q }]), 0.2);
    c.restore();
    // lamp light around the needle
    const lg = c.createRadialGradient(N.x, N.y, 10, N.x, N.y, 300);
    lg.addColorStop(0, 'rgba(255,246,220,0.28)'); lg.addColorStop(1, 'rgba(255,246,220,0)');
    c.fillStyle = lg; c.fillRect(0, 50, 900, G.H);
    this.drawHands(c, N, m);
    // one needle stroke per stitch: down as the stitch is laid, up between (the take-up lever moves with it)
    const moving = m.vel > 0.03, ph = moving ? (m.acc / 0.3) * Math.PI * 2 : Math.PI;
    const bob = Math.cos(ph) * 6, shake = (moving ? Math.sin(this.t * 95) * 0.7 * (m.vel / this.SPEEDS[2]) : 0) + (m.snag ? Math.sin(this.t * 61) * 2.4 : 0);
    // coming up to a sharp corner: coach the stop-and-turn (and slowing down)
    if (this.cornerNear && !m.snag && !m.fail && !m.done) {
      U.outlined(c, m.vel > 0.03 ? 'Góc gắt! Dừng máy ở góc' : 'Xoay vải (A/D) cho nét đứt thẳng vào kim', N.x, N.y + 74, { size: 17, align: 'center', color: '#c86a10', halo: '#fff8ec', lw: 5 });
      if (this.lvl === 2) U.outlined(c, 'Giảm tốc (S)', N.x, N.y + 98, { size: 14, align: 'center', color: '#c86a10', halo: '#fff8ec', lw: 4 });
    }
    // the thread is catching: a red pulse around the needle and a nudge to steer back
    if (m.snag && !m.fail) {
      const pr = 34 + Math.sin(this.t * 14) * 5;
      c.beginPath(); c.arc(N.x, N.y, pr, 0, 7); c.strokeStyle = `rgba(226,66,79,${0.55 + Math.sin(this.t * 14) * 0.25})`; c.lineWidth = 4; c.stroke();
      U.outlined(c, m.off > 0 ? 'Chỉ vướng! Lái sang phải →' : '← Chỉ vướng! Lái sang trái', N.x, N.y + 74, { size: 18, align: 'center', color: '#c2283a', halo: '#fff8ec', lw: 5 });
    }
    c.save(); c.translate(0, shake);
    this.drawHead(c, N, ph, bob, chrome);
    c.restore();
    c.restore();
    // banners
    if (m.fail) this.banner(c, 'Vải trượt khỏi đường may — may lại', U.T.bad);
    if (m.done && this.sd[this.sel]) this.drawStamp(c, this.sd[this.sel].score);
    for (const p of this.parts) {
      const a = 1 - p.t / p.life;
      c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.t * 8);
      c.fillStyle = p.col; c.beginPath();
      for (let k = 0; k < 10; k++) { const r = k % 2 ? 2.6 : 6.5, an = (k * Math.PI) / 5 - Math.PI / 2; c.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
      c.closePath(); c.fill(); c.restore();
    }

    // HUD
    const x = 910, live = this.pct(this.live());
    U.card(c, x, 66, 350, 570);
    U.title(c, this.asm.seams[this.sel].name, x + 24, 102);
    G.text(c, 'Chất lượng đường may', x + 24, 140, { size: 13, weight: 600, color: U.T.soft });
    const vg = this.grade(this.live());
    G.text(c, `${live}%`, x + 24, 180, { size: 40, weight: 800, color: vg.col });
    G.text(c, vg.label, x + 326, 180, { size: 16, weight: 800, align: 'right', color: vg.col }); // live verdict while sewing
    const prog = m.idx / (P.length - 1);
    G.rr(c, x + 24, 214, 302, 10, 5); c.fillStyle = '#eadfcd'; c.fill();
    G.rr(c, x + 24, 214, Math.max(10, 302 * prog), 10, 5); c.fillStyle = U.T.accent; c.fill();
    // drift gauge: where the line is relative to the needle
    G.text(c, 'Độ lệch kim', x + 24, 258, { size: 13, weight: 600, color: U.T.soft });
    const gx = x + 24, gw = 302, gy = 278, cx = gx + gw / 2;
    G.rr(c, gx, gy - 7, gw, 14, 7); c.fillStyle = '#eadfcd'; c.fill();
    const okw = (this.dead() + 0.3) / this.FAIL * (gw / 2); // green = stitches that still score ~75%+
    G.rr(c, cx - okw, gy - 7, okw * 2, 14, 7); c.fillStyle = 'rgba(79,138,91,0.35)'; c.fill();
    const mx = cx + G.clamp(m.off / this.FAIL, -1, 1) * (gw / 2);
    c.beginPath(); c.arc(mx, gy, 8, 0, 7); c.fillStyle = Math.abs(m.off) > this.FAIL * 0.6 ? U.T.bad : U.T.ink; c.fill();
    c.fillStyle = U.T.ink; c.fillRect(cx - 1, gy - 12, 2, 24);
    // speed
    // speed: a tortoise-to-hare slider (fast feeds quickly but corners get much harder)
    G.text(c, 'Tốc độ máy (W/S)', x + 24, 326, { size: 13, weight: 600, color: U.T.soft });
    const s0 = x + 70, s1 = x + 280, sy2 = 362;
    G.text(c, '🐢', x + 36, sy2, { size: 24, align: 'center' }); G.text(c, '🐇', x + 314, sy2, { size: 24, align: 'center' });
    G.rr(c, s0, sy2 - 6, s1 - s0, 12, 6); c.fillStyle = '#eadfcd'; c.fill();
    const kx = s0 + ((s1 - s0) * this.lvl) / 2;
    G.rr(c, s0, sy2 - 6, kx - s0 + 6, 12, 6); c.fillStyle = ['#7fae86', '#d9a441', '#d65a67'][this.lvl]; c.fill();
    this.SPEED_NAMES.forEach((nm, i) => {
      const px = s0 + ((s1 - s0) * i) / 2;
      G.ui.hits.push({ id: 'sp' + i, x: px - 30, y: sy2 - 22, w: 60, h: 44, enabled: true, cb: () => { this.lvl = i; G.sfx.click(); } });
      G.text(c, nm, px, sy2 + 26, { size: 12, weight: i === this.lvl ? 800 : 600, font: G.GAME, align: 'center', color: i === this.lvl ? U.T.ink : U.T.soft });
    });
    c.beginPath(); c.arc(kx, sy2, 13, 0, 7); c.fillStyle = '#fffaf0'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.2; c.stroke();
    G.wrap(c, G.touchUI ? 'Giữ ngón tay trên vải để chạy máy, rê sang trái/phải để nét đứt luôn chạy thẳng vào kim. Nhấc tay để dừng và chỉnh vải.' : 'Giữ Space hoặc giữ chuột để chạy máy. Lái vải bằng A/D hoặc kéo chuột sang trái/phải để nét đứt luôn chạy thẳng vào kim. Thả ra để dừng và chỉnh vải.', x + 24, 452, 300, 21, { size: 13, color: U.T.soft, maxLines: 4 });
    G.button(c, 'leave', '← Về ma-nơ-canh', x + 24, 568, 302, 46, () => { this.mode = 'form'; }, { style: 'ghost', size: 15, r: 23 });
    U.hint(c, m.run ? 'Máy đang chạy…' : G.touchUI ? 'Giữ ngón tay để may • rê trái phải để lái • nhấc tay để dừng' : 'Giữ Space / giữ chuột để may • A/D hoặc kéo chuột để lái • W/S tốc độ • Esc để dừng');
    U.topbar(c, 'Máy may');
  },
  // the tailor's hands flat on the cloth either side of the foot: they lean with the steering and
  // give a little push with every stitch while the machine runs
  drawHands(c, N, m) {
    const K = G.keys, steer = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0) + (m.mouse ? G.clamp((G.pointer.x - (this.lastX || G.pointer.x)) * 0.2, -1, 1) : 0);
    this.handLean = G.lerp(this.handLean || 0, steer, 0.15);
    const push = m.vel > 0.03 ? Math.sin((m.acc / 0.3) * Math.PI * 2) * 3 : 0, snagJit = m.snag ? Math.sin(this.t * 50) * 1.5 : 0;
    for (const side of [-1, 1]) {
      c.save(); c.globalAlpha = 0.96;
      // well out to the sides and toward the player, so the seam line ahead stays clear
      c.translate(N.x + side * 200 + this.handLean * 10, N.y + 300 - push + snagJit);
      c.rotate(-side * 0.42 + this.handLean * 0.12); // fingertips lean in toward the needle
      // soft shadow on the cloth
      c.save(); c.translate(5, 8); c.beginPath(); c.ellipse(0, 4, 30, 40, 0, 0, 7); c.fillStyle = 'rgba(40,25,15,0.2)'; c.filter = 'blur(6px)'; c.fill(); c.restore();
      // just the cuff of the tailor's blouse, fading toward the edge of the view
      const sg = c.createLinearGradient(-28, 0, 28, 0); sg.addColorStop(0, '#d9c7a6'); sg.addColorStop(0.5, '#f3e8d4'); sg.addColorStop(1, '#cbb592');
      c.fillStyle = sg; G.rr(c, -27, 34, 54, 74, 10); c.fill();
      c.fillStyle = 'rgba(120,90,60,0.25)'; c.fillRect(-27, 41, 54, 3);
      // the back of a hand lying flat, seen from above: fingers together toward the needle, thumb tucked along the inner edge
      const skin = c.createLinearGradient(-22, 0, 22, 0); skin.addColorStop(0, '#d8a985'); skin.addColorStop(0.5, '#f5dac1'); skin.addColorStop(1, '#d4a37f');
      c.fillStyle = skin; c.strokeStyle = 'rgba(140,90,60,0.4)'; c.lineWidth = 1.1;
      c.save(); c.translate(-side * 15, 6); c.rotate(-side * 0.32);
      c.beginPath(); c.moveTo(-5, 10); c.lineTo(-5.5, -14); c.quadraticCurveTo(0, -24, 5.5, -14); c.lineTo(5, 10); c.closePath(); c.fill(); c.stroke();
      c.restore();
      c.beginPath();
      c.moveTo(-15, 36); c.bezierCurveTo(-18, 18, -19, 0, -18, -14);
      c.bezierCurveTo(-17, -40, -9, -50, 0, -51); c.bezierCurveTo(9, -50, 17, -40, 18, -14);
      c.bezierCurveTo(19, 0, 18, 18, 15, 36); c.closePath(); c.fill(); c.stroke();
      // finger partings, knuckles and nails
      c.strokeStyle = 'rgba(140,90,60,0.32)'; c.lineWidth = 1;
      for (const [fx, top] of [[-8.6, -44], [0, -50], [8.6, -45]]) { c.beginPath(); c.moveTo(fx, top + 1); c.lineTo(fx * 0.92, -18); c.stroke(); }
      c.fillStyle = 'rgba(160,105,75,0.16)'; for (const kx of [-12.5, -4.3, 4.3, 12.5]) { c.beginPath(); c.ellipse(kx, -8, 3.2, 2, 0, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(255,240,230,0.7)'; for (const [nx, ny] of [[-12.6, -38], [-4.3, -45], [4.3, -45], [12.6, -39]]) { c.beginPath(); c.ellipse(nx, ny, 2.6, 3.4, 0, 0, 7); c.fill(); }
      c.restore();
    }
  },
  // vintage black-enamel machine: arm with gold decals, chrome face plate, spool, tension dial,
  // take-up lever, needle bar, presser foot and the hand wheel, with the thread running through it all
  drawHead(c, N, ph, bob, chrome) {
    const m = this.m, GOLD = '#d6b05a';
    const enamel = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#45403c'); g.addColorStop(0.18, '#24211f'); g.addColorStop(1, '#0f0e0d'); return g; };
    // hand wheel (turns with the fabric feed)
    c.save(); c.translate(884, 146);
    c.beginPath(); c.arc(0, 0, 58, 0, 7); c.fillStyle = chrome(-58, 58); c.fill();
    c.beginPath(); c.arc(0, 0, 46, 0, 7); c.fillStyle = '#1b1918'; c.fill();
    c.rotate(m.wheel); c.strokeStyle = '#9ea3aa'; c.lineWidth = 6; c.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.beginPath(); c.moveTo(Math.cos(a) * 10, Math.sin(a) * 10); c.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); c.stroke(); }
    c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fillStyle = chrome(-11, 11); c.fill();
    c.restore();
    // arm
    c.save(); c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 26; c.shadowOffsetY = 12;
    G.rr(c, N.x + 30, 86, 880 - N.x, 112, 46); c.fillStyle = enamel(86, 198); c.fill();
    G.rr(c, N.x - 76, 66, 152, N.y - 144, 30); c.fillStyle = enamel(66, N.y - 78); c.fill();
    c.restore();
    G.rr(c, N.x + 70, 92, 760 - N.x, 12, 6); c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill();
    c.strokeStyle = GOLD; c.lineWidth = 1.6;
    for (const y of [106, 184]) { c.beginPath(); c.moveTo(N.x + 84, y); c.lineTo(860, y); c.stroke(); }
    // gold scroll decal and the shop's name
    const dx = N.x + 250, dy = 146;
    c.lineWidth = 2; c.lineCap = 'round';
    for (const sd of [-1, 1]) {
      c.beginPath(); c.moveTo(dx + sd * 74, dy); c.bezierCurveTo(dx + sd * 104, dy - 26, dx + sd * 140, dy + 20, dx + sd * 168, dy - 4); c.stroke();
      c.beginPath(); c.arc(dx + sd * 170, dy - 10, 6, 0, Math.PI * 1.6); c.stroke();
      c.beginPath(); c.moveTo(dx + sd * 96, dy - 4); c.quadraticCurveTo(dx + sd * 112, dy + 18, dx + sd * 128, dy + 8); c.stroke();
      for (const k of [0, 1, 2]) { c.beginPath(); c.arc(dx + sd * (130 + k * 14), dy + 22 - k * 2, 1.8, 0, 7); c.fillStyle = GOLD; c.fill(); }
    }
    G.text(c, 'Tiệm May', dx, dy + 1, { size: 24, font: G.SERIF, weight: 700, align: 'center', color: '#e8c771' });
    // spool on its pin, and a thread guide
    const spx = N.x + 200;
    c.fillStyle = '#9da1a8'; c.fillRect(spx - 2, 56, 4, 32);
    c.fillStyle = '#b07a43'; G.rr(c, spx - 22, 52, 44, 7, 3); c.fill(); G.rr(c, spx - 22, 80, 44, 7, 3); c.fill();
    const tg = c.createLinearGradient(spx - 18, 0, spx + 18, 0); tg.addColorStop(0, 'rgba(0,0,0,0.35)'); tg.addColorStop(0.4, 'rgba(255,255,255,0.25)'); tg.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = this.thread; c.fillRect(spx - 18, 59, 36, 21); c.fillStyle = tg; c.fillRect(spx - 18, 59, 36, 21);
    c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 0.8; for (let y = 61; y < 80; y += 2.5) { c.beginPath(); c.moveTo(spx - 18, y); c.lineTo(spx + 18, y + 1); c.stroke(); }
    c.beginPath(); c.arc(N.x + 70, 88, 4, 0, 7); c.fillStyle = chrome(N.x + 66, N.x + 74); c.fill();
    // face plate
    G.rr(c, N.x - 58, 78, 116, 88, 16); c.fillStyle = chrome(N.x - 58, N.x + 58); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = 'rgba(80,84,90,0.35)'; c.lineWidth = 1;
    for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(N.x, 122, 14 + k * 11, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); c.beginPath(); c.arc(N.x, 122, 14 + k * 11, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
    c.beginPath(); c.arc(N.x, 122, 5, 0, 7); c.fillStyle = '#7d8289'; c.fill();
    // tension dial on the side of the head
    const tx = N.x - 84, ty = 140;
    c.beginPath(); c.arc(tx, ty, 14, 0, 7); c.fillStyle = chrome(tx - 14, tx + 14); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.stroke();
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; c.beginPath(); c.moveTo(tx + Math.cos(a) * 9, ty + Math.sin(a) * 9); c.lineTo(tx + Math.cos(a) * 13, ty + Math.sin(a) * 13); c.stroke(); }
    // take-up lever bobbing with the needle
    const ly = 112 - Math.cos(ph) * 10;
    G.rr(c, N.x - 74, ly - 4, 30, 8, 4); c.fillStyle = chrome(N.x - 74, N.x - 44); c.fill();
    c.beginPath(); c.arc(N.x - 70, ly, 3, 0, 7); c.fillStyle = '#2a2826'; c.fill();
    // needle bar, presser bar and foot
    const nb = N.y + bob;
    // seen slightly from the side: the bars lean in from the head, so the fresh stitches behind the needle stay visible
    const bar = (x0, x1, y0, xb0, xb1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y0); c.lineTo(xb1, y1); c.lineTo(xb0, y1); c.closePath(); c.fill(); };
    c.fillStyle = chrome(N.x - 30, N.x + 6); bar(N.x - 30, N.x - 18, 166, N.x - 6, N.x + 6, nb - 30);
    G.rr(c, N.x - 9, nb - 34, 18, 12, 3); c.fill();
    c.fillStyle = chrome(N.x + 24, N.x + 40); bar(N.x + 30, N.x + 40, 166, N.x + 14, N.x + 22, N.y - 24);
    c.save(); c.globalAlpha = 0.95;
    c.fillStyle = chrome(N.x - 26, N.x + 26);
    G.rr(c, N.x - 26, N.y - 12, 18, 48, 8); c.fill(); G.rr(c, N.x + 8, N.y - 12, 18, 48, 8); c.fill();
    G.rr(c, N.x - 26, N.y - 26, 52, 16, 5); c.fill();
    c.restore();
    c.strokeStyle = '#d7dadf'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(N.x, nb - 24); c.lineTo(N.x, nb); c.stroke();
    // thread: spool → guide → tension → take-up eye → needle bar → needle eye
    c.strokeStyle = this.thread; c.lineWidth = 1.3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(spx, 56); c.lineTo(N.x + 70, 88); c.lineTo(tx, ty - 14); c.lineTo(tx - 8, ty + 6); c.lineTo(N.x - 70, ly); c.lineTo(N.x - 26, 168); c.lineTo(N.x - 4, nb - 30); c.lineTo(N.x + 1, nb - 6); c.stroke();
    // the lamp under the head
    const lg = c.createRadialGradient(N.x, 176, 2, N.x, 176, 40); lg.addColorStop(0, 'rgba(255,240,190,0.9)'); lg.addColorStop(1, 'rgba(255,240,190,0)');
    c.fillStyle = lg; c.fillRect(N.x - 40, 150, 80, 60);
  },
  // a round tailor's stamp thumped onto the seam: grade word, percentage, a ring of stitches
  drawStamp(c, score) {
    const sc = this.pct(score), t = this.stampT || 0;
    const gr = this.grade(score), grade = gr.label, col = gr.col;
    const k = t < 0.28 ? 1.9 - 0.9 * G.easeBack(t / 0.28) : 1, x = this.N.x, y = 470;
    if (!this.stampSfx && t > 0.2) { this.stampSfx = true; G.sfx.stamp(); }
    c.save(); c.translate(x, y); c.rotate(-0.14); c.scale(k, k); c.globalAlpha = Math.min(1, t * 6);
    c.beginPath(); c.arc(0, 0, 84, 0, 7); c.fillStyle = 'rgba(255,250,240,0.9)'; c.fill();
    c.lineWidth = 6; c.strokeStyle = col; c.stroke();
    c.setLineDash([7, 6]); c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.stroke(); c.setLineDash([]);
    G.text(c, `${sc}%`, 0, -10, { size: 42, weight: 800, font: G.GAME, align: 'center', color: col });
    G.text(c, grade.toUpperCase(), 0, 28, { size: 17, weight: 800, font: G.GAME, align: 'center', color: col });
    c.restore();
  },
  banner(c, text, col) {
    G.UI.card(c, this.N.x - 210, 600, 420, 60);
    G.text(c, text, this.N.x, 630, { size: 20, weight: 800, align: 'center', color: col });
  }
};

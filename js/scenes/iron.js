// Ironing (only once the shop owns an iron): the sewn dress lies on the board with a few creases from
// the machine; hold and sweep the iron over them. The iron's quality bonus counts only for what was pressed.
G.scenes.iron = {
  enter() {
    const j = G.job, a = j.asm, s = a.s;
    this.t = 0; this.pressing = false; this.steam = []; this.done = false; this.last = null;
    // creases: short wavy folds scattered over the body and flaps (garment units)
    const rnd = (a0, b0) => a0 + Math.random() * (b0 - a0), out = [];
    for (let tries = 0; out.length < 8 && tries < 400; tries++) {
      const p = { x: rnd(-16, 16) * s, y: rnd(8 * s, a.hemY * 0.86) };
      if (!G.geo.pointInPoly(p, a.body)) continue;
      if (out.some((w) => Math.hypot(w.x - p.x, w.y - p.y) < 9 * s)) continue;
      out.push({ x: p.x, y: p.y, len: rnd(13, 22) * s, ang: rnd(-0.5, 0.5) + (Math.random() < 0.3 ? Math.PI / 2 : 0), waves: 1, k: 1 });
    }
    this.creases = out;
  },
  view() {
    const asm = G.job.asm, z = Math.min(600 / (asm.botY - asm.topY), 3.4);
    return { asm, z, ox: 450, oy: 66 - asm.topY * z };
  },
  toCm(p) { const v = this.view(); return { x: (p.x - v.ox) / v.z, y: (p.y - v.oy) / v.z }; },
  pressed() { const c = this.creases; return c.length ? 1 - c.reduce((n, w) => n + w.k, 0) / c.length : 1; },
  down(p) { if (p.x < 860) { this.pressing = true; this.last = p; } },
  move(p) { if (this.pressing) this.last = p; },
  up() { this.pressing = false; },
  update(dt) {
    this.t += dt;
    const P = G.pointer;
    // the hot soleplate smooths creases under it; moving presses faster than standing still
    if (this.pressing && !this.done) {
      const cm = this.toCm(P), r = 8 * G.job.asm.s;
      const speed = this.prev ? Math.min(3, Math.hypot(P.x - this.prev.x, P.y - this.prev.y) / 6) : 0;
      for (const w of this.creases) {
        if (w.k <= 0) continue;
        if (Math.hypot(cm.x - w.x, cm.y - w.y) < r + w.len / 2) w.k = Math.max(0, w.k - dt * (0.9 + speed * 0.8));
      }
      if (Math.random() < dt * 22) this.steam.push({ x: P.x + G.rand(-30, 30), y: P.y - 10, vy: G.rand(-60, -30), vx: G.rand(-15, 15), t: 0, r: G.rand(6, 12) });
      if (this.pressed() > 0.97) { this.done = true; this.creases.forEach((w) => (w.k = 0)); G.sfx.good(); G.toast('Phẳng phiu!', G.C.green); }
    }
    this.prev = { x: P.x, y: P.y };
    for (const s of this.steam) { s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += dt * 14; }
    this.steam = this.steam.filter((s) => s.t < 1.2);
  },
  // a classic steam iron seen from above: pointed soleplate, coloured body, handle
  drawIron(c, x, y, hot) {
    c.save(); c.translate(x, y); c.rotate(-0.25);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(6, 10, 48, 26, 0, 0, 7); c.fill();
    const sole = () => { c.beginPath(); c.moveTo(-46, 22); c.lineTo(30, 22); c.quadraticCurveTo(52, 20, 58, 0); c.quadraticCurveTo(52, -20, 30, -22); c.lineTo(-46, -22); c.quadraticCurveTo(-52, 0, -46, 22); c.closePath(); };
    sole(); const g = c.createLinearGradient(0, -22, 0, 22); g.addColorStop(0, '#f2f4f6'); g.addColorStop(0.5, '#a9b0b8'); g.addColorStop(1, '#e3e7ea'); c.fillStyle = g; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
    if (hot) { sole(); c.fillStyle = 'rgba(255,120,60,0.18)'; c.fill(); }
    c.beginPath(); c.moveTo(-40, 16); c.lineTo(24, 16); c.quadraticCurveTo(42, 14, 46, 0); c.quadraticCurveTo(42, -14, 24, -16); c.lineTo(-40, -16); c.quadraticCurveTo(-44, 0, -40, 16); c.closePath();
    const b = c.createLinearGradient(0, -16, 0, 16); b.addColorStop(0, '#e46b74'); b.addColorStop(1, '#a8323f'); c.fillStyle = b; c.fill(); c.stroke();
    G.rr(c, -30, -5, 50, 10, 5); c.fillStyle = '#3a2a24'; c.fill();
    c.beginPath(); c.arc(30, 0, 4, 0, 7); c.fillStyle = hot ? '#ffcf6b' : '#7a6a62'; c.fill();
    c.restore();
  },
  draw(c) {
    const U = G.UI, j = G.job, v = this.view(), asm = v.asm;
    U.bg(c);
    // the ironing board: padded cover with a small print, metal edge
    // board seen from above, nose up: straight sides tapering into a rounded point, square foot
    const board = (dx, dy) => {
      const cx = 450 + dx, top = 62 + dy, bot = 712 + dy, hw = 250;
      c.beginPath(); c.moveTo(cx - hw, bot); c.lineTo(cx - hw, top + 230);
      c.bezierCurveTo(cx - hw, top + 90, cx - 90, top, cx, top);
      c.bezierCurveTo(cx + 90, top, cx + hw, top + 90, cx + hw, top + 230);
      c.lineTo(cx + hw, bot); c.closePath();
    };
    c.save();
    board(10, 10); c.fillStyle = 'rgba(40,20,10,0.25)'; c.fill();
    board(0, 0);
    const cg = c.createLinearGradient(200, 0, 700, 0); cg.addColorStop(0, '#c9d6df'); cg.addColorStop(0.5, '#e4ecf1'); cg.addColorStop(1, '#c2d0da'); c.fillStyle = cg; c.fill();
    c.strokeStyle = '#8c97a0'; c.lineWidth = 6; c.stroke();
    c.clip(); c.fillStyle = 'rgba(80,110,140,0.13)';
    for (let yy = 70; yy < 720; yy += 26) for (let xx = 200 + ((yy / 26) % 2) * 13; xx < 710; xx += 26) { c.beginPath(); c.arc(xx, yy, 2.4, 0, 7); c.fill(); }
    c.restore();
    // the dress laid flat, then its creases (each fades as it is pressed)
    c.save(); c.translate(v.ox, v.oy); c.scale(v.z, v.z);
    G.art.garment(c, asm, G.jobFabs(), { trousers: false, cache: true, still: true, decorItems: [] });
    c.save(); G.art.pathPoly(c, asm.body); c.clip();
    for (const w of this.creases) {
      if (w.k <= 0.01) continue;
      // a crumpled fold: a soft shadow valley beside a bright ridge, tapering at both ends
      const amp = 0.8 * asm.s * w.k;
      const line = (off, taper) => {
        c.beginPath();
        for (let i = 0; i <= 30; i++) {
          const u = i / 30 - 0.5, env = Math.cos(u * Math.PI), px = u * w.len, py = Math.sin(u * Math.PI * w.waves * 2) * amp * env + off * (taper ? env : 1);
          const x = w.x + px * Math.cos(w.ang) - py * Math.sin(w.ang), y = w.y + px * Math.sin(w.ang) + py * Math.cos(w.ang);
          i ? c.lineTo(x, y) : c.moveTo(x, y);
        }
      };
      c.lineCap = 'round';
      c.save(); c.filter = 'blur(2.5px)';
      line(0.9 * asm.s, true); c.strokeStyle = `rgba(40,15,10,${0.32 * w.k})`; c.lineWidth = 2.6 * asm.s; c.stroke();
      c.filter = 'blur(1px)';
      line(-0.5 * asm.s, true); c.strokeStyle = `rgba(255,250,245,${0.3 * w.k})`; c.lineWidth = 1.2 * asm.s; c.stroke();
      c.restore();
      line(0.25 * asm.s, true); c.strokeStyle = `rgba(40,15,10,${0.22 * w.k})`; c.lineWidth = 0.35 * asm.s; c.stroke();
    }
    c.restore(); c.restore();
    // steam, then the iron under the pointer while over the board
    for (const s of this.steam) { c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fillStyle = `rgba(255,255,255,${0.5 * (1 - s.t / 1.2)})`; c.fill(); }
    const P = G.pointer;
    if (P.x > 100 && P.x < 860 && P.y > 60) this.drawIron(c, P.x, P.y, this.pressing);
    // side panel
    const x = 880;
    U.card(c, x, 66, 380, 420);
    U.title(c, 'Ủi áo', x + 24, 104, { size: 24 });
    const tool = G.tool('iron'), pr = this.pressed();
    G.wrap(c, `Giữ và rê ${tool.name.toLowerCase()} qua các nếp nhăn. Ủi phẳng tới đâu, áo được cộng điểm tới đó (tối đa +${tool.bonus}).`, x + 24, 128, 330, 20, { size: 14, color: U.T.soft, maxLines: 4 });
    G.text(c, 'Độ phẳng', x + 24, 236, { size: 15, weight: 800 });
    G.rr(c, x + 24, 252, 330, 16, 8); c.fillStyle = '#eadfcd'; c.fill();
    G.rr(c, x + 24, 252, Math.max(10, 330 * pr), 16, 8); c.fillStyle = pr > 0.97 ? U.T.ok : U.T.gold; c.fill();
    G.text(c, `${Math.round(pr * 100)}% · +${Math.round(tool.bonus * pr)} chất lượng`, x + 24, 290, { size: 15, weight: 800, color: pr > 0.97 ? U.T.ok : U.T.ink });
    const rough = j.com.reqs.some((r) => r.type === 'qmax');
    if (rough) G.wrap(c, 'Khách muốn áo trông cũ, nhàu — có thể bỏ qua bước ủi.', x + 24, 318, 330, 18, { size: 13, color: '#8a6d4b', maxLines: 2 });
    const go = () => { j.pressed = this.pressed(); if (G.quests && j.pressed > 0.97) G.quests.event('ui'); G.go('decorate'); };
    U.primary(c, 'next', pr > 0.97 ? 'Trang trí →' : 'Xong, trang trí →', go);
    U.secondary(c, 'skip', 'Bỏ qua ủi', () => { j.pressed = 0; G.go('decorate'); });
    U.hint(c, G.touchUI ? 'Giữ ngón tay và rê bàn ủi qua nếp nhăn' : 'Giữ chuột và rê bàn ủi qua nếp nhăn');
    U.topbar(c, 'Ủi áo');
  }
};

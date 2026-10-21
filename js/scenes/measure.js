// Measure: drag the tape across the client at bust, waist and hips. Accuracy becomes the fit score.
G.scenes.measure = {
  enter() {
    const j = G.job;
    const male = !!j.com.male;
    this.asm = G.geo.build({ neck: 'dung', sleeve: 'dai', length: male ? 'nam' : 'got', hem: 'thang', fit: male ? 'nam' : 'om', slit: 'vua', buttons: 'an', male, broad: !!j.com.broad, look: (G.client(j.com.client) || {}).look }, G.jobScale(), false);
    const a = this.asm, s = a.s;
    // frame head to hips so the tape has room to be measured precisely
    this.z = 600 / (a.SY(72 * s) - a.topY);
    this.ox = 600; this.oy = 70 - a.topY * this.z;
    this.lines = [
      { key: 'bust', name: 'Vòng ngực', y: 23 * s },
      { key: 'waist', name: 'Vòng eo', y: a.SY(39 * s) },
      { key: 'hip', name: 'Vòng hông', y: a.SY(50 * s) }
    ].map((l) => Object.assign(l, this.edges(l.y)));
    this.cur = 0; this.drag = null; this.results = []; this.t = 0;
    j.fit = 1;
  },
  edges(y) {
    const p = this.asm.body; let lo = Infinity, hi = -Infinity;
    for (let i = 0, k = p.length - 1; i < p.length; k = i++) {
      const A = p[i], B = p[k];
      if ((A.y > y) !== (B.y > y)) { const x = A.x + ((y - A.y) * (B.x - A.x)) / (B.y - A.y); lo = Math.min(lo, x); hi = Math.max(hi, x); }
    }
    return { L: lo, R: hi };
  },
  sx(x) { return this.ox + x * this.z; },
  sy(y) { return this.oy + y * this.z; },
  down(p) {
    const l = this.lines[this.cur]; if (!l) return;
    if (Math.abs(p.y - this.sy(l.y)) > 40) return;
    this.drag = { x0: p.x, x1: p.x };
  },
  move(p) { if (this.drag) this.drag.x1 = Math.max(this.drag.x0, p.x); },
  up() {
    const d = this.drag; if (!d) return;
    this.drag = null;
    const l = this.lines[this.cur];
    if (d.x1 - d.x0 < 20) return;
    // what the tape reads: the real size, off by however far the tape fell short or ran past the body
    // (4 screen px ≈ 1 cm on every line, so the waist is no harder than the hips)
    const PX = 4, truth = G.job.com.measures[l.key], span = this.sx(l.R) - this.sx(l.L) || 1;
    const val = truth + Math.round((d.x1 - d.x0 - span) / PX);
    // the error, in cm: a wrong reading, plus starting off the body's edge
    const startCm = Math.abs(d.x0 - this.sx(l.L)) / PX;
    const errCm = Math.abs(val - truth) + startCm * 0.5;
    const score = G.clamp(1 - Math.max(0, errCm - 2) / 10, 0, 1);
    const v = this.verdict(errCm);
    this.results.push({ name: l.name, val, truth, err: Math.round(errCm), score, verdict: v, x0: d.x0, x1: d.x1, y: l.y });
    // the tape whips back into its case, leaving two chalk marks; the real edges show in green beside them
    this.retract = { x0: d.x0, x1: d.x1, y: this.sy(l.y), t: 0 };
    this.pop = { x: (d.x0 + d.x1) / 2, y: this.sy(l.y) - 40, t: 0, text: v.text + (v.key === 'ok' ? '' : ` · lệch ${Math.round(errCm)} cm`), col: v.col };
    G.sfx.snip(); G.sfx.done();
    this.cur++;
    if (this.cur >= this.lines.length) G.job.fit = this.results.reduce((a, r) => a + r.score, 0) / this.results.length;
  },
  // within 2 cm is right on (a few pixels of tape); up to 5 cm is a little off; more is wrong (the dress will not fit)
  verdict(errCm) {
    const T = G.UI.T;
    return errCm <= 2 ? { key: 'ok', text: 'Chuẩn!', col: T.ok } : errCm <= 5 ? { key: 'near', text: 'Hơi lệch', col: T.gold } : { key: 'off', text: 'Lệch rồi', col: T.bad };
  },
  update(dt) {
    this.t += dt;
    if (this.retract && (this.retract.t += dt) > 0.3) this.retract = null;
    if (this.pop && (this.pop.t += dt) > 1.2) this.pop = null;
  },
  draw(c) {
    const U = G.UI, j = G.job;
    U.bg(c);
    // model in a plain fitting slip
    c.save(); c.translate(this.ox, this.oy); c.scale(this.z, this.z);
    G.art.garment(c, this.asm, { mat: 'lua', color: 'be', print: 'tron' }, { mannequin: true, still: true, buttons: false });
    c.restore();
    // guide lines and recorded tapes
    this.lines.forEach((l, i) => {
      const y = this.sy(l.y), done = i < this.cur, active = i === this.cur;
      c.save(); c.setLineDash([6, 6]); c.strokeStyle = active ? 'rgba(178,50,63,0.9)' : 'rgba(61,43,37,0.25)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(this.sx(l.L) - 60, y); c.lineTo(this.sx(l.R) + 60, y); c.stroke(); c.restore();
      G.text(c, l.name, this.sx(l.R) + 70, y, { size: 15, weight: 700, color: active ? U.T.accent : U.T.soft });
      if (active && !this.drag) {
        const pulse = 1 + Math.sin(this.t * 6) * 0.2;
        c.beginPath(); c.arc(this.sx(l.L), y, 7 * pulse, 0, 7); c.fillStyle = 'rgba(178,50,63,0.6)'; c.fill();
      }
      if (done && !(this.retract && i === this.cur - 1)) {
        const r = this.results[i];
        // the body's real edges, so the player sees exactly where the tape should have started and stopped
        c.save(); c.strokeStyle = 'rgba(63,138,82,0.85)'; c.lineWidth = 3; c.lineCap = 'round';
        for (const ex of [this.sx(l.L), this.sx(l.R)]) { c.beginPath(); c.moveTo(ex, y - 16); c.lineTo(ex, y + 16); c.stroke(); }
        c.restore();
        this.chalk(c, r.x0, r.x1, y, `${r.val} cm`);
      }
    });
    if (this.drag) {
      // the live reading uses the same rule as the result (see up())
      const l = this.lines[this.cur], span = this.sx(l.R) - this.sx(l.L) || 1;
      this.tape(c, this.drag.x0, this.drag.x1, this.sy(l.y), `${G.job.com.measures[l.key] + Math.round((this.drag.x1 - this.drag.x0 - span) / 4)} cm`, true);
    }
    if (this.retract) {
      const r = this.retract, k = G.easeOut(r.t / 0.3);
      this.tape(c, r.x0, G.lerp(r.x1, r.x0 + 4, k), r.y, null, true);
    }
    if (this.pop) {
      const p = this.pop, sc = p.t < 0.25 ? G.easeBack(p.t / 0.25) : 1;
      c.save(); c.globalAlpha = Math.min(1, (1.2 - p.t) * 3); c.translate(p.x, p.y - p.t * 16); c.scale(sc, sc);
      U.outlined(c, p.text, 0, 0, { size: 24, align: 'center', color: p.col, halo: '#fff8ec', lw: 6 });
      c.restore();
    }
    // side card
    U.commission(c, 24, 70, 340);
    U.card(c, 880, 70, 376, 330);
    U.title(c, 'Số đo', 904, 104);
    this.lines.forEach((l, i) => {
      const r = this.results[i], ry = 150 + i * 58;
      G.text(c, l.name, 904, ry, { size: 16, weight: 600 });
      G.text(c, r ? `${r.val} cm` : '—', 1236, ry, { size: 18, weight: 800, align: 'right', color: r ? r.verdict.col : U.T.soft });
      // what was measured against the real size, and the verdict
      if (r) G.text(c, r.verdict.key === 'ok' ? `✓ chuẩn (thật ${r.truth} cm)` : `${r.verdict.text.toLowerCase()} ${r.err} cm · thật ${r.truth} cm`, 904, ry + 22, { size: 13, weight: 700, color: r.verdict.col });
    });
    const done = this.cur >= this.lines.length;
    if (done) G.text(c, `Độ vừa vặn: ${Math.round(j.fit * 100)}%`, 904, 372, { size: 17, weight: 800, color: U.T.accent });
    else G.wrap(c, 'Kéo thước từ mép trái tới đúng mép phải thân người. Lệch tới 2 cm là chuẩn, tới 5 cm là hơi lệch.', 904, 330, 330, 18, { size: 12, color: U.T.soft, maxLines: 3 });
    U.primary(c, 'next', 'Mở sổ phác thảo', () => G.go('sketch'), done);
    U.secondary(c, 'redo', 'Đo lại', () => this.enter());
    U.hint(c, done ? 'Số đo đã ghi vào sổ' : 'Nhấn ở chấm đỏ rồi kéo thước sang mép phải của áo, thả tay để ghi số đo');
    U.topbar(c, 'Đo người');
  },
  // a tailor's tape measure pulled out of its leather case; the faint arc behind shows it going round the body
  tape(c, x0, x1, y, label, live) {
    const w = x1 - x0;
    c.save();
    if (w > 20) { c.beginPath(); c.ellipse((x0 + x1) / 2, y, w / 2, 9, 0, Math.PI, 0); c.strokeStyle = 'rgba(226,185,71,0.45)'; c.lineWidth = 11; c.stroke(); }
    const g = c.createLinearGradient(0, y - 8, 0, y + 8); g.addColorStop(0, '#f8de7a'); g.addColorStop(1, '#e2b743');
    c.fillStyle = g; c.fillRect(x0, y - 8, w, 16);
    c.strokeStyle = '#a8842a'; c.lineWidth = 1; c.strokeRect(x0, y - 8, w, 16);
    c.fillStyle = '#5a4418';
    for (let x = x0, n = 0; x < x1 - 2; x += 6, n++) {
      c.fillRect(x, y - 8, 1, n % 5 === 0 ? 7 : 3.5);
      if (n % 5 === 0 && n) G.text(c, String(n), x, y + 3, { size: 8, weight: 800, align: 'center', color: '#5a4418' });
    }
    // brass end cap
    G.rr(c, x1 - 2, y - 10, 7, 20, 2); c.fillStyle = '#c9952e'; c.fill(); c.strokeStyle = '#7a5a1c'; c.stroke();
    if (live) {
      // the round leather case at the start, with its brass winder
      const cx = x0 - 18;
      c.beginPath(); c.arc(cx, y, 22, 0, 7);
      const cg = c.createRadialGradient(cx - 7, y - 7, 2, cx, y, 23); cg.addColorStop(0, '#d0525e'); cg.addColorStop(1, '#7a2330');
      c.fillStyle = cg; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.arc(cx, y, 16, 0, 7); c.setLineDash([3, 3]); c.strokeStyle = 'rgba(255,230,200,0.6)'; c.lineWidth = 1.2; c.stroke(); c.setLineDash([]);
      c.beginPath(); c.arc(cx, y, 6, 0, 7); c.fillStyle = '#e2b85a'; c.fill(); c.strokeStyle = '#7a5a1c'; c.stroke();
    }
    if (label) { G.rr(c, x1 - 32, y - 38, 64, 24, 12); c.fillStyle = G.INK; c.fill(); G.text(c, label, x1, y - 26, { size: 13, weight: 800, font: G.GAME, align: 'center', color: '#fff6e6' }); }
    c.restore();
  },
  // after measuring: tailor's chalk marks at both ends and the number written beside them
  chalk(c, x0, x1, y, label) {
    c.save(); c.lineCap = 'round'; c.strokeStyle = 'rgba(70,120,190,0.75)'; c.lineWidth = 3;
    for (const x of [x0, x1]) { c.beginPath(); c.moveTo(x - 1, y - 11); c.lineTo(x + 1, y + 11); c.stroke(); }
    c.setLineDash([2, 6]); c.lineWidth = 1.6; c.strokeStyle = 'rgba(70,120,190,0.45)'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); c.setLineDash([]);
    const mx = (x0 + x1) / 2;
    G.rr(c, mx - 33, y - 36, 66, 24, 12); c.fillStyle = 'rgba(255,250,240,0.92)'; c.fill(); c.strokeStyle = 'rgba(70,120,190,0.7)'; c.lineWidth = 1.5; c.stroke();
    G.text(c, label, mx, y - 23, { size: 13, weight: 800, font: G.GAME, align: 'center', color: '#2f5f9a' });
    c.restore();
  }
};

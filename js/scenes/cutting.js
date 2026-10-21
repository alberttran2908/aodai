// Cutting room: each fabric is a horizontal roll you pan along. Lay the pattern pieces with their
// grain arrow along the roll, then pick the scissors and click each piece to cut it out.
G.scenes.cutting = {
  enter() {
    const j = G.job, s = G.state;
    this.rolls = [...new Set(j.pieces.map((p) => p.fabric))].map((id) => ({ id, w: G.fabricWidth(id), len: Math.max(0, s.roll[id] || 0) }));
    this.ri = this.ri && this.ri < this.rolls.length ? this.ri : 0;
    this.pan = 0; this.drag = null; this.sel = null; this.mode = 'arrange'; this.anim = null; this.t = 0; this.trace = null; this.cutting = false;
    this.dirty = true;
  },
  roll() { return this.rolls[this.ri]; },
  view() {
    const r = this.roll();
    const k = Math.min(400 / r.w, 3.6);
    return { k, x0: 30, y0: 120 + (400 - r.w * k) / 2, w: G.W - 60 };
  },
  pieces() { return G.job.pieces.filter((p) => p.fabric === this.roll().id); },
  longAxisY(p) { return p.base.h >= p.base.w; },
  onGrain(p) { return this.longAxisY(p) ? p.rot % 2 === 1 : p.rot % 2 === 0; },
  toRoll(pt) { const v = this.view(); return { x: (pt.x - v.x0) / v.k + this.pan, y: (pt.y - v.y0) / v.k }; },
  toScreen(x, y) { const v = this.view(); return { x: v.x0 + (x - this.pan) * v.k, y: v.y0 + y * v.k }; },
  recompute() {
    this.bad = new Set();
    for (const r of this.rolls) {
      const grid = new Int16Array(Math.ceil(r.w) * Math.ceil(r.len + 1));
      G.job.pieces.forEach((p, i) => {
        if (p.fabric !== r.id || !p.placed) return;
        const q = G.geo.rotated(p, p.rot);
        if (p.x < -0.01 || p.y < -0.01 || p.x + q.w > r.len + 0.01 || p.y + q.h > r.w + 0.01) this.bad.add(i);
        for (let n = 0; n < q.cells.length; n += 2) {
          const x = q.cells[n] + Math.round(p.x), y = q.cells[n + 1] + Math.round(p.y);
          if (x < 0 || y < 0 || x >= r.len || y >= r.w) continue;
          const idx = x * Math.ceil(r.w) + y;
          if (grid[idx]) { this.bad.add(i); this.bad.add(grid[idx] - 1); } else grid[idx] = i + 1;
        }
      });
    }
    this.dirty = false;
  },
  clamp(p) {
    const r = this.roll(), q = G.geo.rotated(p, p.rot);
    p.x = Math.round(G.clamp(p.x, 0, Math.max(0, r.len - q.w)));
    p.y = Math.round(G.clamp(p.y, 0, Math.max(0, r.w - q.h)));
  },
  rotate(p) {
    if (!p || p.cut) return;
    const a = G.geo.rotated(p, p.rot); p.rot = (p.rot + 1) % 4; const b = G.geo.rotated(p, p.rot);
    p.x += a.w / 2 - b.w / 2; p.y += a.h / 2 - b.h / 2;
    if (p.placed) this.clamp(p);
    this.dirty = true;
    // a little reward when the grain arrow lines up with the selvedge
    if (this.onGrain(p)) G.sfx.good(); else G.sfx.place();
  },
  hitPiece(pt) {
    const rp = this.toRoll(pt), list = this.pieces();
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i]; if (!p.placed) continue;
      const q = G.geo.rotated(p, p.rot);
      if (G.geo.pointInPoly({ x: rp.x - p.x, y: rp.y - p.y }, q.poly)) return p;
    }
    return null;
  },
  traySlots() {
    const out = []; let x = 30;
    for (const p of this.pieces()) { if (p.placed || (this.drag && this.drag.p === p)) continue; out.push({ p, x, y: 572, w: 112, h: 86 }); x += 120; }
    return out;
  },
  down(pt, e) {
    if (this.anim) return;
    const p = this.hitPiece(pt);
    if (this.mode === 'cut') {
      // the scissors go where the finger goes: pick up the cut where it stopped, or start on the outline
      const T = this.trace, near = (q, r) => { const s = this.toScreen(q.x, q.y); return Math.hypot(s.x - pt.x, s.y - pt.y) < r; };
      if (T && !T.p.cut && near(T.path[T.i], 34)) { this.cutting = true; return; }
      const cand = p || this.pieceNearOutline(pt);
      if (cand && !cand.cut) {
        const i = G.job.pieces.indexOf(cand);
        if (this.bad.has(i)) { G.toast('Mảnh này đang chồng hoặc ra ngoài mép vải', G.C.red); G.sfx.bad(); return; }
        const q = G.geo.rotated(cand, cand.rot);
        const path = G.geo.resample(q.poly.map((v) => ({ x: v.x + cand.x, y: v.y + cand.y })), 1.2, true);
        path.pop(); // closed loop: the last point repeats the first
        const rp = this.toRoll(pt);
        let best = 0, bd = Infinity;
        path.forEach((q2, k) => { const d = Math.hypot(q2.x - rp.x, q2.y - rp.y); if (d < bd) { bd = d; best = k; } });
        if (bd > this.cutTol() * 2.5) { G.toast('Đặt kéo lên đường viền của mảnh rập'); return; }
        this.trace = { p: cand, path, i: best, start: best, dir: 0, done: 0, dev: 0 };
        this.cutting = true; G.sfx.snip();
      }
      return;
    }
    if (e && e.button === 2) { if (p) this.rotate(p); return; }
    if (p && !p.cut) { const rp = this.toRoll(pt); this.sel = p; this.drag = { p, ox: rp.x - p.x, oy: rp.y - p.y, pt }; return; }
    const slot = this.traySlots().find((sl) => G.inRect(pt, sl));
    if (slot) { const q = G.geo.rotated(slot.p, slot.p.rot); this.sel = slot.p; this.drag = { p: slot.p, ox: q.w / 2, oy: q.h / 2, pt, fromTray: true }; return; }
    if (pt.y > 110 && pt.y < 560) this.drag = { pan: true, start: pt.x, pan0: this.pan };
  },
  // how far off the line the scissors may wander, in cm (a little more forgiving on small screens)
  cutTol() { return (G.textBoost > 1 ? 3.2 : 2.4) * Math.max(1, 3 / this.view().k); },
  pieceNearOutline(pt) {
    const rp = this.toRoll(pt), tol = this.cutTol() * 2.5;
    for (const p of this.pieces()) {
      if (!p.placed || p.cut) continue;
      const q = G.geo.rotated(p, p.rot);
      if (rp.x > p.x - tol && rp.x < p.x + q.w + tol && rp.y > p.y - tol && rp.y < p.y + q.h + tol) return p;
    }
    return null;
  },
  // follow the pointer along the outline: the cut grows only while the scissors stay on the line
  traceTo(pt) {
    const T = this.trace, N = T.path.length, rp = this.toRoll(pt), tol = this.cutTol();
    let steps = 0;
    for (let guard = 0; guard < 40; guard++) {
      const dirs = T.dir ? [T.dir] : [1, -1];
      let best = null;
      for (const dir of dirs) for (let s = 1; s <= 10; s++) {
        const q = T.path[(T.i + dir * s + N * 4) % N], d = Math.hypot(q.x - rp.x, q.y - rp.y);
        if (d < tol && (!best || d < best.d)) best = { dir, s, d }; // the point on the line right under the scissors
      }
      // stop once the line runs ahead of the scissors (stepping on would only take the cut further from the finger)
      const cur = T.path[T.i];
      if (!best || best.d >= Math.hypot(cur.x - rp.x, cur.y - rp.y)) break;
      T.dir = best.dir; T.i = (T.i + best.dir * best.s + N * 4) % N; T.done += best.s; T.dev += best.d * best.s; steps += best.s;
      if (T.done >= N) break;
    }
    if (steps && Math.floor(T.done / 6) !== Math.floor((T.done - steps) / 6)) G.sfx.snip();
    if (T.done >= N) this.finishCut();
  },
  finishCut() {
    const T = this.trace, p = T.p, acc = G.clamp(1 - T.dev / T.done / (this.cutTol() * 0.9), 0, 1);
    p.cut = true; this.trace = null; this.cutting = false;
    // grain decides most of the score; a clean cut along the line adds the rest
    G.job.cutScore.push((this.onGrain(p) ? 1 : G.tool('scissors').off || 0.75) * (0.82 + 0.18 * acc));
    G.toast(acc > 0.8 ? 'Đường cắt ngọt xớt!' : acc > 0.5 ? 'Cắt ổn' : 'Đường cắt hơi lệch', acc > 0.5 ? G.C.green : G.C.ink);
    G.sfx.done();
  },
  move(pt) {
    if (this.cutting && this.trace) { this.traceTo(pt); return; }
    const d = this.drag; if (!d) return;
    if (d.pan) { const v = this.view(); this.pan = this.clampPan(d.pan0 - (pt.x - d.start) / v.k); return; }
    d.pt = pt;
  },
  up(pt) {
    if (this.cutting) { this.cutting = false; return; } // the scissors stay where they stopped
    const d = this.drag; this.drag = null; if (!d || d.pan) return;
    if (pt.y > 560) { d.p.placed = false; this.dirty = true; return; }
    const rp = this.toRoll(pt);
    d.p.x = rp.x - d.ox; d.p.y = rp.y - d.oy; d.p.placed = true;
    this.clamp(d.p); this.dirty = true; G.sfx.place();
  },
  key(e) {
    if (e.key === 'r' || e.key === 'R') this.rotate(this.sel);
    if (e.key === 'a' || e.key === 'ArrowLeft') this.pan = this.clampPan(this.pan - 30);
    if (e.key === 'd' || e.key === 'ArrowRight') this.pan = this.clampPan(this.pan + 30);
    if (e.key === 'c' || e.key === 'C') this.mode = this.mode === 'cut' ? 'arrange' : 'cut';
  },
  clampPan(v) { const r = this.roll(), vw = this.view().w / this.view().k; return G.clamp(v, 0, Math.max(0, r.len - vw + 10)); },
  update(dt) {
    this.t += dt;
    if (this.anim) {
      this.anim.t += dt;
      if (Math.floor(this.anim.t * 12) !== Math.floor((this.anim.t - dt) * 12)) G.sfx.snip();
      if (this.anim.t > 0.9) {
        const p = this.anim.p; p.cut = true;
        G.job.cutScore.push(this.onGrain(p) ? 1 : G.tool('scissors').off || 0.75);
        this.anim = null; G.sfx.done();
      }
    }
  },
  drawPiece(c, p, ox, oy, k, o) {
    const q = G.geo.rotated(p, p.rot), U = G.UI;
    c.save();
    const path = (dx, dy) => { c.beginPath(); q.poly.forEach((v, n) => { const x = ox + v.x * k + dx, y = oy + v.y * k + dy; n ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); };
    if (p.cut) {
      // the cut piece is real cloth now: lifted off the mat with a soft shadow
      const f = G.CAT.FABRICS[p.fabric];
      const lx = -Math.min(8, 2 + k * 2), ly = -Math.min(10, 3 + k * 2.5);
      path(lx, ly); c.save(); c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 16; c.shadowOffsetX = -lx; c.shadowOffsetY = -ly + 4; c.fillStyle = '#000'; c.fill(); c.restore();
      path(lx, ly); c.save(); c.clip(); c.beginPath(); c.rect(ox - 20, oy - 20, q.w * k + 40, q.h * k + 40);
      if (f) G.art.fillFabric(c, f.mat, f.color, 18 * k, f.print);
      c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill(); c.restore();
      path(lx, ly); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.4; c.stroke();
    } else {
      // paper pattern: kraft tissue, a solid outline with the dashed cutting line just inside, pinned down
      path(0, 0);
      c.fillStyle = o.bad ? 'rgba(226,96,96,0.62)' : 'rgba(238,222,184,0.86)'; c.fill();
      c.strokeStyle = o.bad ? '#b8323f' : this.onGrain(p) ? '#3f8a52' : '#8a6a4a'; c.lineWidth = o.sel ? 2.8 : 1.8; c.stroke();
      // seam allowance: a dashed band just inside the outline (the clip keeps only the inner half of a wide stroke)
      if (k > 1.2) { c.save(); c.clip(); c.setLineDash([6, 4]); c.lineWidth = 6; c.strokeStyle = 'rgba(110,75,45,0.28)'; path(0, 0); c.stroke(); c.restore(); }
      if (k > 1.2) {
        const pts = q.poly, step = Math.max(1, Math.floor(pts.length / 3));
        for (let i = 0; i < pts.length; i += step) {
          const px = ox + pts[i].x * k, py = oy + pts[i].y * k, cx0 = ox + (q.w * k) / 2, cy0 = oy + (q.h * k) / 2;
          const ix = px + (cx0 - px) * 0.12, iy = py + (cy0 - py) * 0.12;
          c.strokeStyle = '#b9bcc2'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(ix, iy); c.lineTo(ix + 8, iy + 7); c.stroke();
          c.beginPath(); c.arc(ix, iy, 3.6, 0, 7); c.fillStyle = ['#c2414b', '#3f7fbf', '#e0b23c'][i % 3]; c.fill();
          c.beginPath(); c.arc(ix - 1, iy - 1.2, 1.1, 0, 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
        }
      }
    }
    // grain arrow along the piece's long axis
    const cx = ox + (q.w * k) / 2, cy = oy + (q.h * k) / 2;
    const horiz = q.w >= q.h, L = Math.min(Math.max(q.w, q.h) * k * 0.35, 90);
    c.strokeStyle = c.fillStyle = this.onGrain(p) ? '#3f8a52' : '#c07a1e'; c.lineWidth = 2;
    c.beginPath();
    if (horiz) { c.moveTo(cx - L, cy); c.lineTo(cx + L, cy); } else { c.moveTo(cx, cy - L); c.lineTo(cx, cy + L); }
    c.stroke();
    for (const sgn of [-1, 1]) {
      c.beginPath();
      if (horiz) { c.moveTo(cx + sgn * L, cy); c.lineTo(cx + sgn * (L - 9), cy - 6); c.lineTo(cx + sgn * (L - 9), cy + 6); }
      else { c.moveTo(cx, cy + sgn * L); c.lineTo(cx - 6, cy + sgn * (L - 9)); c.lineTo(cx + 6, cy + sgn * (L - 9)); }
      c.fill();
    }
    if (k > 1.2) G.text(c, p.name, cx, cy + (horiz ? 16 : 0) + (horiz ? 0 : -L - 12 < oy ? 0 : 0), { size: 12, weight: 700, align: 'center', color: '#4a3026' });
    c.restore();
  },
  draw(c) {
    if (this.dirty) this.recompute();
    const U = G.UI, j = G.job, r = this.roll(), v = this.view(), s = G.state;
    U.bg(c);
    // roll tabs
    this.rolls.forEach((rl, i) => {
      const tx = 30 + i * 250, f = G.CAT.FABRICS[rl.id], act = i === this.ri;
      G.ui.hits.push({ id: 'roll' + i, x: tx, y: 62, w: 240, h: 46, enabled: true, cb: () => { this.ri = i; this.pan = 0; } });
      G.rr(c, tx, 62, 240, 46, 12); c.fillStyle = act ? '#fff3df' : '#f1e8d8'; c.fill();
      c.strokeStyle = act ? U.T.accent : U.T.line; c.lineWidth = act ? 2.5 : 1; c.stroke();
      U.swatch(c, rl.id, tx + 8, 70, 30, 30, 6);
      G.text(c, f.name, tx + 46, 78, { size: 12, weight: 700 });
      const left = j.pieces.filter((p) => p.fabric === rl.id && !p.cut).length;
      G.text(c, left ? `${(rl.len / 100).toFixed(1)} m · còn ${left} mảnh` : `${(rl.len / 100).toFixed(1)} m · đã cắt xong ✓`, tx + 46, 96, { size: 11, color: left ? U.T.soft : U.T.ok, weight: 600 });
    });
    // the roll
    const len = r.len;
    c.save(); c.beginPath(); c.rect(v.x0, 112, v.w, 452); c.clip();
    const sx0 = v.x0 - this.pan * v.k;
    // green self-healing cutting mat with a centimetre grid (moves with the cloth)
    const MAT = '#2f6150';
    c.fillStyle = MAT; c.fillRect(v.x0, 112, v.w, 452);
    for (let gx = 0; sx0 + gx * v.k < v.x0 + v.w; gx += 5) {
      const x = sx0 + gx * v.k; if (x < v.x0 - 1) continue;
      c.fillStyle = gx % 50 === 0 ? 'rgba(220,240,225,0.35)' : gx % 10 === 0 ? 'rgba(220,240,225,0.18)' : 'rgba(220,240,225,0.08)'; c.fillRect(x, 112, 1, 452);
    }
    for (let gy = -50; v.y0 + gy * v.k < 564; gy += 5) {
      const y = v.y0 + gy * v.k; if (y < 112) continue;
      c.fillStyle = gy % 10 === 0 ? 'rgba(220,240,225,0.18)' : 'rgba(220,240,225,0.08)'; c.fillRect(v.x0, y, v.w, 1);
    }
    c.save(); c.shadowColor = 'rgba(0,0,0,0.4)'; c.shadowBlur = 16; c.shadowOffsetY = 6;
    c.fillStyle = '#000'; c.fillRect(sx0, v.y0, len * v.k, r.w * v.k); c.restore();
    c.save(); c.translate(sx0, v.y0); c.scale(v.k, v.k);
    const f = G.CAT.FABRICS[r.id];
    c.beginPath(); c.rect(0, 0, len, r.w); G.art.fillFabric(c, f.mat, f.color, 18, f.print);
    // the cloth lies in soft waves across its width, and the woven selvedge runs along both edges
    const wv = c.createLinearGradient(0, 0, 0, r.w);
    for (let i = 0; i <= 6; i++) wv.addColorStop(i / 6, i % 2 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)');
    c.fillStyle = wv; c.fillRect(0, 0, len, r.w);
    for (const ey of [0, r.w - 1.6]) {
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, ey, len, 1.6);
      c.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 1; x < len; x += 1.4) c.fillRect(x, ey + 0.6, 0.5, 0.4);
    }
    // cut pieces leave holes in the cloth, showing the mat beneath
    for (const p of this.pieces()) if (p.cut) {
      const q = G.geo.rotated(p, p.rot);
      c.beginPath(); q.poly.forEach((pt, n) => (n ? c.lineTo(pt.x + p.x, pt.y + p.y) : c.moveTo(pt.x + p.x, pt.y + p.y))); c.closePath();
      c.fillStyle = MAT; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.4; c.stroke();
    }
    c.restore();
    // the rest of the bolt, still rolled up at the far end
    if (len) {
      const ex = sx0 + len * v.k, top = v.y0 - 8, h = r.w * v.k + 16;
      c.save(); c.beginPath(); G.rr(c, ex - 4, top, 30, h, 13); c.clip();
      c.beginPath(); c.rect(ex - 4, top, 30, h); G.art.fillFabric(c, f.mat, f.color, 18 * v.k, f.print);
      const cg = c.createLinearGradient(ex - 4, 0, ex + 26, 0); cg.addColorStop(0, 'rgba(0,0,0,0.35)'); cg.addColorStop(0.45, 'rgba(255,255,255,0.22)'); cg.addColorStop(1, 'rgba(0,0,0,0.45)');
      c.fillStyle = cg; c.fillRect(ex - 4, top, 30, h);
      c.restore();
    }
    // metre marks
    for (let m = 0; m <= len; m += 50) { const x = sx0 + m * v.k; c.fillStyle = 'rgba(230,245,235,0.7)'; c.fillRect(x, v.y0 + r.w * v.k + 4, 1, m % 100 ? 6 : 12); if (m % 100 === 0) G.text(c, `${m / 100} m`, x + 3, v.y0 + r.w * v.k + 16, { size: 11, weight: 700, color: 'rgba(230,245,235,0.85)' }); }
    if (!len) G.text(c, 'Hết vải này — mua thêm ở cửa hàng', G.W / 2, 330, { size: 20, weight: 700, align: 'center', color: U.T.bad });
    // placed pieces
    j.pieces.forEach((p, i) => {
      if (p.fabric !== r.id || !p.placed || (this.drag && this.drag.p === p)) return;
      const sp = this.toScreen(p.x, p.y);
      this.drawPiece(c, p, sp.x, sp.y, v.k, { bad: this.bad.has(i), sel: this.sel === p });
    });
    const T = this.trace;
    if (T && T.p.fabric === r.id) {
      const N = T.path.length, at = (k) => { const q = T.path[((k % N) + N) % N]; return this.toScreen(q.x, q.y); };
      // what is cut so far: a dark slit with the cloth parting slightly
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const [col, lw] of [['rgba(255,255,255,0.55)', 4], ['#2b1d18', 2.2]]) {
        c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
        for (let s = 0; s <= T.done; s++) { const sp = at(T.start + (T.dir || 1) * s); s ? c.lineTo(sp.x, sp.y) : c.moveTo(sp.x, sp.y); }
        c.stroke();
      }
      // the stretch ahead glows so the eye knows where to go (both ways until the first move picks one)
      const k = 0.5 + 0.5 * Math.sin(this.t * 6);
      c.strokeStyle = `rgba(246,205,106,${0.55 + 0.4 * k})`; c.lineWidth = 4; c.setLineDash([6, 6]);
      for (const dir of T.dir ? [T.dir] : [1, -1]) {
        c.beginPath();
        for (let s = 0; s <= 14; s++) { const sp = at(T.i + dir * s); s ? c.lineTo(sp.x, sp.y) : c.moveTo(sp.x, sp.y); }
        c.stroke();
      }
      c.setLineDash([]);
      // the scissors, pointing along the cut
      const hp = at(T.i), np = at(T.i + (T.dir || 1) * 3), ang = Math.atan2(np.y - hp.y, np.x - hp.x);
      if (!this.cutting) { c.beginPath(); c.arc(hp.x, hp.y, 16 + k * 5, 0, 7); c.strokeStyle = `rgba(246,205,106,${0.9 - k * 0.5})`; c.lineWidth = 3; c.stroke(); }
      c.save(); c.translate(hp.x, hp.y); c.rotate(ang + Math.PI);
      G.text(c, '✂', 0, 0, { size: 28, align: 'center', fixed: true, color: '#2b1d18' });
      c.restore();
      // how far round the piece
      G.UI.outlined(c, `${Math.round((100 * T.done) / N)}%`, hp.x + 22, hp.y - 22, { size: 14, color: '#fff6e6', halo: G.INK });
    }
    c.restore();
    // tray
    G.rr(c, 20, 566, 820, 98, 14); c.fillStyle = 'rgba(251,246,236,0.9)'; c.fill();
    const slots = this.traySlots();
    if (!slots.length) G.text(c, this.mode === 'cut' ? 'Đặt kéo lên đường viền mảnh rồi rê dọc theo nét để cắt' : 'Đã xếp hết mảnh của cuộn này', 430, 615, { size: 15, weight: 600, align: 'center', color: U.T.soft });
    for (const sl of slots) {
      const q = G.geo.rotated(sl.p, sl.p.rot), tk = Math.min((sl.w - 16) / q.w, (sl.h - 16) / q.h);
      G.UI.tile(c, sl.x, sl.y, sl.w, sl.h, { sel: this.sel === sl.p, r: 10 });
      this.drawPiece(c, sl.p, sl.x + sl.w / 2 - (q.w * tk) / 2, sl.y + sl.h / 2 - (q.h * tk) / 2, tk, { sel: this.sel === sl.p });
    }
    if (this.drag && this.drag.p) {
      const d = this.drag, sp = { x: d.pt.x - d.ox * v.k, y: d.pt.y - d.oy * v.k };
      c.globalAlpha = 0.85; this.drawPiece(c, d.p, sp.x, sp.y, v.k, { sel: true }); c.globalAlpha = 1;
    }
    // tools
    G.button(c, 'tArr', '✋ Xếp', 860, 576, 110, 44, () => { this.mode = 'arrange'; }, { style: this.mode === 'arrange' ? 'primary' : 'ghost', size: 15, r: 22 });
    G.button(c, 'tCut', '✂ Kéo', 980, 576, 110, 44, () => { this.mode = 'cut'; }, { style: this.mode === 'cut' ? 'primary' : 'ghost', size: 15, r: 22 });
    G.button(c, 'tRot', '↻', 1100, 576, 50, 44, () => this.rotate(this.sel), { style: 'ghost', size: 18, r: 22, enabled: !!this.sel && !this.sel.cut });
    const allCut = j.pieces.every((p) => p.cut);
    U.primary(c, 'sew', 'Đem đi may  →', () => this.finish(), allCut);
    U.secondary(c, 'buy', 'Mua thêm vải', () => G.go('emporium', { back: 'cutting' }));
    U.hint(c, this.mode === 'cut' ? 'Kéo: đặt lên viền mảnh, rê dọc theo nét vàng • nhấc tay rồi chạm lại ✂ để cắt tiếp' : 'Kéo mảnh từ khay lên vải • R / chuột phải xoay • kéo nền để cuộn vải • mũi tên xanh = đúng canh sợi');
    U.topbar(c, 'Phòng cắt');
  },
  finish() {
    // cut off the used slice of every roll; leftovers stay for the next dress
    const s = G.state;
    for (const r of this.rolls) {
      let used = 0;
      for (const p of G.job.pieces) if (p.fabric === r.id) used = Math.max(used, p.x + G.geo.rotated(p, p.rot).w);
      s.roll[r.id] = Math.max(0, Math.round((s.roll[r.id] || 0) - used - 2));
      if (s.roll[r.id] < 10) delete s.roll[r.id];
    }
    G.save();
    this.ri = 0;
    G.go('sew');
  }
};

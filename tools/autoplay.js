// Autoplay driver for playtests: drives the real scenes (sketch button, cutting room, sewing machine,
// ironing board, decorating, finish) the way a careful player would. Loaded into the page by eval.
window.AP = {
  log: [],
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  step(n, dt) { for (let i = 0; i < n; i++) { G.scene.update(dt || 1 / 60); } },
  hit(id) { const h = G.ui.prevHits.find((x) => x.id === id); if (!h) throw new Error('no button ' + id + ' in ' + this.sceneName()); if (h.enabled === false) throw new Error('button disabled ' + id); h.cb(); },
  draw() { const cv = this._cv || (this._cv = document.createElement('canvas')); cv.width = 1280; cv.height = 720; G.ui.hits = []; G.scene.draw(cv.getContext('2d')); G.ui.prevHits = G.ui.hits; },
  sceneName() { return Object.keys(G.scenes).find((k) => G.scenes[k] === G.scene); },
  // greedy packer: each piece turned to the grain, dropped column by column along the roll
  pack() {
    const sc = G.scenes.cutting, out = [];
    for (let ri = 0; ri < sc.rolls.length; ri++) {
      sc.ri = ri; const r = sc.roll();
      let x = 0, y = 0, colW = 0;
      for (const p of sc.pieces()) {
        p.rot = sc.longAxisY(p) ? 1 : 0;
        let q = G.geo.rotated(p, p.rot);
        if (q.h > r.w) { p.rot = (p.rot + 1) % 4; q = G.geo.rotated(p, p.rot); }
        if (y + q.h > r.w) { x += colW + 1; y = 0; colW = 0; }
        p.x = x; p.y = y; p.placed = true; y += q.h + 1; colW = Math.max(colW, q.w);
        out.push({ piece: p.name, fits: x + q.w <= r.len, grain: sc.onGrain(p) });
      }
    }
    sc.dirty = true; sc.recompute();
    return out;
  },
  cutAll() {
    const sc = G.scenes.cutting; sc.recompute();
    if (sc.bad.size) return { bad: [...sc.bad].map((i) => G.job.pieces[i].name) };
    for (const p of G.job.pieces) {
      if (p.cut) continue;
      sc.ri = sc.rolls.findIndex((r) => r.id === p.fabric);
      const q = G.geo.rotated(p, p.rot);
      sc.anim = { p, t: 0, path: [] };
      this.step(60);
    }
    return { cut: G.job.pieces.filter((p) => p.cut).length, of: G.job.pieces.length };
  },
  // a steady hand: aims the needle at the seam a little ahead, turning at most so fast, at the slow speed
  sewSeam(i, skill) {
    const sc = G.scenes.sew; sc.lvl = 0; sc.startSeam(i);
    const P = sc.paths[i]; let guard = 0, fails = 0;
    while (sc.mode === 'machine' && guard++ < 20000) {
      const m = sc.m;
      if (m.fail) { if (m.fail > 1.3) fails++; this.step(1); continue; }
      if (m.done) { this.step(1); continue; }
      const k = Math.min(P.length - 1, m.idx + 3), tgt = P[k];
      const want = Math.atan2(tgt.x - m.n.x, tgt.y - m.n.y);
      let d = want - m.th; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const turn = (skill || 1) * 0.12; m.th += G.clamp(d, -turn, turn);
      // ease off before sharp turns, the way a careful player would
      const k2 = Math.min(P.length - 1, m.idx + 8), ahead = Math.atan2(P[k2].x - P[k].x, P[k2].y - P[k].y);
      let bend = Math.abs(ahead - want); if (bend > Math.PI) bend = 2 * Math.PI - bend;
      m.mouse = bend < 0.6 || m.vel < 0.5;
      this.step(1);
      if (fails > 6) return { fail: true, fails };
    }
    return { score: sc.sd[i] ? sc.pct(sc.sd[i].score) : null, fails };
  },
  // a thoughtful player: the parts and the one cloth that best meet the brief's style wishes
  solve(com, rank) {
    const C = G.CAT, reqs = com.reqs, mins = reqs.filter((r) => r.type === 'min'), maxes = reqs.filter((r) => r.type === 'max'), g = com.garment || 'aodai', male = !!com.male;
    const opts = {};
    for (const p of C.PART_ORDER) opts[p] = Object.keys(C.PARTS[p].opts).filter((k) => { const o = C.PARTS[p].opts[k]; return C.optRank(o, g) <= rank && C.partFits(o, male) && C.garmentAllows(p, k, o, g); });
    const ok = (id) => { const f = C.FABRICS[id]; return f.rank <= rank && reqs.every((r) => (r.type !== 'mat' || f.mat === r.mat) && (r.type !== 'avoid' || f.color !== r.color) && (r.type !== 'cols' || r.colors.includes(f.color))); };
    let best = null;
    for (const f of Object.keys(C.FABRICS).filter(ok)) {
      const part = {}; for (const p of C.PART_ORDER) part[p] = opts[p][0];
      const score = () => { const t = G.computeTags(G.jobDesign({ com, part, decor: { items: [] } }), { than: f, tay: f, co: f, quan: f }, { items: [] }, part); let v = mins.length ? Math.min(...mins.map((m) => t[m.tag] / m.val)) : 1; for (const m of maxes) if (t[m.tag] > m.val) v -= (t[m.tag] - m.val) / m.val; return v; };
      let cur = score();
      for (let pass = 0; pass < 3; pass++) for (const p of C.PART_ORDER) for (const k of opts[p]) { const keep = part[p]; part[p] = k; const v = score(); if (v > cur) cur = v; else part[p] = keep; }
      if (!best || cur > best.v) best = { v: cur, part: Object.assign({}, part), f };
    }
    return best;
  },
  async play(spec) {
    const s = G.state, res = { garment: spec.garment, occ: spec.occasion, steps: [] };
    const O = spec.occasion && G.OCCASIONS[spec.occasion];
    s.commission = spec.com || G.makeCommission({ client: spec.client, garment: spec.garment, occasion: spec.occasion, title: O ? O.title : spec.title, line: O ? O.lines[0] : undefined, reqs: O ? O.reqs : spec.reqs, rank: spec.rank });
    const com = s.commission; res.garment = com.garment; res.reqs = com.reqs.map(G.reqText); res.qualityReq = com.quality;
    G.startJob(); const j = G.job; j.fit = 1;
    if (spec.smart) { const b = this.solve(com, G.rank()); res.solveV = b && +b.v.toFixed(2); if (b) { Object.assign(j.part, b.part); spec.fabs = { than: b.f, tay: b.f, co: b.f, quan: b.f }; } }
    if (spec.part) Object.assign(j.part, spec.part);
    // fabrics: the given ones, bought onto the roll if short
    j.fabs = Object.assign({}, spec.fabs);
    for (const id of Object.values(j.fabs)) if (id) s.roll[id] = Math.max(s.roll[id] || 0, 1500);
    G.go('sketch'); this.draw();
    res.tagsAtSketch = G.computeTags(G.jobDesign(), j.fabs, j.decor, j.part);
    this.hit('draft'); this.draw();
    res.steps.push('sketch→' + this.sceneName());
    res.pack = this.pack(); res.cut = this.cutAll(); this.draw();
    if (res.cut.bad) return res;
    this.hit('sew'); this.draw(); res.steps.push('cut→' + this.sceneName());
    const sw = G.scenes.sew;
    for (const p of sw.pinList) sw.pinPiece(p.id);
    await this.sleep(700); this.draw();
    res.seams = sw.asm.seams.map((sm, i) => Object.assign({ name: sm.name }, this.sewSeam(i, spec.skill)));
    this.draw();
    try { this.hit('next'); } catch (e) { res.err = e.message; return res; }
    this.draw(); res.steps.push('sew→' + this.sceneName());
    if (this.sceneName() === 'iron') {
      const ir = G.scenes.iron; ir.pressing = true;
      for (const w of ir.creases) { const v = ir.view(); G.pointer.x = v.ox + w.x * v.z; G.pointer.y = v.oy + w.y * v.z; this.step(40); }
      ir.pressing = false; this.draw(); this.hit('next'); this.draw();
    }
    res.steps.push('→' + this.sceneName());
    if (spec.decor) Object.assign(j.decor, spec.decor);
    // the brief's decoration wishes: one fitting item of each asked-for group
    for (const r of com.reqs) if (r.type === 'decor') {
      const grp = G.CAT.DECOR[r.group], id = Object.keys(grp.items).find((k) => (grp.items[k].rank || 1) <= G.rank() && G.CAT.decorFits(grp.items[k], !!com.male));
      if (!id) continue;
      if (grp.kind === 'one') j.decor[grp.field] = id; else j.decor.items.push({ group: r.group, id, x: -6, y: 60, size: 10, rot: 0 });
    }
    this.draw(); this.hit('done'); this.draw();
    res.steps.push('→' + this.sceneName());
    const f = G.scenes.finish; res.quality = f.r.quality; res.success = f.r.success; res.tags = f.r.tags;
    res.miss = f.r.checks.filter((c) => !c.ok).map((c) => G.reqText(c.r)); res.say = f.say; res.pay = f.r.pay + f.r.tip;
    return res;
  }
};
'loaded';

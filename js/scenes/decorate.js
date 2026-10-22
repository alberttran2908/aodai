// Decoration: a separate last step. Place embroidery and large appliqués anywhere on the dress,
// pick trims, buttons, beading, headwear and a cape. The brief on the left updates live.
G.scenes.decorate = {
  enter() { this.t = 0; this.group = this.group || 'theu'; this.tool = null; this.sel = null; this.drag = null; },
  update(dt) { this.t += dt; if (this.pop) { this.pop.t += dt; if (this.pop.t > 0.4) this.pop = null; } },
  view() {
    const asm = G.job.asm, z = Math.min(600 / (asm.botY - asm.topY), 3.4);
    return { asm, z, ox: 610, oy: 66 - asm.topY * z };
  },
  toCm(p) { const v = this.view(); return { x: (p.x - v.ox) / v.z, y: (p.y - v.oy) / v.z }; },
  cost() {
    const C = G.CAT, d = G.job.decor; let n = 0;
    for (const g of C.DECOR_ORDER) { const grp = C.DECOR[g]; if (grp.kind === 'one' && d[grp.field]) n += grp.items[d[grp.field]].price; }
    for (const it of d.items) n += C.DECOR[it.group].items[it.id].price;
    return n;
  },
  itemAt(p) {
    const v = this.view(), items = G.job.decor.items;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i], sx = v.ox + it.x * v.z, sy = v.oy + it.y * v.z;
      if (Math.hypot(p.x - sx, p.y - sy) < (it.size * v.z) / 2) return it;
    }
    return null;
  },
  // the spots a tailor would actually put a motif: chest, waist, the flap, the hem, the sleeves.
  // Anything placed near one snaps to it (free placement elsewhere still works).
  snaps() {
    const a = G.job.asm, s = a.s, inP = G.geo.pointInPoly, out = [];
    const add = (x, y) => { const q = { x, y }; if (inP(q, a.body) || (a.sleeveR && inP(q, a.sleeveR)) || (a.sleeveL && inP(q, a.sleeveL))) out.push(q); };
    add(-6.5 * s, 22 * s); add(6.5 * s, 22 * s); add(0, a.SY(34 * s));
    add(0, a.slitY + (a.hemY - a.slitY) * 0.25); add(0, (a.slitY + a.hemY) / 2); add(0, a.hemY - 16 * s);
    for (const sl of [a.sleeveR, a.sleeveL]) if (sl) { const b = G.geo.bounds(sl); add(b.x + b.w / 2, b.y + b.h * 0.55); }
    return out;
  },
  snapCm(cm) {
    const v = this.view(), R = 30 / v.z;
    let best = null, bd = R;
    for (const q of this.snaps()) { const d = Math.hypot(q.x - cm.x, q.y - cm.y); if (d < bd) { bd = d; best = q; } }
    return best ? { x: best.x, y: best.y, snapped: true } : cm;
  },
  down(p, e) {
    if (p.x < 380 || p.x > 830) return;
    const it = this.itemAt(p), j = G.job;
    if (e && e.button === 2) { if (it) { j.decor.items.splice(j.decor.items.indexOf(it), 1); this.sel = null; G.sfx.click(); } return; }
    if (it) { this.sel = it; this.drag = { it }; return; }
    if (!this.tool) return;
    const cm = this.snapCm(this.toCm(p)), v = this.view();
    const inside = G.geo.pointInPoly(cm, v.asm.body) || (v.asm.sleeveR && G.geo.pointInPoly(cm, v.asm.sleeveR)) || (v.asm.sleeveL && G.geo.pointInPoly(cm, v.asm.sleeveL));
    if (!inside) { G.toast('Đặt hoa văn lên thân hoặc tay áo'); return; }
    const def = G.CAT.DECOR[this.tool.group].items[this.tool.id];
    const it2 = { group: this.tool.group, id: this.tool.id, x: cm.x, y: cm.y, size: def.size * v.asm.s, rot: 0 };
    j.decor.items.push(it2); this.sel = it2; this.pop = { it: it2, t: 0 }; G.sfx.stamp();
  },
  move(p) {
    if (!this.drag) return;
    const cm = this.snapCm(this.toCm(p)), it = this.drag.it;
    if (cm.snapped && (it.x !== cm.x || it.y !== cm.y)) G.sfx.place();
    it.x = cm.x; it.y = cm.y;
  },
  up() { this.drag = null; },
  key(e) {
    const it = this.sel; if (!it) return;
    if (e.key === 'q' || e.key === 'Q') it.rot -= 0.15;
    if (e.key === 'e' || e.key === 'E') it.rot += 0.15;
    if (e.key === '[' || e.key === '-') it.size *= 0.9;
    if (e.key === ']' || e.key === '=') it.size *= 1.1;
    if (e.key === 'Delete' || e.key === 'Backspace') { G.job.decor.items.splice(G.job.decor.items.indexOf(it), 1); this.sel = null; }
  },
  draw(c) {
    const U = G.UI, C = G.CAT, j = G.job, rk = G.rank();
    U.bg(c);
    const design = G.jobDesign(), tags = G.computeTags(design, j.fabs, j.decor, j.part);
    U.commission(c, 20, 66, 350, { tags, fabs: j.fabs, decor: j.decor });
    // the dress
    const v = this.view(), asm = G.geo.build(design, G.jobScale(), false);
    c.save(); c.translate(v.ox, v.oy); c.scale(v.z, v.z);
    G.art.garment(c, asm, G.jobFabs(), { mannequin: true, t: this.t, decorItems: j.decor.items });
    c.restore();
    // just stamped: a ring bursts out from the new motif
    if (this.pop) { const k = this.pop.t / 0.4, r = (this.pop.it.size * v.z) / 2 + 6 + k * 30; c.beginPath(); c.arc(v.ox + this.pop.it.x * v.z, v.oy + this.pop.it.y * v.z, r, 0, 7); c.strokeStyle = `rgba(246,205,106,${1 - k})`; c.lineWidth = 4 * (1 - k) + 1; c.stroke(); }
    if (this.sel) {
      const it = this.sel, sx = v.ox + it.x * v.z, sy = v.oy + it.y * v.z, rr = (it.size * v.z) / 2 + 4;
      c.beginPath(); c.arc(sx, sy, rr, 0, 7); c.setLineDash([5, 4]); c.strokeStyle = U.T.accent; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
      // a little toolbar over the selected motif, so rotating / resizing / removing works by touch too (Q/E, [ ], Delete)
      if (!this.drag) {
        const tools = [['⟲', () => { it.rot -= 0.15; }], ['⟳', () => { it.rot += 0.15; }], ['−', () => { it.size *= 0.9; }], ['+', () => { it.size *= 1.1; }], ['✕', () => { const items = G.job.decor.items; items.splice(items.indexOf(it), 1); this.sel = null; G.sfx.click(); }]];
        const tw = tools.length * 40 - 4, tx = G.clamp(sx - tw / 2, 384, 826 - tw), ty = Math.max(70, sy - rr - 46);
        tools.forEach(([lab, cb], k) => G.button(c, 'dt' + k, lab, tx + k * 40, ty, 36, 34, cb, { style: k === 4 ? 'primary' : 'ghost', size: 16, r: 12 }));
      }
    }
    // with a motif in hand: glowing snap spots, and a see-through preview under the pointer
    const placing = this.tool && C.DECOR[this.tool.group].kind === 'place';
    if (placing || this.drag) {
      for (const q of this.snaps()) {
        const sx = v.ox + q.x * v.z, sy = v.oy + q.y * v.z, pr = 9 + Math.sin(this.t * 4 + q.y) * 2;
        c.beginPath(); c.arc(sx, sy, pr + 5, 0, 7); c.fillStyle = 'rgba(201,149,46,0.2)'; c.fill();
        c.beginPath(); c.arc(sx, sy, pr, 0, 7); c.strokeStyle = 'rgba(255,248,230,0.95)'; c.lineWidth = 3.5; c.stroke();
        c.strokeStyle = '#b8862a'; c.lineWidth = 1.8; c.setLineDash([3, 3]); c.stroke(); c.setLineDash([]);
        c.beginPath(); c.arc(sx, sy, 3, 0, 7); c.fillStyle = '#c9952e'; c.fill();
      }
    }
    if (placing && !this.drag && G.pointer.x > 380 && G.pointer.x < 830 && !this.itemAt(G.pointer)) {
      const cm = this.snapCm(this.toCm(G.pointer)), def = C.DECOR[this.tool.group].items[this.tool.id], size = def.size * asm.s * v.z;
      const gx = v.ox + cm.x * v.z, gy = v.oy + cm.y * v.z;
      c.save(); c.globalAlpha = 0.55;
      if (this.tool.group === 'theu') G.art.motif(c, this.tool.id, gx, gy, size, false);
      else if (this.tool.group === 'va') G.art.patch(c, this.tool.id, gx, gy, size);
      else { const pl = G.tex.placements[this.tool.id]; if (pl && pl.img) { const h = size, w = h * (pl.img.width / pl.img.height); c.drawImage(pl.img, gx - w / 2, gy - h / 2, w, h); } }
      c.restore();
    }
    // palette
    U.card(c, 840, 62, 420, 560);
    // the groups as an even 4 × 2 grid of short labels
    const SHORT = { theu: 'Thêu', tranh: 'Tranh thêu', vien: 'Viền', cuc: 'Cúc áo', dinh: 'Đính kết', dau: 'Đội đầu', choang: 'Choàng', va: 'Vá & sờn' };
    C.DECOR_ORDER.forEach((g, i) => {
      U.chip(c, 'g' + g, SHORT[g] || C.DECOR[g].name, 856 + (i % 4) * 98, 76 + Math.floor(i / 4) * 36, this.group === g, () => { this.group = g; this.tool = null; }, { w: 92 });
    });
    const gy = 76 + Math.ceil(C.DECOR_ORDER.length / 4) * 36 + 12; // item grid below the group chips
    const male = !!j.com.male;
    const grp = C.DECOR[this.group], keys = Object.keys(grp.items).filter((k) => C.decorFits(grp.items[k], male));
    if (!keys.length) G.text(c, male ? 'Mục này dành cho áo dài nữ' : 'Chưa có mẫu', 1050, 220, { size: 15, align: 'center', color: U.T.soft });
    keys.forEach((id, i) => {
      const it = grp.items[id], cx = 856 + (i % 3) * 132, cy = gy + Math.floor(i / 3) * 112;
      const lock = (it.rank || 1) > rk;
      const active = grp.kind === 'one' ? j.decor[grp.field] === id : this.tool && this.tool.id === id;
      G.ui.hits.push({ id: 'it' + id, x: cx, y: cy, w: 124, h: 104, enabled: !lock, cb: () => {
        if (grp.kind === 'one') j.decor[grp.field] = j.decor[grp.field] === id ? null : id;
        else this.tool = active ? null : { group: this.group, id };
        G.sfx.click();
      } });
      G.UI.tile(c, cx, cy, 124, 104, { sel: active, hov: G.inRect(G.pointer, { x: cx, y: cy, w: 124, h: 104 }) });      // thumbnail
      c.save(); c.beginPath(); c.rect(cx + 6, cy + 6, 112, 58); c.clip();
      if (this.group === 'theu') G.art.motif(c, id, cx + 62, cy + 35, 50, false);
      else if (this.group === 'va') { c.fillStyle = '#e9dcc4'; c.fillRect(cx + 6, cy + 6, 112, 58); G.art.patch(c, id, cx + 62, cy + 35, 44); }
      else if (this.group === 'tranh') { const pl = G.tex.placements[id]; if (pl && pl.img) { const h = 56, w = h * (pl.img.width / pl.img.height); c.drawImage(pl.img, cx + 62 - w / 2, cy + 7, w, h); } }
      else this.thumb(c, this.group, id, cx + 62, cy + 35);
      c.restore();
      if (lock) G.art.lock(c, cx + 108, cy + 16, 8);
      G.text(c, it.name, cx + 62, cy + 76, { size: 12, weight: 700, align: 'center' });
      G.text(c, lock ? `Hạng ${it.rank}` : `${it.price} xu`, cx + 62, cy + 93, { size: 11, weight: 700, align: 'center', color: lock ? U.T.bad : U.T.gold });
    });
    const cost = this.cost();
    G.text(c, `Chi phí trang trí: ${cost} xu`, 1050, 638, { size: 15, weight: 800, font: G.GAME, align: 'center', color: U.T.accent });
    U.primary(c, 'done', `Hoàn thành áo`, () => {
      if (cost && !G.spend(cost)) return;
      if (G.quests && (j.decor.items || []).length >= 3) G.quests.event('trangtri', 3);
      G.go('finish');
    });
    U.secondary(c, 'clear', 'Gỡ hết', () => { j.decor = { items: [] }; this.sel = null; });
    U.hint(c, grp.kind === 'place' ? 'Chọn mẫu rồi bấm lên áo (gần chấm vàng sẽ tự khớp) • kéo để dời • bấm hoạ tiết để xoay, đổi cỡ hay gỡ' : 'Bấm để chọn, bấm lần nữa để bỏ');
    U.topbar(c, 'Trang trí');
  },
  thumb(c, group, id, x, y) {
    c.save(); c.translate(x, y);
    if (group === 'vien') { const hex = G.DATA.style.trim.opts[id].hex; c.strokeStyle = hex; c.lineWidth = 7; c.beginPath(); c.moveTo(-40, 10); c.quadraticCurveTo(0, -18, 40, 10); c.stroke(); }
    else if (group === 'cuc') { const hex = G.DATA.style.buttons.opts[id].hex; for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * 22, 0, 8, 0, 7); c.fillStyle = hex; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.stroke(); } }
    else { const male = !!G.job.com.male;
      const d = Object.assign({}, G.DATA.defaultDesign, { head: group === 'dau' ? id : 'none', deco: group === 'dinh' ? id : 'none', cape: group === 'choang' ? id : 'none' }, male ? { male: true, fit: 'nam', length: 'nam' } : {});
      const asm = G.geo.build(d, 1, false); const z = group === 'dau' ? 1.5 : 0.36; c.translate(0, group === 'dau' ? 34 : -28); c.scale(z, z);
      G.art.garment(c, asm, { mat: 'lua', color: 'trang', print: 'tron' }, { mannequin: true, still: true, noSheen: true }); }
    c.restore();
  }
};

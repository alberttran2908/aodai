// Sketchbook (Dressmaker style). Left page: the brief with live style bars and the fabric you still
// need (buy what is missing right here). Middle: the dress — click a part of it to pick its fabric.
// Right page: a visual picker for each part ("Kiểu dáng") and for each fabric slot ("Vải").
// Hovering any choice previews it on the dress and shows how every style bar would move.
G.scenes.sketch = {
  PART_SHORT: { co: 'Cổ', dang: 'Dáng', tay: 'Tay', ta: 'Tà', quan: 'Quần' },
  SLOT_LABEL: { than: 'Thân & tà', tay: 'Tay áo', co: 'Cổ áo', quan: 'Quần' },
  enter() {
    this.t = 0; this.tab = this.tab || 'kieu'; this.part = this.part || 'co'; this.slot = this.slot || 'than';
    this.page = 0; this.filter = this.filter || 'own'; this.hover = null; this.region = null;
    this.thumbs = this.thumbs || {};
  },
  update(dt) { this.t += dt; },
  // options that suit this client (men's or women's cut)
  options(part) {
    const opts = G.CAT.PARTS[part].opts, male = !!G.job.com.male, g = G.job.garment;
    return Object.keys(opts).filter((k) => G.CAT.partFits(opts[k], male) && G.CAT.garmentAllows(part, k, opts[k], g));
  },
  optName(part, key) {
    const o = G.CAT.PARTS[part].opts[key];
    if (o.name) return o.name;
    const map = { co: 'neck', tay: 'sleeve', dang: 'fit', quan: 'bottom' }[part];
    return G.DATA.style[map].opts[key].name;
  },
  // (the tứ thân's 'co' cloth is its yếm)
  slotLabel(k) {
    const g = G.CAT.GARMENTS[G.job.garment];
    if (k === 'co' && g && g.coLabel) return g.coLabel;
    if (k === 'quan' && ['chanvay', 'tuyn'].includes(G.job.part.quan)) return 'Váy';
    return this.SLOT_LABEL[k];
  },
  hasCollar(partSel) { return ['dung', 'thap', 'nhatbinh', 'tuthan', 'vest', 'vestnhon'].includes((partSel || G.job.part).co); },
  slots(partSel) { return Object.keys(G.CAT.SLOTS).filter((k) => k !== 'co' || this.hasCollar(partSel)); },
  // the commission's hard fabric rules, for badges on the fabric cards
  rules() {
    const reqs = G.job.com.reqs;
    return { mat: (reqs.find((r) => r.type === 'mat') || {}).mat, avoid: (reqs.find((r) => r.type === 'avoid') || {}).color };
  },

  // ---------- part thumbnails (rendered once, cached) ----------
  THUMB_BOX: { co: [-19, -9, 38, 24], tay: [-34, -6, 68, 76], dang: [-26, -6, 52, 66], quan: [-30, 60, 60, 105] },
  thumb(c, part, key, x, y, w, h) {
    const j = G.job, sel = Object.assign({}, j.part, { [part]: key });
    let d = G.jobDesign({ com: j.com, part: sel, decor: { items: [] } });
    // trousers/skirts preview under a knee-length tà, or a floor-length one would hide them
    if (part === 'quan') d = Object.assign({}, d, { length: d.male ? 'namngan' : 'goi', hem: 'thang' });
    const id = part + '|' + JSON.stringify(d);
    let cv = this.thumbs[id];
    if (!cv && this.thumbBudget > 0) {
      this.thumbBudget--;
      if (Object.keys(this.thumbs).length > 240) this.thumbs = {};
      cv = this.thumbs[id] = this.renderThumb(part, d, w, h);
    }
    if (cv) c.drawImage(cv, x, y, w, h);
    else { G.rr(c, x, y, w, h, 8); c.fillStyle = '#efe6d6'; c.fill(); }
  },
  renderThumb(part, d, w, h) {
    const asm = G.geo.build(d, 1, false), K = 2;
    const cv = document.createElement('canvas'); cv.width = w * K; cv.height = h * K;
    const c = cv.getContext('2d');
    // tà: frame the panels from the waist down, so the hem shape and length read clearly
    let R = this.THUMB_BOX[part];
    if (part === 'ta') {
      // zoom on the hem itself: that is where the tà options differ (U, V, pleats, two layers, slant)
      const hb = G.geo.bounds(asm.hemLine), top = hb.y - 26, bot = hb.y + hb.h + 6 + (d.hem === 'kep' ? 30 : 0);
      const half = Math.max(hb.w / 2 + 5, ((bot - top) * w) / h / 2);
      R = [-half, top, half * 2, bot - top];
    }
    if (!R) R = [-46, 34, 92, asm.botY - 30];
    const k = Math.min((w * K) / R[2], (h * K) / R[3]);
    c.translate((w * K) / 2 - (R[0] + R[2] / 2) * k, (h * K) / 2 - (R[1] + R[3] / 2) * k); c.scale(k, k);
    G.art.garment(c, asm, { mat: 'lua', color: 'covit', print: 'tron' }, { still: true, noSheen: true, buttons: false });
    return cv;
  },

  // ---------- clicking the dress picks a fabric slot ----------
  // what the "co" cloth covers: the standing collar, the Nhật Bình's great collar, or the tứ thân's yếm
  coPolys(a) { return [a.collar, a.yem].concat(a.nbCollar || [], a.lapels || []).filter(Boolean); },
  regionAt(p) {
    const v = this.pv;
    if (!v || p.x < 426 || p.x > 826 || p.y < 66 || p.y > G.H - 92) return null;
    const a = v.asm, q = { x: (p.x - v.ox) / v.z, y: (p.y - v.oy) / v.z }, inP = G.geo.pointInPoly;
    if (this.hasCollar() && this.coPolys(a).some((poly) => inP(q, poly))) return 'co';
    if ((a.sleeveR && inP(q, a.sleeveR)) || (a.sleeveL && inP(q, a.sleeveL))) return 'tay';
    if (inP(q, a.body)) return 'than';
    if (q.y > a.slitY && q.y < a.floorY && Math.abs(q.x) < 20 * a.s * (a.mx || 1)) return 'quan';
    return null;
  },
  outlineRegion(c, r, col, dash) {
    const v = this.pv, a = v.asm;
    c.save(); c.translate(v.ox, v.oy); c.scale(v.z, v.z);
    c.setLineDash(dash ? [4 / v.z, 3 / v.z] : []); c.strokeStyle = col; c.lineWidth = 2.2 / v.z; c.lineJoin = 'round';
    const polys = r === 'than' ? [a.body] : r === 'tay' ? [a.sleeveR, a.sleeveL] : r === 'co' ? this.coPolys(a) : [];
    for (const poly of polys) { if (!poly) continue; c.beginPath(); poly.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.stroke(); }
    if (r === 'quan') { const w = 20 * a.s * (a.mx || 1); c.strokeRect(-w, a.slitY, 2 * w, a.floorY - a.slitY); }
    c.restore();
  },
  // ---------- shaping the cut by dragging handles on the dress (Kiểu dáng → Dáng) ----------
  SHAPE_NAME: { eo: 'Eo', hong: 'Hông', xe: 'Xẻ tà', xoe: 'Độ xoè tà' },
  // (the bà ba keeps its own short, easy cut: no handles)
  shaping() { return this.tab === 'kieu' && this.part === 'dang' && this.pv && !['baba', 'nhatbinh'].includes(G.job.garment) && !(G.job.skin && G.skins.ready(G.job.skin.id)); },
  handlePts() {
    const v = this.pv, a = v.asm, h = G.geo.handles(v.asm.design), kx = a.s * (a.mx || 1) * v.z, ky = a.s * v.z;
    return ['eo', 'hong', 'xe', 'xoe'].map((k) => ({ k, x: v.ox + h[k].x * kx, y: v.oy + h[k].y * ky, lx: v.ox - h[k].x * kx, val: h.shape[k], kx, ky }));
  },
  dragShapeTo(p) {
    const g = this.dragShape, j = G.job, lim = G.geo.SHAPE[g.k], v = this.pv;
    let val;
    if (g.k === 'xe') {
      // the slit point moves up and down; undo the display stretch below the bust
      const disp = (p.y - v.oy) / g.ky;
      val = disp <= 38 ? disp : 38 + (disp - 38) / 1.14;
    } else val = g.start + (g.side * (p.x - g.sx)) / g.kx;
    val = Math.round(G.clamp(val, lim[0], lim[1]) * 2) / 2; // half-centimetre steps
    j.shape = Object.assign({}, j.shape, { [g.k]: val });
  },
  drawHandles(c) {
    const U = G.UI, j = G.job;
    for (const h of this.handlePts()) {
      const act = this.dragShape && this.dragShape.k === h.k, hov = !this.dragShape && Math.hypot(G.pointer.x - h.x, G.pointer.y - h.y) < 14;
      // the left side mirrors the right: a faint ghost dot
      c.beginPath(); c.arc(h.lx, h.y, 5, 0, 7); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill(); c.strokeStyle = 'rgba(61,43,37,0.4)'; c.lineWidth = 1; c.stroke();
      c.beginPath(); c.arc(h.x, h.y, act || hov ? 10 : 8, 0, 7); c.fillStyle = act ? U.T.accent : '#fff'; c.fill();
      c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
      // arrows say which way it moves
      c.fillStyle = act ? '#fff' : G.INK;
      G.text(c, h.k === 'xe' ? '↕' : '↔', h.x, h.y + 1, { size: 11, weight: 800, align: 'center', color: act ? '#fff' : G.INK });
      if (act || hov) {
        const v = h.k === 'xe' ? `mở ở ${Math.round(h.val === null ? 0 : h.val)} cm từ vai` : `${h.val > 0 ? '+' : ''}${h.val} cm`;
        U.tooltip(c, [this.SHAPE_NAME[h.k], h.k === 'xe' && h.val === null ? 'theo kiểu gốc — kéo lên / xuống' : v]);
      }
    }
    if (j.shape && Object.keys(j.shape).length) {
      G.button(c, 'shapereset', 'Đặt lại dáng gốc', G.W * 0.33 + 24, 76, 150, 30, () => { j.shape = {}; G.sfx.click(); }, { style: 'ghost', size: 13, r: 16 });
    }
  },

  down(p) {
    // drag a shape handle (waist, hip, slit, hem sweep)
    if (this.shaping()) {
      const h = this.handlePts().find((q) => Math.hypot(p.x - q.x, p.y - q.y) < 14 || Math.hypot(p.x - q.lx, p.y - q.y) < 14);
      if (h) {
        const side = Math.hypot(p.x - h.x, p.y - h.y) < 14 ? 1 : -1;
        this.dragShape = { k: h.k, sx: p.x, start: h.val || 0, side, kx: h.kx, ky: h.ky };
        G.sfx.click(); return;
      }
      return; // while shaping, clicks on the dress don't jump to the fabric page
    }
    // pick up a fabric swatch: drop it on the dress, or just click to use it for the current part
    const tile = this.tab === 'vai' && (this.fabTiles || []).find((t) => G.inRect(p, t));
    if (tile) { this.dragFab = { id: tile.id, sx: p.x, sy: p.y, moved: false }; return; }
    const r = this.regionAt(p);
    if (r) { this.slot = r; this.tab = 'vai'; this.page = 0; G.sfx.click(); }
  },
  move(p) {
    if (this.dragShape) { this.dragShapeTo(p); return; }
    const d = this.dragFab;
    if (d && !d.moved && Math.hypot(p.x - d.sx, p.y - d.sy) > 6) d.moved = true;
  },
  up(p) {
    if (this.dragShape) { this.dragShapeTo(p); this.dragShape = null; G.sfx.place(); return; }
    const d = this.dragFab; this.dragFab = null; if (!d) return;
    const j = G.job;
    if (!d.moved) { j.fabs[this.slot] = d.id; G.sfx.place(); return; }
    const r = this.regionAt(p);
    if (r && this.slots().includes(r)) { j.fabs[r] = d.id; this.slot = r; G.sfx.place(); }
  },

  // ---------- buying what is missing ----------
  missing() {
    const need = G.fabricNeed(), s = G.state, out = [];
    for (const id in need) {
      const have = s.roll[id] || 0;
      if (have < need[id]) { const cm = Math.ceil((need[id] - have) / 10) * 10; out.push({ id, cm, cost: Math.ceil(((G.econ.price(id) * cm) / 100) * (1 - G.bond.discount(id))) }); }
    }
    return out;
  },
  buy(list) {
    const cost = list.reduce((a, m) => a + m.cost, 0);
    if (!G.spend(cost)) return;
    for (const m of list) G.state.roll[m.id] = (G.state.roll[m.id] || 0) + m.cm;
    G.toast(`Đã mua ${list.map((m) => (m.cm / 100).toFixed(1) + 'm').join(', ')} vải`);
    G.save();
  },

  // ---------- drawing ----------
  draw(c) {
    const U = G.UI, j = G.job, C = G.CAT, s = G.state;
    this.thumbBudget = 2;
    this.hover = null;
    U.bg(c);
    // an open sketchbook: leather cover peeking out, paper pages, a spiral binding on the fold
    G.rr(c, 8, 62, G.W - 16, G.H - 132, 20); c.fillStyle = '#7a3a2c'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.4; c.stroke();
    U.card(c, 16, 64, G.W - 32, G.H - 142, { r: 16, fill: '#fdf8ee', stitch: false });
    const fx = G.W * 0.33;
    c.fillStyle = 'rgba(61,43,37,0.1)'; c.fillRect(fx - 14, 70, 28, G.H - 156);
    for (let ry = 86; ry < G.H - 96; ry += 30) {
      c.beginPath(); c.arc(fx - 8, ry, 3.2, 0, 7); c.arc(fx + 8, ry, 3.2, 0, 7); c.fillStyle = '#5e3a24'; c.fill();
      c.beginPath(); c.ellipse(fx, ry - 2, 11, 6, 0, Math.PI, 0); c.strokeStyle = '#9aa3a8'; c.lineWidth = 3; c.stroke();
      c.beginPath(); c.ellipse(fx, ry - 3, 10, 5, 0, Math.PI * 1.1, Math.PI * 1.6); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2; c.stroke();
    }

    // right page first: it decides what is being hovered
    this.fabTiles = [];
    if (this.tab === 'kieu') this.drawParts(c); else this.drawFabrics(c);
    // a swatch being dragged previews on whichever part of the dress it is over
    const drag = this.dragFab && this.dragFab.moved ? this.dragFab : null;
    if (drag) { const r = this.regionAt(G.pointer); this.hover = r && this.slots().includes(r) ? { kind: 'fab', id: drag.id, slot: r } : null; }
    const tabBtn = (id, label, x, key) => G.button(c, id, label, x, 72, 128, 34, () => { this.tab = key; this.page = 0; }, { style: this.tab === key ? 'primary' : 'ghost', size: 15, r: 17 });
    tabBtn('tabk', 'Kiểu dáng', 838, 'kieu');
    tabBtn('tabv', 'Vải', 974, 'vai');

    // what the dress would be with the hovered choice
    const hv = this.hover;
    const partSel = hv && hv.kind === 'part' ? Object.assign({}, j.part, { [hv.part]: hv.key }) : j.part;
    const fabs = hv && hv.kind === 'fab' ? Object.assign({}, j.fabs, { [hv.slot || this.slot]: hv.id }) : j.fabs;
    const design = G.jobDesign(Object.assign({}, j, { part: partSel }));

    // ----- left page: brief with live bars (and the hovered change), fabric needed -----
    const tags = G.computeTags(G.jobDesign(), j.fabs, j.decor, j.part);
    const ghost = hv ? G.computeTags(design, fabs, j.decor, partSel) : null;
    const ch = U.commission(c, 30, 74, 380, { tags, ghost, fabs: j.fabs, decor: j.decor, stage: 'sketch', mood: this.moodOf(ghost || tags, fabs, design) });
    this.drawNeeds(c, 74 + ch + 30);

    // ----- middle: the dress; click a part to choose its fabric -----
    const asm = G.geo.build(design, G.jobScale(), false);
    const z = Math.min(500 / (asm.botY - asm.topY), 3.1);
    this.pv = { asm, z, ox: G.W * 0.33 + 200, oy: 80 - asm.topY * z };
    c.save(); c.beginPath(); c.rect(G.W * 0.33 + 2, 66, 400, G.H - 158); c.clip();
    // a soft pool of shade behind the figure (a white dress on white paper vanished) and a round podium
    const fy = this.pv.oy + (asm.floorY || 152 * asm.s) * z, my = this.pv.oy + (asm.topY + 70 * asm.s) * z;
    const bk = c.createRadialGradient(this.pv.ox, my, 30, this.pv.ox, my + 40, 300);
    bk.addColorStop(0, 'rgba(196,168,136,0.32)'); bk.addColorStop(0.6, 'rgba(196,168,136,0.14)'); bk.addColorStop(1, 'rgba(196,168,136,0)');
    c.fillStyle = bk; c.fillRect(G.W * 0.33, 66, 404, G.H - 158);
    const pg = c.createLinearGradient(0, fy - 6, 0, fy + 16); pg.addColorStop(0, '#d9c3a3'); pg.addColorStop(1, '#a98a66');
    c.beginPath(); c.ellipse(this.pv.ox, fy + 6, 92, 13, 0, 0, 7); c.fillStyle = pg; c.fill();
    c.beginPath(); c.ellipse(this.pv.ox, fy, 92, 11, 0, 0, 7); c.fillStyle = '#efe2cd'; c.fill(); c.strokeStyle = 'rgba(94,58,36,0.35)'; c.lineWidth = 1.2; c.stroke();
    c.translate(this.pv.ox, this.pv.oy); c.scale(z, z);
    G.art.garment(c, asm, G.jobFabs({ fabs }), { mannequin: true, cache: true, t: this.t });
    c.restore();
    // the eye on the palette (with the hovered cloth), under the podium
    if (this.tab === 'vai') U.flairPill(c, this.pv.ox, Math.min(G.H - 122, fy + 26), G.flair(Object.assign({}, j, { fabs })));
    const shaping = this.shaping();
    const reg = shaping ? null : this.regionAt(G.pointer);
    if (this.tab === 'vai') this.outlineRegion(c, this.slot, 'rgba(178,50,63,0.55)', true);
    if (shaping) this.drawHandles(c);
    if (reg) {
      this.outlineRegion(c, reg, U.T.accent, false);
      if (drag) U.tooltip(c, [this.slotLabel(reg), 'Thả để dùng ' + C.FABRICS[drag.id].name]);
      else U.tooltip(c, [this.slotLabel(reg), j.fabs[reg] ? C.FABRICS[j.fabs[reg]].name : 'Chưa có vải — bấm để chọn']);
    }
    // one click to use the same fabric for the whole áo (trousers are usually a different fabric)
    const cur = j.fabs[this.slot], aoSlots = this.slots().filter((k) => k !== 'quan');
    if (cur && this.slot !== 'quan' && aoSlots.some((k) => j.fabs[k] !== cur)) {
      G.button(c, 'fillall', 'Dùng vải này cho cả áo', G.W * 0.33 + 90, G.H - 124, 220, 32, () => {
        for (const k of aoSlots) j.fabs[k] = cur; G.sfx.place();
      }, { style: 'ghost', size: 13, r: 16 });
    }

    if (drag) {
      // the swatch in hand, tilted a little, with a drop shadow
      c.save(); c.translate(G.pointer.x, G.pointer.y); c.rotate(-0.12);
      G.rr(c, -30, -18, 64, 46, 8); c.fillStyle = 'rgba(40,20,10,0.3)'; c.fill();
      U.swatch(c, drag.id, -34, -26, 64, 46, 8);
      G.rr(c, -34, -26, 64, 46, 8); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
      c.restore();
    } else if (hv && hv.kind === 'fab') {
      const f = C.FABRICS[hv.id];
      U.tooltip(c, [f.name, `${C.MATS[f.mat].name} · khổ ${G.fabricWidth(hv.id)} cm · ${G.econ.priceLabel(hv.id)}`, s.roll[hv.id] ? `Trong kho: ${(s.roll[hv.id] / 100).toFixed(1)} m` : 'Chưa có — mua ngay ở trang bên trái']);
    }

    const slots = this.slots(), assigned = slots.every((k) => j.fabs[k]), short = this.missing();
    U.primary(c, 'draft', 'Vẽ rập  →', () => { G.buildJob(); G.go('cutting'); }, assigned && !short.length);
    U.secondary(c, 'shop', 'Cửa hàng vải', () => G.go('emporium', { back: 'sketch' }));
    if (this.pastDesigns().length) G.button(c, 'reuse', 'Dùng lại mẫu cũ', G.W - 604, G.H - 66, 170, 50, () => { this.reuse = true; }, { style: 'ghost', size: 15, r: 25 });
    if (this.reuse) this.drawReuse(c);
    U.hint(c, shaping ? 'Kéo các nút trên áo để chỉnh eo, hông, chỗ xẻ tà và độ xoè — rập cắt đổi theo' : !assigned ? `Kéo tấm vải thả lên phần áo • hoặc bấm phần áo rồi chọn vải${G.touchUI ? '' : ' • rê chuột để xem trước'}`
      : short.length ? 'Còn thiếu vải — bấm “Mua” ở trang trái' : G.touchUI ? 'Chạm một kiểu để thử — xem khách phản ứng cạnh áo' : 'Rê chuột lên lựa chọn để xem thanh phong cách thay đổi thế nào');
    U.topbar(c, 'Sổ phác thảo');
  },

  // ---------- the client's face reacting to the design as it changes (Dressmaker's live reaction) ----------
  MOOD: [
    { at: 1, face: '😍', line: 'Đúng ý tôi luôn!', col: '#4f8a5b' },
    { at: 0.66, face: '🙂', line: 'Ừm, gần được rồi…', col: '#7a8a3a' },
    { at: 0.33, face: '😐', line: 'Chưa đúng ý lắm.', col: '#b8862a' },
    { at: 0, face: '😟', line: 'Không phải gu tôi…', col: '#b23a48' }
  ],
  // shown on the brief in place of the client's job title; pops when it changes
  moodOf(tags, fabs, design) {
    const j = G.job;
    // only what can be judged now (decorations and the sewing come later)
    const reqs = j.com.reqs.filter((r) => r.type !== 'decor' && r.type !== 'qmax');
    if (!reqs.length || !Object.values(j.fabs).some(Boolean)) return null;
    const ok = reqs.filter((r) => G.reqCheck(r, tags, fabs, j.decor, { design }).ok).length / reqs.length;
    const m = this.MOOD.find((x) => ok >= x.at);
    if (this.lastMood !== m.face) { this.lastMood = m.face; this.moodPop = 0; if (m.at === 1) G.sfx.good && G.sfx.good(); }
    this.moodPop = Math.min(1, (this.moodPop || 0) + (G.ui.dt || 0.016) * 4);
    return Object.assign({ pop: this.moodPop }, m);
  },

  // ---------- reuse a past design from the album (cut, shape and fabrics) ----------
  pastDesigns() {
    const male = !!G.job.com.male;
    const C = G.CAT, rk = G.rank();
    // the same garment, and every part still exists, belongs to it and is unlocked at this rank
    const g = G.job.garment || 'aodai';
    const ok = (part) => Object.keys(part).every((p) => { const o = C.PARTS[p] && C.PARTS[p].opts[part[p]]; return o && C.optRank(o, g) <= rk && C.garmentAllows(p, part[p], o, g); });
    return (G.state.collection || []).filter((x) => x.part && x.design && !!x.male === male && (x.design.garment || 'aodai') === g && ok(x.part)).slice(-8).reverse();
  },
  reuseThumb(snap) {
    this.reuseCache = this.reuseCache || {};
    if (this.reuseCache[snap.id]) return this.reuseCache[snap.id];
    const cv = document.createElement('canvas'); cv.width = 180; cv.height = 300;
    const c = cv.getContext('2d'), asm = G.geo.build(snap.design, 1, false), z = Math.min(280 / (asm.botY - asm.topY), 4);
    c.translate(90, 10 - asm.topY * z); c.scale(z, z);
    G.art.garment(c, asm, snap.fabs, { mannequin: true, still: true, noSheen: true, decorItems: snap.decorItems });
    return (this.reuseCache[snap.id] = cv);
  },
  applyPast(snap) {
    const j = G.job, C = G.CAT;
    j.part = Object.assign({}, j.part, snap.part);
    j.shape = snap.design && snap.design.shape ? Object.assign({}, snap.design.shape) : {};
    // fabrics only if they still exist in the catalogue (a deleted custom bolt is skipped)
    for (const k in snap.fabIds || {}) if (snap.fabIds[k] && C.FABRICS[snap.fabIds[k]]) j.fabs[k] = snap.fabIds[k];
    this.reuse = false; G.sfx.place();
    G.toast(`Đã chép mẫu áo của ${snap.name || 'khách cũ'}`);
  },
  drawReuse(c) {
    const U = G.UI, list = this.pastDesigns();
    c.fillStyle = 'rgba(43,29,24,0.45)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'reuse_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => { this.reuse = false; } });
    const w = 4 * 196 + 40, x0 = (G.W - w) / 2, rows = Math.ceil(list.length / 4), h = 110 + rows * 250;
    const y0 = Math.max(70, (G.H - h) / 2);
    U.card(c, x0, y0, w, h);
    G.ui.hits.push({ id: 'reuse_card', x: x0, y: y0, w, h, enabled: true, cb: () => {} });
    U.title(c, 'Chép lại mẫu áo đã may', x0 + 24, y0 + 36, { size: 22 });
    G.text(c, 'Lấy lại kiểu dáng, độ chỉnh dáng và vải (nếu vải còn bán). Phong cách vẫn tính lại theo đơn này.', x0 + 24, y0 + 66, { size: 13, color: U.T.soft });
    list.forEach((snap, i) => {
      const x = x0 + 20 + (i % 4) * 196, y = y0 + 90 + Math.floor(i / 4) * 250, hov = G.inRect(G.pointer, { x, y, w: 184, h: 238 });
      G.ui.hits.push({ id: 'past' + snap.id, x, y, w: 184, h: 238, enabled: true, cb: () => this.applyPast(snap) });
      U.tile(c, x, y, 184, 238, { hov, r: 12 });
      c.drawImage(this.reuseThumb(snap), x + 47, y + 8, 90, 150);
      U.fitText(c, snap.name || 'Khách', x + 92, y + 176, 170, { size: 14, weight: 800, align: 'center', color: U.T.accent });
      U.fitText(c, `${snap.title || 'Đơn thường'} · ngày ${snap.day || '?'}`, x + 92, y + 196, 170, { size: 11, align: 'center', color: U.T.soft });
      G.text(c, snap.success ? `✓ chất lượng ${snap.quality}` : `✗ chất lượng ${snap.quality}`, x + 92, y + 216, { size: 11, weight: 700, align: 'center', color: snap.success ? U.T.ok : U.T.bad });
    });
    G.button(c, 'reuse_x', 'Đóng', x0 + w - 124, y0 + 18, 100, 34, () => { this.reuse = false; }, { style: 'ghost', size: 14, r: 17 });
  },

  // fabric needed vs owned, with one-click buying of what is missing
  drawNeeds(c, y) {
    const U = G.UI, C = G.CAT, s = G.state, need = G.fabricNeed(), short = this.missing();
    G.text(c, 'Vải cần dùng', 40, y, { size: 16, weight: 800, color: U.T.accent });
    y += 28;
    const ids = Object.keys(need);
    if (!ids.length) { G.wrap(c, 'Chưa chọn vải. Bấm vào thân, tay, cổ hay quần trên áo để chọn.', 40, y, 360, 20, { size: 13, color: U.T.soft }); return; }
    for (const id of ids) {
      const have = s.roll[id] || 0, miss = short.find((m) => m.id === id);
      U.swatch(c, id, 40, y - 11, 22, 22, 5);
      U.fitText(c, C.FABRICS[id].name, 70, y, 150, { size: 13, weight: 600 });
      G.text(c, `${(need[id] / 100).toFixed(1)} / ${(have / 100).toFixed(1)} m`, 290, y, { size: 13, weight: 800, align: 'right', color: miss ? U.T.bad : U.T.ok });
      if (miss) G.button(c, 'buy' + id, `Mua · ${miss.cost} xu`, 300, y - 13, 108, 26, () => this.buy([miss]), { style: 'green', size: 12, r: 13 });
      else G.text(c, '✓ đủ', 404, y, { size: 13, weight: 800, align: 'right', color: U.T.ok });
      y += 32;
    }
    if (short.length > 1) {
      const total = short.reduce((a, m) => a + m.cost, 0);
      G.button(c, 'buyall', `Mua hết phần thiếu · ${total} xu`, 40, y - 8, 368, 32, () => this.buy(short), { style: 'green', size: 14, r: 16 });
    }
  },

  // "Kiểu dáng": one chip per part, then a grid of visual options with their style tags
  drawParts(c) {
    const U = G.UI, C = G.CAT, j = G.job, rk = G.rank(), x0 = 838;
    let x = x0;
    for (const p of C.PART_ORDER) {
      G.button(c, 'pp' + p, this.PART_SHORT[p], x, 118, 76, 30, () => { this.part = p; }, { style: this.part === p ? 'primary' : 'ghost', size: 13, r: 15 });
      x += 82;
    }
    // style filter, Dressmaker-like: show only the options that add to one style, strongest first
    const TK = C.TAG_KEYS, want = new Set(G.job.com.reqs.filter((r) => r.type === 'min').map((r) => r.tag));
    // the styles by name (a tap filters, a second tap shows everything again); ★ = she asked for it
    const labels = TK.map((tk) => C.TAGS[tk].name + (want.has(tk) ? ' ★' : ''));
    let fs = 12; c.font = `600 ${G.fs(fs)}px ${G.FONT}`;
    const pad = 24, widths = () => labels.map((l) => c.measureText(l).width + pad);
    let ws = widths(); if (ws.reduce((a, b) => a + b, 0) + 4 * 5 > 404) { fs = 11; c.font = `600 ${G.fs(fs)}px ${G.FONT}`; ws = widths(); }
    let fx = x0;
    TK.forEach((tk, i) => {
      const on = this.tagFilter === tk, w = ws[i];
      G.button(c, 'tf' + tk, '', fx, 154, w, 30, () => { this.tagFilter = on ? null : tk; }, { style: on ? 'primary' : 'ghost', r: 15 });
      c.beginPath(); c.arc(fx + 11, 169, 4, 0, 7); c.fillStyle = C.TAGS[tk].col; c.fill();
      G.text(c, labels[i], fx + 19, 169, { size: fs, weight: 700, color: on ? '#fff6e6' : U.T.ink });
      fx += w + 5;
    });
    let keys = this.options(this.part);
    if (this.tagFilter) keys = keys.filter((k) => (C.PARTS[this.part].opts[k].tags[this.tagFilter] || 0) > 0).sort((a, b) => C.PARTS[this.part].opts[b].tags[this.tagFilter] - C.PARTS[this.part].opts[a].tags[this.tagFilter]);
    if (!keys.length) G.text(c, 'Không có kiểu nào thuộc phong cách này', x0 + 205, 260, { size: 14, align: 'center', color: U.T.soft });
    // what's open first; the locked ones fold into one row underneath instead of half-hiding the choices
    const isLock = (k) => C.optRank(C.PARTS[this.part].opts[k], j.garment) > rk;
    const locked = keys.filter(isLock); keys = keys.filter((k) => !isLock(k));
    // ★ only on the options that do the most for her wishes (a star on everything said nothing)
    const wv = (k) => [...want].reduce((a, tk) => a + (C.PARTS[this.part].opts[k].tags[tk] || 0), 0);
    const tops = [...new Set(keys.map(wv))].filter((v) => v > 0).sort((a, b) => b - a).slice(0, 2);
    const cw = 130, chh = 104;
    if (locked.length) {
      const ly = 194 + Math.ceil(keys.length / 3) * (chh + 8), ranks = locked.map((k) => C.PARTS[this.part].opts[k].rank);
      const lo = Math.min(...ranks), hi = Math.max(...ranks);
      G.rr(c, x0, ly, 412, 40, 12); c.fillStyle = 'rgba(94,58,36,0.07)'; c.fill();
      G.art.lock(c, x0 + 20, ly + 20, 7);
      U.fitText(c, `${locked.length} kiểu nữa mở ở hạng ${lo === hi ? lo : lo + '–' + hi}`, x0 + 36, ly + 20, 190, { size: 13, weight: 700, color: U.T.soft });
      locked.slice(0, 4).forEach((k, i) => { const tx = x0 + 228 + i * 46; c.save(); c.globalAlpha = 0.5; this.thumb(c, this.part, k, tx, ly + 4, 42, 32); c.restore(); });
    }
    keys.forEach((k, i) => {
      const o = C.PARTS[this.part].opts[k], cx = x0 + (i % 3) * (cw + 11), cy = 194 + Math.floor(i / 3) * (chh + 8);
      const lock = C.optRank(o, j.garment) > rk, sel = j.part[this.part] === k, hov = G.inRect(G.pointer, { x: cx, y: cy, w: cw, h: chh });
      G.ui.hits.push({ id: 'o' + k, x: cx, y: cy, w: cw, h: chh, enabled: !lock, cb: () => { j.part[this.part] = k; G.sfx.click(); } });
      if (hov && !lock && !sel) this.hover = { kind: 'part', part: this.part, key: k };
      U.tile(c, cx, cy, cw, chh, { sel, hov, lock });
      this.thumb(c, this.part, k, cx + 5, cy + 5, cw - 10, 56);
      U.fitText(c, this.optName(this.part, k), cx + cw / 2, cy + 72, cw - 10, { size: 12, weight: 700, align: 'center' });
      U.pills(c, o.tags, cx + 6, cy + 90, cw - 12);
      // a gold star when this option adds to a style the client asked for
      if (!lock && tops.includes(wv(k))) {
        c.beginPath(); c.arc(cx + 14, cy + 14, 10, 0, 7); c.fillStyle = '#f6cd6a'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 1.6; c.stroke();
        G.text(c, '★', cx + 14, cy + 15, { size: 12, align: 'center', color: '#7a5420' });
      }
      if (lock) {
        G.rr(c, cx, cy, cw, chh, 12); c.fillStyle = 'rgba(251,246,236,0.72)'; c.fill();
        G.art.lock(c, cx + cw / 2, cy + 30, 9);
        G.text(c, `Hạng ${o.rank}`, cx + cw / 2, cy + 52, { size: 12, weight: 800, align: 'center', color: U.T.bad });
      }
    });
    if (this.part === 'dang') this.drawSkins(c, x0, 194 + Math.ceil(keys.length / 3) * (chh + 8) + (locked.length ? 48 : 0) + 16);
  },

  // "Ảnh dáng của bạn": the player's own picture of the dress; it only changes the look —
  // style points come from the cut picked above, the pattern pieces from the game
  drawSkins(c, x0, y) {
    const U = G.UI, j = G.job, K = G.skins, ids = Object.keys(K.list), cur = j.skin && K.list[j.skin.id] ? j.skin : null;
    G.text(c, 'Ảnh dáng của bạn', x0, y, { size: 15, weight: 800, color: U.T.accent });
    G.text(c, 'chỉ đổi hình · điểm theo dáng đã chọn', x0 + 140, y, { size: 11, color: U.T.soft });
    const tiles = ids.concat(ids.length < K.MAX ? ['+'] : []);
    tiles.forEach((id, i) => {
      const bx = x0 + i * 60, by = y + 14, sel = cur && cur.id === id, hov = G.inRect(G.pointer, { x: bx, y: by, w: 54, h: 78 });
      if (id === '+') {
        G.ui.hits.push({ id: 'skadd', x: bx, y: by, w: 54, h: 78, enabled: true, cb: () => K.pick((nid) => { j.skin = { id: nid, mode: 'vai' }; G.sfx.place(); }) });
        U.tile(c, bx, by, 54, 78, { hov, r: 10 });
        G.text(c, '+', bx + 27, by + 32, { size: 24, weight: 800, align: 'center', color: U.T.accent });
        G.text(c, 'Tải ảnh', bx + 27, by + 58, { size: 10, weight: 700, align: 'center', color: U.T.soft });
        return;
      }
      G.ui.hits.push({ id: 'sk' + i, x: bx, y: by, w: 54, h: 78, enabled: true, cb: () => { j.skin = sel ? null : { id, mode: (cur && cur.mode) || 'vai' }; G.sfx.click(); } });
      U.tile(c, bx, by, 54, 78, { sel, hov, r: 10 });
      const r = K.list[id];
      if (r.ready) { const k = Math.min(46 / r.img.width, 70 / r.img.height); c.drawImage(r.img, bx + 27 - (r.img.width * k) / 2, by + 39 - (r.img.height * k) / 2, r.img.width * k, r.img.height * k); }
    });
    if (!ids.length) G.wrap(c, 'Vẽ hay chụp một chiếc áo dài (nền trắng hoặc PNG nền trong) — áo trong sổ sẽ mang hình của bạn.', x0 + 66, y + 30, 330, 17, { size: 12, color: U.T.soft });
    if (cur) {
      const cy = y + 106;
      let cx = x0;
      cx += U.chip(c, 'skvai', 'Phủ vải đã chọn', cx, cy, cur.mode !== 'goc', () => { cur.mode = 'vai'; }) + 6;
      cx += U.chip(c, 'skgoc', 'Giữ màu ảnh', cx, cy, cur.mode === 'goc', () => { cur.mode = 'goc'; }) + 6;
      cx += U.chip(c, 'skoff', 'Bỏ ảnh', cx, cy, false, () => { j.skin = null; }) + 6;
      U.chip(c, 'skdel', 'Xoá', cx, cy, false, () => { K.remove(cur.id); j.skin = null; G.toast('Đã xoá ảnh dáng'); });
    }
  },

  // "Vải": the slots, then every fabric you may use; owned first, with requirement badges
  drawFabrics(c) {
    const U = G.UI, C = G.CAT, j = G.job, s = G.state, rk = G.rank(), x0 = 838;
    const slots = this.slots();
    if (!slots.includes(this.slot)) this.slot = 'than';
    slots.forEach((k, i) => {
      const sx = x0 + i * 105, sy = 116, sel = this.slot === k;
      G.ui.hits.push({ id: 'slot' + k, x: sx, y: sy, w: 97, h: 72, enabled: true, cb: () => { this.slot = k; G.sfx.click(); } });
      U.tile(c, sx, sy, 97, 72, { sel, hov: G.inRect(G.pointer, { x: sx, y: sy, w: 97, h: 72 }) });
      if (j.fabs[k]) U.swatch(c, j.fabs[k], sx + 8, sy + 7, 81, 40, 8);
      else { G.rr(c, sx + 8, sy + 7, 81, 40, 8); c.setLineDash([4, 4]); c.strokeStyle = U.T.soft; c.stroke(); c.setLineDash([]); G.text(c, '+', sx + 48, sy + 27, { size: 20, align: 'center', color: U.T.soft }); }
      G.text(c, this.slotLabel(k), sx + 48, sy + 60, { size: 12, weight: 700, align: 'center' });
    });
    // filters: owned / everything / one material
    const R = this.rules();
    const F = [['own', 'Đã có'], ['all', 'Tất cả']].concat(Object.keys(C.MATS).map((m) => [m, C.MATS[m].name]));
    F.forEach(([key, label], i) => {
      const fx = x0 + (i % 5) * 83, fy = 198 + Math.floor(i / 5) * 34;
      G.button(c, 'flt' + key, label, fx, fy, 78, 28, () => { this.filter = key; this.page = 0; }, { style: this.filter === key ? 'primary' : 'ghost', size: 12, r: 14 });
      // the material the client asked for is marked on its filter, not on every bolt of it
      if (key === R.mat) { c.beginPath(); c.arc(fx + 72, fy + 3, 7, 0, 7); c.fillStyle = U.T.ok; c.fill(); G.text(c, '✓', fx + 72, fy + 3, { size: 9, weight: 800, align: 'center', color: '#fff' }); }
    });
    let ids = Object.keys(C.FABRICS).filter((id) => C.FABRICS[id].rank <= rk);
    if (this.filter === 'own') ids = ids.filter((id) => s.roll[id] > 0);
    else if (this.filter !== 'all') ids = ids.filter((id) => C.FABRICS[id].mat === this.filter);
    const score = (id) => { const f = C.FABRICS[id]; return (R.mat && f.mat === R.mat ? 0 : 2) + (s.roll[id] > 0 ? 0 : 1) + (R.avoid && f.colors.includes(R.avoid) ? 4 : 0); };
    ids.sort((a, b) => score(a) - score(b) || C.FABRICS[a].price - C.FABRICS[b].price);
    // the fabric studio is one tap from the grid: design your own bolt for this dress
    if (this.filter === 'all' || this.filter === 'own') ids.unshift('__studio');
    const per = 16, pages = Math.max(1, Math.ceil(ids.length / per));
    this.page = G.clamp(this.page, 0, pages - 1);
    if (pages > 1) {
      G.button(c, 'fp', '‹', x0 + 306, 74, 30, 30, () => this.page--, { style: 'ghost', size: 16, r: 15, enabled: this.page > 0 });
      G.text(c, `${this.page + 1}/${pages}`, x0 + 359, 89, { size: 12, weight: 700, align: 'center', color: U.T.soft });
      G.button(c, 'fn', '›', x0 + 382, 74, 30, 30, () => this.page++, { style: 'ghost', size: 16, r: 15, enabled: this.page < pages - 1 });
    }
    if (!ids.filter((id) => id !== '__studio').length) G.wrap(c, this.filter === 'own' ? 'Kho chưa có vải. Chọn “Tất cả” để xem vải có thể mua ngay.' : 'Chưa mở khoá loại vải này.', ids.length ? x0 + 112 : x0, 290, ids.length ? 300 : 400, 20, { size: 14, color: U.T.soft });
    const mult = C.SLOTS[this.slot].w * 14;
    ids.slice(this.page * per, this.page * per + per).forEach((id, i) => {
      const cx = x0 + (i % 4) * 105, cy = 270 + Math.floor(i / 4) * 92, cw = 97, chh = 86;
      const hov = G.inRect(G.pointer, { x: cx, y: cy, w: cw, h: chh });
      if (id === '__studio') {
        G.ui.hits.push({ id: 'mystudio', x: cx, y: cy, w: cw, h: chh, enabled: true, cb: () => { G.sfx.click(); G.go('studio', { back: 'sketch' }); } });
        G.rr(c, cx, cy, cw, chh, 10); c.fillStyle = hov ? 'rgba(178,50,63,0.1)' : 'rgba(178,50,63,0.04)'; c.fill();
        c.setLineDash([5, 4]); c.strokeStyle = U.T.accent; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
        G.text(c, '+', cx + cw / 2, cy + 30, { size: 30, weight: 700, align: 'center', color: U.T.accent });
        G.text(c, 'Vải của tôi', cx + cw / 2, cy + 58, { size: 13, weight: 800, align: 'center', color: U.T.accent });
        G.text(c, 'tự thiết kế', cx + cw / 2, cy + 74, { size: 11, align: 'center', color: U.T.soft });
        return;
      }
      const f = C.FABRICS[id], sel = j.fabs[this.slot] === id;
      const avoid = R.avoid && f.colors.includes(R.avoid);
      this.fabTiles.push({ id, x: cx, y: cy, w: cw, h: chh }); // click to use, or drag onto a part of the dress
      if (hov && !sel) this.hover = { kind: 'fab', id };
      U.tile(c, cx, cy, cw, chh, { sel, hov, r: 10 });
      U.swatch(c, id, cx + 6, cy + 6, cw - 12, 30, 7);
      if (avoid) {
        G.rr(c, cx + 6, cy + 6, cw - 12, 30, 7); c.fillStyle = 'rgba(184,50,63,0.35)'; c.fill();
        G.text(c, 'Khách tránh màu này', cx + cw / 2, cy + 21, { size: 10, weight: 800, align: 'center', color: '#fff' });
      }
      U.fitText(c, f.name, cx + 6, cy + 46, cw - 12, { size: 11, weight: 700 });
      const have = s.roll[id] || 0;
      G.text(c, have ? `${(have / 100).toFixed(1)} m` : G.econ.priceLabel(id), cx + 6, cy + 61, { size: 11, weight: 800, color: have ? U.T.ok : U.T.gold });
      U.pills(c, f.tags, cx + 6, cy + 76, cw - 12, mult);
    });
  }
};

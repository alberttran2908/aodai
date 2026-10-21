// Xưởng vải: design a bolt from the game's own pieces, see it on the mannequin and as a big swatch,
// save it to the shop (it appears in the emporium and the sketchbook) or copy a link to share it.
G.scenes.studio = {
  enter(p) {
    p = p || {};
    this.back = p.back || 'emporium'; this.t = 0;
    this.d = G.studio.clean(p.design || this.d || G.studio.DEFAULT);
    this.shared = !!p.design && p.shared; // opened from someone's #f= link
    if (this.shared) G.toast('Bạn được gửi một mẫu vải — bấm “Lưu vào tiệm” để dùng');
    this.asm = G.geo.build({ neck: 'dung', sleeve: 'dai', length: 'got', hem: 'thang', slit: 'cao', fit: 'om', pants: 'trang', buttons: 'an', head: 'none', accent: 'vang' }, 'M', false);
  },
  update(dt) { this.t += dt; },
  set(k, v) { this.d = G.studio.clean(Object.assign({}, this.d, { [k]: v })); G.sfx.click(); },
  fab() { return G.studio.fabricOf(this.d); },

  draw(c) {
    const U = G.UI, f = this.fab();
    U.bg(c);
    this.tip = null;
    this.stage(c, f);
    this.sample(c, f);
    this.controls(c);
    if (this.tip) U.tooltip(c, [this.tip]);
    const leave = () => {
      if (this.shared) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } }
      // the emporium keeps where it was opened from (desk or sketchbook)
      G.go(this.back, this.back === 'emporium' ? { back: G.scenes.emporium.back } : {});
    };
    U.primary(c, 'back', this.back === 'title' ? '← Về màn hình chính' : this.back === 'sketch' ? '← Về sổ phác thảo' : '← Về cửa hàng vải', leave);
    U.hint(c, 'Ghép chất liệu, màu và hoạ tiết có sẵn • lưu để bán trong tiệm • gửi link cho bạn bè');
    U.topbar(c, 'Xưởng thiết kế vải');
  },

  // left: the dress on a mannequin under a soft spot
  stage(c, f) {
    const x = 20, y = 66, w = 300, h = 574;
    G.rr(c, x, y, w, h, 16);
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#f6e9d6'); g.addColorStop(1, '#dcc3a2');
    c.fillStyle = g; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.4; c.stroke();
    c.save(); G.rr(c, x, y, w, h, 16); c.clip();
    const sp = c.createRadialGradient(x + w / 2, y + 200, 20, x + w / 2, y + 200, 300);
    sp.addColorStop(0, 'rgba(255,255,255,0.7)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sp; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(80,50,30,0.18)'; c.beginPath(); c.ellipse(x + w / 2, y + h - 22, 90, 12, 0, 0, 7); c.fill();
    const asm = this.asm, z = Math.min(2.9, (h - 50) / (asm.botY - asm.topY));
    c.translate(x + w / 2, y + h - 26 - asm.botY * z); c.scale(z, z);
    G.art.garment(c, asm, { mat: f.mat, color: f.color, print: f.print }, { mannequin: true, t: this.t });
    c.restore();
  },

  // middle: the bolt itself, its name, what it adds, price, and the shop's saved designs
  sample(c, f) {
    const U = G.UI, C = G.CAT, S = G.studio, s = G.state, x = 336, y = 66, w = 380;
    U.card(c, x, y, w, 574);
    // a big draped swatch with a folded corner
    const sx = x + 16, sy = y + 16, sw = w - 32, sh = 230;
    c.save(); G.rr(c, sx, sy, sw, sh, 10); c.clip();
    c.beginPath(); c.rect(sx, sy, sw, sh); G.art.fillFabric(c, f.mat, f.color, 40, f.print);
    const fold = c.createLinearGradient(sx, 0, sx + sw, 0);
    fold.addColorStop(0, 'rgba(0,0,0,0.12)'); fold.addColorStop(0.3, 'rgba(255,255,255,0.14)'); fold.addColorStop(0.55, 'rgba(0,0,0,0.08)'); fold.addColorStop(0.8, 'rgba(255,255,255,0.1)'); fold.addColorStop(1, 'rgba(0,0,0,0.16)');
    c.fillStyle = fold; c.fillRect(sx, sy, sw, sh);
    c.restore();
    G.rr(c, sx, sy, sw, sh, 10); c.strokeStyle = 'rgba(61,43,37,0.35)'; c.lineWidth = 1.2; c.stroke();
    // a paper label pinned to the swatch
    c.save(); c.translate(sx + sw - 120, sy + sh - 30); c.rotate(-0.04);
    G.rr(c, 0, 0, 112, 40, 5); c.fillStyle = '#fbf6ea'; c.fill(); c.strokeStyle = 'rgba(90,60,35,0.5)'; c.lineWidth = 1; c.stroke();
    G.text(c, `${C.MATS[f.mat].name} · khổ ${G.DATA.materials[f.mat].width}`, 56, 13, { size: 10, weight: 700, align: 'center', color: U.T.soft });
    G.text(c, `${f.price} xu/m`, 56, 29, { size: 13, weight: 800, align: 'center', color: U.T.gold });
    c.beginPath(); c.arc(56, -2, 4, 0, 7); c.fillStyle = '#d65a67'; c.fill();
    c.restore();
    let ty = sy + sh + 28;
    U.fitText(c, f.name, sx, ty, sw, { size: 18, weight: 800, color: U.T.accent });
    ty += 24;
    U.pills(c, f.tags, sx, ty, sw);
    if (f.rank > G.rank()) G.text(c, `Dùng được từ hạng ${f.rank}`, sx + sw, ty, { size: 12, weight: 800, align: 'right', color: U.T.bad });
    // save + share
    ty += 22;
    const saved = (s.customFabrics || []).some((it) => it.code === S.code(this.d));
    G.button(c, 'st_save', saved ? '✓ Đã có trong tiệm' : 'Lưu vào tiệm', sx, ty, 190, 42, () => {
      const r = S.save(this.d);
      if (r.full) { G.toast(`Tiệm chỉ giữ ${S.MAX} mẫu tự thiết kế — xoá bớt mẫu cũ`, G.C.red); G.sfx.bad(); }
      else if (r.dup) G.toast('Mẫu này đã có trong tiệm');
      else { G.toast(`Đã lưu “${r.fabric.name}” — có bán ở cửa hàng vải`, G.C.green); G.sfx.cheer && G.sfx.cheer(); }
    }, { style: saved ? 'ghost' : 'green', size: 15, r: 21, enabled: !saved });
    // a pieces-only design travels as a link; a picture goes through the community channel
    if (this.d.k === 'anh') G.button(c, 'st_share', 'Gửi cộng đồng', sx + 200, ty, sw - 200, 42, () => S.submit(this.d), { style: 'ghost', size: 15, r: 21 });
    else G.button(c, 'st_share', '🔗 Gửi link', sx + 200, ty, sw - 200, 42, () => G.share.copy(S.shareLink(this.d)), { style: 'ghost', size: 15, r: 21 });
    // the shop's own designs
    ty += 64;
    const list = s.customFabrics || [];
    G.text(c, `Mẫu của tiệm (${list.length}/${S.MAX})`, sx, ty, { size: 14, weight: 800 });
    if (!list.length) G.wrap(c, 'Chưa có mẫu nào. Mẫu đã lưu sẽ nằm trên kệ cửa hàng vải và trong sổ phác thảo.', sx, ty + 20, sw, 18, { size: 12, color: U.T.soft });
    list.forEach((it, i) => {
      const dd = S.dec(it.code); if (!dd) return;
      const ff = S.fabricOf(dd), bx = sx + (i % 6) * 58, by = ty + 14 + Math.floor(i / 6) * 58, cur = it.code === S.code(this.d);
      G.ui.hits.push({ id: 'cf' + i, x: bx, y: by, w: 52, h: 52, enabled: true, cb: () => { this.d = dd; G.sfx.click(); } });
      if (cur) { G.rr(c, bx - 3, by - 3, 58, 58, 10); c.fillStyle = 'rgba(214,90,103,0.35)'; c.fill(); }
      c.save(); G.rr(c, bx, by, 52, 52, 8); c.clip(); c.beginPath(); c.rect(bx, by, 52, 52); G.art.fillFabric(c, ff.mat, ff.color, 16, ff.print); c.restore();
      G.rr(c, bx, by, 52, 52, 8); c.strokeStyle = 'rgba(61,43,37,0.4)'; c.lineWidth = 1; c.stroke();
    });
    const cur = list.find((it) => it.code === S.code(this.d));
    if (cur) {
      const id = f.id, busy = S.inUse(id);
      G.button(c, 'st_del', busy ? 'Đang dùng — chưa xoá được' : 'Xoá mẫu này', sx, y + 574 - 50, sw, 34, () => { if (S.remove(cur.code)) G.toast('Đã xoá mẫu'); }, { style: 'ghost', size: 13, r: 17, enabled: !busy });
    }
  },

  // right: the choices, top to bottom in the order a designer would pick them
  controls(c) {
    const U = G.UI, C = G.CAT, S = G.studio, d = this.d, x = 732, y = 66, w = 528, cols = G.DATA.colors;
    U.card(c, x, y, w, 574);
    const px = x + 18, label = (t, ly) => G.text(c, t, px, ly, { size: 14, weight: 800, color: U.T.accent });
    // material
    label('Chất liệu', y + 26);
    let cx = px;
    for (const m in C.MATS) cx += U.chip(c, 'sm' + m, C.MATS[m].name, cx, y + 38, d.m === m, () => this.set('m', m), { w: 58 }) + 4;
    // ground colour
    label('Màu nền', y + 92);
    this.dots(c, 'sb', px, y + 112, d.b, (k) => this.set('b', k));
    // kind of repeat
    label('Kiểu vải', y + 182);
    cx = px;
    // "Ảnh của bạn" with no picture yet goes straight to the file picker
    const pick = () => S.pickImage((nid) => { this.d = S.clean(Object.assign({}, this.d, { k: 'anh', i: nid })); G.sfx.click(); });
    for (const k in S.KINDS) cx += U.chip(c, 'sk' + k, S.KINDS[k], cx, y + 194, d.k === k, () => (k === 'anh' && !Object.keys(S.images).length ? pick() : this.set('k', k))) + 6;
    if (d.k === 'tron') {
      G.wrap(c, 'Vải trơn: chỉ chất liệu và màu nền. Chọn “Hoạ tiết”, “Sọc”, “Chấm bi” hoặc “Kẻ ô” để thêm hoa văn.', px, y + 250, w - 36, 20, { size: 13, color: U.T.soft });
      return;
    }
    let ry = y + 246;
    if (d.k === 'anh') return this.photoControls(c, px, ry, w);
    if (d.k === 'motif') {
      label('Hoạ tiết thêu', ry);
      S.MOTIFS.forEach((id, i) => {
        const bx = px + (i % 6) * 84, by = ry + 12 + Math.floor(i / 6) * 58, sel = d.t === id, img = G.MOTIF_IMG[id];
        const hov = G.inRect(G.pointer, { x: bx, y: by, w: 76, h: 52 });
        G.ui.hits.push({ id: 'st' + id, x: bx, y: by, w: 76, h: 52, enabled: true, cb: () => this.set('t', id) });
        U.tile(c, bx, by, 76, 52, { sel, hov, r: 10 });
        if (img) c.drawImage(img, bx + 16, by + 4, 44, 44);
        else G.text(c, id, bx + 38, by + 26, { size: 11, align: 'center' });
      });
      ry += 140;
    }
    // layout + size on one row
    if (d.k === 'motif') {
      label('Bố cục', ry);
      cx = px;
      for (const l in S.LAYOUTS) cx += U.chip(c, 'sl' + l, S.LAYOUTS[l], cx, ry + 10, d.l === l, () => this.set('l', l)) + 6;
    }
    const zx = d.k === 'motif' ? px + 262 : px;
    G.text(c, 'Cỡ', zx, ry, { size: 14, weight: 800, color: U.T.accent });
    cx = zx;
    S.SIZES.forEach((n, i) => { cx += U.chip(c, 'sz' + i, n, cx, ry + 10, d.z === i, () => this.set('z', i)) + 6; });
    ry += 62;
    // print / thread colour
    label(d.k === 'motif' ? 'Màu chỉ thêu' : 'Màu hoa văn', ry);
    if (d.k === 'motif') U.chip(c, 'scfull', 'Màu gốc', px + 130, ry - 15, d.c === 'full', () => this.set('c', 'full'));
    this.dots(c, 'sc', px, ry + 30, d.c, (k) => this.set('c', k), d.b);
  },

  // a picture from the player's device: pick / switch / remove it, keep or dye its colours, repeat, size
  photoControls(c, px, ry, w) {
    const U = G.UI, S = G.studio, d = this.d, ids = Object.keys(S.images);
    G.text(c, 'Ảnh trên máy bạn', px, ry, { size: 14, weight: 800, color: U.T.accent });
    ids.concat(ids.length < S.IMG_MAX ? ['+'] : []).forEach((id, i) => {
      const bx = px + (i % 7) * 70, by = ry + 12 + Math.floor(i / 7) * 70, sel = d.i === id;
      const hov = G.inRect(G.pointer, { x: bx, y: by, w: 62, h: 62 });
      if (id === '+') {
        G.ui.hits.push({ id: 'spick', x: bx, y: by, w: 62, h: 62, enabled: true, cb: () => S.pickImage((nid) => { this.d = S.clean(Object.assign({}, this.d, { k: 'anh', i: nid })); G.sfx.click(); }) });
        U.tile(c, bx, by, 62, 62, { hov, r: 10 });
        G.text(c, '+', bx + 31, by + 26, { size: 26, weight: 800, align: 'center', color: U.T.accent });
        G.text(c, 'Chọn ảnh', bx + 31, by + 48, { size: 10, weight: 700, align: 'center', color: U.T.soft });
        return;
      }
      G.ui.hits.push({ id: 'si' + i, x: bx, y: by, w: 62, h: 62, enabled: true, cb: () => this.set('i', id) });
      if (sel) { G.rr(c, bx - 3, by - 3, 68, 68, 12); c.fillStyle = 'rgba(214,90,103,0.4)'; c.fill(); }
      const im = S.images[id];
      c.save(); G.rr(c, bx, by, 62, 62, 10); c.clip();
      if (im.ready) c.drawImage(im.img, bx, by, 62, 62); else { c.fillStyle = '#e9dfcf'; c.fillRect(bx, by, 62, 62); }
      c.restore();
      G.rr(c, bx, by, 62, 62, 10); c.strokeStyle = hov ? G.INK : 'rgba(61,43,37,0.35)'; c.lineWidth = hov ? 2 : 1; c.stroke();
    });
    if (!ids.length) G.wrap(c, 'Bấm “+ Chọn ảnh” để lấy một ảnh hoa văn trên máy (ảnh bạn tự vẽ, tự chụp). Ảnh được cắt vuông và lặp thành vải.', px + 78, ry + 26, w - 116, 18, { size: 12, color: U.T.soft });
    ry += 94 + (ids.length >= 7 ? 70 : 0);
    G.text(c, 'Cách in', px, ry, { size: 14, weight: 800, color: U.T.accent });
    let cx = px;
    for (const k in S.INKS) cx += U.chip(c, 'sn' + k, S.INKS[k], cx, ry + 10, d.c === k, () => this.set('c', k)) + 6;
    ry += 58;
    G.text(c, 'Cách lặp', px, ry, { size: 14, weight: 800, color: U.T.accent });
    cx = px;
    for (const k in S.REPEATS) cx += U.chip(c, 'sr' + k, S.REPEATS[k], cx, ry + 10, d.l === k, () => this.set('l', k)) + 6;
    G.text(c, 'Cỡ', px + 280, ry, { size: 14, weight: 800, color: U.T.accent });
    cx = px + 280;
    S.SIZES.forEach((n, i) => { cx += U.chip(c, 'sz' + i, n, cx, ry + 10, d.z === i, () => this.set('z', i)) + 6; });
    ry += 60;
    const busy = (G.state.customFabrics || []).some((it) => { const dd = S.dec(it.code); return dd && dd.i === d.i; });
    G.button(c, 'sidel', busy ? 'Ảnh đang dùng cho mẫu đã lưu' : 'Xoá ảnh này khỏi máy', px, ry, 230, 30, () => {
      if (S.removeImage(d.i)) { this.d = S.clean(Object.assign({}, this.d)); G.toast('Đã xoá ảnh'); }
    }, { style: 'ghost', size: 12, r: 15, enabled: !busy });
    G.wrap(c, 'Ảnh chỉ nằm trên máy bạn. Muốn cả hẻm dùng được: bấm “Gửi cộng đồng”, mọi người bầu trên GitHub, đủ phiếu sẽ lên kệ.', px, ry + 50, w - 36, 18, { size: 12, color: U.T.soft });
  },

  // two rows of colour buttons; `skip` greys out the ground colour for the print colour
  dots(c, pre, x, y, cur, cb, skip) {
    const keys = Object.keys(G.DATA.colors), per = 11;
    keys.forEach((k, i) => {
      const cx = x + 22 + (i % per) * 44, cy = y + Math.floor(i / per) * 34, sel = cur === k, off = k === skip;
      const hov = !off && Math.hypot(G.pointer.x - cx, G.pointer.y - cy) < 15;
      G.ui.hits.push({ id: pre + k, x: cx - 16, y: cy - 16, w: 32, h: 32, enabled: !off, cb: () => cb(k) });
      c.beginPath(); c.arc(cx, cy, sel ? 15 : hov ? 14 : 12, 0, 7); c.fillStyle = G.DATA.colors[k].hex; c.fill();
      c.strokeStyle = sel ? G.INK : 'rgba(61,43,37,0.35)'; c.lineWidth = sel ? 3 : 1.2; c.stroke();
      if (off) { c.strokeStyle = 'rgba(61,43,37,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx - 8, cy + 8); c.lineTo(cx + 8, cy - 8); c.stroke(); }
      if (sel) { c.beginPath(); c.arc(cx, cy, 4, 0, 7); c.fillStyle = G.art.isLight(k) ? G.INK : '#fff'; c.fill(); }
      if (hov && !sel) this.tip = G.DATA.colors[k].name;
    });
  }
};

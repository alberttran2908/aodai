// Fabric emporium: bolts on shelves, filter by material, buy by the metre onto your roll.
G.scenes.emporium = {
  enter(p) { this.back = p.back || 'desk'; this.mat = this.mat || 'all'; this.sel = this.sel || null; this.qty = 100; this.page = 0; this.sort = this.sort || 'price'; },
  list() {
    const C = G.CAT;
    // 'cong': the shop's own designs and the community's voted-in bolts
    let ids = Object.keys(C.FABRICS).filter((id) => { const f = C.FABRICS[id]; return this.mat === 'all' || (this.mat === 'cong' ? f.custom || f.community : f.mat === this.mat); });
    ids.sort((a, b) => (this.sort === 'price' ? C.FABRICS[a].price - C.FABRICS[b].price : C.FABRICS[a].rank - C.FABRICS[b].rank));
    return ids;
  },
  draw(c) {
    const U = G.UI, C = G.CAT, s = G.state, rk = G.rank();
    U.bg(c);
    // a wooden shop cabinet: back panel, three shelves of upright bolts
    G.rr(c, 20, 62, 820, G.H - 140, 14);
    const back = c.createLinearGradient(0, 62, 0, G.H - 78); back.addColorStop(0, '#6b4329'); back.addColorStop(1, '#4e2f1c');
    c.fillStyle = back; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.4; c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1;
    for (let gx = 60; gx < 830; gx += 64) { c.beginPath(); c.moveTo(gx, 66); c.lineTo(gx, G.H - 82); c.stroke(); }
    // material filter chips
    let x = 36;
    x += U.chip(c, 'mall', 'Tất cả', x, 74, this.mat === 'all', () => { this.mat = 'all'; this.page = 0; }) + 6;
    for (const m in C.MATS) x += U.chip(c, 'm' + m, C.MATS[m].name, x, 74, this.mat === m, () => { this.mat = m; this.page = 0; }) + 6;
    U.chip(c, 'mcong', 'Cộng đồng', x, 74, this.mat === 'cong', () => { this.mat = 'cong'; this.page = 0; });
    G.button(c, 'sort', this.sort === 'price' ? 'Giá ↑' : 'Hạng ↑', 748, 74, 80, 30, () => { this.sort = this.sort === 'price' ? 'rank' : 'price'; }, { style: 'ghost', size: 13, r: 15 });
    const ids = this.list(), per = 15, pages = Math.max(1, Math.ceil(ids.length / per));
    this.page = G.clamp(this.page, 0, pages - 1);
    // shelves
    for (let r = 0; r < 3; r++) {
      const sy = 232 + r * 156;
      c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(32, sy + 12, 796, 8);
      const pl = c.createLinearGradient(0, sy, 0, sy + 14); pl.addColorStop(0, '#b07a4c'); pl.addColorStop(1, '#8a5a36');
      c.fillStyle = pl; c.fillRect(30, sy, 800, 14); c.fillStyle = 'rgba(255,240,210,0.25)'; c.fillRect(30, sy, 800, 2);
    }
    ids.slice(this.page * per, this.page * per + per).forEach((id, i) => {
      const f = C.FABRICS[id], col = i % 5, row = Math.floor(i / 5), bx = 46 + col * 158, sy = 232 + row * 156;
      const lock = f.rank > rk, sel = this.sel === id, hov = G.inRect(G.pointer, { x: bx, y: sy - 110, w: 138, h: 160 });
      G.ui.hits.push({ id: 'b' + id, x: bx, y: sy - 110, w: 138, h: 160, enabled: true, cb: () => { this.sel = id; this.qty = 100; G.sfx.click(); } });
      const lift = sel ? 8 : hov ? 4 : 0, w = 104, h = 96, x0 = bx + 17, y0 = sy - h - lift;
      if (sel) { c.save(); c.shadowColor = 'rgba(246,205,106,0.9)'; c.shadowBlur = 18; G.rr(c, x0, y0, w, h, 8); c.fillStyle = '#fff'; c.fill(); c.restore(); }
      // the bolt: fabric wrapped round a board, folds at the ends, shaded sides
      c.save(); G.rr(c, x0, y0, w, h, 8); c.clip();
      c.beginPath(); c.rect(x0, y0, w, h); G.art.fillFabric(c, f.mat, f.color, 18, f.print);
      const sh = c.createLinearGradient(x0, 0, x0 + w, 0); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(0.18, 'rgba(255,255,255,0.12)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(0.85, 'rgba(0,0,0,0.1)'); sh.addColorStop(1, 'rgba(0,0,0,0.4)');
      c.fillStyle = sh; c.fillRect(x0, y0, w, h);
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1.2;
      for (const fy of [y0 + 10, y0 + 15, y0 + h - 15, y0 + h - 10]) { c.beginPath(); c.moveTo(x0, fy); c.quadraticCurveTo(x0 + w / 2, fy + 3, x0 + w, fy); c.stroke(); }
      c.restore();
      G.rr(c, x0, y0, w, h, 8); c.strokeStyle = 'rgba(30,15,8,0.6)'; c.lineWidth = 1.6; c.stroke();
      if (lock) { G.rr(c, x0, y0, w, h, 8); c.fillStyle = 'rgba(40,25,15,0.55)'; c.fill(); G.art.lock(c, x0 + w / 2, y0 + h / 2, 11); }
      if (s.roll[id]) { c.beginPath(); c.arc(x0 + w - 6, y0 + 8, 11, 0, 7); c.fillStyle = U.T.ok; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 1.5; c.stroke(); G.text(c, '✓', x0 + w - 6, y0 + 9, { size: 12, weight: 800, align: 'center', color: '#fff' }); }
      // paper tag hanging from the shelf edge: name, price (or rank), what you own
      c.save(); c.translate(bx + 69, sy + 14); c.rotate((col % 2 ? 1 : -1) * 0.025);
      c.strokeStyle = 'rgba(60,40,20,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, 4); c.stroke();
      G.rr(c, -64, 4, 128, 34, 5); c.fillStyle = sel ? '#fff4d8' : '#fbf6ea'; c.fill(); c.strokeStyle = 'rgba(90,60,35,0.5)'; c.stroke();
      U.fitText(c, f.name, 0, 15, 120, { size: 11, weight: 700, align: 'center' });
      G.text(c, lock ? `Hạng ${f.rank}` : G.econ.priceLabel(id) + (s.roll[id] ? ` · có ${(s.roll[id] / 100).toFixed(1)}m` : ''), 0, 29, { size: 10, weight: 800, align: 'center', color: lock ? U.T.bad : s.roll[id] ? U.T.ok : U.T.gold });
      c.restore();
    });
    if (pages > 1) {
      G.button(c, 'pp', '‹ Trước', 300, G.H - 120, 100, 32, () => this.page--, { style: 'ghost', size: 13, r: 16, enabled: this.page > 0 });
      U.outlined(c, `${this.page + 1}/${pages}`, 430, G.H - 104, { size: 14, align: 'center', color: '#fff6e6', halo: G.INK });
      G.button(c, 'pn', 'Sau ›', 460, G.H - 120, 100, 32, () => this.page++, { style: 'ghost', size: 13, r: 16, enabled: this.page < pages - 1 });
    }
    // detail panel
    U.card(c, 860, 62, 400, G.H - 140);
    const f = C.FABRICS[this.sel];
    if (!f) {
      G.wrap(c, 'Chọn một cây vải để xem chi tiết. Vải mua theo mét và được cuộn vào kho; phần thừa giữ lại cho áo sau.', 884, 100, 352, 24, { size: 15, color: U.T.soft });
    } else {
      U.swatch(c, f.id, 884, 86, 352, 150, 12);
      G.wrap(c, f.name, 884, 252, 352, 24, { size: 20, weight: 800, color: U.T.accent });
      const m = G.DATA.materials[f.mat];
      G.text(c, `${C.MATS[f.mat].name} · khổ ${m.width} cm · ${G.econ.priceLabel(f.id)}`, 884, 312, { size: 14, color: U.T.soft });
      if (f.custom) G.button(c, 'edit_cf', 'Mẫu của tiệm · sửa', 1086, 96, 140, 30, () => G.go('studio', { back: 'emporium', design: f.design }), { style: 'ghost', size: 12, r: 15 });
      if (f.community) {
        // voted in by the community: who made it, how many votes, and the original post
        G.rr(c, 896, 98, 176, 26, 13); c.fillStyle = 'rgba(52,30,18,0.82)'; c.fill();
        U.fitText(c, `${f.author || 'Cộng đồng'} · ⬆ ${f.votes || 0}`, 906, 111, 160, { size: 12, weight: 700, color: '#fbe9cf' });
        if (f.url) G.button(c, 'cd_post', 'Xem bài gốc', 1106, 96, 120, 30, () => window.open(f.url, '_blank', 'noopener'), { style: 'ghost', size: 12, r: 15 });
      }
      let ty = 344;
      for (const k in f.tags) {
        if (!f.tags[k]) continue;
        G.rr(c, 884, ty - 11, 22 * f.tags[k] + 6, 22, 11); c.fillStyle = C.TAGS[k].col; c.fill();
        G.text(c, `${C.TAGS[k].name} +${f.tags[k]}`, 884 + 22 * f.tags[k] + 16, ty, { size: 13, weight: 700 });
        ty += 28;
      }
      const lock = f.rank > rk;
      if (lock) G.text(c, `Mở khi đạt hạng ${f.rank}`, 884, 500, { size: 16, weight: 800, color: U.T.bad });
      else {
        // the length being sold, laid out along a wooden yardstick (0–6 m)
        const rx = 884, ry = 446, rw = 352;
        G.rr(c, rx, ry, rw, 18, 3); c.fillStyle = '#d9b27a'; c.fill(); c.strokeStyle = '#8a5a36'; c.lineWidth = 1.2; c.stroke();
        for (let k = 0; k <= 12; k++) { const tx = rx + (rw * k) / 12; c.fillStyle = '#6b4329'; c.fillRect(tx, ry, 1, k % 2 ? 6 : 10); if (k % 2 === 0) G.text(c, `${k / 2}m`, tx + (k ? 0 : 6), ry + 13, { size: 8, weight: 800, align: 'center', color: '#6b4329' }); }
        c.save(); G.rr(c, rx, ry - 20, (rw * this.qty) / 600, 18, 4); c.clip(); c.beginPath(); c.rect(rx, ry - 20, rw, 18); G.art.fillFabric(c, f.mat, f.color, 14, f.print); c.restore();
        G.rr(c, rx, ry - 20, (rw * this.qty) / 600, 18, 4); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.stroke();
        G.text(c, 'Số mét', 884, 506, { size: 15, weight: 700 });
        G.button(c, 'qm', '−', 980, 488, 40, 36, () => { this.qty = Math.max(50, this.qty - 50); }, { style: 'ghost', size: 18, r: 18 });
        G.text(c, `${(this.qty / 100).toFixed(1)} m`, 1062, 506, { size: 18, weight: 800, align: 'center' });
        G.button(c, 'qp', '+', 1104, 488, 40, 36, () => { this.qty = Math.min(600, this.qty + 50); }, { style: 'ghost', size: 18, r: 18 });
        const disc = G.bond.discount(f.id), cost = Math.round(((G.econ.price(f.id) * this.qty) / 100) * (1 - disc));
        if (disc) G.text(c, '♥ Khách thân giảm 10%', 1236, 506, { size: 12, weight: 800, align: 'right', color: '#d6698a' });
        G.button(c, 'buy', `Mua · ${cost} xu`, 884, 548, 352, 50, () => {
          if (G.spend(cost)) { s.roll[f.id] = (s.roll[f.id] || 0) + this.qty; G.toast(`Đã thêm ${(this.qty / 100).toFixed(1)} m ${f.name}`); G.save(); }
        }, { style: 'green', size: 18, r: 25 });
      }
    }
    U.secondary(c, 'studio', 'Tự thiết kế vải', () => G.go('studio', { back: 'emporium' }));
    U.primary(c, 'back', this.back === 'sketch' ? '← Về sổ phác thảo' : '← Về quầy', () => G.go(this.back));
    U.hint(c, 'Lọc theo chất liệu • bấm cây vải để xem • mua theo mét');
    U.topbar(c, 'Cửa hàng vải');
  }
};

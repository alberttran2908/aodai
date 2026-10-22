G.scenes.title = {
  enter() {
    this.t = 0; this.confirm = false; this.settings = false;
    if (G.slot !== 'main') G.load('main'); // back from the weekly challenge
  },
  update(dt) { this.t += dt; },
  showcase: [
    // standard fabrics; the large motifs are placed decorations, as in the decorate step
    { design: { neck: 'dung', sleeve: 'dai', length: 'got', hem: 'thang', slit: 'cao', fit: 'om', trim: 'none', pants: 'trang', buttons: 'ngoc', head: 'hoacai', accent: 'hongsen' }, fab: { mat: 'lua', color: 'trang', print: 'tron' }, decor: [{ group: 'tranh', id: 'img_pl_sen', x: 3, y: 82, size: 40, rot: 0 }] },
    { design: { neck: 'dung', sleeve: 'dai', length: 'got', hem: 'thang', slit: 'cao', fit: 'om', trim: 'vang', pants: 'trang', buttons: 'vang', head: 'khanvan', layer: 'hai', accent: 'vang' }, fab: { mat: 'gam', color: 'do', print: 'img_maudon' }, decor: [{ group: 'tranh', id: 'img_pl_rong', x: 2, y: 74, size: 34, rot: 0 }] },
    { design: { neck: 'thuyen', sleeve: 'lung', length: 'got', hem: 'thang', slit: 'cao', fit: 'om', trim: 'none', pants: 'trang', buttons: 'an', head: 'nonla', accent: 'vang' }, fab: { mat: 'totam', color: 'covit', print: 'tron' }, decor: [{ group: 'tranh', id: 'img_pl_phuong', x: 3, y: 76, size: 34, rot: 0 }] }
  ],
  draw(c) {
    G.art.shopBg(c);
    // three mannequins showing different styles
    this.showcase.forEach((it, i) => {
      const asm = G.geo.build(it.design, 'M', false);
      c.save();
      const z = i === 1 ? 3.3 : 3;
      c.translate(800 + i * 175, (i === 1 ? 705 : 690) - asm.botY * z);
      c.scale(z, z);
      G.art.garment(c, asm, it.fab, { mannequin: true, decorItems: it.decor, t: this.t + i });
      c.restore();
    });
    const cx = 380;
    c.save();
    const a = G.easeOut(this.t * 1.5);
    const dy = (1 - a) * 30;
    c.globalAlpha = a;
    this.sign(c, cx, 150 - dy);
    c.restore();

    // one way in: the shop. Everything else lives behind the ⚙ (or inside the shop)
    const by = 380;
    const enter = () => {
      if (!G.hasSave) G.reset();
      G.go(G.state.econ.bankrupt ? 'ledger' : 'desk');
    };
    G.button(c, 'enter', G.hasSave ? 'Vào tiệm' : 'Mở cửa tiệm', cx - 190, by, 380, 72, enter, { size: 28, r: 36 });
    if (G.hasSave) G.UI.outlined(c, `${G.state.shopName} · Hạng ${G.rank()} · ngày ${G.state.day}`, cx, by + 100, { size: 17, align: 'center' });
    G.button(c, 'gear', '⚙', G.W - 70, 64, 48, 44, () => { this.settings = !this.settings; this.confirm = false; }, { style: 'ghost', size: 22, r: 22 });
    // the browser offers to install the game: an app icon on the home screen, full screen, playable offline
    if (G.installPrompt) G.button(c, 'install', '📲 Cài game lên máy', G.W - 300, 64, 220, 44, () => {
      const p = G.installPrompt; G.installPrompt = null;
      p.prompt(); p.userChoice.then((ch) => { if (ch.outcome === 'accepted') G.toast('Đã cài! Mở game từ màn hình chính nhé.', G.C.green); }).catch(() => {});
    }, { style: 'gold', size: 15, r: 22 });
    G.text(c, 'Các nhân vật “người nổi tiếng” trong game là hư cấu, nhại vui, không liên quan tới người thật.', cx, 690, { size: 11, align: 'center', color: 'rgba(251,246,236,0.85)' });
    if (this.settings) this.settingsPanel(c);
  },
  // the shop's lacquered signboard, hanging on two cords and swaying a touch
  sign(c, cx, y) {
    const w = 600, h = 160, sw = Math.sin(this.t * 1.3) * 0.012;
    c.save();
    c.translate(cx, y - 80); c.rotate(sw); c.translate(-cx, -(y - 80));
    c.strokeStyle = '#4a2c22'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(cx - 180, y - 90); c.lineTo(cx - 200, y + 8); c.moveTo(cx + 180, y - 90); c.lineTo(cx + 200, y + 8); c.stroke();
    for (const nx of [cx - 180, cx + 180]) { c.beginPath(); c.arc(nx, y - 90, 6, 0, 7); c.fillStyle = '#c9952e'; c.fill(); c.stroke(); }
    const x = cx - w / 2;
    G.rr(c, x + 2, y + 10, w, h, 18); c.fillStyle = 'rgba(30,12,6,0.35)'; c.fill();
    G.rr(c, x, y, w, h, 18);
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#a3303e'); g.addColorStop(1, '#6e1c28');
    c.fillStyle = g; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 3; c.stroke();
    // gold inlay frame with corner flourishes
    G.rr(c, x + 12, y + 12, w - 24, h - 24, 10); c.strokeStyle = '#e2b85a'; c.lineWidth = 2.5; c.stroke();
    G.rr(c, x + 18, y + 18, w - 36, h - 36, 7); c.strokeStyle = 'rgba(226,184,90,0.45)'; c.lineWidth = 1; c.stroke();
    for (const [qx, qy] of [[x + 12, y + 12], [x + w - 12, y + 12], [x + 12, y + h - 12], [x + w - 12, y + h - 12]]) {
      c.save(); c.translate(qx, qy); c.rotate(Math.PI / 4); c.fillStyle = '#e2b85a'; c.fillRect(-6, -6, 12, 12); c.strokeStyle = G.INK; c.lineWidth = 1.5; c.strokeRect(-6, -6, 12, 12); c.restore();
    }
    c.fillStyle = 'rgba(255,255,255,0.08)'; G.rr(c, x + 20, y + 20, w - 40, 40, 8); c.fill();
    G.text(c, 'Tiệm May Áo Dài', cx, y + 70, { size: 58, font: G.SERIF, weight: 700, align: 'center', color: '#3a0e14' });
    G.text(c, 'Tiệm May Áo Dài', cx, y + 66, { size: 58, font: G.SERIF, weight: 700, align: 'center', color: '#ffe6a6' });
    G.text(c, 'ĐO · THIẾT KẾ · CẮT · MAY · TRANG TRÍ', cx, y + 122, { size: 15, font: G.GAME, weight: 700, align: 'center', color: '#f1c97a' });
    c.restore();
  },
  // ⚙ Cài đặt: only things that never change the game itself (it is online: everyone plays the same rules)
  settingsPanel(c) {
    const U = G.UI, s = G.state, x = G.W - 470, y = 116, w = 440;
    c.fillStyle = 'rgba(43,29,24,0.25)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'set_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => { this.settings = false; this.confirm = false; } });
    U.card(c, x, y, w, 366);
    G.wrap(c, 'Mọi người chơi cùng một luật để so “Giá trị tiệm” và bảng xếp hạng công bằng.', x + 24, y + 314, w - 48, 18, { size: 12, color: U.T.soft });
    U.title(c, 'Cài đặt', x + 24, y + 38, { size: 24 });
    const row = (i, label, value, cb, note) => {
      const ry = y + 76 + i * 76;
      G.text(c, label, x + 24, ry + 14, { size: 15, weight: 700 });
      if (note) G.text(c, note, x + 24, ry + 36, { size: 12, color: U.T.soft });
      G.button(c, 'set' + i, value, x + w - 174, ry, 150, 40, cb, { style: 'ghost', size: 14, r: 20 });
    };
    row(0, 'Âm thanh', s.muted ? 'Tắt' : 'Bật', () => { s.muted = !s.muted; G.save(); });
    row(2, 'Hướng dẫn của Bà Tư', s.tut && s.tut.on ? 'Đang bật' : 'Xem lại', () => { G.tut.start(); this.settings = false; G.toast('Bà Tư sẽ chỉ lại từ đơn kế tiếp'); }, 'Chỉ từng bước cho một đơn may');
    if (!this.confirm) row(1, 'Mở tiệm mới', 'Bắt đầu lại', () => { this.confirm = true; }, 'Xoá tiệm hiện tại');
    else {
      const ry = y + 76 + 76;
      G.text(c, 'Xoá tiệm cũ và mở lại từ đầu?', x + 24, ry + 14, { size: 15, weight: 800, color: U.T.bad });
      G.button(c, 'setyes', 'Mở lại', x + 24, ry + 32, 180, 40, () => { G.reset(); this.settings = false; this.confirm = false; G.go('desk'); });
      G.button(c, 'setno', 'Huỷ', x + 216, ry + 32, 120, 40, () => { this.confirm = false; }, { style: 'ghost', size: 15 });
    }
  }
};

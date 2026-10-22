// Ghé tiệm bạn: a friend's shop link (#s=…) opens their shop front — the sign, how long they have been open,
// and their three best dresses on mannequins. Each can become a "May y chang" order in your own shop, and a
// first visit to a shop each day brings a small gift (up to three shops a day).
G.scenes.visit = {
  GIFT: 30, PER_DAY: 3,
  enter() {
    this.t = 0;
    this.sh = G.share.decodeShop(location.hash);
    this.views = this.sh ? this.sh.dresses.map((pl) => ({ pl, v: G.share.view(pl) })) : [];
  },
  update(dt) { this.t += dt; },
  home() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } },
  leave() { this.home(); G.go('title'); },
  // today's visit gifts (Vietnam calendar day), kept in your own save
  gifts() {
    const s = G.state, day = G.dateKeyVN();
    if (!s.visitGift || s.visitGift.day !== day) s.visitGift = { day, shops: [] };
    return s.visitGift;
  },
  giftState() {
    if (!G.hasSave || G.slot !== 'main' || G.state.isDaily) return 'none';
    if (this.sh.shop === G.state.shopName) return 'own';
    const g = this.gifts();
    return g.shops.includes(this.sh.shop) ? 'taken' : g.shops.length >= this.PER_DAY ? 'full' : 'ready';
  },
  draw(c) {
    const U = G.UI, sh = this.sh;
    U.bg(c);
    if (!sh) {
      U.card(c, 340, 220, 600, 200);
      G.text(c, 'Đường link tiệm bị hỏng hoặc không đọc được.', 640, 290, { size: 18, weight: 700, align: 'center' });
      U.primary(c, 'home', 'Mở tiệm của bạn', () => this.leave());
      return U.topbar(c, 'Ghé tiệm bạn');
    }
    // the shop sign: a lacquered board hung on two cords
    const sx = 640, sy = 70;
    c.save();
    c.strokeStyle = '#5e3a24'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx - 200, 52); c.lineTo(sx - 170, sy + 8); c.moveTo(sx + 200, 52); c.lineTo(sx + 170, sy + 8); c.stroke();
    G.rr(c, sx - 262, sy + 4, 524, 86, 12); c.fillStyle = 'rgba(40,20,8,0.3)'; c.fill();
    G.rr(c, sx - 266, sy, 532, 84, 12);
    const g = c.createLinearGradient(0, sy, 0, sy + 84); g.addColorStop(0, '#b8343f'); g.addColorStop(1, '#8a1f2c'); c.fillStyle = g; c.fill();
    c.strokeStyle = '#e8b955'; c.lineWidth = 3; c.stroke();
    G.rr(c, sx - 256, sy + 8, 512, 68, 8); c.strokeStyle = 'rgba(232,185,85,0.55)'; c.lineWidth = 1.5; c.stroke();
    c.restore();
    U.fitText(c, sh.shop, sx, sy + 40, 480, { size: 34, font: G.SERIF, weight: 700, align: 'center', color: '#ffe9c4' });
    G.text(c, `Hạng ${sh.rank} · mở cửa ${sh.days} ngày · đã may ${sh.made} áo`, sx, sy + 68, { size: 14, weight: 700, align: 'center', color: '#f6d9a8' });
    // the window: up to three dresses on mannequins, under warm light
    if (!this.views.length) G.text(c, 'Tiệm này chưa treo chiếc áo nào trong tủ kính.', 640, 360, { size: 18, weight: 700, align: 'center', color: U.T.soft });
    const n = this.views.length, cw = 300, gap = 36, x0 = 640 - (n * cw + (n - 1) * gap) / 2;
    this.views.forEach(({ pl, v }, i) => {
      const x = x0 + i * (cw + gap), y = 176, h = 430;
      const sp = c.createRadialGradient(x + cw / 2, y + 160, 20, x + cw / 2, y + 200, 260);
      sp.addColorStop(0, 'rgba(255,250,240,0.95)'); sp.addColorStop(1, 'rgba(255,250,240,0)');
      c.fillStyle = sp; c.fillRect(x - 20, y - 10, cw + 40, h - 40);
      const asm = G.geo.build(v.design, v.scale, false), z = Math.min((h - 90) / (asm.botY - asm.topY), (cw - 30) / asm.bounds.w, 2.6);
      c.save(); c.translate(x + cw / 2, y - asm.topY * z); c.scale(z, z);
      G.art.garment(c, asm, v.fabs, { mannequin: true, t: this.t + i * 1.7, decorItems: v.decorItems });
      c.restore();
      const cl = v.client && G.client(v.client);
      U.fitText(c, [cl ? 'cho ' + cl.name : 'Áo trong tủ kính', pl.quality ? `chất lượng ${pl.quality}` : null].filter(Boolean).join(' · '), x + cw / 2, y + h - 66, cw, { size: 14, weight: 800, align: 'center' });
      if (pl.kim) U.needles(c, x + cw / 2 - pl.kim * 9, y + h - 46, pl.kim, 0.5);
      G.button(c, 'vs' + i, 'Đặt may y chang', x + cw / 2 - 90, y + h - 30, 180, 36, () => {
        if (!G.hasSave) G.reset();
        G.share.queueCopy(pl);
        G.toast('Đã thêm đơn “May y chang” vào tiệm của bạn!', G.C.green);
        this.home(); G.go('desk');
      }, { style: 'green', size: 14, r: 18 });
    });
    // a visitor's gift, once per shop per day
    const gs = this.giftState(), bx = 24, by = G.H - 66;
    if (gs === 'ready') G.button(c, 'vgift', `Nhận quà ghé thăm · ${this.GIFT} xu`, bx, by, 300, 50, () => { this.gifts().shops.push(this.sh.shop); G.addCoins(this.GIFT); G.sfx.coin(); G.toast(`Quà ghé thăm “${this.sh.shop}”: +${this.GIFT} xu`, G.C.green); G.save(); }, { style: 'gold', size: 15, r: 25 });
    else if (gs !== 'none') G.text(c, { own: 'Đây là tiệm của bạn — gửi link cho bạn bè ghé nhé!', taken: '✓ Hôm nay đã nhận quà ghé tiệm này', full: `Hôm nay đã nhận đủ quà ghé ${this.PER_DAY} tiệm` }[gs], bx, by + 25, { size: 14, weight: 700, color: gs === 'taken' ? U.T.ok : U.T.soft });
    G.button(c, 'vslink', 'Sao chép link', G.W - 476, G.H - 66, 196, 50, () => G.share.copy(location.href), { style: 'ghost', size: 15, r: 25 });
    U.primary(c, 'home', 'Mở tiệm của bạn', () => this.leave());
    U.topbar(c, 'Ghé tiệm bạn');
  }
};

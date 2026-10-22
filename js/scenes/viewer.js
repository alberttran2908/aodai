// Viewer for a shared dress link (#d=…): the dress under studio light, who made it, its style,
// and "Đặt may y chang" — the friend's dress becomes an order in your own shop.
G.scenes.viewer = {
  enter() {
    this.t = 0;
    this.pl = G.share.decode(location.hash);
    this.v = this.pl ? G.share.view(this.pl) : null;
  },
  update(dt) { this.t += dt; },
  leave() { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { location.hash = ''; } G.go('title'); },
  draw(c) {
    const U = G.UI, pl = this.pl, v = this.v;
    U.bg(c);
    if (!v) {
      U.card(c, 340, 220, 600, 200);
      G.text(c, 'Đường link áo bị hỏng hoặc không đọc được.', 640, 290, { size: 18, weight: 700, align: 'center' });
      U.primary(c, 'home', 'Mở tiệm của bạn', () => this.leave());
      return U.topbar(c, 'Xem áo');
    }
    const sp = c.createRadialGradient(360, 380, 40, 360, 380, 440);
    sp.addColorStop(0, 'rgba(255,250,240,0.95)'); sp.addColorStop(1, 'rgba(255,250,240,0)');
    c.fillStyle = sp; c.fillRect(0, 50, 760, 670);
    const asm = G.geo.build(v.design, v.scale, false), z = Math.min(620 / (asm.botY - asm.topY), 3.4);
    c.save(); c.translate(360, 62 - asm.topY * z); c.scale(z, z);
    G.art.garment(c, asm, v.fabs, { mannequin: true, cache: true, t: this.t, decorItems: v.decorItems });
    c.restore();
    U.card(c, 760, 70, 496, 470);
    G.text(c, 'May tại', 784, 102, { size: 13, color: U.T.soft });
    U.fitText(c, pl.shop, 784, 132, 450, { size: 28, font: G.SERIF, weight: 700, color: U.T.accent });
    const cl = v.client && G.client(v.client);
    G.text(c, [cl ? 'cho ' + cl.name : null, pl.date ? pl.date.split('-').reverse().join('/') : null].filter(Boolean).join(' · '), 784, 162, { size: 14, color: U.T.soft });
    if (pl.quality) G.text(c, `Chất lượng ${pl.quality}`, 784, 196, { size: 16, weight: 800 });
    if (pl.kim) { U.needles(c, 940, 196, pl.kim, 0.7); }
    c.fillStyle = U.T.line; c.fillRect(784, 220, 448, 1.5);
    let y = 246;
    for (const k of G.CAT.TAG_KEYS) { U.tagBar(c, 800, y, 432, k, v.tags[k]); y += 24; }
    y += 8;
    const fabNames = [...new Set(Object.values(v.fabIds))].map((id) => G.CAT.FABRICS[id].name);
    G.wrap(c, 'Vải: ' + fabNames.join(', '), 784, y, 448, 20, { size: 13, color: U.T.ink });
    G.button(c, 'vcopy', 'Đặt may y chang', 784, 470, 220, 50, () => {
      if (!G.hasSave) G.reset();
      G.share.queueCopy(pl);
      G.toast('Đã thêm đơn “May y chang” vào tiệm của bạn!', G.C.green);
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
      G.go('desk');
    }, { style: 'green', size: 16, r: 25 });
    G.button(c, 'vlink', 'Sao chép link', 1016, 470, 216, 50, () => G.share.copy(location.href), { style: 'ghost', size: 16, r: 25 });
    U.primary(c, 'home', 'Mở tiệm của bạn', () => this.leave());
    U.hint(c, 'Áo dài được may trong game Tiệm May Áo Dài · đo, phác thảo, cắt, may, trang trí');
    U.topbar(c, 'Xem áo được chia sẻ');
  }
};

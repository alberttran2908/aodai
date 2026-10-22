// Album: every dress delivered, as it was photographed.
G.scenes.gallery = {
  enter() { this.page = 0; this.t = 0; },
  update(dt) { this.t += dt; },
  draw(c) {
    const U = G.UI, s = G.state;
    U.bg(c);
    // a cork board in a wooden frame, the photos pinned up as polaroids
    G.rr(c, 20, 62, G.W - 40, G.H - 140, 14); c.fillStyle = '#7a5236'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.4; c.stroke();
    G.rr(c, 32, 74, G.W - 64, G.H - 164, 8);
    const cork = c.createLinearGradient(0, 74, 0, G.H - 90); cork.addColorStop(0, '#cfa877'); cork.addColorStop(1, '#bb935f');
    c.fillStyle = cork; c.fill();
    c.fillStyle = 'rgba(90,55,25,0.22)';
    for (let k = 0; k < 420; k++) { const px = 36 + ((k * 197) % (G.W - 72)), py = 78 + ((k * 89 + (k * k) % 37) % (G.H - 172)); c.fillRect(px, py, 2, 2); }
    U.ribbon(c, `Album áo · ${s.collection.length}`, G.W / 2, 96, { size: 17, h: 32, tail: 18 });
    const list = s.collection.slice().reverse(), per = 6, pages = Math.max(1, Math.ceil(list.length / per));
    this.page = G.clamp(this.page, 0, pages - 1);
    if (!list.length) U.outlined(c, 'Chưa có chiếc áo nào — hãy nhận đặt may ở quầy.', G.W / 2, 360, { size: 18, align: 'center' });
    const BD = G.scenes.finish.BACKDROPS;
    list.slice(this.page * per, this.page * per + per).forEach((it, i) => {
      const x = 48 + i * 198, y = 128, w = 186, h = 456, P = it.photo || { bg: 0, light: 0 }, B = BD[P.bg || 0];
      c.save(); c.translate(x + w / 2, y + h / 2); c.rotate(((i % 3) - 1) * 0.025 + (i % 2 ? 0.01 : -0.012)); c.translate(-x - w / 2, -y - h / 2);
      // polaroid frame with the shoot's backdrop and light
      c.fillStyle = 'rgba(40,20,8,0.3)'; c.fillRect(x + 3, y + 6, w, h);
      c.fillStyle = '#fffdf7'; c.fillRect(x, y, w, h);
      const px = x + 9, py = y + 9, pw = w - 18, ph = h - 76;
      const g = c.createLinearGradient(0, py, 0, py + ph); g.addColorStop(0, B.a); g.addColorStop(0.8, B.b); g.addColorStop(1, B.f);
      c.fillStyle = g; c.fillRect(px, py, pw, ph);
      const asm = G.geo.build(it.design, it.scale || 1, false), z = Math.min((ph - 10) / (asm.botY - asm.topY), (pw - 10) / asm.bounds.w);
      c.save(); c.beginPath(); c.rect(px, py, pw, ph); c.clip();
      c.translate(px + pw / 2, py + 6 - asm.topY * z); c.scale(z, z);
      G.art.garment(c, asm, it.fabs || it.fab, { mannequin: true, noSheen: true, t: this.t + i, decorItems: it.decorItems });
      c.restore();
      if (P.light === 1) { c.save(); c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(255,214,170,0.7)'; c.fillRect(px, py, pw, ph); c.restore(); }
      else if (P.light === 2) { const vg = c.createRadialGradient(px + pw / 2, py + ph * 0.45, 30, px + pw / 2, py + ph / 2, ph * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,6,4,0.5)'); c.fillStyle = vg; c.fillRect(px, py, pw, ph); }
      c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 1; c.strokeRect(px, py, pw, ph);
      // a strip of tape holding it up
      c.save(); c.translate(x + w / 2, y - 2); c.rotate(-0.06); c.fillStyle = 'rgba(240,226,180,0.8)'; c.fillRect(-30, -9, 60, 18); c.restore();
      U.fitText(c, it.title ? `${it.name} · ${it.title}` : it.name || '', x + w / 2, y + h - 44, w - 16, { size: 15, weight: 700, font: G.SERIF, align: 'center' });
      G.text(c, it.success ? `✓ Chất lượng ${it.quality}` : `✗ Chất lượng ${it.quality || 0}`, x + w / 2, y + h - 20, { size: 12, weight: 700, align: 'center', color: it.success ? U.T.ok : U.T.bad });
      // event stamp, needles from the paper, share buttons
      const ev = it.ev && G.EVENTS && G.EVENTS.find((e) => e.id === it.ev);
      if (ev) { c.save(); c.translate(x + 40, y + 30); c.rotate(-0.2); G.rr(c, -34, -12, 68, 24, 6); c.strokeStyle = '#b23a48'; c.lineWidth = 2; c.stroke(); U.fitText(c, ev.name, 0, 0, 60, { size: 10, weight: 800, align: 'center', color: '#b23a48' }); c.restore(); }
      if (it.kim) U.needles(c, x + 14, y + h - 78, it.kim, 0.45);
      if (G.share.canShare(it)) {
        G.button(c, 'gl' + it.id, '🔗', x + w - 40, y + 8, 32, 30, () => G.share.copyLink(it), { style: 'ghost', size: 14, r: 15 });
        G.button(c, 'gc' + it.id, '🖼', x + w - 40, y + 44, 32, 30, () => G.share.saveCard(G.share.snapView(it), { shop: it.shop || s.shopName, client: it.name, quality: it.quality, kim: it.kim }), { style: 'ghost', size: 14, r: 15 });
      }
      c.restore();
    });
    if (pages > 1) {
      G.button(c, 'pp', '‹ Trước', 480, G.H - 120, 100, 32, () => this.page--, { style: 'ghost', size: 13, r: 16, enabled: this.page > 0 });
      G.text(c, `${this.page + 1}/${pages}`, 640, G.H - 104, { size: 13, weight: 700, align: 'center' });
      G.button(c, 'pn', 'Sau ›', 700, G.H - 120, 100, 32, () => this.page++, { style: 'ghost', size: 13, r: 16, enabled: this.page < pages - 1 });
    }
    // the whole shop in one link: friends open it to see your sign and three best dresses
    if (!s.isDaily) G.button(c, 'shoplink', '🏮 Khoe cả tiệm', G.W - 236 - 14 - 230, G.H - 66, 230, 50, () => G.share.copyShop(), { style: 'gold', size: 15, r: 25, enabled: s.collection.some((it) => it.success && G.share.canShare(it)) });
    U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.hint(c, '🔗 link một áo · 🖼 thẻ ảnh · 🏮 link cả tiệm: bạn bè ghé xem và nhận quà');
    U.topbar(c, 'Album áo');
  }
};

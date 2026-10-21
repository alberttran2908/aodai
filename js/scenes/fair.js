// Hội chợ phố đi bộ: once a month, before the bills, price each ready-to-wear dress on your stall and watch
// the passers-by. Cheap sells fast, overpriced only gets looks; unsold dresses age and lose value.
G.scenes.fair = {
  STEPS: [0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5],
  enter() {
    const s = G.state;
    this.m = s.econ.fairPending; this.t = 0; this.log = null; this.k = 0; this.done = null;
    this.items = s.rack.filter((it) => !it.sold).slice(0, 5);
    this.items.forEach((it) => { it.step = it.step !== undefined ? it.step : 6; it.price = this.priceOf(it); });
  },
  priceOf(it) { return Math.round((G.fair.value(it) * this.STEPS[it.step]) / 10) * 10; },
  update(dt) {
    this.t += dt;
    if (this.log && !this.done) {
      this.k = Math.min(this.log.length, this.k + dt / 0.7);
      if (this.k >= this.log.length) this.done = G.fair.close(this.m);
    }
  },
  lanterns(c) {
    c.strokeStyle = 'rgba(80,50,30,0.5)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(0, 70); for (let x = 0; x <= G.W; x += 40) c.lineTo(x, 70 + Math.sin(x / 80) * 8); c.stroke();
    for (let x = 40; x < G.W; x += 110) {
      const y = 82 + Math.sin(x / 80) * 8, col = ['#d9534f', '#e9b949', '#d6698a', '#c9952e'][(x / 110) % 4 | 0];
      const g = c.createRadialGradient(x, y + 10, 2, x, y + 10, 20); g.addColorStop(0, '#fff3c4'); g.addColorStop(1, col);
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 12, 13, 16, 0, 0, 7); c.fill();
    }
  },
  draw(c) {
    const U = G.UI, s = G.state;
    const sky = c.createLinearGradient(0, 0, 0, G.H); sky.addColorStop(0, '#2b2340'); sky.addColorStop(0.6, '#5a3a48'); sky.addColorStop(1, '#3a2620');
    c.fillStyle = sky; c.fillRect(0, 0, G.W, G.H);
    this.lanterns(c);
    G.text(c, `HỘI CHỢ PHỐ ĐI BỘ · THÁNG ${this.m + 1}`, G.W / 2, 128, { size: 28, font: G.SERIF, weight: 700, align: 'center', color: '#ffe3a8' });
    const tr = s.press.trend && G.CAT.TAGS[s.press.trend.tag];
    if (tr) G.text(c, `Dự báo gu của Báo Trà Đá: ${tr.name} — áo hợp mốt có giá trị +25%`, G.W / 2, 156, { size: 14, align: 'center', color: '#f3e3c7' });
    const shown = this.log ? this.log.slice(0, Math.floor(this.k)) : [];
    this.items.forEach((it, i) => {
      const x = 70 + i * 232, w = 210, snap = s.collection.find((x2) => x2.id === it.snapId);
      c.fillStyle = 'rgba(255,240,210,0.08)'; G.rr(c, x, 176, w, 330, 14); c.fill();
      if (snap) {
        const asm = G.geo.build(snap.design, snap.scale || 1, false), z = Math.min(300 / (asm.botY - asm.topY), 2.6);
        c.save(); c.translate(x + w / 2, 186 - asm.topY * z); c.scale(z, z);
        G.art.garment(c, asm, snap.fabs, { mannequin: true, still: true, noSheen: true, decorItems: snap.decorItems });
        c.restore();
      }
      // price tag
      c.save(); c.translate(x + w - 56, 200); c.rotate(-0.06);
      G.rr(c, -50, -18, 100, 36, 8); c.fillStyle = it.sold ? '#4f8a5b' : '#fbf6ec'; c.fill();
      G.text(c, `${it.price} xu`, 0, 0, { size: 15, weight: 800, align: 'center', color: it.sold ? '#fff' : '#3d2b25' });
      c.restore();
      if (it.sold) { c.save(); c.translate(x + w / 2, 360); c.rotate(-0.25); c.strokeStyle = '#d9534f'; c.lineWidth = 4; G.rr(c, -70, -24, 140, 48, 8); c.stroke(); G.text(c, 'ĐÃ BÁN', 0, 2, { size: 26, font: G.SERIF, weight: 700, align: 'center', color: '#d9534f' }); c.restore(); }
      const v = G.fair.value(it);
      G.text(c, `Giá trị khoảng ${Math.round(v / 10) * 10}${G.fair.trendy(it) ? ' · hợp mốt ✓' : ''}`, x + w / 2, 524, { size: 13, weight: 700, align: 'center', color: '#f3e3c7' });
      if (!this.log) {
        G.button(c, 'fm' + i, '−', x + 8, 540, 40, 36, () => { it.step = Math.max(0, it.step - 1); it.price = this.priceOf(it); }, { style: 'ghost', size: 18, r: 18 });
        G.text(c, `${Math.round(this.STEPS[it.step] * 100)}%`, x + w / 2, 558, { size: 16, weight: 800, align: 'center', color: '#fff' });
        G.button(c, 'fp' + i, '+', x + w - 48, 540, 40, 36, () => { it.step = Math.min(this.STEPS.length - 1, it.step + 1); it.price = this.priceOf(it); }, { style: 'ghost', size: 18, r: 18 });
      }
    });
    // passers-by
    if (this.log) {
      const cur = shown[shown.length - 1];
      if (cur) {
        U.card(c, 290, 586, 700, 64, { fill: 'rgba(251,246,236,0.96)' });
        G.text(c, cur.buy ? '😊' : cur.say.includes('ắt') || cur.say.includes('Cắt') ? '😬' : '😐', 318, 618, { size: 28 });
        G.wrap(c, '“' + cur.say + '”', 356, 604, 600, 20, { size: 16, font: G.SERIF, color: '#3d2b25' });
      }
      G.text(c, `Người qua đường: ${Math.floor(this.k)}/${this.log.length}`, 40, 620, { size: 14, color: '#f3e3c7' });
    }
    if (this.done) {
      U.card(c, 380, 236, 520, 190);
      U.title(c, this.done.sold ? `Bán được ${this.done.sold} áo!` : 'Hôm nay chưa ai mua', 640, 280, { align: 'center' });
      G.text(c, `Thu về ${this.done.total} xu · danh tiếng +${(0.25 * this.done.sold).toFixed(2)}`, 640, 320, { size: 17, weight: 800, align: 'center', color: U.T.gold });
      G.text(c, 'Áo chưa bán ở lại sạp, mất 10% giá trị mỗi tháng.', 640, 352, { size: 13, align: 'center', color: U.T.soft });
      U.primary(c, 'fdone', G.econ.on() ? 'Dọn sạp, trả tiền' : 'Dọn sạp', () => G.go('desk'));
    } else if (!this.log) {
      U.primary(c, 'fopen', 'Mở sạp', () => { this.items.forEach((it) => { it.price = this.priceOf(it); }); this.log = G.fair.run(this.m); this.k = 0; });
      U.hint(c, 'Đặt giá cho từng áo: rẻ thì bán nhanh, đắt quá thì người ta chỉ ngắm');
    }
    U.topbar(c, 'Hội chợ phố đi bộ');
  }
};

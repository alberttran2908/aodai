// Báo Trà Đá: an old newsprint page — Madame Sa's "Kim Chỉ Nam" review with Tí Flash's photo of the dress,
// alley gossip, Kevin's ad and the 3-day style forecast (a dress strong in that style earns +10%).
G.scenes.paper = {
  INK: '#2a211c', PAPER: '#f4efe3',
  enter() { const P = G.state.press; this.idx = P.issues.length - 1; P.unread = 0; G.save(); this.photos = this.photos || {}; },
  issue() { return G.state.press.issues[this.idx] || null; },
  // the dress photo, desaturated and warmed like newsprint (cached per album entry)
  photo(snapId, w, h) {
    if (this.photos[snapId]) return this.photos[snapId];
    const snap = G.state.collection.find((x) => x.id === snapId); if (!snap) return null;
    const cv = document.createElement('canvas'); cv.width = w * 2; cv.height = h * 2;
    const c = cv.getContext('2d');
    c.fillStyle = '#e9e2d3'; c.fillRect(0, 0, cv.width, cv.height);
    const asm = G.geo.build(snap.design, snap.scale || 1, false), z = Math.min((cv.height - 24) / (asm.botY - asm.topY), 9);
    c.save(); c.translate(cv.width / 2, 12 - asm.topY * z); c.scale(z, z);
    G.art.garment(c, asm, snap.fabs, { mannequin: true, still: true, decorItems: snap.decorItems });
    c.restore();
    c.globalCompositeOperation = 'saturation'; c.fillStyle = '#808080'; c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = '#e9d9b8'; c.fillRect(0, 0, cv.width, cv.height);
    c.globalCompositeOperation = 'source-over';
    return (this.photos[snapId] = cv);
  },
  draw(c) {
    const U = G.UI, P = G.state.press, is = this.issue(), INK = this.INK;
    U.bg(c);
    U.card(c, 40, 60, 1200, 588, { fill: this.PAPER, r: 6, stitch: false, stroke: '#9c8f7a' }); // newsprint, no stitching
    G.text(c, 'BÁO TRÀ ĐÁ', 640, 98, { size: 50, font: G.SERIF, weight: 700, align: 'center', color: INK });
    c.fillStyle = INK; c.fillRect(60, 126, 1160, 2.5); c.fillRect(60, 131, 1160, 1);
    if (!is) {
      G.text(c, 'Chưa có số báo nào. Giao vài chiếc áo thật đẹp, Tí Flash sẽ ghé!', 640, 330, { size: 18, font: G.SERIF, align: 'center', color: INK });
    } else {
      G.text(c, `Số ${is.no} · ${G.cal.label(is.day)} · Tin hẻm nóng hổi, uống mát lạnh · Giá: 2 xu`, 640, 146, { size: 13, align: 'center', color: '#5a4a40' });
      c.fillStyle = 'rgba(42,33,28,0.35)'; c.fillRect(775, 162, 1, 470);
      const a = is.articles[0];
      if (a) {
        G.wrap(c, a.headline, 60, 162, 700, 34, { size: 27, font: G.SERIF, weight: 700, color: INK });
        U.needles(c, 60, 250, a.kim, 0.8);
        G.text(c, 'Kim Chỉ Nam · Madame Sa', 240, 250, { size: 12, weight: 700, color: '#8a7366' });
        const ph = a.snapId ? this.photo(a.snapId, 250, 340) : null;
        if (ph) c.drawImage(ph, 60, 272, 250, 340);
        else { c.fillStyle = '#e4dccb'; c.fillRect(60, 272, 250, 340); G.text(c, 'Ảnh đã thất lạc', 185, 440, { size: 14, align: 'center', color: '#8a7366' }); }
        c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(60, 272, 250, 340);
        G.text(c, 'Ảnh: Tí Flash', 60, 624, { size: 11, font: G.SERIF, color: '#8a7366' });
        let y = 274;
        for (const p of a.body) y += G.wrap(c, p, 330, y, 425, 21, { size: 14, color: INK }) + 8;
        if (a.quote) {
          y += 6;
          const qh = G.wrap(c, '“' + a.quote + '”', 346, y, 405, 22, { size: 15, font: G.SERIF, color: '#5a2a2a' });
          c.fillStyle = '#9e2a3a'; c.fillRect(330, y - 2, 4, qh + 2);
          G.text(c, '— Madame Sa', 755, y + qh + 12, { size: 12, align: 'right', color: '#8a7366' });
        }
      } else {
        G.text(c, 'HẺM CHỈ HỒNG HÔM NAY', 60, 180, { size: 26, font: G.SERIF, weight: 700, color: INK });
        let y = 214;
        for (const t of (G.PRESS_FILLER || []).slice((is.no * 3) % 7, (is.no * 3) % 7 + 4)) y += G.wrap(c, '• ' + t, 60, y, 690, 24, { size: 16, color: INK }) + 10;
      }
      // right column
      let ry = 168;
      if (is.top5) {
        // monthly ranking of the alley's shops (business modes)
        G.text(c, 'TOP TIỆM HẺM CHỈ HỒNG', 790, ry, { size: 16, font: G.SERIF, weight: 700, color: INK }); ry += 20;
        for (const line of is.top5) { U.fitText(c, line, 790, ry, 425, { size: 13, weight: line.includes('(bạn)') ? 800 : 400, color: line.includes('(bạn)') ? '#9e2a3a' : INK }); ry += 20; }
      } else {
        G.text(c, 'TIN HẺM', 790, ry, { size: 16, font: G.SERIF, weight: 700, color: INK }); ry += 16;
        for (const g of is.gossip || []) ry += G.wrap(c, '• ' + g, 790, ry, 425, 19, { size: 13, color: INK }) + 6;
      }
      ry = Math.max(ry + 8, 330);
      if (is.market) {
        // business mode: the month's market news takes the ad's place
        c.strokeStyle = INK; c.lineWidth = 1.5; c.strokeRect(790, ry, 425, 96);
        G.text(c, 'TIN THỊ TRƯỜNG', 802, ry + 16, { size: 11, weight: 800, color: '#9e2a3a' });
        G.text(c, is.market.name, 802, ry + 38, { size: 16, font: G.SERIF, weight: 700, color: INK });
        G.wrap(c, is.market.desc, 802, ry + 52, 400, 18, { size: 13, color: INK });
        ry += 112;
      } else if (is.ad) {
        c.setLineDash([5, 4]); c.strokeStyle = INK; c.lineWidth = 1.2; c.strokeRect(790, ry, 425, 96); c.setLineDash([]);
        G.text(c, 'QUẢNG CÁO', 802, ry + 16, { size: 11, weight: 800, color: '#8a7366' });
        G.wrap(c, is.ad, 802, ry + 30, 400, 19, { size: 14, weight: 700, color: INK });
        ry += 112;
      }
      if (is.correction) {
        G.text(c, 'ĐÍNH CHÍNH', 790, ry + 4, { size: 13, weight: 800, color: '#9e2a3a' });
        ry += 14 + G.wrap(c, is.correction, 790, ry + 14, 425, 18, { size: 12, font: G.SERIF, color: INK }) + 10;
      }
      const tag = is.trend, T = G.CAT.TAGS[tag];
      if (T) {
        G.text(c, 'DỰ BÁO GU 3 NGÀY TỚI', 790, ry + 8, { size: 15, font: G.SERIF, weight: 700, color: INK });
        c.beginPath(); c.arc(798, ry + 34, 6, 0, 7); c.fillStyle = T.col; c.fill();
        G.text(c, T.name, 812, ry + 34, { size: 15, weight: 800, color: INK });
        const blurb = (G.PRESS_TREND && G.PRESS_TREND[tag]) || '';
        G.wrap(c, `${blurb} Áo đạt từ 50 điểm ${T.name.toLowerCase()}: +10% tiền công.`, 790, ry + 48, 425, 18, { size: 12, color: '#5a4a40' });
      }
    }
    const n = P.issues.length;
    if (n > 1) {
      G.button(c, 'pprev', '‹ Số trước', 360, G.H - 64, 130, 44, () => this.idx--, { style: 'ghost', size: 14, r: 22, enabled: this.idx > 0 });
      G.text(c, `${this.idx + 1}/${n}`, 540, G.H - 42, { size: 14, weight: 700, align: 'center' });
      G.button(c, 'pnext', 'Số sau ›', 590, G.H - 64, 130, 44, () => this.idx++, { style: 'ghost', size: 14, r: 22, enabled: this.idx < n - 1 });
    }
    const a = is && is.articles[0], snap = a && a.snapId && G.state.collection.find((x) => x.id === a.snapId);
    if (snap && G.share.canShare(snap)) U.secondary(c, 'pshare', 'Chia sẻ áo', () => G.share.copyLink(snap));
    U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.topbar(c, 'Báo Trà Đá');
  }
};

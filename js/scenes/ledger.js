// Sổ sách: the shop's books in business modes — net worth, bills, month-by-month income vs. costs.
// It is also the end screen: bankruptcy, or the end of the weekly challenge (with a result to share).
G.scenes.ledger = {
  BEST_KEY: 'aodai_challenge_best',
  enter() {
    const s = G.state, e = s.econ;
    this.t = 0;
    this.over = e.bankrupt || e.finished;
    if (this.over && s.mode === 'challenge') {
      // keep this week's best score (the online board plugs in here later)
      let best = {}; try { best = JSON.parse(localStorage.getItem(this.BEST_KEY) || '{}'); } catch (err) { best = {}; }
      const wk = s.seed.replace('week-', ''), worth = G.econ.netWorth();
      if (!best[wk] || worth > best[wk]) best[wk] = worth;
      try { localStorage.setItem(this.BEST_KEY, JSON.stringify(best)); } catch (err) { /* ignore */ }
      this.best = best[wk];
      Promise.resolve().then(() => G.net.submitChallenge({ week: wk, worth, days: s.day - 1, bankrupt: e.bankrupt })).catch(() => {}); // offline is fine
    }
  },
  update(dt) { this.t += dt; },
  draw(c) {
    const U = G.UI, s = G.state, e = s.econ, f = (n) => Math.round(n).toLocaleString('vi-VN');
    U.bg(c);
    U.card(c, 30, 62, 600, 584);
    U.title(c, this.over ? (e.bankrupt ? 'Tiệm đã phá sản' : 'Hoàn thành thử thách tuần') : 'Sổ sách tiệm', 56, 100);
    U.fitText(c, s.shopName + (s.mode === 'challenge' ? ' · ' + s.seed.replace('week-', 'tuần ') : ''), 56, 130, 540, { size: 14, color: U.T.soft });
    G.text(c, 'Giá trị tiệm', 56, 174, { size: 14, weight: 700, color: U.T.soft });
    G.text(c, f(G.econ.netWorth()) + ' xu', 56, 212, { size: 40, font: G.SERIF, weight: 700, color: U.T.accent });
    const rows = [
      ['Tiền mặt', f(s.coins) + ' xu'], ['Nợ', f((e.debt || 0) + ((s.loan && s.loan.left) || 0)) + ' xu'], ['Dụng cụ & mặt tiền (khấu hao)', f(G.econ.assets()) + ' xu'], ['Ngày đã mở cửa', String(s.day - 1)], ['Áo đã giao', String(s.served)],
      ['Hạng tiệm', String(G.rank())], ['Khách thân (♥3+)', String(Object.values(s.bond).filter((b) => b.lvl >= 3).length)],
      ['Bà Tư cứu trợ', e.rescued ? 'đã dùng' : 'còn 1 lần']
    ];
    rows.forEach(([k, v], i) => {
      const y = 250 + i * 27;
      G.text(c, k, 56, y, { size: 15 });
      G.text(c, v, 600, y, { size: 15, weight: 800, align: 'right', color: k === 'Nợ' && e.debt > 0 ? U.T.bad : U.T.ink });
      c.fillStyle = U.T.line; c.fillRect(56, y + 14, 544, 1);
    });
    if (!this.over && G.econ.on()) {
      const b = G.econ.bill(), m = G.econ.market();
      G.wrap(c, `Cuối tháng (sau ${G.econ.daysLeft()} ngày): mặt bằng ${b.rent} + điện nước ${b.util}${b.staff ? ' + lương thợ ' + b.staff : ''}${b.loan ? ' + góp vay ' + b.loan : ''}${b.interest ? ' + lãi ' + b.interest : ''} = ${b.total} xu. Thị trường: ${m.name}. ${m.desc}`, 56, 490, 544, 20, { size: 13, color: U.T.soft });
    }
    if (this.over && this.best !== undefined) G.text(c, `Kỷ lục tuần này của bạn: ${f(this.best)} xu`, 56, 500, { size: 13, weight: 700, color: U.T.ok });
    if (this.over && G.rivals) {
      const kev = G.rivals.board().find((r) => r.id === 'kevin'), gap = G.econ.netWorth() - (kev ? kev.worth : 0);
      G.text(c, `Bảng hẻm: hạng ${G.rivals.rank()}/${(G.RIVALS || []).length + 1} · ${gap >= 0 ? 'hơn' : 'kém'} Kevin ${f(Math.abs(gap))} xu`, 56, 526, { size: 14, weight: 800, color: gap >= 0 ? U.T.ok : U.T.bad });
    }
    if (e.bankrupt) {
      c.save(); c.translate(470, 190); c.rotate(-0.18);
      c.strokeStyle = U.T.bad; c.lineWidth = 4; G.rr(c, -110, -30, 220, 60, 8); c.stroke();
      G.text(c, 'PHÁ SẢN', 0, 2, { size: 34, font: G.SERIF, weight: 700, align: 'center', color: U.T.bad });
      c.restore();
    }
    U.card(c, 650, 62, 600, 584);
    this.tab = this.tab || (this.over ? 'alley' : 'books');
    if (G.rivals) [['books', 'Thu chi'], ['alley', 'Bảng hẻm']].forEach(([k, label], i) => G.button(c, 'lt' + k, label, 1010 + i * 116, 78, 108, 32, () => { this.tab = k; }, { style: this.tab === k ? 'primary' : 'ghost', size: 13, r: 16 }));
    if (this.tab === 'alley' && G.rivals) this.drawAlley(c);
    else this.drawBooks(c);
    // actions
    U.secondary(c, 'lshare', 'Sao chép kết quả', () => G.share.copy(G.econ.shareText()));
    if (this.over && s.mode !== 'challenge') U.primary(c, 'lnew', 'Mở tiệm mới', () => { G.reset(); G.go('desk'); });
    else if (this.over) U.primary(c, 'lhome', 'Về màn hình chính', () => G.go('title'));
    else U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.topbar(c, 'Sổ sách');
  },
  // the alley ranking: everyone's net worth month by month, and where you stand
  drawAlley(c) {
    const U = G.UI, s = G.state, e = s.econ, months = Math.max(1, Math.floor((s.day - 1) / 5));
    U.title(c, 'Bảng hẻm Chỉ Hồng', 676, 100, { size: 22 });
    const board = G.rivals.board();
    const yours = [450].concat(e.worthLog || []).concat([G.econ.netWorth()]);
    const series = (G.RIVALS || []).map((r) => ({ col: r.col, pts: Array.from({ length: months + 1 }, (_, m) => G.rivals.worth(r, m * 5 + 1)) }));
    series.push({ col: U.T.accent, pts: yours.slice(-(months + 1)), you: true });
    const max = Math.max(1, ...series.flatMap((sr) => sr.pts)), X0 = 690, X1 = 1220, Y0 = 380, Y1 = 140;
    c.strokeStyle = U.T.line; c.lineWidth = 1; c.beginPath(); c.moveTo(X0, Y0); c.lineTo(X1, Y0); c.stroke();
    for (const sr of series) {
      c.strokeStyle = sr.col; c.lineWidth = sr.you ? 4 : 2; c.globalAlpha = sr.you ? 1 : 0.75; c.beginPath();
      sr.pts.forEach((v, i) => { const x = X0 + ((X1 - X0) * i) / Math.max(1, sr.pts.length - 1), y = Y0 - ((Y0 - Y1) * v) / max; i ? c.lineTo(x, y) : c.moveTo(x, y); });
      c.stroke(); c.globalAlpha = 1;
    }
    G.text(c, 'tháng →', X1, Y0 + 14, { size: 11, align: 'right', color: U.T.soft });
    board.forEach((r, i) => {
      const y = 412 + i * 30;
      if (r.you) { G.rr(c, 672, y - 13, 556, 26, 8); c.fillStyle = '#fff1dc'; c.fill(); }
      c.beginPath(); c.arc(690, y, 6, 0, 7); c.fillStyle = r.col; c.fill();
      U.fitText(c, `${i + 1}. ${r.name}${r.you ? ' (bạn)' : ''}`, 704, y, 300, { size: 14, weight: r.you ? 800 : 600 });
      if (r.note) U.fitText(c, r.note, 1010, y, 110, { size: 11, color: U.T.soft });
      G.text(c, r.worth.toLocaleString('vi-VN'), 1224, y, { size: 14, weight: 800, align: 'right' });
    });
    if (s.mode === 'challenge') G.text(c, 'Thử thách tuần: các tiệm trong hẻm chạy cùng hạt giống với bạn.', 676, 632, { size: 12, color: U.T.soft });
  },
  drawBooks(c) {
    const U = G.UI, s = G.state, e = s.econ;
    // month-by-month: income bars vs. what the month cost
    U.title(c, 'Thu chi từng tháng', 676, 100, { size: 22 });
    const H = (e.history || []).slice(-12);
    if (!H.length) G.wrap(c, 'Chưa hết tháng nào. Hoá đơn đầu tiên tới sau ' + G.econ.daysLeft() + ' ngày nữa.', 676, 130, 548, 22, { size: 14, color: U.T.soft });
    const max = Math.max(1, ...H.map((h) => Math.max(h.income, h.bill + h.spent)));
    H.forEach((h, i) => {
      const x = 690 + i * 46, base = 540, k = 360 / max;
      G.rr(c, x, base - h.income * k, 16, Math.max(2, h.income * k), 4); c.fillStyle = U.T.ok; c.fill();
      G.rr(c, x + 18, base - (h.bill + h.spent) * k, 16, Math.max(2, (h.bill + h.spent) * k), 4); c.fillStyle = '#d98b62'; c.fill();
      if (h.debt > 0) { c.beginPath(); c.arc(x + 17, base + 30, 5, 0, 7); c.fillStyle = U.T.bad; c.fill(); }
      G.text(c, 'T' + (h.m + 1), x + 17, base + 14, { size: 11, align: 'center', color: U.T.soft });
    });
    G.rr(c, 690, 600, 14, 12, 3); c.fillStyle = U.T.ok; c.fill(); G.text(c, 'Thu', 710, 606, { size: 12 });
    G.rr(c, 760, 600, 14, 12, 3); c.fillStyle = '#d98b62'; c.fill(); G.text(c, 'Chi (vải, trang trí, hoá đơn)', 780, 606, { size: 12 });
    G.text(c, '● còn nợ', 1010, 606, { size: 12, color: U.T.bad });
  }
};

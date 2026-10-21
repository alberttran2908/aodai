// Xưởng may: upgrade the scissors, the sewing machine and the iron. Better tools forgive small mistakes
// (cutting off-grain, a wobbly seam) or add finish to every dress; the electric machines cost more power each month.
G.scenes.workshop = {
  ORDER: ['scissors', 'machine', 'iron'],
  RANK_NEED: [0, 2, 4], // rank needed for tool level 1, 2
  enter() { this.t = 0; },
  update(dt) { this.t += dt; },
  icon(c, key, x, y, lvl) {
    const gold = ['#9aa1aa', '#c9ced6', '#d9b45a'][lvl] || '#9aa1aa';
    c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
    if (key === 'scissors') {
      c.rotate(-0.5);
      c.fillStyle = gold;
      for (const m of [-1, 1]) { c.save(); c.rotate(m * 0.18); c.beginPath(); c.moveTo(0, -4); c.lineTo(70, -2 * m); c.lineTo(70, 2 * m + m * 2); c.lineTo(0, 4); c.closePath(); c.fill(); c.restore(); }
      c.strokeStyle = '#9e2a3a'; c.lineWidth = 7;
      for (const m of [-1, 1]) { c.beginPath(); c.ellipse(-22, m * 14, 15, 10, m * 0.4, 0, 7); c.stroke(); }
      c.fillStyle = '#5a4a40'; c.beginPath(); c.arc(4, 0, 4, 0, 7); c.fill();
    } else if (key === 'machine') {
      c.fillStyle = lvl === 2 ? '#2f3a4a' : lvl === 1 ? '#e7dfd0' : '#2b2420';
      G.rr(c, -70, 10, 140, 26, 8); c.fill();                          // bed
      G.rr(c, -54, -46, 108, 30, 14); c.fill();                        // arm
      G.rr(c, 30, -46, 30, 66, 10); c.fill();                          // pillar
      G.rr(c, -64, -46, 30, 58, 10); c.fill();                         // head
      c.fillStyle = gold; c.fillRect(-52, 12, 3, 16); c.fillRect(-56, 26, 12, 3); // needle + foot
      c.strokeStyle = '#d9b45a'; c.lineWidth = 2; c.beginPath(); c.moveTo(-40, -36); c.lineTo(26, -36); c.stroke();
      c.beginPath(); c.arc(64, -18, 14, 0, 7); c.fillStyle = '#8a7366'; c.fill();
      if (lvl === 0) { c.strokeStyle = '#5a4a40'; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, 36); c.lineTo(-30, 60); c.moveTo(50, 36); c.lineTo(30, 60); c.stroke(); }
    } else {
      c.fillStyle = lvl ? '#c9ced6' : '#d8cbbb';
      c.beginPath(); c.moveTo(-60, 30); c.lineTo(60, 30); c.quadraticCurveTo(60, -6, 20, -14); c.lineTo(-30, -14); c.quadraticCurveTo(-60, -10, -60, 30); c.fill();
      c.fillStyle = lvl === 2 ? '#9e2a3a' : '#5a4a40';
      G.rr(c, -30, -40, 60, 18, 9); c.fill(); c.fillRect(-24, -24, 6, 12); c.fillRect(18, -24, 6, 12);
      if (lvl) for (let i = 0; i < 3; i++) { const yy = -54 - i * 12 - ((this.t * 20) % 12); c.strokeStyle = `rgba(255,255,255,${0.5 - i * 0.12})`; c.lineWidth = 3; c.beginPath(); c.moveTo(-10 + i * 10, yy + 10); c.quadraticCurveTo(-4 + i * 10, yy + 4, -10 + i * 10, yy); c.stroke(); }
      if (!lvl) { c.strokeStyle = G.UI.T.bad; c.lineWidth = 4; c.beginPath(); c.moveTo(-50, -50); c.lineTo(50, 40); c.stroke(); }
    }
    c.restore();
  },
  TABS: [['tools', 'Dụng cụ'], ['front', 'Mặt tiền'], ['staff', 'Thợ phụ'], ['loan', 'Vay vốn']],
  draw(c) {
    const U = G.UI;
    U.bg(c);
    this.tab = this.tab || 'tools';
    const tabs = this.TABS.filter(([k]) => k !== 'loan' || G.econ.on());
    tabs.forEach(([k, label], i) => G.button(c, 'wt' + k, label, 40 + i * 170, 64, 160, 38, () => { this.tab = k; }, { style: this.tab === k ? 'primary' : 'ghost', size: 15, r: 19 }));
    if (G.econ.on()) G.text(c, `Tài sản (đã khấu hao): ${G.econ.assets()} xu · tính vào Giá trị tiệm`, G.W - 40, 83, { size: 13, weight: 700, align: 'right', color: U.T.soft });
    if (this.tab === 'front') this.drawFront(c);
    else if (this.tab === 'staff') this.drawStaff(c);
    else if (this.tab === 'loan') this.drawLoan(c);
    else this.drawTools(c);
    U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.topbar(c, 'Xưởng may');
  },
  drawTools(c) {
    const U = G.UI, s = G.state, D = G.DATA.tools, rk = G.rank();
    G.text(c, 'Dụng cụ tốt không may thay bạn, nhưng tha thứ cho vài lỗi nhỏ.', 40, 126, { size: 14, color: U.T.soft });
    this.ORDER.forEach((key, i) => {
      const T = D[key], lvl = s.tools[key] || 0, cur = T.levels[lvl], next = T.levels[lvl + 1];
      const x = 40 + i * 410, y = 146, w = 390, h = 464;
      U.card(c, x, y, w, h);
      G.text(c, T.label, x + 24, y + 34, { size: 22, font: G.SERIF, weight: 700, color: U.T.accent });
      G.text(c, T.effect, x + 24, y + 60, { size: 13, color: U.T.soft });
      G.rr(c, x + 24, y + 80, w - 48, 128, 14); c.fillStyle = '#f4ecdd'; c.fill();
      this.icon(c, key, x + w / 2, y + 146, lvl);
      for (let k = 0; k < T.levels.length; k++) { c.beginPath(); c.arc(x + w / 2 - (T.levels.length - 1) * 12 + k * 24, y + 226, 7, 0, 7); c.fillStyle = k <= lvl ? U.T.accent : '#e3d6c2'; c.fill(); }
      G.text(c, 'Đang dùng: ' + cur.name, x + 24, y + 256, { size: 15, weight: 800 });
      G.wrap(c, cur.desc || '', x + 24, y + 272, w - 48, 19, { size: 13, color: U.T.soft });
      if (next) {
        c.fillStyle = U.T.line; c.fillRect(x + 24, y + 318, w - 48, 1.5);
        G.text(c, 'Nâng lên: ' + next.name, x + 24, y + 340, { size: 15, weight: 800, color: U.T.ok });
        G.wrap(c, next.desc || '', x + 24, y + 356, w - 48, 19, { size: 13 });
        const need = this.RANK_NEED[lvl + 1] || 0, locked = rk < need, price = next.price;
        G.button(c, 'up' + key, locked ? `Cần hạng ${need}` : `Mua · ${price} xu`, x + 24, y + h - 64, w - 48, 46, () => {
          if (!G.spend(price)) return;
          s.tools[key] = lvl + 1; G.sfx.good(); G.toast(`Đã nâng cấp: ${next.name}!`, G.C.green); G.save();
        }, { style: 'green', size: 16, r: 23, enabled: !locked && s.coins >= price });
      } else G.text(c, '✓ Đã tốt nhất', x + w / 2, y + h - 40, { size: 16, weight: 800, align: 'center', color: U.T.ok });
    });
    if (G.econ.on()) U.hint(c, `Máy may điện tốn thêm 30 xu điện mỗi tháng cho mỗi cấp · tiền điện nước hiện tại: ${G.econ.bill().util} xu/tháng`);
  },
  // Mặt tiền: things that make the shop nicer to visit (some raise the rent)
  drawFront(c) {
    const U = G.UI, s = G.state, rk = G.rank();
    G.text(c, 'Tiệm đẹp thì khách ghé nhiều, trả rộng tay hơn. Có món làm chủ nhà tính thêm tiền thuê.', 40, 126, { size: 14, color: U.T.soft });
    G.FRONT_ORDER.forEach((k, i) => {
      const F = G.FRONT[k], lvl = G.front.level(k), cur = F.levels[lvl], nx = F.levels[lvl + 1];
      const x = 40 + (i % 3) * 410, y = 146 + Math.floor(i / 3) * 236, w = 390, h = 222;
      U.card(c, x, y, w, h);
      G.text(c, F.name, x + 20, y + 28, { size: 19, font: G.SERIF, weight: 700, color: U.T.accent });
      for (let q = 0; q < F.levels.length; q++) { c.beginPath(); c.arc(x + w - 24 - (F.levels.length - 1 - q) * 18, y + 28, 6, 0, 7); c.fillStyle = q <= lvl ? U.T.accent : '#e3d6c2'; c.fill(); }
      U.fitText(c, 'Đang có: ' + (cur.name || '—'), x + 20, y + 56, w - 40, { size: 13, weight: 700 });
      if (nx) {
        G.text(c, nx.name, x + 20, y + 84, { size: 14, weight: 800, color: U.T.ok });
        const dh = G.wrap(c, nx.desc || '', x + 20, y + 96, w - 40, 18, { size: 13 });
        if (G.econ.on() && (nx.rent || nx.util)) G.text(c, `Chi phí tháng +${(nx.rent || 0) + (nx.util || 0)} xu`, x + 20, y + 106 + dh, { size: 12, weight: 700, color: U.T.bad });
        const locked = nx.rank && rk < nx.rank;
        G.button(c, 'fb' + k, locked ? `Cần hạng ${nx.rank}` : `Mua · ${nx.price} xu`, x + 20, y + h - 56, w - 40, 42, () => G.front.buy(k), { style: 'green', size: 15, r: 21, enabled: !locked && s.coins >= nx.price });
      } else G.text(c, '✓ Đã đầy đủ', x + w / 2, y + h - 36, { size: 15, weight: 800, align: 'center', color: U.T.ok });
    });
  },
  // Thợ phụ: hire one helper at a time
  drawStaff(c) {
    const U = G.UI, s = G.state, rk = G.rank(), cur = G.staff.current();
    G.text(c, 'Thợ phụ may lại giúp những đường bạn may chưa đẹp, làm việc vặt kiếm thêm, và lĩnh lương cuối tháng.', 40, 126, { size: 14, color: U.T.soft });
    G.HELPER_ORDER.forEach((id, i) => {
      const h = G.HELPERS[id], x = 40 + i * 410, y = 146, w = 390, hh = 480, hired = cur && cur.id === id, locked = rk < h.rank;
      U.card(c, x, y, w, hh, hired ? { fill: '#fff6e6', stroke: U.T.ok } : undefined);
      G.Dialog.portrait(c, id, x + 20, y + 20, 130, 150);
      G.text(c, h.name, x + 166, y + 44, { size: 20, font: G.SERIF, weight: 700, color: U.T.accent });
      G.wrap(c, h.role, x + 166, y + 58, w - 186, 17, { size: 12, color: U.T.soft });
      G.text(c, `Lương ${h.wage} xu/tháng`, x + 166, y + 112, { size: 14, weight: 800, color: U.T.gold });
      G.text(c, `Việc vặt ~${Math.round(h.side * (1 + 0.1 * rk))} xu/ngày`, x + 166, y + 134, { size: 13, color: U.T.ok });
      G.text(c, `Tay nghề ${Math.round(h.skill * 100)}% · may lại ${h.maxSeams} đường/áo`, x + 20, y + 196, { size: 13, weight: 700 });
      if (h.ironBonus) G.text(c, `Ủi áo giúp: +${h.ironBonus} chất lượng khi tiệm chưa có bàn ủi`, x + 20, y + 218, { size: 12, color: U.T.soft });
      G.wrap(c, '“' + h.hire + '”', x + 20, y + 244, w - 40, 20, { size: 14, font: G.SERIF, color: '#5a4a40' });
      if (hired) {
        G.text(c, s.staff.idle ? 'Đang nghỉ không lương (tiệm nợ lương)' : `Đang làm việc ✓ · đã may lại ${s.staff.helped} đường · kiếm ${s.staff.earned} xu`, x + 20, y + hh - 82, { size: 12, weight: 700, color: s.staff.idle ? U.T.bad : U.T.ok });
        G.button(c, 'fire' + id, 'Cho nghỉ việc', x + 20, y + hh - 58, w - 40, 42, () => G.staff.fire(), { style: 'ghost', size: 15, r: 21 });
      } else {
        G.button(c, 'hire' + id, locked ? `Mở ở hạng ${h.rank}` : cur ? 'Đã có thợ phụ' : 'Thuê', x + 20, y + hh - 58, w - 40, 42, () => G.staff.hire(id), { style: 'green', size: 15, r: 21, enabled: !locked && !cur });
      }
    });
    U.hint(c, 'Lương trả cuối tháng cùng tiền mặt bằng. Tháng còn nợ, thợ phụ nghỉ không lương; hai tháng liền thì nghỉ việc.');
  },
  // Vay vốn: a bank loan (business modes)
  drawLoan(c) {
    const U = G.UI, s = G.state, L = s.loan;
    U.card(c, 40, 130, 640, 470);
    U.title(c, 'Ngân hàng Hẻm Chỉ Hồng', 64, 168, { size: 24 });
    G.wrap(c, 'Vay một lần một khoản, trả góp 6 tháng cùng hoá đơn cuối tháng, lãi 4% mỗi tháng trên số còn nợ. Thử thách tuần: phải trả hết trước ngày 30. Không trả được thì thành nợ thường (lãi 8%).', 64, 192, 590, 22, { size: 14 });
    if (L.left > 0) {
      G.text(c, `Đang nợ ngân hàng: ${L.left} xu`, 64, 330, { size: 22, weight: 800, color: U.T.bad });
      G.text(c, `Góp mỗi tháng: ${L.monthly} xu + lãi ${Math.round(L.left * 0.04)} xu · còn ${Math.max(0, L.months)} kỳ`, 64, 362, { size: 15 });
    } else if (G.rank() < 3) G.text(c, 'Ngân hàng chỉ cho tiệm từ hạng 3 vay.', 64, 330, { size: 16, weight: 700, color: U.T.soft });
    else [1000, 2000].forEach((n, i) => G.button(c, 'loan' + n, `Vay ${n} xu`, 64 + i * 300, 320, 280, 56, () => G.econ.borrow(n), { style: i ? 'ghost' : 'primary', size: 18, r: 28, enabled: G.econ.canBorrow() }));
    G.text(c, `Mỗi tháng góp ~${Math.ceil(1000 / 60) * 10} xu (khoản 1.000) hoặc ~${Math.ceil(2000 / 60) * 10} xu (khoản 2.000), chưa tính lãi.`, 64, 412, { size: 13, color: U.T.soft });
    U.card(c, 700, 130, 540, 230, { fill: '#fffaf0' });
    G.Dialog.portrait(c, 'batu', 722, 150, 120, 140);
    G.wrap(c, '“Vay ngân hàng thì nhớ trả đúng hạn nghe con. Bà không có hụi đâu. Bà chỉ cứu con một lần thôi đó.”', 860, 160, 360, 24, { size: 16, font: G.SERIF, color: '#5a4a40' });
    G.text(c, s.econ.rescued ? 'Bà Tư đã cứu tiệm một lần.' : 'Bà Tư còn cứu tiệm được 1 lần nếu sắp phá sản.', 722, 330, { size: 13, weight: 700, color: s.econ.rescued ? U.T.bad : U.T.ok });
  }
};

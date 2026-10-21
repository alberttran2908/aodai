// Business mode (Kinh doanh / Thử thách tuần): the shop has monthly bills (rent grows with the shop's rank,
// utilities with the machine), fabric prices move every month, and a market event shakes things up.
// Unpaid bills become debt with interest; too much debt and the shop goes bankrupt — Bà Tư bails you out once.
// Every player's shop runs on these same rules. Everything is seeded from the run's seed, so a weekly challenge
// gives every player the same months.
G.econ = {
  MARKET: [
    { id: 'calm', name: 'Thị trường yên ả', desc: 'Giá cả bình thường, khách đều đều.', w: 5 },
    { id: 'rent', name: 'Chủ nhà tăng giá mặt bằng', desc: 'Tiền mặt bằng tháng này tăng 25%.', rent: 1.25, w: 2 },
    { id: 'rain', name: 'Mùa mưa, hẻm vắng', desc: 'Khách dè dặt, trả ít hơn 10%.', budget: 0.9, w: 2 },
    { id: 'festival', name: 'Phố đi bộ mở hội', desc: 'Khách rộng tay hơn 15%.', budget: 1.15, w: 2 },
    { id: 'tourists', name: 'Khách du lịch đổ về', desc: 'Khách trả thêm 10%.', budget: 1.1, w: 2 },
    { id: 'kevinSale', name: 'Siêu Tốc 24h xả hàng', desc: 'Khách lạ ép giá 15%. Khách thân (♥3) vẫn trả đủ.', budget: 0.85, loyal: true, w: 2 },
    { id: 'silkUp', name: 'Lụa Bảo Lộc mất mùa', desc: 'Giá lụa và tơ tằm tăng 30%.', mats: { lua: 1.3, totam: 1.3 }, w: 2 },
    { id: 'brocade', name: 'Gấm, nhung về hàng nhiều', desc: 'Giá gấm và nhung giảm 20%.', mats: { gam: 0.8, nhung: 0.8 }, w: 2 },
    { id: 'sequin', name: 'Kim sa khan hiếm', desc: 'Giá kim sa và ren tăng 25%.', mats: { kimsa: 1.25, ren: 1.25 }, w: 1 },
    { id: 'power', name: 'Cúp điện luân phiên', desc: 'Tiền điện nước tăng gấp rưỡi.', util: 1.5, w: 2 },
    { id: 'cheapDui', name: 'Làng dệt mùa bội thu', desc: 'Đũi và voan rẻ hơn 25%.', mats: { dui: 0.75, voan: 0.75 }, w: 2 }
  ],
  on() { const s = G.state; return !!s && !s.isDaily && (s.mode === 'business' || s.mode === 'challenge'); },
  month(day) { return Math.floor(((day || G.state.day) - 1) / 5); },
  daysLeft() { return 5 - ((G.state.day - 1) % 5); },
  rng(tag, m) { return G.mulberry32(G.hash32((G.state.seed || 'aodai') + '|' + tag + '|' + m)); },
  // the month's market event (month 0 is always calm so new shops can find their feet)
  market(m) {
    if (m === undefined) m = this.month();
    if (m < 1) return this.MARKET[0];
    let x = this.rng('market', m)() * this.MARKET.reduce((a, e) => a + e.w, 0);
    for (const e of this.MARKET) { x -= e.w; if (x <= 0) return e; }
    return this.MARKET[0];
  },
  matMul(mat, m) {
    if (m === undefined) m = this.month();
    const drift = m < 1 ? 1 : 0.88 + this.rng('mat|' + mat, m)() * 0.27; // −12% … +15%
    return drift * ((this.market(m).mats || {})[mat] || 1);
  },
  price(id) {
    const f = G.CAT.FABRICS[id]; if (!f) return 0;
    return this.on() ? Math.max(1, Math.round(f.price * this.matMul(f.mat))) : f.price;
  },
  // "24 xu/m ▲" — the arrow shows this month's move against the usual price
  priceLabel(id) {
    const f = G.CAT.FABRICS[id], p = this.price(id);
    return `${p} xu/m${p > f.price ? ' ▲' : p < f.price ? ' ▼' : ''}`;
  },
  // how this month's market changes what a client pays
  budgetMul(clientId) {
    if (!this.on()) return 1;
    const ev = this.market();
    if (ev.loyal && G.bond.get(clientId).lvl >= 3) return 1;
    return ev.budget || 1;
  },
  bill(m) {
    if (m === undefined) m = this.month();
    const s = G.state, ev = this.market(m), lvl = (s.tools && s.tools.machine) || 0, fm = G.front.mods();
    // tuned so careful tailoring thrives, sloppy work slowly sinks (a month is ~5 orders)
    const rent = Math.round(((250 + 110 * G.rank()) * (ev.rent || 1)) / 10) * 10 + fm.rent;
    const util = Math.round(((80 + 30 * lvl) * (ev.util || 1)) / 5) * 5 + fm.util;
    const interest = Math.round((s.econ.debt || 0) * 0.08);
    const staff = G.staff && G.staff.current() ? G.staff.current().wage : 0;
    // bank loan instalment (the weekly challenge must repay everything by its last month)
    const L = s.loan || { left: 0 };
    let loan = 0;
    if (L.left > 0) {
      const last = s.mode === 'challenge' && (m + 1) * 5 >= s.endDay;
      loan = (last ? L.left : Math.min(L.left, L.monthly)) + Math.round(L.left * 0.04);
    }
    return { rent, util, interest, staff, loan, total: rent + util + interest + staff + loan };
  },
  // tools and shop-front upgrades count at 60% of what they cost, so investing never lowers your score
  assets() {
    const s = G.state; let v = 0;
    for (const k in G.DATA.tools) for (let l = 1; l <= (s.tools[k] || 0); l++) v += G.DATA.tools[k].levels[l].price;
    for (const k in G.FRONT || {}) for (let l = 1; l <= ((s.front || {})[k] || 0); l++) v += G.FRONT[k].levels[l].price;
    return Math.round(v * 0.6);
  },
  netWorth() {
    const s = G.state;
    const stock = Object.keys(s.roll).reduce((a, id) => a + ((s.roll[id] / 100) * (G.CAT.FABRICS[id] ? G.CAT.FABRICS[id].price : 0)) * 0.5, 0);
    return Math.round(s.coins + stock + s.prestige * 40 + this.assets() - (s.econ.debt || 0) - ((s.loan && s.loan.left) || 0));
  },
  // bank loan: rank 3+, one at a time, repaid over 6 months with 4% monthly interest
  canBorrow() { const s = G.state; return this.on() && G.rank() >= 3 && !(s.loan && s.loan.left > 0) && !s.econ.bankrupt; },
  borrow(n) {
    if (!this.canBorrow()) return false;
    const s = G.state;
    s.loan = { left: n, monthly: Math.ceil(n / 6 / 10) * 10, months: 6 };
    s.coins += n; // not counted as income
    G.sfx.coin(); G.toast(`Ngân hàng giải ngân ${n} xu`, G.C.green); G.save();
    return true;
  },

  // one day passes (a delivery, or a client sent away). Month end → the street fair (if dresses wait on
  // the rack), then the bills.
  advanceDay() {
    const s = G.state;
    s.day++;
    if (G.staff) G.staff.onDay();
    if ((s.day - 1) % 5 !== 0) return null;
    const m = this.month() - 1;
    if (G.fair && G.fair.due(m)) { s.econ.fairPending = m; G.save(); return { fair: true }; }
    return this.monthEnd(m);
  },
  monthEnd(m) {
    if (this.on()) return this.settle(m);
    G.save();
    return null;
  },
  settle(m) {
    const s = G.state, e = s.econ, b = this.bill(m), owed = b.total + (e.debt || 0);
    const res = { m, bill: b, debtBefore: e.debt || 0, income: e.inc || 0, spent: e.out || 0 };
    if (s.coins >= owed) { s.coins -= owed; e.debt = 0; e.missed = 0; res.paid = true; }
    else { e.debt = owed - s.coins; s.coins = 0; e.missed = (e.missed || 0) + 1; res.paid = false; }
    res.debt = e.debt;
    // the loan instalment is part of the bill: once billed it is no longer owed to the bank
    if (s.loan && s.loan.left > 0) { const paid = b.loan - Math.round(s.loan.left * 0.04); s.loan.left = Math.max(0, s.loan.left - paid); s.loan.months--; }
    if (G.staff) res.staff = G.staff.onSettle(res.paid);
    e.history = (e.history || []).concat([{ m, income: res.income, spent: res.spent, bill: b.total, debt: e.debt }]).slice(-24);
    e.inc = 0; e.out = 0;
    e.worthLog = (e.worthLog || []).concat([this.netWorth()]).slice(-24);
    if (G.rivals) {
      const before = s.story.flags.passedKevin;
      G.rivals.check();
      res.passedKevin = !before && s.story.flags.passedKevin;
      res.alleyRank = G.rivals.rank();
    }
    // too deep in debt: Bà Tư helps once, the second time the shop closes
    const limit = (b.rent + b.util) * 2;
    if (e.debt > limit || e.missed >= 3) {
      if (!e.rescued) { e.rescued = true; res.rescue = e.debt; e.debt = 0; e.missed = 0; }
      else { e.bankrupt = true; res.bankrupt = true; }
    } else if (e.debt > 0) res.warning = true;
    if (s.mode === 'challenge' && s.day > s.endDay) { e.finished = true; res.finished = true; }
    e.pending = res;
    G.save();
    return res;
  },
  // the month-end scene shown at the desk
  billScript(res) {
    const f = (n) => n.toLocaleString('vi-VN');
    const steps = [
      { who: 'narr', t: `Cuối tháng. Tiền mặt bằng ${f(res.bill.rent)} xu, điện nước ${f(res.bill.util)} xu${res.bill.staff ? `, lương thợ phụ ${f(res.bill.staff)} xu` : ''}${res.bill.loan ? `, góp ngân hàng ${f(res.bill.loan)} xu` : ''}${res.bill.interest ? `, lãi nợ ${f(res.bill.interest)} xu` : ''}${res.debtBefore ? `, nợ cũ ${f(res.debtBefore)} xu` : ''}.` },
      { who: 'narr', t: res.paid ? `Đã trả đủ. Tháng này tiệm thu ${f(res.income)} xu, chi ${f(res.spent)} xu cho vải và trang trí.` : `Tiệm không đủ tiền. Còn nợ ${f(res.debt)} xu, tháng sau tính lãi 8%.` }
    ];
    if (res.warning) steps.push({ do: 'walkIn', id: 'kevin' }, { who: 'kevin', t: 'Hello neighbor… nghe nói tiệm em đang kẹt. Nếu cần, anh mua lại tiệm giá “hữu nghị” nha. Đùa thôi… mà cũng không đùa lắm.' }, { do: 'walkOut', id: 'kevin' });
    if (res.staff) steps.push({ who: 'narr', t: res.staff });
    if (res.alleyRank) steps.push({ who: 'narr', t: `Bảng hẻm Chỉ Hồng: tiệm bạn đang đứng thứ ${res.alleyRank}/${(G.RIVALS || []).length + 1} về giá trị tiệm.` });
    if (res.passedKevin) steps.push({ do: 'walkIn', id: 'kevin' }, { who: 'kevin', t: 'Ủa, tiệm em vượt Siêu Tốc 24h rồi hả? Ok… ok. Anh đi mua thêm hai cái máy. No hard feelings!' }, { do: 'walkOut', id: 'kevin' });
    if (res.rescue) steps.push({ who: 'batu', t: `(qua điện thoại) Con ơi, bà nghe hết rồi. Bà gửi ${f(res.rescue)} xu trả nợ cho con. Lần này thôi nghe, lần sau phải tự đứng vững.` });
    if (res.bankrupt) steps.push({ who: 'narr', t: 'Nợ chồng nợ. Chủ nhà dán thông báo lên cửa: tiệm phải đóng.' });
    if (res.finished) steps.push({ who: 'narr', t: 'Thử thách tuần kết thúc. Cùng xem tiệm của bạn trụ vững tới đâu!' });
    const m = this.market(res.m + 1);
    if (!res.bankrupt && !res.finished) steps.push({ who: 'narr', t: `Tháng mới · ${m.name}. ${m.desc}` });
    return steps;
  },
  track() {
    // count money in and out for the month report
    const add = G.addCoins, spend = G.spend;
    G.addCoins = (n) => { add(n); if (G.state.econ) G.state.econ.inc = (G.state.econ.inc || 0) + n; };
    G.spend = (n) => { const ok = spend(n); if (ok && G.state.econ) G.state.econ.out = (G.state.econ.out || 0) + n; return ok; };
  },
  // weekly challenge: same seed for everyone this ISO week
  weekKey() {
    const d = new Date(Date.parse(G.dateKeyVN() + 'T00:00:00Z'));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); // the Thursday of this week decides its year
    const w = Math.ceil(((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(w).padStart(2, '0')}`;
  },
  shareText() {
    const s = G.state, e = s.econ;
    const days = s.day - 1, head = s.mode === 'challenge' ? `Thử thách tuần ${s.seed.replace('week-', '')}` : 'Tiệm May Áo Dài';
    return [
      `${head} · ${s.shopName}`,
      e.bankrupt ? `💸 Phá sản sau ${days} ngày` : `🏪 Trụ vững ${days} ngày`,
      `💰 Giá trị tiệm: ${this.netWorth().toLocaleString('vi-VN')} xu · ⭐ Hạng ${G.rank()}`,
      `🧵 ${s.served} áo · ♥ ${Object.values(s.bond).filter((b) => b.lvl >= 3).length} khách thân`,
      G.rivals ? `🏆 Bảng hẻm: hạng ${G.rivals.rank()}/${(G.RIVALS || []).length + 1}` : '',
      G.CFG.baseUrl
    ].join('\n');
  }
};
G.econ.track();

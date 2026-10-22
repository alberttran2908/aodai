// Idle: the shop keeps going while the player is away (tab closed, or hidden for a while), in real time.
// A hired helper takes in small alterations by the hour, and the shop window may sell a dress hanging on the
// fair rack to a passer-by (at 80% of its value). Capped at 8 hours so everyone plays on the same footing.
// Nothing is added silently: the desk shows "while you were away" and the player collects it.
G.idle = {
  MIN_AWAY: 5 * 60e3, CAP: 8 * 3600e3,
  // only the real shop counts (not the weekly challenge or the daily sandbox)
  on() { const s = G.state; return !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge' && G.hasSave; },
  stamp() { if (this.on()) G.state.idleLast = Date.now(); },
  // work out what happened since `since` (ms); keeps it pending until collected
  arrive(since) {
    if (!this.on() || !since || this.pending) return;
    const away = Date.now() - since;
    if (away < this.MIN_AWAY) return;
    const s = G.state, hours = Math.min(away, this.CAP) / 3600e3, lines = [];
    let coins = 0;
    const W = G.week || { is: () => false };
    // the cloth van came while you were out (already put on the roll)
    for (const o of this.deliver(Date.now())) {
      const f = G.CAT.FABRICS[o.fid];
      lines.push({ icon: 'fabric', text: `${o.kind === 'dye' ? 'Mẻ nhuộm xong' : 'Xe vải giao'} ${(o.cm / 100).toFixed(0)} m ${f ? f.name : 'vải'}`, coins: 0, note: 'vào kho' });
    }
    // the helper's alterations: hems, zips, taking in a waist — a share of a day's odd jobs per hour
    if (G.staff.working()) {
      const h = G.staff.current(), n = Math.round((G.staff.side() / 3) * hours * (W.is('tho') ? 2 : 1));
      if (n > 0) { coins += n; lines.push({ icon: 'needle', text: `${h.name} nhận sửa đồ lặt vặt`, coins: n }); }
    }
    // the helper also sews plain ready-to-wear áo dài from cloth on the roll (3 m each, one every 3 hours)
    // while the fair rack has room; they hang on the rack when you come back
    const made = [];
    if (G.staff.working()) {
      const h = G.staff.current(), C = G.CAT, left = Object.assign({}, s.roll);
      let n = Math.min(G.fair.rackSize() - s.rack.filter((it) => !it.sold).length, Math.floor(hours / (W.is('tho') ? 2 : 3)));
      while (n-- > 0) {
        const fid = Object.keys(left).filter((id) => C.FABRICS[id] && C.FABRICS[id].print === 'tron' && left[id] >= 320).sort((a, b) => left[b] - left[a])[0];
        if (!fid) break;
        left[fid] -= 300;
        made.push({ fid, quality: Math.round(h.skill * 100 - 6 + Math.random() * 6), by: h.name });
      }
      if (made.length) lines.push({ icon: 'dress', text: `${h.name} may ${made.length} áo bán sẵn, treo lên sạp`, coins: 0, note: 'lên sạp' });
    }
    // the window: each dress on the rack has a small chance per hour of catching a passer-by's eye
    // (the night market week: twice as likely, at 90%)
    const sold = [], night = W.is('cho');
    for (const it of s.rack) {
      if (it.sold || sold.length >= (night ? 3 : 2)) continue;
      if (Math.random() < 1 - Math.pow(night ? 0.9 : 0.95, hours)) { const p = Math.round(G.fair.value(it) * (night ? 0.9 : 0.8)); sold.push({ it, p }); }
    }
    for (const x of sold) { coins += x.p; lines.push({ icon: 'dress', text: night ? 'Chợ đêm bán một áo trên sạp' : 'Tủ kính bán một áo cho khách qua đường', coins: x.p }); }
    // an empty report ("nobody minded the shop") is a tip, shown at most once a day
    if (!lines.length) { if (Date.now() - (s.idleTipAt || 0) < 24 * 3600e3) return; s.idleTipAt = Date.now(); }
    // kept in the save until collected, so closing the tab again does not lose it
    s.idlePending = { away, capped: away > this.CAP, lines, coins, made, sold: sold.map((x) => ({ i: s.rack.indexOf(x.it), p: x.p })) };
  },
  get pending() { return G.state && G.state.idlePending; },
  set pending(v) { if (G.state) G.state.idlePending = v; },
  collect() {
    const P = this.pending; if (!P) return;
    for (const x of P.sold) { const it = G.state.rack[x.i]; if (it && !it.sold) { it.sold = true; it.soldFor = x.p; it.price = x.p; } }
    for (const m of P.made || []) this.hangMade(m);
    if (P.coins) { G.addCoins(P.coins); G.sfx.coin(); }
    if (G.staff.current() && G.state.staff) G.state.staff.earned += P.lines.filter((l) => l.icon === 'needle').reduce((a, l) => a + l.coins, 0);
    this.pending = null; this.stamp(); G.save();
  },
  // a helper-made dress: a simple áo dài (stand collar, long sleeves, floor-length) in one plain cloth,
  // into the album (so the fair can show it) and onto the rack
  hangMade(m) {
    const s = G.state, C = G.CAT, f = C.FABRICS[m.fid];
    if (!f || (s.roll[m.fid] || 0) < 300) return;
    s.roll[m.fid] -= 300; if (s.roll[m.fid] < 10) delete s.roll[m.fid];
    const part = { co: 'dung', dang: 'om', tay: 'dai', ta: 'dai_thang', quan: 'quan' };
    const design = Object.assign({}, G.DATA.defaultDesign, { neck: 'dung', fit: 'om', sleeve: 'dai', length: 'got', hem: 'thang', buttons: 'an' });
    const fab = { mat: f.mat, color: f.color, print: f.print }, quan = C.FABRICS['lua.trang.tron'];
    const fabIds = { than: m.fid, tay: m.fid, co: m.fid, quan: 'lua.trang.tron' };
    const snap = {
      id: (s.snapSeq = (s.snapSeq || 0) + 1), design, fabs: { than: fab, tay: fab, co: fab, quan: { mat: quan.mat, color: quan.color, print: 'tron' } },
      scale: 1, decorItems: [], name: 'Áo bán sẵn', title: `${m.by} may`, kind: 'rack', success: true, quality: m.quality,
      part, fabIds, male: false, day: s.day, shop: s.shopName
    };
    s.collection.push(snap); if (s.collection.length > 60) s.collection.shift();
    s.rack.push({ snapId: snap.id, matCost: Math.round(3 * G.econ.price(m.fid)), decorCost: 0, quality: m.quality,
      tags: G.computeTags(design, fabIds, { items: [] }, part), price: 0, age: 0, sold: false });
  },
  // ---------- wholesale cloth: 10 m at 20% off, delivered by the van an hour later (real time) ----------
  // (the clearance-sale week: 35% off, four vans at a time; the sunny week: dye in an hour, no dye fee)
  BULK_CM: 1000, BULK_ETA: 3600e3,
  get BULK_OFF() { return G.week && G.week.is('xakho') ? 0.35 : 0.2; },
  get BULK_MAX() { return G.week && G.week.is('xakho') ? 4 : 3; },
  orders() { const s = G.state; return (s.orders = s.orders || []); },
  bulkPrice(fid) { return Math.round(((G.econ.price(fid) * this.BULK_CM) / 100) * (1 - this.BULK_OFF)); },
  // ---------- dye vats: 3 m of plain white cloth + a little dye → the same cloth in a colour, 2 real hours later ----------
  DYE_CM: 300, VATS: 2,
  get DYE_COST() { return G.week && G.week.is('nang') ? 0 : 15; },
  get DYE_ETA() { return (G.week && G.week.is('nang') ? 1 : 2) * 3600e3; },
  dyeing() { return this.orders().filter((o) => o.kind === 'dye'); },
  // plain white bolts on the roll with enough cloth for a batch
  dyeSources() { const s = G.state, C = G.CAT; return Object.keys(s.roll).filter((id) => C.FABRICS[id] && C.FABRICS[id].color === 'trang' && C.FABRICS[id].print === 'tron' && s.roll[id] >= this.DYE_CM); },
  dyeTarget(src, color) { const f = G.CAT.FABRICS[src], id = f && `${f.mat}.${color}.tron`; return id && G.CAT.FABRICS[id] ? id : null; },
  dye(src, color) {
    const s = G.state, to = this.dyeTarget(src, color);
    if (!to || (s.roll[src] || 0) < this.DYE_CM) return false;
    if (this.dyeing().length >= this.VATS) { G.toast('Cả hai chậu đang nhuộm', G.C.red); return false; }
    if (this.DYE_COST && !G.spend(this.DYE_COST)) return false;
    s.roll[src] -= this.DYE_CM; if (s.roll[src] < 10) delete s.roll[src];
    this.orders().push({ fid: to, cm: this.DYE_CM, eta: Date.now() + this.DYE_ETA, kind: 'dye' });
    G.toast(`Đã ngâm vải vào chậu nhuộm — ${this.DYE_ETA / 3600e3} giờ nữa xong`); G.save();
    if (G.quests) G.quests.event('nhuom');
    return true;
  },
  order(fid) {
    if (this.orders().filter((o) => o.kind !== 'dye').length >= this.BULK_MAX) { G.toast(`Đang chờ ${this.BULK_MAX} xe vải, đợi xe tới đã`, G.C.red); return false; }
    if (!G.spend(this.bulkPrice(fid))) return false;
    this.orders().push({ fid, cm: this.BULK_CM, eta: Date.now() + this.BULK_ETA });
    G.toast('Đã đặt vải sỉ — xe giao sau 1 giờ'); G.save();
    if (G.quests) G.quests.event('sapsi');
    return true;
  },
  // deliver whatever has arrived; returns the deliveries (the caller decides how to tell the player)
  deliver(now) {
    const due = this.orders().filter((o) => o.eta <= now);
    if (!due.length) return [];
    for (const o of due) G.state.roll[o.fid] = (G.state.roll[o.fid] || 0) + o.cm;
    G.state.orders = this.orders().filter((o) => o.eta > now);
    G.save();
    return due;
  },
  nextEta() { const o = this.orders(); return o.length ? Math.min(...o.map((x) => x.eta)) : 0; },
  // ---------- daily check-in: a 7-day ladder of gifts (Vietnam calendar days); missing a day starts over ----------
  GIFTS: [
    { coins: 60 }, { fabric: 'lua.trang.tron', cm: 300 }, { coins: 100 }, { fabric: 'dui.be.tron', cm: 300 },
    { coins: 150 }, { fabric: 'voan.hongphan.tron', cm: 300 }, { coins: 250, fabric: 'gam.do.img_maudon', cm: 200 }
  ],
  // the gift waiting today (or null if already taken): { day: 1..7, gift }
  checkinDue() {
    if (!this.on()) return null;
    const s = G.state, c = s.checkin || {}, today = G.dateKeyVN(), yesterday = G.dateKeyVN(Date.now() - 864e5);
    if (c.last === today) return null;
    const streak = c.last === yesterday ? (c.streak || 0) % 7 + 1 : 1;
    return { day: streak, gift: this.GIFTS[streak - 1] };
  },
  giftText(g) {
    const f = g.fabric && G.CAT.FABRICS[g.fabric];
    return [g.coins ? `${g.coins} xu` : '', f ? `${(g.cm / 100).toFixed(0)} m ${f.name}` : ''].filter(Boolean).join(' + ');
  },
  checkin() {
    const d = this.checkinDue(); if (!d) return;
    const s = G.state, g = d.gift;
    if (g.coins) G.addCoins(g.coins);
    if (g.fabric && G.CAT.FABRICS[g.fabric]) s.roll[g.fabric] = (s.roll[g.fabric] || 0) + g.cm;
    s.checkin = { last: G.dateKeyVN(), streak: d.day };
    G.sfx.coin(); G.toast(`Quà ngày ${d.day}: ${this.giftText(g)}`, G.C.green); G.save();
  },
  awayText(ms) {
    const m = Math.round(ms / 60e3);
    return m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ${m % 60 ? ' ' + (m % 60) + ' phút' : ''}`;
  },
  // what to say when nothing happened (no helper, empty rack): point at the ways to earn while away
  idleTip() {
    if (!G.staff.current()) return 'Thuê thợ phụ ở Xưởng để tiệm nhận sửa đồ cả khi bạn vắng.';
    if (!Object.keys(G.state.roll).some((id) => G.CAT.FABRICS[id] && G.CAT.FABRICS[id].print === 'tron' && G.state.roll[id] >= 320)) return 'Để sẵn vài mét vải trơn trong kho: thợ phụ sẽ may áo bán sẵn khi bạn vắng.';
    if (!G.state.rack.some((it) => !it.sold)) return 'May áo bán sẵn treo sạp: tủ kính có thể bán giúp khi bạn vắng.';
    return '';
  },
  init() {
    // keep the "last seen" time fresh, and treat a long-hidden tab like a visit away
    setInterval(() => { if (this.on() && !document.hidden) { this.stamp(); G.save(); } }, 60e3);
    // the van arriving while you play
    setInterval(() => {
      if (!this.on() || document.hidden) return;
      for (const o of this.deliver(Date.now())) { const f = G.CAT.FABRICS[o.fid]; G.toast(`${o.kind === 'dye' ? 'Nhuộm xong!' : 'Xe vải tới!'} +${(o.cm / 100).toFixed(0)} m ${f ? f.name : ''}`, G.C.green); G.sfx.bell(); }
    }, 5e3);
    document.addEventListener('visibilitychange', () => {
      if (!this.on()) return;
      if (document.hidden) { this.stamp(); G.save(); this.hiddenAt = Date.now(); }
      else if (this.hiddenAt) { if (!this.pending) this.arrive(this.hiddenAt); this.hiddenAt = 0; this.stamp(); }
    });
  }
};

// Đơn hàng shop: an online boutique orders a few ready-to-wear áo dài from the rack — so many dresses, of at
// least some quality, sometimes in one cloth — within a day of real time, for a fixed price above the fair's.
// Fill it with dresses you sew yourself or the helper sews while you are away. One order at a time; after
// it is delivered, declined or lapses, the next comes a few hours later.
G.contract = {
  SHOPS: ['Shop Áo Dài Mây', 'Lụa Là Online', 'Tiệm Cô Dâu Nhỏ', 'Boutique Hoa Sen', 'Áo Dài Phố Cổ', 'Shop Mẹ Bắp'],
  MATS: ['lua', 'voan', 'dui'],
  LASTS: 24 * 3600e3, GAP: 4 * 3600e3,
  on() { const s = G.state; return !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge' && G.hasSave && !(s.tut && s.tut.on); },
  st() { const s = G.state; return (s.contract = s.contract || { offer: null, nextAt: 0, seen: false }); },
  // a new order when the gap is over; an order past its time lapses. Returns the new offer, if one came.
  tick(now) {
    if (!this.on()) return null;
    const k = this.st(); now = now || Date.now();
    if (k.offer && now > k.offer.until) { k.offer = null; k.nextAt = now + this.GAP / 4; }
    if (!k.offer && now >= k.nextAt) { k.offer = this.make(now); k.seen = false; return k.offer; }
    return null;
  },
  make(now) {
    const C = G.CAT, r = G.rank(), n = r >= 4 ? 3 : 2, q = Math.min(85, 55 + r * 4);
    const mats = this.MATS.filter((m) => C.MATS[m] && Object.values(C.FABRICS).some((f) => f.mat === m && f.print === 'tron'));
    const mat = Math.random() < 0.5 && mats.length ? mats[Math.floor(Math.random() * mats.length)] : null;
    // about 1.3 times what such dresses fetch at the fair
    const each = (120 + 15 * r + 90) * (0.55 + q / 100) * 1.3 * (mat ? 1.1 : 1);
    return { shop: this.SHOPS[Math.floor(Math.random() * this.SHOPS.length)], n, q, mat, pay: Math.round((n * each) / 10) * 10, until: now + this.LASTS };
  },
  matOf(it) {
    const sn = G.state.collection.find((x) => x.id === it.snapId), f = sn && sn.fabIds && G.CAT.FABRICS[sn.fabIds.than];
    return f ? f.mat : null;
  },
  fits(it, o) { return !it.sold && (it.quality || 0) >= o.q && (!o.mat || this.matOf(it) === o.mat); },
  matching() { const o = this.st().offer; return o ? G.state.rack.filter((it) => this.fits(it, o)) : []; },
  ready() { const o = this.on() && this.st().offer; return !!o && this.matching().length >= o.n; },
  deliver() {
    const k = this.st(), o = k.offer; if (!o || !this.ready()) return false;
    // the best-fitting dresses go: the lowest quality that still qualifies, so the finer ones stay for the fair
    const pick = this.matching().sort((a, b) => a.quality - b.quality).slice(0, o.n);
    G.state.rack = G.state.rack.filter((it) => !pick.includes(it));
    G.addCoins(o.pay); G.state.prestige = (G.state.prestige || 0) + 0.25 * o.n;
    k.offer = null; k.nextAt = Date.now() + this.GAP; k.done = (k.done || 0) + 1;
    G.sfx.coin(); G.toast(`Đã giao ${o.n} áo cho ${o.shop}: +${o.pay} xu`, G.C.green); G.save();
    if (G.quests) G.quests.event('donshop');
    return true;
  },
  decline() { const k = this.st(); k.offer = null; k.nextAt = Date.now() + this.GAP; G.save(); },
  leftText() {
    const o = this.st().offer, m = Math.max(0, o.until - Date.now()), h = Math.floor(m / 3600e3);
    return h ? `còn ${h} giờ` : `còn ${Math.max(1, Math.ceil(m / 60e3))} phút`;
  },
  needText(o) { return `${o.n} áo bán sẵn · chất lượng từ ${o.q}${o.mat ? ' · may bằng ' + G.CAT.MATS[o.mat].name.toLowerCase() : ''}`; }
};

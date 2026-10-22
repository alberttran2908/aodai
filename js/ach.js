// Thành tựu chủ tiệm: long goals across days — deliveries, perfect seams, coins earned while away, boutique
// orders, VIPs, Zalo bookings, streaks… Counters live in s.stats; each goal reached waits for its gift.
G.ach = {
  LIST: [
    { id: 'giao10', key: 'giao', n: 10, text: 'Giao thành công 10 áo', coins: 100 },
    { id: 'giao50', key: 'giao', n: 50, text: 'Giao thành công 50 áo', coins: 400 },
    { id: 'hh20', key: 'hoanhao', n: 20, text: '20 đường may “Hoàn hảo”', coins: 150 },
    { id: 'vang', key: 'idlecoins', n: 1000, text: 'Kiếm 1.000 xu khi vắng', coins: 150 },
    { id: 'quest15', key: 'quest', n: 15, text: 'Xong 15 nhiệm vụ ngày', coins: 200 },
    { id: 'diemdanh', key: 'checkin7', n: 1, text: 'Điểm danh 7 ngày liền', coins: 150 },
    { id: 'nhuom10', key: 'nhuom', n: 10, text: 'Nhuộm 10 mẻ vải', coins: 120 },
    { id: 'donshop5', key: 'donshop', n: 5, text: 'Giao 5 đơn hàng shop', coins: 250 },
    { id: 'vip3', key: 'vip', n: 3, text: 'May cho 3 khách sang', coins: 200 },
    { id: 'zalo10', key: 'zalo', n: 10, text: '10 khách đặt qua Zalo', coins: 120 },
    { id: 'thobac5', key: 'thobac', n: 5, text: 'Thợ phụ đạt bậc 5', coins: 300, max: true },
    { id: 'ghe5', key: 'ghe', n: 5, text: 'Ghé 5 tiệm bạn bè', coins: 100 }
  ],
  on() { const s = G.state; return !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge'; },
  // (a shop that existed before this counts the dresses it has already delivered)
  st() { const s = G.state; if (!s.stats) s.stats = { giao: s.served || 0 }; s.achGot = s.achGot || {}; return s; },
  val(a) { return Math.min(a.n, this.st().stats[a.key] || 0); },
  done(a) { return this.val(a) >= a.n; },
  // something happened n times (or, for a "max" counter, reached level n)
  count(key, n, max) {
    if (!this.on()) return;
    const s = this.st(), mine = this.LIST.filter((a) => a.key === key), was = mine.filter((a) => this.done(a));
    s.stats[key] = max ? Math.max(s.stats[key] || 0, n) : (s.stats[key] || 0) + (n === undefined ? 1 : n);
    for (const a of mine) if (this.done(a) && !was.includes(a)) G.toast(`Thành tựu: ${a.text}!`, G.C.green);
  },
  ready() { if (!this.on()) return 0; const s = this.st(); return this.LIST.filter((a) => this.done(a) && !s.achGot[a.id]).length; },
  got() { const s = this.st(); return this.LIST.filter((a) => s.achGot[a.id]).length; },
  claim(a) {
    const s = this.st(); if (!this.done(a) || s.achGot[a.id]) return;
    s.achGot[a.id] = Date.now(); G.addCoins(a.coins); G.sfx.coin(); G.save();
  }
};

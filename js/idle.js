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
    // the helper's alterations: hems, zips, taking in a waist — a share of a day's odd jobs per hour
    if (G.staff.working()) {
      const h = G.staff.current(), n = Math.round((G.staff.side() / 3) * hours);
      if (n > 0) { coins += n; lines.push({ icon: 'needle', text: `${h.name} nhận sửa đồ lặt vặt`, coins: n }); }
    }
    // the window: each dress on the rack has a small chance per hour of catching a passer-by's eye
    const sold = [];
    for (const it of s.rack) {
      if (it.sold || sold.length >= 2) continue;
      if (Math.random() < 1 - Math.pow(0.95, hours)) { const p = Math.round(G.fair.value(it) * 0.8); sold.push({ it, p }); }
    }
    for (const x of sold) { coins += x.p; lines.push({ icon: 'dress', text: 'Tủ kính bán một áo cho khách qua đường', coins: x.p }); }
    // an empty report ("nobody minded the shop") is a tip, shown at most once a day
    if (!lines.length) { if (Date.now() - (s.idleTipAt || 0) < 24 * 3600e3) return; s.idleTipAt = Date.now(); }
    // kept in the save until collected, so closing the tab again does not lose it
    s.idlePending = { away, capped: away > this.CAP, lines, coins, sold: sold.map((x) => ({ i: s.rack.indexOf(x.it), p: x.p })) };
  },
  get pending() { return G.state && G.state.idlePending; },
  set pending(v) { if (G.state) G.state.idlePending = v; },
  collect() {
    const P = this.pending; if (!P) return;
    for (const x of P.sold) { const it = G.state.rack[x.i]; if (it && !it.sold) { it.sold = true; it.soldFor = x.p; it.price = x.p; } }
    if (P.coins) { G.addCoins(P.coins); G.sfx.coin(); }
    if (G.staff.current() && G.state.staff) G.state.staff.earned += P.lines.filter((l) => l.icon === 'needle').reduce((a, l) => a + l.coins, 0);
    this.pending = null; this.stamp(); G.save();
  },
  awayText(ms) {
    const m = Math.round(ms / 60e3);
    return m < 60 ? `${m} phút` : `${Math.floor(m / 60)} giờ${m % 60 ? ' ' + (m % 60) + ' phút' : ''}`;
  },
  // what to say when nothing happened (no helper, empty rack): point at the ways to earn while away
  idleTip() {
    if (!G.staff.current()) return 'Thuê thợ phụ ở Xưởng để tiệm nhận sửa đồ cả khi bạn vắng.';
    if (!G.state.rack.some((it) => !it.sold)) return 'May áo bán sẵn treo sạp: tủ kính có thể bán giúp khi bạn vắng.';
    return '';
  },
  init() {
    // keep the "last seen" time fresh, and treat a long-hidden tab like a visit away
    setInterval(() => { if (this.on() && !document.hidden) { this.stamp(); G.save(); } }, 60e3);
    document.addEventListener('visibilitychange', () => {
      if (!this.on()) return;
      if (document.hidden) { this.stamp(); G.save(); this.hiddenAt = Date.now(); }
      else if (this.hiddenAt) { if (!this.pending) this.arrive(this.hiddenAt); this.hiddenAt = 0; this.stamp(); }
    });
  }
};

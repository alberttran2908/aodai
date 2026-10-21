// Shop front upgrades (Mặt tiền): one place that sums every bought item's effects.
G.front = {
  level: (k) => (G.state.front && G.state.front[k]) || 0,
  // { budget, newBudget, seats, patience, fit, bond, rent, util, fair, star, rack }
  mods() {
    const m = { budget: 0, newBudget: 0, seats: 0, patience: 0, fit: 0, bond: 0, rent: 0, util: 0, fair: 0, star: 0, rack: 3 };
    for (const k of G.FRONT_ORDER || []) {
      const lv = G.FRONT[k].levels[this.level(k)];
      for (const f in m) if (lv && lv[f] !== undefined) m[f] = f === 'rack' ? lv[f] : m[f] + lv[f];
    }
    return m;
  },
  next(k) { return G.FRONT[k].levels[this.level(k) + 1] || null; },
  buy(k) {
    const nx = this.next(k); if (!nx) return false;
    if (nx.rank && G.rank() < nx.rank) { G.toast(`Cần hạng ${nx.rank}`, G.C.red); return false; }
    if (!G.spend(nx.price)) return false;
    G.state.front[k] = this.level(k) + 1;
    G.sfx.good(); G.toast(`Tiệm có thêm: ${nx.name}!`, G.C.green); G.save();
    return true;
  }
};

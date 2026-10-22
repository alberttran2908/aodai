// Nhiệm vụ hôm nay: three small daily goals, the same for every player on a Vietnam calendar day (picked from
// the date), each with a gift once done. The game's steps report events here; the desk shows progress.
G.quests = {
  POOL: [
    { id: 'giao', ev: 'giao', n: 2, text: 'Giao thành công 2 áo', gift: { coins: 120 } },
    { id: 'q90', ev: 'q90', n: 1, text: 'Giao một áo chất lượng từ 90', gift: { coins: 100 } },
    { id: 'dochuan', ev: 'dochuan', n: 1, text: 'Đo chuẩn cả 3 vòng cho một khách', gift: { coins: 60 } },
    { id: 'hoanhao', ev: 'hoanhao', n: 3, text: 'May 3 đường “Hoàn hảo”', gift: { fabric: 'lua.trang.tron', cm: 300 } },
    { id: 'nhuom', ev: 'nhuom', n: 1, text: 'Nhuộm một mẻ vải ở Xưởng', gift: { coins: 60 }, needs: () => true },
    { id: 'ui', ev: 'ui', n: 1, text: 'Ủi phẳng hết nếp một chiếc áo', gift: { coins: 80 }, needs: () => (G.state.tools.iron || 0) > 0 },
    { id: 'sapsi', ev: 'sapsi', n: 1, text: 'Đặt một xe vải sỉ', gift: { coins: 40 } },
    { id: 'trangtri', ev: 'trangtri', n: 3, text: 'Đặt 3 hoạ tiết trang trí lên một áo', gift: { coins: 60 } },
    { id: 'khoe', ev: 'khoe', n: 1, text: 'Khoe tiệm với bạn bè (Album › Khoe cả tiệm)', gift: { coins: 50 }, needs: () => G.state.collection.some((it) => it.success && G.share.canShare(it)) },
    { id: 'donshop', ev: 'donshop', n: 1, text: 'Giao một đơn hàng shop', gift: { coins: 100 }, needs: () => !!(G.contract && G.contract.on() && G.contract.st().offer) }
  ],
  on() { const s = G.state; return !G.CFG.focus && !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge'; },
  // today's three, picked from the date so everyone gets the same ones (skipping goals this shop cannot do yet)
  today() {
    if (!this.on()) return null;
    const s = G.state, day = G.dateKeyVN();
    if (!s.quests || s.quests.day !== day) {
      const rng = G.mulberry32(G.hash32('quests|' + day)), pool = this.POOL.filter((q) => !q.needs || q.needs()), list = [];
      while (list.length < 3 && pool.length) list.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      s.quests = { day, list: list.map((q) => ({ id: q.id, prog: 0, claimed: false })) };
    }
    return s.quests;
  },
  def(id) { return this.POOL.find((q) => q.id === id); },
  done(q) { return q.prog >= this.def(q.id).n; },
  // the game reports something (a delivery, a perfect seam…); n = how many at once
  event(ev, n) {
    if (G.ach) G.ach.count(ev, n); // the same events feed the long goals
    const t = this.today(); if (!t) return;
    for (const q of t.list) {
      const d = this.def(q.id); if (d.ev !== ev || this.done(q)) continue;
      q.prog = Math.min(d.n, q.prog + (n || 1));
      if (this.done(q)) { G.toast(`Xong nhiệm vụ: ${d.text}`, G.C.green); G.sfx.good(); }
    }
    G.save();
  },
  ready() { const t = this.today(); return t ? t.list.filter((q) => this.done(q) && !q.claimed).length : 0; },
  claim(q) {
    const d = this.def(q.id), s = G.state;
    if (!this.done(q) || q.claimed) return;
    q.claimed = true;
    if (d.gift.coins) G.addCoins(d.gift.coins);
    if (d.gift.fabric && G.CAT.FABRICS[d.gift.fabric]) s.roll[d.gift.fabric] = (s.roll[d.gift.fabric] || 0) + d.gift.cm;
    if (G.ach) G.ach.count('quest');
    G.sfx.coin(); G.save();
  }
};

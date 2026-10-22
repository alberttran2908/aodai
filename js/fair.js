// Sạp hội chợ: sew ready-to-wear dresses (the normal loop, no client: straight to the sketchbook on the shop's
// mannequin), hang them on the rack, and at the end of every month price them at the street fair before the
// bills come. A dress in the newspaper's trending style sells for more. Each one costs a day; the rack is capped.
G.fair = {
  rackSize() { return G.front.mods().rack; },
  due(m) { const s = G.state; return !s.isDaily && s.rack.some((it) => !it.sold) && s.fair.lastMonth < m; },
  // estimated value: materials + labour, scaled by quality, trend and the display window (Dressmaker-style)
  value(it) {
    const r = G.rank(), trend = G.state.press.trend;
    const labor = 120 + 15 * r;
    const trendMul = trend && it.tags && it.tags[trend.tag] >= 50 ? 1.25 : 1;
    return Math.round((it.matCost + it.decorCost + labor) * (0.55 + it.quality / 100) * trendMul * (1 + G.front.mods().fair) * Math.pow(0.9, it.age || 0));
  },
  trendy(it) { const tr = G.state.press.trend; return !!(tr && it.tags && it.tags[tr.tag] >= 50); },
  // start a ready-to-wear dress: the shop's own mannequin is the "client"
  start(male) {
    const s = G.state;
    s.commission = G.makeCommission({ client: male ? 'manocanh_nam' : 'manocanh', kind: 'rack', title: 'Áo bán sẵn', reqs: [], quality: 0, budget: 1, flags: { noHaggle: true } });
    s.commission.reqs = [];
    s.commission.measures = male ? { bust: 94, waist: 80, hip: 94 } : { bust: 84, waist: 66, hip: 90 };
    G.startJob(); G.job.fit = 0.9;
    G.go('sketch');
  },
  // finish: hang it on the rack (no pay, no bond, no press)
  hang(job, r, snap) {
    const s = G.state, need = G.fabricNeed(job);
    const matCost = Object.keys(need).reduce((a, id) => a + (need[id] / 100) * G.econ.price(id), 0);
    const decorCost = (job.decor.items || []).reduce((a, it) => a + G.CAT.DECOR[it.group].items[it.id].price, 0) +
      G.CAT.DECOR_ORDER.reduce((a, g) => { const grp = G.CAT.DECOR[g]; return a + (grp.kind === 'one' && job.decor[grp.field] ? grp.items[job.decor[grp.field]].price : 0); }, 0);
    s.rack.push({ snapId: snap.id, matCost: Math.round(matCost), decorCost, quality: r.quality, tags: r.tags, price: 0, age: 0, sold: false });
    G.save();
  },
  // the fair itself: seeded passers-by each buy the best bargain they find, or comment on the prices
  run(m) {
    const s = G.state, rng = G.econ.rng('fair', m), log = [];
    const buyers = 6 + Math.floor(rng() * 5);
    for (let b = 0; b < buyers; b++) {
      const wtp = 0.85 + rng() * 0.45;
      let best = null, gap = -1;
      for (const it of s.rack) if (!it.sold) { const g = wtp * this.value(it) - it.price; if (g >= 0 && g > gap) { best = it; gap = g; } }
      const near = s.rack.filter((it) => !it.sold).sort((a, b2) => a.price / this.value(a) - b2.price / this.value(b2))[0];
      if (best) { best.sold = true; best.soldFor = best.price; log.push({ it: best, buy: true, say: G.rpick(rng, G.FAIR_LINES.buy) }); }
      else if (near) { const ratio = near.price / this.value(near); log.push({ it: near, buy: false, say: G.rpick(rng, ratio > 1.21 ? G.FAIR_LINES.robbery : ratio > 1.05 ? G.FAIR_LINES.pricey : G.FAIR_LINES.browse) }); }
      else log.push({ it: null, buy: false, say: 'Hết áo rồi hả? Tiếc ghê!' });
    }
    return log;
  },
  // after the fair: money in, unsold dresses age (and lose 10% value), the month's bills follow
  close(m) {
    const s = G.state, sold = s.rack.filter((it) => it.sold);
    // (dresses already paid for elsewhere — the window while away, a shop's order — are not paid twice)
    const total = sold.filter((it) => !it.paid).reduce((a, it) => a + it.soldFor, 0);
    if (total) G.addCoins(total);
    s.prestige += 0.25 * sold.length;
    for (const it of sold) s.fair.notes.push({ ratio: Math.round((it.soldFor / this.value(it)) * 100) / 100, sold: true });
    s.rack = s.rack.filter((it) => !it.sold);
    for (const it of s.rack) it.age = (it.age || 0) + 1;
    s.fair.lastMonth = m; s.fair.notes = s.fair.notes.slice(-6);
    s.econ.fairPending = null;
    if (G.PRESS_HEAD && G.story.unlocked('paper')) {
      const rng = G.econ.rng('fairpress', m), head = sold.length >= 3 ? `Sạp ${s.shopName} cháy hàng ở phố đi bộ!` : sold.length ? `Sạp ${s.shopName} bán được ${sold.length} áo, người qua đường khen nức nở` : `Sạp ${s.shopName}: áo đẹp, giá… cũng đẹp`;
      G.press.newIssue([{ kind: 'fair', kim: Math.min(5, 2 + sold.length), headline: head, body: [`Hội chợ phố đi bộ tháng này, sạp của ${s.shopName} thu về ${total} xu.`], quote: G.rpick(rng, (G.SA_QUOTES && G.SA_QUOTES[sold.length >= 3 ? 4 : 3]) || ['']), snapId: sold[0] ? sold[0].snapId : null }], rng);
    }
    const res = G.econ.monthEnd(m);
    G.save();
    return { total, sold: sold.length, res };
  }
};

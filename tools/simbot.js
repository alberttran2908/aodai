// Balancing tool (dev only, not loaded by the game). In the browser console on the local server:
//   await import('/tools/simbot.js'); simEconomy(0.75, 0.6, 60)
//   simEconomy(0.55, 0.3, 60, 'business', { staff: 'teo' })   // careless player who hires Anh Tèo
// skill = typical cut/sew/fit quality (0..1), care = chance the bot designs for the brief instead of at random.
// The bot buys fabric at market prices and pays for decorations, so it feels the real economy.
// tests are silent (takes effect from the next reload of this tab)
try { sessionStorage.setItem('aodai_test_mute', '1'); } catch (e) { /* ignore */ }
window.runDialog = () => {
  const D = G.Dialog;
  for (let k = 0; k < 200 && D.active; k++) {
    const L = D.active.line;
    if (L.naming) { D.setName('Tiệm Thử'); continue; }
    if (L.choice) { D.choose(L.choice[0]); continue; }
    D.active.shown = 999; D.next();
  }
};
window.botPlay = (skill, care) => {
  const s = G.state, com = s.commission, C = G.CAT, rk = G.rank(), male = !!com.male;
  G.startJob(); const j = G.job; j.fit = skill;
  const mins = com.reqs.filter((r) => r.type === 'min'), maxs = com.reqs.filter((r) => r.type === 'max'), careful = Math.random() < care;
  const score = (tags) => (careful ? mins.reduce((a, r) => a + (tags[r.tag] || 0), 0) - maxs.reduce((a, r) => a + (tags[r.tag] || 0) * 1.5, 0) : Math.random());
  for (const p of C.PART_ORDER) {
    const opts = G.partOpts(p, rk, male), keys = Object.keys(C.PARTS[p].opts).filter((k) => opts.includes(C.PARTS[p].opts[k]));
    keys.sort((a, b) => score(C.PARTS[p].opts[b].tags) - score(C.PARTS[p].opts[a].tags)); j.part[p] = keys[0];
  }
  const mat = (com.reqs.find((r) => r.type === 'mat') || {}).mat, avoid = (com.reqs.find((r) => r.type === 'avoid') || {}).color;
  const ids = Object.keys(C.FABRICS).filter((id) => C.FABRICS[id].rank <= rk && (!careful || ((!mat || C.FABRICS[id].mat === mat) && !(avoid && C.FABRICS[id].colors.includes(avoid)))));
  ids.sort((a, b) => ((s.roll[b] || 0) > 200) - ((s.roll[a] || 0) > 200) || score(C.FABRICS[b].tags) - score(C.FABRICS[a].tags) || G.econ.price(a) - G.econ.price(b));
  const f = ids[0] || 'lua.trang.tron';
  j.fabs = { than: f, tay: f, co: f, quan: s.roll['lua.trang.tron'] > 150 ? 'lua.trang.tron' : f };
  const miss = G.scenes.sketch.missing();
  if (miss.length) {
    const cost = miss.reduce((a, m) => a + m.cost, 0);
    if (!G.spend(cost)) j.fabs = { than: 'lua.trang.tron', tay: 'lua.trang.tron', co: 'lua.trang.tron', quan: 'lua.trang.tron' };
    else for (const m of miss) s.roll[m.id] = (s.roll[m.id] || 0) + m.cm;
  }
  let dcost = 0;
  for (const g of C.DECOR_ORDER) {
    const grp = C.DECOR[g]; if (!com.reqs.some((r) => r.type === 'decor' && r.group === g)) continue;
    const items = Object.keys(grp.items).filter((k) => (grp.items[k].rank || 1) <= rk && C.decorFits(grp.items[k], male)).sort((a, b) => grp.items[a].price - grp.items[b].price);
    const k = items[0]; if (!k) continue;
    dcost += grp.items[k].price;
    if (grp.kind === 'one') j.decor[grp.field] = k; else j.decor.items.push({ group: g, id: k, x: 0, y: 40, size: 12, rot: 0 });
  }
  G.buildJob();
  const need = G.fabricNeed();
  for (const id in need) { s.roll[id] = Math.max(0, (s.roll[id] || 0) - Math.round(need[id] * 0.8)); if (s.roll[id] < 10) delete s.roll[id]; }
  if (dcost && !G.spend(dcost)) j.decor = { items: [] };
  const q = () => Math.min(1, Math.max(0.3, skill + (Math.random() - 0.5) * 0.2));
  j.cutScore = j.pieces.map(q); j.sew = j.asm.seams.map(q);
  // a hired helper re-sews the weakest seams
  if (G.staff.working()) {
    const h = G.staff.current();
    const order = j.sew.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).slice(0, h.maxSeams);
    for (const [v, i] of order) if (v < h.skill) j.sew[i] = G.staff.helpScore();
  }
  G.go('finish'); G.step(110, 16); G.fade = 0;
  return G.scenes.finish.r;
};
window.simEconomy = (skill, care, maxDays, mode, opts) => {
  opts = opts || {};
  if (mode === 'challenge') { localStorage.removeItem('aodai_challenge_v1'); G.startChallenge(); } else G.reset(mode || 'business');
  let n = 0, fails = 0, rescue = null, out = 'time';
  const worthAt = {}, curve = [];
  for (let it = 0; it < 400; it++) {
    G.go('desk'); G.step(2, 16);
    if (G.sceneName === 'ledger') { out = G.state.econ.bankrupt ? 'BANKRUPT' : 'finished'; break; }
    if (G.Dialog.active) { runDialog(); if (G.sceneName === 'ledger') { out = G.state.econ.bankrupt ? 'BANKRUPT' : 'finished'; break; } continue; }
    if (G.state.econ.rescued && rescue === null) rescue = G.state.day;
    if (G.state.day > maxDays) break;
    if (!G.state.commission) {
      // pick the best waiting client (pay minus difficulty); an empty bench means closing for the day
      const seats = G.bench.seats();
      if (!seats.length) { G.scenes.desk.closeDay(); continue; }
      let bi = 0; seats.forEach((st, i) => { const v = (x) => x.com.budget - 40 * x.com.reqs.length; if (v(st) > v(seats[bi])) bi = i; });
      G.bench.take(bi);
    }
    const com = G.state.commission;
    if (opts.haggle !== false && !G.haggle.skip(com)) {
      // quote by skill: confident tailors ask more
      const q = Math.round(G.clamp(1 + (skill - 0.7) * 1.2, 0.95, 1.25) * 20) / 20, res = G.haggle.react(com, q);
      G.haggle.apply(com, res.counter || q, res.how);
    }
    if (opts.staff && !G.staff.current() && G.rank() >= G.HELPERS[opts.staff].rank) { G.staff.hire(opts.staff); runDialog(); }
    const r = botPlay(skill, care); n++; if (!r.success) fails++;
    if (G.state.day % 10 === 1) worthAt[G.state.day] = G.econ.netWorth();
    if ((G.state.day - 1) % 5 === 0) curve[(G.state.day - 1) / 5] = G.econ.netWorth();
  }
  return { skill, care, out, day: G.state.day, orders: n, fails, rank: G.rank(), coins: G.state.coins, debt: G.state.econ.debt, rescue, worth: G.econ.netWorth(), worthAt, curve };
};

// Đơn ngày: one commission per Vietnam calendar day, identical for every player (seeded by the date).
// It is played in a sandbox state (rank 5, plenty of coins and fabric) so the real save is untouched;
// only the result, streak and a small coin reward are written back. First try of the day is the official score.
G.daily = {
  real: null, last: null,
  key: () => G.dateKeyVN(),
  label(key) { key = key || this.key(); return key.slice(8, 10) + '/' + key.slice(5, 7); },
  rng(key) { return G.mulberry32(G.hash32('aodai|' + key)); },
  played(key) { return !!G.state.daily.results[key || this.key()]; },
  begin() {
    if (G.state.isDaily) return;
    const real = G.state, key = this.key(), rng = this.rng(key);
    const sb = G.newState();
    Object.assign(sb, { isDaily: true, dailyKey: key, shopName: real.shopName, muted: real.muted, settings: real.settings, prestige: G.RANK_AT[4], coins: 9999, roll: {}, tools: real.tools });
    sb.story.phase = 'done';
    for (const id in G.CAT.FABRICS) if (G.CAT.FABRICS[id].rank <= 5) sb.roll[id] = 800;
    this.real = real; G.state = sb; G.saveLock = true;
    // regulars only, so the order is the same whether parody clients are on or off
    const cl = G.rpick(rng, G.CAT.CLIENTS.filter((c) => !c.star));
    sb.commission = G.makeCommission({ client: cl.id, kind: 'daily', title: 'Đơn ngày ' + this.label(key), rank: 5, rng });
    G.job = null;
    G.go('desk');
  },
  abort() {
    if (!G.state.isDaily) return;
    G.state = this.real; this.real = null; G.saveLock = false; G.job = null;
    G.go('desk');
  },
  end(r, job) {
    const key = G.state.dailyKey, kim = G.press.kim(r, job.com);
    const snap = G.snapOf(job, r, { kim, kind: 'daily', date: key });
    G.state = this.real; this.real = null; G.saveLock = false;
    const s = G.state, D = s.daily;
    const okN = r.checks.filter((c) => c.ok).length, score = Math.round(0.7 * r.quality + (30 * okN) / (r.checks.length || 1));
    let res = D.results[key];
    const first = !res;
    if (first) {
      const prevDay = new Date(Date.parse(key + 'T00:00:00Z') - 864e5).toISOString().slice(0, 10);
      D.streak = D.lastDate === prevDay ? D.streak + 1 : 1;
      D.lastDate = key;
      const reward = 50 + 10 * Math.min(D.streak, 10);
      G.addCoins(reward);
      res = { score, best: score, q: r.quality, grain: r.grain, fit: r.fit, sew: r.sew, reqs: r.checks.map((c) => c.ok), kim, client: job.com.client, snap, reward, streak: D.streak };
    } else if (score > res.best) { res.best = score; res.bestSnap = snap; }
    D.results[key] = res;
    const keys = Object.keys(D.results).sort();
    while (keys.length > 21) delete D.results[keys.shift()];
    G.save();
    Promise.resolve().then(() => G.net.submitDaily({ date: key, score, firstTry: first, payload: G.share.encode(snap, 1500) })).catch(() => {}); // offline is fine
    this.last = { key, score, first, res, snap };
    return this.last;
  },
  // Wordle-style result text: shows how well, not what was made (plus a link to see the dress)
  shareText(key) {
    key = key || this.key();
    const res = G.state.daily.results[key]; if (!res) return '';
    const cl = G.client(res.client), pct = (x) => Math.round(x * 100);
    return [
      `Tiệm May Áo Dài · Đơn ngày ${this.label(key)}/${key.slice(0, 4)}`,
      `Khách: ${cl ? cl.name : ''} · Điểm ${res.score}/100 · Chuỗi 🔥${res.streak}`,
      `✂️ ${pct(res.grain)}  📏 ${pct(res.fit)}  🪡 ${pct(res.sew)}`,
      `Yêu cầu: ${res.reqs.map((ok) => (ok ? '✅' : '❌')).join('')}`,
      `Madame Sa: ${'🪡'.repeat(res.kim)}`,
      `Xem áo: ${G.share.url(G.share.encode(res.snap))}`
    ].join('\n');
  }
};

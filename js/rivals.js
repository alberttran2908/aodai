// Bảng hẻm: your net worth against the other shops in the alley (and, once a backend exists, ghosts of real
// players near your score via G.net). Rival values follow their measured curves, nudged by a seeded ±8% and
// by the month's market, so a weekly challenge shows everyone the same rivals.
G.rivals = {
  worth(r, day) {
    const k = (Math.max(1, day) - 1) / 5, i = Math.min(r.curve.length - 2, Math.floor(k)), t = Math.min(1, k - i);
    const base = r.curve[i] + (r.curve[i + 1] - r.curve[i]) * t;
    const n = 0.92 + 0.16 * G.econ.rng('rival|' + r.id, Math.floor(k))();
    const mb = G.econ.market(Math.floor(k)).budget, mm = mb ? 0.97 + (mb - 1) * 0.5 : 1; // a bad month hits the whole alley
    return Math.round(base * n * mm);
  },
  // sorted board: you + the alley's shops (+ online ghosts later)
  board(day) {
    const s = G.state; day = day || s.day;
    const rows = (G.RIVALS || []).map((r) => ({ id: r.id, name: r.name, owner: r.owner, col: r.col, note: r.note, worth: this.worth(r, day) }));
    rows.push({ id: 'you', name: s.shopName, owner: 'Bạn', col: G.UI.T.accent, worth: G.econ.netWorth(), you: true });
    for (const g of this.ghosts || []) rows.push(Object.assign({ ghost: true }, g));
    return rows.sort((a, b) => b.worth - a.worth);
  },
  rank(day) { return this.board(day).findIndex((r) => r.you) + 1; },
  // month end: Kevin notices when you pass his shop for the first time
  check() {
    const s = G.state; if (!G.econ.on() || s.story.flags.passedKevin) return;
    const kev = (G.RIVALS || []).find((r) => r.id === 'kevin');
    if (kev && G.econ.netWorth() > this.worth(kev, s.day)) { s.story.flags.passedKevin = true; s.story.flags.kevinVisit = true; }
  },
  // the paper's monthly box
  top5Text(day) { return this.board(day).slice(0, 5).map((r, i) => `${i + 1}. ${r.name}${r.you ? ' (bạn)' : ''} · ${r.worth.toLocaleString('vi-VN')} xu`); },
  async loadGhosts() {
    try { const rows = await G.net.alleyBoard(); this.ghosts = (rows || []).slice(0, 5).map((r) => ({ name: '👤 ' + r.name, worth: r.worth, col: '#7a9a6a' })); } catch (e) { this.ghosts = []; }
  }
};

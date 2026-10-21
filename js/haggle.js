// Báo giá (Recettear / Moonlighter style): before taking an order you name your price, 90–140% of what the
// client offered. Each client has a hidden ceiling (friends and good press raise it). Hit it right on and
// you get a "chốt chuẩn" streak bonus; overshoot and they counter once. A higher price raises the quality
// they expect — and a failed dress is paid on the original offer, so overpricing is a real risk.
G.haggle = {
  STEPS: [0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4],
  LINES: {
    cheap: ['Ủa, rẻ vậy em? Chị đồng ý liền!', 'Giá này thì chị chịu quá chứ!'],
    ok: ['Hợp lý, chốt nha.', 'Được em, giá vậy là phải chăng.'],
    pin: ['Chốt! Em nói giá chuẩn ghê.', 'Đúng giá chị tính trong đầu luôn đó!'],
    counter: ['Hơi chát… {x} xu được không em?', 'Bớt chút đi em, {x} xu nha?'],
    robbery: ['Trời, cắt cổ vậy em! Chị chỉ đưa được {x} thôi.', 'Giá này chị mua được cái xe đạp! {x} xu thôi nha.']
  },
  skip(com) { return !com || com.kind === 'daily' || com.kind === 'copy' || (com.flags && com.flags.noHaggle) || com.refId === 'ch0_batu'; },
  // the hidden ceiling (seeded, so the weekly challenge is the same for everyone)
  ceil(com) {
    const s = G.state, lvl = G.bond.get(com.client).lvl || 0, m = G.econ.market();
    let c = 1.05 + 0.04 * Math.min(5, lvl) + 0.12 * G.econ.rng('haggle|' + com.client, s.day)();
    if (s.press.boost > 0) c += 0.05;
    if (m.id === 'rain') c -= 0.05;
    if (m.id === 'kevinSale' && lvl < 3) c -= 0.08;
    if (com.kind === 'arc' || com.kind === 'story') c = Math.min(c, 1 + 0.04 * lvl); // friends in need: no gouging
    return G.clamp(Math.round(c * 20) / 20, 1, 1.35);
  },
  qualityFor(com, q) {
    const d = q >= 1 ? Math.round((q - 1) * 50) : -Math.round((1 - q) * 50);
    return Math.min(92, Math.max(30, com.qualityBase + d));
  },
  budgetFor(com, q) { return Math.round((com.baseBudget * q) / 10) * 10; },
  // how the client reacts to a quote: { how, q (final if agreed), counter?, line }
  react(com, q) {
    const c = this.ceil(com), pick = (k, x) => G.pick(this.LINES[k]).replace('{x}', x);
    if (q <= c - 0.15) return { how: 'cheap', q, line: pick('cheap') };
    if (q < c - 0.05) return { how: 'ok', q, line: pick('ok') };
    if (q <= c) return { how: 'pin', q, line: pick('pin') };
    const cq = q > c + 0.1 ? Math.max(1, c - 0.05) : c;
    return { how: q > c + 0.1 ? 'robbery' : 'counter', counter: cq, line: pick(q > c + 0.1 ? 'robbery' : 'counter', this.budgetFor(com, cq)) };
  },
  apply(com, q, how) {
    const h = G.state.haggle;
    com.quote = q; com.budget = this.budgetFor(com, q); com.quality = this.qualityFor(com, q);
    if (how === 'pin') { h.streak++; h.pins++; G.bond.add(com.client, 2); } else if (how !== 'cheap') h.streak = 0;
    if (q < 1) G.bond.add(com.client, 4);
    if (how === 'robbery') { const b = G.bond.get(com.client); b.pts = Math.max(G.bond.AT()[b.lvl], b.pts - 2); }
    h.notes[com.client] = { lastQ: q, result: how };
    G.save();
  },
  streakTip() { return Math.min(0.05, 0.01 * G.state.haggle.streak); },
  avgQuality() {
    const list = G.state.collection.slice(-5);
    return list.length ? Math.round(list.reduce((a, x) => a + (x.quality || 0), 0) / list.length) : 60;
  }
};

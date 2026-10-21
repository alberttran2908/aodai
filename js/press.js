// Báo Trà Đá: after notable deliveries Tí Flash snaps a photo and Madame Sa rates the dress with 1–5 needles (kim)
// in her column "Kim Chỉ Nam". Good reviews bring prestige and better-paying clients; bad ones only bring
// curious visitors (the paper never costs reputation). Every issue forecasts a trending style.
G.press = {
  P: () => G.state.press,
  kim(r, com) {
    let k = 1 + (r.quality >= 60) + (r.quality >= 80) + (r.checks.every((c) => c.ok) ? 1 : 0) + (r.quality >= 92 && (r.exceeded > 0 || r.trendHit) ? 1 : 0);
    if (!r.success) k = Math.min(k, 3);
    return Math.max(1, Math.min(5, k));
  },
  fill(tpl, v) { return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined && v[k] !== null ? v[k] : m)); },
  pick(rng, x) { return Array.isArray(x) ? G.rpick(rng, x) : x; },
  vars(r, job, kim) {
    const com = job.com, cl = G.client(com.client), C = G.CAT;
    const top = C.TAG_KEYS.slice().sort((a, b) => r.tags[b] - r.tags[a]);
    const miss = r.checks.find((c) => !c.ok);
    const f = C.FABRICS[job.fabs.than];
    const nm = (part, key) => G.scenes.sketch.optName(part, key).toLowerCase();
    return {
      client: cl.name, role: cl.role, shop: G.state.shopName, fabric: f ? f.name : 'lụa', quality: r.quality, kim,
      tag: C.TAGS[top[0]].name.toLowerCase(), tag2: C.TAGS[top[1]].name.toLowerCase(), tagVal: r.tags[top[0]],
      reqMiss: miss ? G.reqText(miss.r).toLowerCase() : '', title: com.title || '', day: G.state.day,
      co: nm('co', job.part.co), dang: nm('dang', job.part.dang)
    };
  },
  gossip(rng) {
    const s = G.state, out = [];
    const friends = G.CAT.CLIENTS.filter((c) => G.clientAllowed(c) && s.bond[c.id] && s.bond[c.id].lvl >= 1 && G.BONDS && G.BONDS[c.id] && G.BONDS[c.id].gossip);
    while (friends.length && out.length < 2) { const c = friends.splice(Math.floor(rng() * friends.length), 1)[0]; out.push(G.rpick(rng, G.BONDS[c.id].gossip)); }
    const filler = (G.PRESS_FILLER || []).slice();
    while (out.length < 2 && filler.length) out.push(filler.splice(Math.floor(rng() * filler.length), 1)[0]);
    return out;
  },
  newIssue(articles, rng) {
    const s = G.state, P = this.P();
    const trendTag = G.rpick(rng, G.CAT.TAG_KEYS);
    P.trend = { tag: trendTag, until: s.day + 3 };
    const issue = { no: P.nextNo++, day: s.day, articles, gossip: this.gossip(rng), ad: G.KEVIN_ADS ? G.rpick(rng, G.KEVIN_ADS) : '', trend: trendTag };
    if (P.pendingCorrection) { issue.correction = P.pendingCorrection; P.pendingCorrection = null; }
    if (G.econ.on()) {
      const m = G.econ.market(); issue.market = { name: m.name, desc: m.desc };
      // the first issue of each month carries the alley's top-5 shops
      if (G.rivals && P.top5Month !== G.econ.month()) { P.top5Month = G.econ.month(); issue.top5 = G.rivals.top5Text(); }
    }
    P.issues.push(issue);
    if (P.issues.length > 40) P.issues.shift();
    P.unread++; P.lastIssueDay = s.day;
    return issue;
  },

  // called from the finish screen; returns { kim, issue? }
  onDelivery(r, job, snapId) {
    const s = G.state, P = this.P(), com = job.com, cl = G.client(com.client);
    const kim = this.kim(r, com);
    if (!G.PRESS_HEAD || !G.story.unlocked('paper')) return { kim };
    const rng = G.mulberry32(G.hash32('press|' + s.day + '|' + snapId + '|' + com.client));
    const H = G.PRESS_HEAD;
    let head = null, kind = null;
    if (com.kind === 'event' && H.event && H.event[com.refId]) { head = H.event[com.refId]; kind = 'event'; }
    else if ((com.kind === 'story' || com.kind === 'arc') && H.story) { head = this.pick(rng, H.story); kind = 'story'; }
    else if (cl.star && H.star) { head = r.success ? H.star[cl.id] : H.star._fail; kind = 'star'; }
    else if (com.flags && com.flags.rival && r.quality >= 80 && H.rival) { head = this.pick(rng, H.rival); kind = 'rival'; }
    else if (r.success && r.quality >= 92) kind = 'great';
    else if (r.quality < 50) kind = 'bad';
    else if (!r.success && r.qualOk) kind = 'funny';
    else if (rng() < 0.25) kind = kim >= 5 ? 'great' : kim === 4 ? 'good' : 'ok';
    if (!kind) {
      // a quiet stretch still gets a little issue of alley gossip every few days
      if (s.day - P.lastIssueDay >= 4) this.newIssue([], rng);
      return { kim };
    }
    if (!head) head = this.pick(rng, H[kind] || H.ok);
    const v = this.vars(r, job, kim);
    const B = G.PRESS_BODY || {};
    const leadKey = r.quality < 50 ? 'bad' : !r.success && r.qualOk ? 'funny' : kim >= 4 ? 'good' : 'ok';
    const body = [
      this.pick(rng, (B.lead && (B.lead[leadKey] || B.lead.good)) || ''),
      this.pick(rng, B.detail || ''),
      this.pick(rng, B.close || '')
    ].filter(Boolean).map((t) => this.fill(t, v));
    const art = { kind, kim, clientId: cl.id, headline: this.fill(head, v), body, quote: this.fill(this.pick(rng, (G.SA_QUOTES && G.SA_QUOTES[kim]) || ['']), v), snapId };
    // Madame Sa sometimes gets a fabric wrong… and corrects it in the next issue
    if (G.PRESS_CORRECTIONS && rng() < 0.125) P.pendingCorrection = this.fill(G.rpick(rng, G.PRESS_CORRECTIONS), v);
    const issue = this.newIssue([art], rng);
    // effects (never negative)
    if (kim >= 5) { s.prestige += 0.3; P.boost = 2; s.story.starBoost = 3; }
    else if (kim === 4) { s.prestige += 0.15; P.boost = Math.max(P.boost, 1); }
    else if (kim <= 2) P.curious = 1;
    P.badRun = kim <= 2 ? (P.badRun || 0) + 1 : 0;
    if (P.badRun >= 2) G.story.mailFrom('batu_tip');
    return { kim, issue };
  },
  // special issue at the end of a chapter
  chapterIssue(ch, kim) {
    const H = G.PRESS_HEAD; if (!H || !H.chapter || !H.chapter[ch.id]) return;
    const s = G.state, rng = G.mulberry32(G.hash32('chapter|' + ch.id));
    const last = s.collection[s.collection.length - 1];
    const v = { shop: s.shopName, kim: kim || 5, day: s.day };
    const art = { kind: 'chapter', kim: Math.min(5, Math.max(3, Math.round((kim || 15) / 3))), headline: this.fill(H.chapter[ch.id], v),
      body: [this.fill(this.pick(rng, (G.PRESS_BODY && G.PRESS_BODY.close) || ''), v)], quote: this.fill(this.pick(rng, (G.SA_QUOTES && G.SA_QUOTES[5]) || ['']), v), snapId: last ? last.id : null, special: true };
    this.newIssue([art], rng);
  }
};

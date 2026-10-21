// Season 1 "Hẻm Chỉ Hồng": chapters gated by rank + goals, scripted scenes at the desk,
// story orders in a queue, who walks in next (G.story.nextVisit), and the mailbox.
G.story = {
  cameo: null, // id of the NPC/client standing at the counter during a scene
  st: () => G.state.story,
  chapter() { return G.CHAPTERS ? G.CHAPTERS[this.st().ch] || null : null; },
  count(k, n) { const c = this.st().counters; c[k] = (c[k] || 0) + (n === undefined ? 1 : n); },
  value(k) {
    const s = G.state;
    if (k === 'bondL1') return Object.values(s.bond || {}).filter((b) => b.lvl >= 1).length;
    if (k === 'bondL2') return Object.values(s.bond || {}).filter((b) => b.lvl >= 2).length;
    return this.st().counters[k] || 0;
  },
  goals(ch) {
    ch = ch || this.chapter(); if (!ch) return [];
    return ch.goals.map((g) => {
      const off = G.parody() === 'off' && g.alt;
      const have = Math.min(g.n, this.value(off ? g.alt : g.k));
      return { t: off && g.tAlt ? g.tAlt : g.t, have, n: g.n, done: have >= g.n };
    });
  },
  goalsDone(ch) { return this.goals(ch).every((g) => g.done); },
  unlocked: (what) => {
    const st = G.state.story;
    if (what === 'paper') return st.ch >= 2 || (st.ch === 1 && st.phase !== 'intro') || !!st.flags.paper;
    if (what === 'mail') return !!G.state.mailUnlocked;
    return true;
  },

  // called whenever the desk is shown: play a chapter intro / outro when due. Returns true if a scene started.
  onDesk() {
    if (!G.CHAPTERS || !G.SCRIPTS || (G.Dialog && G.Dialog.active) || G.state.isDaily) return false;
    const st = this.st(), ch = this.chapter();
    if (st.flags.lixiCall && !G.state.commission) {
      st.flags.lixiCall = false;
      G.Dialog.open('tet_lixi', {}, () => G.save());
      return true;
    }
    if (!ch || st.phase === 'done') return false;
    if (st.phase === 'intro' && G.rank() >= ch.rank && !G.state.commission) {
      st.phase = 'play'; st.counters = {};
      if (ch.id === 'ch1') st.flags.paper = true;
      G.save();
      G.Dialog.open(G.parody() === 'off' && ch.introAlt ? ch.introAlt : ch.intro, {}, () => G.save());
      return true;
    }
    if (st.phase === 'play' && this.goalsDone(ch) && !G.state.commission) {
      const kim = st.flags.finaleKim || 0;
      const id = ch.outroSilver && kim < 12 ? ch.outroSilver : ch.outro;
      G.Dialog.open(id, { kim }, () => {
        const got = this.reward(ch);
        if (G.press) G.press.chapterIssue(ch, kim);
        st.ch++; st.phase = st.ch >= G.CHAPTERS.length ? 'done' : 'intro';
        G.save();
        if (got.length) G.toast('Thưởng chương: ' + got.join(' · '), G.C.green);
        if (st.flags.parade) { st.flags.parade = false; G.go('parade'); return; }
        this.onDesk();
      });
      return true;
    }
    return false;
  },
  reward(ch) {
    const s = G.state, rw = ch.reward || {}, out = [];
    if (rw.coins) { G.addCoins(rw.coins); out.push(`+${rw.coins} xu`); }
    if (rw.fabric && G.CAT.FABRICS[rw.fabric]) { s.roll[rw.fabric] = (s.roll[rw.fabric] || 0) + (rw.cm || 300); out.push(`+${((rw.cm || 300) / 100).toFixed(0)} m vải`); }
    s.prestige += 1 + (rw.prestige || 0); out.push('+danh tiếng');
    if (rw.mail) { s.mailUnlocked = true; this.mailFrom(rw.mail); }
    if (rw.badge && !s.badges.includes(rw.badge)) s.badges.push(rw.badge);
    return out;
  },
  mailFrom(id) {
    const L = G.LETTERS && G.LETTERS[id]; if (!L) return;
    // yearly letters (Tết lì xì) get one copy per in-game year
    G.mail.add(Object.assign({}, L, { id: id === 'lixi' ? 'lixi_' + G.cal.date().year : id }));
  },

  // scripted actions used by dialog steps { do: … }
  act(step) {
    const s = G.state;
    switch (step.do) {
      case 'queueOrder': if (!this.st().queue.includes(step.id)) this.st().queue.push(step.id); break;
      case 'giveFabric':
        if (G.CAT.FABRICS[step.id]) { s.roll[step.id] = (s.roll[step.id] || 0) + (step.cm || 200); G.toast(`+${((step.cm || 200) / 100).toFixed(1)} m ${G.CAT.FABRICS[step.id].name}`, G.C.green); }
        break;
      case 'coins': G.addCoins(step.n || 0); G.toast(`+${step.n} xu`, G.C.green); break;
      case 'mail': this.mailFrom(step.id); break;
      case 'mailUnlock': s.mailUnlocked = true; break;
      case 'walkIn': this.cameo = step.id; break;
      case 'walkOut': if (this.cameo === step.id) this.cameo = null; break;
      case 'flag': this.st().flags[step.k] = step.v === undefined ? true : step.v; break;
      case 'badge': if (!s.badges.includes(step.id)) s.badges.push(step.id); break;
      case 'parade': this.st().flags.parade = true; break;
    }
  },

  // a chapter / scripted order by id (G.STORY_ORDERS)
  orderCommission(id) {
    const o = G.STORY_ORDERS && G.STORY_ORDERS[id]; if (!o) return null;
    let client = o.client;
    if (client === '@topBond') {
      const best = G.CAT.CLIENTS.filter(G.clientAllowed).sort((a, b) => G.bond.get(b.id).pts - G.bond.get(a.id).pts)[0];
      client = best && G.bond.get(best.id).pts > 0 ? best.id : 'vy';
    }
    if (!G.client(client)) return null;
    return G.makeCommission({ client, kind: 'story', title: o.title, line: o.line, reqs: o.reqs, budget: o.budget, budgetMul: o.budgetMul, quality: o.quality, refId: id, flags: o.vip ? { vip: true } : {} });
  },

  // who rings the bell next: story queue → seasonal event → a friend's personal story → an ordinary walk-in
  nextVisit() {
    const s = G.state, st = this.st();
    const use = (com) => {
      // chapter 2: Kevin's "24h" flyer reaches half of all clients (not the scripted story orders)
      if (st.ch === 2 && st.phase === 'play' && com.kind !== 'story' && !com.flags.rival && Math.random() < 0.5) { com.flags.rival = true; com.quality += 5; }
      s.commission = com; s.lastClient = com.client; G.save(); return com;
    };
    while (st.queue.length) {
      const q = st.queue.shift();
      const com = typeof q === 'string' ? this.orderCommission(q) : q && q.kind === 'copy' && G.share ? G.share.copyCommission(q) : null;
      if (com) return use(com);
    }
    // chapter 4 "Sao về hẻm nhỏ": a famous client is guaranteed every third visit until the goal is met
    if (st.ch === 4 && st.phase === 'play' && G.parody() !== 'off' && this.value('starServed') < 3) {
      st.sinceStar = (st.sinceStar || 0) + 1;
      if (st.sinceStar >= 3) { st.sinceStar = 0; return use(G.newCommission({ starChance: 1 })); }
    }
    // the weekly challenge draws every visit from the shared seed, so all players meet the same clients
    st.visits = (st.visits || 0) + 1;
    const rng = s.mode === 'challenge' ? G.mulberry32(G.hash32(s.seed + '|visit|' + st.visits)) : Math.random;
    const ev = G.cal && G.cal.activeEvent();
    if (ev && rng() < ev.chance) { const com = G.cal.eventCommission(ev, rng); if (com) return use(com); }
    const ready = G.CAT.CLIENTS.filter((c) => c.id !== s.lastClient && G.bond.arcReady(c.id));
    if (ready.length && (st.sinceArc >= 3 || rng() < 0.35)) {
      st.sinceArc = 0;
      return use(G.bond.arcCommission(G.rpick(rng, ready).id, rng));
    }
    st.sinceArc++;
    let starChance = G.parody() === 'off' ? 0 : st.ch >= 4 ? 0.35 : 0.1;
    if (st.starBoost > 0) { starChance += 0.1; st.starBoost--; }
    return use(G.newCommission({ starChance, rng }));
  },

  onDelivery(r, job, kim) {
    const st = this.st(), com = job.com, cl = G.client(com.client);
    if (r.success) this.count('success');
    if (r.success && cl && cl.star) this.count('starServed');
    if (r.success && ((com.flags && com.flags.vip) || G.bond.get(com.client).lvl >= 3)) this.count('vipServed');
    if (com.flags && com.flags.rival && r.quality >= 80) this.count('keepVsRival');
    if (kim >= 3) this.count('kim3');
    if (kim >= 4) this.count('kim4');
    if (com.kind === 'story' && com.refId) {
      this.count('done_' + com.refId);
      if (/^ch5_/.test(com.refId)) st.flags.finaleKim = (st.flags.finaleKim || 0) + (kim || 0);
    }
  }
};

G.mail = {
  add(m) {
    const s = G.state;
    if (!m || s.mail.some((x) => x.id === m.id)) return;
    s.mail.unshift(Object.assign({ day: s.day, read: false, claimed: false }, m));
    s.mailUnlocked = true;
    G.toast('✉ Có thư mới trong hộp thư!');
    G.save();
  },
  unread: () => G.state.mail.filter((m) => !m.read).length,
  claim(m) {
    const s = G.state, g = m.gift; if (!g || m.claimed) return;
    if (g.coins) G.addCoins(g.coins);
    if (g.fabric && G.CAT.FABRICS[g.fabric]) s.roll[g.fabric] = (s.roll[g.fabric] || 0) + (g.cm || 200);
    m.claimed = true; G.sfx.coin(); G.save();
  }
};

// Game state v2 (Dressmaker-style loop): coins, prestige rank, fabric roll in cm, commissions, job.
(function () {
  const KEY = 'aodai_tailor_v2';
  const D = G.DATA, C = G.CAT;

  G.newState = function () {
    return {
      v: 3, coins: 400, prestige: 0, served: 0, muted: false, lastClient: null,
      roll: { 'lua.trang.tron': 450, 'lua.do.tron': 300, 'dui.be.tron': 250 }, // cm of fabric owned
      commission: null, collection: [], snapSeq: 0, tools: { scissors: 0, machine: 0, iron: 0 },
      // season 1 "Hẻm Chỉ Hồng"
      shopName: 'Tiệm May Chỉ Hồng', day: 1, badges: [],
      bond: {},                                  // clientId → { pts, lvl, arc, gifted, met }
      story: { ch: 0, phase: 'intro', counters: {}, flags: {}, queue: [], sinceArc: 0, starBoost: 0 },
      press: { issues: [], unread: 0, boost: 0, curious: 0, trend: null, nextNo: 1, lastIssueDay: 0 },
      mail: [], mailUnlocked: false,
      events: { progress: {}, done: {} },
      daily: { results: {}, streak: 0, lastDate: null },
      settings: { parody: null, disclaimerSeen: false },
      showcase: [],
      // economy: 'business' (bills, debt, bankruptcy — everyone's shop) · 'challenge' (seeded 30-day weekly run)
      mode: 'business', seed: 'run-' + Math.floor(Math.random() * 1e9).toString(36), endDay: null,
      econ: { debt: 0, missed: 0, inc: 0, out: 0, history: [], rescued: false, bankrupt: false, finished: false, pending: null, worthLog: [], lostToRival: 0, fairPending: null },
      // design doc 2: quoting, waiting bench, helper, shop front, bank loan, fair stall
      haggle: { streak: 0, pins: 0, notes: {} },
      bench: { day: 0, seats: [], lost: 0 },
      staff: { id: null, since: 0, unpaid: 0, helped: 0, earned: 0, idle: false },
      front: { sign: 0, seat: 0, fan: 0, fitting: 0, window: 0, stall: 0 },
      loan: { left: 0, monthly: 0, months: 0 },
      rack: [], fair: { lastMonth: -1, notes: [] },
      tut: { on: true, idx: 0 } // a brand-new shop is walked through its first order
    };
  };

  // prestige needed for rank 1..10 (a season is ~30–35 orders, not 9)
  G.RANK_AT = [0, 3, 7, 12, 18, 25, 33, 42, 52, 63];
  G.rank = () => { let r = 1; while (r < 10 && G.state.prestige >= G.RANK_AT[r]) r++; return r; };
  G.rankProgress = () => { const r = G.rank(); if (r >= 10) return 1; return (G.state.prestige - G.RANK_AT[r - 1]) / (G.RANK_AT[r] - G.RANK_AT[r - 1]); };

  // v2 saves: keep every player's current rank on the new curve, turn old friendship into bond points
  G.migrate3 = function (s) {
    const p = s.prestige || 0, old = Math.min(10, 1 + Math.floor(p));
    s.prestige = old >= 10 ? G.RANK_AT[9] : G.RANK_AT[old - 1] + (p - Math.floor(p)) * (G.RANK_AT[old] - G.RANK_AT[old - 1]);
    s.bond = s.bond || {};
    for (const id in s.friends || {}) s.bond[id] = { pts: Math.round(s.friends[id] * 10), lvl: 0, arc: 0, gifted: false, met: true };
    if ((s.served || 0) >= 3) {
      // a veteran shop skips the opening and starts at the chapter its rank allows
      s.story = { ch: Math.max(1, Math.min(5, [1, 2, 3, 4, 5, 7].filter((r) => r <= old).length - 1)), phase: 'intro', counters: { success: s.served }, flags: { paper: true, named: true }, queue: [], sinceArc: 0, starBoost: 0 };
      s.mailUnlocked = true;
    }
    (s.collection || []).forEach((it) => { if (it.id === undefined) it.id = s.snapSeq = (s.snapSeq || 0) + 1; });
    delete s.friends;
    s.v = 3;
  };

  // two save slots: the main shop, and this week's challenge run
  G.hasSave = false;
  G.saveLock = false; // set while playing the daily order in its sandbox
  G.slot = 'main';
  const slotKey = (slot) => (slot === 'challenge' ? 'aodai_challenge_v1' : KEY);
  G.readSlot = function (slot) { try { const raw = localStorage.getItem(slotKey(slot)); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } };
  G.load = function (slot) {
    G.slot = slot || 'main';
    let s = G.readSlot(G.slot);
    G.hasSave = !!s;
    if (s && (s.v || 2) < 3) G.migrate3(s);
    // one ruleset for everyone: older relaxed ("cozy") shops and per-player gameplay toggles are retired
    if (s && s.mode !== 'challenge') s.mode = 'business';
    if (s) { delete s.sewAssist; if (s.settings) delete s.settings.parody; }
    if (s && !s.tut) s.tut = { on: (s.served || 0) === 0, idx: 0 }; // older shops that already sewed skip the tutorial
    const base = G.newState();
    G.state = Object.assign(base, s || {});
    for (const k of ['story', 'press', 'events', 'daily', 'settings', 'econ', 'haggle', 'bench', 'staff', 'front', 'loan', 'fair']) G.state[k] = Object.assign(G.newState()[k], G.state[k] || {});
    const com = G.state.commission; // v3 → v4: an order already at the counter keeps its price
    if (com && com.baseBudget === undefined) { com.baseBudget = com.budget; com.qualityBase = com.quality; com.quote = 1; }
    if (!s || (s.v || 3) < 4) G.state.bench.day = G.state.day;
    G.state.v = 4;
    // dresses the window sold while you were away (already paid) used to wait on the rack for the fair,
    // which paid them again; outside a fair in progress, anything sold has been paid
    const fp = G.state.econ && G.state.econ.fairPending;
    if (fp === null || fp === undefined) G.state.rack = (G.state.rack || []).filter((it) => !it.sold);
    if (G.studio) G.studio.registerAll();
    if (G.skins) G.skins.load(); // the player's own designed bolts, before the roll is checked
    for (const id in G.state.roll) if (!C.FABRICS[id]) delete G.state.roll[id];
    if (G.state.bond && G.bond) for (const id in G.state.bond) G.bond.relevel(id);
  };
  G.save = function () { if (G.saveLock) return; try { localStorage.setItem(slotKey(G.slot), JSON.stringify(G.state)); if (G.slot === 'main') G.hasSave = true; } catch (e) {} };
  G.reset = function () { G.slot = 'main'; G.state = G.newState(); G.save(); };
  // this week's challenge: everyone gets the same seed (same clients, prices and market), 30 days, no story
  G.startChallenge = function () {
    const week = G.econ.weekKey(), old = G.readSlot('challenge');
    if (old && old.seed === 'week-' + week && !(old.econ && (old.econ.bankrupt || old.econ.finished))) { G.load('challenge'); return; }
    G.slot = 'challenge';
    const s = G.newState();
    Object.assign(s, { mode: 'challenge', seed: 'week-' + week, endDay: 30, mailUnlocked: true, shopName: (G.readSlot('main') || {}).shopName || s.shopName });
    s.story.phase = 'done'; s.story.ch = 9; s.story.flags.paper = true;
    G.state = s; G.save();
  };

  G.tool = (k) => D.tools[k].levels[(G.state.tools || {})[k] || 0];
  G.addCoins = (n) => { G.state.coins += n; };
  G.spend = function (n) {
    if (G.state.coins < n) { G.toast('Không đủ xu!', G.C.red); G.sfx.bad(); return false; }
    G.state.coins -= n; G.sfx.coin(); return true;
  };
  G.fabricWidth = (id) => D.materials[C.FABRICS[id].mat].width;

  // ---------- style tags ----------
  // design options + fabrics (weighted by slot) + decorations (diminishing returns)
  G.computeTags = function (design, fabs, decor, partSel) {
    const t = {}; C.TAG_KEYS.forEach((k) => (t[k] = 0));
    const add = (tags, k) => { for (const key in tags) t[key] += tags[key] * (k || 1); };
    for (const p of C.PART_ORDER) {
      const opt = C.PARTS[p].opts[partSel[p]];
      if (opt) add(opt.tags);
    }
    for (const slot in C.SLOTS) {
      const f = C.FABRICS[fabs[slot]];
      if (f) add(f.tags, C.SLOTS[slot].w * 14);
    }
    if (decor) {
      const contrib = {}; C.TAG_KEYS.forEach((k) => (contrib[k] = []));
      const push = (tags) => { for (const k in tags) contrib[k].push(tags[k]); };
      for (const g of C.DECOR_ORDER) {
        const grp = C.DECOR[g];
        if (grp.kind === 'one') { const v = decor[grp.field]; if (v && grp.items[v]) push(grp.items[v].tags); }
      }
      for (const it of decor.items || []) {
        const grp = C.DECOR[it.group]; if (grp && grp.items[it.id]) push(grp.items[it.id].tags);
      }
      for (const k in contrib) contrib[k].sort((a, b) => b - a).forEach((v, i) => (t[k] += v * Math.pow(0.85, i)));
    }
    for (const k in t) t[k] = Math.round(Math.min(100, t[k]));
    return t;
  };
  // share of each material / colour across the outfit (by slot weight)
  G.fabricShare = function (fabs) {
    const mats = {}, cols = {};
    for (const slot in C.SLOTS) {
      const f = C.FABRICS[fabs[slot]]; if (!f) continue;
      const w = C.SLOTS[slot].w;
      mats[f.mat] = (mats[f.mat] || 0) + w;
      for (const c of f.colors) cols[c] = (cols[c] || 0) + w / f.colors.length;
    }
    return { mats, cols };
  };

  // ---------- Thẩm mỹ: the tailor's eye, 0–3 flowers ----------
  // Never decides success: it only adds a tip and friendship. Two parts:
  //  colour (0–2): the cloths, trim and cape read as one palette. Whites, blacks, beiges and gold count as
  //   neutrals that go with anything; the strongest colour leads and every other colour is judged by its hue
  //   distance to it (close = analogous, opposite in a small dose = an accent, in between = a clash).
  //   One colour alone is safe (1); two or more on the áo itself (trousers aside) that hold together is a real
  //   "phối" (2).
  //  placement (0–1): placed motifs all on the dress, not piled on each other, not strewn about: a mirrored
  //   pair, a few on the spots a tailor would choose, or one or two focal pieces.
  G.flair = function (job) {
    job = job || G.job;
    const D = G.DATA, d = job.decor || {}, ST = D.style, out = { pts: 0, color: { pts: 0, note: '' }, place: { pts: 0, note: '' } };
    const hsl = (hex) => {
      const n = parseInt(hex.slice(1), 16), r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), ch = mx - mn;
      let h = 0; if (ch) h = mx === r ? ((g - b) / ch) % 6 : mx === g ? (b - r) / ch + 2 : (r - g) / ch + 4;
      return { h: (h * 60 + 360) % 360, ch, l: (mx + mn) / 2 };
    };
    // what the eye sees, weighted by how much of the outfit each takes
    const ent = [];
    for (const slot in C.SLOTS) { const f = C.FABRICS[job.fabs[slot]]; if (f && D.colors[f.color]) ent.push({ key: f.color, hex: D.colors[f.color].hex, w: C.SLOTS[slot].w, slot }); }
    if (d.trim && ST.trim.opts[d.trim] && ST.trim.opts[d.trim].hex) ent.push({ key: 'trim_' + d.trim, hex: ST.trim.opts[d.trim].hex, w: 0.08, metal: d.trim === 'vang' });
    if (d.cape && ST.cape.opts[d.cape] && ST.cape.opts[d.cape].hex) ent.push({ key: 'cape_' + d.cape, hex: ST.cape.opts[d.cape].hex, w: 0.12, metal: d.cape === 'vang' });
    const neutral = (e) => e.metal || ['trang', 'den', 'be', 'champagne', 'mutat'].includes(e.key) || hsl(e.hex).ch < 0.16;
    // (the trousers alone don't make a palette: a red áo over white trousers is the plain default)
    const chroma = ent.filter((e) => !neutral(e)), keys = new Set(ent.filter((e) => e.slot !== 'quan').map((e) => e.key.replace(/^(trim|cape)_/, '')));
    let harm = 1;
    if (chroma.length) {
      // the leading colour: the most cloth
      const by = {}; for (const e of chroma) by[e.key] = (by[e.key] || 0) + e.w;
      const lead = Object.keys(by).sort((a, b) => by[b] - by[a])[0], H0 = hsl(chroma.find((e) => e.key === lead).hex).h;
      const tot = chroma.reduce((a, e) => a + e.w, 0); let sum = 0, wsum = 0;
      for (const e of chroma) {
        if (e.key === lead) continue;
        let dh = Math.abs(hsl(e.hex).h - H0); if (dh > 180) dh = 360 - dh;
        const dose = e.w / tot;
        const v = dh <= 35 ? 1 : dh >= 150 ? (dose <= 0.35 ? 0.95 : 0.6) : dh >= 100 ? 0.7 : 0.4;
        sum += v * e.w; wsum += e.w;
      }
      if (wsum) harm = sum / wsum;
    }
    const many = keys.size >= 2;
    out.color.pts = harm < 0.6 ? 0 : many && harm >= 0.8 ? 2 : 1;
    out.color.note = harm < 0.6 ? 'màu hơi lệch tông' : !many ? 'một màu, an toàn' : harm >= 0.8 ? 'phối màu hài hoà' : 'phối màu tạm ổn';
    // placement
    const items = d.items || [];
    if (items.length) {
      const a = job.asm || G.geo.build(G.jobDesign(job), G.jobScale(job), false), s = a.s, inP = G.geo.pointInPoly;
      const onDress = (q) => inP(q, a.body) || (a.sleeveR && inP(q, a.sleeveR)) || (a.sleeveL && inP(q, a.sleeveL));
      let score = 1, off = 0, piled = 0;
      for (const it of items) if (!onDress(it)) { off++; score -= 0.4; }
      for (let i = 0; i < items.length; i++) for (let k = i + 1; k < items.length; k++) {
        const p = items[i], q = items[k];
        if (Math.hypot(p.x - q.x, p.y - q.y) < (p.size + q.size) * 0.35) { piled++; score -= 0.4; }
      }
      if (items.length > 6) score -= 0.1 * (items.length - 6);
      const mirrored = items.every((it) => Math.abs(it.x) < 2 * s || items.some((o) => o !== it && o.group === it.group && o.id === it.id && Math.hypot(o.x + it.x, o.y - it.y) < 3 * s));
      const spots = G.scenes.decorate && G.job === job && G.scenes.decorate.snaps ? G.scenes.decorate.snaps() : [];
      const onSpot = items.filter((it) => spots.some((q) => Math.hypot(q.x - it.x, q.y - it.y) < 1.5 * s)).length;
      const intent = mirrored || items.length <= 2 || onSpot / items.length >= 0.6;
      out.place.pts = score >= 0.75 && intent ? 1 : 0;
      out.place.note = off ? 'hoa văn lọt ra ngoài áo' : piled ? 'hoa văn chồng lên nhau' : !intent || score < 0.75 ? 'hoa văn hơi rối' : mirrored && items.length > 1 ? 'hoa văn cân đối' : 'điểm nhấn gọn gàng';
    }
    out.pts = out.color.pts + out.place.pts;
    return out;
  };

  // best value a player of this rank could reach for one style tag (keeps commissions solvable)
  // part options / decorations this rank has unlocked that suit the client (men's or women's)
  // the options of one part a client of this rank/sex can be given, for the garment being priced (G._garment,
  // set while an order is made, so a bà ba brief only asks for what a bà ba can reach)
  G.partOpts = (p, rank, male, garment) => Object.entries(C.PARTS[p].opts)
    .filter(([k, o]) => C.optRank(o, garment || G._garment) <= rank && C.partFits(o, male) && C.garmentAllows(p, k, o, garment || G._garment)).map(([, o]) => o);
  G.maxTag = function (tag, rank, noDecor, male) {
    let v = 0;
    for (const p of C.PART_ORDER) v += Math.max(0, ...G.partOpts(p, rank, male).map((o) => o.tags[tag] || 0));
    const bestFab = Math.max(0, ...Object.values(C.FABRICS).filter((f) => f.rank <= rank).map((f) => f.tags[tag] || 0));
    v += bestFab * 14;
    if (noDecor) return Math.min(100, Math.round(v));
    const dec = [];
    for (const g of C.DECOR_ORDER) {
      const items = Object.values(C.DECOR[g].items).filter((it) => (it.rank || 1) <= rank && C.decorFits(it, male)).map((it) => it.tags[tag] || 0).sort((a, b) => b - a);
      if (C.DECOR[g].kind === 'one') dec.push(items[0] || 0); else dec.push(...items.slice(0, 2));
    }
    dec.sort((a, b) => b - a).forEach((x, i) => (v += x * Math.pow(0.85, i)));
    return Math.min(100, Math.round(v));
  };
  // lowest value of capTag reachable while meeting the given minimums (decorations may top up a minimum by half their best)
  G.minCapped = function (capTag, mins, rank, male) {
    const opts = C.PART_ORDER.map((p) => G.partOpts(p, rank, male).map((o) => o.tags));
    const seen = {}, fabs = [];
    for (const f of Object.values(C.FABRICS)) {
      if (f.rank > rank) continue;
      const key = C.TAG_KEYS.map((k) => f.tags[k] || 0).join(',');
      if (!seen[key]) { seen[key] = 1; fabs.push(f.tags); }
    }
    const decHalf = {};
    for (const m of mins) decHalf[m.tag] = (G.maxTag(m.tag, rank, false, male) - G.maxTag(m.tag, rank, true, male)) * 0.5;
    let best = Infinity;
    const walk = (i, sum) => {
      if (i === opts.length) {
        for (const ft of fabs) {
          const capV = sum[capTag] + (ft[capTag] || 0) * 14;
          if (capV >= best) continue;
          if (mins.every((m) => sum[m.tag] + (ft[m.tag] || 0) * 14 + decHalf[m.tag] >= m.val)) best = capV;
        }
        return;
      }
      for (const t of opts[i]) {
        const s2 = Object.assign({}, sum);
        for (const k in t) s2[k] += t[k];
        walk(i + 1, s2);
      }
    };
    const z = {}; C.TAG_KEYS.forEach((k) => (z[k] = 0));
    walk(0, z);
    return Math.round(best);
  };

  // ---------- "gợi cảm" (how revealing / alluring a dress reads), 0–100 ----------
  // open necklines, bare arms, a short tà, a high slit, a nipped waist and sheer fabric all add up
  const GC = {
    neck: { yem: 30, trevai: 28, cup: 26, lechvai: 24, tim: 18, thuyen: 12, vuong: 10, tron: 6 },
    sleeve: { khong: 20, damkhong: 18, canhtien: 12, ngan: 10, voan: 8, bong: 4 },
    length: { ngan: 22, goi: 10, namngan: 4 },
    hem: { xeo: 4, nhon: 3 },
    fit: { om: 6, namom: 3, nguthan: -6 },
    bottom: { chanvay: 4, tuyn: 2 }
  };
  G.goiCam = function (design, fabs) {
    const d = design, sh = d.shape || {};
    let v = 0;
    for (const k in GC) v += GC[k][d[k]] || 0;
    const xe = typeof sh.xe === 'number' ? sh.xe : d.fit === 'nguthan' ? 52 : 45; // the slit opens nearer the waist = higher
    if (!d.garment || d.garment === 'cuoi') v += G.clamp((52 - xe) * 1.2, 0, 14); // only the áo dài's long slits show the waist
    if (typeof sh.eo === 'number' && sh.eo < 0) v += -sh.eo * 3;
    if (fabs) { const m = G.fabricShare(fabs).mats; v += ((m.voan || 0) + (m.ren || 0)) * 20; } // sheer cloth
    return Math.round(G.clamp(v, 0, 100));
  };
  // the most a player of this rank could reach (keeps a "gợi cảm" brief solvable)
  G.maxGoiCam = function (rank, male) {
    const best = (part, key) => Math.max(0, ...G.partOpts(part, rank, male).map((o) => {
      const val = o.set ? (GC.length[o.set.length] || 0) + (GC.hem[o.set.hem] || 0) : GC[key][Object.keys(C.PARTS[part].opts).find((k) => C.PARTS[part].opts[k] === o)] || 0;
      return val;
    }));
    return Math.min(100, best('co', 'neck') + best('tay', 'sleeve') + best('ta') + best('dang', 'fit') + best('quan', 'bottom') + 14 + 3 + 20);
  };

  // ---------- special briefs (Dressmaker's odd jobs): a funeral, an alluring look, a poor-folk costume ----------
  G.THEMES = {
    tang: {
      title: 'Đồ đi đám tang', sex: 'mf', ribbon: ['#4a4a4a', 'Tang lễ'],
      lines: [
        'Nhà có tang… cô may giúp bộ áo dài trắng thật giản dị để tiễn bà.',
        'Mai tôi đi viếng thầy cũ. Áo phải kín đáo, màu tối, đừng thêu thùa gì nha.',
        'Ông nội vừa mất. Con muốn mặc áo dài đen tiễn ông, đơn giản thôi cô ạ.'
      ],
      reqs: [['cols', ['trang', 'den', 'be'], 80, 'trắng, đen hoặc be'], ['plain'], ['gc', 'max', 18], ['max', 'rucro', 12]],
      backdrop: 'tang',
      win: ['Giản dị mà trang nghiêm… bà chắc cũng vui lòng. Cảm ơn cô nhiều.', 'Vừa vặn, kín đáo. Mặc vào con thấy lòng nhẹ hơn một chút.'],
      lose: { cols: 'Màu này đi viếng thì không phải phép đâu cô…', plain: 'Thêu thùa, đính kết thế này đi đám tang người ta cười cho…', gc: 'Hở hang quá, đi viếng sao được cô ơi!' }
    },
    goicam: {
      title: 'Áo dài gợi cảm', sex: 'f', ribbon: ['#c2185b', 'Gợi cảm'],
      lines: [
        'Tối nay em đi tiệc gặp người yêu cũ… áo phải thật quyến rũ, cho ảnh tiếc đứt ruột!',
        'Em chụp bộ ảnh lịch táo bạo: xẻ cao, hở vai, eo thon — càng “cháy” càng tốt nha chị.',
        'Cuộc thi “Hoa khôi hẻm” năm nay em quyết thắng. May sao cho cả hẻm phải ngoái nhìn!'
      ],
      reqs: [['gc', 'min', 'auto'], ['max', 'truyenthong', 35]],
      backdrop: 'tiec',
      win: ['Trời ơi, nhìn em nóng bỏng chưa nè! Tối nay ảnh phải hối hận cho coi.', 'Cháy quá chị ơi! Cả hẻm sắp ngoái cổ hết rồi!'],
      lose: { gc: 'Kín cổng cao tường thế này thì ai thèm nhìn em hả chị…', max: 'Đẹp mà… “bà cụ” quá chị ơi, em cần hiện đại, táo bạo cơ!' }
    },
    kho: {
      title: 'Đồ đóng vai nghèo', sex: 'mf', ribbon: ['#8a6d4b', 'Cũ kỹ'], quality: 0,
      lines: [
        'Đoàn kịch Tết cần bộ áo dài cũ sờn cho vai cô Tấm hồi còn khổ. Càng xơ xác càng tốt!',
        'Tôi đóng phim về thời bao cấp. Áo phải trông như mặc mười năm: vá vài chỗ, đường may xiêu vẹo chút.',
        'Gánh hát cần áo cho vai ăn xin. Đừng may đẹp quá, khán giả không tin đâu!'
      ],
      reqs: [['cheap', 16], ['cols', ['be', 'camdat', 'reu', 'mutat', 'den'], 60, 'cũ bạc (be, nâu, rêu, đen…)'], ['decor', 'va'], ['qmax', 65], ['max', 'sangtrong', 20]],
      backdrop: 'san',
      win: ['Hoàn hảo! Nhìn là thấy khổ, khán giả khóc chắc luôn!', 'Xơ xác đúng kiểu! Đạo diễn mà thấy chắc thưởng thêm cho tiệm.'],
      lose: { qmax: 'Đẹp quá trời! Đóng vai nghèo mà như cô dâu, ai tin nổi chị ơi…', cheap: 'Vải sang thế này, nhìn cái biết ngay không phải người nghèo…', decor: 'Thiếu mấy miếng vá rồi, áo mới tinh thế này sao đóng vai khổ?', cols: 'Màu tươi quá, phải bạc màu, cũ cũ mới đúng vai…' }
    }
  };
  G.themeRibbon = (kind) => (G.THEMES[kind] ? G.THEMES[kind].ribbon : null);
  // the coloured label on an order's card: odd job, occasion, or a plain áo bà ba
  G.comRibbon = (com) => G.themeRibbon(com.kind) || (com.occasion && G.OCCASIONS && G.OCCASIONS[com.occasion] ? G.OCCASIONS[com.occasion].ribbon : null)
    || (com.garment === 'baba' && com.kind === 'normal' ? ['#6f5a3a', 'Áo bà ba'] : null);

  // ---------- commissions ----------
  // random style requirements from what a client likes, always solvable at this rank
  // the best a player of this rank could do for a brief's style wishes with one cloth (and half the help
  // decorations could give):
  // >= 1 means every minimum can be met together while staying under every maximum. Tries the cloths that
  // obey the brief's cloth rules (the ten strongest for the wanted styles), each with a few rounds of picking
  // the best option part by part.
  G.bestFor = function (reqs, rank, male, garment) {
    const mins = reqs.filter((r) => r.type === 'min'), maxes = reqs.filter((r) => r.type === 'max');
    if (!mins.length) return 9;
    const opts = {};
    for (const p of C.PART_ORDER) opts[p] = Object.keys(C.PARTS[p].opts).filter((k) => { const o = C.PARTS[p].opts[k]; return C.optRank(o, garment) <= rank && C.partFits(o, male) && C.garmentAllows(p, k, o, garment); });
    const ok = (id) => {
      const f = C.FABRICS[id];
      for (const r of reqs) {
        if (r.type === 'mat' && f.mat !== r.mat) return false;
        if (r.type === 'avoid' && f.color === r.color) return false;
        if (r.type === 'cols' && !r.colors.includes(f.color)) return false;
        if (r.type === 'cheap' && G.econ && G.econ.price(id) > r.val) return false;
      }
      return f.rank <= rank;
    };
    const fabs = Object.keys(C.FABRICS).filter(ok).sort((a, b) => mins.reduce((s, m) => s + (C.FABRICS[b].tags[m.tag] || 0) - (C.FABRICS[a].tags[m.tag] || 0), 0)).slice(0, 10);
    // decorations may top up a minimum by half of what they could add at most
    const dec = {}; for (const m of mins) dec[m.tag] = (G.maxTag(m.tag, rank, false, male) - G.maxTag(m.tag, rank, true, male)) * 0.5;
    const com = { male, garment }, score = (part, f) => {
      const t = G.computeTags(G.jobDesign({ com, part, decor: { items: [] } }), { than: f, tay: f, co: f, quan: f }, { items: [] }, part);
      let v = Math.min(...mins.map((m) => (t[m.tag] + dec[m.tag]) / m.val));
      for (const m of maxes) if (t[m.tag] > m.val) v -= (t[m.tag] - m.val) / Math.max(1, m.val);
      return v;
    };
    let best = -9;
    for (const f of fabs) {
      const part = {}; for (const p of C.PART_ORDER) part[p] = opts[p][0];
      if (C.PART_ORDER.some((p) => !part[p])) continue;
      let cur = score(part, f);
      for (let pass = 0; pass < 3; pass++) for (const p of C.PART_ORDER) for (const k of opts[p]) {
        const keep = part[p]; part[p] = k; const v = score(part, f);
        if (v > cur) cur = v; else part[p] = keep;
      }
      best = Math.max(best, cur);
    }
    return best;
  };
  // lower the style minimums of a brief until a player could meet them (decorations are a bonus on top)
  G.keepSolvable = function (reqs, rank, male, garment) {
    for (let i = 0; i < 4; i++) {
      const b = G.bestFor(reqs, rank, male, garment);
      if (b >= 1) return;
      const k = Math.max(0.5, b * 0.97);
      for (const r of reqs) if (r.type === 'min') r.val = Math.max(10, Math.floor(r.val * k));
    }
  };
  // a material can be asked for only once some cloth of it is on sale at this rank (gấm opens at rank 2 as a
  // material, but its bolts only from rank 3)
  G.matOnSale = (mat, rank) => Object.values(C.FABRICS).some((f) => f.mat === mat && f.rank <= rank);
  // how much of a style a brief asks for: a share of the most this garment can reach at this rank without
  // decorations (65–77% at rank 1, up to ~90% later), so the default cut in any cloth is not enough by itself
  const wishVal = (tag, rank, male, rng) => Math.round(G.maxTag(tag, rank, true, male) * Math.min(0.9, 0.62 + 0.03 * rank + rng() * 0.12));
  function autoReqs(cl, rank, rng) {
    const male = !!cl.male, reqs = [], pick = (a) => G.rpick(rng, a);
    const want = rank >= 3 && rng() < 0.5 ? 2 : 1;
    const likes = cl.likes.filter((tag) => G.maxTag(tag, rank, false, male) * 0.6 >= 15).sort(() => rng() - 0.5).slice(0, want);
    for (const tag of likes) reqs.push({ type: 'min', tag, val: wishVal(tag, rank, male, rng) });
    if (!reqs.length) { const tag = C.TAG_KEYS.slice().sort((a, b) => G.maxTag(b, rank, false, male) - G.maxTag(a, rank, false, male))[0]; reqs.push({ type: 'min', tag, val: Math.floor(G.maxTag(tag, rank, false, male) * 0.5) }); }
    if (rng() < 0.35) {
      // a cap on a tag they dislike, only if it can be kept that low while meeting the minimums
      const other = C.TAG_KEYS.filter((k) => !cl.likes.includes(k) && !reqs.some((r) => r.tag === k));
      const tag = pick(other), floor = G.minCapped(tag, reqs, rank, male);
      const val = Math.max(30 + Math.round(rng() * 10), floor + 8);
      if (val <= 50) reqs.push({ type: 'max', tag, val });
    }
    const unlockedMats = cl.mats.filter((m) => G.matOnSale(m, rank));
    if (unlockedMats.length && rng() < 0.6) reqs.push({ type: 'mat', mat: pick(unlockedMats), val: 50 });
    if (rng() < 0.35) reqs.push({ type: 'avoid', color: pick(C.AVOID_COLORS) });
    if (rank >= 2 && rng() < 0.4) reqs.push({ type: 'decor', group: pick(['theu', 'dau', 'cuc']) });
    return reqs;
  }
  // hand-written requirements (['min','thanhlich',30], …) clamped so they stay solvable for this client and rank
  function resolveReqs(list, cl, rank, rng) {
    const male = !!cl.male, out = [];
    const decorOk = (g) => C.DECOR[g] && Object.values(C.DECOR[g].items).some((it) => (it.rank || 1) <= rank && C.decorFits(it, male));
    for (const r of list.filter((x) => x[0] === 'min')) {
      let tag = r[1];
      if (tag === 'auto' || tag === '@like0') tag = cl.likes.slice().sort((a, b) => G.maxTag(b, rank, false, male) - G.maxTag(a, rank, false, male))[0];
      // hand-written numbers (story orders) stay as written, within reach; 'auto' asks for a real share of the best
      const val = r[2] === 'auto' ? wishVal(tag, rank, male, rng) : Math.min(r[2], Math.floor(G.maxTag(tag, rank, false, male) * 0.65));
      if (val >= 10 && !out.some((o) => o.tag === tag)) out.push({ type: 'min', tag, val });
    }
    for (const r of list) {
      if (r[0] === 'max') {
        const floor = G.minCapped(r[1], out.filter((o) => o.type === 'min'), rank, male);
        const val = Math.max(r[2], floor + 8);
        if (val <= 50) out.push({ type: 'max', tag: r[1], val });
      } else if (r[0] === 'mat') {
        let mat = r[1] === '@mat0' ? cl.mats[0] : r[1];
        if (!G.matOnSale(mat, rank)) mat = cl.mats.find((m) => G.matOnSale(m, rank));
        if (mat) out.push({ type: 'mat', mat, val: r[2] || 50 });
      } else if (r[0] === 'avoid') out.push({ type: 'avoid', color: r[1] });
      else if (r[0] === 'decor') out.push({ type: 'decor', group: decorOk(r[1]) ? r[1] : 'theu' });
      // special briefs: colour family, no decoration, how alluring, cheap cloth only, deliberately rough sewing
      else if (r[0] === 'cols') out.push({ type: 'cols', colors: r[1], val: r[2], label: r[3] || null });
      else if (r[0] === 'plain') out.push({ type: 'plain' });
      else if (r[0] === 'gc') {
        const top = G.maxGoiCam(rank, male);
        const val = r[2] === 'auto' ? Math.min(Math.round(top * 0.6), 24 + rank * 4 + Math.round(rng() * 6)) : r[2];
        out.push({ type: 'gc', op: r[1], val });
      } else if (r[0] === 'cheap') out.push({ type: 'cheap', val: r[1] });
      else if (r[0] === 'qmax') out.push({ type: 'qmax', val: r[1] });
    }
    return out;
  }

  // spec: { client, kind, title, line, reqs, budget, budgetMul, bonus, quality, rank, rng, flags, refId }
  G.makeCommission = function (spec) {
    const s = G.state, cl = G.client(spec.client), rng = spec.rng || Math.random, rank = spec.rank || G.rank();
    const kind = spec.kind || 'normal', flags = spec.flags || {}, garment = C.GARMENTS[spec.garment] ? spec.garment : 'aodai';
    const was = G._garment; G._garment = garment;
    let reqs;
    try {
      reqs = spec.reqs ? resolveReqs(spec.reqs, cl, rank, rng) : autoReqs(cl, rank, rng);
      G.keepSolvable(reqs, rank, !!cl.male, garment);
    } finally { G._garment = was; }
    const b = G.bond ? G.bond.get(cl.id) : { lvl: 0 };
    let bonus = 0;
    if (kind !== 'daily') {
      const fm = G.front ? G.front.mods() : { budget: 0, newBudget: 0 }; // a nicer shop front draws better-paying clients
      bonus += Math.min(0.2, 0.04 * (b.lvl || 0)) + (spec.bonus || 0) + fm.budget + ((b.lvl || 0) === 0 ? fm.newBudget : 0);
      if (s.press && s.press.boost > 0) { bonus += 0.1; s.press.boost--; }
      if (s.press && s.press.curious > 0) { bonus += 0.05; s.press.curious = 0; }
    }
    bonus = Math.min(0.5, bonus);
    // the month's market (business modes) makes clients pay more or less; a demanding brief pays more
    // (so picking only easy clients from the bench means earning less)
    const diffMul = spec.budget ? 1 : 0.85 + 0.08 * reqs.length;
    const base = (spec.budget || (180 + rank * 45 + rng() * 80) * (spec.budgetMul || 1) * diffMul) * (G.econ && kind !== 'daily' ? G.econ.budgetMul(cl.id) : 1);
    const quality = spec.quality !== undefined ? spec.quality : Math.min(80, 45 + rank * 3) - ((b.lvl || 0) >= 3 ? 5 : 0) + (flags.rival ? 5 : 0);
    const budget = Math.round((base * (1 + bonus)) / 10) * 10;
    return {
      client: cl.id, male: !!cl.male, broad: !!cl.broad, kind, title: spec.title || null, refId: spec.refId || null, flags, garment,
      occasion: G.OCCASIONS && G.OCCASIONS[spec.occasion] ? spec.occasion : null,
      line: spec.line || G.rpick(rng, cl.lines),
      budget, baseBudget: budget, quote: 1, bonusPct: Math.round(bonus * 100),
      quality, qualityBase: quality, reqs,
      measures: { bust: cl.bust + Math.round(rng() * 4 - 2), waist: cl.waist + Math.round(rng() * 4 - 2), hip: cl.hip + Math.round(rng() * 4 - 2) }
    };
  };

  // an ordinary walk-in: clients whose taste is reachable at this rank, friends come more often
  G.pickClient = function (opts) {
    opts = opts || {};
    const s = G.state, rng = opts.rng || Math.random, rank = opts.rank || G.rank();
    const reach = (c) => c.likes.some((tag) => G.maxTag(tag, rank, false, c.male) * 0.6 >= 15);
    let pool = (opts.pool || G.clientsAllowed()).filter((c) => c.id !== s.lastClient && reach(c));
    if (!pool.length) pool = (opts.pool || G.clientsAllowed()).filter((c) => c.id !== s.lastClient);
    const stars = pool.filter((c) => c.star), regulars = pool.filter((c) => !c.star);
    const starChance = opts.starChance !== undefined ? opts.starChance : 0.35;
    const from = stars.length && (!regulars.length || rng() < starChance) ? stars : regulars;
    const w = from.map((c) => 1 + 0.25 * ((G.bond && G.bond.get(c.id).lvl) || 0));
    let x = rng() * w.reduce((a, v) => a + v, 0);
    for (let i = 0; i < from.length; i++) { x -= w[i]; if (x <= 0) return from[i]; }
    return from[from.length - 1];
  };
  G.BABA_LINES = {
    f: ['Cô đi chợ nổi Cái Răng, may cho cô bộ bà ba mặc cho mát nghen.', 'Em về quê ăn đám giỗ ngoại, cần bộ bà ba cho tươm tất.',
      'Em đóng vở cải lương, vai cô gái miệt vườn, bộ bà ba phải thiệt duyên.', 'Chụp ảnh ở vườn trái cây Cái Bè, chị muốn bộ bà ba thật xinh.',
      'Cô dạy múa cho mấy đứa nhỏ, cần bộ bà ba gọn gàng mà vẫn đẹp.'],
    m: ['Anh đi đờn ca tài tử, may cho anh bộ bà ba nghen em.', 'Tui về quê dự đám cưới thằng cháu, cần bộ bà ba cho đàng hoàng.',
      'Chú làm hướng dẫn viên du lịch sông nước, cần bộ bà ba mặc dẫn khách.']
  };
  G.newCommission = function (opts) {
    opts = opts || {};
    const rng = opts.rng || Math.random;
    // now and then (from rank 2) a walk-in brings an odd job: a funeral, an alluring look, a poor-folk costume
    if (!opts.noTheme && G.rank() >= 2 && rng() < 0.14) {
      const keys = Object.keys(G.THEMES), key = keys[Math.floor(rng() * keys.length)], th = G.THEMES[key];
      const pool = G.clientsAllowed().filter((c) => (th.sex === 'f' ? !c.male : true));
      const cl = G.pickClient(Object.assign({}, opts, { pool }));
      G.state.lastClient = cl.id;
      G.state.commission = G.makeCommission({ client: cl.id, kind: key, title: th.title, line: G.rpick(rng, th.lines), reqs: th.reqs, bonus: 0.1, quality: th.quality, rng });
      G.save();
      return G.state.commission;
    }
    const cl = G.pickClient(opts);
    G.state.lastClient = cl.id;
    let extra = {};
    // most walk-ins come for something: an occasion told in their own words, with wishes to match
    const occ = G.OCCASION_ORDER.filter((k) => (G.OCCASIONS[k].sex !== 'f' || !cl.male) && (G.OCCASIONS[k].minRank || 1) <= G.rank());
    if (!opts.noOccasion && occ.length && rng() < 0.55) {
      const key = occ[Math.floor(rng() * occ.length)], oc = G.OCCASIONS[key];
      extra = { occasion: key, title: oc.title, line: G.rpick(rng, oc.lines), reqs: oc.reqs, garment: oc.garment, bonus: 0.05 };
    } else if (!opts.noBaba && rng() < (cl.likes.includes('truyenthong') ? 0.2 : 0.1)) {
      // now and then a client simply wants an áo bà ba (more often those who love the traditional look)
      extra = { garment: 'baba', title: 'Áo bà ba', line: G.rpick(rng, cl.male ? G.BABA_LINES.m : G.BABA_LINES.f) };
    }
    G.state.commission = G.makeCommission(Object.assign({ client: cl.id }, opts, extra));
    G.save();
    return G.state.commission;
  };
  G.client = (id) => C.CLIENTS.find((c) => c.id === id) || (G.NPCS || []).find((c) => c.id === id) || (G.HELPERS && G.HELPERS[id]) || (G.SHOP_NPCS && G.SHOP_NPCS[id]) || null;
  G.reqText = function (r) {
    if (r.type === 'min') return `${C.TAGS[r.tag].name} từ ${r.val}`;
    if (r.type === 'max') return `${C.TAGS[r.tag].name} tối đa ${r.val}`;
    if (r.type === 'mat') return `Ít nhất ${r.val}% ${C.MATS[r.mat].name.toLowerCase()}`;
    if (r.type === 'avoid') return `Không dùng màu ${D.colors[r.color].name}`;
    if (r.type === 'decor') return r.group === 'va' ? 'Có miếng vá hoặc chỗ sờn' : `Có ${C.DECOR[r.group].name.toLowerCase()}`;
    if (r.type === 'cols') return `Ít nhất ${r.val}% màu ${r.label || r.colors.map((k) => D.colors[k].name.toLowerCase()).join(' / ')}`;
    if (r.type === 'plain') return 'Không thêu, viền, đính hay choàng';
    if (r.type === 'gc') return r.op === 'min' ? `Gợi cảm từ ${r.val}` : `Kín đáo: gợi cảm tối đa ${r.val}`;
    if (r.type === 'cheap') return `Vải rẻ: mọi vải ≤ ${r.val} xu/m`;
    if (r.type === 'qmax') return `Trông xuề xoà: chất lượng tối đa ${r.val}`;
    return '';
  };
  // check one requirement against the current job; returns {ok, value}
  // extra: { design, quality } when known (quality only once the dress is sewn)
  G.reqCheck = function (r, tags, fabs, decor, extra) {
    extra = extra || {};
    if (r.type === 'min') return { ok: tags[r.tag] >= r.val, value: tags[r.tag] };
    if (r.type === 'max') return { ok: tags[r.tag] <= r.val, value: tags[r.tag] };
    const sh = G.fabricShare(fabs);
    if (r.type === 'cols') { const v = Math.round(r.colors.reduce((a, k) => a + (sh.cols[k] || 0), 0) * 100); return { ok: v >= r.val, value: v }; }
    if (r.type === 'plain') {
      const d = decor || {}, ok = !(d.items || []).some((i) => i.group !== 'va') && !d.trim && !d.deco && !d.cape;
      return { ok, value: ok ? 1 : 0 };
    }
    if (r.type === 'gc') {
      const design = extra.design || (G.job ? G.jobDesign(G.job) : null), v = design ? G.goiCam(design, fabs) : 0;
      return { ok: r.op === 'min' ? v >= r.val : v <= r.val, value: v };
    }
    if (r.type === 'cheap') {
      const top = Math.max(0, ...Object.values(fabs || {}).filter(Boolean).map((id) => (C.FABRICS[id] ? C.FABRICS[id].price : 0)));
      return { ok: top <= r.val, value: top };
    }
    if (r.type === 'qmax') return extra.quality === undefined ? { ok: true, pending: true, value: 0 } : { ok: extra.quality <= r.val, value: extra.quality };
    if (r.type === 'mat') { const v = Math.round((sh.mats[r.mat] || 0) * 100); return { ok: v >= r.val, value: v }; }
    if (r.type === 'avoid') return { ok: !(sh.cols[r.color] > 0), value: 0 };
    if (r.type === 'decor') {
      const grp = C.DECOR[r.group];
      const ok = grp.kind === 'place' ? (decor.items || []).some((i) => i.group === r.group) : !!decor[grp.field];
      return { ok, value: ok ? 1 : 0 };
    }
    return { ok: true };
  };

  // ---------- job ----------
  G.job = null;
  G.startJob = function () {
    const com = G.state.commission;
    const garment = C.GARMENTS[com.garment] ? com.garment : 'aodai', GD = C.GARMENTS[garment], gdef = com.male && GD.defM ? GD.defM : GD.def;
    G.job = {
      com, measured: null, fit: 1, garment,
      part: gdef ? Object.assign({}, gdef) : com.male ? { co: 'dung', dang: 'nam', tay: 'dai', ta: 'nam_dai', quan: 'quan' } : { co: 'dung', dang: 'om', tay: 'dai', ta: 'dai_thang', quan: 'quan' },
      fabs: { than: null, tay: null, co: null, quan: null },
      decor: { items: [] },
      cutScore: [], sew: []
    };
  };
  G.jobDesign = function (j) {
    j = j || G.job;
    const d = Object.assign({}, D.defaultDesign);
    d.neck = j.part.co; d.fit = j.part.dang; d.sleeve = j.part.tay; d.bottom = j.part.quan;
    Object.assign(d, C.PARTS.ta.opts[j.part.ta].set);
    d.slit = 'vua';
    if (j.shape && Object.keys(j.shape).length) d.shape = Object.assign({}, j.shape); // dragged on the dress in the sketchbook
    if (j.skin && G.skins && G.skins.list[j.skin.id]) { d.skin = j.skin.id; d.skinMode = j.skin.mode; } // the player's picture of the dress
    if (j.com.male) d.male = true;
    if (j.com.broad) d.broad = true;
    const cl = G.client(j.com.client);
    if (cl && cl.look) d.look = cl.look;
    d.trim = j.decor.trim || 'none'; d.buttons = j.decor.buttons || 'an'; d.head = j.decor.head || 'none';
    d.deco = j.decor.deco || 'none'; d.cape = j.decor.cape || 'none';
    // a garment that comes with its own head wear (the wedding khăn đóng) always wears it
    const GD = C.GARMENTS[d.garment];
    if (GD && GD.head) d.head = GD.head;
    return d;
  };
  // freeze the design: build the garment and its pattern pieces (each tagged with its fabric)
  G.buildJob = function () {
    const j = G.job;
    j.design = G.jobDesign(j);
    j.asm = G.geo.build(j.design, G.jobScale(j), false);
    j.pieces = G.geo.pieces(j.asm).filter((p) => j.fabs[p.slot]);
    j.pieces.forEach((p) => { p.fabric = j.fabs[p.slot]; p.cut = false; });
    j.cutScore = []; j.sew = [];
  };
  G.jobScale = (j) => ((j || G.job).com.measures.bust / 84);
  G.jobFabs = function (j) {
    // fabric objects per slot for the renderer
    const out = {};
    for (const slot in C.SLOTS) {
      const f = C.FABRICS[(j || G.job).fabs[slot]] || C.FABRICS['lua.trang.tron'];
      out[slot] = { mat: f.mat, color: f.color, print: f.print };
    }
    return out;
  };
  // metres needed per fabric: lay the pieces like a cutter would — long side along the roll (on grain),
  // stacked across the width in columns, biggest first — and add a little to spare
  G.fabricNeed = function (j) {
    j = j || G.job;
    const asm = G.geo.build(G.jobDesign(j), G.jobScale(j), false);
    const byFab = {};
    for (const dd of asm.defs) {
      const id = j.fabs[dd.slot]; if (!id) continue;
      const b = G.geo.bounds(dd.poly);
      (byFab[id] = byFab[id] || []).push({ L: Math.max(b.w, b.h) + 1, S: Math.min(b.w, b.h) + 1 });
    }
    const need = {};
    for (const id in byFab) {
      const W = G.fabricWidth(id) - 2, cols = [];
      for (const p of byFab[id].sort((a, b) => b.L - a.L)) {
        // first column with room across the width that is long enough; else a new column
        const col = cols.find((cl) => cl.used + p.S <= W && p.L <= cl.len);
        if (col) col.used += p.S; else cols.push({ len: p.L, used: Math.min(p.S, W) });
      }
      need[id] = Math.ceil((cols.reduce((a, cl) => a + cl.len + 1, 0) + 10) / 10) * 10;
    }
    return need;
  };

  // final score: quality = grain 30% + fit 20% + stitching 50% (fabric/decor only drive style tags)
  G.scoreJob = function () {
    const j = G.job, com = j.com;
    const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
    // sewing is judged closely: each seam's accuracy counts squared (99% ≈ 98, 95% ≈ 90, 90% ≈ 81)
    const grain = avg(j.cutScore), sew = avg(j.sew.map((v) => v * v)), fit = j.fit;
    // a pressed dress looks finished: the iron's bonus counts for how much was actually pressed at the board
    const ironed = Math.round((G.tool('iron').bonus || 0) * (j.pressed === undefined ? 1 : j.pressed)) + (G.staff ? G.staff.ironBonus() : 0);
    const quality = Math.min(100, Math.round(100 * (0.3 * grain + 0.2 * fit + 0.5 * sew)) + ironed);
    const tags = G.computeTags(G.jobDesign(), j.fabs, j.decor, j.part);
    const checks = com.reqs.map((r) => Object.assign({ r }, G.reqCheck(r, tags, j.fabs, j.decor, { design: G.jobDesign(), quality })));
    const qualOk = quality >= com.quality;
    const success = qualOk && checks.every((c) => c.ok);
    // the newspaper's trend forecast: a dress strong in the trending style earns +10%
    const tr = G.state.press && G.state.press.trend;
    const trendHit = !!(tr && com.kind !== 'daily' && tr.until >= G.state.day && tags[tr.tag] >= 50);
    const exceeded = checks.filter((c) => c.r.type === 'min' && c.value - c.r.val >= 15).length;
    // business modes are stricter about unhappy clients
    const biz = G.econ && G.econ.on();
    // a failed dress is paid on the client's original offer, whatever price was quoted
    const offer = com.baseBudget || com.budget;
    const pay = success ? com.budget : Math.round(offer * (qualOk ? (biz ? 0.45 : 0.6) : biz ? 0.2 : 0.4));
    const streak = success && G.haggle ? Math.round(com.budget * G.haggle.streakTip()) : 0;
    // the tailor's eye: a tip of 5% of the price per flower, only from a happy client (it never decides success)
    const flair = G.flair(j), flairPay = success ? Math.round(com.budget * 0.05 * flair.pts) : 0;
    return { grain, sew, fit, quality, qualOk, tags, checks, success, exceeded, trendHit, flair, flairPay,
      pay, trendPay: success && trendHit ? Math.round(com.budget * 0.1) : 0, tip: (success && quality >= 90 ? Math.round(com.budget * (G.week && G.week.is('cuoi') ? 0.3 : 0.15)) : 0) + streak };
  };

  G.snapshot = function (design, fabs, extra) {
    return Object.assign({ design: Object.assign({}, design), fabs: JSON.parse(JSON.stringify(fabs)) }, extra || {});
  };
  // full album entry: enough to redraw the dress and to rebuild a share link (#d=…)
  G.snapOf = function (job, r, extra) {
    const cl = G.client(job.com.client), d = job.decor;
    return G.snapshot(G.jobDesign(job), G.jobFabs(job), Object.assign({
      id: (G.state.snapSeq = (G.state.snapSeq || 0) + 1), name: cl ? cl.name : '', client: job.com.client,
      success: r.success, quality: r.quality, scale: G.jobScale(job), decorItems: JSON.parse(JSON.stringify(d.items || [])),
      part: Object.assign({}, job.part), fabIds: Object.assign({}, job.fabs),
      decorOne: { trim: d.trim || null, buttons: d.buttons || null, head: d.head || null, deco: d.deco || null, cape: d.cape || null },
      male: !!job.com.male, broad: !!job.com.broad, kind: job.com.kind || 'normal', title: job.com.title || null,
      ev: job.com.kind === 'event' ? job.com.refId : null, day: G.state.day, shop: G.state.shopName, date: G.dateKeyVN()
    }, extra || {}));
  };
})();

// Share a dress without a server: the whole design fits in the URL hash (#d=…), anyone opening the link sees it
// in the viewer. Also a 4:5 share card image, and "đặt may y chang" (a friend's link becomes an order in your game).
G.share = {
  b64e(str) { return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  b64d(str) { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; return decodeURIComponent(escape(atob(str))); },
  r1: (x) => Math.round(x * 10) / 10,

  // album snapshot → compact payload
  encode(snap, max) {
    const C = G.CAT, p = snap.part, f = snap.fabIds, o = snap.decorOne || {};
    const payload = {
      v: 1, p: C.PART_ORDER.map((k) => p[k]), f: Object.keys(C.SLOTS).map((k) => f[k] || null),
      o: { trim: o.trim || null, buttons: o.buttons || null, head: o.head || null, deco: o.deco || null, cape: o.cape || null },
      i: (snap.decorItems || []).map((it) => [it.group, it.id, this.r1(it.x), this.r1(it.y), this.r1(it.size), Math.round((it.rot || 0) * 100) / 100]),
      m: snap.male ? 1 : 0, b: snap.broad ? 1 : 0, s: Math.round((snap.scale || 1) * 100) / 100,
      c: snap.client || null, q: snap.quality || 0, k: snap.kim || 0, sh: snap.shop || G.state.shopName, d: snap.date || G.dateKeyVN()
    };
    // keep links short: drop the smallest embroideries if needed
    while (JSON.stringify(payload).length > (max || 1500) && payload.i.length) { payload.i.sort((a, b) => b[4] - a[4]); payload.i.pop(); }
    return payload;
  },
  canShare: (snap) => !!(snap && snap.part && snap.fabIds),
  url(payload) { return G.CFG.baseUrl + '#d=' + this.b64e(JSON.stringify(payload)); },

  // hash → validated payload (unknown ids fall back to defaults, numbers clamped, text sanitised)
  decode(hash) {
    let raw;
    try { raw = JSON.parse(this.b64d(String(hash).replace(/^#?d=/, ''))); } catch (e) { return null; }
    return this.fromRaw(raw);
  },
  fromRaw(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const C = G.CAT, cl = (x, a, b, d) => (typeof x === 'number' && isFinite(x) ? Math.min(b, Math.max(a, x)) : d);
    const male = raw.m === 1, def = male ? { co: 'dung', dang: 'nam', tay: 'dai', ta: 'nam_dai', quan: 'quan' } : { co: 'dung', dang: 'om', tay: 'dai', ta: 'dai_thang', quan: 'quan' };
    const part = {};
    C.PART_ORDER.forEach((k, i) => { const v = Array.isArray(raw.p) ? raw.p[i] : null; part[k] = C.PARTS[k].opts[v] && C.partFits(C.PARTS[k].opts[v], male) ? v : def[k]; });
    const fabs = {};
    Object.keys(C.SLOTS).forEach((k, i) => { const v = Array.isArray(raw.f) ? raw.f[i] : null; fabs[k] = C.FABRICS[v] ? v : k === 'quan' ? 'lua.trang.tron' : 'lua.trang.tron'; });
    const o = raw.o || {}, one = {};
    for (const g of C.DECOR_ORDER) {
      const grp = C.DECOR[g]; if (grp.kind !== 'one') continue;
      const v = o[grp.field]; if (v && grp.items[v] && C.decorFits(grp.items[v], male)) one[grp.field] = v;
    }
    const items = (Array.isArray(raw.i) ? raw.i : []).slice(0, 24).filter((it) => Array.isArray(it) && C.DECOR[it[0]] && C.DECOR[it[0]].kind === 'place' && C.DECOR[it[0]].items[it[1]])
      .map((it) => ({ group: it[0], id: it[1], x: cl(it[2], -200, 200, 0), y: cl(it[3], -200, 200, 60), size: cl(it[4], 4, 60, 12), rot: cl(it[5], -7, 7, 0) }));
    const client = typeof raw.c === 'string' && G.client(raw.c) && !G.client(raw.c).npc ? raw.c : null;
    const sh = String(raw.sh || 'Một tiệm may').replace(/[^\p{L}\p{N} '&.-]/gu, '').slice(0, 24) || 'Một tiệm may';
    return { part, fabs, one, items, male, broad: raw.b === 1, scale: cl(raw.s, 0.8, 1.4, 1), client, quality: cl(raw.q, 0, 100, 0) | 0, kim: cl(raw.k, 0, 5, 0) | 0, shop: sh, date: String(raw.d || '').slice(0, 10) };
  },
  // payload → what the renderer needs
  view(pl) {
    const cl = pl.client && G.clientAllowed(G.client(pl.client)) ? pl.client : null;
    const job = { com: { client: cl, male: pl.male, broad: pl.broad }, part: pl.part, fabs: pl.fabs, decor: Object.assign({ items: pl.items }, pl.one) };
    const design = G.jobDesign(job);
    return { design, fabs: G.jobFabs(job), fabIds: pl.fabs, decorItems: pl.items, scale: pl.scale, tags: G.computeTags(design, pl.fabs, job.decor, pl.part), client: cl };
  },

  copy(text) {
    const done = () => G.toast('Đã sao chép!', G.C.green);
    try { navigator.clipboard.writeText(text).then(done, () => { window.prompt('Sao chép:', text); }); } catch (e) { window.prompt('Sao chép:', text); }
  },
  copyLink(snap) { this.copy(this.url(this.encode(snap))); },

  // 1080×1350 share card in the style of the newspaper
  card(snapOrView, meta) {
    const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350;
    const c = cv.getContext('2d'), U = G.UI;
    c.fillStyle = '#f4efe3'; c.fillRect(0, 0, 1080, 1350);
    c.fillStyle = '#2a211c';
    G.text(c, 'BÁO TRÀ ĐÁ', 540, 90, { size: 76, font: G.SERIF, weight: 700, align: 'center', color: '#2a211c' });
    c.fillRect(80, 140, 920, 3); c.fillRect(80, 148, 920, 1.5);
    G.text(c, 'Kim Chỉ Nam · chuyên mục của Madame Sa', 540, 180, { size: 28, font: G.SERIF, align: 'center', color: '#5a4a40' });
    const v = snapOrView;
    const asm = G.geo.build(v.design, v.scale || 1, false), z = Math.min(860 / (asm.botY - asm.topY), 5.6);
    const g = c.createRadialGradient(540, 700, 60, 540, 700, 560); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#efe5d2');
    c.fillStyle = g; c.fillRect(80, 210, 920, 890);
    c.save(); c.beginPath(); c.rect(80, 210, 920, 890); c.clip();
    c.translate(540, 230 - asm.topY * z); c.scale(z, z);
    G.art.garment(c, asm, v.fabs, { mannequin: true, still: true, decorItems: v.decorItems });
    c.restore();
    c.strokeStyle = '#2a211c'; c.lineWidth = 3; c.strokeRect(80, 210, 920, 890);
    G.text(c, meta.shop, 540, 1160, { size: 48, font: G.SERIF, weight: 700, align: 'center', color: '#9e2a3a' });
    const sub = [meta.client, meta.quality ? `chất lượng ${meta.quality}` : null].filter(Boolean).join(' · ');
    if (sub) G.text(c, sub, 540, 1214, { size: 30, align: 'center', color: '#5a4a40' });
    if (meta.kim) U.needles(c, 540 - 5 * 34, 1262, meta.kim, 2);
    G.text(c, 'Chơi miễn phí: ' + G.CFG.baseUrl.replace(/^https?:\/\//, ''), 540, 1318, { size: 22, align: 'center', color: '#8a7366' });
    return cv;
  },
  saveCard(view, meta) {
    const cv = this.card(view, meta);
    cv.toBlob((blob) => {
      if (!blob) return;
      const name = 'aodai-' + (meta.shop || 'tiem').replace(/\s+/g, '-').toLowerCase() + '.png';
      try {
        const file = new File([blob], name, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: meta.shop }).catch(() => {}); return; }
      } catch (e) { /* fall back to a download */ }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  },
  // an album snapshot → view (album items keep part/fabIds since v3)
  snapView(snap) {
    const pl = { part: snap.part, fabs: snap.fabIds, one: snap.decorOne || {}, items: snap.decorItems || [], male: !!snap.male, broad: !!snap.broad, scale: snap.scale || 1, client: snap.client };
    return this.view(pl);
  },

  // ---------- Ghé tiệm: the shop front in a link (#s=…) — name, rank, days open, and its three best dresses ----------
  shopPayload() {
    const s = G.state;
    const best = s.collection.filter((it) => it.success && this.canShare(it)).sort((a, b) => (b.quality || 0) - (a.quality || 0)).slice(0, 3);
    return { v: 1, sh: s.shopName, rk: G.rank(), dy: s.day, n: s.collection.length,
      x: best.map((it) => { const p = this.encode(it, 700); delete p.sh; return p; }) };
  },
  shopUrl() { return G.CFG.baseUrl + '#s=' + this.b64e(JSON.stringify(this.shopPayload())); },
  copyShop() { this.copy(this.shopUrl()); },
  decodeShop(hash) {
    let raw;
    try { raw = JSON.parse(this.b64d(String(hash).replace(/^#?s=/, ''))); } catch (e) { return null; }
    if (!raw || typeof raw !== 'object') return null;
    const cl = (x, a, b) => (typeof x === 'number' && isFinite(x) ? Math.min(b, Math.max(a, Math.round(x))) : a);
    const shop = String(raw.sh || 'Một tiệm may').replace(/[^\p{L}\p{N} '&.-]/gu, '').slice(0, 24) || 'Một tiệm may';
    const dresses = (Array.isArray(raw.x) ? raw.x : []).slice(0, 3).map((d) => this.fromRaw(Object.assign({}, d, { sh: shop }))).filter(Boolean);
    return { shop, rank: cl(raw.rk, 1, 10), days: cl(raw.dy, 1, 9999), made: cl(raw.n, 0, 9999), dresses };
  },

  // "Đặt may y chang": a friend's shared dress becomes an order in this game
  queueCopy(pl) {
    const v = this.view(pl), C = G.CAT;
    const top = C.TAG_KEYS.slice().sort((a, b) => v.tags[b] - v.tags[a]).slice(0, 2);
    const mat = C.FABRICS[pl.fabs.than].mat;
    G.state.story.queue.unshift({ kind: 'copy', shop: pl.shop, reqs: top.map((t) => ['min', t, Math.round(v.tags[t] * 0.8)]).concat([['mat', mat, 50]]) });
    G.save();
  },
  copyCommission(q) {
    const pool = G.CAT.CLIENTS.filter((c) => !c.star && !c.male);
    const cl = G.pickClient({ pool, starChance: 0 });
    return G.makeCommission({ client: cl.id, kind: 'copy', title: 'May y chang', reqs: q.reqs, budgetMul: 1.15,
      line: `Bạn tôi khoe cái áo may ở “${q.shop}” trên mạng. Em may cho tôi một cái na ná được không?`, flags: { copyOf: q.shop } });
  }
};

// Fabric studio: players design their own bolts — from the game's own pieces (material, ground colour,
// a repeat of embroidered motifs / stripes / dots / gingham, print colour, size) or from a picture on their
// own device. A pieces-only design is a small code (shareable as #f=…); a picture stays on the device and
// reaches other players only through the community channel (GitHub Discussions: post, vote, maintainer
// approves, a GitHub Action publishes community/fabrics.json). Saved designs become real bolts in the
// emporium with fixed-formula stats (same rules for every player).
G.studio = (function () {
  const MOTIFS = ['sen', 'mai', 'dao', 'cuc', 'tre', 'buom', 'en', 'may', 'hac', 'trongdong', 'phuong', 'rong'];
  const KINDS = { tron: 'Trơn', motif: 'Hoạ tiết', soc: 'Sọc', cham: 'Chấm bi', ke: 'Kẻ ô', anh: 'Ảnh của bạn' };
  const LAYOUTS = { deu: 'Đều', sole: 'So le', rai: 'Rải' };
  const REPEATS = { deu: 'Lặp thẳng', guong: 'Lặp soi gương' };
  const INKS = { full: 'Giữ màu ảnh', tint: 'Nhuộm theo màu nền' };
  const SIZES = ['Nhỏ', 'Vừa', 'Lớn'];
  const MAX = 12, IMG_MAX = 8, IMG_PX = 384;
  const DEFAULT = { m: 'lua', b: 'trang', k: 'motif', t: 'sen', l: 'sole', z: 1, c: 'full' };
  const IMG_KEY = 'aodai_fabimg_v1', COMM_KEY = 'aodai_community_v1';

  const enc = (d) => btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  function dec(code) {
    try {
      const s = code.replace(/-/g, '+').replace(/_/g, '/');
      const d = JSON.parse(decodeURIComponent(escape(atob(s + '==='.slice((s.length + 3) % 4)))));
      return clean(d);
    } catch (e) { return null; }
  }
  // only known values survive a decode (a shared link can't smuggle anything else in)
  function clean(d) {
    const C = G.CAT, cols = G.DATA.colors, o = Object.assign({}, DEFAULT);
    if (d && C.MATS[d.m]) o.m = d.m;
    if (d && cols[d.b]) o.b = d.b;
    if (d && KINDS[d.k]) o.k = d.k;
    if (d && [0, 1, 2].includes(d.z)) o.z = d.z;
    if (o.k === 'anh') {
      // a picture: which one (on this device), keep its colours or dye it, straight or mirrored repeat
      o.i = d && images[d.i] ? d.i : Object.keys(images)[0];
      if (!o.i) { o.k = 'motif'; return clean(Object.assign({}, d, { k: 'motif' })); }
      o.c = d && INKS[d.c] ? d.c : 'full';
      o.l = d && REPEATS[d.l] ? d.l : 'guong';
      delete o.t;
      return o;
    }
    if (d && MOTIFS.includes(d.t)) o.t = d.t;
    if (d && LAYOUTS[d.l]) o.l = d.l;
    if (d && (d.c === 'full' || cols[d.c])) o.c = d.c;
    if (o.k !== 'motif' && o.c === 'full') o.c = G.art.isLight(o.b) ? 'covit' : 'champagne';
    return o;
  }
  const code = (d) => enc(clean(d));

  // small seeded random so a "scattered" layout looks the same everywhere
  function rnd(seed) { let x = seed >>> 0 || 1; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  // a motif photo tinted to one print colour (cached)
  const tintCache = {};
  function tinted(id, hex) {
    const key = id + hex; if (tintCache[key]) return tintCache[key];
    const img = G.MOTIF_IMG[id]; if (!img) return null;
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d'); c.drawImage(img, 0, 0, 128, 128);
    c.globalCompositeOperation = 'source-atop'; c.fillStyle = hex; c.globalAlpha = 0.85; c.fillRect(0, 0, 128, 128);
    return (tintCache[key] = cv);
  }

  // the repeat, drawn on the texture engine's 256px tile (wrapped so it tiles seamlessly)
  function drawTile(d) {
    return (c) => {
      const S = 256, n = [4, 3, 2][d.z], cell = S / n, ink = d.c === 'full' ? null : G.DATA.colors[d.c].hex, R = rnd(hash(code(d)));
      const each = (fn) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) { c.save(); c.translate(dx, dy); fn(); c.restore(); } };
      if (d.k === 'motif') {
        const img = d.c === 'full' ? G.MOTIF_IMG[d.t] : tinted(d.t, ink), sz = cell * 0.6;
        if (!img) return;
        const spots = [];
        for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) {
          if (d.l === 'rai') spots.push([R() * S, R() * S, (R() - 0.5) * 1.6, 0.75 + R() * 0.4]);
          else spots.push([(q + 0.5 + (d.l === 'sole' && r % 2 ? 0.5 : 0)) * cell, (r + 0.5) * cell, 0, 1]);
        }
        each(() => { for (const [x, y, a, k] of spots) { c.save(); c.translate(x, y); c.rotate(a); c.drawImage(img, -sz * k / 2, -sz * k / 2, sz * k, sz * k); c.restore(); } });
      } else if (d.k === 'soc') {
        c.fillStyle = ink;
        for (let q = 0; q < n; q++) { c.fillRect(q * cell, 0, cell * 0.22, S); c.globalAlpha = 0.6; c.fillRect(q * cell + cell * 0.36, 0, cell * 0.05, S); c.globalAlpha = 1; }
      } else if (d.k === 'cham') {
        c.fillStyle = ink;
        each(() => { for (let r = 0; r < n * 2; r++) for (let q = 0; q < n * 2; q++) { c.beginPath(); c.arc((q + 0.5 + (r % 2) * 0.5) * cell / 2, (r + 0.5) * cell / 2, cell * 0.08, 0, 7); c.fill(); } });
      } else if (d.k === 'ke') {
        c.fillStyle = ink; c.globalAlpha = 0.42;
        for (let q = 0; q < n; q++) { c.fillRect(q * cell, 0, cell * 0.5, S); c.fillRect(0, q * cell, S, cell * 0.5); }
        c.globalAlpha = 1;
      }
    };
  }

  // ---------- pictures from the player's device ----------
  // stored apart from the save (as small JPEG data URLs) so the save itself stays light
  const images = {}; // id → { data, img, ready }
  function readImages() { try { return JSON.parse(localStorage.getItem(IMG_KEY) || '[]'); } catch (e) { return []; } }
  function writeImages() {
    try { localStorage.setItem(IMG_KEY, JSON.stringify(Object.keys(images).map((id) => ({ id, data: images[id].data })))); return true; } catch (e) { return false; }
  }
  // load an image; once it is decoded, every bolt that uses it gets its texture
  function loadImage(rec, src, onReady) {
    const img = new Image();
    rec.img = img; rec.ready = false;
    img.onload = () => { rec.ready = true; if (G.art) G.art.flushGarments(); onReady && onReady(); };
    img.onerror = () => { rec.bad = true; };
    img.src = src;
    return rec;
  }
  function addImage(id, data) {
    images[id] = { data };
    loadImage(images[id], data, () => { for (const fid in G.CAT.FABRICS) { const f = G.CAT.FABRICS[fid]; if (f.design && f.design.i === id) printId(f.design); } });
  }
  // the file picker: crop the middle square, shrink to 384 px, keep it on this device
  function pickImage(done) {
    if (Object.keys(images).length >= IMG_MAX) { G.toast(`Chỉ giữ được ${IMG_MAX} ảnh — xoá bớt ảnh cũ`, G.C.red); return; }
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp';
    inp.onchange = () => {
      const file = inp.files && inp.files[0]; if (!file) return;
      if (!/^image\//.test(file.type) || file.size > 15e6) { G.toast('Chọn một file ảnh (PNG/JPG, dưới 15 MB)', G.C.red); return; }
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const k = Math.min(img.width, img.height), cv = document.createElement('canvas'); cv.width = cv.height = IMG_PX;
        cv.getContext('2d').drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, IMG_PX, IMG_PX);
        URL.revokeObjectURL(url);
        const data = cv.toDataURL('image/jpeg', 0.86), id = 'i' + hash(data).toString(36);
        addImage(id, data);
        if (!writeImages()) { delete images[id]; G.toast('Máy hết chỗ lưu ảnh', G.C.red); return; }
        done && done(id);
      };
      img.onerror = () => { URL.revokeObjectURL(url); G.toast('Không đọc được ảnh này', G.C.red); };
      img.src = url;
    };
    inp.click();
  }
  function removeImage(id) {
    const used = (G.state.customFabrics || []).some((it) => { const d = dec(it.code); return d && d.i === id; });
    if (used) return false;
    delete images[id]; writeImages(); return true;
  }

  // make sure the texture engine knows this design's print; returns the print id
  function printId(d) {
    if (d.k === 'tron') return 'tron';
    const id = 'u:' + code(d);
    if (G.tex.patterns[id]) return id;
    if (d.k === 'anh') {
      const im = images[d.i];
      if (im && im.ready) G.tex.registerImages({ textures: [{ id, name: '', tech: 'in', tier: 3, img: im.img, seam: d.l === 'guong' ? 'mirror' : 'tile', mode: d.c === 'tint' ? 'tint' : 'full', scale: [0.8, 1.2, 1.8][d.z] }], placements: [] });
      return id; // until the picture is decoded the engine shows plain cloth (not cached)
    }
    G.tex.patterns[id] = { id, name: '', tech: d.k === 'motif' ? 'theu' : 'in', tier: 3, scale: d.k === 'motif' ? 1.7 : 1.1, draw: drawTile(d) };
    return id;
  }

  function name(d) {
    const C = G.CAT, col = G.DATA.colors[d.b].name;
    if (d.k === 'anh') return `${C.MATS[d.m].name}${d.c === 'tint' ? ' ' + col : ''} · in ảnh riêng`;
    const what = d.k === 'motif' ? `${(C.DECOR.theu.items[d.t] || {}).name || d.t} ${LAYOUTS[d.l].toLowerCase()}`.toLowerCase() : d.k === 'tron' ? '' : KINDS[d.k].toLowerCase();
    return `${C.MATS[d.m].name} ${col}${what ? ' · ' + what : ''}`;
  }
  // fixed-formula stats: material + ground colour + a small bonus from the repeat (never stronger than a shop bolt)
  function stats(d) {
    const C = G.CAT, kind = { tron: {}, motif: {}, soc: { hiendai: 1 }, cham: { thanhlich: 1, hiendai: 1 }, ke: { thanhlich: 1 }, anh: { hiendai: 1 } }[d.k];
    if (d.k === 'motif') { const mt = (C.DECOR.theu.items[d.t] || {}).tags || {}; const top = Object.keys(mt).sort((a, b) => mt[b] - mt[a])[0]; if (top) kind[top] = 1; }
    return { tags: C.sumTags([C.MATS[d.m].tags, C.COLOR_TAGS[d.b] || {}, kind]), price: C.MATS[d.m].price + (d.k === 'tron' ? 0 : d.k === 'anh' ? 8 : 6), rank: C.MATS[d.m].rank };
  }
  // a fabric record for a design, in the same shape as the shop's bolts
  function fabricOf(d, author) {
    d = clean(d);
    const st = stats(d), id = 'tk_' + hash(code(d)).toString(36);
    return { id, mat: d.m, color: d.b, colors: [d.b].concat(d.c && G.DATA.colors[d.c] ? [d.c] : []), print: printId(d), name: name(d), price: st.price, rank: st.rank, tags: st.tags, custom: true, author: author || null, design: d };
  }
  function register(d, author) { const f = fabricOf(d, author); G.CAT.FABRICS[f.id] = f; return f; }
  function registerAll() {
    const s = G.state; s.customFabrics = s.customFabrics || [];
    for (const k in images) delete images[k];
    for (const it of readImages()) if (it && it.id && /^data:image\/jpeg;base64,/.test(it.data)) addImage(it.id, it.data);
    for (const it of s.customFabrics) { const d = dec(it.code); if (d) register(d, it.author); }
    communityFromCache();
  }
  function save(d) {
    const s = G.state, c = code(d);
    s.customFabrics = s.customFabrics || [];
    if (s.customFabrics.some((it) => it.code === c)) return { dup: true, fabric: register(d) };
    if (s.customFabrics.length >= MAX) return { full: true };
    s.customFabrics.push({ code: c, author: s.shopName });
    const f = register(d, s.shopName); G.save();
    return { fabric: f };
  }
  // a saved design can go only while nothing uses it (cloth on the roll, the job on the table, an album photo)
  function inUse(id) {
    const s = G.state, uses = (fabs) => fabs && Object.values(fabs).includes(id);
    return !!(s.roll[id] || (G.job && uses(G.job.fabs)) || (s.collection || []).some((x) => uses(x.fabs)));
  }
  function remove(c) {
    const s = G.state, d = dec(c); if (!d) return false;
    const id = fabricOf(d).id; if (inUse(id)) return false;
    s.customFabrics = s.customFabrics.filter((it) => it.code !== c); delete G.CAT.FABRICS[id]; G.save();
    return true;
  }
  function shareLink(d) { return location.origin + location.pathname + '#f=' + code(d); }

  // ---------- community channel (GitHub Discussions) ----------
  // owner/repo: set in G.CFG.repo, or read from a GitHub Pages address (owner.github.io/repo/)
  function repo() {
    if (G.CFG.repo) return G.CFG.repo;
    const m = /^([\w-]+)\.github\.io$/i.exec(location.hostname), p = location.pathname.split('/').filter(Boolean)[0];
    return m && p ? `${m[1]}/${p}` : null;
  }
  const CATEGORY = 'vai-cong-dong';
  // the post carries the picture (the player drops the downloaded file in) and the bolt's settings
  function submit(d) {
    d = clean(d);
    const r = repo();
    if (!r) { G.toast('Kênh cộng đồng mở khi game chạy trên GitHub Pages', G.C.red); return false; }
    const im = d.k === 'anh' ? images[d.i] : null, title = name(d);
    if (im) {
      const a = document.createElement('a'); a.href = im.data; a.download = `vai-${d.i}.jpg`; document.body.appendChild(a); a.click(); a.remove();
    }
    const setting = JSON.stringify({ m: d.m, b: d.b, c: d.k === 'anh' ? d.c : 'full', l: d.k === 'anh' ? d.l : 'guong', z: d.z });
    const body = [
      im ? '**Kéo file ảnh vừa tải về (`vai-' + d.i + '.jpg`) vào ô này**, rồi bấm Start discussion.' : 'Mẫu ghép từ hoạ tiết có sẵn — mở thử: ' + shareLink(d),
      '',
      '- [ ] Ảnh do tôi tự vẽ / tự chụp, hoặc được phép dùng (không lấy ảnh có bản quyền của người khác)',
      '',
      'Tiệm: ' + (G.state.shopName || ''),
      '',
      '```aodai-fabric',
      setting,
      '```',
      '',
      '_Mọi người bấm ⬆ để bầu. Mẫu đủ phiếu và được duyệt sẽ lên kệ "Cộng đồng" trong game._'
    ].join('\n');
    const url = `https://github.com/${r}/discussions/new?category=${CATEGORY}&title=${encodeURIComponent('Vải: ' + title)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank', 'noopener');
    G.toast(im ? 'Đã tải ảnh về máy — thả ảnh vào bài đăng vừa mở' : 'Đã mở bài đăng cộng đồng', G.C.green);
    return true;
  }
  function discussionsUrl() { const r = repo(); return r ? `https://github.com/${r}/discussions/categories/${CATEGORY}` : null; }

  // community bolts: the list published by the GitHub Action (community/fabrics.json)
  let community = [];
  function cleanEntry(e) {
    const C = G.CAT, cols = G.DATA.colors, d = e && e.d;
    if (!e || !Number.isInteger(e.id) || !/^[\w.-]+\.(jpe?g|png|webp)$/i.test(e.file || '') || !d) return null;
    if (!C.MATS[d.m] || !cols[d.b] || !INKS[d.c] || !REPEATS[d.l] || ![0, 1, 2].includes(d.z)) return null;
    const txt = (s, n) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, n);
    return { id: e.id, file: e.file, title: txt(e.title, 48), author: txt(e.author, 32), votes: Math.max(0, e.votes | 0), url: /^https:\/\/github\.com\//.test(e.url || '') ? e.url : null, d: { m: d.m, b: d.b, c: d.c, l: d.l, z: d.z } };
  }
  function registerCommunity(list) {
    community = list.map(cleanEntry).filter(Boolean);
    for (const e of community) {
      const fid = 'cd_' + e.id, C = G.CAT, st = stats(Object.assign({ k: 'anh' }, e.d));
      C.FABRICS[fid] = { id: fid, mat: e.d.m, color: e.d.b, colors: [e.d.b], print: fid, name: e.title || `Vải cộng đồng #${e.id}`, price: st.price, rank: st.rank, tags: st.tags, community: true, author: e.author, votes: e.votes, url: e.url };
      if (G.tex.patterns[fid]) continue;
      const rec = loadImage({}, 'community/' + e.file, () => {
        G.tex.registerImages({ textures: [{ id: fid, name: '', tech: 'in', tier: 3, img: rec.img, seam: e.d.l === 'guong' ? 'mirror' : 'tile', mode: e.d.c === 'tint' ? 'tint' : 'full', scale: [0.8, 1.2, 1.8][e.d.z] }], placements: [] });
      });
    }
  }
  // bolts the player may already own must exist at load, so the last list is kept on the device
  function communityFromCache() { try { registerCommunity(JSON.parse(localStorage.getItem(COMM_KEY) || '[]')); } catch (e) { /* no cache yet */ } }
  async function fetchCommunity() {
    try {
      const r = await fetch('community/fabrics.json', { cache: 'no-cache' });
      if (!r.ok) return;
      const list = await r.json(); if (!Array.isArray(list)) return;
      registerCommunity(list);
      try { localStorage.setItem(COMM_KEY, JSON.stringify(community)); } catch (e) { /* full */ }
    } catch (e) { /* offline: the cached list stays */ }
  }

  return {
    MOTIFS, KINDS, LAYOUTS, REPEATS, INKS, SIZES, MAX, IMG_MAX, DEFAULT, images, code, dec, clean, printId, name, stats, fabricOf, register, registerAll,
    save, inUse, remove, shareLink, tinted, pickImage, removeImage, repo, submit, discussionsUrl, fetchCommunity, community: () => community
  };
})();

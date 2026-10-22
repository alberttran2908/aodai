// Chuyển tiệm: carry the shop to another device without an account — a file (the whole shop, with your own
// fabric designs), or a short code to paste through Zalo/Messenger (the shop itself, gzip + base64). Opening
// either asks first, and keeps the replaced shop as a backup that can be put back.
G.transfer = {
  KEYS: ['aodai_tailor_v2', 'aodai_skins_v1', 'aodai_fabimg_v1', 'aodai_challenge_v1', 'aodai_challenge_best'],
  BACKUP: 'aodai_transfer_backup',
  bundle(full) {
    const o = { app: 'aodai', v: 1, at: Date.now(), full: !!full, data: {} };
    for (const k of full ? this.KEYS : ['aodai_tailor_v2', 'aodai_challenge_best']) { const v = localStorage.getItem(k); if (v !== null) o.data[k] = v; }
    return o;
  },
  // a shop bundle → what to show before replacing ("Tiệm X · hạng 3 · ngày 41"), or null if it is not one
  check(o) {
    try {
      if (!o || o.app !== 'aodai' || !o.data || !o.data.aodai_tailor_v2) return null;
      const s = JSON.parse(o.data.aodai_tailor_v2);
      if (!s || typeof s !== 'object' || !s.shopName) return null;
      const rank = (G.RANK_AT || []).filter((p) => (s.prestige || 0) >= p).length || 1;
      return { shop: String(s.shopName).slice(0, 24), day: s.day || 1, rank, coins: s.coins || 0, at: o.at };
    } catch (e) { return null; }
  },
  b64: (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  unb64: (str) => { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const b = atob(str), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; },
  async pack(o) {
    const raw = new TextEncoder().encode(JSON.stringify(o));
    if (typeof CompressionStream === 'undefined') return 'AD0:' + this.b64(raw);
    const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
    return 'AD1:' + this.b64(z);
  },
  async unpack(code) {
    code = String(code || '').replace(/\s+/g, '');
    const m = code.match(/AD([01]):([A-Za-z0-9_-]+)/); if (!m) return null;
    let bytes = this.unb64(m[2]);
    if (m[1] === '1') bytes = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
    return JSON.parse(new TextDecoder().decode(bytes));
  },
  // replace this device's shop with the bundle's (keeping the old one as a backup), then restart
  apply(o) {
    const keep = this.bundle(true);
    G.saveLock = true;
    try { localStorage.setItem(this.BACKUP, JSON.stringify(keep)); } catch (e) { /* no room for a backup: carry on */ }
    // a file carries everything (what it lacks goes); a code carries the shop only (your fabric designs stay)
    for (const k of this.KEYS) if (k in o.data) localStorage.setItem(k, String(o.data[k])); else if (o.full) localStorage.removeItem(k);
    location.reload();
  },
  backup() { try { return JSON.parse(localStorage.getItem(this.BACKUP) || 'null'); } catch (e) { return null; } },
  name() {
    const slug = (G.state.shopName || 'ao-dai').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
    return (/^tiem/.test(slug) ? '' : 'tiem-') + slug + '-' + G.dateKeyVN() + '.json';
  },
  saveFile() {
    G.save();
    const blob = new Blob([JSON.stringify(this.bundle(true))], { type: 'application/json' }), name = this.name();
    try {
      const file = new File([blob], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: G.state.shopName }).catch(() => {}); return; }
    } catch (e) { /* fall back to a download */ }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  },
  // a file picked by the player → bundle (or null)
  openFile(cb) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      f.text().then((t) => { let o = null; try { o = JSON.parse(t); } catch (e) { o = null; } cb(o); }, () => cb(null));
    };
    inp.click();
  },
  async copyCode() { G.save(); G.share.copy(await this.pack(this.bundle(false))); },
  async pasteCode() {
    let t = '';
    try { t = await navigator.clipboard.readText(); } catch (e) { t = ''; }
    if (!/AD[01]:/.test(t)) t = window.prompt('Dán mã tiệm vào đây:') || '';
    try { return await this.unpack(t); } catch (e) { return null; }
  }
};

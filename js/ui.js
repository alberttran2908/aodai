// Shared UI kit: one consistent "atelier sketchbook" look for every screen.
G.UI = (function () {
  const T = { paper: '#fbf6ec', paper2: '#f3ead9', ink: '#3d2b25', soft: '#8a7366', line: '#e3d6c2', edge: '#7a5442', stitch: 'rgba(178,58,72,0.34)', accent: '#9e2a3a', gold: '#b88a3a', ok: '#4f8a5b', bad: '#b8323f' };

  // work-room linen (cached: woven threads + vignette)
  let linenCv = null;
  function linen() {
    const cv = document.createElement('canvas'); cv.width = G.W; cv.height = G.H;
    const c = cv.getContext('2d'), rnd = G.mulberry32 ? G.mulberry32(7) : Math.random;
    const g = c.createLinearGradient(0, 0, 0, G.H); g.addColorStop(0, '#f0e3cd'); g.addColorStop(1, '#e2cfb2');
    c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
    for (let y = 0; y < G.H; y += 2) { c.fillStyle = `rgba(110,75,45,${0.015 + rnd() * 0.04})`; c.fillRect(0, y, G.W, 1); }
    for (let x = 0; x < G.W; x += 2) { c.fillStyle = `rgba(255,255,255,${0.02 + rnd() * 0.05})`; c.fillRect(x, 0, 1, G.H); }
    const v = c.createRadialGradient(G.W / 2, G.H / 2, G.H * 0.3, G.W / 2, G.H / 2, G.H * 1.0);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(80,45,20,0.24)');
    c.fillStyle = v; c.fillRect(0, 0, G.W, G.H);
    return cv;
  }
  function bg(c, kind) {
    if (kind === 'desk') return G.art.shopBg(c);
    if (!linenCv) linenCv = linen();
    c.drawImage(linenCv, 0, 0, G.W, G.H);
  }

  // paper panel: hard drop shadow, inked edge and a running stitch just inside it
  function card(c, x, y, w, h, o) {
    o = o || {};
    const r = o.r || 16;
    c.save();
    G.rr(c, x + 1, y + 6, w, h, r); c.fillStyle = 'rgba(50,25,12,0.2)'; c.fill();
    G.rr(c, x, y, w, h, r); c.fillStyle = o.fill || T.paper; c.fill();
    const g = c.createLinearGradient(0, y, 0, y + Math.min(h, 90)); g.addColorStop(0, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fill();
    c.strokeStyle = o.stroke || T.edge; c.lineWidth = 2.4; c.stroke();
    if (o.stitch !== false && w > 70 && h > 44) {
      G.rr(c, x + 7, y + 7, w - 14, h - 14, Math.max(4, r - 6));
      c.setLineDash([7, 5]); c.strokeStyle = o.stitchCol || T.stitch; c.lineWidth = 1.4; c.stroke(); c.setLineDash([]);
    }
    c.restore();
  }

  function title(c, text, x, y, o) { G.text(c, text, x, y, Object.assign({ size: 26, font: G.GAME, weight: 800, color: T.accent }, o || {})); }

  // red satin banner with folded tails; returns its width
  function ribbon(c, text, cx, cy, o) {
    o = o || {};
    const size = o.size || 18, h = o.h || 34, dark = o.dark || '#7a2330';
    c.save();
    c.font = `700 ${G.fs(size)}px ${G.GAME}`;
    const w = c.measureText(text).width + 48, x = cx - w / 2, y = cy - h / 2, drop = 7, tail = o.tail || 26;
    for (const s of [-1, 1]) {
      const ex = s < 0 ? x + 12 : x + w - 12, tx = ex + s * tail;
      c.beginPath(); c.moveTo(ex, y + drop); c.lineTo(tx, y + drop); c.lineTo(tx - s * 9, y + drop + h / 2); c.lineTo(tx, y + drop + h); c.lineTo(ex, y + drop + h); c.closePath();
      c.fillStyle = dark; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
    }
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.top || '#d65a67'); g.addColorStop(1, o.col || '#b23a48');
    c.beginPath(); c.rect(x, y, w, h); c.fillStyle = g; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.2; c.stroke();
    c.setLineDash([5, 4]); c.strokeStyle = 'rgba(255,236,210,0.55)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(x + 6, y + 4.5); c.lineTo(x + w - 6, y + 4.5); c.moveTo(x + 6, y + h - 4.5); c.lineTo(x + w - 6, y + h - 4.5); c.stroke(); c.setLineDash([]);
    G.text(c, text, cx, cy + 2.5, { size, weight: 700, font: G.GAME, align: 'center', color: dark });
    G.text(c, text, cx, cy + 1, { size, weight: 700, font: G.GAME, align: 'center', color: '#fff6e6' });
    c.restore();
    return w;
  }

  // text with a light outline, readable on any wall or fabric
  function outlined(c, text, x, y, o) {
    o = Object.assign({ size: 14, weight: 700, font: G.GAME, color: G.INK, halo: '#fff8ec' }, o || {});
    c.save(); let fz = G.fs(o.size); c.font = `${o.weight} ${fz}px ${o.font}`;
    if (o.maxW) { const tw = c.measureText(text).width; if (tw > o.maxW) { fz = Math.max(8, (fz * o.maxW) / tw); c.font = `${o.weight} ${fz}px ${o.font}`; } } // shrink to fit
    c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = o.lw || 4; c.strokeStyle = o.halo; c.strokeText(text, x, y);
    c.fillStyle = o.color; c.fillText(text, x, y); c.restore();
  }

  // little red "news" badge that bobs
  function badge(c, x, y, label) {
    const by = y + Math.sin((G.scene && G.scene.t || 0) * 5) * 2;
    c.save(); c.beginPath(); c.arc(x, by, 10, 0, 7); c.fillStyle = '#e0424f'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
    G.text(c, label || '!', x, by + 1, { size: 13, weight: 800, font: G.GAME, align: 'center', color: '#fff' }); c.restore();
  }

  // hand-drawn icons for the shop's navigation (drawn in a ~36px box around cx, cy)
  function icon(c, name, cx, cy, s) {
    s = (s || 36) / 36;
    c.save(); c.translate(cx, cy); c.scale(s, s);
    c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = G.INK; c.lineWidth = 2;
    const box = (x, y, w, h, r, fill) => { G.rr(c, x, y, w, h, r); c.fillStyle = fill; c.fill(); c.stroke(); };
    const line = (pts, col, lw) => { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.strokeStyle = col || G.INK; c.lineWidth = lw || 2; c.stroke(); c.strokeStyle = G.INK; c.lineWidth = 2; };
    switch (name) {
      case 'fabric': // a stack of folded bolts
        box(-15, 4, 30, 10, 3, '#2f7d78'); line([[-9, 6], [-9, 12]], 'rgba(255,255,255,0.45)', 1.5);
        box(-13, -6, 28, 10, 3, '#d8a33f'); line([[-7, -4], [-7, 2]], 'rgba(255,255,255,0.5)', 1.5);
        box(-15, -16, 30, 10, 3, '#c2414f'); line([[-9, -14], [-9, -8]], 'rgba(255,255,255,0.5)', 1.5);
        break;
      case 'album': // taped photo of a dress
        c.rotate(-0.12); box(-14, -15, 28, 31, 2, '#fffaf0');
        G.rr(c, -10, -11, 20, 19, 1); c.fillStyle = '#a9d3e0'; c.fill();
        c.beginPath(); c.moveTo(-2, -7); c.lineTo(2, -7); c.lineTo(6, 8); c.lineTo(-6, 8); c.closePath(); c.fillStyle = '#c2414f'; c.fill();
        c.beginPath(); c.arc(0, -9, 2.4, 0, 7); c.fillStyle = '#4a2c22'; c.fill();
        c.fillStyle = 'rgba(240,215,140,0.85)'; c.fillRect(-5, -18, 10, 5);
        break;
      case 'workshop': // sewing machine
        box(-16, 8, 32, 7, 2, '#7a5442');
        c.beginPath(); c.moveTo(-12, 8); c.lineTo(-12, -2); c.lineTo(-7, -2); c.lineTo(-7, -9); c.quadraticCurveTo(-7, -14, -2, -14); c.lineTo(10, -14);
        c.quadraticCurveTo(14, -14, 14, -10); c.lineTo(14, 8); c.closePath(); c.fillStyle = '#2f6f6a'; c.fill(); c.stroke();
        line([[-5, -10], [10, -10]], '#e2b85a', 1.6);
        box(-15, -6, 6, 9, 1.5, '#2f6f6a'); line([[-12, 3], [-12, 7]], '#cfd6dc', 1.6);
        c.beginPath(); c.arc(15, -6, 4.5, 0, 7); c.fillStyle = '#e2b85a'; c.fill(); c.stroke();
        break;
      case 'clients': // the client book, with a heart
        box(-12, -15, 25, 30, 3, '#9e3a4a'); box(-14, -15, 6, 30, 2, '#7a2330');
        c.beginPath(); c.moveTo(3, 7); c.bezierCurveTo(-7, 0, -4, -8, 3, -4); c.bezierCurveTo(10, -8, 13, 0, 3, 7); c.fillStyle = '#ffb3c4'; c.fill(); c.lineWidth = 1.6; c.stroke();
        break;
      case 'paper': // folded newspaper
        box(-15, -13, 30, 26, 2, '#fffaf0');
        c.fillStyle = '#4a2c22'; c.fillRect(-11, -9, 22, 4);
        c.fillStyle = '#a9d3e0'; c.fillRect(-11, -2, 9, 9);
        c.fillStyle = 'rgba(74,44,34,0.5)'; for (let i = 0; i < 4; i++) c.fillRect(1, -2 + i * 3, 10, 1.4);
        break;
      case 'mail': // envelope with a wax seal
        box(-16, -11, 32, 22, 2, '#fff3dc');
        line([[-16, -10], [0, 3], [16, -10]]);
        c.beginPath(); c.arc(0, 3, 4.5, 0, 7); c.fillStyle = '#c2414f'; c.fill(); c.lineWidth = 1.6; c.stroke();
        break;
      case 'trophy':
        c.beginPath(); c.arc(-10, -6, 5, Math.PI * 0.5, Math.PI * 1.5); c.moveTo(10, -11); c.arc(10, -6, 5, -Math.PI * 0.5, Math.PI * 0.5); c.lineWidth = 2.6; c.strokeStyle = '#b8862a'; c.stroke(); c.lineWidth = 2; c.strokeStyle = G.INK;
        c.beginPath(); c.moveTo(-10, -14); c.lineTo(10, -14); c.lineTo(9, -3); c.quadraticCurveTo(0, 6, -9, -3); c.closePath();
        { const g = c.createLinearGradient(-10, 0, 10, 0); g.addColorStop(0, '#d9a441'); g.addColorStop(0.45, '#ffe08a'); g.addColorStop(1, '#c48b2b'); c.fillStyle = g; } c.fill(); c.stroke();
        box(-3, 2, 6, 7, 1, '#d9a441'); box(-9, 9, 18, 6, 2, '#7a5442');
        break;
      case 'ledger': // account book with a coin
        box(-12, -15, 25, 30, 3, '#3f7a5a'); box(-14, -15, 6, 30, 2, '#2e5a38');
        c.beginPath(); c.arc(3, 0, 6.5, 0, 7); c.fillStyle = '#f2c25a'; c.fill(); c.lineWidth = 1.6; c.stroke();
        G.text(c, 'đ', 3, 0.5, { size: 10, weight: 800, align: 'center', color: '#7a5420' });
        break;
      case 'tasks': // clipboard with a ticked list
        box(-12, -14, 24, 30, 3, '#b98a5a'); box(-9, -10, 18, 23, 1.5, '#fffaf0');
        box(-5, -17, 10, 6, 2, '#8a8f96');
        for (let i = 0; i < 3; i++) {
          line([[-6, -5 + i * 6], [-4.5, -3.5 + i * 6], [-1.5, -7 + i * 6]], i < 2 ? '#3f8a4f' : 'rgba(74,44,34,0.35)', 1.6);
          line([[1, -5 + i * 6], [6, -5 + i * 6]], 'rgba(74,44,34,0.5)', 1.4);
        }
        break;
      case 'lantern': // a red paper lantern on a string, gold tassel
        line([[0, -18], [0, -13]], G.INK, 1.6);
        box(-6, -14, 12, 4, 1.5, '#d9a441');
        c.beginPath(); c.ellipse(0, 0, 13, 11, 0, 0, 7);
        { const g = c.createRadialGradient(-3, -3, 2, 0, 0, 14); g.addColorStop(0, '#ff8a6a'); g.addColorStop(1, '#b8283a'); c.fillStyle = g; } c.fill(); c.stroke();
        line([[0, -11], [0, 11]], 'rgba(120,20,30,0.55)', 1.2);
        c.beginPath(); c.ellipse(0, 0, 6, 11, 0, 0, 7); c.strokeStyle = 'rgba(120,20,30,0.55)'; c.lineWidth = 1.2; c.stroke(); c.strokeStyle = G.INK; c.lineWidth = 2;
        box(-6, 10, 12, 4, 1.5, '#d9a441');
        line([[-2, 14], [-2, 19]], '#d9a441', 1.6); line([[2, 14], [2, 19]], '#d9a441', 1.6);
        break;
      case 'phone': // a smartphone with a chat bubble on its screen
        c.rotate(-0.12);
        box(-10, -17, 20, 34, 4, '#3a3a46');
        G.rr(c, -7.5, -13, 15, 24, 2); c.fillStyle = '#bfe3f2'; c.fill();
        G.rr(c, -5.5, -9, 11, 7, 3); c.fillStyle = '#2f8fe0'; c.fill();
        c.beginPath(); c.moveTo(-3, -2.5); c.lineTo(-4.5, 0.5); c.lineTo(0, -2.5); c.fill();
        G.rr(c, -3.5, 1.5, 9, 6, 3); c.fillStyle = '#fffaf0'; c.fill();
        c.beginPath(); c.arc(0, 14, 1.4, 0, 7); c.fillStyle = '#cfd6dc'; c.fill();
        break;
      case 'box': // a cardboard parcel with tape and a shipping label
        c.beginPath(); c.moveTo(-15, -6); c.lineTo(0, -13); c.lineTo(15, -6); c.lineTo(0, 1); c.closePath(); c.fillStyle = '#e2b77a'; c.fill(); c.stroke();
        c.beginPath(); c.moveTo(-15, -6); c.lineTo(0, 1); c.lineTo(0, 16); c.lineTo(-15, 9); c.closePath(); c.fillStyle = '#c9965a'; c.fill(); c.stroke();
        c.beginPath(); c.moveTo(15, -6); c.lineTo(0, 1); c.lineTo(0, 16); c.lineTo(15, 9); c.closePath(); c.fillStyle = '#b5824a'; c.fill(); c.stroke();
        line([[-7.5, -9.5], [7.5, -2.5]], 'rgba(250,240,215,0.9)', 3);
        c.save(); c.translate(-7.5, 6); c.transform(1, 0.47, 0, 1, 0, 0); c.fillStyle = '#fffaf0'; c.fillRect(-4, -3, 8, 6); c.restore();
        break;
      case 'exit': // door
        box(-11, -15, 20, 30, 2, '#9a6a45'); c.beginPath(); c.arc(4, 1, 1.8, 0, 7); c.fillStyle = '#ffe08a'; c.fill();
        line([[12, 0], [19, 0]], G.INK, 2.4); line([[16, -4], [20, 0], [16, 4]], G.INK, 2.4);
        break;
    }
    c.restore();
  }

  // a pickable tile (option, fabric bolt, slot): sits on a small hard shadow; selected = red ring and glow
  function tile(c, x, y, w, h, o) {
    o = o || {};
    const r = o.r || 12;
    c.save();
    G.rr(c, x + 1, y + 4, w, h, r); c.fillStyle = 'rgba(60,30,15,0.16)'; c.fill();
    if (o.sel) { G.rr(c, x - 3, y - 3, w + 6, h + 6, r + 3); c.fillStyle = 'rgba(214,90,103,0.28)'; c.fill(); }
    G.rr(c, x, y, w, h, r);
    c.fillStyle = o.sel ? '#fff1dc' : o.hov && !o.lock ? '#fffaf0' : o.base || '#f6eddc'; c.fill();
    c.strokeStyle = o.sel ? '#b23a48' : o.hov && !o.lock ? T.edge : '#c8ad8c'; c.lineWidth = o.sel ? 3 : 1.8; c.stroke();
    c.restore();
  }

  // a row of square icon tiles with labels under them (the shop's "toolbar")
  function dock(c, items, x, y) {
    const tw = 62, th = 56, gap = 12;
    items.forEach((it, i) => {
      const bx = x + i * (tw + gap);
      G.button(c, it.id, '', bx, y, tw, th, it.cb, { style: 'ghost', r: 14, icon: (cc, ix, iy) => icon(cc, it.icon, ix, iy, 34), enabled: it.enabled });
      outlined(c, it.label, bx + tw / 2, y + th + 13, { size: 13, align: 'center', maxW: tw + gap - 2 });
      if (it.dot) badge(c, bx + tw - 4, y + 2);
    });
    return items.length * (tw + gap) - gap;
  }

  // wooden beam across the top: shop sign, the step's banner, money and rank
  function topbar(c, step) {
    const s = G.state;
    c.save();
    const g = c.createLinearGradient(0, 0, 0, 52); g.addColorStop(0, '#8d5d3c'); g.addColorStop(1, '#5e3a24');
    c.fillStyle = g; c.fillRect(0, 0, G.W, 52);
    c.strokeStyle = 'rgba(40,20,8,0.16)'; c.lineWidth = 1;
    for (let i = 0; i < 5; i++) { c.beginPath(); for (let x = 0; x <= G.W; x += 40) { const yy = 9 + i * 9 + Math.sin(x * 0.011 + i * 1.7) * 2.2; if (x) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); }
    c.fillStyle = '#3e2416'; c.fillRect(0, 50, G.W, 3);
    c.fillStyle = 'rgba(40,20,10,0.22)'; c.fillRect(0, 53, G.W, 5);
    const shop = s.isDaily ? 'Đơn ngày' : s.shopName || 'Tiệm May Áo Dài';
    c.font = `700 19px ${G.SERIF}`;
    const sw = Math.min(330, c.measureText(shop).width);
    fitText(c, shop, 23, 27, 330, { size: 19, font: G.SERIF, weight: 700, color: '#2a160c' });
    fitText(c, shop, 22, 25, 330, { size: 19, font: G.SERIF, weight: 700, color: '#ffe9c4' });
    if ((s.badges || []).includes('de_vang')) thimble(c, 22 + sw + 18, 25);
    if (step) ribbon(c, step, G.W / 2, 26, { size: 17, h: 32, tail: 22 });
    // coins: a dark slot with a big coin poking out of it
    const cx = G.W - 330;
    G.rr(c, cx, 12, 124, 28, 14); c.fillStyle = 'rgba(30,14,6,0.5)'; c.fill(); c.strokeStyle = 'rgba(255,220,170,0.25)'; c.lineWidth = 1.5; c.stroke();
    G.art.coin(c, cx + 4, 26, 15);
    G.text(c, String(s.coins - (G.ui.coinHold || 0)), cx + 70, 27, { size: 21, weight: 800, font: G.GAME, align: 'center', color: '#ffe08a' });
    if (s.econ && s.econ.debt > 0) G.text(c, `Nợ ${s.econ.debt}`, cx - 18, 27, { size: 16, weight: 800, font: G.GAME, align: 'right', color: '#ff9a8f' });
    // rank: gold medallion + progress to the next rank
    const rk = G.rank(), frac = G.rankProgress ? G.rankProgress() : s.prestige - Math.floor(s.prestige), mx = G.W - 176;
    G.rr(c, mx + 8, 18, 90, 16, 8); c.fillStyle = 'rgba(30,14,6,0.5)'; c.fill();
    G.rr(c, mx + 10, 20, Math.max(10, 86 * frac), 12, 6); c.fillStyle = '#e9b949'; c.fill();
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(mx + 16, 22, Math.max(0, 86 * frac - 12), 3);
    c.beginPath(); c.arc(mx, 26, 17, 0, 7);
    const mg = c.createRadialGradient(mx - 5, 20, 2, mx, 26, 18); mg.addColorStop(0, '#fff0b0'); mg.addColorStop(1, '#d39a2e');
    c.fillStyle = mg; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
    G.text(c, String(rk), mx, 27, { size: 17, weight: 800, font: G.GAME, align: 'center', color: '#5a3410' });
    G.text(c, 'HẠNG', mx + 54, 44, { size: 9, weight: 800, font: G.GAME, align: 'center', color: 'rgba(255,233,196,0.7)' });
    c.restore();
    G.button(c, 'mute', s.muted ? '🔇' : '🔊', G.W - 58, 8, 40, 36, () => { s.muted = !s.muted; G.save(); }, { style: 'ghost', size: 16, r: 10 });
  }

  // the golden thimble (Đê vàng) earned at the end of season 1
  function thimble(c, x, y) {
    const g = c.createLinearGradient(x - 8, 0, x + 8, 0); g.addColorStop(0, '#b8862a'); g.addColorStop(0.5, '#ffe08a'); g.addColorStop(1, '#a8761f');
    c.beginPath(); c.moveTo(x - 7, y + 8); c.lineTo(x - 6, y - 4); c.quadraticCurveTo(x, y - 11, x + 6, y - 4); c.lineTo(x + 7, y + 8); c.closePath();
    c.fillStyle = g; c.fill();
    c.fillStyle = 'rgba(120,80,20,0.5)'; for (let i = -1; i <= 1; i++) for (let j = 0; j < 3; j++) c.fillRect(x + i * 3.4 - 0.6, y - 3 + j * 3.6, 1.2, 1.2);
  }
  // Madame Sa's rating: 1–5 needles (gold = earned)
  // live Thẩm mỹ while designing: a small pill with the flowers and what the eye notices
  function flairPill(c, cx, y, f) {
    const note = [f.color.note, f.place.note].filter(Boolean).join(' · ');
    c.font = `600 ${G.fs(12)}px ${G.FONT}`;
    const w = 134 + c.measureText(note).width + 14, x = cx - w / 2;
    G.rr(c, x, y, w, 28, 14); c.fillStyle = 'rgba(255,250,240,0.92)'; c.fill(); c.strokeStyle = 'rgba(94,58,36,0.25)'; c.lineWidth = 1.2; c.stroke();
    G.text(c, 'Thẩm mỹ', x + 12, y + 14, { size: 12, weight: 800 });
    flowers(c, x + 76, y + 14, f.pts, 7);
    G.text(c, note, x + 134, y + 14, { size: 12, weight: 600, color: T.soft });
  }
  // Thẩm mỹ: three little flowers, the earned ones in bloom, the rest pale outlines
  function flowers(c, x, y, n, r) {
    r = r || 8;
    for (let i = 0; i < 3; i++) {
      const fx = x + r + i * r * 2.5;
      if (i < n) G.art.flower(c, fx, y, r, '#d6698a');
      else { c.save(); c.globalAlpha = 0.35; G.art.flower(c, fx, y, r, '#c9b8a6'); c.restore(); }
    }
    return r * 2.5 * 3;
  }
  function needles(c, x, y, kim, sc) {
    sc = sc || 1;
    for (let i = 0; i < 5; i++) {
      const nx = x + i * 34 * sc + 12 * sc, on = i < kim;
      c.save(); c.translate(nx, y); c.rotate(-0.5);
      c.strokeStyle = on ? '#c9952e' : '#c8bdb0'; c.lineWidth = 2.6 * sc; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, -11 * sc); c.lineTo(0, 11 * sc); c.stroke();
      c.lineWidth = 1.4 * sc; c.beginPath(); c.ellipse(0, -7.5 * sc, 1.6 * sc, 3 * sc, 0, 0, 7); c.strokeStyle = on ? '#fff3c4' : '#efe8df'; c.stroke();
      c.restore();
    }
  }

  function hint(c, text) {
    if (!text) return;
    // never runs under the action buttons on the right (long hints are cut short on phones, where text is bigger)
    const maxW = G.textBoost > 1 ? 560 : G.W - 470 - 52; // phones: keep clear of a third button on the right too
    c.save(); c.font = `500 ${G.fs(14)}px ${G.FONT}`;
    const w = Math.min(c.measureText(text).width, maxW) + 50;
    G.rr(c, 16, G.H - 46, w, 32, 16); c.fillStyle = 'rgba(52,30,18,0.88)'; c.fill(); c.strokeStyle = 'rgba(255,225,180,0.3)'; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.arc(30, G.H - 30, 15, 0, 7); c.fillStyle = '#f6cd6a'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
    thimble(c, 30, G.H - 31);
    fitText(c, text, 52, G.H - 29, maxW, { size: 14, color: '#f6ead6', weight: 500 });
    c.restore();
  }

  // the one main action of a screen sits bottom-right
  function primary(c, id, label, cb, enabled) {
    return G.button(c, id, label, G.W - 236, G.H - 66, 216, 50, cb, { enabled: enabled !== false, size: 18, r: 25 });
  }
  function secondary(c, id, label, cb, x) {
    return G.button(c, id, label, x !== undefined ? x : G.W - 420, G.H - 66, 170, 50, cb, { style: 'ghost', size: 16, r: 25 });
  }

  function swatch(c, fid, x, y, w, h, r) {
    const f = G.CAT.FABRICS[fid];
    c.save(); G.rr(c, x, y, w, h, r || 8); c.clip();
    c.beginPath(); c.rect(x, y, w, h);
    if (f) G.art.fillFabric(c, f.mat, f.color, 46, f.print); else { c.fillStyle = '#e9dfcf'; c.fill(); }
    const g = c.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.12)');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.restore();
    G.rr(c, x, y, w, h, r || 8); c.strokeStyle = 'rgba(61,43,37,0.2)'; c.lineWidth = 1; c.stroke();
  }

  // style tag bar with requirement marker; ghost = the value a hovered choice would give
  function tagBar(c, x, y, w, key, val, req, ghost) {
    const tg = G.CAT.TAGS[key];
    c.beginPath(); c.arc(x - 8, y, 3.5, 0, 7); c.fillStyle = tg.col; c.fill();
    G.text(c, tg.name, x, y, { size: 13, weight: 600, color: T.ink });
    // the bar starts after the label (wider when phones enlarge the text)
    c.font = `600 ${G.fs(13)}px ${G.FONT}`;
    const lab = Math.max(92, ...G.CAT.TAG_KEYS.map((k) => c.measureText(G.CAT.TAGS[k].name).width + 10)), bx = x + lab, bw = w - 40 - lab; // all bars start in one column
    G.rr(c, bx, y - 5, bw, 10, 5); c.fillStyle = '#eadfcd'; c.fill();
    let ok = true;
    if (req) ok = req.type === 'min' ? val >= req.val : val <= req.val;
    G.rr(c, bx, y - 5, Math.max(6, (bw * Math.min(100, val)) / 100), 10, 5);
    c.fillStyle = req ? (ok ? T.ok : T.bad) : tg.col; c.fill();
    if (ghost !== undefined && ghost !== null && ghost !== val) {
      const gx = bx + (bw * Math.min(100, ghost)) / 100, vx = bx + (bw * Math.min(100, val)) / 100;
      if (ghost > val) { G.rr(c, vx - 2, y - 5, Math.max(4, gx - vx + 2), 10, 5); c.fillStyle = 'rgba(79,138,91,0.45)'; c.fill(); }
      else { c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(gx, y - 5, vx - gx, 10); }
    }
    if (req) {
      const mx = bx + (bw * req.val) / 100;
      c.fillStyle = T.ink; c.fillRect(mx - 1, y - 9, 2, 18);
    }
    if (ghost !== undefined && ghost !== null && ghost !== val) {
      const up = ghost > val;
      G.text(c, up ? '▲' : '▼', x + w - 30, y, { size: 9, align: 'right', color: up ? T.ok : T.bad });
      G.text(c, String(ghost), x + w - 4, y, { size: 13, weight: 800, align: 'right', color: up ? T.ok : T.bad });
    } else G.text(c, String(val), x + w - 4, y, { size: 13, weight: 800, align: 'right', color: req ? (ok ? T.ok : T.bad) : T.soft });
  }

  // commission card: client, budget, quality, requirements (live checks if job given)
  function commission(c, x, y, w, live) {
    const com = G.state.commission; if (!com) return 0;
    const cl = G.client(com.client);
    const tagReqs = com.reqs.filter((r) => r.type === 'min' || r.type === 'max');
    const rules = com.reqs.filter((r) => r.type !== 'min' && r.type !== 'max');
    const h = 96 + (live ? C_KEYS().length * 22 : tagReqs.length * 22) + rules.length * 22;
    card(c, x, y, w, h);
    // ribbon for special orders: personal story (pink), event (gold), chapter (red), daily (blue), copy (violet)
    if (com.title) {
      const th = G.comRibbon && G.comRibbon(com); // odd jobs (funeral, alluring, poor-folk costume), occasions, áo bà ba
      const col = th ? th[0] : { arc: '#d6698a', event: '#c9952e', story: '#b23a48', daily: '#4a86b8', copy: '#6b5bb8' }[com.kind] || T.accent;
      const lab = th ? th[1] : { arc: 'Tâm sự', event: 'Sự kiện', story: 'Truyện', daily: 'Đơn ngày', copy: 'May y chang' }[com.kind] || '';
      c.font = `800 ${G.fs(12)}px ${G.FONT}`;
      const tw = Math.min(w - 40, c.measureText(`${lab} · ${com.title}`).width + 24);
      G.rr(c, x + 14, y - 13, tw, 24, 12); c.fillStyle = col; c.fill();
      fitText(c, `${lab} · ${com.title}`, x + 26, y - 1, tw - 22, { size: 12, weight: 800, color: '#fff' });
    }
    if (com.flags && com.flags.rival) {
      c.save(); c.translate(x + w - 64, y + h - 4); c.rotate(0.07);
      c.fillStyle = '#ffe98a'; c.shadowColor = 'rgba(0,0,0,0.18)'; c.shadowBlur = 6; c.fillRect(-60, -26, 128, 46);
      c.shadowBlur = 0;
      G.wrap(c, 'Siêu Tốc 24h hứa may xong trong 1 ngày!', -54, -21, 118, 13, { size: 10, weight: 700, color: '#6b5420' });
      c.restore();
    }
    G.text(c, cl.name, x + 16, y + 22, { size: 17, weight: 800, color: T.accent });
    if (live && live.mood) {
      // the client reacting to the design as it changes (pops in when the mood changes)
      const m = live.mood, k = 0.6 + 0.4 * G.easeBack(m.pop);
      c.save(); c.translate(x + 26, y + 42); c.scale(k, k); G.text(c, m.face, 0, 1, { size: 17, align: 'center', fixed: true }); c.restore();
      fitText(c, m.line, x + 40, y + 42, w * 0.5, { size: 12, weight: 700, color: m.col });
    } else G.text(c, cl.role, x + 16, y + 42, { size: 12, color: T.soft });
    G.art.coin(c, x + w - 82, y + 22, 9);
    G.text(c, String(com.budget), x + w - 68, y + 22, { size: 16, weight: 800 });
    const qmax = com.reqs.find((r) => r.type === 'qmax');
    G.text(c, `${qmax ? `Chất lượng ≤ ${qmax.val}` : `Chất lượng ≥ ${com.quality}`}${com.quote && com.quote !== 1 ? ` · giá chốt ${Math.round(com.quote * 100)}%` : ''}`, x + w - 16, y + 42, { size: 12, weight: 600, align: 'right', color: T.soft });
    c.fillStyle = T.line; c.fillRect(x + 14, y + 56, w - 28, 1.5);
    let yy = y + 74;
    if (live) {
      for (const k of C_KEYS()) { tagBar(c, x + 24, yy, w - 36, k, live.tags[k], tagReqs.find((r) => r.tag === k), live.ghost && live.ghost[k]); yy += 22; }
    } else {
      for (const r of tagReqs) { G.text(c, '• ' + G.reqText(r), x + 16, yy, { size: 13, weight: 600 }); yy += 22; }
    }
    for (const r of rules) {
      let mark = '•', col = T.ink, txt = G.reqText(r);
      if (live && r.type === 'decor' && live.stage === 'sketch') { mark = '◦'; col = T.soft; txt += ' (ở bước trang trí)'; }
      else if (live && r.type === 'qmax') { mark = '◦'; col = T.soft; txt += ' (khi may xong)'; }
      else if (live) {
        const ck = G.reqCheck(r, live.tags, live.fabs, live.decor);
        mark = ck.ok ? '✓' : '✗'; col = ck.ok ? T.ok : T.bad;
        if (r.type === 'gc' || r.type === 'cols' || r.type === 'cheap') txt += ` · đang ${ck.value}${r.type === 'cols' ? '%' : ''}`;
      }
      fitText(c, `${mark} ${txt}`, x + 16, yy, w - 28, { size: 13, weight: 600, color: col }); yy += 22;
    }
    return h;
  }
  const C_KEYS = () => G.CAT.TAG_KEYS;

  function chip(c, id, label, x, y, active, cb, o) {
    o = o || {};
    c.font = `600 ${G.fs(13)}px ${G.FONT}`;
    const w = o.w || c.measureText(label).width + 26;
    G.button(c, id, label, x, y, w, 30, cb, { style: active ? 'primary' : 'ghost', size: 13, r: 15, enabled: o.enabled });
    return w;
  }

  // small coloured pills "TT+18" showing what a choice adds to each style (mult scales fabric tags by slot)
  const ABBR = { truyenthong: 'TT', thanhlich: 'TL', sangtrong: 'ST', rucro: 'RR', hiendai: 'HĐ' };
  function pills(c, tags, x, y, maxW, mult) {
    const list = Object.keys(tags).map((k) => [k, Math.round(tags[k] * (mult || 1))]).filter((e) => e[1] > 0).sort((a, b) => b[1] - a[1]);
    c.font = `800 ${G.fs(10)}px ${G.FONT}`;
    const ph = Math.max(16, G.fs(10) + 5);
    let px = x;
    for (const [k, v] of list) {
      const label = `${ABBR[k]}+${v}`, w = c.measureText(label).width + 10;
      if (px + w > x + maxW) break;
      G.rr(c, px, y - ph / 2, w, ph, ph / 2); c.fillStyle = G.CAT.TAGS[k].col; c.fill();
      G.text(c, label, px + w / 2, y, { size: 10, weight: 800, align: 'center', color: '#fff' });
      px += w + 4;
    }
  }
  // text cut to a width with an ellipsis
  function fitText(c, text, x, y, maxW, o) {
    o = o || {};
    c.font = `${o.weight || 400} ${G.fs(o.size || 18)}px ${o.font || G.FONT}`;
    let t = text;
    if (c.measureText(t).width > maxW) { while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1); t += '…'; }
    G.text(c, t, x, y, o);
  }
  // dark tooltip box near the pointer
  function tooltip(c, lines) {
    c.font = `700 ${G.fs(13)}px ${G.FONT}`;
    const lh = G.fs(13) + 6;
    const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 24, h = 10 + lines.length * lh;
    const x = G.clamp(G.pointer.x - w / 2, 8, G.W - w - 8), y = Math.max(56, G.pointer.y - h - 16);
    G.rr(c, x, y, w, h, 10); c.fillStyle = 'rgba(52,30,18,0.96)'; c.fill(); c.strokeStyle = '#f6cd6a'; c.lineWidth = 1.5; c.stroke();
    lines.forEach((l, i) => G.text(c, l, x + 12, y + 5 + lh / 2 + i * lh, { size: 13, weight: i ? 500 : 700, color: i ? '#e9dccb' : '#fff' }));
  }

  return { T, bg, card, tile, title, ribbon, outlined, badge, icon, dock, topbar, hint, primary, secondary, swatch, tagBar, commission, chip, ABBR, pills, fitText, tooltip, needles, flowers, flairPill, thimble };
})();

// Procedural art: fabrics, motifs, customers, garment, backgrounds
G.art = (function () {
  const cache = {};

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(h1, h2, t) {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    const r = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return '#' + r.map((v) => v.toString(16).padStart(2, '0')).join('');
  }
  function rgba(h, a) { const c = hexToRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  const isLight = (color) => { const c = G.DATA.colors[color]; return c ? G.tex.lum(c.hex) > 0.6 : false; };

  // ---------- Fabric textures (engine lives in textures.js) ----------
  function fabric(mat, color, print) { return G.tex.make(mat, color, print); }
  function fillFabric(c, mat, color, tileSize, print) {
    const f = fabric(mat, color, print);
    if (f.pattern.setTransform) f.pattern.setTransform(new DOMMatrix().scale((tileSize * f.scale) / f.px));
    c.save();
    if (f.sheer) c.globalAlpha = 1 - f.sheer;
    c.fillStyle = f.pattern;
    c.fill();
    c.restore();
  }

  function pathPoly(c, poly, closed) {
    c.beginPath();
    c.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) c.lineTo(poly[i].x, poly[i].y);
    if (closed !== false) c.closePath();
  }

  // ---------- Small icons ----------
  function coin(c, x, y, r) {
    c.save();
    c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = '#e9b949'; c.fill();
    c.lineWidth = 2; c.strokeStyle = '#b8862a'; c.stroke();
    c.beginPath(); c.arc(x, y, r * 0.55, 0, 7); c.strokeStyle = '#c99532'; c.lineWidth = 1.5; c.stroke();
    c.restore();
  }
  function flower(c, x, y, r, col) {
    c.save();
    c.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      c.beginPath(); c.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.48, 0, 7); c.fill();
    }
    c.beginPath(); c.arc(x, y, r * 0.3, 0, 7); c.fillStyle = '#ffd77a'; c.fill();
    c.restore();
  }
  function star(c, x, y, r, filled) {
    c.save();
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.fillStyle = filled ? '#f2b632' : '#e6d6c2';
    c.fill();
    c.strokeStyle = filled ? '#c48a1c' : '#cdb9a2';
    c.lineWidth = 1.5;
    c.stroke();
    c.restore();
  }
  function lock(c, x, y, r) {
    c.save();
    c.fillStyle = 'rgba(74,47,39,0.85)';
    G.rr(c, x - r, y - r * 0.2, r * 2, r * 1.5, r * 0.3); c.fill();
    c.strokeStyle = 'rgba(74,47,39,0.85)'; c.lineWidth = r * 0.35;
    c.beginPath(); c.arc(x, y - r * 0.25, r * 0.6, Math.PI, 0); c.stroke();
    c.restore();
  }

  // ---------- Embroidery motifs (centered at x,y, size s) ----------
  function motif(c, id, x, y, s, light) {
    const img = G.MOTIF_IMG && G.MOTIF_IMG[id];
    if (img) {
      // photo-real embroidery with a soft contact shadow so it sits on the cloth
      const k = s * 1.15;
      c.save();
      c.globalAlpha = 0.35; c.filter = 'brightness(0) blur(2px)';
      c.drawImage(img, x - k / 2 + s * 0.02, y - k / 2 + s * 0.03, k, k);
      c.restore();
      c.drawImage(img, x - k / 2, y - k / 2, k, k);
      return;
    }
    c.save();
    c.translate(x, y);
    c.lineCap = 'round';
    c.lineJoin = 'round';
    const out = light ? 'rgba(90,50,30,0.55)' : 'rgba(255,240,210,0.6)';
    const petalFlower = (bx, by, r, n, col, center, notch) => {
      c.fillStyle = col;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        c.save(); c.translate(bx + Math.cos(a) * r * 0.55, by + Math.sin(a) * r * 0.55); c.rotate(a);
        c.beginPath(); c.ellipse(0, 0, r * 0.55, r * 0.42, 0, 0, 7); c.fill();
        if (notch) { c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(r * 0.45, 0, r * 0.12, 0, 7); c.fill(); c.fillStyle = col; }
        c.restore();
      }
      c.fillStyle = center; c.beginPath(); c.arc(bx, by, r * 0.26, 0, 7); c.fill();
    };
    if (id === 'sen') {
      c.strokeStyle = '#3f7a4a'; c.lineWidth = s * 0.06;
      c.beginPath(); c.moveTo(0, s * 0.2); c.quadraticCurveTo(s * 0.1, s * 0.5, -s * 0.05, s * 0.75); c.stroke();
      c.fillStyle = '#5c9a5a';
      c.beginPath(); c.ellipse(s * 0.28, s * 0.55, s * 0.22, s * 0.09, -0.4, 0, 7); c.fill();
      const pet = [[-0.9, '#f3a6b8'], [-0.45, '#ee8ea6'], [0, '#e8789a'], [0.45, '#ee8ea6'], [0.9, '#f3a6b8']];
      for (const [a, col] of pet) {
        c.save(); c.rotate(a); c.fillStyle = col;
        c.beginPath(); c.ellipse(0, -s * 0.22, s * 0.13, s * 0.3, 0, 0, 7); c.fill();
        c.strokeStyle = out; c.lineWidth = s * 0.02; c.stroke();
        c.restore();
      }
      c.fillStyle = '#f7d36b'; c.beginPath(); c.arc(0, 0.02 * s, s * 0.07, 0, 7); c.fill();
    } else if (id === 'mai' || id === 'dao') {
      const petal = id === 'mai' ? '#f6c945' : '#f6a9bd';
      const ctr = id === 'mai' ? '#e07b26' : '#c2456a';
      c.strokeStyle = '#6b4a32'; c.lineWidth = s * 0.06;
      c.beginPath(); c.moveTo(-s * 0.5, s * 0.45); c.quadraticCurveTo(-s * 0.1, s * 0.1, s * 0.45, -s * 0.2); c.stroke();
      c.lineWidth = s * 0.035;
      c.beginPath(); c.moveTo(-s * 0.15, s * 0.22); c.quadraticCurveTo(-s * 0.25, -s * 0.05, -s * 0.2, -s * 0.3); c.stroke();
      petalFlower(-s * 0.05, s * 0.05, s * 0.22, 5, petal, ctr, id === 'dao');
      petalFlower(s * 0.35, -s * 0.22, s * 0.15, 5, petal, ctr, id === 'dao');
      petalFlower(-s * 0.38, s * 0.3, s * 0.12, 5, petal, ctr, id === 'dao');
      c.fillStyle = petal;
      c.beginPath(); c.ellipse(-s * 0.2, -s * 0.32, s * 0.05, s * 0.07, 0.3, 0, 7); c.fill();
      if (id === 'dao') {
        c.fillStyle = '#6aa860';
        c.beginPath(); c.ellipse(s * 0.15, -s * 0.02, s * 0.1, s * 0.04, -0.6, 0, 7); c.fill();
      }
    } else if (id === 'cuc') {
      for (const [bx, by, r] of [[0, -s * 0.05, s * 0.3], [s * 0.32, s * 0.25, s * 0.18]]) {
        for (let i = 0; i < 22; i++) {
          const a = (i / 22) * Math.PI * 2;
          c.strokeStyle = i % 2 ? '#f2b532' : '#f7cf5a'; c.lineWidth = r * 0.16;
          c.beginPath(); c.moveTo(bx + Math.cos(a) * r * 0.25, by + Math.sin(a) * r * 0.25); c.lineTo(bx + Math.cos(a) * r, by + Math.sin(a) * r); c.stroke();
        }
        c.fillStyle = '#d9822b'; c.beginPath(); c.arc(bx, by, r * 0.25, 0, 7); c.fill();
      }
      c.fillStyle = '#5c9a5a';
      c.beginPath(); c.ellipse(-s * 0.25, s * 0.32, s * 0.2, s * 0.07, 0.6, 0, 7); c.fill();
    } else if (id === 'tre') {
      for (const [ox, h] of [[-0.2, 1], [0.05, 0.85], [0.28, 0.7]]) {
        c.strokeStyle = '#4e8a4f'; c.lineWidth = s * 0.08;
        c.beginPath(); c.moveTo(ox * s, s * 0.5); c.lineTo(ox * s + s * 0.05, s * (0.5 - h)); c.stroke();
        c.strokeStyle = '#2f5f36'; c.lineWidth = s * 0.03;
        for (let k = 1; k < 4; k++) {
          const yy = s * (0.5 - (h * k) / 4);
          c.beginPath(); c.moveTo(ox * s - s * 0.04, yy); c.lineTo(ox * s + s * 0.08, yy); c.stroke();
        }
      }
      c.fillStyle = '#6aa860';
      for (const [lx, ly, a] of [[0.25, -0.3, -0.5], [0.4, -0.2, 0.3], [-0.35, -0.2, -2.6], [0.2, 0.05, 0.6]]) {
        c.beginPath(); c.ellipse(lx * s, ly * s, s * 0.2, s * 0.05, a, 0, 7); c.fill();
      }
    } else if (id === 'buom') {
      const wing = (sx, sy, rx, ry, a, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(sx, sy, rx, ry, a, 0, 7); c.fill(); };
      const c1 = light ? '#6d5bb8' : '#9fd3f0', c2 = light ? '#4a8fc9' : '#f2b7d0';
      wing(-s * 0.2, -s * 0.12, s * 0.22, s * 0.15, -0.5, c1); wing(s * 0.2, -s * 0.12, s * 0.22, s * 0.15, 0.5, c1);
      wing(-s * 0.15, s * 0.14, s * 0.14, s * 0.11, 0.5, c2); wing(s * 0.15, s * 0.14, s * 0.14, s * 0.11, -0.5, c2);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * s * 0.24, -s * 0.14, s * 0.04, 0, 7); c.fill(); }
      c.fillStyle = '#3a2a22'; c.beginPath(); c.ellipse(0, 0, s * 0.035, s * 0.2, 0, 0, 7); c.fill();
      c.strokeStyle = '#3a2a22'; c.lineWidth = s * 0.015;
      c.beginPath(); c.moveTo(0, -s * 0.18); c.quadraticCurveTo(-s * 0.05, -s * 0.3, -s * 0.1, -s * 0.32); c.moveTo(0, -s * 0.18); c.quadraticCurveTo(s * 0.05, -s * 0.3, s * 0.1, -s * 0.32); c.stroke();
    } else if (id === 'en') {
      const bird = (bx, by, k, a) => {
        c.save(); c.translate(bx, by); c.rotate(a); c.scale(k, k);
        c.fillStyle = light ? '#2b3550' : '#f4efe6';
        c.beginPath();
        c.moveTo(-s * 0.4, -s * 0.1); c.quadraticCurveTo(-s * 0.1, -s * 0.05, 0, 0);
        c.quadraticCurveTo(s * 0.1, -s * 0.05, s * 0.4, -s * 0.12);
        c.quadraticCurveTo(s * 0.12, s * 0.06, s * 0.05, s * 0.08);
        c.lineTo(s * 0.12, s * 0.3); c.lineTo(0, s * 0.14); c.lineTo(-s * 0.12, s * 0.3); c.lineTo(-s * 0.05, s * 0.08);
        c.quadraticCurveTo(-s * 0.12, s * 0.06, -s * 0.4, -s * 0.1);
        c.fill();
        c.fillStyle = '#d2483d'; c.beginPath(); c.arc(0, -s * 0.03, s * 0.03, 0, 7); c.fill();
        c.restore();
      };
      bird(-s * 0.12, -s * 0.12, 0.9, -0.2); bird(s * 0.25, s * 0.22, 0.6, 0.15);
    } else if (id === 'may') {
      c.strokeStyle = light ? '#b8862a' : '#f0cf7a'; c.lineWidth = s * 0.05;
      const curl = (bx, by, r, dir) => {
        c.beginPath();
        for (let i = 0; i <= 30; i++) {
          const a = (i / 30) * Math.PI * 2.2 * dir, rr = r * (1 - i / 40);
          const px = bx + Math.cos(a) * rr, py = by + Math.sin(a) * rr;
          i ? c.lineTo(px, py) : c.moveTo(px, py);
        }
        c.stroke();
      };
      curl(-s * 0.2, 0, s * 0.18, 1); curl(s * 0.15, -s * 0.08, s * 0.14, -1); curl(s * 0.38, s * 0.06, s * 0.09, 1);
      c.beginPath(); c.moveTo(-s * 0.45, s * 0.2); c.bezierCurveTo(-s * 0.2, s * 0.32, s * 0.15, s * 0.12, s * 0.48, s * 0.22); c.stroke();
    } else if (id === 'hac') {
      c.fillStyle = '#fbfaf5'; c.strokeStyle = 'rgba(60,40,30,0.5)'; c.lineWidth = s * 0.02;
      c.beginPath(); c.moveTo(-s * 0.05, 0); c.quadraticCurveTo(-s * 0.4, -s * 0.5, -s * 0.6, -s * 0.35); c.quadraticCurveTo(-s * 0.35, -s * 0.05, -s * 0.05, s * 0.08); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(s * 0.05, 0); c.quadraticCurveTo(s * 0.35, -s * 0.55, s * 0.55, -s * 0.45); c.quadraticCurveTo(s * 0.35, -s * 0.05, s * 0.05, s * 0.08); c.fill(); c.stroke();
      c.fillStyle = '#2b2422';
      c.beginPath(); c.moveTo(-s * 0.6, -s * 0.35); c.lineTo(-s * 0.48, -s * 0.36); c.lineTo(-s * 0.52, -s * 0.28); c.fill();
      c.beginPath(); c.moveTo(s * 0.55, -s * 0.45); c.lineTo(s * 0.43, -s * 0.44); c.lineTo(s * 0.47, -s * 0.36); c.fill();
      c.fillStyle = '#fbfaf5';
      c.beginPath(); c.ellipse(0, s * 0.08, s * 0.12, s * 0.2, 0.2, 0, 7); c.fill(); c.stroke();
      c.strokeStyle = '#fbfaf5'; c.lineWidth = s * 0.05;
      c.beginPath(); c.moveTo(s * 0.05, -s * 0.05); c.quadraticCurveTo(s * 0.12, -s * 0.3, s * 0.02, -s * 0.38); c.stroke();
      c.fillStyle = '#d23a3a'; c.beginPath(); c.arc(s * 0.02, -s * 0.4, s * 0.04, 0, 7); c.fill();
      c.strokeStyle = '#3a2a22'; c.lineWidth = s * 0.02;
      c.beginPath(); c.moveTo(-s * 0.02, s * 0.28); c.lineTo(-s * 0.1, s * 0.55); c.moveTo(s * 0.04, s * 0.28); c.lineTo(s * 0.02, s * 0.55); c.stroke();
    } else if (id === 'trongdong') {
      const g = light ? '#a87420' : '#ecc35e';
      c.strokeStyle = g; c.fillStyle = g;
      for (const [r, w] of [[0.48, 0.035], [0.4, 0.02], [0.24, 0.02]]) { c.lineWidth = s * w; c.beginPath(); c.arc(0, 0, s * r, 0, 7); c.stroke(); }
      c.beginPath();
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2, rr = i % 2 ? s * 0.07 : s * 0.2;
        c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      c.closePath(); c.fill();
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        c.save(); c.translate(Math.cos(a) * s * 0.32, Math.sin(a) * s * 0.32); c.rotate(a + Math.PI / 2);
        c.beginPath(); c.moveTo(-s * 0.04, 0); c.lineTo(0, -s * 0.04); c.lineTo(s * 0.06, s * 0.01); c.lineTo(0, s * 0.02); c.closePath(); c.fill();
        c.restore();
      }
    } else if (id === 'phuong') {
      c.lineWidth = s * 0.05;
      const cols = ['#e2483d', '#f2a33a', '#f6d26b'];
      for (let i = 0; i < 3; i++) {
        c.strokeStyle = cols[i];
        c.beginPath();
        c.moveTo(-s * 0.05, 0);
        c.bezierCurveTo(-s * 0.3, s * (0.2 + i * 0.1), s * (0.1 - i * 0.15), s * 0.55, s * (0.45 - i * 0.2), s * (0.45 + i * 0.05));
        c.stroke();
        c.beginPath(); c.arc(s * (0.45 - i * 0.2), s * (0.45 + i * 0.05), s * 0.06, 0, 7); c.fillStyle = cols[i]; c.fill();
      }
      c.fillStyle = '#e2483d';
      c.beginPath(); c.ellipse(0, -s * 0.05, s * 0.14, s * 0.1, -0.5, 0, 7); c.fill();
      c.fillStyle = '#f2a33a';
      c.beginPath(); c.moveTo(-s * 0.05, -s * 0.1); c.quadraticCurveTo(-s * 0.35, -s * 0.45, -s * 0.5, -s * 0.15); c.quadraticCurveTo(-s * 0.25, -s * 0.15, -s * 0.05, -s * 0.02); c.fill();
      c.fillStyle = '#e2483d';
      c.beginPath(); c.arc(s * 0.15, -s * 0.2, s * 0.07, 0, 7); c.fill();
      c.strokeStyle = '#f6d26b'; c.lineWidth = s * 0.025;
      c.beginPath(); c.moveTo(s * 0.17, -s * 0.27); c.lineTo(s * 0.12, -s * 0.38); c.moveTo(s * 0.2, -s * 0.26); c.lineTo(s * 0.22, -s * 0.37); c.stroke();
      c.fillStyle = '#f2a33a'; c.beginPath(); c.moveTo(s * 0.22, -s * 0.2); c.lineTo(s * 0.3, -s * 0.18); c.lineTo(s * 0.22, -s * 0.15); c.fill();
    } else if (id === 'rong') {
      const gold = '#e7b545', dark = '#a8701c';
      const pts = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        pts.push({ x: -s * 0.45 + t * s * 0.85, y: Math.sin(t * Math.PI * 2.2) * s * 0.18 + (t - 0.5) * s * 0.1 });
      }
      c.strokeStyle = dark; c.lineWidth = s * 0.13;
      c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
      c.strokeStyle = gold; c.lineWidth = s * 0.1; c.stroke();
      c.strokeStyle = dark; c.lineWidth = s * 0.012;
      for (let i = 2; i < 38; i += 3) { const p = pts[i]; c.beginPath(); c.arc(p.x, p.y + s * 0.01, s * 0.03, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }
      // spines
      c.fillStyle = '#d2483d';
      for (let i = 4; i < 36; i += 4) { const p = pts[i]; c.beginPath(); c.moveTo(p.x - s * 0.02, p.y - s * 0.04); c.lineTo(p.x, p.y - s * 0.1); c.lineTo(p.x + s * 0.025, p.y - s * 0.04); c.fill(); }
      const h = pts[40];
      c.fillStyle = gold; c.beginPath(); c.ellipse(h.x + s * 0.04, h.y - s * 0.02, s * 0.1, s * 0.07, -0.3, 0, 7); c.fill();
      c.strokeStyle = dark; c.lineWidth = s * 0.015; c.stroke();
      c.strokeStyle = gold; c.lineWidth = s * 0.02;
      c.beginPath(); c.moveTo(h.x, h.y - s * 0.07); c.quadraticCurveTo(h.x - s * 0.05, h.y - s * 0.18, h.x - s * 0.12, h.y - s * 0.16); c.stroke();
      c.beginPath(); c.moveTo(h.x + s * 0.12, h.y); c.quadraticCurveTo(h.x + s * 0.2, h.y + s * 0.08, h.x + s * 0.12, h.y + s * 0.14); c.stroke();
      c.fillStyle = '#2b1d18'; c.beginPath(); c.arc(h.x + s * 0.06, h.y - s * 0.04, s * 0.015, 0, 7); c.fill();
      c.fillStyle = '#f6d26b'; c.beginPath(); c.arc(h.x + s * 0.2, h.y - s * 0.1, s * 0.05, 0, 7); c.fill();
      // tail
      const t0 = pts[0];
      c.fillStyle = gold; c.beginPath(); c.moveTo(t0.x, t0.y); c.lineTo(t0.x - s * 0.1, t0.y - s * 0.08); c.lineTo(t0.x - s * 0.06, t0.y + s * 0.06); c.fill();
    }
    c.restore();
  }

  // repeating border pattern along an edge (call inside a clip to the garment)
  function borderAlong(c, pts, id, s, light) {
    if (!pts || !id || id === 'none' || pts.length < 2) return;
    const step = 2.6 * s;
    const P = G.geo.resample(pts, step, false);
    const col = light ? '#9c2f3c' : '#ecc35e';
    const col2 = light ? '#b8862a' : '#fbf1d6';
    c.save();
    c.lineCap = 'round';
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[Math.min(P.length - 1, i + 1)], pa = P[Math.max(0, i - 1)];
      const ang = Math.atan2(b.y - pa.y, b.x - pa.x);
      c.save(); c.translate(a.x, a.y); c.rotate(ang);
      c.translate(0, -1.9 * s * (ang > Math.PI / 2 || ang < -Math.PI / 2 ? -1 : 1));
      if (id === 'song') {
        c.strokeStyle = col; c.lineWidth = 0.32 * s;
        c.beginPath(); c.arc(0, 0.5 * s, 1.1 * s, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
        c.strokeStyle = col2; c.lineWidth = 0.18 * s;
        c.beginPath(); c.arc(0, 0.6 * s, 0.55 * s, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      } else if (id === 'hoanhi') {
        c.fillStyle = i % 2 ? col : col2;
        for (let p = 0; p < 5; p++) { const q = (p / 5) * Math.PI * 2; c.beginPath(); c.arc(Math.cos(q) * 0.45 * s, Math.sin(q) * 0.45 * s, 0.32 * s, 0, 7); c.fill(); }
      } else if (id === 'kyha') {
        c.strokeStyle = col; c.lineWidth = 0.25 * s;
        if (i % 2) { c.beginPath(); c.moveTo(-0.9 * s, 0); c.lineTo(0, -0.9 * s); c.lineTo(0.9 * s, 0); c.lineTo(0, 0.9 * s); c.closePath(); c.stroke(); }
        else { c.fillStyle = col2; c.beginPath(); c.arc(0, 0, 0.3 * s, 0, 7); c.fill(); }
      } else if (id === 'trongdong') {
        c.strokeStyle = col; c.lineWidth = 0.2 * s;
        c.beginPath(); c.arc(0, 0, 0.9 * s, 0, 7); c.stroke();
        c.fillStyle = col2; c.beginPath(); c.arc(0, 0, 0.35 * s, 0, 7); c.fill();
      }
      c.restore();
    }
    // framing lines
    c.strokeStyle = col; c.lineWidth = 0.18 * s; c.globalAlpha = 0.8;
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
    c.restore();
  }

  // ---------- Customer ----------
  function customer(c, x, y, look, sc, mood) {
    c.save();
    c.translate(x, y);
    c.scale(sc, sc);
    const outfit = G.DATA.colors[look.outfit].hex;
    c.fillStyle = outfit;
    c.beginPath();
    c.moveTo(-70, 0); c.quadraticCurveTo(-68, -110, -40, -130); c.lineTo(40, -130); c.quadraticCurveTo(68, -110, 70, 0);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.08)';
    c.beginPath(); c.moveTo(-14, -128); c.quadraticCurveTo(10, -90, 50, -95); c.lineTo(40, -130); c.closePath(); c.fill();
    c.fillStyle = '#e9c46a';
    for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(4 + i * 10, -122 + i * 7, 2.5, 0, 7); c.fill(); }
    c.fillStyle = mix(outfit, '#000000', 0.15);
    G.rr(c, -18, -142, 36, 16, 5); c.fill();
    c.fillStyle = look.skin;
    c.fillRect(-10, -152, 20, 14);
    c.fillStyle = look.old ? '#9d958f' : look.hairC;
    if (look.hair === 'long') { G.rr(c, -46, -230, 92, 150, 40); c.fill(); }
    c.fillStyle = look.skin;
    c.beginPath(); c.ellipse(0, -192, 38, 44, 0, 0, 7); c.fill();
    c.fillStyle = look.old ? '#9d958f' : look.hairC;
    c.beginPath(); c.ellipse(0, -214, 41, 28, 0, Math.PI, 0); c.fill();
    c.beginPath(); c.moveTo(-41, -214); c.quadraticCurveTo(-10, -200, 8, -222); c.quadraticCurveTo(20, -200, 41, -214); c.fill();
    if (look.hair === 'bun') { c.beginPath(); c.arc(0, -250, 18, 0, 7); c.fill(); }
    if (look.hair === 'short') { c.beginPath(); c.ellipse(-36, -196, 9, 22, 0.1, 0, 7); c.ellipse(36, -196, 9, 22, -0.1, 0, 7); c.fill(); }
    c.fillStyle = '#2b1d18';
    const blink = (performance.now() / 1000) % 4 < 0.12;
    if (blink) { c.fillRect(-17, -191, 10, 2); c.fillRect(7, -191, 10, 2); }
    else { c.beginPath(); c.arc(-12, -190, 3.6, 0, 7); c.arc(12, -190, 3.6, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(232,110,120,0.35)';
    c.beginPath(); c.arc(-22, -176, 7, 0, 7); c.arc(22, -176, 7, 0, 7); c.fill();
    c.strokeStyle = '#8a3b3b'; c.lineWidth = 2.5; c.lineCap = 'round';
    c.beginPath();
    if (mood === 'happy') c.arc(0, -174, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    else if (mood === 'sad') c.arc(0, -162, 8, 1.2 * Math.PI, 1.8 * Math.PI);
    else { c.moveTo(-6, -170); c.quadraticCurveTo(0, -166, 6, -170); }
    c.stroke();
    if (look.glasses) {
      c.strokeStyle = '#4a3a33'; c.lineWidth = 2;
      c.beginPath(); c.arc(-12, -190, 9, 0, 7); c.moveTo(21, -190); c.arc(12, -190, 9, 0, 7); c.moveTo(-3, -190); c.lineTo(3, -190); c.stroke();
    }
    if (look.hat) {
      c.fillStyle = '#e7cf94';
      c.beginPath(); c.moveTo(-70, -222); c.lineTo(0, -282); c.lineTo(70, -222); c.quadraticCurveTo(0, -212, -70, -222); c.fill();
      c.strokeStyle = 'rgba(140,100,40,0.5)'; c.lineWidth = 1.5;
      for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-70 * i / 4, -222 - 60 * (1 - i / 4)); c.lineTo(70 * i / 4, -222 - 60 * (1 - i / 4)); c.stroke(); }
    }
    c.restore();
  }

  // ---------- Garment (cm units; caller sets transform) ----------
  // fab: {mat,color,print}; o: {motifs, border, mannequin, trousers, buttons, still, t, noSheen}
  function garment(c, asm, fabIn, o) {
    o = o || {};
    // per-part fabrics: {than, tay, co, quan}; a single fabric object means the whole outfit
    const FB = fabIn.than ? fabIn : { than: fabIn, tay: fabIn, co: fabIn, quan: null };
    const fab = FB.than, fTay = FB.tay || fab, fCo = FB.co || fab, fQuan = FB.quan;
    const s = asm.s, d = asm.design, ST = G.DATA.style;
    HEAD_DY = asm.manBody ? 3.2 * s : 0;
    const tile = 18 * s;
    const F = fabric(fab.mat, fab.color, fab.print);
    const basePrint = F.placement ? 'tron' : fab.print;
    const light = G.tex.lum(F.hex) > 0.6;
    const t = o.t !== undefined ? o.t : performance.now() / 1000;
    const amp = o.still ? 0 : 1.3 * s;
    const sy = asm.slitY, hy = asm.hemY;
    // Panels below the slit: gentle sway, soft godet waves along the hem (each wave sits under a
    // fold), and for floor-length dresses the hem pools on the floor and the back panel trails.
    const hb = asm._hb || (asm._hb = G.geo.bounds(asm.hemLine).w / 2);
    const lam = (2 * hb) / 4.5;
    const pool = d.length === 'got' && d.hem !== 'kep';
    const swF = (ph, opt) => (p) => {
      if (p.y <= sy) return p;
      const u = Math.min(1, (p.y - sy) / (hy - sy)), k = Math.pow(u, 1.4);
      let x = p.x + amp * k * Math.sin(t * 1.3 + ph + p.y * 0.03 / s), y = p.y;
      if (pool && u > 0.8) { const q = (u - 0.8) / 0.2, q2 = q * q; x *= 1 + opt.flare * q2; y += opt.drop * s * q2; }
      y += opt.wave * s * Math.pow(u, 14) * Math.cos((2 * Math.PI * x) / (lam * (opt.lamK || 1)) + opt.wph);
      return { x, y };
    };
    // a men's áo dài hangs straight: no godet waves, the back panel stays close behind
    const mk = asm.male ? 0 : 1;
    const sw = swF(0, { flare: 0.07, drop: 1.2, wave: 1.3 * mk, wph: 0 });
    const swB0 = swF(1.6, { flare: 0.1, drop: 6, wave: 0.9 * mk, wph: Math.PI, lamK: 1.7 });
    // the back panel peeks just past the front one and pools into a short train (kept slim: the silhouette must stay long and narrow)
    const swB = (p) => {
      if (p.y <= sy) return swB0(p);
      const u = (p.y - sy) / (hy - sy);
      const spread = Math.sign(p.x) * (asm.male ? 1 : 2) * s * Math.pow(Math.min(1, u * 4), 0.6);
      return swB0({ x: p.x * (1 + 0.04 * u) + spread, y: p.y + 4 * s * Math.pow(u, 3) });
    };
    // densify outlines once so the hem waves stay smooth instead of zig-zagging
    if (!asm._dense) {
      const R = (p, closed) => (p ? G.geo.resample(p, 0.9 * s, closed) : p);
      asm._dense = { body: R(asm.body, true), back: R(asm.back, true), hemLine: R(asm.hemLine), slitR: R(asm.slitR), slitL: R(asm.slitL) };
    }
    const DN = asm._dense;
    const body = DN.body.map(sw);
    const back = DN.back.map(swB);
    const accentHex = G.DATA.colors[d.accent] ? G.DATA.colors[d.accent].hex : '#e2b23c';
    const trimHex = d.trim !== 'none' && ST.trim.opts[d.trim] ? ST.trim.opts[d.trim].hex : null;
    const pantsHex = d.pants === 'cungmau' ? mix(F.hex, '#000000', 0.08) : d.pants === 'phoi' ? accentHex : (ST.pants.opts[d.pants] || ST.pants.opts.trang).hex;
    // soft edges instead of hard cut-paper outlines
    const outline = (w) => { c.strokeStyle = 'rgba(43,29,24,0.13)'; c.lineWidth = (w || 0.3) * s; c.stroke(); };
    const hq = !o.noSheen;
    // ngũ thân (cut-in-one) and the men's set-in cut have no raglan line between shoulder and body
    const noRaglan = d.fit === 'nguthan' || d.fit === 'namom';
    const innerShade = (poly, k, below) => {
      c.save(); pathPoly(c, poly); c.clip();
      if (below !== undefined) { c.beginPath(); c.rect(-40 * s, below, 80 * s, 400 * s); c.clip(); }
      if (hq) c.filter = 'blur(3px)';
      c.strokeStyle = `rgba(30,15,10,${0.2 * (k || 1)})`; c.lineWidth = 2.6 * s; pathPoly(c, poly); c.stroke();
      c.restore();
    };
    const fillMain = (poly) => { pathPoly(c, poly); fillFabric(c, fab.mat, fab.color, tile, basePrint); };
    const floor = asm.floorY || 152 * s;
    const W = 24 * s;

    if (o.mannequin) {
      const fs = c.createRadialGradient(0, floor + 1 * s, 0, 0, floor + 1 * s, 26 * s);
      fs.addColorStop(0, 'rgba(40,20,10,0.25)'); fs.addColorStop(1, 'rgba(40,20,10,0)');
      c.fillStyle = fs; c.beginPath(); c.ellipse(0, floor + 1 * s, 26 * s, 5 * s, 0, 0, 7); c.fill();
      modelBack(c, s, d, floor, asm);
    }
    // ----- bottoms -----
    if (o.trousers !== false) {
      c.save(); c.scale(asm.mx || 1, 1);
      drawBottom(c, d.bottom, s, sy, floor, pantsHex, outline, t, amp, fQuan ? () => fillFabric(c, fQuan.mat, fQuan.color, tile, fQuan.print) : null);
      c.restore();
    }
    // the player's own picture of the dress replaces the drawn áo (points and pattern stay the game's)
    if (d.skin && G.skins && G.skins.draw(c, asm, fab, d.skinMode, tile)) { drawTop(); return; }
    // inner layer (two-layer ao dai) and double tà peek below the hem / through the slits
    if (d.layer === 'hai' || d.hem === 'kep') {
      // tà kép: the outer tà stops at mid-calf and a full-length inner tà in the accent colour falls below it
      const kep = d.hem === 'kep', ext = kep ? 30 : 6, widen = kep ? 0.12 : 0.05;
      const inner = asm.body.map((p) => {
        if (p.y <= sy) return p;
        const k = (p.y - sy) / (hy - sy);
        return swB({ x: p.x * (1 + widen * k), y: p.y + ext * s * k });
      });
      pathPoly(c, inner);
      fillFabric(c, fab.mat, d.accent, tile, 'tron'); c.fillStyle = kep ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.1)'; c.fill();
      if (kep) {
        c.save(); pathPoly(c, inner); c.clip();
        const ig = c.createLinearGradient(-W, 0, W, 0);
        ig.addColorStop(0, 'rgba(0,0,0,0.22)'); ig.addColorStop(0.3, 'rgba(255,255,255,0.08)'); ig.addColorStop(0.7, 'rgba(0,0,0,0.04)'); ig.addColorStop(1, 'rgba(0,0,0,0.24)');
        c.fillStyle = ig; c.fillRect(-W * 1.5, sy, W * 3, hy + ext * s);
        // soft vertical folds of the inner tà, below the outer one
        if (hq) c.filter = 'blur(1.5px)';
        for (let n = -6; n <= 6; n++) {
          const x0 = n * lam * 0.32, x1 = n * lam * 0.42;
          c.strokeStyle = n % 2 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.18)'; c.lineWidth = (n % 2 ? 1.6 : 1) * s;
          c.beginPath(); c.moveTo(x0, hy - 6 * s); c.lineTo(x1, hy + ext * s); c.stroke();
        }
        c.restore();
      }
      outline(0.25);
    }
    // back panel peeking through slits
    fillMain(back);
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill(); outline();
    // an open neckline (round, V, square, boat…) shows the wearer's skin, not the inside of the back panel
    if (o.mannequin && !asm.bare && asm.nd > 3 * s && asm.neckFront) {
      const nf = asm.neckFront, x0 = nf[0].x, x1 = nf[nf.length - 1].x;
      c.save();
      c.beginPath(); c.moveTo(x0, -1.2 * s);
      for (const p of nf) c.lineTo(p.x, p.y);
      c.lineTo(x1, -1.2 * s); c.closePath();
      const kg = c.createLinearGradient(x0, 0, x1, 0);
      kg.addColorStop(0, '#dcb391'); kg.addColorStop(0.45, '#f6dac0'); kg.addColorStop(1, '#d9ae8b');
      c.fillStyle = kg; c.fill();
      c.clip();
      // collarbones and the back neckline's shadow give the opening depth
      c.strokeStyle = 'rgba(150,95,60,0.28)'; c.lineWidth = 0.35 * s; c.lineCap = 'round';
      for (const m of [-1, 1]) { c.beginPath(); c.moveTo(m * 1.4 * s, 3.4 * s); c.quadraticCurveTo(m * 4.5 * s, 2.4 * s, m * 8.5 * s, 2.8 * s); c.stroke(); }
      const sg = c.createLinearGradient(0, -1.2 * s, 0, 2.6 * s);
      sg.addColorStop(0, 'rgba(90,40,20,0.35)'); sg.addColorStop(1, 'rgba(90,40,20,0)');
      c.fillStyle = sg; c.fillRect(x0, -1.2 * s, x1 - x0, 3.8 * s);
      c.restore();
    }

    // ----- sleeves -----
    const sleeveAccent = d.twotone === 'tay' || d.twotone === 'tayco';
    for (const [sl, m, band] of [[asm.sleeveL, -1, asm.bandL], [asm.sleeveR, 1, asm.bandR]]) {
      if (!sl) continue;
      pathPoly(c, sl);
      c.save();
      if (asm.sheerSleeves) c.globalAlpha = 0.55;
      if (sleeveAccent) fillFabric(c, fab.mat, d.accent, tile, 'tron');
      else fillFabric(c, asm.sheerSleeves ? 'voan' : fTay.mat, fTay.color, tile, asm.sheerSleeves ? 'tron' : fTay.print);
      c.restore();
      const b = G.geo.bounds(sl);
      const g = c.createLinearGradient(m > 0 ? b.x + b.w : b.x, b.y, m > 0 ? b.x : b.x + b.w, b.y + b.h * 0.3);
      g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(0.45, 'rgba(0,0,0,0.02)'); g.addColorStop(1, noRaglan ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.24)');
      pathPoly(c, sl); c.fillStyle = g; c.fill();
      // elbow creases where the sleeve bends
      if (['dai', 'voan', 'bong', 'loe'].includes(d.sleeve)) {
        const ang = (15 * Math.PI) / 180, dv = { x: m * Math.sin(ang), y: Math.cos(ang) }, nv = { x: -m * Math.cos(ang), y: Math.sin(ang) };
        const E = { x: m * 15.6 * s + dv.x * 29 * s, y: asm.SY(7.4 * s + dv.y * 29 * s) };
        c.save(); pathPoly(c, sl); c.clip(); if (hq) c.filter = 'blur(1.5px)';
        c.lineCap = 'round';
        for (let k = -1; k <= 1; k++) {
          const p0 = { x: E.x + dv.x * k * 2.2 * s + nv.x * 1 * s, y: E.y + dv.y * k * 2.2 * s + nv.y * 1 * s };
          const p1 = { x: p0.x + nv.x * 5 * s, y: p0.y + nv.y * 5 * s };
          c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 0.55 * s;
          c.beginPath(); c.moveTo(p0.x, p0.y); c.quadraticCurveTo((p0.x + p1.x) / 2 + dv.x * 1.2 * s, (p0.y + p1.y) / 2 + dv.y * 1.2 * s, p1.x, p1.y); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 0.4 * s;
          c.beginPath(); c.moveTo(p0.x + dv.x * 0.7 * s, p0.y + dv.y * 0.7 * s); c.quadraticCurveTo((p0.x + p1.x) / 2 + dv.x * 1.9 * s, (p0.y + p1.y) / 2 + dv.y * 1.9 * s, p1.x + dv.x * 0.7 * s, p1.y + dv.y * 0.7 * s); c.stroke();
        }
        c.restore();
      }
      // ngũ thân: the sleeve join part-way down the arm
      const joinSeam = asm.seams.find((sm) => /^(Nối tay|Vòng nách) /.test(sm.name) && sm.name.endsWith(m > 0 ? 'phải' : 'trái'));
      if (joinSeam) {
        c.save(); pathPoly(c, sl); c.clip(); c.lineCap = 'round';
        for (const [w, a] of [[1.8, 0.1], [0.4, 0.34]]) { c.strokeStyle = `rgba(0,0,0,${a})`; c.lineWidth = w * s; pathPoly(c, joinSeam.pts, false); c.stroke(); }
        c.translate(0, 0.55 * s); c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 0.3 * s; pathPoly(c, joinSeam.pts, false); c.stroke();
        c.restore();
      }
      // cut-in-one sleeve (ngũ thân): no edge shading along the old raglan line, so shoulder and sleeve read as one cloth
      const cutInOne = noRaglan;
      const awayFromRaglan = () => {
        const A = { x: m * asm.nx, y: 0 }, Uu = { x: m * 13.6 * s * (asm.mx || 1), y: 18 * s };
        const dx = Uu.x - A.x, dy = Uu.y - A.y, l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = m * uy, ny = -m * ux, off = 2.6 * s;
        const P = (p, a, b) => ({ x: p.x + ux * a + nx * b, y: p.y + uy * a + ny * b });
        const pts = [P(A, -8 * s, off), P(Uu, 8 * s, off), P(Uu, 8 * s, 200 * s), P(A, -8 * s, 200 * s)];
        c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.closePath(); c.clip();
      };
      if (cutInOne) { c.save(); awayFromRaglan(); innerShade(sl, 0.8); c.restore(); } else innerShade(sl, 0.8);
      c.save(); pathPoly(c, sl); c.clip(); if (cutInOne) awayFromRaglan();
      if (F.placement && (F.placement.id === 'ombre' || F.placement.id === 'tiedye')) F.placement.draw(c, asm, F.pal, s, (p) => p, accentHex);
      c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 1.2 * s; pathPoly(c, sl); c.stroke();
      c.restore();
      if (band) {
        c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.5 * s;
        c.beginPath(); c.moveTo(band[0].x, band[0].y); c.lineTo(band[1].x, band[1].y); c.stroke();
        c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.25 * s;
        for (let i = 1; i < 5; i++) {
          const px = band[0].x + (band[1].x - band[0].x) * i / 5, py = band[0].y + (band[1].y - band[0].y) * i / 5;
          c.beginPath(); c.moveTo(px, py); c.lineTo(px + m * 1.2 * s, py - 4 * s); c.stroke();
        }
      }
      pathPoly(c, sl); outline();
    }

    // ----- body -----
    fillMain(body);
    c.save();
    pathPoly(c, body); c.clip();
    const b = asm.bounds;
    let g = c.createLinearGradient(-W, 0, W, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.28)'); g.addColorStop(0.28, 'rgba(255,255,255,0.08)'); g.addColorStop(0.55, 'rgba(255,255,255,0.02)'); g.addColorStop(0.8, 'rgba(0,0,0,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.32)');
    c.fillStyle = g; c.fillRect(-W, -12 * s, W * 2, sy + 12 * s);
    // the body's roundness fades out into the hanging panels (no hard line at the slit)
    for (let k = 0; k < 8; k++) { c.globalAlpha = 1 - (k + 1) / 9; c.fillRect(-W, sy + k * 1.5 * s, W * 2, 1.5 * s); }
    c.globalAlpha = 1;
    // bust volume and under-bust shadow (men's cut is flat and straight)
    if (!asm.manBody) for (const m of [-1, 1]) {
      const rg = c.createRadialGradient(m * 7.5 * s, 23 * s, 0, m * 7.5 * s, 23 * s, 8.5 * s);
      rg.addColorStop(0, 'rgba(255,255,255,0.06)'); rg.addColorStop(0.7, 'rgba(255,255,255,0.01)'); rg.addColorStop(1, 'rgba(0,0,0,0.02)');
      c.fillStyle = rg; c.fillRect(-W, 10 * s, 2 * W, 30 * s);
    }
    const fitted = d.fit !== 'nam' && !(d.male && d.fit === 'nguthan');
    if (fitted) {
      const wg = c.createLinearGradient(0, 30 * s, 0, 46 * s);
      wg.addColorStop(0, 'rgba(0,0,0,0)'); wg.addColorStop(0.5, 'rgba(0,0,0,0.08)'); wg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = wg; c.fillRect(-W, 30 * s, 2 * W, 16 * s);
    } else {
      // a straight cut hangs from the bust: a soft drape shadow falls straight down instead of a waist
      for (const m of [-1, 1]) {
        const dg = c.createLinearGradient(m * 9 * s, 0, m * 14 * s, 0);
        dg.addColorStop(0, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,0.07)');
        c.fillStyle = dg; c.fillRect(m > 0 ? 9 * s : -14 * s, 24 * s, 5 * s, sy - 24 * s);
      }
    }
    // ngũ thân: the centre-front seam where the two front panels meet
    if (d.fit === 'nguthan') {
      c.save(); c.lineCap = 'round';
      const y0 = (asm.nd || 2.5 * s) + 0.5 * s;
      c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 0.35 * s; c.beginPath(); c.moveTo(0, y0); c.lineTo(0, hy - 1 * s); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 0.3 * s; c.beginPath(); c.moveTo(0.4 * s, y0); c.lineTo(0.4 * s, hy - 1 * s); c.stroke();
      c.restore();
    }
    // princess seams: shaped darts from the bust down to the waist, flowing into the panel (fitted cut only)
    if (d.fit === 'om' && !asm.manBody) {
      c.save(); c.lineCap = 'round';
      for (const m of [-1, 1]) {
        const pts = [{ x: m * 7.6 * s, y: 17 * s }, { x: m * 7.2 * s, y: 26 * s }, { x: m * 5.6 * s, y: asm.SY(38 * s) }, { x: m * 6.2 * s, y: sy }];
        const path = () => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); c.bezierCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[3].x, pts[3].y); };
        path(); c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 0.32 * s; c.stroke();
        c.save(); c.translate(-m * 0.35 * s, 0); path(); c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 0.3 * s; c.stroke(); c.restore();
      }
      c.restore();
    }
    // ambient occlusion along the raglan/shoulder seams
    c.lineCap = 'round';
    for (const sm of asm.seams.slice(0, 2)) {
      for (const [w, a] of [[2.4, 0.06], [1.2, 0.08]]) { c.strokeStyle = `rgba(0,0,0,${a})`; c.lineWidth = w * s; pathPoly(c, sm.pts, false); c.stroke(); }
    }
    // flap drape folds
    g = c.createLinearGradient(-W, 0, W, 0);
    const folds = [[0, 0.3], [0.12, -0.07], [0.24, 0.1], [0.38, -0.11], [0.5, 0.04], [0.62, -0.11], [0.76, 0.1], [0.88, -0.07], [1, 0.34]];
    const ph = Math.sin(t * 1.3) * 0.015;
    for (const [p, v] of folds) g.addColorStop(G.clamp(p + (p > 0 && p < 1 ? ph : 0), 0, 1), v > 0 ? `rgba(0,0,0,${v})` : `rgba(255,255,255,${-v})`);
    // fan folds: they spring from the waist and widen toward the hem, landing exactly on the hem
    // waves — ridges (light) where the hem dips, valleys (shadow) where it lifts
    c.save(); c.lineCap = 'round';
    const foldPass = (blur, scaleW, alphaK) => {
      if (hq) c.filter = `blur(${blur}px)`;
      for (let n = -9; n <= 9; n++) {
        const xh = (n * lam) / 2;
        if (Math.abs(xh) > hb * 0.92) continue;
        const ridge = n % 2 === 0;
        const a = sw({ x: xh * 0.3, y: sy + 2 * s }), mid = sw({ x: xh * 0.62, y: sy + (hy - sy) * 0.55 }), e = sw({ x: xh, y: hy - 0.5 * s });
        const fade = c.createLinearGradient(0, a.y, 0, e.y);
        const col = ridge ? '255,255,255' : '20,10,8', base = (ridge ? 0.17 : 0.2) * alphaK;
        fade.addColorStop(0, `rgba(${col},0)`); fade.addColorStop(0.35, `rgba(${col},${base * 0.6})`); fade.addColorStop(1, `rgba(${col},${base})`);
        c.strokeStyle = fade; c.lineWidth = (ridge ? 1.4 : 2.4) * s * scaleW;
        c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(mid.x, mid.y, e.x, e.y); c.stroke();
      }
    };
    foldPass(6, 1.8, 0.8);
    foldPass(2, 0.7, 1);
    c.restore();
    if (d.hem === 'xoe') {
      // knife pleats fanning from the hip to the hem: a shadow line and a lit edge per pleat
      const hwX = hb / s;
      for (let i = -8; i <= 8; i++) {
        const top = sw({ x: i * 1.3 * s, y: sy + 8 * s }), bot = sw({ x: (i / 8.5) * hwX * s, y: hy });
        c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 0.7 * s;
        c.beginPath(); c.moveTo(top.x, top.y); c.lineTo(bot.x, bot.y); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 0.45 * s;
        c.beginPath(); c.moveTo(top.x + 0.6 * s, top.y); c.lineTo(bot.x + 1.4 * s, bot.y); c.stroke();
      }
    }
    // placement artwork
    if (F.placement) F.placement.draw(c, asm, F.pal, s, sw, accentHex);
    // specular streak — the silk "glow" running down the body
    if (F.sheen > 0.15) {
      const k = o.noSheen ? 0.5 : 0.5 + Math.sin(t * 0.7) * 0.15;
      const x0 = -6 * s + Math.sin(t * 0.5) * 1.5 * s * (o.noSheen ? 0 : 1);
      const sg = c.createLinearGradient(x0 - 4 * s, 0, x0 + 4 * s, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, `rgba(255,255,255,${0.22 * F.sheen * k * 2})`); sg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sg; c.fillRect(x0 - 4 * s, 6 * s, 8 * s, hy);
      if (!o.noSheen) {
        const kk = ((t * 0.12) % 1.8) - 0.4;
        const y0 = -10 * s + kk * (hy + 20 * s);
        const g2 = c.createLinearGradient(-W, y0 - 30 * s, W, y0 + 30 * s);
        g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, `rgba(255,255,255,${0.14 * F.sheen})`); g2.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g2; c.fillRect(b.x, -10 * s, b.w, hy + 30 * s);
      }
    }
    if (o.motifs) for (const m of o.motifs) { const p = sw({ x: m.x, y: m.y }); motif(c, m.id, p.x, p.y, m.size, light); }
    if (o.decorItems) for (const it of o.decorItems) decorItem(c, it, sw(it), light);
    if (o.border) borderAlong(c, DN.hemLine.map(sw), o.border, s, light);
    if (d.deco === 'kimsata') twinkle(c, sparkleSpots(asm, 'ta'), t, s, '#fff6d8');
    if (F.sparkle) twinkle(c, sparkleSpots(asm, 'all'), t, s, '#ffffff');
    c.restore();
    // cut-in-one sleeves (ngũ thân) have no raglan line: keep the body's edge shadow below the underarm
    innerShade(body, 0.9, noRaglan && asm.sleeveR ? 19 * s : undefined);
    if (o.border) for (const [sl, cuff] of [[asm.sleeveR, asm.cuffR], [asm.sleeveL, asm.cuffL]]) {
      if (!sl) continue;
      c.save(); pathPoly(c, sl); c.clip(); borderAlong(c, cuff, o.border, s, light); c.restore();
    }
    if (noRaglan && asm.sleeveR) { c.save(); c.beginPath(); c.rect(-40 * s, 19 * s, 80 * s, 400 * s); c.clip(); pathPoly(c, body); outline(); c.restore(); }
    else { pathPoly(c, body); outline(); }

    // ----- collars -----
    if (asm.collar) {
      pathPoly(c, asm.collar);
      if (d.twotone === 'tayco') fillFabric(c, fab.mat, d.accent, tile, 'tron'); else fillFabric(c, fCo.mat, fCo.color, tile, fCo.print);
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fill(); outline();
      const cg = c.createLinearGradient(0, -5 * s, 0, 0);
      cg.addColorStop(0, 'rgba(255,255,255,0.15)'); cg.addColorStop(1, 'rgba(0,0,0,0.1)');
      pathPoly(c, asm.collar); c.fillStyle = cg; c.fill();
    }
    if (asm.neckType === 'lasen') {
      const col = trimHex || (d.twotone === 'tayco' ? accentHex : '#fbf8f2');
      for (const m of [1, -1]) {
        c.beginPath();
        c.moveTo(0.3 * m * s, asm.nd);
        c.quadraticCurveTo(asm.nx * 0.8 * m, asm.nd * 0.75, asm.nx * m, 0);
        c.quadraticCurveTo((asm.nx + 4 * s) * m, 2 * s, (asm.nx + 2.4 * s) * m, 5.5 * s);
        c.quadraticCurveTo(asm.nx * 0.5 * m, asm.nd + 4 * s, 0.3 * m * s, asm.nd + 1.2 * s);
        c.closePath();
        c.fillStyle = col; c.fill(); outline(0.25);
      }
    }
    if (asm.neckType === 'no') {
      const bow = d.twotone !== 'none' || d.trim === 'none' ? accentHex : trimHex;
      c.fillStyle = bow; c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.2 * s;
      for (const m of [-1, 1]) {
        c.beginPath(); c.moveTo(0, 3.6 * s); c.quadraticCurveTo(m * 1.5 * s, 10 * s, m * 3.5 * s, 15 * s); c.lineTo(m * 4.6 * s, 14 * s); c.quadraticCurveTo(m * 2.5 * s, 9 * s, m * 0.8 * s, 3.6 * s); c.fill(); c.stroke();
        c.beginPath(); c.ellipse(m * 2.8 * s, 2.6 * s, 2.8 * s, 1.5 * s, m * -0.35, 0, 7); c.fill(); c.stroke();
      }
      c.beginPath(); c.arc(0, 3.2 * s, 1 * s, 0, 7); c.fill(); c.stroke();
    }
    // trim
    if (trimHex) {
      c.save();
      c.strokeStyle = trimHex; c.lineWidth = 0.8 * s; c.lineCap = 'round'; c.lineJoin = 'round';
      const strokeLine = (pts) => { if (!pts) return; pathPoly(c, pts, false); c.stroke(); };
      if (asm.collar) { pathPoly(c, asm.collar); c.stroke(); } else strokeLine(asm.neckLine);
      strokeLine(DN.hemLine.map(sw));
      strokeLine(DN.slitR.map(sw)); strokeLine(DN.slitL.map(sw));
      strokeLine(asm.cuffR); strokeLine(asm.cuffL);
      c.restore();
    }
    // buttons
    const bt = ST.buttons.opts[d.buttons];
    if (o.buttons !== false && bt && bt.hex && !asm.bare) {
      for (const p of asm.buttons) {
        c.beginPath(); c.arc(p.x, p.y, 0.6 * s, 0, 7); c.fillStyle = bt.hex; c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.12 * s; c.stroke();
        c.beginPath(); c.arc(p.x - 0.2 * s, p.y - 0.2 * s, 0.2 * s, 0, 7); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
      }
    }
    // ----- embellishment -----
    if (d.deco === 'kimsaco') twinkle(c, sparkleSpots(asm, 'co'), t, s, '#fff6d8', true);
    if (d.deco === 'ngoctrai') {
      const pts = G.geo.resample(asm.neckLine, 1.1 * s, false);
      for (const p of pts) {
        const pg = c.createRadialGradient(p.x - 0.15 * s, p.y + 0.55 * s, 0, p.x, p.y + 0.7 * s, 0.55 * s);
        pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#d9cfc0');
        c.fillStyle = pg; c.beginPath(); c.arc(p.x, p.y + 0.7 * s, 0.5 * s, 0, 7); c.fill();
      }
    }
    if (d.deco === 'longvu') {
      for (const line of [DN.hemLine.map(sw), asm.cuffR, asm.cuffL]) {
        if (!line) continue;
        const pts = G.geo.resample(line, 0.9 * s, false);
        pts.forEach((p, i) => {
          const a = Math.sin(i * 1.7 + t * 2) * 0.4;
          c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.18 * s;
          for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x + (k * 0.6 + a) * s, p.y + 1.2 * s, p.x + (k * 0.9 + a * 2) * s, p.y + 2.4 * s); c.stroke(); }
        });
      }
    }

    drawTop();
    // cape and headwear go over whatever dress is shown (drawn or the player's picture)
    function drawTop() {
    // ----- sheer cape -----
    if (asm.capeR) {
      const co = ST.cape.opts[d.cape] || {};
      const hex = co.hex || accentHex;
      const c0 = 30 * s;
      const swC = (p) => (p.y <= c0 ? p : { x: p.x + amp * 1.5 * Math.pow((p.y - c0) / (hy - c0), 1.3) * Math.sin(t * 1.1 + 0.8 + p.y * 0.025 / s), y: p.y });
      for (const cp of [asm.capeR, asm.capeL]) {
        const pts = cp.map(swC);
        pathPoly(c, pts);
        c.fillStyle = rgba(hex, 0.2); c.fill();
        c.save(); c.clip();
        const bb = G.geo.bounds(pts);
        const fg = c.createLinearGradient(bb.x, 0, bb.x + bb.w, 0);
        fg.addColorStop(0, 'rgba(255,255,255,0.2)'); fg.addColorStop(0.3, 'rgba(255,255,255,0.02)');
        fg.addColorStop(0.55, 'rgba(255,255,255,0.16)'); fg.addColorStop(0.8, 'rgba(0,0,0,0.04)'); fg.addColorStop(1, 'rgba(255,255,255,0.16)');
        c.fillStyle = fg; c.fillRect(bb.x, bb.y, bb.w, bb.h);
        if (d.cape === 'vang' && !o.noSheen) {
          const k = ((t * 0.2) % 1.6) - 0.3;
          const y0 = bb.y + k * bb.h;
          const sg = c.createLinearGradient(0, y0 - 15 * s, 0, y0 + 15 * s);
          sg.addColorStop(0, 'rgba(255,240,190,0)'); sg.addColorStop(0.5, 'rgba(255,240,190,0.35)'); sg.addColorStop(1, 'rgba(255,240,190,0)');
          c.fillStyle = sg; c.fillRect(bb.x, bb.y, bb.w, bb.h);
        }
        c.restore();
        pathPoly(c, pts);
        c.strokeStyle = rgba(hex === '#ffffff' ? '#cfc3b2' : mix(hex, '#000000', 0.15), 0.75); c.lineWidth = 0.35 * s; c.stroke();
      }
    }
    if (o.mannequin) {
      lookFront(c, s, d.look, asm);
      c.save(); headXf(c, s);
      if (d.head === 'khanxep') khanxep(c, s, accentHex);
      else if (d.head === 'khanvan') khanvan(c, s, accentHex);
      else if (d.head === 'nonla') nonla(c, s, accentHex);
      else if (d.head === 'quaithao') quaithao(c, s, accentHex);
      else if (d.head === 'hoacai') hoacai(c, s, accentHex);
      c.restore();
    }
    }
  }

  // fashion-illustration head: scaled up around the chin so it reads at the right proportion
  const HEAD_K = 1.45;
  let HEAD_DY = 0; // men's heads sit lower (shorter, sturdier neck); set per garment
  function headXf(c, s) { c.translate(0, -12.6 * s + HEAD_DY); c.scale(HEAD_K, HEAD_K); c.translate(0, 12.6 * s); }

  // a placed embroidery / appliqué on the dress (cm units)
  function decorItem(c, it, p, light) {
    c.save(); c.translate(p.x, p.y); c.rotate(it.rot || 0);
    if (it.group === 'tranh') {
      const pl = G.tex.placements[it.id];
      if (pl && pl.img) { const w = it.size, h = w * (pl.img.height / pl.img.width); c.drawImage(pl.img, -w / 2, -h / 2, w, h); }
    } else if (it.group === 'va') patch(c, it.id, 0, 0, it.size);
    else motif(c, it.id, 0, 0, it.size, light);
    c.restore();
  }
  // a mend: a slightly crooked square of coarse cloth tacked on with big running stitches,
  // or a tear with frayed threads hanging out (centred at x,y, about `size` across)
  function patch(c, id, x, y, size) {
    const def = G.CAT.DECOR.va.items[id] || {}, u = size / 10;
    c.save(); c.translate(x, y);
    if (id === 'rach') {
      // a jagged split showing the dark lining, threads fraying from both lips
      const pts = [[-4.2, -0.6], [-2.6, 0.5], [-1.2, -0.7], [0.3, 0.6], [1.8, -0.5], [3.2, 0.4], [4.4, -0.3]];
      c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px * u, (py - 0.9) * u) : c.moveTo(px * u, (py - 0.9) * u)));
      for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0] * u, (pts[i][1] + 0.9) * u);
      c.closePath(); c.fillStyle = 'rgba(35,22,16,0.85)'; c.fill();
      c.strokeStyle = 'rgba(245,235,215,0.75)'; c.lineWidth = 0.18 * u; c.lineCap = 'round';
      for (let i = -4; i <= 4; i++) {
        const fx = i * u, a = (i % 2 ? 1 : -1) * 0.3;
        c.beginPath(); c.moveTo(fx, -1.2 * u); c.quadraticCurveTo(fx + a * u, -2 * u, fx + a * 2 * u, -2.6 * u + (i % 3) * 0.3 * u); c.stroke();
        c.beginPath(); c.moveTo(fx + 0.4 * u, 1.2 * u); c.quadraticCurveTo(fx - a * u, 2 * u, fx - a * 1.6 * u, 2.8 * u - (i % 3) * 0.3 * u); c.stroke();
      }
      c.restore(); return;
    }
    // irregular square (hand-cut), soft drop shadow, coarse homespun weave, frayed edge and tacking stitches
    const q = [[-5, -4.6], [4.7, -5], [5, 4.4], [-4.6, 4.9]].map(([px, py]) => [px * u, py * u]);
    const path = () => { c.beginPath(); q.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); };
    c.save(); c.translate(0.35 * u, 0.5 * u); path(); c.fillStyle = 'rgba(30,15,8,0.28)'; c.fill(); c.restore();
    path(); fillFabric(c, 'dui', def.color || 'be', 9 * u, 'tron');
    c.save(); path(); c.clip();
    const g = c.createLinearGradient(-5 * u, -5 * u, 5 * u, 5 * u); g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.16)');
    c.fillStyle = g; c.fillRect(-6 * u, -6 * u, 12 * u, 12 * u);
    c.restore();
    path(); c.strokeStyle = 'rgba(40,25,15,0.45)'; c.lineWidth = 0.22 * u; c.stroke();
    c.strokeStyle = 'rgba(250,240,220,0.9)'; c.lineWidth = 0.28 * u; c.setLineDash([1.1 * u, 0.9 * u]); c.lineCap = 'round';
    c.beginPath(); q.forEach(([px, py], i) => { const k = 0.78; return i ? c.lineTo(px * k, py * k) : c.moveTo(px * k, py * k); }); c.closePath(); c.stroke();
    c.setLineDash([]);
    c.restore();
  }

  function drawBottom(c, kind, s, sy, floor, hex, outline, t, amp, paint) {
    paint = paint || (() => { c.fillStyle = hex; c.fill(); });
    const top = sy - 5 * s;
    const shade = (x0, x1) => {
      const g = c.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.14)'); g.addColorStop(0.5, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.2)');
      c.fillStyle = g; c.fill();
    };
    if (kind === 'chanvay' || kind === 'tuyn') {
      const layers = kind === 'tuyn' ? [[31, 0.4], [27, 0.5], [23, 0.6]] : [[27, 1]];
      for (const [wd, al] of layers) {
        const sway = Math.sin(t * 1.1) * amp * 0.6;
        c.beginPath();
        // the waistband sits inside the áo's waist, then the skirt follows the hip before it flares
        c.moveTo(-10 * s, top); c.lineTo(10 * s, top);
        c.bezierCurveTo(14.6 * s, top + 9 * s, wd * 0.62 * s, (top + floor) / 2, wd * s + sway, floor);
        for (let x = wd; x >= -wd; x -= 3) c.lineTo(x * s + sway, floor + Math.sin(x * 0.7) * 0.7 * s);
        c.bezierCurveTo(-wd * 0.62 * s, (top + floor) / 2, -14.6 * s, top + 9 * s, -10 * s, top);
        c.closePath();
        c.save(); c.globalAlpha = al; paint(); c.restore();
        shade(-wd * s, wd * s);
        c.save(); c.clip();
        c.strokeStyle = 'rgba(0,0,0,0.08)'; c.lineWidth = 0.4 * s;
        for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * 1.6 * s, top + 8 * s); c.lineTo(i * (wd / 6.5) * s + sway, floor); c.stroke(); }
        if (kind === 'tuyn') { c.fillStyle = 'rgba(255,255,255,0.15)'; for (let y = top; y < floor; y += 1.4 * s) for (let x = -wd * s; x < wd * s; x += 1.4 * s) c.fillRect(x, y, 0.25 * s, 0.25 * s); }
        c.restore();
        outline(0.25);
      }
      return;
    }
    const bot = kind === 'ongrong' ? floor - 14 * s : floor;
    // straight silk trousers vs wide-leg 7/8 trousers that flare from the knee
    const wb = kind === 'ongrong' ? 21.5 : 16.4;
    const hipY = top + 17 * s, hx = 15.2;
    for (const m of [1, -1]) {
      // silk trousers follow the hips (never wider than the áo, which would hide the waist), then fall to the floor
      c.beginPath();
      c.moveTo(m * 0.4 * s, top); c.lineTo(m * 10.5 * s, top);
      c.bezierCurveTo(m * 13.4 * s, top + 4 * s, m * hx * s, hipY - 6 * s, m * hx * s, hipY);
      c.quadraticCurveTo(m * (kind === 'ongrong' ? 15.6 : 15.8) * s, (hipY + bot) / 2, m * wb * s, bot);
      c.lineTo(m * 1.4 * s, bot); c.quadraticCurveTo(m * 0.6 * s, (hipY + bot) / 2, m * 0.4 * s, hipY);
      c.closePath();
      paint();
      shade(0, m * wb * s);
      const hg = c.createRadialGradient(m * 12 * s, hipY - 2 * s, 0, m * 12 * s, hipY - 2 * s, 9 * s);
      hg.addColorStop(0, 'rgba(255,255,255,0.14)'); hg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = hg; c.fill();
      outline(0.25);
      c.save(); c.clip(); c.filter = 'blur(2px)';
      c.strokeStyle = 'rgba(0,0,0,0.1)'; c.lineWidth = 0.8 * s;
      for (const fx of [5, 9.5, 14]) { c.beginPath(); c.moveTo(m * fx * s, hipY + 4 * s); c.quadraticCurveTo(m * (fx + 1) * s, (hipY + bot) / 2, m * (fx + 2.2) * s, bot); c.stroke(); }
      c.restore();
    }
    if (kind === 'ongrong') {
      c.fillStyle = '#e9d8bf';
      for (const m of [1, -1]) c.fillRect(m * 8 * s - 1.4 * s, bot, 2.8 * s, floor - bot);
    }
  }

  // deterministic sparkle positions on the garment
  function sparkleSpots(asm, where) {
    asm._sp = asm._sp || {};
    if (asm._sp[where]) return asm._sp[where];
    const s = asm.s, out = [];
    let seed = 7;
    const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const n = where === 'all' ? 140 : where === 'co' ? 50 : 70;
    for (let i = 0; i < n * 4 && out.length < n; i++) {
      let p;
      if (where === 'co') p = { x: (r() - 0.5) * 34 * s, y: (r() * 10 - 2) * s };
      else if (where === 'ta') p = { x: (r() - 0.5) * 40 * s, y: asm.slitY + r() * (asm.hemY - asm.slitY) };
      else p = { x: (r() - 0.5) * 44 * s, y: r() * asm.hemY };
      if (where !== 'co' && !G.geo.pointInPoly(p, asm.body)) continue;
      if (where === 'co' && !(G.geo.pointInPoly(p, asm.body) || (asm.sleeveR && G.geo.pointInPoly(p, asm.sleeveR)) || (asm.sleeveL && G.geo.pointInPoly(p, asm.sleeveL)) || (asm.collar && G.geo.pointInPoly(p, asm.collar)))) continue;
      out.push({ x: p.x, y: p.y, ph: r() * 6.28, sz: 0.5 + r() * 0.6 });
    }
    asm._sp[where] = out;
    return out;
  }
  function twinkle(c, pts, t, s, col, dense) {
    for (const p of pts) {
      const a = Math.pow(Math.max(0, Math.sin(t * 2.6 + p.ph)), 6);
      c.fillStyle = col;
      c.globalAlpha = 0.35 + (dense ? 0.3 : 0);
      c.beginPath(); c.arc(p.x, p.y, 0.22 * s * p.sz, 0, 7); c.fill();
      if (a > 0.05) {
        c.globalAlpha = a;
        const r = 1.1 * s * p.sz * (0.6 + a * 0.6);
        c.beginPath();
        c.moveTo(p.x - r, p.y); c.lineTo(p.x - r * 0.15, p.y - r * 0.15); c.lineTo(p.x, p.y - r); c.lineTo(p.x + r * 0.15, p.y - r * 0.15);
        c.lineTo(p.x + r, p.y); c.lineTo(p.x + r * 0.15, p.y + r * 0.15); c.lineTo(p.x, p.y + r); c.lineTo(p.x - r * 0.15, p.y + r * 0.15); c.closePath();
        c.fill();
      }
    }
    c.globalAlpha = 1;
  }

  // fashion-illustration model drawn behind the garment: hair, neck, face, arms, hands, feet
  const SKIN = '#f0d0b2', SKIN_D = '#d6ab88', HAIR = '#1d1512';
  function modelBack(c, s, d, floor, asm) {
    if (asm.manBody) return maleModel(c, s, d, floor, asm);
    const SY = asm.SY || ((y) => y);
    const L = d.look || {}, HC = L.hairCol || HAIR;
    const longHair = d.head !== 'hoacai';
    if (longHair && L.hair !== 'bun') {
      c.save(); headXf(c, s);
      // hair falling behind the shoulders (or a chin-length bob), rounded over the crown
      const hg = c.createLinearGradient(-8 * s, 0, 8 * s, 0);
      const dk = L.hairCol ? mix(HC, '#000000', 0.45) : '#0f0b0a', md = L.hairCol ? HC : '#2a1f1b';
      hg.addColorStop(0, dk); hg.addColorStop(0.45, md); hg.addColorStop(1, dk);
      c.fillStyle = hg;
      c.beginPath();
      c.moveTo(-6.6 * s, -20 * s);
      c.arc(0, -20 * s, 6.6 * s, Math.PI, 0);
      if (L.hair === 'bob') {
        c.bezierCurveTo(8 * s, -16 * s, 8.6 * s, -13 * s, 7.6 * s, -11 * s);
        c.quadraticCurveTo(5 * s, -9.6 * s, 3 * s, -11.4 * s);
        c.quadraticCurveTo(0, -10 * s, -3 * s, -11.4 * s);
        c.quadraticCurveTo(-5 * s, -9.6 * s, -7.6 * s, -11 * s);
        c.bezierCurveTo(-8.6 * s, -13 * s, -8 * s, -16 * s, -6.6 * s, -20 * s);
      } else {
        c.bezierCurveTo(7.8 * s, -8 * s, 9.2 * s, 6 * s, 7.4 * s, 16 * s);
        c.quadraticCurveTo(5 * s, 19 * s, 3 * s, 14 * s);
        c.quadraticCurveTo(0, 17 * s, -3 * s, 14 * s);
        c.quadraticCurveTo(-5 * s, 19 * s, -7.4 * s, 16 * s);
        c.bezierCurveTo(-9.2 * s, 6 * s, -7.8 * s, -8 * s, -6.6 * s, -20 * s);
      }
      c.fill();
      c.restore();
    }
    // shoulders/torso skin (visible with bare necklines)
    mannequinTorso(c, s, true);
    // arms + hands
    const ang = (15 * Math.PI) / 180;
    for (const m of [-1, 1]) {
      const dv = { x: m * Math.sin(ang), y: Math.cos(ang) };
      const Sh = { x: m * 12.9 * s, y: 8.6 * s };
      const E = { x: Sh.x + dv.x * 27 * s, y: SY(Sh.y + dv.y * 27 * s) };
      const Wr = { x: Sh.x + dv.x * 56 * s, y: SY(Sh.y + dv.y * 56 * s) };
      const g = c.createLinearGradient(Sh.x - m * 4 * s, 0, Sh.x + m * 8 * s, 0);
      g.addColorStop(0, SKIN); g.addColorStop(1, SKIN_D);
      c.strokeStyle = g; c.lineCap = 'round';
      c.lineWidth = 6.6 * s; c.beginPath(); c.moveTo(Sh.x, Sh.y); c.lineTo(E.x, E.y); c.stroke();
      c.lineWidth = 4.6 * s; c.beginPath(); c.moveTo(E.x, E.y); c.lineTo(Wr.x, Wr.y); c.stroke();
      c.save(); c.translate(Wr.x + dv.x * 4 * s, Wr.y + dv.y * 4 * s); c.rotate(Math.atan2(dv.y, dv.x) - Math.PI / 2);
      c.fillStyle = SKIN;
      c.beginPath(); c.ellipse(0, 0, 2.6 * s, 4.4 * s, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(-m * 2.2 * s, -1.4 * s, 0.9 * s, 2.2 * s, m * 0.5, 0, 7); c.fill();
      c.strokeStyle = 'rgba(150,100,70,0.35)'; c.lineWidth = 0.2 * s;
      for (const fx of [-0.9, 0, 0.9]) { c.beginPath(); c.moveTo(fx * s, 1.2 * s); c.lineTo(fx * s, 4 * s); c.stroke(); }
      c.restore();
    }
    // feet in lacquered wooden clogs (guốc)
    for (const m of [-1, 1]) {
      c.fillStyle = SKIN; c.beginPath(); c.ellipse(m * 6.5 * s, floor - 0.6 * s, 2.6 * s, 1.4 * s, 0, 0, 7); c.fill();
      c.fillStyle = '#5a2e1f'; G.rr(c, m * 6.5 * s - 3.2 * s, floor, 6.4 * s, 1.6 * s, 0.6 * s); c.fill();
      c.fillStyle = '#b8323f'; c.fillRect(m * 6.5 * s - 2.4 * s, floor - 1 * s, 4.8 * s, 0.7 * s);
    }
    // neck + head
    const ng = c.createLinearGradient(-3.2 * s, 0, 3.2 * s, 0);
    ng.addColorStop(0, SKIN_D); ng.addColorStop(0.4, SKIN); ng.addColorStop(1, SKIN_D);
    c.fillStyle = ng; c.fillRect(-2.9 * s, -14 * s, 5.8 * s, 14.5 * s);
    c.save(); headXf(c, s);
    c.beginPath(); c.ellipse(0, -19.5 * s, 5.9 * s, 7.3 * s, 0, 0, 7);
    const fg = c.createRadialGradient(-1.6 * s, -21 * s, 1 * s, 0, -19 * s, 8.5 * s);
    fg.addColorStop(0, '#f9e1c8'); fg.addColorStop(1, SKIN_D);
    c.fillStyle = fg; c.fill();
    // gentle face: closed eyes, brows, lips, blush
    c.strokeStyle = '#4a3026'; c.lineWidth = 0.28 * s; c.lineCap = 'round';
    for (const m of [-1, 1]) {
      c.beginPath(); c.arc(m * 2.2 * s, -19.6 * s, 1.1 * s, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      c.strokeStyle = 'rgba(74,48,38,0.6)'; c.beginPath(); c.arc(m * 2.2 * s, -20.6 * s, 1.5 * s, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke();
      c.strokeStyle = '#4a3026';
      c.fillStyle = 'rgba(232,120,120,0.22)'; c.beginPath(); c.ellipse(m * 3.2 * s, -17.2 * s, 1.3 * s, 0.8 * s, 0, 0, 7); c.fill();
    }
    c.fillStyle = '#c4505a'; c.beginPath(); c.ellipse(0, -15.1 * s, 0.95 * s, 0.42 * s, 0, 0, 7); c.fill();
    // hair framing the face
    if (longHair) {
      // side-parted hair sweeping over the forehead and framing the cheeks
      if (L.hair === 'bun') bunTop(c, s, HC, L.bunPin);
      c.fillStyle = HC;
      c.beginPath();
      c.moveTo(-6.6 * s, -18 * s);
      c.bezierCurveTo(-7.2 * s, -25 * s, -2 * s, -28.2 * s, 2 * s, -27 * s);
      c.bezierCurveTo(5.8 * s, -26 * s, 7.2 * s, -22 * s, 6.6 * s, -18 * s);
      c.bezierCurveTo(6.9 * s, -15.5 * s, 6.4 * s, -13.6 * s, 5.6 * s, -12.4 * s);
      c.quadraticCurveTo(5.4 * s, -17 * s, 3.6 * s, -21.6 * s);
      c.bezierCurveTo(1 * s, -23.4 * s, -2.6 * s, -22 * s, -4.4 * s, -19.6 * s);
      c.quadraticCurveTo(-5.4 * s, -16 * s, -5.6 * s, -12.4 * s);
      c.bezierCurveTo(-6.4 * s, -13.6 * s, -6.9 * s, -15.5 * s, -6.6 * s, -18 * s);
      c.fill();
      c.strokeStyle = 'rgba(255,240,225,0.18)'; c.lineWidth = 0.45 * s; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-4.8 * s, -24.5 * s); c.quadraticCurveTo(-1 * s, -27 * s, 2.6 * s, -25.6 * s); c.stroke();
      c.lineWidth = 0.25 * s;
      c.beginPath(); c.moveTo(1.6 * s, -26.6 * s); c.quadraticCurveTo(4.6 * s, -24 * s, 5.6 * s, -19 * s); c.stroke();
    }
    lookFace(c, s, d.look, d);
    c.restore();
  }

  // male model: broader frame, short side-parted hair, plain black cloth shoes
  function maleModel(c, s, d, floor, asm) {
    const SY = asm.SY || ((y) => y), mx = asm.mx || 1.12;
    c.save(); c.scale(mx, 1); mannequinTorso(c, s, true); c.restore();
    const ang = (15 * Math.PI) / 180;
    for (const m of [-1, 1]) {
      const at = (k) => ({ x: m * (12.9 + Math.sin(ang) * k) * s * mx, y: SY((8.6 + Math.cos(ang) * k) * s) });
      const Sh = at(0), E = at(27), Wr = at(56), Hd = at(60);
      const g = c.createLinearGradient(Sh.x - m * 4 * s, 0, Sh.x + m * 8 * s, 0);
      g.addColorStop(0, SKIN); g.addColorStop(1, SKIN_D);
      c.strokeStyle = g; c.lineCap = 'round';
      c.lineWidth = 7.6 * s; c.beginPath(); c.moveTo(Sh.x, Sh.y); c.lineTo(E.x, E.y); c.stroke();
      c.lineWidth = 5.4 * s; c.beginPath(); c.moveTo(E.x, E.y); c.lineTo(Wr.x, Wr.y); c.stroke();
      c.save(); c.translate(Hd.x, Hd.y); c.rotate(Math.atan2(Hd.y - Wr.y, Hd.x - Wr.x) - Math.PI / 2);
      c.fillStyle = SKIN;
      c.beginPath(); c.ellipse(0, 0, 3 * s, 4.8 * s, 0, 0, 7); c.fill();
      c.beginPath(); c.ellipse(-m * 2.6 * s, -1.6 * s, 1.1 * s, 2.4 * s, m * 0.5, 0, 7); c.fill();
      c.strokeStyle = 'rgba(150,100,70,0.35)'; c.lineWidth = 0.22 * s;
      for (const fx of [-1, 0, 1]) { c.beginPath(); c.moveTo(fx * s, 1.4 * s); c.lineTo(fx * s, 4.4 * s); c.stroke(); }
      c.restore();
    }
    for (const m of [-1, 1]) {
      const x = m * 7.2 * s * mx;
      c.fillStyle = '#1e1916'; c.beginPath(); c.ellipse(x, floor - 0.3 * s, 3.8 * s, 1.7 * s, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.beginPath(); c.ellipse(x - 1 * s, floor - 0.9 * s, 1.8 * s, 0.5 * s, 0, 0, 7); c.fill();
    }
    const ng = c.createLinearGradient(-3.6 * s, 0, 3.6 * s, 0);
    ng.addColorStop(0, SKIN_D); ng.addColorStop(0.4, SKIN); ng.addColorStop(1, SKIN_D);
    c.fillStyle = ng; c.fillRect(-4.2 * s, -12 * s, 8.4 * s, 12.5 * s);
    c.save(); headXf(c, s);
    c.fillStyle = SKIN_D;
    for (const m of [-1, 1]) { c.beginPath(); c.ellipse(m * 6 * s, -19 * s, 1 * s, 1.7 * s, 0, 0, 7); c.fill(); }
    c.beginPath(); c.ellipse(0, -19.3 * s, 6.1 * s, 7.4 * s, 0, 0, 7);
    const fg = c.createRadialGradient(-1.6 * s, -21 * s, 1 * s, 0, -19 * s, 8.5 * s);
    fg.addColorStop(0, '#f6dcc2'); fg.addColorStop(1, SKIN_D);
    c.fillStyle = fg; c.fill();
    c.strokeStyle = '#3e2820'; c.lineCap = 'round';
    for (const m of [-1, 1]) {
      c.lineWidth = 0.3 * s; c.beginPath(); c.arc(m * 2.3 * s, -19.4 * s, 1.1 * s, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke();
      c.lineWidth = 0.6 * s; c.beginPath(); c.moveTo(m * 1.1 * s, -21.4 * s); c.quadraticCurveTo(m * 2.4 * s, -22.1 * s, m * 3.8 * s, -21.5 * s); c.stroke();
    }
    c.strokeStyle = 'rgba(160,100,80,0.8)'; c.lineWidth = 0.32 * s;
    c.beginPath(); c.moveTo(-0.9 * s, -15.2 * s); c.quadraticCurveTo(0, -14.8 * s, 0.9 * s, -15.2 * s); c.stroke();
    const L = d.look || {};
    c.fillStyle = L.hairCol || HAIR;
    c.beginPath();
    if (L.hair === 'slick') {
      // slicked straight back, high clean hairline
      c.moveTo(-6.3 * s, -18.6 * s);
      c.bezierCurveTo(-6.9 * s, -26.6 * s, -2.5 * s, -29.2 * s, 1 * s, -28.8 * s);
      c.bezierCurveTo(5.2 * s, -28.5 * s, 7 * s, -25.2 * s, 6.3 * s, -18.6 * s);
      c.quadraticCurveTo(5.8 * s, -23.2 * s, 3 * s, -24.4 * s);
      c.bezierCurveTo(0.5 * s, -25 * s, -3 * s, -24.8 * s, -5 * s, -23.6 * s);
      c.quadraticCurveTo(-6 * s, -21.6 * s, -6.3 * s, -18.6 * s);
    } else if (L.hair === 'idol') {
      // long swept fringe falling over the forehead
      c.moveTo(-6.4 * s, -17.8 * s);
      c.bezierCurveTo(-7.1 * s, -26 * s, -2.5 * s, -28.6 * s, 1 * s, -28.2 * s);
      c.bezierCurveTo(5.4 * s, -27.8 * s, 7.2 * s, -24.5 * s, 6.4 * s, -17.8 * s);
      // side-swept: high at the right temple, falling across to the left brow
      c.quadraticCurveTo(5.9 * s, -20.4 * s, 5 * s, -22.2 * s);
      c.quadraticCurveTo(3.6 * s, -22.6 * s, 2.6 * s, -21.8 * s);
      c.quadraticCurveTo(1.2 * s, -22.2 * s, 0.4 * s, -21.2 * s);
      c.quadraticCurveTo(-1.2 * s, -21.4 * s, -2.2 * s, -20.4 * s);
      c.quadraticCurveTo(-3.6 * s, -20.4 * s, -4.4 * s, -19.4 * s);
      c.quadraticCurveTo(-5.6 * s, -19.2 * s, -6.4 * s, -17.8 * s);
    } else {
      c.moveTo(-6.3 * s, -18.4 * s);
      c.bezierCurveTo(-6.9 * s, -25.6 * s, -2.5 * s, -28.2 * s, 1 * s, -27.8 * s);
      c.bezierCurveTo(5.2 * s, -27.5 * s, 7 * s, -24.5 * s, 6.3 * s, -18.4 * s);
      c.quadraticCurveTo(5.7 * s, -21.6 * s, 3.6 * s, -22.8 * s);
      c.bezierCurveTo(1 * s, -24 * s, -2.6 * s, -23.2 * s, -4.7 * s, -22 * s);
      c.quadraticCurveTo(-5.9 * s, -20.6 * s, -6.3 * s, -18.4 * s);
    }
    c.fill();
    c.strokeStyle = 'rgba(255,240,225,0.18)'; c.lineWidth = 0.4 * s;
    if (L.hair === 'slick') {
      // glossy combed-back sheen
      c.strokeStyle = 'rgba(255,245,235,0.22)'; c.lineWidth = 0.5 * s;
      c.beginPath(); c.moveTo(-3.6 * s, -24.6 * s); c.quadraticCurveTo(-2 * s, -27.6 * s, 1.6 * s, -28.2 * s); c.stroke();
      c.lineWidth = 0.3 * s;
      c.beginPath(); c.moveTo(1.4 * s, -24.8 * s); c.quadraticCurveTo(3.6 * s, -26.6 * s, 4.6 * s, -26 * s); c.stroke();
    }
    else { c.beginPath(); c.moveTo(-4.4 * s, -25.4 * s); c.quadraticCurveTo(-1 * s, -27.4 * s, 3 * s, -26.4 * s); c.stroke(); }
    if (L.hair === 'bun') bunTop(c, s, L.hairCol || HAIR, L.bunPin);
    lookFace(c, s, L, d);
    c.restore();
  }

  // ---------- signature looks of the famous (parody) clients ----------
  const GOLD = '#d4a73a';
  function bunTop(c, s, col, pin) {
    c.fillStyle = col; c.beginPath(); c.arc(0.6 * s, -28.6 * s, 2.7 * s, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 0.3 * s;
    c.beginPath(); c.arc(0.6 * s, -28.6 * s, 1.8 * s, 3.6, 5.6); c.stroke();
    if (pin) { c.strokeStyle = GOLD; c.lineWidth = 0.4 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(-2.6 * s, -29.8 * s); c.lineTo(4 * s, -27.6 * s); c.stroke(); c.fillStyle = '#c2414b'; c.beginPath(); c.arc(4.2 * s, -27.5 * s, 0.6 * s, 0, 7); c.fill(); }
  }
  // drawn in head space (after headXf): makeup, glasses, earrings, beard, bows and hats
  function lookFace(c, s, L, d) {
    if (!L) return;
    const hatOk = !d.head || d.head === 'none';
    c.lineCap = 'round';
    if (L.blush) { c.fillStyle = 'rgba(240,110,130,0.3)'; for (const m of [-1, 1]) { c.beginPath(); c.ellipse(m * 3.3 * s, -17.1 * s, 1.5 * s, 0.9 * s, 0, 0, 7); c.fill(); } }
    if (L.lashes) {
      c.strokeStyle = '#2a1a14'; c.lineWidth = 0.2 * s;
      for (const m of [-1, 1]) for (let k = 0; k < 4; k++) {
        const a = (0.22 + k * 0.19) * Math.PI, x = m * 2.2 * s + Math.cos(a) * 1.1 * s, y = -19.5 * s + Math.sin(a) * 1.1 * s;
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 0.65 * s, y + Math.sin(a) * 0.65 * s); c.stroke();
      }
    }
    if (L.lips) {
      c.fillStyle = L.lips; c.beginPath(); c.ellipse(0, -15.1 * s, 1.15 * s, 0.5 * s, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-0.3 * s, -15.25 * s, 0.35 * s, 0.12 * s, 0, 0, 7); c.fill();
    }
    if (L.beard === 'stubble') {
      c.save(); c.beginPath(); c.ellipse(0, -19.3 * s, 6.1 * s, 7.4 * s, 0, 0, 7); c.clip();
      c.fillStyle = 'rgba(50,35,28,0.24)'; c.beginPath(); c.ellipse(0, -13.4 * s, 5.4 * s, 3.4 * s, 0, 0, 7); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(120,70,60,0.85)'; c.lineWidth = 0.32 * s;
      c.beginPath(); c.moveTo(-0.9 * s, -15.2 * s); c.quadraticCurveTo(0, -14.8 * s, 0.9 * s, -15.2 * s); c.stroke();
    }
    if (L.beard === 'long') {
      // a sage's long beard and drooping moustache (Táo Quân)
      c.fillStyle = L.beardCol || '#1c1512';
      c.beginPath(); c.moveTo(-3.2 * s, -14.6 * s); c.quadraticCurveTo(-2.6 * s, -9 * s, 0, -6 * s); c.quadraticCurveTo(2.6 * s, -9 * s, 3.2 * s, -14.6 * s); c.quadraticCurveTo(0, -13.4 * s, -3.2 * s, -14.6 * s); c.fill();
      c.beginPath(); c.moveTo(0, -16 * s); c.quadraticCurveTo(-2.2 * s, -16.5 * s, -3.6 * s, -14.6 * s); c.quadraticCurveTo(-1.8 * s, -15.4 * s, 0, -15.3 * s);
      c.quadraticCurveTo(1.8 * s, -15.4 * s, 3.6 * s, -14.6 * s); c.quadraticCurveTo(2.2 * s, -16.5 * s, 0, -16 * s); c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 0.2 * s;
      for (const k of [-1.6, -0.5, 0.6, 1.6]) { c.beginPath(); c.moveTo(k * s, -13.6 * s); c.quadraticCurveTo(k * 0.8 * s, -10 * s, k * 0.2 * s, -7.2 * s); c.stroke(); }
    }
    if (L.tears) for (const m of [-1, 1]) {
      const x = m * 2.6 * s, y = -17.3 * s;
      c.fillStyle = 'rgba(150,205,240,0.92)';
      c.beginPath(); c.moveTo(x, y - 0.9 * s); c.quadraticCurveTo(x + 0.7 * s, y + 0.2 * s, x, y + 0.7 * s); c.quadraticCurveTo(x - 0.7 * s, y + 0.2 * s, x, y - 0.9 * s); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(x - 0.2 * s, y + 0.1 * s, 0.18 * s, 0, 7); c.fill();
    }
    if (L.glasses) {
      const y = -19.5 * s, rx = 1.75 * s, ry = L.glasses === 'sun' ? 1.35 * s : 1.45 * s;
      const frame = L.glasses === 'gold' ? GOLD : '#2b2420';
      for (const m of [-1, 1]) {
        c.beginPath(); c.ellipse(m * 2.4 * s, y, rx, ry, 0, 0, 7);
        if (L.glasses === 'sun') {
          const g = c.createLinearGradient(0, y - ry, 0, y + ry); g.addColorStop(0, '#3a3640'); g.addColorStop(1, '#0e0d12');
          c.fillStyle = g; c.fill();
          c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(m * 2.4 * s - 0.6 * s, y - 0.5 * s, 0.5 * s, 0.22 * s, -0.4, 0, 7); c.fill();
        } else { c.fillStyle = 'rgba(255,255,255,0.1)'; c.fill(); c.strokeStyle = frame; c.lineWidth = 0.24 * s; c.stroke(); }
      }
      c.strokeStyle = frame; c.lineWidth = 0.24 * s;
      c.beginPath(); c.moveTo(-0.65 * s, y - 0.3 * s); c.quadraticCurveTo(0, y - 0.8 * s, 0.65 * s, y - 0.3 * s); c.stroke();
      for (const m of [-1, 1]) { c.beginPath(); c.moveTo(m * 4.15 * s, y - 0.3 * s); c.lineTo(m * 5.9 * s, y - 0.6 * s); c.stroke(); }
    }
    if (L.earrings) for (const m of [-1, 1]) {
      const x = m * 6 * s, y = -17.2 * s;
      if (L.earrings === 'hoop') { c.strokeStyle = GOLD; c.lineWidth = 0.32 * s; c.beginPath(); c.arc(x, y + 1.2 * s, 1.1 * s, 0, 7); c.stroke(); }
      else if (L.earrings === 'drop') {
        c.fillStyle = GOLD; c.beginPath(); c.arc(x, y, 0.3 * s, 0, 7); c.fill();
        const pg = c.createRadialGradient(x - 0.2 * s, y + 1.6 * s, 0.1 * s, x, y + 1.8 * s, 0.8 * s); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#d9cfc0');
        c.fillStyle = pg; c.beginPath(); c.ellipse(x, y + 1.8 * s, 0.6 * s, 0.8 * s, 0, 0, 7); c.fill();
      } else { c.fillStyle = L.earrings === 'diamond' ? '#eaf6ff' : GOLD; c.beginPath(); c.arc(x, y, 0.4 * s, 0, 7); c.fill(); }
    }
    if (L.bow) {
      c.save(); c.translate(-4.2 * s, -26 * s); c.rotate(-0.35); c.fillStyle = L.bow;
      for (const m of [-1, 1]) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(m * 2.6 * s, -2.3 * s, m * 3.3 * s, 0); c.quadraticCurveTo(m * 2.6 * s, 2.3 * s, 0, 0); c.fill(); }
      c.fillStyle = mix(L.bow, '#000000', 0.18); c.beginPath(); c.arc(0, 0, 0.75 * s, 0, 7); c.fill();
      c.restore();
    }
    if (hatOk && L.hat === 'beanie') {
      const col = L.hatCol || '#2d2a2e';
      c.fillStyle = col; c.beginPath(); c.moveTo(-6.7 * s, -22.4 * s); c.bezierCurveTo(-7.1 * s, -31 * s, 7.1 * s, -31 * s, 6.7 * s, -22.4 * s); c.closePath(); c.fill();
      c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 0.35 * s;
      for (let x = -7; x <= 7; x += 1.1) { c.beginPath(); c.moveTo(x * s, -31 * s); c.lineTo(x * s, -21 * s); c.stroke(); }
      c.restore();
      G.rr(c, -7 * s, -23.8 * s, 14 * s, 2.7 * s, 1.2 * s); c.fillStyle = mix(col, '#000000', 0.22); c.fill();
    }
    if (hatOk && L.hat === 'canhchuon') {
      // mũ cánh chuồn: black dome with two wing paddles, gold band
      for (const m of [-1, 1]) {
        c.fillStyle = '#16110f'; c.fillRect(m > 0 ? 6 * s : -7.6 * s, -25.6 * s, 1.6 * s, 0.9 * s);
        c.beginPath(); c.ellipse(m * 10.6 * s, -25.2 * s, 3.5 * s, 1.5 * s, m * -0.12, 0, 7); c.fill();
        c.strokeStyle = GOLD; c.lineWidth = 0.25 * s; c.stroke();
      }
      c.fillStyle = '#1d1714';
      c.beginPath(); c.ellipse(0, -27.6 * s, 4.6 * s, 2.4 * s, 0, Math.PI, 0); c.fill();
      c.beginPath(); c.moveTo(-6.7 * s, -22.2 * s); c.bezierCurveTo(-6.9 * s, -30 * s, 6.9 * s, -30 * s, 6.7 * s, -22.2 * s); c.closePath(); c.fill();
      c.strokeStyle = GOLD; c.lineWidth = 0.4 * s;
      c.beginPath(); c.moveTo(-6.7 * s, -23.3 * s); c.quadraticCurveTo(0, -22.3 * s, 6.7 * s, -23.3 * s); c.stroke();
    }
  }
  // where a hand is (body space), m = 1 the viewer's right
  function handAt(asm, m) {
    const s = asm.s, SY = asm.SY || ((y) => y), ang = (15 * Math.PI) / 180, k = 60;
    return { x: m * (12.9 + Math.sin(ang) * k) * s * (asm.mx || 1), y: SY((8.6 + Math.cos(ang) * k) * s) };
  }
  // drawn over the finished garment: necklace, rings, props held in the hand
  function lookFront(c, s, L, asm) {
    if (!L) return;
    if (L.pearls) for (let i = 0; i <= 14; i++) {
      const a = (Math.PI * i) / 14, x = -Math.cos(a) * 6.2 * s * (asm.mx || 1), y = (1.4 + Math.sin(a) * 3.4) * s;
      const pg = c.createRadialGradient(x - 0.15 * s, y - 0.15 * s, 0, x, y, 0.55 * s); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#d6ccbd');
      c.fillStyle = pg; c.beginPath(); c.arc(x, y, 0.5 * s, 0, 7); c.fill();
    }
    const h = handAt(asm, 1);
    if (L.rings) for (const p of [h, handAt(asm, -1)]) {
      c.strokeStyle = GOLD; c.lineWidth = 0.4 * s; c.beginPath(); c.arc(p.x, p.y + 1.6 * s, 0.7 * s, 0, 7); c.stroke();
      c.fillStyle = '#c8ecff'; c.beginPath(); c.arc(p.x, p.y + 0.9 * s, 0.4 * s, 0, 7); c.fill();
    }
    c.save(); c.translate(h.x, h.y); c.lineCap = 'round';
    // props are caricature-sized so they read at full-figure scale; the ladle is "siêu to khổng lồ"
    const pk = L.prop === 'ladle' ? 2 : 1.5; c.scale(pk, pk);
    if (L.prop === 'fan') {
      c.rotate(0.35);
      const col = L.propCol || '#d2475e';
      c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 10 * s, -2.55, -0.6); c.closePath();
      const fg = c.createRadialGradient(0, 0, 2 * s, 0, 0, 10 * s); fg.addColorStop(0, mix(col, '#ffffff', 0.25)); fg.addColorStop(1, col);
      c.fillStyle = fg; c.fill();
      c.strokeStyle = GOLD; c.lineWidth = 0.18 * s;
      for (let a = -2.55; a <= -0.59; a += 0.163) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 10 * s, Math.sin(a) * 10 * s); c.stroke(); }
      c.lineWidth = 0.35 * s; c.beginPath(); c.arc(0, 0, 10 * s, -2.55, -0.6); c.stroke();
      c.fillStyle = '#e9d3a8'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 2.6 * s, -2.55, -0.6); c.closePath(); c.fill();
    } else if (L.prop === 'ladle') {
      c.rotate(0.22);
      c.strokeStyle = '#8a5a32'; c.lineWidth = 1.1 * s; c.beginPath(); c.moveTo(0, 3 * s); c.lineTo(0, -24 * s); c.stroke();
      c.fillStyle = '#9a6a3a'; c.beginPath(); c.ellipse(0, -27 * s, 3.6 * s, 2.6 * s, 0, 0, 7); c.fill();
      c.fillStyle = '#6e4626'; c.beginPath(); c.ellipse(0, -27.6 * s, 2.7 * s, 1.5 * s, 0, 0, 7); c.fill();
    } else if (L.prop === 'hanky') {
      c.fillStyle = '#fbf7f0'; c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.15 * s;
      c.beginPath(); c.moveTo(-1.2 * s, -0.5 * s); c.quadraticCurveTo(-2.6 * s, 4 * s, -1.8 * s, 7.5 * s);
      for (let i = 0; i <= 5; i++) c.arc(-1.8 * s + i * 0.9 * s, 7.6 * s, 0.45 * s, Math.PI, 0, true);
      c.quadraticCurveTo(3.2 * s, 3.6 * s, 1.2 * s, -0.5 * s); c.closePath(); c.fill(); c.stroke();
    } else if (L.prop === 'mic') {
      c.rotate(-0.45);
      c.fillStyle = '#26232a'; G.rr(c, -0.7 * s, -6.4 * s, 1.4 * s, 8.4 * s, 0.6 * s); c.fill();
      const mg = c.createRadialGradient(-0.5 * s, -8.2 * s, 0.2 * s, 0, -7.6 * s, 1.9 * s); mg.addColorStop(0, '#eceff3'); mg.addColorStop(1, '#7c8088');
      c.fillStyle = mg; c.beginPath(); c.arc(0, -7.6 * s, 1.8 * s, 0, 7); c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 0.12 * s;
      for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(-1.7 * s, -7.6 * s + k * 0.8 * s); c.lineTo(1.7 * s, -7.6 * s + k * 0.8 * s); c.stroke(); }
    }
    c.restore();
  }

  // khăn xếp: the men's ready-folded turban, criss-cross pleats around the head
  function khanxep(c, s, hex) {
    const dark = mix(hex, '#000000', 0.5), mid = mix(hex, '#000000', 0.22), lite = mix(hex, '#ffffff', 0.22);
    // a low, rounded ring sitting on the hairline, slightly wider than the head
    const y0 = -22.4 * s, y1 = -27.2 * s, w = 7.4 * s;
    c.fillStyle = dark;
    c.beginPath(); c.ellipse(0, y1 + 0.2 * s, w * 0.86, 1.5 * s, 0, 0, 7); c.fill();
    const band = () => {
      c.beginPath(); c.moveTo(-w * 0.95, y0);
      c.bezierCurveTo(-w * 1.08, y0 - 1.6 * s, -w * 1.02, y1 + 0.6 * s, -w * 0.86, y1 + 0.2 * s);
      c.quadraticCurveTo(0, y1 - 1.1 * s, w * 0.86, y1 + 0.2 * s);
      c.bezierCurveTo(w * 1.02, y1 + 0.6 * s, w * 1.08, y0 - 1.6 * s, w * 0.95, y0);
      c.quadraticCurveTo(0, y0 + 2 * s, -w * 0.95, y0); c.closePath();
    };
    band();
    const g = c.createLinearGradient(-w, 0, w, 0);
    g.addColorStop(0, dark); g.addColorStop(0.3, mid); g.addColorStop(0.48, lite); g.addColorStop(0.7, mid); g.addColorStop(1, dark);
    c.fillStyle = g; c.fill();
    c.save(); band(); c.clip(); c.lineCap = 'round';
    for (let i = -9; i <= 9; i++) {
      c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 0.32 * s;
      c.beginPath(); c.moveTo(i * 1.5 * s, y0 + 2 * s); c.lineTo(i * 1.5 * s + 3.4 * s, y1 - 1.5 * s); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 0.24 * s;
      c.beginPath(); c.moveTo(i * 1.5 * s, y0 + 2 * s); c.lineTo(i * 1.5 * s - 3.4 * s, y1 - 1.5 * s); c.stroke();
    }
    c.restore();
    band(); c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.2 * s; c.stroke();
  }

  function mannequinTorso(c, s, skin) {
    const pts = [[-3.1, -1], [-8, 2.2], [-13.6, 5.4], [-15, 8.4], [-14.4, 12.4], [-13.3, 18], [-13.8, 25], [-10.2, 39], [-13.8, 55]];
    c.beginPath();
    pts.forEach(([x, y], i) => (i ? c.lineTo(x * s, y * s) : c.moveTo(x * s, y * s)));
    for (let i = pts.length - 1; i >= 0; i--) c.lineTo(-pts[i][0] * s, pts[i][1] * s);
    c.closePath();
    const g = c.createLinearGradient(-18 * s, 0, 18 * s, 0);
    if (skin) { g.addColorStop(0, SKIN_D); g.addColorStop(0.35, '#f7dcc2'); g.addColorStop(1, SKIN_D); }
    else { g.addColorStop(0, '#cdb594'); g.addColorStop(0.35, '#f4e8d6'); g.addColorStop(1, '#c9b08d'); }
    c.fillStyle = g; c.fill();
  }

  function mannequinHead(c, s) {
    c.fillStyle = '#e9d8bf';
    c.fillRect(-3.3 * s, -13 * s, 6.6 * s, 13 * s);
    c.beginPath(); c.ellipse(0, -19.5 * s, 6.2 * s, 7.6 * s, 0, 0, 7);
    const g = c.createRadialGradient(-2 * s, -22 * s, 1 * s, 0, -19.5 * s, 9 * s);
    g.addColorStop(0, '#fbf1e2'); g.addColorStop(1, '#dcc6a8');
    c.fillStyle = g; c.fill();
  }

  function khanvan(c, s, hex) {
    const y0 = -24 * s;
    const dark = mix(hex, '#000000', 0.32), lite = mix(hex, '#ffffff', 0.28);
    c.fillStyle = dark;
    c.beginPath(); c.ellipse(0, y0 - 0.8 * s, 7.5 * s, 3.5 * s, 0, 0, 7); c.fill();
    c.fillStyle = '#efdfc8';
    c.beginPath(); c.ellipse(0, y0 - 1.3 * s, 4.6 * s, 1.6 * s, 0, 0, 7); c.fill();
    for (let i = 0; i <= 12; i++) {
      const th = Math.PI * (i / 12);
      const x = -Math.cos(th) * 7.1 * s, y = y0 + Math.sin(th) * 2.4 * s;
      c.save(); c.translate(x, y); c.rotate(-0.6);
      c.fillStyle = i % 2 ? hex : lite;
      c.beginPath(); c.ellipse(0, 0, 1.5 * s, 2.5 * s, 0, 0, 7); c.fill();
      c.strokeStyle = rgba(dark, 0.5); c.lineWidth = 0.15 * s; c.stroke();
      c.restore();
    }
  }

  function nonla(c, s, ribbon) {
    c.save();
    c.translate(0, -21 * s); c.rotate(-0.06);
    c.strokeStyle = ribbon; c.lineWidth = 0.7 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-5.5 * s, 0); c.quadraticCurveTo(-3 * s, 9 * s, 0, 10 * s); c.quadraticCurveTo(3 * s, 9 * s, 5.5 * s, 0); c.stroke();
    c.beginPath(); c.moveTo(-17 * s, 0); c.lineTo(0, -16 * s); c.lineTo(17 * s, 0); c.quadraticCurveTo(0, 2.6 * s, -17 * s, 0); c.closePath();
    const g = c.createLinearGradient(-17 * s, 0, 17 * s, 0);
    g.addColorStop(0, '#cdb06e'); g.addColorStop(0.4, '#f2dfaa'); g.addColorStop(0.7, '#e3c98d'); g.addColorStop(1, '#bf9f5c');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    c.strokeStyle = 'rgba(130,90,35,0.35)'; c.lineWidth = 0.2 * s;
    for (let i = 1; i <= 6; i++) {
      const y = -16 * s * (1 - i / 7), hw = (17 * s * i) / 7;
      c.beginPath(); c.moveTo(-hw, y); c.quadraticCurveTo(0, y + 0.5 * s * i / 3, hw, y); c.stroke();
    }
    c.restore();
    c.strokeStyle = '#a8864a'; c.lineWidth = 0.35 * s;
    c.beginPath(); c.moveTo(-17 * s, 0); c.quadraticCurveTo(0, 2.6 * s, 17 * s, 0); c.stroke();
    c.restore();
  }

  function quaithao(c, s, cord) {
    const y0 = -25.5 * s;
    c.strokeStyle = cord; c.lineWidth = 0.45 * s; c.lineCap = 'round';
    for (const m of [-1, 1]) {
      c.beginPath(); c.moveTo(m * 13 * s, y0 + 1 * s); c.quadraticCurveTo(m * 14 * s, -6 * s, m * 9 * s, 6 * s); c.stroke();
      c.fillStyle = cord;
      for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(m * 9 * s, 6 * s); c.lineTo(m * 9 * s + k * 0.4 * s, 9 * s); c.stroke(); }
    }
    c.fillStyle = '#2b2420';
    c.beginPath(); c.ellipse(0, y0, 19 * s, 4.4 * s, 0, 0, 7); c.fill();
    const g = c.createLinearGradient(-19 * s, 0, 19 * s, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.4, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fill();
    c.strokeStyle = '#c9a24a'; c.lineWidth = 0.35 * s; c.stroke();
    c.fillStyle = '#3a312b';
    c.beginPath(); c.ellipse(0, y0 - 1.6 * s, 8.5 * s, 2.2 * s, 0, 0, 7); c.fill();
    c.fillRect(-8.5 * s, y0 - 1.6 * s, 17 * s, 1.6 * s);
    c.strokeStyle = '#c9a24a'; c.lineWidth = 0.25 * s; c.beginPath(); c.ellipse(0, y0 - 1.6 * s, 8.5 * s, 2.2 * s, 0, 0, 7); c.stroke();
  }

  function hoacai(c, s, hex) {
    c.fillStyle = '#211814';
    c.beginPath(); c.ellipse(0, -21.8 * s, 6.5 * s, 5.6 * s, 0, Math.PI, 0); c.fill();
    c.beginPath(); c.ellipse(0, -21.8 * s, 6.5 * s, 1.6 * s, 0, 0, Math.PI); c.fill();
    c.beginPath(); c.arc(-1 * s, -27.5 * s, 3.4 * s, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.15)'; c.lineWidth = 0.3 * s;
    c.beginPath(); c.arc(-1 * s, -27.5 * s, 2.4 * s, 3.6, 5.6); c.stroke();
    c.save(); c.translate(3.5 * s, -27 * s);
    G.tex.M.flower(c, 2.4 * s, 5, hex, '#f2c94c', true);
    c.restore();
    c.strokeStyle = '#d9b45a'; c.lineWidth = 0.35 * s;
    c.beginPath(); c.moveTo(-6 * s, -28 * s); c.lineTo(2 * s, -26 * s); c.stroke();
  }

  // ---------- Backgrounds ----------
  function shopBg(c) {
    const gr = c.createLinearGradient(0, 0, 0, G.H);
    gr.addColorStop(0, '#f3e1c6'); gr.addColorStop(1, '#e8cfae');
    c.fillStyle = gr; c.fillRect(0, 0, G.W, G.H);
    c.strokeStyle = 'rgba(178,58,72,0.06)'; c.lineWidth = 2;
    for (let x = -40; x < G.W + 40; x += 60) for (let y = 40; y < 520; y += 60) {
      c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x + 18, y); c.lineTo(x, y + 18); c.lineTo(x - 18, y); c.closePath(); c.stroke();
    }
    c.fillStyle = '#cfe6ea'; G.rr(c, 470, 90, 340, 240, 12); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.moveTo(500, 320); c.lineTo(600, 100); c.lineTo(640, 100); c.lineTo(540, 320); c.fill();
    c.strokeStyle = '#8a5d3b'; c.lineWidth = 10; G.rr(c, 470, 90, 340, 240, 12); c.stroke();
    c.lineWidth = 6; c.beginPath(); c.moveTo(640, 90); c.lineTo(640, 330); c.moveTo(470, 210); c.lineTo(810, 210); c.stroke();
    c.fillStyle = '#a8764e'; c.fillRect(0, 520, G.W, 200);
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2;
    for (let y = 540; y < G.H; y += 36) { c.beginPath(); c.moveTo(0, y); c.lineTo(G.W, y); c.stroke(); }
    const t = performance.now() / 1000;
    for (const [lx, ph] of [[120, 0], [1160, 1.3]]) {
      const swv = Math.sin(t * 1.3 + ph) * 0.05;
      c.save(); c.translate(lx, 56); c.rotate(swv);
      c.strokeStyle = '#5a3a28'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 40); c.stroke();
      c.fillStyle = '#d23a3a'; c.beginPath(); c.ellipse(0, 80, 32, 40, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(120,20,20,0.5)';
      for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(0, 80, Math.abs(i) * 8 + 1, 40, 0, 0, 7); c.stroke(); }
      c.fillStyle = '#e9b949'; c.fillRect(-14, 38, 28, 6); c.fillRect(-14, 116, 28, 6);
      c.strokeStyle = '#e9b949'; c.beginPath(); c.moveTo(0, 122); c.lineTo(0, 150); c.stroke();
      c.restore();
    }
  }

  function tableBg(c) {
    c.fillStyle = '#c69a6b'; c.fillRect(0, 0, G.W, G.H);
    c.strokeStyle = 'rgba(90,50,20,0.10)'; c.lineWidth = 3;
    for (let y = 30; y < G.H; y += 26) {
      c.beginPath(); c.moveTo(0, y);
      for (let x = 0; x <= G.W; x += 80) c.lineTo(x, y + Math.sin(x * 0.01 + y) * 3);
      c.stroke();
    }
    const v = c.createRadialGradient(G.W / 2, G.H / 2, 200, G.W / 2, G.H / 2, 800);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(40,20,10,0.25)');
    c.fillStyle = v; c.fillRect(0, 0, G.W, G.H);
  }

  // studio backdrop for design / gallery
  function studioBg(c) {
    const g = c.createLinearGradient(0, 0, 0, G.H);
    g.addColorStop(0, '#f7ecdc'); g.addColorStop(1, '#ead6ba');
    c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
    const sp = c.createRadialGradient(330, 300, 30, 330, 300, 420);
    sp.addColorStop(0, 'rgba(255,255,255,0.55)'); sp.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sp; c.fillRect(0, 0, G.W, G.H);
    c.fillStyle = '#b48a62'; c.fillRect(0, 640, G.W, 80);
    c.fillStyle = 'rgba(0,0,0,0.1)'; c.fillRect(0, 640, G.W, 4);
  }

  return { fabric, fillFabric, pathPoly, coin, flower, star, lock, motif, patch, borderAlong, customer, garment, shopBg, tableBg, studioBg, mix, rgba, isLight, formTorso: mannequinTorso };
})();

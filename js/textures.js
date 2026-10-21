// Procedural fabric engine: weave (material) + pattern (repeat print) + technique finish.
// Also "placement prints": large artworks painted onto the assembled garment.
G.tex = (function () {
  const S = 256;

  // ---------- color helpers ----------
  function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
  function mix(h1, h2, t) { const a = hexToRgb(h1), b = hexToRgb(h2); return rgbToHex(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
  function rgba(h, a) { const c = hexToRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
  function lum(h) { const c = hexToRgb(h); return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; }
  function hsl(h) {
    let [r, g, b] = hexToRgb(h).map((v) => v / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let hh = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      hh /= 6;
    }
    return [hh * 360, s, l];
  }
  function fromHsl(hh, s, l) {
    hh = ((hh % 360) + 360) % 360 / 360;
    const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
    let r, g, b;
    if (s === 0) r = g = b = l;
    else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, hh + 1 / 3); g = f(p, q, hh); b = f(p, q, hh - 1 / 3); }
    return rgbToHex(r * 255, g * 255, b * 255);
  }
  function rotateHue(h, deg, sMul, lSet) { const [a, s, l] = hsl(h); return fromHsl(a + deg, Math.min(1, s * (sMul || 1)), lSet !== undefined ? lSet : l); }

  // palette derived from the base color
  function palette(hex) {
    const light = lum(hex) > 0.6;
    return {
      base: hex, light,
      dark: mix(hex, '#000000', 0.3), deep: mix(hex, '#000000', 0.55),
      pale: mix(hex, '#ffffff', 0.45), whisper: mix(hex, '#ffffff', 0.2),
      ink: light ? mix(hex, '#2a1a14', 0.7) : mix(hex, '#ffffff', 0.78),
      tone: light ? mix(hex, '#000000', 0.18) : mix(hex, '#ffffff', 0.22),
      gold: light ? '#a87a2a' : '#e8c063', gold2: light ? '#c89b3c' : '#f5dc94',
      comp: rotateHue(hex, 150, 0.9, light ? 0.45 : 0.72),
      ana: rotateHue(hex, 35, 1, light ? 0.5 : 0.7),
      leaf: light ? '#5d8a55' : '#8cc08a', cobalt: light ? '#1f4e9a' : '#dbe7fb'
    };
  }

  // ---------- seeded random ----------
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // draw fn at (x,y) and its wrapped copies so the tile repeats seamlessly
  function wrap(c, x, y, r, fn) {
    for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) {
      const X = x + dx, Y = y + dy;
      if (X + r < 0 || X - r > S || Y + r < 0 || Y - r > S) continue;
      c.save(); c.translate(X, Y); fn(c); c.restore();
    }
  }

  // ---------- motif primitives (local coords, centered) ----------
  const M = {
    flower(c, r, n, petal, center, round) {
      c.fillStyle = petal;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        c.save(); c.rotate(a); c.beginPath();
        if (round) c.arc(r * 0.55, 0, r * 0.45, 0, 7);
        else c.ellipse(r * 0.55, 0, r * 0.5, r * 0.3, 0, 0, 7);
        c.fill(); c.restore();
      }
      c.fillStyle = center; c.beginPath(); c.arc(0, 0, r * 0.25, 0, 7); c.fill();
    },
    leaf(c, len, w, ang, col, vein) {
      c.save(); c.rotate(ang);
      c.fillStyle = col; c.beginPath();
      c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -w, len, 0); c.quadraticCurveTo(len * 0.5, w, 0, 0); c.fill();
      if (vein) { c.strokeStyle = vein; c.lineWidth = Math.max(0.6, w * 0.12); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.9, 0); c.stroke(); }
      c.restore();
    },
    cloud(c, r, col, lw) {
      c.strokeStyle = col; c.lineWidth = lw; c.lineCap = 'round';
      c.beginPath(); c.arc(0, 0, r, Math.PI * 0.85, Math.PI * 2.25); c.stroke();
      c.beginPath(); c.arc(r * 1.45, r * 0.15, r * 0.7, Math.PI, Math.PI * 2.4); c.stroke();
      c.beginPath(); c.arc(-r * 0.15, r * 0.15, r * 0.45, 0, Math.PI * 1.5); c.stroke();
      c.beginPath(); c.moveTo(-r * 1.6, r * 0.9); c.quadraticCurveTo(0, r * 1.5, r * 2.6, r * 0.8); c.stroke();
    },
    lotus(c, r, pink, deep, center) {
      const pet = [[-1.0, 0.85], [-0.5, 0.95], [0, 1], [0.5, 0.95], [1.0, 0.85]];
      for (const [a, k] of pet) {
        c.save(); c.rotate(a * 0.9);
        const g = c.createLinearGradient(0, 0, 0, -r * k);
        g.addColorStop(0, deep); g.addColorStop(1, pink);
        c.fillStyle = g;
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.38, -r * 0.5 * k, 0, -r * k); c.quadraticCurveTo(-r * 0.38, -r * 0.5 * k, 0, 0); c.fill();
        c.restore();
      }
      c.fillStyle = center; c.beginPath(); c.ellipse(0, -r * 0.12, r * 0.18, r * 0.1, 0, 0, 7); c.fill();
    },
    peony(c, r, light, dark) {
      for (let ring = 0; ring < 3; ring++) {
        const rr = r * (1 - ring * 0.28), n = 7 - ring;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ring * 0.4;
          c.save(); c.rotate(a);
          const g = c.createRadialGradient(0, 0, 0, 0, 0, rr);
          g.addColorStop(0, dark); g.addColorStop(1, light);
          c.fillStyle = g;
          c.beginPath(); c.moveTo(0, 0);
          c.bezierCurveTo(rr * 0.5, -rr * 0.6, rr * 1.05, -rr * 0.2, rr * 0.95, rr * 0.1);
          c.bezierCurveTo(rr * 0.8, rr * 0.35, rr * 0.3, rr * 0.2, 0, 0); c.fill();
          c.restore();
        }
      }
      c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(0, 0, r * 0.12, 0, 7); c.fill();
    },
    chrys(c, r, col, dark) {
      for (let k = 0; k < 2; k++) {
        const n = 18 - k * 6, rr = r * (1 - k * 0.38);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + k * 0.2;
          c.save(); c.rotate(a);
          c.fillStyle = i % 2 ? col : dark;
          c.beginPath(); c.ellipse(rr * 0.55, 0, rr * 0.45, rr * 0.09, 0, 0, 7); c.fill();
          c.restore();
        }
      }
      c.fillStyle = dark; c.beginPath(); c.arc(0, 0, r * 0.16, 0, 7); c.fill();
    },
    crane(c, r, white, black, red) {
      c.fillStyle = white;
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-r * 0.6, -r * 0.8, -r * 1.1, -r * 0.55); c.quadraticCurveTo(-r * 0.6, -r * 0.1, 0, r * 0.12); c.fill();
      c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(r * 0.6, -r * 0.9, r * 1.05, -r * 0.75); c.quadraticCurveTo(r * 0.6, -r * 0.1, 0, r * 0.12); c.fill();
      c.fillStyle = black;
      c.beginPath(); c.moveTo(-r * 1.1, -r * 0.55); c.lineTo(-r * 0.85, -r * 0.6); c.lineTo(-r * 0.92, -r * 0.42); c.fill();
      c.beginPath(); c.moveTo(r * 1.05, -r * 0.75); c.lineTo(r * 0.8, -r * 0.72); c.lineTo(r * 0.86, -r * 0.56); c.fill();
      c.fillStyle = white; c.beginPath(); c.ellipse(0, r * 0.1, r * 0.2, r * 0.32, 0.25, 0, 7); c.fill();
      c.strokeStyle = white; c.lineWidth = r * 0.08; c.lineCap = 'round';
      c.beginPath(); c.moveTo(r * 0.06, -r * 0.1); c.quadraticCurveTo(r * 0.22, -r * 0.5, r * 0.04, -r * 0.62); c.stroke();
      c.fillStyle = red; c.beginPath(); c.arc(r * 0.04, -r * 0.65, r * 0.07, 0, 7); c.fill();
      c.strokeStyle = black; c.lineWidth = r * 0.035;
      c.beginPath(); c.moveTo(-r * 0.04, r * 0.4); c.lineTo(-r * 0.2, r * 0.9); c.moveTo(r * 0.06, r * 0.4); c.lineTo(r * 0.02, r * 0.9); c.stroke();
    },
    butterfly(c, r, a, b, body) {
      const wing = (x, y, rx, ry, ang, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, ang, 0, 7); c.fill(); };
      wing(-r * 0.45, -r * 0.25, r * 0.5, r * 0.32, -0.5, a); wing(r * 0.45, -r * 0.25, r * 0.5, r * 0.32, 0.5, a);
      wing(-r * 0.32, r * 0.3, r * 0.3, r * 0.22, 0.5, b); wing(r * 0.32, r * 0.3, r * 0.3, r * 0.22, -0.5, b);
      c.fillStyle = body; c.beginPath(); c.ellipse(0, 0, r * 0.07, r * 0.42, 0, 0, 7); c.fill();
    },
    koi(c, r, body, spot, fin) {
      c.fillStyle = fin;
      c.beginPath(); c.moveTo(-r * 0.9, 0); c.lineTo(-r * 1.35, -r * 0.35); c.quadraticCurveTo(-r * 1.15, 0, -r * 1.35, r * 0.35); c.closePath(); c.fill();
      c.fillStyle = body; c.beginPath(); c.ellipse(0, 0, r, r * 0.36, 0, 0, 7); c.fill();
      c.fillStyle = spot; c.beginPath(); c.ellipse(r * 0.15, -r * 0.08, r * 0.35, r * 0.2, 0.3, 0, 7); c.fill();
      c.beginPath(); c.ellipse(-r * 0.4, r * 0.06, r * 0.2, r * 0.14, -0.2, 0, 7); c.fill();
      c.fillStyle = fin; c.beginPath(); c.ellipse(r * 0.05, r * 0.36, r * 0.25, r * 0.1, 0.6, 0, 7); c.fill();
      c.fillStyle = '#222'; c.beginPath(); c.arc(r * 0.72, -r * 0.08, r * 0.05, 0, 7); c.fill();
    },
    tho(c, r, col) {
      // stylised round "Thọ" (longevity) medallion
      c.strokeStyle = col; c.lineWidth = r * 0.12; c.lineCap = 'square';
      c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
      c.lineWidth = r * 0.11;
      c.beginPath();
      c.moveTo(-r * 0.6, -r * 0.45); c.lineTo(r * 0.6, -r * 0.45);
      c.moveTo(-r * 0.6, r * 0.45); c.lineTo(r * 0.6, r * 0.45);
      c.moveTo(0, -r * 0.75); c.lineTo(0, r * 0.75);
      c.moveTo(-r * 0.35, -r * 0.45); c.lineTo(-r * 0.35, -r * 0.1); c.lineTo(r * 0.35, -r * 0.1); c.lineTo(r * 0.35, r * 0.2); c.lineTo(-r * 0.35, r * 0.2); c.lineTo(-r * 0.35, r * 0.45);
      c.stroke();
    },
    dragonRound(c, r, col, col2) {
      c.strokeStyle = col; c.lineWidth = r * 0.06;
      c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke();
      c.lineWidth = r * 0.16; c.lineCap = 'round';
      c.beginPath();
      for (let i = 0; i <= 30; i++) {
        const t = i / 30, a = t * Math.PI * 1.7 - 0.6, rr = r * (0.7 - t * 0.35);
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
      c.strokeStyle = col2; c.lineWidth = r * 0.05;
      c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(Math.cos(-0.6) * r * 0.7, Math.sin(-0.6) * r * 0.7, r * 0.16, 0, 7); c.fill();
      c.fillStyle = col2; c.beginPath(); c.arc(0, 0, r * 0.12, 0, 7); c.fill();
    }
  };

  // ---------- weaves (materials) ----------
  const weave = {
    lua(c, P, R) {
      c.fillStyle = P.base; c.fillRect(0, 0, S, S);
      c.fillStyle = 'rgba(255,255,255,0.03)';
      for (let y = 0; y < S; y += 2) c.fillRect(0, y, S, 1);
      for (let i = 0; i < 18; i++) { c.fillStyle = `rgba(255,255,255,${0.02 + R() * 0.03})`; c.fillRect(R() * S, R() * S, 20 + R() * 60, 1.2); }
    },
    totam(c, P, R) {
      c.fillStyle = P.base; c.fillRect(0, 0, S, S);
      c.strokeStyle = 'rgba(0,0,0,0.035)'; c.lineWidth = 1;
      for (let i = -S; i < S; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + S, S); c.stroke(); }
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,255,255,${0.04 + R() * 0.05})`; c.fillRect(R() * S, R() * S, 4 + R() * 18, 1 + R()); }
    },
    voan(c, P, R) {
      c.fillStyle = mix(P.base, '#ffffff', 0.22); c.fillRect(0, 0, S, S);
      for (let i = 0; i < 2500; i++) { c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.035)'; c.fillRect(R() * S, R() * S, 1.5, 1.5); }
    },
    chiffon(c, P, R) {
      c.fillStyle = mix(P.base, '#ffffff', 0.3); c.fillRect(0, 0, S, S);
      for (let i = 0; i < 1800; i++) { c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)'; c.fillRect(R() * S, R() * S, 2, 1); }
    },
    organza(c, P, R) {
      c.fillStyle = mix(P.base, '#ffffff', 0.25); c.fillRect(0, 0, S, S);
      c.strokeStyle = 'rgba(255,255,255,0.13)'; c.lineWidth = 0.8;
      for (let i = 0; i < S; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, S); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(S, i); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 2;
      for (let r = 20; r < 400; r += 14) { c.beginPath(); c.arc(-40, -60, r, 0, 7); c.stroke(); }
    },
    gam(c, P, R) {
      c.fillStyle = mix(P.base, '#000000', 0.08); c.fillRect(0, 0, S, S);
      c.strokeStyle = 'rgba(255,255,255,0.05)'; c.lineWidth = 1;
      for (let i = -S; i < S; i += 3) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + S, S); c.stroke(); }
    },
    nhung(c, P, R) {
      c.fillStyle = mix(P.base, '#000000', 0.2); c.fillRect(0, 0, S, S);
      for (let i = 0; i < 5000; i++) { c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)'; c.fillRect(R() * S, R() * S, 1.5, 1.5); }
      const g = c.createLinearGradient(0, 0, S, S); g.addColorStop(0, 'rgba(255,255,255,0.05)'); g.addColorStop(0.5, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0.05)');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
    },
    satin(c, P, R) {
      c.fillStyle = P.base; c.fillRect(0, 0, S, S);
      for (let i = 0; i < 6; i++) {
        const y = R() * S, g = c.createLinearGradient(0, y - 20, 0, y + 20);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.05)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, y - 20, S, 40);
      }
    },
    tafta(c, P, R) {
      c.fillStyle = P.base; c.fillRect(0, 0, S, S);
      c.fillStyle = 'rgba(0,0,0,0.05)'; for (let x = 0; x < S; x += 2) c.fillRect(x, 0, 1, S);
      const g = c.createLinearGradient(0, 0, S, S);
      g.addColorStop(0, rgba(rotateHue(P.base, 40), 0.1)); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, rgba(rotateHue(P.base, -40), 0.1));
      c.fillStyle = g; c.fillRect(0, 0, S, S);
    },
    ren(c, P, R) {
      c.fillStyle = mix(P.base, '#ffffff', 0.12); c.fillRect(0, 0, S, S);
      const lace = P.light ? 'rgba(255,255,255,0.55)' : rgba(mix(P.base, '#ffffff', 0.55), 0.6);
      c.strokeStyle = lace; c.lineWidth = 0.8;
      for (let y = 0; y < S; y += 8) for (let x = 0; x < S; x += 8) {
        c.beginPath(); c.arc(x + ((y / 8) % 2) * 4, y, 4, 0, 7); c.stroke();
      }
      c.lineWidth = 2.2;
      for (const [x, y] of [[64, 64], [192, 192], [192, 64], [64, 192]]) {
        wrap(c, x, y, 40, (k) => {
          for (let i = 0; i < 6; i++) { k.save(); k.rotate((i / 6) * Math.PI * 2); k.beginPath(); k.ellipse(14, 0, 12, 6, 0, 0, 7); k.stroke(); k.restore(); }
          k.beginPath(); k.arc(0, 0, 5, 0, 7); k.stroke();
          k.beginPath(); k.arc(0, 0, 30, 0, 7); k.setLineDash([3, 3]); k.stroke(); k.setLineDash([]);
        });
      }
    },
    dui(c, P, R) {
      c.fillStyle = mix(P.base, '#8a7a66', 0.08); c.fillRect(0, 0, S, S);
      for (let i = 0; i < 260; i++) {
        c.fillStyle = R() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
        if (R() < 0.5) c.fillRect(0, R() * S, S, 0.6 + R() * 1.6); else c.fillRect(R() * S, 0, 0.6 + R() * 1.6, S);
      }
    },
    mya(c, P, R) {
      c.fillStyle = mix(P.base, '#000000', 0.12); c.fillRect(0, 0, S, S);
      c.fillStyle = 'rgba(255,255,255,0.045)';
      for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x += 32) {
        const ox = ((y / 32) % 2) * 16;
        c.save(); c.translate(x + ox, y + 16); c.rotate(Math.PI / 4); c.fillRect(-5, -5, 10, 10); c.restore();
      }
      for (let i = 0; i < 8; i++) {
        const y = R() * S, g = c.createLinearGradient(0, y - 30, 0, y + 30);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.025)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, y - 30, S, 60);
      }
    },
    kimsa(c, P, R) {
      c.fillStyle = mix(P.base, '#000000', 0.25); c.fillRect(0, 0, S, S);
      for (let y = 0; y < S + 8; y += 7) for (let x = 0; x < S + 8; x += 7) {
        const ox = ((y / 7) % 2) * 3.5;
        const g = c.createRadialGradient(x + ox - 1, y - 1, 0, x + ox, y, 4.2);
        const b = R();
        g.addColorStop(0, b > 0.85 ? '#ffffff' : mix(P.base, '#ffffff', 0.4 + b * 0.3));
        g.addColorStop(1, mix(P.base, '#000000', 0.2));
        c.fillStyle = g; c.beginPath(); c.arc(x + ox, y, 4, 0, 7); c.fill();
      }
    },
    toong(c, P, R) {
      c.fillStyle = mix(P.base, '#ffffff', 0.18); c.fillRect(0, 0, S, S);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.05 + R() * 0.07})`; c.fillRect(0, R() * S, S, 1 + R() * 2); }
    }
  };

  // ---------- repeat patterns ----------
  // tech: in (printed) | det (woven) | ve (hand-painted) | theu (embroidered) | dinh (beaded)
  const P = {};
  const def = (id, name, tech, tier, scale, draw) => { P[id] = { id, name, tech, tier, scale, draw }; };
  def('tron', 'Trơn', 'in', 1, 1, () => {});
  def('hoanhi', 'Hoa nhí', 'in', 1, 0.8, (c, p, R) => {
    for (let i = 0; i < 26; i++) {
      const x = R() * S, y = R() * S, r = 4 + R() * 3, col = R() < 0.5 ? p.ink : p.comp;
      wrap(c, x, y, r * 2, (k) => { k.rotate(R() * 6); M.flower(k, r, 5, col, p.gold2, true); M.leaf(k, r * 1.6, r * 0.5, 0.8, p.leaf); });
    }
  });
  def('chambi', 'Chấm bi', 'in', 1, 0.9, (c, p) => {
    c.fillStyle = p.ink;
    for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x += 32) { c.beginPath(); c.arc(x + ((y / 32) % 2) * 16 + 8, y + 8, 6, 0, 7); c.fill(); }
  });
  def('soc', 'Sọc nhuyễn', 'det', 1, 1, (c, p) => {
    c.fillStyle = rgba(p.tone, 0.6); for (let x = 0; x < S; x += 10) c.fillRect(x, 0, 3, S);
    c.fillStyle = rgba(p.gold, 0.5); for (let x = 5; x < S; x += 40) c.fillRect(x, 0, 1.2, S);
  });
  def('caro', 'Kẻ ô', 'det', 1, 1.2, (c, p) => {
    c.fillStyle = rgba(p.tone, 0.35); for (let x = 0; x < S; x += 64) { c.fillRect(x, 0, 24, S); c.fillRect(0, x, S, 24); }
    c.fillStyle = rgba(p.comp, 0.45); for (let x = 40; x < S; x += 64) { c.fillRect(x, 0, 3, S); c.fillRect(0, x, S, 3); }
  });
  def('may', 'Vân mây', 'det', 2, 1.2, (c, p, R) => {
    for (const [x, y] of [[50, 60], [180, 120], [90, 200], [220, 230]]) wrap(c, x, y, 50, (k) => M.cloud(k, 12, p.gold, 3));
  });
  def('song', 'Sóng nước', 'in', 2, 0.9, (c, p) => {
    c.lineWidth = 2;
    for (let y = 0; y < S + 32; y += 24) for (let x = 0; x < S + 32; x += 32) {
      const ox = ((y / 24) % 2) * 16;
      for (const [r, col] of [[15, p.ink], [10, p.tone], [5, p.ink]]) { c.strokeStyle = col; c.beginPath(); c.arc(x + ox, y, r, Math.PI, Math.PI * 2); c.stroke(); }
    }
  });
  def('sen', 'Hoa sen', 'in', 2, 1.6, (c, p) => {
    for (const [x, y, sc] of [[64, 80, 1], [192, 210, 1], [190, 70, 0.7], [60, 200, 0.7]]) wrap(c, x, y, 50 * sc, (k) => {
      k.scale(sc, sc);
      M.leaf(k, 40, 14, 2.5, p.leaf, p.light ? '#3f6b3a' : '#cfe6c9');
      M.lotus(k, 30, '#f4a6bb', '#d9607f', '#f2c94c');
    });
  });
  def('maudon', 'Mẫu đơn dệt chìm', 'det', 3, 2, (c, p) => {
    // tone-on-tone damask ogee with peonies
    c.strokeStyle = rgba(p.tone, 0.7); c.lineWidth = 3;
    for (const ox of [0, S]) {
      c.beginPath(); c.moveTo(ox - 128, 0); c.bezierCurveTo(ox - 60, 64, ox - 60, 192, ox - 128, 256); c.stroke();
      c.beginPath(); c.moveTo(ox, 0); c.bezierCurveTo(ox - 68, 64, ox - 68, 192, ox, 256); c.stroke();
      c.beginPath(); c.moveTo(ox, 0); c.bezierCurveTo(ox + 68, 64, ox + 68, 192, ox, 256); c.stroke();
    }
    for (const [x, y] of [[128, 128], [0, 0], [256, 0], [0, 256], [256, 256]]) {
      c.save(); c.translate(x, y); M.peony(c, 34, p.tone, mix(p.tone, p.base, 0.5)); c.restore();
    }
  });
  def('chudau', 'Gốm Chu Đậu', 've', 3, 1.8, (c, p) => {
    const ink = p.cobalt;
    for (const [x, y] of [[64, 64], [192, 192]]) wrap(c, x, y, 70, (k) => {
      M.chrys(k, 24, ink, mix(ink, '#000000', 0.25));
      k.strokeStyle = ink; k.lineWidth = 2.4; k.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        k.rotate(Math.PI / 2);
        k.beginPath(); k.moveTo(26, 0); k.bezierCurveTo(40, -18, 56, 10, 64, -6); k.stroke();
        M.leaf(k, 16, 5, -0.6, ink);
      }
    });
    c.fillStyle = ink;
    for (const [x, y] of [[192, 64], [64, 192]]) { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
  });
  def('tho', 'Chữ Thọ', 'det', 3, 1.3, (c, p) => {
    for (let y = 0; y < S; y += 64) for (let x = 0; x < S; x += 64) {
      const ox = ((y / 64) % 2) * 32;
      wrap(c, x + ox + 32, y + 32, 20, (k) => M.tho(k, 14, p.gold));
    }
  });
  def('cungdinh', 'Rồng mây cung đình', 'theu', 4, 2, (c, p) => {
    wrap(c, 128, 128, 60, (k) => M.dragonRound(k, 44, p.gold, p.gold2));
    for (const [x, y] of [[20, 30], [230, 40], [30, 230], [235, 220]]) wrap(c, x, y, 40, (k) => M.cloud(k, 9, p.gold, 2.6));
  });
  def('thocam', 'Thổ cẩm', 'det', 3, 1.4, (c, p) => {
    const cols = ['#c0392b', '#1d1d1d', '#f1c40f', '#ffffff', '#2e86c1'];
    for (let band = 0; band < 4; band++) {
      const y0 = band * 64;
      c.fillStyle = cols[band % cols.length]; c.fillRect(0, y0 + 2, S, 6); c.fillRect(0, y0 + 56, S, 6);
      for (let x = 0; x < S; x += 32) {
        c.fillStyle = cols[(band + 2) % cols.length];
        c.beginPath(); c.moveTo(x + 16, y0 + 14); c.lineTo(x + 30, y0 + 32); c.lineTo(x + 16, y0 + 50); c.lineTo(x + 2, y0 + 32); c.closePath(); c.fill();
        c.fillStyle = cols[(band + 3) % cols.length];
        c.beginPath(); c.moveTo(x + 16, y0 + 24); c.lineTo(x + 24, y0 + 32); c.lineTo(x + 16, y0 + 40); c.lineTo(x + 8, y0 + 32); c.closePath(); c.fill();
      }
    }
  });
  def('trongdong', 'Trống đồng', 'det', 3, 1.6, (c, p) => {
    for (const [x, y] of [[64, 64], [192, 192]]) wrap(c, x, y, 64, (k) => {
      k.strokeStyle = p.gold;
      for (const [r, w] of [[56, 3], [46, 1.5], [30, 1.5]]) { k.lineWidth = w; k.beginPath(); k.arc(0, 0, r, 0, 7); k.stroke(); }
      k.fillStyle = p.gold; k.beginPath();
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 6 : 22; k.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      k.closePath(); k.fill();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; k.save(); k.rotate(a); k.translate(38, 0); k.beginPath(); k.moveTo(-4, 0); k.lineTo(0, -4); k.lineTo(6, 1); k.lineTo(0, 2); k.fill(); k.restore(); }
    });
  });
  def('tre', 'Tre trúc', 've', 2, 1.6, (c, p) => {
    for (const [x, y, a] of [[40, 40, 0.3], [170, 90, -0.4], [90, 180, 0.9], [220, 220, 2.2], [130, 20, 3.4]]) wrap(c, x, y, 50, (k) => {
      k.rotate(a);
      for (let i = 0; i < 5; i++) M.leaf(k, 34, 6, -0.5 + i * 0.25, rgba(p.light ? '#3d6b3a' : '#bfe0b5', 0.85));
    });
  });
  def('hinhhoc', 'Hình học hiện đại', 'in', 2, 1.4, (c, p) => {
    const cols = [p.comp, p.ana, p.pale, p.dark];
    for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x += 32) {
      c.fillStyle = rgba(cols[((x + y) / 32) % 4], 0.55);
      c.beginPath();
      if (((x / 32) + (y / 32)) % 2) { c.moveTo(x, y); c.lineTo(x + 32, y); c.lineTo(x, y + 32); }
      else { c.moveTo(x + 32, y + 32); c.lineTo(x + 32, y); c.lineTo(x, y + 32); }
      c.fill();
    }
  });
  def('dao', 'Hoa đào', 've', 2, 1.4, (c, p, R) => {
    for (const [x, y, a] of [[60, 70, 0.4], [190, 180, -0.8]]) wrap(c, x, y, 90, (k) => {
      k.rotate(a);
      k.strokeStyle = '#5b3a29'; k.lineWidth = 3.5; k.lineCap = 'round';
      k.beginPath(); k.moveTo(-70, 20); k.quadraticCurveTo(-10, -10, 70, -20); k.stroke();
      k.lineWidth = 2; k.beginPath(); k.moveTo(-10, 0); k.quadraticCurveTo(10, 30, 30, 40); k.stroke();
      for (const [fx, fy, r] of [[-40, 8, 9], [-5, -4, 11], [30, -12, 8], [55, -18, 6], [22, 30, 8]]) { k.save(); k.translate(fx, fy); M.flower(k, r, 5, '#f7b6c8', '#c2456a', true); k.restore(); }
    });
  });
  def('mai', 'Hoa mai', 've', 2, 1.4, (c, p) => {
    for (const [x, y, a] of [[70, 60, -0.3], [190, 190, 0.6]]) wrap(c, x, y, 90, (k) => {
      k.rotate(a);
      k.strokeStyle = '#5b3a29'; k.lineWidth = 3.5; k.lineCap = 'round';
      k.beginPath(); k.moveTo(-70, 10); k.quadraticCurveTo(0, -20, 70, 5); k.stroke();
      for (const [fx, fy, r] of [[-45, 0, 9], [-10, -10, 11], [25, -6, 9], [55, 2, 7]]) { k.save(); k.translate(fx, fy); M.flower(k, r, 5, '#f7cf45', '#e07b26', true); k.restore(); }
    });
  });
  def('hac', 'Hạc & mây', 'theu', 4, 2, (c, p) => {
    wrap(c, 80, 90, 60, (k) => M.crane(k, 34, '#fbfaf5', '#2b2422', '#d23a3a'));
    wrap(c, 200, 200, 60, (k) => { k.scale(-0.8, 0.8); M.crane(k, 34, '#fbfaf5', '#2b2422', '#d23a3a'); });
    for (const [x, y] of [[200, 60], [60, 210]]) wrap(c, x, y, 40, (k) => M.cloud(k, 9, p.gold, 2.4));
  });
  def('buom', 'Bướm', 'in', 2, 1.1, (c, p, R) => {
    for (let i = 0; i < 7; i++) {
      const x = R() * S, y = R() * S, r = 12 + R() * 8;
      wrap(c, x, y, r * 1.2, (k) => { k.rotate(R() - 0.5); M.butterfly(k, r, rgba(p.comp, 0.85), rgba(p.ana, 0.85), p.ink); });
    }
  });
  def('cachep', 'Cá chép', 've', 3, 1.8, (c, p) => {
    wrap(c, 80, 80, 60, (k) => { k.rotate(0.4); M.koi(k, 30, '#f6f1e7', '#e2552d', '#f39c6b'); });
    wrap(c, 190, 190, 60, (k) => { k.rotate(-2.6); M.koi(k, 26, '#f39c12', '#ffffff', '#f8c471'); });
    c.strokeStyle = rgba(p.ink, 0.35); c.lineWidth = 1.5;
    for (const [x, y] of [[190, 60], [60, 200]]) { for (const r of [6, 12, 18]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); } }
  });
  def('cuc', 'Hoa cúc', 'in', 2, 1.2, (c, p) => {
    for (const [x, y, r] of [[60, 60, 22], [190, 120, 16], [110, 200, 18], [230, 230, 12]]) wrap(c, x, y, r + 6, (k) => M.chrys(k, r, '#f2c94c', '#d68910'));
  });
  def('hoahong', 'Hoa hồng', 'in', 2, 1.3, (c, p) => {
    for (const [x, y, r] of [[64, 64, 22], [192, 160, 26], [100, 210, 16]]) wrap(c, x, y, r + 20, (k) => {
      M.leaf(k, r * 1.4, r * 0.45, 2.2, p.leaf); M.leaf(k, r * 1.3, r * 0.4, 0.6, p.leaf);
      M.peony(k, r, '#e85a71', '#9b1b30');
    });
  });
  def('nhietdoi', 'Lá nhiệt đới', 'in', 2, 1.8, (c, p) => {
    for (const [x, y, a, l] of [[50, 60, 0.6, 70], [180, 100, -0.8, 80], [100, 200, 2.3, 70], [220, 220, 3.6, 60]]) wrap(c, x, y, l, (k) => {
      k.rotate(a);
      for (let i = -4; i <= 4; i++) M.leaf(k, l * (1 - Math.abs(i) * 0.08), 7, i * 0.22, rgba(p.light ? '#2f6b45' : '#9fd8b0', 0.9));
    });
  });
  def('kimsa', 'Đính kim sa', 'dinh', 4, 0.6, (c, p, R) => {
    for (let i = 0; i < 260; i++) {
      const x = R() * S, y = R() * S;
      c.fillStyle = R() < 0.6 ? p.gold2 : '#ffffff';
      c.beginPath(); c.arc(x, y, 1.6 + R() * 1.4, 0, 7); c.fill();
    }
  });
  def('ketcuom', 'Kết cườm hoa', 'dinh', 5, 1.5, (c, p) => {
    for (const [x, y] of [[64, 64], [192, 192]]) wrap(c, x, y, 50, (k) => {
      for (let ring = 1; ring <= 3; ring++) for (let i = 0; i < ring * 8; i++) {
        const a = (i / (ring * 8)) * Math.PI * 2;
        k.fillStyle = ring === 2 ? '#ffffff' : p.gold2;
        k.beginPath(); k.arc(Math.cos(a) * ring * 11, Math.sin(a) * ring * 11, 2.6, 0, 7); k.fill();
      }
    });
  });

  def('quatram', 'Quả trám dệt chìm', 'det', 2, 1, (c, p) => {
    c.strokeStyle = rgba(p.tone, 0.8); c.lineWidth = 2;
    for (let i = -S; i < S * 2; i += 32) {
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + S, S); c.stroke();
      c.beginPath(); c.moveTo(i, S); c.lineTo(i + S, 0); c.stroke();
    }
    c.fillStyle = rgba(p.tone, 0.8);
    for (let y = 0; y <= S; y += 32) for (let x = 0; x <= S; x += 32) { c.save(); c.translate(x + 16, y + 16); c.rotate(Math.PI / 4); c.fillRect(-4, -4, 8, 8); c.restore(); }
  });
  def('battu', 'Bát bửu', 'det', 3, 1.5, (c, p) => {
    const icons = [
      (k) => { k.beginPath(); k.moveTo(0, -10); k.quadraticCurveTo(8, 0, 0, 10); k.quadraticCurveTo(-8, 0, 0, -10); k.fill(); },
      (k) => { k.fillRect(-9, -3, 18, 6); k.beginPath(); k.arc(-9, 0, 4, 0, 7); k.arc(9, 0, 4, 0, 7); k.fill(); },
      (k) => { k.beginPath(); k.moveTo(-8, 8); k.lineTo(0, -10); k.lineTo(8, 8); k.closePath(); k.fill(); },
      (k) => { k.beginPath(); k.arc(0, 0, 9, 0, 7); k.fill(); k.fillStyle = p.base; k.beginPath(); k.arc(0, 0, 4, 0, 7); k.fill(); }
    ];
    let n = 0;
    for (let y = 0; y < S; y += 64) for (let x = 0; x < S; x += 64) {
      const ox = ((y / 64) % 2) * 32;
      wrap(c, x + ox + 32, y + 32, 22, (k) => {
        k.strokeStyle = p.gold; k.lineWidth = 1.5; k.save(); k.rotate(Math.PI / 4); k.strokeRect(-16, -16, 32, 32); k.restore();
        k.fillStyle = p.gold; icons[n % 4](k);
      });
      n++;
    }
  });
  def('tamthai', 'Men tam thái', 've', 3, 1.7, (c, p) => {
    const cols = ['#8b3a1e', '#4e7d3a', '#d9a441'];
    for (const [x, y, i] of [[64, 64, 0], [192, 192, 1], [192, 64, 2], [64, 192, 1]]) wrap(c, x, y, 50, (k) => {
      for (let j = 0; j < 6; j++) { k.save(); k.rotate((j / 6) * Math.PI * 2); M.leaf(k, 30, 10, 0, rgba(cols[(i + j) % 3], 0.85)); k.restore(); }
      k.fillStyle = cols[(i + 2) % 3]; k.beginPath(); k.arc(0, 0, 8, 0, 7); k.fill();
    });
  });
  def('dongho', 'Tranh Đông Hồ', 'in', 3, 2.2, (c, p) => {
    const ground = '#ede0c8';
    for (const [x, y, kind] of [[64, 64, 0], [192, 192, 1]]) wrap(c, x, y, 64, (k) => {
      k.fillStyle = ground; k.fillRect(-46, -46, 92, 92);
      k.strokeStyle = '#1c1c1c'; k.lineWidth = 2.5; k.strokeRect(-46, -46, 92, 92);
      if (kind === 0) { k.rotate(-0.3); M.koi(k, 26, '#c0392b', '#f1c40f', '#c0392b'); k.strokeStyle = '#1c1c1c'; k.lineWidth = 1.5; k.beginPath(); k.ellipse(0, 0, 26, 9.4, 0, 0, 7); k.stroke(); }
      else {
        k.fillStyle = '#c0392b'; k.beginPath(); k.ellipse(0, 6, 22, 16, 0, 0, 7); k.fill();
        k.fillStyle = '#27ae60'; k.beginPath(); k.moveTo(-20, 0); k.quadraticCurveTo(-40, -20, -30, -34); k.quadraticCurveTo(-20, -10, -14, -4); k.fill();
        k.fillStyle = '#f1c40f'; k.beginPath(); k.arc(16, -14, 9, 0, 7); k.fill();
        k.fillStyle = '#c0392b'; k.beginPath(); k.moveTo(14, -24); k.lineTo(18, -32); k.lineTo(22, -23); k.fill();
        k.strokeStyle = '#1c1c1c'; k.lineWidth = 1.5; k.beginPath(); k.ellipse(0, 6, 22, 16, 0, 0, 7); k.stroke();
        k.beginPath(); k.moveTo(-6, 22); k.lineTo(-8, 34); k.moveTo(6, 22); k.lineTo(8, 34); k.stroke();
      }
    });
  });
  def('lan', 'Hoa lan', 've', 3, 1.6, (c, p) => {
    for (const [x, y, a] of [[70, 60, 0.3], [190, 190, -2.4]]) wrap(c, x, y, 80, (k) => {
      k.rotate(a);
      k.strokeStyle = '#4f6b3a'; k.lineWidth = 2;
      k.beginPath(); k.moveTo(-50, 30); k.quadraticCurveTo(0, -30, 50, -10); k.stroke();
      for (const [fx, fy] of [[-20, -2], [8, -14], [32, -14]]) {
        k.save(); k.translate(fx, fy);
        k.fillStyle = '#c39bd3'; for (let i = 0; i < 5; i++) { k.rotate((Math.PI * 2) / 5); k.beginPath(); k.ellipse(7, 0, 7, 3.4, 0, 0, 7); k.fill(); }
        k.fillStyle = '#8e5baa'; k.beginPath(); k.ellipse(0, 3, 4, 5, 0, 0, 7); k.fill();
        k.restore();
      }
      M.leaf(k, 60, 6, 2.6, 'rgba(79,107,58,0.85)');
    });
  });
  def('henna', 'Mandala henna', 'in', 3, 1.5, (c, p) => {
    for (const [x, y] of [[64, 64], [192, 192]]) wrap(c, x, y, 60, (k) => {
      k.strokeStyle = p.ink; k.lineWidth = 1.2;
      for (const r of [10, 22, 40, 52]) { k.beginPath(); k.arc(0, 0, r, 0, 7); k.stroke(); }
      for (let i = 0; i < 12; i++) {
        k.save(); k.rotate((i / 12) * Math.PI * 2);
        k.beginPath(); k.ellipse(31, 0, 9, 4, 0, 0, 7); k.stroke();
        k.beginPath(); k.arc(46, 0, 3, 0, 7); k.stroke();
        k.beginPath(); k.moveTo(10, 0); k.quadraticCurveTo(16, 6, 22, 0); k.stroke();
        k.restore();
      }
    });
  });
  def('artdeco', 'Quạt Art Deco', 'in', 2, 1.3, (c, p) => {
    c.lineWidth = 1.6;
    for (let y = 0; y < S + 32; y += 32) for (let x = 0; x < S + 64; x += 64) {
      const ox = ((y / 32) % 2) * 32;
      for (const [r, col] of [[30, p.gold], [22, p.ink], [14, p.gold]]) { c.strokeStyle = col; c.beginPath(); c.arc(x + ox, y + 32, r, Math.PI, Math.PI * 2); c.stroke(); }
      c.strokeStyle = rgba(p.gold, 0.6);
      for (let i = 1; i < 6; i++) { const a = Math.PI + (i / 6) * Math.PI; c.beginPath(); c.moveTo(x + ox, y + 32); c.lineTo(x + ox + Math.cos(a) * 30, y + 32 + Math.sin(a) * 30); c.stroke(); }
    }
  });
  def('battrang', 'Gốm Bát Tràng', 've', 3, 1.6, (c, p) => {
    const ink = p.cobalt;
    for (let y = 0; y < S; y += 128) {
      c.fillStyle = ink;
      for (let x = 0; x < S; x += 16) { c.beginPath(); c.moveTo(x, y + 10); c.quadraticCurveTo(x + 8, y - 4, x + 16, y + 10); c.fill(); }
      wrap(c, 64 + (y / 128) * 64, y + 70, 50, (k) => { M.lotus(k, 26, ink, mix(ink, '#000000', 0.3), '#ffffff'); M.leaf(k, 30, 9, 2.7, ink); M.leaf(k, 28, 8, 0.4, ink); });
      wrap(c, 192 + (y / 128) * 64, y + 70, 30, (k) => { k.strokeStyle = ink; k.lineWidth = 2.5; k.beginPath(); k.moveTo(-6, 26); k.lineTo(-2, -26); k.moveTo(6, 26); k.lineTo(8, -20); k.stroke(); M.leaf(k, 20, 4, -0.8, ink); M.leaf(k, 18, 4, -2.3, ink); });
    }
  });

  // ---------- technique finishing ----------
  function finish(c, layer, tech, R) {
    if (tech === 'in') { c.globalAlpha = 0.92; c.drawImage(layer, 0, 0); c.globalAlpha = 1; return; }
    if (tech === 've') { c.save(); c.filter = 'blur(0.6px)'; c.globalAlpha = 0.9; c.drawImage(layer, 0, 0); c.restore(); return; }
    if (tech === 'det') { c.globalAlpha = 0.85; c.drawImage(layer, 0, 0); c.globalAlpha = 1; return; }
    if (tech === 'theu' || tech === 'dinh') {
      const lc = layer.getContext('2d');
      if (tech === 'theu') {
        lc.save(); lc.globalCompositeOperation = 'source-atop'; lc.lineWidth = 0.8;
        for (let i = -S; i < S * 2; i += 2.2) { lc.strokeStyle = (i / 2.2) % 2 < 1 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'; lc.beginPath(); lc.moveTo(i, 0); lc.lineTo(i + S * 0.6, S); lc.stroke(); }
        lc.restore();
      }
      c.save(); c.filter = 'brightness(0) blur(1px)'; c.globalAlpha = 0.35; c.drawImage(layer, 1, 1.5); c.restore();
      c.drawImage(layer, 0, 0);
      if (tech === 'dinh') {
        c.fillStyle = 'rgba(255,255,255,0.9)';
        const d = lc.getImageData(0, 0, S, S).data;
        for (let i = 0; i < 160; i++) {
          const x = Math.floor(R() * S), y = Math.floor(R() * S);
          if (d[(y * S + x) * 4 + 3] > 100) { c.beginPath(); c.arc(x, y, 1.1, 0, 7); c.fill(); }
        }
      }
    }
  }

  // ---------- placement prints (drawn on the assembled garment, cm units) ----------
  const PL = {};
  const place = (id, name, tech, tier, draw) => { PL[id] = { id, name, tech, tier, draw, placement: true, scale: 1 }; };
  // each draw(c, asm, pal, s, sw) — clipped to the body by the caller
  place('sen_ve', 'Sen vẽ tay (đặt)', 've', 4, (c, a, p, s, sw) => {
    const h = a.hemY;
    for (const [x, y, sc, ang] of [[-10, h - 14, 1.1, -0.3], [8, h - 6, 1.3, 0.25], [14, h - 30, 0.8, 0.5]]) {
      const q = sw({ x: x * s, y: y }); c.save(); c.translate(q.x, q.y); c.rotate(ang);
      c.fillStyle = 'rgba(70,130,80,0.9)'; c.beginPath(); c.ellipse(0, 0, 9 * s * sc, 4 * s * sc, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(40,90,50,0.8)'; c.lineWidth = 0.3 * s; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 0.8) * 8 * s * sc, Math.sin(i * 0.8) * 3.6 * s * sc); c.stroke(); }
      c.restore();
    }
    for (const [x0, y1, sc] of [[-4, a.slitY + 18 * s, 1], [6, a.slitY + 40 * s, 0.8], [-12, a.slitY + 50 * s, 0.65]]) {
      const top = sw({ x: x0 * s, y: y1 }), bot = sw({ x: (x0 + 3) * s, y: h - 8 * s });
      c.strokeStyle = 'rgba(70,120,70,0.9)'; c.lineWidth = 0.45 * s;
      c.beginPath(); c.moveTo(bot.x, bot.y); c.quadraticCurveTo(bot.x - 4 * s, (top.y + bot.y) / 2, top.x, top.y); c.stroke();
      c.save(); c.translate(top.x, top.y); M.lotus(c, 7 * s * sc, '#f7b3c4', '#d8577a', '#f2c94c'); c.restore();
    }
  });
  place('maudon_canh', 'Cành mẫu đơn (đặt)', 've', 4, (c, a, p, s, sw) => {
    const pts = [sw({ x: 14 * s, y: a.hemY - 20 * s }), sw({ x: 4 * s, y: a.slitY + 10 * s }), { x: -6 * s, y: 30 * s }, { x: -12 * s, y: 8 * s }];
    c.strokeStyle = '#4e3a2c'; c.lineWidth = 0.6 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(pts[0].x, pts[0].y); c.bezierCurveTo(pts[1].x, pts[1].y, pts[2].x, pts[2].y, pts[3].x, pts[3].y); c.stroke();
    const at = (t) => { const u = 1 - t; return { x: u * u * u * pts[0].x + 3 * u * u * t * pts[1].x + 3 * u * t * t * pts[2].x + t * t * t * pts[3].x, y: u * u * u * pts[0].y + 3 * u * u * t * pts[1].y + 3 * u * t * t * pts[2].y + t * t * t * pts[3].y }; };
    [[0.15, 7], [0.42, 9], [0.7, 6.5], [0.92, 5]].forEach(([t, r], i) => {
      const q = at(t);
      c.save(); c.translate(q.x, q.y);
      M.leaf(c, r * 1.6 * s, r * 0.5 * s, 2.4 + i, 'rgba(80,130,80,0.9)');
      M.leaf(c, r * 1.5 * s, r * 0.45 * s, 0.4 - i * 0.3, 'rgba(80,130,80,0.9)');
      M.peony(c, r * s, i % 2 ? '#f6c1cf' : '#e8738f', i % 2 ? '#d86a88' : '#a8304d');
      c.restore();
    });
  });
  place('hac_bay', 'Đàn hạc bay (đặt)', 'theu', 4, (c, a, p, s, sw) => {
    for (const [x, y, sc, f] of [[-6, 22, 0.9, 1], [8, 40, 0.7, -1], [-2, 62, 0.55, 1]]) {
      c.save(); c.translate(x * s, y * s); c.scale(f * sc, sc); M.crane(c, 9 * s, '#fbfaf5', '#2b2422', '#d23a3a'); c.restore();
    }
    for (const [x, y] of [[-10, a.hemY / s - 20], [10, a.hemY / s - 10], [2, a.hemY / s - 34]]) {
      const q = sw({ x: x * s, y: y * s }); c.save(); c.translate(q.x, q.y); M.cloud(c, 2.6 * s, p.gold, 0.5 * s); c.restore();
    }
  });
  place('ombre', 'Nhuộm loang (ombre)', 've', 3, (c, a, p, s, sw, accent) => {
    const g = c.createLinearGradient(0, 10 * s, 0, a.hemY);
    g.addColorStop(0, rgba(accent, 0)); g.addColorStop(0.45, rgba(accent, 0.35)); g.addColorStop(1, rgba(accent, 0.9));
    c.fillStyle = g; c.fillRect(-60 * s, -10 * s, 120 * s, a.hemY + 20 * s);
  });
  place('phongcanh', 'Sơn thuỷ (đặt)', 've', 4, (c, a, p, s, sw) => {
    const h = a.hemY;
    const ink = p.light ? '#3a4a5a' : '#dfe8ef';
    for (const [x, w, hh, al] of [[-10, 26, 40, 0.35], [8, 30, 30, 0.5], [-2, 20, 22, 0.65]]) {
      const base = sw({ x: x * s, y: h - 16 * s });
      c.fillStyle = rgba(ink, al);
      c.beginPath(); c.moveTo(base.x - w * s / 2, base.y); c.quadraticCurveTo(base.x - w * s / 6, base.y - hh * s, base.x, base.y - hh * s * 0.9);
      c.quadraticCurveTo(base.x + w * s / 5, base.y - hh * s * 0.6, base.x + w * s / 2, base.y); c.fill();
    }
    c.strokeStyle = rgba(ink, 0.7); c.lineWidth = 0.35 * s;
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      for (let x = -25; x <= 25; x += 2) { const q = sw({ x: x * s, y: h - (12 - k * 3) * s + Math.sin(x * 0.5 + k) * 0.8 * s }); x === -25 ? c.moveTo(q.x, q.y) : c.lineTo(q.x, q.y); }
      c.stroke();
    }
    c.fillStyle = rgba(ink, 0.9);
    const b = sw({ x: 6 * s, y: h - 13 * s });
    c.beginPath(); c.moveTo(b.x - 3 * s, b.y); c.lineTo(b.x + 3 * s, b.y); c.lineTo(b.x + 2 * s, b.y + 1 * s); c.lineTo(b.x - 2 * s, b.y + 1 * s); c.fill();
    c.beginPath(); c.arc(-8 * s, 18 * s, 3 * s, 0, 7); c.fillStyle = rgba('#e2483d', 0.7); c.fill();
  });
  place('dao_canh', 'Cành đào vai (đặt)', 've', 3, (c, a, p, s) => {
    c.strokeStyle = '#4e3a2c'; c.lineWidth = 0.55 * s; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-18 * s, 2 * s); c.bezierCurveTo(-8 * s, 12 * s, -4 * s, 24 * s, 6 * s, 40 * s); c.stroke();
    c.lineWidth = 0.35 * s; c.beginPath(); c.moveTo(-9 * s, 14 * s); c.quadraticCurveTo(0, 14 * s, 6 * s, 10 * s); c.stroke();
    for (const [x, y, r] of [[-14, 6, 2.2], [-9, 13, 2.6], [-3, 23, 2.4], [3, 33, 2], [6, 10, 2], [6, 40, 1.6], [-6, 18, 1.4]]) {
      c.save(); c.translate(x * s, y * s); M.flower(c, r * s, 5, '#f7b6c8', '#c2456a', true); c.restore();
    }
  });
  place('rong_vang', 'Rồng vàng thêu (đặt)', 'theu', 5, (c, a, p, s, sw) => {
    const gold = '#e8b844', dark = '#9c6a14';
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, y = 14 + t * (a.hemY / s - 30);
      pts.push(sw({ x: Math.sin(t * Math.PI * 3) * 9 * s, y: y * s }));
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = dark; c.lineWidth = 3.4 * s; c.beginPath(); pts.forEach((q, i) => (i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y))); c.stroke();
    c.strokeStyle = gold; c.lineWidth = 2.6 * s; c.stroke();
    c.strokeStyle = dark; c.lineWidth = 0.25 * s;
    for (let i = 2; i < 60; i += 2) { const q = pts[i]; c.beginPath(); c.arc(q.x, q.y + 0.3 * s, 0.9 * s, 0.2, Math.PI - 0.2); c.stroke(); }
    c.fillStyle = '#d2483d';
    for (let i = 4; i < 58; i += 4) { const q = pts[i]; c.beginPath(); c.moveTo(q.x - 0.6 * s, q.y - 1 * s); c.lineTo(q.x, q.y - 2.6 * s); c.lineTo(q.x + 0.6 * s, q.y - 1 * s); c.fill(); }
    const h0 = pts[0];
    c.fillStyle = gold; c.beginPath(); c.ellipse(h0.x, h0.y - 2 * s, 3 * s, 2.2 * s, 0, 0, 7); c.fill();
    c.strokeStyle = gold; c.lineWidth = 0.5 * s;
    c.beginPath(); c.moveTo(h0.x - 2 * s, h0.y - 3.5 * s); c.quadraticCurveTo(h0.x - 5 * s, h0.y - 7 * s, h0.x - 7 * s, h0.y - 6 * s); c.moveTo(h0.x + 2 * s, h0.y - 3.5 * s); c.quadraticCurveTo(h0.x + 5 * s, h0.y - 7 * s, h0.x + 7 * s, h0.y - 6 * s); c.stroke();
    c.fillStyle = '#f6d26b'; c.beginPath(); c.arc(h0.x + 5 * s, h0.y + 1 * s, 1.3 * s, 0, 7); c.fill();
  });
  place('chudau_lon', 'Hoa gốm lam (đặt)', 've', 4, (c, a, p, s, sw) => {
    const ink = p.light ? '#1f4e9a' : '#dbe7fb';
    const ctr = sw({ x: 0, y: (a.slitY + a.hemY) / 2 });
    c.save(); c.translate(ctr.x, ctr.y);
    M.chrys(c, 9 * s, ink, mix(ink, '#000000', 0.3));
    c.strokeStyle = ink; c.lineWidth = 0.55 * s; c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      c.save(); c.rotate((i / 6) * Math.PI * 2);
      c.beginPath(); c.moveTo(10 * s, 0); c.bezierCurveTo(16 * s, -6 * s, 20 * s, 4 * s, 26 * s, -2 * s); c.stroke();
      M.leaf(c, 6 * s, 2 * s, -0.5, ink); c.translate(26 * s, -2 * s); M.flower(c, 2.4 * s, 6, ink, '#ffffff');
      c.restore();
    }
    c.restore();
    c.strokeStyle = ink; c.lineWidth = 0.4 * s;
    for (const y of [a.hemY - 6 * s, a.hemY - 4.5 * s]) { c.beginPath(); for (let x = -26; x <= 26; x += 2) { const q = sw({ x: x * s, y }); x === -26 ? c.moveTo(q.x, q.y) : c.lineTo(q.x, q.y); } c.stroke(); }
  });
  place('phuong_lon', 'Phượng hoàng (đặt)', 'theu', 5, (c, a, p, s, sw) => {
    const cols = ['#e2483d', '#f2a33a', '#f6d26b', '#3aa6a0'];
    c.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const end = sw({ x: (-14 + i * 7) * s, y: a.hemY - (8 + i * 4) * s });
      c.strokeStyle = cols[i % 4]; c.lineWidth = 1.1 * s;
      c.beginPath(); c.moveTo(0, 26 * s); c.bezierCurveTo(-10 * s + i * 4 * s, a.slitY, 10 * s - i * 3 * s, (a.slitY + a.hemY) / 2, end.x, end.y); c.stroke();
      c.fillStyle = cols[(i + 1) % 4]; c.beginPath(); c.ellipse(end.x, end.y, 2.2 * s, 1.4 * s, 0.5, 0, 7); c.fill();
      c.fillStyle = cols[(i + 2) % 4]; c.beginPath(); c.arc(end.x, end.y, 0.8 * s, 0, 7); c.fill();
    }
    c.fillStyle = '#e2483d'; c.beginPath(); c.ellipse(0, 24 * s, 4 * s, 3 * s, -0.4, 0, 7); c.fill();
    for (const side of [-1, 1]) {
      c.fillStyle = side < 0 ? '#f2a33a' : '#e2483d';
      c.beginPath(); c.moveTo(0, 22 * s); c.quadraticCurveTo(side * 12 * s, 8 * s, side * 15 * s, 16 * s); c.quadraticCurveTo(side * 8 * s, 20 * s, 0, 26 * s); c.fill();
    }
    c.fillStyle = '#e2483d'; c.beginPath(); c.arc(3 * s, 18 * s, 1.6 * s, 0, 7); c.fill();
    c.fillStyle = '#f6d26b'; c.beginPath(); c.moveTo(4.4 * s, 18 * s); c.lineTo(6.5 * s, 18.6 * s); c.lineTo(4.4 * s, 19.2 * s); c.fill();
  });
  place('tre_ve', 'Rặng tre (đặt)', 've', 3, (c, a, p, s, sw) => {
    const h = a.hemY;
    for (const [x, top] of [[-14, 0.35], [-9, 0.45], [10, 0.4], [15, 0.55]]) {
      const b = sw({ x: x * s, y: h }), t = sw({ x: (x + 2) * s, y: h * top });
      c.strokeStyle = 'rgba(70,120,60,0.85)'; c.lineWidth = 1 * s;
      c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(t.x, t.y); c.stroke();
      c.strokeStyle = 'rgba(40,80,40,0.8)'; c.lineWidth = 0.3 * s;
      for (let k = 1; k < 6; k++) { const y = b.y + (t.y - b.y) * k / 6, x2 = b.x + (t.x - b.x) * k / 6; c.beginPath(); c.moveTo(x2 - 0.6 * s, y); c.lineTo(x2 + 0.6 * s, y); c.stroke(); }
      for (let k = 0; k < 6; k++) { c.save(); c.translate(t.x, t.y + k * 3 * s); M.leaf(c, 5 * s, 0.9 * s, k % 2 ? 0.5 : 2.6, 'rgba(80,140,70,0.85)'); c.restore(); }
    }
  });

  place('ngua', 'Linh mã Bính Ngọ (đặt)', 'theu', 5, (c, a, p, s, sw) => {
    const q = sw({ x: 0, y: (a.slitY + a.hemY) / 2 });
    const g = '#e8b844', d = '#9c6a14';
    c.save(); c.translate(q.x, q.y); c.scale(s, s);
    c.fillStyle = g; c.strokeStyle = d; c.lineWidth = 0.3;
    c.beginPath();
    c.moveTo(-10, 0); c.quadraticCurveTo(-6, -5, 4, -4); c.lineTo(8, -9); c.quadraticCurveTo(11, -11, 12, -8); c.lineTo(11, -5); c.lineTo(8, -2);
    c.quadraticCurveTo(7, 2, 5, 3); c.lineTo(9, 9); c.lineTo(7, 10); c.lineTo(2, 4); c.lineTo(-5, 4); c.lineTo(-11, 10); c.lineTo(-12, 8); c.lineTo(-8, 2);
    c.quadraticCurveTo(-13, 3, -16, 7); c.quadraticCurveTo(-14, 1, -10, 0);
    c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#d2483d'; c.lineWidth = 0.7;
    c.beginPath(); c.moveTo(7, -8); c.quadraticCurveTo(3, -7, 1, -4); c.stroke();
    c.restore();
    for (const [x, y] of [[-12, -16], [12, -12], [-6, 18]]) { c.save(); c.translate(q.x + x * s, q.y + y * s); M.cloud(c, 2.4 * s, g, 0.45 * s); c.restore(); }
  });
  place('trongdong_lon', 'Mặt trống đồng (đặt)', 'det', 4, (c, a, p, s, sw) => {
    const q = sw({ x: 0, y: a.slitY + 26 * s });
    c.save(); c.translate(q.x, q.y);
    c.strokeStyle = p.gold; c.fillStyle = p.gold;
    for (const [r, w] of [[22, 0.6], [19, 0.25], [14, 0.25], [8, 0.25]]) { c.lineWidth = w * s; c.beginPath(); c.arc(0, 0, r * s, 0, 7); c.stroke(); }
    c.beginPath(); for (let i = 0; i < 28; i++) { const an = (i / 28) * Math.PI * 2, rr = (i % 2 ? 1.6 : 6.5) * s; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill();
    for (let i = 0; i < 8; i++) { c.save(); c.rotate((i / 8) * Math.PI * 2); c.translate(16.5 * s, 0); c.rotate(Math.PI / 2); M.crane(c, 1.6 * s, p.gold, p.gold, p.gold); c.restore(); }
    for (let i = 0; i < 36; i++) { c.save(); c.rotate((i / 36) * Math.PI * 2); c.fillRect(10.5 * s, -0.3 * s, 2 * s, 0.6 * s); c.restore(); }
    c.restore();
  });
  place('lan_canh', 'Cành lan vai (đặt)', 've', 3, (c, a, p, s) => {
    c.strokeStyle = '#4f6b3a'; c.lineWidth = 0.4 * s;
    c.beginPath(); c.moveTo(12 * s, 2 * s); c.bezierCurveTo(4 * s, 14 * s, 8 * s, 28 * s, -2 * s, 44 * s); c.stroke();
    [[10, 6], [6, 14], [6, 22], [5, 30], [1, 38]].forEach(([x, y], i) => {
      c.save(); c.translate(x * s, y * s);
      c.fillStyle = '#c39bd3'; for (let k = 0; k < 5; k++) { c.rotate((Math.PI * 2) / 5); c.beginPath(); c.ellipse(1.5 * s, 0, 1.6 * s, 0.75 * s, 0, 0, 7); c.fill(); }
      c.fillStyle = '#8e5baa'; c.beginPath(); c.ellipse(0, 0.6 * s, 0.8 * s, 1 * s, 0, 0, 7); c.fill();
      c.restore();
    });
  });
  place('cachep_doi', 'Song ngư (đặt)', 've', 4, (c, a, p, s, sw) => {
    const q = sw({ x: 0, y: a.hemY - 22 * s });
    c.save(); c.translate(q.x, q.y);
    c.strokeStyle = rgba(p.ink, 0.35); c.lineWidth = 0.3 * s;
    for (const r of [4, 8, 12, 16]) { c.beginPath(); c.arc(0, 0, r * s, 0, 7); c.stroke(); }
    c.save(); c.rotate(0.5); c.translate(0, -7 * s); M.koi(c, 7 * s, '#f6f1e7', '#e2552d', '#f39c6b'); c.restore();
    c.save(); c.rotate(0.5 + Math.PI); c.translate(0, -7 * s); M.koi(c, 7 * s, '#f39c12', '#ffffff', '#f8c471'); c.restore();
    c.restore();
  });
  place('dongho_tranh', 'Tranh Đông Hồ (đặt)', 'in', 3, (c, a, p, s, sw) => {
    const q = sw({ x: 0, y: a.slitY + 30 * s });
    c.save(); c.translate(q.x, q.y);
    c.fillStyle = '#ede0c8'; c.fillRect(-11 * s, -13 * s, 22 * s, 26 * s);
    c.strokeStyle = '#1c1c1c'; c.lineWidth = 0.5 * s; c.strokeRect(-11 * s, -13 * s, 22 * s, 26 * s);
    c.rotate(-0.4); M.koi(c, 7 * s, '#c0392b', '#f1c40f', '#c0392b');
    c.restore();
  });
  place('tiedye', 'Nhuộm loang mây (đặt)', 've', 3, (c, a, p, s, sw, accent) => {
    for (let i = 0; i < 9; i++) {
      const y = 10 * s + (i / 8) * (a.hemY - 10 * s), x = Math.sin(i * 2.3) * 10 * s, r = (6 + (i % 3) * 3) * s;
      const g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(accent, 0.55)); g.addColorStop(0.6, rgba(accent, 0.25)); g.addColorStop(1, rgba(accent, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    }
  });

  // ---------- assembly + cache ----------
  const cache = {};
  function make(mat, color, print) {
    print = print || 'tron';
    const key = mat + '|' + color + '|' + print;
    if (cache[key]) return cache[key];
    // a player's photo / community fabric whose image is still loading: plain cloth for now, not cached
    const pending = /^(u:|cd_)/.test(print) && !P[print];
    const md = G.DATA.materials[mat] || G.DATA.materials.lua;
    const hex = G.DATA.colors[color] ? G.DATA.colors[color].hex : color;
    const pal = palette(hex);
    const R = rng(hash(key));
    let cv = document.createElement('canvas');
    cv.width = cv.height = S;
    let c = cv.getContext('2d');
    (weave[md.weave] || weave.lua)(c, pal, R);
    const pat = P[print];
    if (pat && pat.img) {
      // image texture: 512px tile, recolored ('tint') or as-is ('full'), weave blended on top
      const weaveCv = cv, N = 512;
      cv = document.createElement('canvas'); cv.width = cv.height = N; c = cv.getContext('2d');
      const tileImg = pat.tile;
      if (pat.mode === 'tint') {
        // auto-leveled shade (multiply) keeps the bolt color; light map adds thread highlights
        c.fillStyle = hex; c.fillRect(0, 0, N, N);
        c.globalCompositeOperation = 'multiply'; c.drawImage(pat.shade, 0, 0, N, N);
        c.globalCompositeOperation = 'source-over'; c.drawImage(pat.light, 0, 0, N, N);
      } else c.drawImage(tileImg, 0, 0, N, N);
      c.globalCompositeOperation = 'soft-light'; c.globalAlpha = 0.45;
      c.drawImage(weaveCv, 0, 0, N, N); c.drawImage(weaveCv, 0, 0, N / 2, N / 2);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      if (md.sheer) { /* sheer handled at fill time */ }
    } else if (pat && pat.id !== 'tron') {
      const layer = document.createElement('canvas');
      layer.width = layer.height = S;
      pat.draw(layer.getContext('2d'), pal, R);
      finish(c, layer, pat.tech, R);
    } else if (!pat && PL[print]) {
      // placement fabrics show a faint hint of their artwork on the bolt
      c.globalAlpha = 0.25; c.fillStyle = pal.ink;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(R() * S, R() * S, 6 + R() * 10, 0, 7); c.fill(); }
      c.globalAlpha = 1;
    } else if (false && md.weave === 'gam') {
      // default brocade figure
      c.fillStyle = rgba(pal.gold, 0.75);
      for (let y = 0; y < S; y += 32) for (let x = 0; x < S; x += 32) {
        const ox = ((y / 32) % 2) * 16;
        c.save(); c.translate(x + ox + 8, y + 8);
        for (let k = 0; k < 4; k++) { c.rotate(Math.PI / 2); c.beginPath(); c.ellipse(4, 0, 3.4, 1.8, 0, 0, 7); c.fill(); }
        c.restore();
      }
    }
    const pattern = G.ctx.createPattern(cv, 'repeat');
    const info = pat || PL[print] || P.tron;
    if (pending) return { cv, pattern, hex, pal, px: cv.width, sheer: md.sheer || 0, sheen: md.sheen || 0, sparkle: md.weave === 'kimsa', scale: 1.4, placement: null };
    cache[key] = {
      cv, pattern, hex, pal, px: cv.width,
      sheer: md.sheer || 0, sheen: md.sheen || 0,
      sparkle: md.weave === 'kimsa' || info.tech === 'dinh',
      scale: (info.scale || 1) * 1.4,
      placement: PL[print] || null
    };
    return cache[key];
  }

  function techName(t) { return { in: 'In', det: 'Dệt', ve: 'Vẽ tay', theu: 'Thêu', dinh: 'Đính kết' }[t]; }
  function info(print) { return P[print] || PL[print] || P.tron; }

  // expose to game data: price add per quality tier, technique label
  const tierPrice = [0, 0, 10, 25, 45, 70];
  // only plain cloth and the high-quality image prints are offered in the game
  function publish() {
    for (const k in G.DATA.prints) delete G.DATA.prints[k];
    for (const src of [P, PL]) for (const id in src) {
      const it = src[id];
      if (id !== 'tron' && !it.img) continue;
      G.DATA.prints[id] = { name: it.name, tech: it.tech, techName: techName(it.tech), tier: it.tier, price: tierPrice[it.tier], placement: !!it.placement, image: !!it.img };
    }
  }
  publish();

  // 2x2 mirrored tile => seamless repeat from any image
  function mirrorTile(img) {
    const w = img.width, h = img.height, cv = document.createElement('canvas');
    cv.width = w * 2; cv.height = h * 2;
    const c = cv.getContext('2d');
    for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      c.save(); c.translate(sx > 0 ? 0 : w * 2, sy > 0 ? 0 : h * 2); c.scale(sx, sy); c.drawImage(img, 0, 0); c.restore();
    }
    return cv;
  }
  // split an image into an auto-leveled shade map (multiply) and a highlight map, so any
  // low-contrast photo (ivory-on-ivory brocade) can be recolored to any bolt color
  function tintMaps(src) {
    const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N;
    const c = cv.getContext('2d'); c.drawImage(src, 0, 0, N, N);
    const id = c.getImageData(0, 0, N, N), d = id.data, lum = new Float32Array(N * N);
    const hist = new Uint32Array(256);
    for (let i = 0; i < N * N; i++) { const l = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]; lum[i] = l; hist[l | 0]++; }
    const pct = (p) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= p * N * N) return v; } return 255; };
    const lo = pct(0.02), hi = Math.max(lo + 8, pct(0.98)), mid = pct(0.5);
    const shade = document.createElement('canvas'), light = document.createElement('canvas');
    shade.width = shade.height = light.width = light.height = N;
    const sc = shade.getContext('2d'), lc = light.getContext('2d');
    const sd = sc.createImageData(N, N), ld = lc.createImageData(N, N);
    for (let i = 0; i < N * N; i++) {
      const g = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)));
      const m = (mid - lo) / (hi - lo);
      const sv = g < m ? 0.5 + 0.5 * (g / Math.max(0.01, m)) : 1;          // darker than average -> shadow
      const lv = g > m ? Math.pow((g - m) / Math.max(0.01, 1 - m), 1.5) : 0; // brighter -> thread highlight
      const s8 = Math.round(sv * 255);
      sd.data[i * 4] = sd.data[i * 4 + 1] = sd.data[i * 4 + 2] = s8; sd.data[i * 4 + 3] = 255;
      ld.data[i * 4] = ld.data[i * 4 + 1] = ld.data[i * 4 + 2] = 255; ld.data[i * 4 + 3] = Math.round(lv * 110);
    }
    sc.putImageData(sd, 0, 0); lc.putImageData(ld, 0, 0);
    return { shade, light };
  }
  function registerImages(list) {
    for (const a of list.textures) {
      if (!a.img) continue;
      const tile = a.seam === 'mirror' ? mirrorTile(a.img) : a.img;
      P[a.id] = Object.assign({ id: a.id, name: a.name, tech: a.tech || 'in', tier: a.tier || 3, scale: a.scale || 1.5, img: a.img, mode: a.mode || 'tint', tile },
        (a.mode || 'tint') === 'tint' ? tintMaps(tile) : {});
    }
    for (const a of list.placements) {
      if (!a.img) continue;
      PL[a.id] = {
        id: a.id, name: a.name, tech: a.tech || 've', tier: a.tier || 4, placement: true, scale: 1, img: a.img,
        draw(c, asm, p, s, sw) {
          const w = (a.w || 36) * s, h = w * (a.img.height / a.img.width);
          let cy = a.anchor === 'chest' ? 24 * s : a.anchor === 'hem' ? asm.hemY - h / 2 - 2 * s : (asm.slitY + asm.hemY) / 2;
          const q = sw({ x: (a.x || 0) * s, y: cy });
          c.drawImage(a.img, q.x - w / 2, q.y - h / 2, w, h);
        }
      };
    }
    publish();
  }

  return { make, patterns: P, placements: PL, info, techName, palette, mix, rgba, lum, rotateHue, M, registerImages };
})();

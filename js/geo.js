// Geometry: parametric ao dai (assembled front view + flat pattern pieces), polygon helpers
G.geo = (function () {
  const V = (x, y) => ({ x, y });
  const add = (p, v, k) => V(p.x + v.x * k, p.y + v.y * k);
  const lerpP = (a, b, t) => V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  const mirror = (pts) => pts.map((p) => V(-p.x, p.y));

  function catmull(pts, seg) {
    seg = seg || 6;
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push(V(f(p0.x, p1.x, p2.x, p3.x), f(p0.y, p1.y, p2.y, p3.y)));
      }
    }
    const l = pts[pts.length - 1];
    out.push(V(l.x, l.y));
    return out;
  }
  function line(a, b, n) {
    const out = [];
    for (let i = 0; i <= n; i++) out.push(lerpP(a, b, i / n));
    return out;
  }
  function join() {
    const out = [];
    for (const arr of arguments) for (const p of arr) {
      const l = out[out.length - 1];
      if (!l || Math.hypot(l.x - p.x, l.y - p.y) > 0.05) out.push(V(p.x, p.y));
    }
    return out;
  }

  // ---------- parameters ----------
  const NECK = {
    dung:   { nx: 6.5, nd: 2.5, band: 4.5 },
    thap:   { nx: 6.5, nd: 2.5, band: 2.4 },
    tron:   { nx: 8, nd: 9, band: 0 },
    thuyen: { nx: 11, nd: 3.5, band: 0 },
    tim:    { nx: 7.5, nd: 15, band: 0, v: true },
    vuong:  { nx: 8.5, nd: 10, band: 0, square: true },
    lasen:  { nx: 7, nd: 6, band: 0, collar: 'lasen' },
    no:     { nx: 6.5, nd: 3.5, band: 0, collar: 'no' },
    yem:    { nx: 4.5, nd: 10, band: 0, bare: 'yem' },
    trevai: { nx: 15.2, nd: 10.5, band: 0, bare: 'trevai' },
    lechvai:{ nx: 6.5, nd: 2.5, band: 0, bare: 'lechvai' }
  };
  const LENGTH = { got: 149, chan: 130, goi: 100, ngan: 80, nam: 114, namngan: 102, ao: 60 }; // ao = an everyday shirt to the hip // 'got' sweeps the floor; nam* = men's, below / at the knee
  // the side slit of a real ao dai opens at the waist, so the panels fall free from there
  // never above the waist (y≈39): the slit must start where the waist is narrowest, or the waist disappears
  const SLIT = { thap: 52, vua: 45, cao: 40 };
  const FIT = {
    om:    [[19, 13.7], [24, 14.6], [31, 12.4], [39, 9.8], [47, 12.4], [56, 14.4], [70, 15.1], [200, 15.8]],
    // an áo dài flatters the figure: every women's cut keeps a slim waist; suông/ngũ thân only ease it a little
    suong: [[19, 13.8], [24, 14.6], [31, 13.6], [39, 12], [47, 13.5], [56, 14.6], [70, 15.2], [200, 15.9]],
    nguthan: [[19, 13.9], [24, 14.8], [31, 13.1], [39, 11], [47, 13], [56, 14.8], [70, 15.5], [200, 16.2]],
    nam: [[19, 13.9], [24, 14.5], [40, 14.5], [54, 14.8], [70, 15.2], [200, 15.6]], // men's: straight, no waist
    namom: [[19, 13.9], [24, 14.3], [31, 13.4], [40, 12.5], [50, 13.5], [56, 14.1], [70, 14.5], [200, 14.9]],  // men's modern: lightly fitted
    namthan: [[19, 14.1], [24, 14.8], [40, 14.9], [54, 15.3], [70, 15.8], [200, 16.2]]  // men's ngũ thân: roomy and straight
  };
  // hem half-width the flaps open to (fitted cut sweeps wide; straight cuts fall almost straight)
  const FULL = { om: 22, suong: 23, nguthan: 24.5, nam: 19, namom: 16.5 };
  const MX = 1.12; // men: broader across (applied to x only)
  const STRETCH = 1.14; // fashion proportions: longer legs and flaps
  const U = V(13.6, 18); // underarm
  const S = V(19.5, 4.5); // shoulder tip
  const ARM = (15 * Math.PI) / 180;
  const DV = V(Math.sin(ARM), Math.cos(ARM)); // down the arm
  const NV = V(-Math.cos(ARM), Math.sin(ARM)); // across the arm (inward)

  // men keep a straight, loose ngũ thân; the women's version is waisted
  const fitKey = (d) => (d.male && d.fit === 'nguthan' ? 'namthan' : d.fit);
  function widthAt(fit, y) {
    const k = FIT[fit] || FIT.om;
    if (y <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (y <= k[i][0]) {
        const t = (y - k[i - 1][0]) / (k[i][0] - k[i - 1][0]);
        return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * t;
      }
    }
    return k[k.length - 1][1];
  }

  // the player's own tweaks to the cut (dragged on the dress in the sketchbook), kept inside a flattering range:
  // eo/hong = cm added to the half-width at waist/hip, xoe = cm added to the hem sweep, xe = where the slit opens
  const SHAPE = { eo: [-1, 2.5], hong: [-1.5, 2.5], xoe: [-6, 8], xe: [40, 54] };
  function shapeOf(d) {
    const s = d.shape || {}, o = {};
    for (const k in SHAPE) o[k] = typeof s[k] === 'number' ? G.clamp(s[k], SHAPE[k][0], SHAPE[k][1]) : k === 'xe' ? null : 0;
    return o;
  }
  const bump = (y, at, w) => Math.exp(-(((y - at) / w) ** 2));
  // side seam half-width at height y for this design (base cut + the player's tweaks)
  function W(d, y) { const sh = shapeOf(d); return widthAt(fitKey(d), y) + sh.eo * bump(y, 39, 7) + sh.hong * bump(y, 56, 8); }

  function neckHalf(N, back) {
    const nd = back ? Math.min(2.2, N.nd) : N.nd, nx = N.nx;
    if (N.v && !back) return line(V(0, nd), V(nx, 0), 6);
    if (N.square && !back) return join(line(V(0, nd), V(nx * 0.92, nd), 4), catmull([V(nx * 0.92, nd), V(nx * 0.98, nd * 0.5), V(nx, 0)], 3));
    const pts = [];
    for (let i = 0; i <= 8; i++) {
      const t = (i / 8) * Math.PI / 2;
      pts.push(V(nx * Math.sin(t), nd * Math.cos(t)));
    }
    return pts;
  }

  // per-side neckline + shoulder configuration (side 'R' or 'L', always in +x coordinates)
  function sideCfg(d, side, back) {
    const N = NECK[d.neck] || NECK.dung;
    let sleeved = d.sleeve !== 'khong';
    const armhole = (A) => {
      const SH = V(Math.max(A.x + 2.5, 12.5), Math.max(2.5, A.y));
      return join(line(A, SH, 3), catmull([SH, V(12.4, Math.max(9, A.y + 4)), V(13.6, 15), U], 5));
    };
    if (N.bare === 'yem') {
      const A = V(N.nx, 0);
      const neck = back ? neckHalf({ nx: N.nx, nd: 2 }, true) : line(V(0, N.nd), A, 6);
      return { neck, A, top: catmull([A, V(8.5, 7), V(12.8, 13.5), U], 5), sleeved: false };
    }
    if (N.bare === 'trevai') {
      const A = V(N.nx, N.nd);
      const neck = catmull([V(0, 11.5), V(8, 10.9), A], 4);
      return { neck, A, top: sleeved ? line(A, U, 3) : catmull([A, V(15, 15), U], 3), sleeved, shoulder: V(19.8, 13) };
    }
    if (N.bare === 'lechvai') {
      if (side === 'L') return { neck: line(V(0, 9.5), U, 8), A: U, top: [], sleeved: false };
      const A = V(N.nx, 0);
      return { neck: line(V(0, 9.5), A, 6), A, top: sleeved ? line(A, U, 6) : armhole(A), sleeved };
    }
    const A = V(N.nx, 0);
    return { neck: neckHalf(N, back), A, top: sleeved ? line(A, U, 6) : armhole(A), sleeved };
  }

  function half(d, back, Lside, cY, slitY, sideId) {
    const cfg = sideCfg(d, sideId, back);
    const A = cfg.A, neck = cfg.neck, top = cfg.top;
    const keys = [U];
    for (const [y] of FIT[fitKey(d)] || FIT.om) if (y > 19 && y < slitY - 3) keys.push(V(W(d, y), y));
    const xs = W(d, slitY);
    keys.push(V(xs, slitY));
    const side = catmull(keys, 5);
    // from the waist the panels open into a long A-line: the longer the tà, the wider the hem
    const full = (d.fit === 'nguthan' && d.male ? 21 : FULL[d.fit] || FULL.om) + shapeOf(d).xoe;
    // the panels first follow the hip (that curve is what shows the waist), then fall almost straight
    const HIP = 56, hipW = W(d, HIP);
    let hw = Math.max(hipW, xs) + (full - Math.max(hipW, xs)) * G.clamp((Lside - HIP) / 93, 0.25, 1);
    if (d.hem === 'xoe') hw += 13;
    if (d.casual) hw = xs + 0.4; // an everyday shirt: no slit, the side seam runs straight to the hem
    const flap = slitY < HIP - 4 && Lside > HIP + 20
      ? catmull([V(xs, slitY), V(hipW, HIP), V(hipW + (hw - hipW) * 0.42, HIP + (Lside - HIP) * 0.5), V(hw, Lside)], 7)
      : catmull([V(xs, slitY), V(xs + (hw - xs) * 0.2, slitY + (Lside - slitY) * 0.14), V(xs + (hw - xs) * 0.55, slitY + (Lside - slitY) * 0.52), V(hw, Lside)], 6);
    let hem;
    if (d.hem === 'nhon') hem = catmull([V(hw, Lside), V(hw * 0.5, (Lside + cY) / 2 + 0.6), V(0, cY)], 5);
    else if (d.male && d.hem === 'thang') hem = catmull([V(hw, Lside), V(hw * 0.7, Lside + 0.6), V(0, cY)], 5); // men's: squared-off hem
    else {
      hem = [];
      const n = d.hem === 'xoe' ? 22 : 10;
      for (let i = 0; i <= n; i++) {
        const th = (i / n) * Math.PI / 2;
        // knife pleats end in little points along the hem
        const pleat = d.hem === 'xoe' && i % 2 ? 1.3 : 0;
        hem.push(V(hw * Math.cos(th), Lside + (cY - Lside) * Math.sin(th) + pleat));
      }
    }
    return { pts: join(neck, top, side, flap, hem), flap, hem, slitY, A, cfg };
  }

  function body(d, back) {
    const L = LENGTH[d.length] || 128;
    let LR = L, LL = L, cY;
    // each tà must read at a glance: the hem shape is exaggerated a little, like a fashion sketch
    if (d.hem === 'xeo') { LL = L - 22; cY = L - 11; }
    else if (d.hem === 'bau') { LR = LL = L - 8; cY = L + 14; }        // deep rounded U
    else if (d.hem === 'nhon') { LR = LL = L - 14; cY = L + 20; }      // sharp V point
    else if (d.hem === 'kep') { LR = LL = L - 30; cY = L - 28; }       // short outer tà over a long inner one
    else cY = L + 1.5;
    // áo ngũ thân is slit low, from the hip
    const xe = shapeOf(d).xe;
    const slitY = d.casual ? Math.min(LR, LL) - 1 : Math.min(xe !== null ? xe : d.fit === 'nguthan' ? SLIT.thap : SLIT[d.slit] || 54, Math.min(LR, LL) - 14);
    const R = half(d, back, LR, cY, slitY, 'R');
    const Lh = half(d, back, LL, cY, slitY, 'L');
    const left = mirror(Lh.pts).reverse();
    const poly = R.pts.concat(left.slice(1, -1));
    return {
      poly, slitY: R.slitY, hemY: Math.max(LR, LL, cY), Lside: Math.min(LR, LL), cY,
      hemLine: join(R.hem, mirror(Lh.hem).reverse()),
      slitR: R.flap, slitL: mirror(Lh.flap), A: R.A,
      cfgR: R.cfg, cfgL: Lh.cfg,
      neckFull: join(mirror(Lh.cfg.neck).reverse(), R.cfg.neck)
    };
  }

  function sleeve(d, cfg) {
    if (!cfg.sleeved) return null;
    const A = cfg.A;
    const S = cfg.shoulder || V(15.6, 7.4);
    const wide = 1; // everyday ngũ thân has narrow sleeves too (wide ones belong to the ceremonial áo tấc)
    const sh = catmull([A, V(A.x + (S.x - A.x) * 0.5, Math.min(A.y, S.y) + 1.2 * (A.y < 5 ? 1 : 0.3)), S], 5);
    let pts, cuff, band = null;
    const simple = (L, w) => {
      const C1 = add(S, DV, L), C2 = add(C1, NV, w * wide);
      cuff = [C1, C2];
      return join(sh, line(S, C1, 6), [C2], line(C2, U, 6));
    };
    const puff = (L, w) => {
      const P1 = add(add(S, DV, 14), NV, -0.3), P2 = add(P1, NV, 9.8);
      const C1 = add(S, DV, L), C2 = add(C1, NV, w * wide);
      cuff = [C1, C2]; band = [P1, P2];
      return join(sh, catmull([S, add(add(S, DV, 3), NV, -4), add(add(S, DV, 9), NV, -4.6), P1], 5), line(P1, C1, 5), [C2], line(C2, P2, 4), catmull([P2, add(add(S, DV, 9), NV, 11), U], 4));
    };
    if (d.sleeve === 'dai' || d.sleeve === 'voan') pts = simple(57, 5.8);
    else if (d.sleeve === 'lung') pts = simple(40, 6.8);
    else if (d.sleeve === 'ngan') pts = simple(21, 9.6);
    else if (d.sleeve === 'bong') pts = puff(58, 7.5);
    else if (d.sleeve === 'bonglung') pts = puff(38, 8.6);
    else if (d.sleeve === 'loe') {
      const E1 = add(S, DV, 30), E2 = add(E1, NV, 8.6);
      const C1 = add(add(S, DV, 52), NV, -4), C2 = add(C1, NV, 19);
      cuff = [C1, C2];
      pts = join(sh, line(S, E1, 4), catmull([E1, add(add(S, DV, 42), NV, -1.6), C1], 4), [C2], catmull([C2, add(add(E2, DV, 9), NV, 1), E2], 3), line(E2, U, 4));
    } else if (d.sleeve === 'canhtien') {
      const C1 = add(add(S, DV, 15), NV, -3.5), C2 = add(U, DV, 5);
      const dir = V(C2.x - C1.x, C2.y - C1.y), len = Math.hypot(dir.x, dir.y);
      const pn = V(dir.y / len, -dir.x / len);
      const wave = [];
      for (let i = 0; i <= 28; i++) {
        const t = i / 28, b = lerpP(C1, C2, t);
        wave.push(add(b, pn, -Math.abs(Math.sin(t * Math.PI * 4)) * 1.8));
      }
      cuff = wave;
      pts = join(sh, catmull([S, add(add(S, DV, 8), NV, -2), C1], 4), wave, [U]);
    } else return null;
    return { poly: pts, cuff, band, sheer: d.sleeve === 'voan' };
  }

  function collarBand(N) {
    if (!N.band) return null;
    const nx = N.nx, b = N.band;
    const top = catmull([V(-nx + 0.6, -b), V(0, -b + 0.5), V(nx - 0.6, -b)], 4);
    const nh = neckHalf(N, false);
    const neckFull = join(mirror(nh).reverse(), nh); // -nx -> nx
    return join([V(-nx, 0.2)], top, [V(nx, 0.2)], neckFull.slice().reverse());
  }

  function rotate(pts, ang) {
    const c = Math.cos(ang), s = Math.sin(ang);
    return pts.map((p) => V(p.x * c - p.y * s, p.x * s + p.y * c));
  }

  function bounds(poly) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of poly) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }
  function normalize(poly) {
    const b = bounds(poly);
    return { poly: poly.map((p) => V(p.x - b.x, p.y - b.y)), w: b.w, h: b.h };
  }
  function pointInPoly(p, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }
  function cellsOf(n) {
    const cells = [];
    const W = Math.ceil(n.w), H = Math.ceil(n.h);
    // scanline: for each row find crossings
    const poly = n.poly;
    for (let y = 0; y < H; y++) {
      const yy = y + 0.5, xs = [];
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const a = poly[i], b = poly[j];
        if ((a.y > yy) !== (b.y > yy)) xs.push(((b.x - a.x) * (yy - a.y)) / (b.y - a.y) + a.x);
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x + 0.5 <= xs[k + 1] && x < W; x++) cells.push(x, y);
      }
    }
    return cells;
  }

  const cache = {};
  // Build everything for a design. kid/size scale everything.
  function build(design, sizeKey, kid) {
    const d = Object.assign({}, G.DATA.defaultDesign, design);
    const key = JSON.stringify(d) + sizeKey + (kid ? 'k' : '');
    if (cache[key]) return cache[key];
    const s = (typeof sizeKey === 'number' ? sizeKey : G.DATA.sizes[sizeKey] || 1) * (kid ? 0.62 : 1);
    const manBody = !!(d.male || d.broad); // broad: a man's frame wearing a women's áo dài
    const sx = s * (manBody ? MX : 1);
    const sc = (pts) => (pts ? pts.map((p) => V(p.x * sx, p.y * s)) : null);
    // display coordinates: fashion-illustration stretch below the bust (flat pattern pieces keep real sizes)
    const SY = (y) => (y <= 38 ? y : 38 + (y - 38) * STRETCH);
    const scA = (pts) => (pts ? pts.map((p) => V(p.x * sx, SY(p.y) * s)) : null);
    const ngu = d.fit === 'nguthan', setIn = d.fit === 'namom';
    // ngũ thân keeps its low "cổ trụ" standing collar
    const N0 = NECK[d.neck] || NECK.dung, N = ngu && N0.band > 3 ? Object.assign({}, N0, { band: 3 }) : N0;
    const F = body(d, false), B = body(d, true);
    const slR = sleeve(d, F.cfgR), slL = sleeve(d, F.cfgL);
    const band = collarBand(N);
    const sleeveR = slR ? scA(slR.poly) : null;
    const sleeveL = slL ? mirror(scA(slL.poly)) : null;
    const A = F.A;
    // seams (assembled coordinates)
    const neckFull = F.neckFull;
    const sideR = (() => {
      const keys = [U];
      for (const [y] of FIT[fitKey(d)] || FIT.om) if (y > 19 && y < F.slitY - 3) keys.push(V(W(d, y), y));
      keys.push(V(W(d, F.slitY), F.slitY));
      return catmull(keys, 4);
    })();
    const seams = [];
    // shoulder construction tells the cuts apart: raglan (modern women's), cut-in-one with a join down the arm
    // (ngũ thân, woven on narrow looms) or a set-in armhole seam (men's cách tân)
    for (const [cfg, m, sideName] of [[F.cfgR, false, 'phải'], [F.cfgL, true, 'trái']]) {
      if (cfg.top.length < 2) continue;
      let pts, name;
      if (cfg.sleeved && ngu) {
        const Sh = cfg.shoulder || V(15.6, 7.4), o = add(Sh, DV, 24), i = lerpP(U, add(add(Sh, DV, 57), NV, 5.8), 0.36);
        pts = line(o, i, 6); name = 'Nối tay ';
      } else if (cfg.sleeved && setIn) {
        pts = catmull([V(14.9, 5.2), V(15.3, 10), V(14.7, 14.8), U], 5); name = 'Vòng nách ';
      } else {
        pts = cfg.sleeved ? line(cfg.A, U, 6) : cfg.top.slice(0, Math.max(3, Math.ceil(cfg.top.length * 0.4)));
        name = cfg.sleeved ? 'Raglan ' : 'Vai ';
      }
      seams.push({ name: name + sideName, pts: m ? mirror(pts) : pts });
    }
    seams.push({ name: 'Sườn phải', pts: sideR }, { name: 'Sườn trái', pts: mirror(sideR) }, { name: N.bare ? 'Viền cổ' : 'Cổ áo', pts: neckFull });
    // seams that belong to this design only, so every cut sews differently
    if (ngu) seams.push({ name: 'Nối thân giữa', pts: line(V(0, N.nd + 0.5), V(0, F.cY - 1), 24) }); // ngũ thân: two front panels joined down the middle
    for (const [sl, m, side] of [[slR, false, 'phải'], [slL, true, 'trái']]) {
      if (sl && sl.band) seams.push({ name: 'Bo tay ' + side, pts: m ? mirror(line(sl.band[0], sl.band[1], 6)) : line(sl.band[0], sl.band[1], 6) }); // puff sleeve cuff
    }
    // the hem is turned up and stitched all along its shape: straight, a deep U, a V point, knife pleats, a slant…
    if (!d.casual) seams.push({ name: d.hem === 'kep' ? 'Lai tà ngoài' : 'Lai tà', pts: F.hemLine });
    seams.forEach((sm) => { sm.pts = scA(sm.pts); });
    // buttons along the right opening
    const cR = F.cfgR;
    const btnLine = cR.top.length > 1 ? (cR.sleeved ? line(cR.A, U, 20) : cR.top) : cR.neck;
    let buttons = [0.14, 0.36, 0.58, 0.8].map((t) => btnLine[Math.round(t * (btnLine.length - 1))]);
    // ngũ thân: five knot buttons — collar base, right chest, three under the right arm
    if (ngu && cR.sleeved && !N.bare) buttons = [lerpP(cR.A, U, 0.45), V(U.x - 0.7, U.y + 1.2), V(W(d, 24) - 0.9, 24), V(W(d, 30) - 0.9, 30)];
    // set-in men's cut: buttons across the chest to the underarm, then down the side
    else if (setIn && cR.sleeved && !N.bare) buttons = [lerpP(cR.A, U, 0.35), lerpP(cR.A, U, 0.7), V(U.x - 0.7, U.y + 1.4), V(W(d, 27) - 0.9, 27)];
    if (N.band) buttons.unshift(V(N.nx - 1.6, -N.band * 0.5));
    // flat pattern pieces
    const defs = [
      { id: 'front', slot: 'than', name: 'Vạt trước', poly: sc(F.poly) },
      { id: 'back', slot: 'than', name: 'Vạt sau', poly: sc(B.poly) }
    ];
    if (slR) defs.push({ id: 'sleeveR', slot: 'tay', name: 'Tay phải', poly: sc(rotate(slR.poly, ARM)) });
    if (slL) defs.push({ id: 'sleeveL', slot: 'tay', name: 'Tay trái', poly: sc(mirror(rotate(slL.poly, ARM))) });
    if (N.band) {
      const b = N.band;
      defs.push({ id: 'collar', slot: 'co', name: 'Cổ áo', poly: sc([V(0, 1), V(1, 0), V(33, 0), V(34, 1), V(34, b - 1), V(33, b), V(1, b), V(0, b - 1)]) });
    }
    // pieces only some designs need
    if (ngu) {
      // ngũ thân has a fifth, narrower panel ("vạt con") under the front
      const L2 = F.Lside - 2;
      defs.push({ id: 'vatcon', slot: 'than', name: 'Vạt con', poly: sc([V(0, 1), V(W(d, 24) * 0.7, 24), V(W(d, 39) * 0.7, 39), V(W(d, F.slitY) * 0.75, F.slitY), V(W(d, F.slitY) * 0.85, L2), V(0, L2)]) });
    }
    if (d.hem === 'kep') {
      // tà kép: a full-length inner tà under the shorter outer one
      const top = F.slitY, w0 = W(d, top), bot = F.Lside + 30;
      defs.push({ id: 'talot', slot: 'than', name: 'Tà lót', poly: sc([V(-w0, top), V(w0, top), V(w0 + 9, bot), V(0, bot + 2), V(-w0 - 9, bot)]) });
    }
    if (slR && slR.band) for (const side of ['phải', 'trái']) defs.push({ id: 'cuff' + side, slot: 'tay', name: 'Bo tay ' + side, poly: sc([V(0, 0), V(26, 0), V(26, 4.5), V(0, 4.5)]) });
    if (d.neck === 'lasen') defs.push({ id: 'lacoc', slot: 'than', name: 'Lá cổ', poly: sc(join(catmull([V(-11, 0), V(-6, 5), V(0, 6.5), V(6, 5), V(11, 0)], 5), catmull([V(11, 0), V(5, 2.6), V(0, 3.4), V(-5, 2.6), V(-11, 0)], 5))) });
    if (d.neck === 'no') defs.push({ id: 'daino', slot: 'than', name: 'Dây nơ', poly: sc([V(0, 0), V(70, 0), V(72, 2.5), V(70, 5), V(0, 5), V(-2, 2.5)]) });
    // trousers or skirt panels, cut from the "quần" fabric
    if (d.bottom === 'chanvay' || d.bottom === 'tuyn') {
      const sk = [V(-13, 0), V(13, 0), V(30, 104), V(-30, 104)];
      defs.push({ id: 'skirtF', slot: 'quan', name: 'Thân váy trước', poly: sc(sk) }, { id: 'skirtB', slot: 'quan', name: 'Thân váy sau', poly: sc(sk) });
      if (d.bottom === 'tuyn') defs.push({ id: 'tuyn', slot: 'quan', name: 'Lớp tuyn', poly: sc([V(-16, 0), V(16, 0), V(36, 100), V(-36, 100)]) }); // the tulle overskirt
    } else {
      const L = d.bottom === 'ongrong' ? 88 : 102, wb = d.bottom === 'ongrong' ? 21 : 18;
      const leg = [V(0, 0), V(16, 0), V(17.6, 17), V(wb, L), V(0, L)];
      defs.push({ id: 'legR', slot: 'quan', name: 'Ống quần phải', poly: sc(leg) }, { id: 'legL', slot: 'quan', name: 'Ống quần trái', poly: sc(mirror(leg)) });
    }
    // sheer cape: two side panels falling from the neck over the shoulders
    let capeR = null, capeL = null;
    if (d.cape && d.cape !== 'none') {
      const hy = F.hemY, n0 = V(N.nx + 0.5, -0.4);
      const raw = join(
        catmull([n0, V(15, 0.8), V(22, 3.6), V(29, 20), V(33, hy * 0.45), V(33, hy * 0.8), V(29, hy - 5)], 5),
        catmull([V(29, hy - 5), V(23, hy - 2), V(18.5, hy - 7)], 4),
        catmull([V(18.5, hy - 7), V(16.5, hy * 0.55), V(15.5, 32), V(14, 12), V(N.nx + 3, 2), n0], 5)
      );
      capeR = scA(raw);
      capeL = mirror(capeR);
    }
    const front = scA(F.poly);
    const all = front.concat(sleeveR || [], sleeveL || [], scA(band) || [], capeR || [], capeL || []);
    const res = {
      design: d, s, kid: !!kid, male: !!d.male, manBody, mx: manBody ? MX : 1,
      body: front, back: scA(B.poly), sleeveR, sleeveL, collar: scA(band),
      neckLine: scA(neckFull), hemLine: scA(F.hemLine), backHem: scA(B.hemLine),
      slitR: scA(F.slitR), slitL: scA(F.slitL),
      cuffR: slR ? scA(slR.cuff) : null, cuffL: slL ? mirror(scA(slL.cuff)) : null,
      bandR: slR && slR.band ? scA(slR.band) : null, bandL: slL && slL.band ? mirror(scA(slL.band)) : null,
      sheerSleeves: !!(slR && slR.sheer),
      neckType: d.neck, nx: N.nx * sx, nd: N.nd * s, bare: N.bare || null, neckFront: scA(F.neckFull),
      buttons: scA(buttons), seams, slitY: SY(F.slitY) * s, flap: SY(F.hemY) * s, hemY: SY(F.hemY) * s, SY: (y) => SY(y / s) * s,
      capeR, capeL, topY: ({ nonla: -50, quaithao: -44, khanxep: -38 }[d.head] || -36) * s, botY: Math.max(SY(154), SY(F.hemY) + 11) * s, floorY: SY(152) * s,
      bounds: bounds(all), defs
    };
    cache[key] = res;
    return res;
  }

  function pieces(asm) {
    return asm.defs.map((dd) => ({ id: dd.id, slot: dd.slot, name: dd.name, base: normalize(dd.poly), rots: [], rot: 0, x: 0, y: 0, placed: false }));
  }

  function rotated(piece, r) {
    r = ((r % 4) + 4) % 4;
    if (piece.rots[r]) return piece.rots[r];
    let poly = piece.base.poly;
    for (let i = 0; i < r; i++) poly = poly.map((p) => V(-p.y, p.x));
    const n = normalize(poly);
    n.cells = cellsOf(n);
    n.area = n.cells.length / 2;
    piece.rots[r] = n;
    return n;
  }

  function resample(pts, step, closed) {
    const src = closed ? pts.concat([pts[0]]) : pts;
    const out = [V(src[0].x, src[0].y)];
    let carry = 0;
    for (let i = 1; i < src.length; i++) {
      const a = src[i - 1], b = src[i];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len === 0) continue;
      let dd = step - carry;
      while (dd <= len) {
        const t = dd / len;
        out.push(V(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t));
        dd += step;
      }
      carry = len - (dd - step);
    }
    const lastP = src[src.length - 1];
    if (G.dist(out[out.length - 1], lastP) > step * 0.3) out.push(V(lastP.x, lastP.y));
    return out;
  }

  // where the shape handles sit on the right edge of the dress (unscaled x, display y): waist, hip, slit, hem corner
  function handles(design) {
    const d = Object.assign({}, G.DATA.defaultDesign, design), F = body(d, false);
    const SYf = (y) => (y <= 38 ? y : 38 + (y - 38) * STRETCH), P = (x, y) => V(x, SYf(y));
    // the hip handle rides the outline itself (above the slit it is the side seam, below it the open flap)
    const onFlap = (y) => { const f = F.slitR; for (let i = 1; i < f.length; i++) if (f[i].y >= y) { const t = (y - f[i - 1].y) / ((f[i].y - f[i - 1].y) || 1); return f[i - 1].x + (f[i].x - f[i - 1].x) * t; } return W(d, y); };
    const hem = F.slitR[F.slitR.length - 1];
    const hy = Math.max(56, F.slitY + 5); // never on top of the slit handle
    return { eo: P(W(d, 39), 39), hong: P(onFlap(hy), hy), xe: P(W(d, F.slitY), F.slitY), xoe: P(hem.x, hem.y), shape: shapeOf(d), SY: SYf };
  }

  return { build, pieces, rotated, resample, pointInPoly, bounds, normalize, catmull, handles, SHAPE };
})();

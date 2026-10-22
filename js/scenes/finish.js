// Finish: photo of the dress under studio light, then the client's verdict, payment, friendship and press.
// The daily order ends here too, with its own result card (the real save is restored first).
G.scenes.finish = {
  enter() {
    const s = G.state, j = G.job;
    this.t = 0; this.burst = false; this.parts = [];
    // first a photo shoot (backdrop, light, framing), then the client's verdict
    this.phase = 'photo'; this.photo = this.photo || { bg: 0, light: 0, frame: 0 };
    // odd jobs bring their own set (stage, party, a quiet wake) and pick it for the photo
    this.kind = j.com.kind;
    const th = G.THEMES[this.kind];
    if (th && th.backdrop) this.photo.bg = this.BACKDROPS.findIndex((b) => b.id === th.backdrop);
    else if (!this.backdrops().some((e) => e.i === this.photo.bg)) this.photo.bg = 0;
    const fm = G.front.mods();
    if (fm.fit && !s.isDaily && !j.fitted) { j.fit = Math.min(1, j.fit + fm.fit); j.fitted = true; } // the fitting room
    this.r = G.scoreJob();
    const r = this.r;
    if (s.isDaily) { this.daily = G.daily.end(r, j); this.view = G.share.snapView(this.daily.snap); G.sfx.good(); return; }
    this.daily = null; this.rack = null;
    if (j.com.kind === 'rack') {
      // a ready-to-wear dress: into the album and onto the fair rack; a day of work, no client to pay
      this.snap = G.snapOf(j, r, { kind: 'rack', title: 'Áo bán sẵn' });
      s.collection.push(this.snap); if (s.collection.length > 60) s.collection.shift();
      G.fair.hang(j, r, this.snap);
      this.rack = { value: G.fair.value(s.rack[s.rack.length - 1]), trendy: G.fair.trendy(s.rack[s.rack.length - 1]) };
      G.econ.advanceDay();
      s.commission = null; G.save(); G.sfx.good();
      return;
    }
    const cl = G.client(j.com.client);
    // paid now (so closing the tab loses nothing), but the purse shows it only when she pays, after the photo
    const paid = r.pay + r.tip + r.trendPay + (r.flairPay || 0);
    G.addCoins(paid); this.held = G.ui.coinHold = paid;
    // the day ends (bills at month end use the rank the month was worked at), then reputation grows
    G.econ.advanceDay();
    if (G.quests) { if (r.success) G.quests.event('giao'); if (r.success && r.quality >= 90) G.quests.event('q90'); } // daily goals
    if (G.ach && r.success && j.com.flags && j.com.flags.vip) G.ach.count('vip');
    this.gain = (r.success ? 1 : 0.25) + ((j.com.kind === 'story' || j.com.kind === 'arc') && r.success ? 0.5 : 0);
    s.prestige += this.gain;
    s.served++;
    const kim = G.press.kim(r, j.com);
    this.snap = G.snapOf(j, r, { kim });
    s.collection.push(this.snap);
    if (s.collection.length > 60) s.collection.shift();
    this.bond = G.bond.onDelivery(r, j);
    if (this.bond && fm.bond) { G.bond.add(j.com.client, fm.bond); this.bond.gained += fm.bond; }
    // she notices the eye behind the dress (flowers of Thẩm mỹ), happy with it or not
    if (this.bond && r.flair && r.flair.pts) { G.bond.add(j.com.client, r.flair.pts); this.bond.gained += r.flair.pts; }
    this.arcRw = j.com.kind === 'arc' && r.success ? G.bond.arcDone(j) : [];
    this.press = G.press.onDelivery(r, j, this.snap.id);
    G.story.onDelivery(r, j, kim);
    this.evMsg = G.cal.onDelivery(r, j);
    G.cal.tetLixi();
    s.commission = null;
    G.save();
    const miss = r.checks.find((ck) => !ck.ok);
    this.say = r.success
      ? G.pick(['Trời ơi, đúng như mình mơ! Cảm ơn em nhiều lắm.', 'Đẹp quá, mặc vào thấy mình khác hẳn!', 'Hoàn hảo! Mình sẽ giới thiệu bạn bè đến tiệm.'])
      : !r.qualOk ? 'Đường may chưa được chắc tay lắm em ạ...' : `Đẹp nhưng mình đã dặn: ${G.reqText(miss.r).toLowerCase()}...`;
    if (cl && cl.id === 'hotxoan' && r.success) this.say = 'Đẹp như hột xoàn! Thôi khỏi giảm giá, chị bo thêm cho em nè.';
    // odd jobs answer in their own voice (and a mourner gets no confetti)
    if (th) this.say = r.success ? G.pick(th.win) : (miss && th.lose[miss.r.type]) || this.say;
    // an occasion is answered about that occasion: the beach wedding, meeting the in-laws, the night of the contest…
    const oc = j.com.occasion && G.OCCASIONS && G.OCCASIONS[j.com.occasion];
    if (oc && !th) this.say = r.success ? G.pick(oc.win) : !r.qualOk ? oc.lose.q || this.say : (miss && oc.lose[miss.r.type]) || this.say;
    // …and then she talks about the design itself
    if (this.kind !== 'tang' && r.qualOk) { const note = this.comment(r, j); if (note) this.say += ' ' + note; }
    G.sfx.good();
  },
  // What the client says about the design: the choice that did most for the style she wanted, or, when a
  // wish fell short, where more of it could have come from. Built from the same numbers as the tags.
  comment(r, j) {
    const C = G.CAT, com = j.com, sk = G.scenes.sketch, tn = (k) => C.TAGS[k].name.toLowerCase();
    const mins = com.reqs.filter((q) => q.type === 'min').sort((a, b) => b.val - a.val);
    const missed = r.checks.find((ck) => !ck.ok && ck.r.type === 'min');
    if (!r.success && !missed) return ''; // unhappy about something else (the cloth, a colour): no praise
    const tag = missed ? missed.r.tag : mins.length ? mins[0].tag : C.TAG_KEYS.slice().sort((a, b) => (r.tags[b] || 0) - (r.tags[a] || 0))[0];
    if (!tag) return '';
    if (missed) {
      // the biggest gain on offer: a different part, or a different cloth for the body
      const g = j.garment || com.garment || 'aodai', rk = G.rank(), male = !!com.male;
      let best = null;
      for (const p of C.PART_ORDER) {
        const cur = (C.PARTS[p].opts[j.part[p]] || { tags: {} }).tags[tag] || 0;
        for (const k of Object.keys(C.PARTS[p].opts)) {
          const o = C.PARTS[p].opts[k];
          if (C.optRank(o, g) > rk || !C.partFits(o, male) || !C.garmentAllows(p, k, o, g)) continue;
          const v = (o.tags[tag] || 0) - cur; if (!best || v > best.v) best = { v, what: C.PARTS[p].name.toLowerCase() };
        }
      }
      const fc = C.FABRICS[j.fabs.than], w = C.SLOTS.than.w * 14, fcur = fc ? (fc.tags[tag] || 0) * w : 0;
      const ftop = Math.max(...Object.values(C.FABRICS).filter((f) => f.rank <= rk).map((f) => (f.tags[tag] || 0) * w));
      if (ftop - fcur > (best ? best.v : 0)) best = { v: ftop - fcur, what: 'vải thân' };
      return best && best.v > 0 ? `Giá mà ${best.what} ${tn(tag)} hơn chút…` : '';
    }
    const cand = [];
    for (const p of C.PART_ORDER) {
      const o = C.PARTS[p].opts[j.part[p]]; if (!o || !o.tags[tag]) continue;
      let n = sk.optName(p, j.part[p]).toLowerCase(); if (p === 'dang' && !/^(dáng|ngũ)/.test(n)) n = 'dáng ' + n;
      cand.push({ v: o.tags[tag], what: 'cái ' + n });
    }
    for (const slot in C.SLOTS) { const f = C.FABRICS[j.fabs[slot]]; if (f && f.tags[tag]) cand.push({ v: f.tags[tag] * C.SLOTS[slot].w * 14, what: 'tấm ' + f.name.toLowerCase() }); }
    const D = j.decor || {};
    for (const gk of C.DECOR_ORDER) {
      const grp = C.DECOR[gk];
      const ids = grp.kind === 'one' ? [D[grp.field]] : (D.items || []).filter((it) => it.group === gk).map((it) => it.id);
      for (const id of ids) { const it = id && grp.items[id]; if (it && it.tags && it.tags[tag]) cand.push({ v: it.tags[tag], what: it.name.toLowerCase() }); }
    }
    if (!cand.length) return '';
    cand.sort((a, b) => b.v - a.v);
    const what = cand[0].what, What = what[0].toUpperCase() + what.slice(1);
    return G.pick([`${What} làm áo ${tn(tag)} hẳn lên, đúng gu mình.`, `Mình thích nhất ${what}: ${tn(tag)} mà không cầu kỳ.`, `${What} đó là ý hay đó em!`]);
  },
  update(dt) {
    this.t += dt;
    // confetti when a happy client sees the dress
    if (!this.burst && this.phase !== 'photo' && this.t > 1.6 && this.r && this.r.success && !this.rack) {
      this.burst = true;
      this.parts = [];
      if (this.kind === 'tang') {
        // a quiet thank-you: a few white chrysanthemum petals drifting down, no cheering
        for (let k = 0; k < 22; k++) this.parts.push({ x: G.rand(80, 600), y: G.rand(-200, 20), vx: G.rand(-12, 12), vy: G.rand(25, 55), r: G.rand(0, 6), vr: G.rand(-1.5, 1.5), w: G.rand(6, 10), col: '#fbf8f1', petal: true, t: 0 });
      } else {
        G.sfx.cheer && G.sfx.cheer();
        for (let k = 0; k < 70; k++) this.parts.push({ x: G.rand(120, 560), y: G.rand(-40, 40), vx: G.rand(-60, 60), vy: G.rand(60, 220), r: G.rand(0, 6), vr: G.rand(-8, 8), w: G.rand(5, 10), col: G.pick(['#d65a67', '#f6cd6a', '#7fc8a9', '#8fb7e6', '#ffffff', '#e89ab8']), t: 0 });
      }
    }
    for (const p of this.parts || []) { p.t += dt; p.x += (p.vx + Math.sin(p.t * 3 + p.r) * 30) * dt; p.y += p.vy * dt; p.r += p.vr * dt; }
    if (this.parts) this.parts = this.parts.filter((p) => p.y < G.H + 20);
  },
  // a photographer's set: seamless paper sweep, two softboxes, a polished floor
  BACKDROPS: [{ name: 'Kem', a: '#e9dccb', b: '#f5ebdd', f: '#d9c4a6' }, { name: 'Hồng phấn', a: '#e6c3c8', b: '#f7e3e3', f: '#d6aeb2' },
    { name: 'Ngọc', a: '#bcd8d1', b: '#e3f0ec', f: '#a6c4bc' }, { name: 'Đêm', a: '#23232b', b: '#3e3e50', f: '#1a1a20', dark: true },
    // sets that come with an odd job: a theatre stage, a night party, a quiet room for a wake
    { id: 'san', only: 'kho', name: 'Sân khấu', a: '#5a1018', b: '#8a2230', f: '#4a2e1c', dark: true },
    { id: 'tiec', only: 'goicam', name: 'Tiệc đêm', a: '#1e1028', b: '#3a1f45', f: '#140a1a', dark: true },
    { id: 'tang', only: 'tang', name: 'Lễ viếng', a: '#c9ccce', b: '#e7e8e6', f: '#b7b9b8' }],
  LIGHTS: ['Dịu', 'Nắng chiều', 'Studio'],
  FRAMES: ['Toàn thân', 'Cận cảnh'],
  backdrops() { return this.BACKDROPS.map((b, i) => ({ b, i })).filter((e) => !e.b.only || e.b.only === this.kind); },
  photoBg(c) {
    const B = this.BACKDROPS[(this.photo && this.photo.bg) || 0] || this.BACKDROPS[0];
    const g = c.createLinearGradient(0, 0, 0, G.H); g.addColorStop(0, B.a); g.addColorStop(0.75, B.b); g.addColorStop(1, B.f);
    c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
    if (B.id) return this.scene(c, B.id);
    const sw = c.createRadialGradient(330, 620, 40, 330, 620, 520); sw.addColorStop(0, `rgba(255,255,255,${B.name === 'Đêm' ? 0.08 : 0.55})`); sw.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = sw; c.fillRect(0, 0, 700, G.H);
    // two softboxes on light stands, turned in toward the dress: a lit diffuser in a dark cone, a halo of light
    for (const [x, flip] of [[58, 1], [606, -1]]) {
      const cy = 176, foot = 646, metal = '#2f2a28';
      c.strokeStyle = metal; c.lineCap = 'round';
      c.lineWidth = 3.2; c.beginPath(); c.moveTo(x, cy + 30); c.lineTo(x, foot - 34); c.stroke();
      c.lineWidth = 2.4; for (const dx of [-30, 0, 30]) { c.beginPath(); c.moveTo(x, foot - 36); c.lineTo(x + dx, foot + (dx ? 0 : 6)); c.stroke(); }
      c.beginPath(); c.ellipse(x, foot + 2, 36, 5, 0, 0, 7); c.fillStyle = 'rgba(40,25,15,0.12)'; c.fill();
      c.save(); c.translate(x, cy); c.rotate(0.18 * flip); c.scale(-flip, 1);
      // the box seen a little from the side: a dark tapered back, then the glowing face
      c.beginPath(); c.moveTo(-6, -14); c.lineTo(-30, -52); c.lineTo(-30, 52); c.lineTo(-6, 14); c.closePath();
      const bk = c.createLinearGradient(-30, 0, -6, 0); bk.addColorStop(0, '#1d1a19'); bk.addColorStop(1, '#3a3431'); c.fillStyle = bk; c.fill();
      c.fillStyle = metal; G.rr(c, -12, -10, 10, 20, 3); c.fill();
      const face = c.createRadialGradient(-26, 0, 4, -26, 0, 58); face.addColorStop(0, '#ffffff'); face.addColorStop(0.6, '#fff8ea'); face.addColorStop(1, '#efe2c8');
      c.beginPath(); c.ellipse(-30, 0, 9, 54, 0, 0, 7); c.fillStyle = face; c.fill();
      c.strokeStyle = 'rgba(30,25,22,0.75)'; c.lineWidth = 2; c.stroke();
      c.restore();
      const dim = B.dark ? 0.26 : 0.5;
      const glow = c.createRadialGradient(x + 22 * flip, cy, 6, x + 60 * flip, cy + 30, 210); glow.addColorStop(0, `rgba(255,250,235,${dim})`); glow.addColorStop(1, 'rgba(255,250,235,0)');
      c.fillStyle = glow; c.fillRect(x - 240, cy - 200, 480, 460);
    }
  },
  // the themed sets, drawn behind the dress (the photo area is x 0–700)
  scene(c, id) {
    const t = this.t;
    if (id === 'san') {
      // a theatre stage: plank floor, footlight glow, heavy red velvet curtains drawn back, a gold-fringed valance
      const fy = 560;
      const fl = c.createLinearGradient(0, fy, 0, G.H); fl.addColorStop(0, '#7a4a2a'); fl.addColorStop(1, '#3e2414');
      c.fillStyle = fl; c.fillRect(0, fy, 700, G.H - fy);
      c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
      for (let k = 1; k < 7; k++) { const y = fy + k * k * 3.4; c.beginPath(); c.moveTo(0, y); c.lineTo(700, y); c.stroke(); }
      for (let x = -200; x < 900; x += 70) { c.beginPath(); c.moveTo(350 + (x - 350) * 0.55, fy); c.lineTo(x, G.H); c.stroke(); }
      const fg = c.createLinearGradient(0, G.H - 40, 0, fy); fg.addColorStop(0, 'rgba(255,214,140,0.45)'); fg.addColorStop(1, 'rgba(255,214,140,0)');
      c.fillStyle = fg; c.fillRect(0, fy, 700, G.H - fy);
      for (let x = 40; x < 700; x += 90) { G.rr(c, x - 14, G.H - 16, 28, 10, 4); c.fillStyle = '#2a1a10'; c.fill(); c.beginPath(); c.ellipse(x, G.H - 16, 10, 3, 0, Math.PI, 0); c.fillStyle = '#ffe3a6'; c.fill(); }
      for (const side of [-1, 1]) {
        // each curtain: vertical folds with light on the crests, gathered toward the edge by a tie-back
        const x0 = side < 0 ? 0 : 700;
        c.save(); c.beginPath();
        c.moveTo(x0, 50); c.lineTo(x0 - side * 170, 50);
        c.bezierCurveTo(x0 - side * 150, 260, x0 - side * 60, 330, x0 - side * 58, 380);
        c.bezierCurveTo(x0 - side * 70, 470, x0 - side * 120, 560, x0 - side * 130, G.H);
        c.lineTo(x0, G.H); c.closePath(); c.clip();
        c.fillStyle = '#6e0f1c'; c.fillRect(0, 0, 700, G.H);
        for (let k = 0; k < 9; k++) {
          const fx = x0 - side * (8 + k * 20), fgr = c.createLinearGradient(fx - 10, 0, fx + 10, 0);
          fgr.addColorStop(0, 'rgba(0,0,0,0.35)'); fgr.addColorStop(0.5, 'rgba(255,120,130,0.22)'); fgr.addColorStop(1, 'rgba(0,0,0,0.35)');
          c.fillStyle = fgr; c.fillRect(fx - 10, 50, 20, G.H);
        }
        c.restore();
        c.beginPath(); c.ellipse(x0 - side * 60, 380, 14, 7, side * 0.4, 0, 7); c.fillStyle = '#d9a640'; c.fill(); c.strokeStyle = '#6b4a14'; c.lineWidth = 1.5; c.stroke();
      }
      const vg = c.createLinearGradient(0, 50, 0, 120); vg.addColorStop(0, '#8a1626'); vg.addColorStop(1, '#5c0c18');
      c.beginPath(); c.moveTo(0, 50); c.lineTo(700, 50); c.lineTo(700, 104);
      for (let x = 700; x >= 0; x -= 50) c.quadraticCurveTo(x - 25, 132, x - 50, 104);
      c.closePath(); c.fillStyle = vg; c.fill();
      c.strokeStyle = '#d9a640'; c.lineWidth = 3; c.setLineDash([2, 3]);
      c.beginPath(); for (let x = 700; x >= 0; x -= 50) { c.moveTo(x, 106); c.quadraticCurveTo(x - 25, 134, x - 50, 106); } c.stroke(); c.setLineDash([]);
      // the follow-spot
      const sp = c.createRadialGradient(330, 380, 30, 330, 420, 330); sp.addColorStop(0, 'rgba(255,240,200,0.3)'); sp.addColorStop(1, 'rgba(255,240,200,0)');
      c.fillStyle = sp; c.fillRect(0, 50, 700, G.H);
    } else if (id === 'tiec') {
      // a night party: soft out-of-focus lights in gold and rose, a glossy floor catching them
      for (let k = 0; k < 34; k++) {
        const x = (k * 137) % 700, y = 70 + ((k * 89) % 420), r = 14 + ((k * 31) % 34), tw = 0.5 + 0.5 * Math.sin(t * 1.3 + k);
        const col = ['255,196,110', '255,140,180', '210,150,255', '255,226,170'][k % 4];
        const bg = c.createRadialGradient(x, y, 0, x, y, r); bg.addColorStop(0, `rgba(${col},${0.32 * tw + 0.1})`); bg.addColorStop(0.7, `rgba(${col},${0.12 * tw + 0.04})`); bg.addColorStop(1, `rgba(${col},0)`);
        c.fillStyle = bg; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      }
      const fl = c.createLinearGradient(0, 580, 0, G.H); fl.addColorStop(0, 'rgba(255,190,220,0.12)'); fl.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = fl; c.fillRect(0, 580, 700, G.H - 580);
    } else if (id === 'tang') {
      // a quiet room: pale window light from the left, a thin thread of incense smoke drifting up
      const wl = c.createLinearGradient(0, 60, 420, 520); wl.addColorStop(0, 'rgba(255,255,250,0.55)'); wl.addColorStop(1, 'rgba(255,255,250,0)');
      c.save(); c.beginPath(); c.moveTo(0, 60); c.lineTo(160, 60); c.lineTo(520, G.H); c.lineTo(0, G.H); c.closePath(); c.fillStyle = wl; c.fill(); c.restore();
      c.save(); c.strokeStyle = 'rgba(120,120,125,0.18)'; c.lineWidth = 2.2; c.lineCap = 'round';
      for (let k = 0; k < 2; k++) {
        c.beginPath();
        for (let i = 0; i <= 40; i++) { const y = 620 - i * 12, x = 600 + k * 30 + Math.sin(i * 0.35 + t * 0.8 + k) * (4 + i * 0.6); i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.stroke();
      }
      c.restore();
      c.fillStyle = 'rgba(80,80,85,0.12)'; c.fillRect(0, 600, 700, 2);
    }
  },
  dress(c) {
    const B = this.BACKDROPS[(this.photo && this.photo.bg) || 0], dark = !!(B && B.dark);
    const sp = c.createRadialGradient(330, 360, 40, 330, 360, 420);
    sp.addColorStop(0, `rgba(255,250,240,${dark ? 0.16 : 0.9})`); sp.addColorStop(1, 'rgba(255,250,240,0)');
    c.fillStyle = sp; c.fillRect(0, 50, 700, 670);
    const v = this.daily ? this.view : null, j = G.job;
    const design = v ? v.design : G.jobDesign(), scale = v ? v.scale : G.jobScale();
    const asm = G.geo.build(design, scale, false), P = this.photo || {};
    let z = Math.min(620 / (asm.botY - asm.topY), 3.4), ty = 62 - asm.topY * z;
    // close-up: frame the bust and upper flap
    if (P.frame === 1) { z *= 1.75; ty = 380 - (asm.topY + (asm.botY - asm.topY) * 0.27) * z; }
    c.save(); c.beginPath(); c.rect(0, 50, 700, G.H - 50); c.clip();
    c.translate(330, ty); c.scale(z, z);
    G.art.garment(c, asm, v ? v.fabs : G.jobFabs(), { mannequin: true, cache: true, t: this.t, decorItems: v ? v.decorItems : j.decor.items });
    c.restore();
    // the light: soft daylight, warm late-afternoon sun, or a contrasty studio spot
    c.save(); c.beginPath(); c.rect(0, 50, 700, G.H - 50); c.clip();
    if (P.light === 1) {
      c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(255,214,170,0.75)'; c.fillRect(0, 50, 700, G.H);
      c.globalCompositeOperation = 'source-over';
      const sun = c.createLinearGradient(0, 80, 700, 600); sun.addColorStop(0, 'rgba(255,200,120,0.32)'); sun.addColorStop(1, 'rgba(255,200,120,0)');
      c.fillStyle = sun; c.fillRect(0, 50, 700, G.H);
    } else if (P.light === 2) {
      const vg = c.createRadialGradient(330, 330, 120, 330, 360, 520); vg.addColorStop(0, 'rgba(255,255,255,0.06)'); vg.addColorStop(1, 'rgba(10,6,4,0.55)');
      c.fillStyle = vg; c.fillRect(0, 50, 700, G.H);
    }
    c.restore();
  },
  // photo mode: pick a backdrop, the light and the framing, then take the shot
  drawPhoto(c) {
    const U = G.UI, P = this.photo;
    this.photoBg(c); this.dress(c);
    // viewfinder corners
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 3;
    for (const [x, y, sx, sy] of [[60, 80, 1, 1], [640, 80, -1, 1], [60, 690, 1, -1], [640, 690, -1, -1]]) { c.beginPath(); c.moveTo(x, y + sy * 34); c.lineTo(x, y); c.lineTo(x + sx * 34, y); c.stroke(); }
    if (Math.sin(this.t * 4) > 0) { c.beginPath(); c.arc(84, 104, 6, 0, 7); c.fillStyle = '#e0424f'; c.fill(); }
    U.card(c, 720, 80, 520, 520);
    U.title(c, 'Chụp ảnh áo', 744, 118);
    G.text(c, 'Ảnh này vào album và lên báo nếu Tí Flash ghé.', 744, 146, { size: 13, color: U.T.soft });
    G.text(c, 'Phông nền', 744, 192, { size: 14, weight: 800, font: G.GAME });
    const list = this.backdrops(), tw = list.length > 4 ? 88 : 108, step = tw + (list.length > 4 ? 8 : 10);
    list.forEach(({ b, i }, k) => {
      const x = 744 + k * step, y = 210, on = P.bg === i;
      G.ui.hits.push({ id: 'pb' + i, x, y, w: tw, h: 70, enabled: true, cb: () => { P.bg = i; G.sfx.click(); } });
      U.tile(c, x, y, tw, 70, { sel: on, hov: G.inRect(G.pointer, { x, y, w: tw, h: 70 }) });
      const g = c.createLinearGradient(0, y + 8, 0, y + 46); g.addColorStop(0, b.a); g.addColorStop(1, b.b);
      G.rr(c, x + 8, y + 8, tw - 16, 34, 6); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(0,0,0,0.15)'; c.stroke();
      if (b.only) { c.beginPath(); c.arc(x + tw - 10, y + 10, 8, 0, 7); c.fillStyle = '#f6cd6a'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 1.4; c.stroke(); G.text(c, '★', x + tw - 10, y + 11, { size: 10, align: 'center', color: '#7a5420' }); }
      G.text(c, b.name, x + tw / 2, y + 57, { size: 12, weight: 700, align: 'center' });
    });
    G.text(c, 'Ánh sáng', 744, 318, { size: 14, weight: 800, font: G.GAME });
    let x = 744; this.LIGHTS.forEach((n, i) => { x += U.chip(c, 'pl' + i, n, x, 334, P.light === i, () => { P.light = i; }, { w: 150 }) + 8; });
    G.text(c, 'Khung hình', 744, 402, { size: 14, weight: 800, font: G.GAME });
    x = 744; this.FRAMES.forEach((n, i) => { x += U.chip(c, 'pf' + i, n, x, 418, P.frame === i, () => { P.frame = i; }, { w: 150 }) + 8; });
    G.button(c, 'shoot', 'Chụp', 744, 500, 472, 66, () => {
      this.phase = 'done'; this.t = 0; G.sfx.shutter();
      if (this.snap) { this.snap.photo = { bg: P.bg, light: P.light, frame: P.frame }; G.save(); }
    }, { size: 24, r: 20, icon: (cc, ix, iy) => this.cameraIcon(cc, ix - 52, iy) });
    U.topbar(c, 'Chụp ảnh');
  },
  cameraIcon(c, x, y) {
    c.save(); c.translate(x, y); c.fillStyle = '#fff6e6'; c.strokeStyle = '#fff6e6'; c.lineWidth = 2;
    G.rr(c, -15, -9, 30, 20, 4); c.fill(); c.fillRect(-6, -13, 12, 5);
    c.beginPath(); c.arc(0, 1, 6.5, 0, 7); c.fillStyle = '#b2323f'; c.fill(); c.beginPath(); c.arc(0, 1, 3.5, 0, 7); c.fillStyle = '#fff6e6'; c.fill();
    c.restore();
  },
  draw(c) {
    const U = G.UI, r = this.r;
    if (this.phase === 'photo') return this.drawPhoto(c);
    this.photoBg(c);
    this.dress(c);
    for (const p of this.parts || []) {
      c.save(); c.translate(p.x, p.y); c.rotate(p.r); c.fillStyle = p.col;
      if (p.petal) { c.beginPath(); c.ellipse(0, 0, p.w * 0.7, p.w * 0.24, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(150,140,120,0.35)'; c.lineWidth = 0.8; c.stroke(); }
      else c.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2);
      c.restore();
    }
    if (this.t < 0.9) { c.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - Math.abs(this.t - 0.25) * 4)})`; c.fillRect(0, 0, G.W, G.H); }
    if (this.t < 1.6) { G.text(c, 'Hoàn thành!', 330, 120, { size: 44, font: G.SERIF, weight: 700, align: 'center', color: U.T.accent }); return U.topbar(c, 'Hoàn thành'); }
    if (this.daily) return this.drawDaily(c);
    if (this.rack) {
      const s = G.state, r = this.r;
      U.card(c, 700, 120, 556, 330);
      U.title(c, 'Đã treo lên sạp', 724, 158);
      G.text(c, `Chất lượng ${r.quality}`, 724, 200, { size: 18, weight: 800 });
      G.text(c, `Giá trị ước tính ở hội chợ: khoảng ${Math.round(this.rack.value / 10) * 10} xu`, 724, 232, { size: 16, weight: 700, color: U.T.gold });
      G.text(c, this.rack.trendy ? '✓ Hợp mốt (đúng dự báo gu của Báo Trà Đá): giá trị +25%' : 'Chưa hợp mốt: xem dự báo gu trên báo để may đúng gu', 724, 262, { size: 13, weight: 700, color: this.rack.trendy ? U.T.ok : U.T.soft });
      G.text(c, `Sạp: ${s.rack.length}/${G.fair.rackSize()} áo · hội chợ phố đi bộ vào cuối tháng (sau ${G.econ.daysLeft()} ngày)`, 724, 300, { size: 14 });
      G.wrap(c, 'Đến hội chợ, bạn tự đặt giá cho từng áo. Rẻ thì bán nhanh, đắt quá thì người ta chỉ ngắm. Áo không bán được sẽ “lỗi mốt” dần, mất 10% giá trị mỗi tháng.', 724, 330, 508, 21, { size: 13, color: U.T.soft });
      U.primary(c, 'next', 'Về quầy  →', () => { G.job = null; G.go('desk'); });
      return U.topbar(c, 'Áo bán sẵn');
    }
    const j = G.job, cl = G.client(j.com.client);
    U.card(c, 700, 66, 556, 576);
    // the client, reacting to the dress
    G.Dialog.portrait(c, j.com.client, 720, 80, 64, 72);
    const happy = r.success, bob = Math.sin(this.t * 6) * 2;
    c.save(); c.translate(778, 84 + bob); c.beginPath(); c.arc(0, 0, 13, 0, 7); c.fillStyle = happy ? '#ffe1e8' : '#e9e4dc'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 1.8; c.stroke();
    G.text(c, happy ? '♥' : '…', 0, 1, { size: 15, weight: 800, align: 'center', color: happy ? '#d6457a' : U.T.soft }); c.restore();
    G.text(c, cl.name, 800, 100, { size: 20, weight: 800, font: G.GAME, color: U.T.accent });
    G.text(c, r.success ? 'Hài lòng' : 'Chưa hài lòng', 1232, 100, { size: 15, weight: 800, font: G.GAME, align: 'right', color: r.success ? U.T.ok : U.T.bad });
    let y = 118 + G.wrap(c, '“' + this.say + '”', 800, 118, 432, 20, { size: 14, maxLines: 4 }) + 20;
    // her wishes first (that is what she judges), then the craft, then the money
    for (const ck of r.checks) {
      const extra = ['min', 'max', 'mat', 'gc', 'cols', 'cheap', 'qmax'].includes(ck.r.type) ? ` (đạt ${ck.value})` : '';
      G.text(c, `${ck.ok ? '✓' : '✗'} ${G.reqText(ck.r)}${extra}`, 724, y, { size: 14, weight: 700, color: ck.ok ? U.T.ok : U.T.bad }); y += 22;
    }
    y += 2; c.fillStyle = U.T.line; c.fillRect(724, y, 508, 1.5); y += 20;
    // scores count up one after another, like a judge reading them out
    const at = Math.max(0, this.t - 1.6);
    // a "poorly made" costume turns the scale around: rough work is what was ordered
    const rough = r.checks.find((ck) => ck.r.type === 'qmax');
    const qLabel = rough ? `tối đa ${rough.r.val}` : `yêu cầu ${j.com.quality}`, qOk = rough ? rough.ok : r.qualOk;
    G.text(c, `Chất lượng ${Math.round(r.quality * G.easeOut(at / 1.2))} / ${qLabel}`, 724, y, { size: 15, weight: 800, color: qOk ? U.T.ok : U.T.bad }); y += 26;
    [['Canh sợi', r.grain, 30], ['Vừa người', r.fit, 20], ['Đường may', r.sew, 50]].forEach(([lab, v, wgt], i) => {
      const k = G.easeOut((at - i * 0.25) / 0.6), vv = v * k;
      G.text(c, `${lab} (${wgt}%)`, 724, y, { size: 12, weight: 600 });
      G.rr(c, 860, y - 5, 300, 10, 5); c.fillStyle = '#eadfcd'; c.fill();
      G.rr(c, 860, y - 5, Math.max(8, 300 * vv), 10, 5); c.fillStyle = rough ? '#a08060' : v > 0.85 ? U.T.ok : v > 0.65 ? U.T.gold : U.T.bad; c.fill();
      G.text(c, Math.round(vv * 100) + '%', 1232, y, { size: 12, weight: 800, align: 'right' });
      y += 22;
    });
    const iron = G.tool('iron');
    if (iron.bonus) {
      const got = Math.round(iron.bonus * (j.pressed === undefined ? 1 : j.pressed));
      G.text(c, got ? `${iron.name}: +${got} điểm chất lượng${got < iron.bonus ? ` (ủi chưa hết, tối đa +${iron.bonus})` : ''}` : 'Áo chưa được ủi', 724, y, { size: 12, weight: 700, color: got ? U.T.ok : U.T.soft }); y += 20;
    }
    // the tailor's eye: never pass or fail, a tip and some friendship
    const F = r.flair;
    if (F) {
      y += 4; G.text(c, 'Thẩm mỹ', 724, y, { size: 13, weight: 800 });
      U.flowers(c, 800, y, F.pts, 8);
      U.fitText(c, [F.color.note, F.place.note].filter(Boolean).join(' · '), 872, y, 360, { size: 12, weight: 600, color: U.T.soft });
      y += 20;
    }
    y += 4; c.fillStyle = U.T.line; c.fillRect(724, y, 508, 1.5); y += 20;
    const extra = [r.tip ? `thưởng${r.quality >= 90 && G.week && G.week.is('cuoi') ? ' mùa cưới' : ''} +${r.tip}` : '', r.flairPay ? `thẩm mỹ +${r.flairPay}` : '', r.trendPay ? `hợp mốt +${r.trendPay}` : ''].filter(Boolean).join(' · ');
    const pk = G.easeOut((at - 0.8) / 0.8), payShown = Math.round(r.pay * pk);
    // she pays: the purse in the top bar counts up with a tick per handful of coins
    if (this.held) {
      const hold = Math.round(this.held * (1 - pk));
      if (hold !== G.ui.coinHold && (this.tickAt || 0) < this.t - 0.06) { this.tickAt = this.t; G.sfx.tick(); }
      G.ui.coinHold = hold; if (!hold) this.held = 0;
    }
    G.art.coin(c, 732, y, 9);
    G.text(c, `Tiền công +${payShown} xu${extra ? ' · ' + extra : ''}${r.success ? '' : ` (khách trả ${Math.round((r.pay / j.com.budget) * 100)}%)`}`, 748, y, { size: 16, weight: 800, font: G.GAME, color: U.T.gold }); y += 24;
    if (this.arcRw.length) { G.text(c, `Quà đơn tâm sự: ${this.arcRw.join(' · ')}`, 724, y, { size: 13, weight: 700, color: '#d6698a' }); y += 21; }
    G.text(c, `Danh tiếng +${Math.round(this.gain * 100) / 100} · Hạng ${G.rank()}`, 724, y, { size: 14, weight: 700 }); y += 24;
    // friendship
    const b = this.bond;
    if (b) {
      const N = G.bond.NAMES();
      G.text(c, '♥', 724, y, { size: 16, weight: 800, color: '#d6698a' });
      G.text(c, `${b.name}: +${b.gained} thân tình · ${N[b.lvl]}${b.lvlUp ? ' (lên cấp!)' : ''}`, 744, y, { size: 13, weight: 700, color: b.lvlUp ? '#d6698a' : U.T.ink });
      G.rr(c, 1080, y - 5, 152, 10, 5); c.fillStyle = '#f3dbe3'; c.fill();
      G.rr(c, 1080, y - 5, Math.max(8, 152 * G.bond.frac(j.com.client)), 10, 5); c.fillStyle = '#d6698a'; c.fill();
      y += 20;
      for (const u of b.unlocks.slice(0, 2)) { G.text(c, '  ✦ ' + u, 744, y, { size: 12, weight: 600, color: '#b0506e' }); y += 18; }
    }
    if (this.evMsg) { G.text(c, '🎀 ' + this.evMsg, 724, y, { size: 13, weight: 700, color: U.T.gold }); y += 20; }
    if (this.press && this.press.issue) {
      U.needles(c, 724, y + 2, this.press.kim, 0.6);
      G.text(c, `Tí Flash vừa chụp ảnh · đón đọc Báo Trà Đá số ${this.press.issue.no}`, 834, y, { size: 13, weight: 700, color: U.T.soft });
    }
    U.primary(c, 'next', 'Về quầy  →', () => { G.job = null; this.held = G.ui.coinHold = 0; G.go('desk'); });
    U.secondary(c, 'sharelink', 'Chia sẻ áo', () => G.share.copyLink(this.snap));
    U.topbar(c, 'Giao áo');
  },
  drawDaily(c) {
    const U = G.UI, d = this.daily, res = d.res, r = this.r;
    U.card(c, 700, 66, 556, 576);
    U.title(c, `Đơn ngày ${G.daily.label(d.key)}`, 724, 104);
    G.text(c, d.first ? 'Lượt chính thức hôm nay' : `Lượt luyện tập · điểm chính thức: ${res.score}`, 724, 134, { size: 14, weight: 600, color: U.T.soft });
    G.text(c, String(d.score), 724, 196, { size: 72, font: G.SERIF, weight: 700, color: U.T.accent });
    G.text(c, '/100', 724 + 92, 210, { size: 22, weight: 700, color: U.T.soft });
    G.text(c, `🔥 Chuỗi ${G.state.daily.streak} ngày`, 1232, 186, { size: 20, weight: 800, align: 'right', color: '#d0662f' });
    let y = 262;
    for (const [lab, v] of [['Canh sợi', r.grain], ['Vừa người', r.fit], ['Đường may', r.sew]]) {
      G.text(c, lab, 724, y, { size: 13, weight: 600 });
      G.rr(c, 840, y - 5, 330, 10, 5); c.fillStyle = '#eadfcd'; c.fill();
      G.rr(c, 840, y - 5, Math.max(8, 330 * v), 10, 5); c.fillStyle = U.T.ok; c.fill();
      G.text(c, Math.round(v * 100) + '%', 1232, y, { size: 13, weight: 800, align: 'right' });
      y += 24;
    }
    y += 8;
    for (const ck of r.checks) { G.text(c, `${ck.ok ? '✓' : '✗'} ${G.reqText(ck.r)}`, 724, y, { size: 13, weight: 600, color: ck.ok ? U.T.ok : U.T.bad }); y += 21; }
    y += 6;
    U.needles(c, 724, y + 4, res.kim, 0.8);
    G.text(c, 'Madame Sa chấm', 900, y + 4, { size: 13, weight: 700, color: U.T.soft });
    y += 34;
    if (d.first) G.text(c, `Thưởng vào tiệm thật: +${res.reward} xu`, 724, y, { size: 15, weight: 800, color: U.T.gold });
    // last days
    const keys = Object.keys(G.state.daily.results).sort().slice(-5);
    keys.forEach((k, i) => {
      const x = 724 + i * 102, rr = G.state.daily.results[k];
      G.rr(c, x, 560, 94, 56, 10); c.fillStyle = k === d.key ? '#fff1dc' : '#f4ecdd'; c.fill();
      G.text(c, G.daily.label(k), x + 47, 576, { size: 12, weight: 700, align: 'center', color: U.T.soft });
      G.text(c, String(rr.score), x + 47, 600, { size: 18, weight: 800, align: 'center' });
    });
    U.primary(c, 'next', 'Về quầy  →', () => { G.job = null; G.go('desk'); });
    U.secondary(c, 'copyres', 'Sao chép kết quả', () => G.share.copy(G.daily.shareText(d.key)));
    G.button(c, 'dcard', 'Tải thẻ ảnh', G.W - 610, G.H - 66, 170, 50, () => G.share.saveCard(this.view, { shop: G.state.shopName, client: (G.client(res.client) || {}).name, quality: res.q, kim: res.kim }), { style: 'ghost', size: 16, r: 25 });
    U.hint(c, 'Mỗi ngày một đơn giống nhau cho cả nước · lượt đầu là điểm chính thức');
    U.topbar(c, 'Kết quả đơn ngày');
  },
  down() { if (this.t < 1.6) this.t = 1.6; }
};

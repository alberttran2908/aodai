// Story dialog overlay: runs a scripted scene (array of steps) on top of any screen.
// Steps: { who, t } line · { choice: [{ t, go }] } · { label } · { jump } · { do: action, ... } (see G.story.act).
// Click / Space / Enter advances; the dialog swallows all input while open.
G.Dialog = {
  active: null,
  SHOP_NAMES: ['Tiệm May Chỉ Hồng', 'Áo Dài Bà Tư', 'Tiệm May Gió Nam', 'Áo Dài Mây Hồng'],
  open(script, vars, onDone) {
    const steps = typeof script === 'string' ? (G.SCRIPTS && G.SCRIPTS[script]) : script;
    if (!steps || !steps.length) { if (onDone) onDone(); return; }
    this.active = { steps, i: -1, vars: vars || {}, onDone, shown: 0, line: null, t: 0 };
    this.advance();
  },
  fill(t) {
    const v = this.active ? this.active.vars : {};
    return String(t).replace(/\{(\w+)\}/g, (m, k) => (k === 'shop' ? G.state.shopName : v[k] !== undefined ? v[k] : m));
  },
  // run steps until one needs the player (a line, a choice or naming the shop)
  advance() {
    const d = this.active;
    for (let guard = 0; guard < 200; guard++) {
      d.i++;
      const st = d.steps[d.i];
      if (!st) { this.close(); return; }
      if (st.label !== undefined && st.t === undefined && !st.do && !st.choice && !st.jump) continue;
      if (st.jump && st.t === undefined) { this.goto(st.jump); continue; }
      if (st.do === 'nameShop') { d.line = { naming: true }; return; }
      if (st.do) { G.story.act(st); continue; }
      if (st.choice) { d.line = { choice: st.choice }; return; }
      if (st.t !== undefined) {
        // only explicit walkIn steps put someone at the counter (phone calls just show the portrait)
        d.line = { who: st.who || 'narr', t: this.fill(st.t) }; d.shown = 0; d.jumpAfter = st.jump || null;
        return;
      }
    }
  },
  goto(label) { const d = this.active, k = d.steps.findIndex((s) => s.label === label); d.i = k >= 0 ? k - 1 : d.steps.length; },
  next() {
    const d = this.active; if (!d || !d.line) return;
    if (d.line.t !== undefined && d.shown < d.line.t.length) { d.shown = d.line.t.length; return; }
    if (d.line.choice || d.line.naming) return;
    if (d.jumpAfter) { this.goto(d.jumpAfter); d.jumpAfter = null; }
    this.advance();
  },
  choose(opt) { G.sfx.click(); this.goto(opt.go); this.advance(); },
  setName(name) {
    const clean = String(name || '').replace(/[^\p{L}\p{N} '&.-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 24);
    if (!clean) return;
    G.state.shopName = clean; G.state.story.flags.named = true; G.save(); G.sfx.done();
    this.advance();
  },
  close() { const d = this.active; this.active = null; if (G.story) G.story.cameo = null; G.save(); if (d && d.onDone) d.onDone(); },
  key(e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); this.next(); }
  },
  update(dt) { const d = this.active; if (d && d.line && d.line.t !== undefined) d.shown = Math.min(d.line.t.length, d.shown + dt * 55); if (d) d.t += dt; },
  // a speaker's head-and-shoulders portrait, drawn with the same renderer as the clients
  portrait(c, id, x, y, w, h) {
    const cl = G.client(id); if (!cl) return;
    const look = G.scenes.desk.clientLook(cl), asm = G.geo.build(look.design, 1, false), z = h / 46;
    c.save(); G.rr(c, x, y, w, h, 14);
    const bg = c.createRadialGradient(x + w / 2, y + h * 0.35, 4, x + w / 2, y + h / 2, h * 0.75); bg.addColorStop(0, '#fff3d8'); bg.addColorStop(1, '#e9cfa6');
    c.fillStyle = bg; c.fill(); c.clip();
    c.translate(x + w / 2, y + 41 * z); c.scale(z, z);
    G.art.garment(c, asm, look.fab, { mannequin: true, still: true, noSheen: true });
    c.restore();
    G.rr(c, x, y, w, h, 14); c.strokeStyle = G.INK; c.lineWidth = 2.2; c.stroke();
  },
  draw(c) {
    const d = this.active; if (!d || !d.line) return;
    const U = G.UI, L = d.line;
    c.fillStyle = 'rgba(43,29,24,0.35)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'dlg_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => this.next() });
    U.card(c, 40, 494, 1200, 200);
    let tx = 72;
    if (L.who && L.who !== 'narr') {
      this.portrait(c, L.who, 60, 508, 160, 172);
      tx = 244;
      const cl = G.client(L.who), name = cl ? cl.name : L.who;
      // visual-novel name plate sitting on the box's top edge
      c.font = `800 20px ${G.GAME}`;
      const nw = c.measureText(name).width + 36;
      G.rr(c, tx - 8, 476, nw, 36, 10); c.fillStyle = '#7a2330'; c.fill();
      G.rr(c, tx - 8, 472, nw, 34, 10);
      const ng = c.createLinearGradient(0, 472, 0, 506); ng.addColorStop(0, '#d65a67'); ng.addColorStop(1, '#b23a48');
      c.fillStyle = ng; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2.2; c.stroke();
      G.text(c, name, tx - 8 + nw / 2, 490, { size: 20, weight: 800, font: G.GAME, align: 'center', color: '#fff6e6' });
      if (cl && cl.role) U.outlined(c, cl.role, tx + nw + 6, 488, { size: 14, color: '#fff6e6', halo: G.INK });
    }
    if (L.t !== undefined) {
      const narr = L.who === 'narr';
      G.wrap(c, L.t.slice(0, Math.floor(d.shown)), tx, narr ? 530 : 552, 1200 - (tx - 40) - 40, 28, { size: 19, font: narr ? G.SERIF : G.FONT, weight: narr ? 400 : 500, color: narr ? U.T.soft : U.T.ink });
      if (d.shown >= L.t.length && Math.sin(d.t * 5) > 0) G.text(c, '▼', 1212, 670, { size: 14, align: 'center', color: U.T.accent });
    }
    if (L.choice) {
      G.text(c, 'Bạn trả lời:', 72, 528, { size: 16, weight: 800, color: U.T.accent });
      L.choice.forEach((o, i) => G.button(c, 'dlgc' + i, this.fill(o.t), 72, 552 + i * 56, 1136, 46, () => this.choose(o), { style: i ? 'ghost' : 'primary', size: 17, r: 23 }));
    }
    if (L.naming) {
      G.text(c, 'Đặt tên cho tiệm:', 72, 528, { size: 18, weight: 800, color: U.T.accent });
      this.SHOP_NAMES.forEach((n, i) => G.button(c, 'dlgn' + i, n, 72 + (i % 2) * 380, 552 + Math.floor(i / 2) * 56, 360, 46, () => this.setName(n), { style: 'ghost', size: 17, r: 23 }));
      G.button(c, 'dlgnx', 'Tự đặt tên…', 852, 552, 356, 102, () => {
        let v = null; try { v = window.prompt('Tên tiệm của bạn (tối đa 24 ký tự):', G.state.shopName); } catch (e) {}
        if (v) this.setName(v);
      }, { size: 18, r: 23 });
    }
  }
};

// End-of-season curtain call: every client you have served walks the runway in the best dress
// you ever made for them (taken from your own album), then Bà Tư takes a bow.
G.scenes.parade = {
  enter() {
    this.t = 0;
    const best = {};
    for (const it of G.state.collection) {
      if (!it.client || !G.clientAllowed(G.client(it.client))) continue;
      if (!best[it.client] || it.quality > best[it.client].quality) best[it.client] = it;
    }
    this.walkers = Object.values(best).sort((a, b) => a.id - b.id);
    this.walkers.push({ bow: true, client: 'batu' });
    this.STEP = 2.6;
  },
  update(dt) { this.t += dt; },
  draw(c) {
    const U = G.UI;
    // stage: dark curtains, warm spotlight, runway
    c.fillStyle = '#2b1416'; c.fillRect(0, 0, G.W, G.H);
    for (let x = 0; x < G.W; x += 40) { c.fillStyle = x % 80 ? '#5a1d24' : '#6d2530'; c.fillRect(x, 50, 40, 470); }
    const sp = c.createRadialGradient(640, 420, 40, 640, 420, 520);
    sp.addColorStop(0, 'rgba(255,236,200,0.55)'); sp.addColorStop(1, 'rgba(255,236,200,0)');
    c.fillStyle = sp; c.fillRect(0, 50, G.W, G.H);
    c.fillStyle = '#3a2420'; c.beginPath(); c.moveTo(380, 720); c.lineTo(560, 520); c.lineTo(720, 520); c.lineTo(900, 720); c.closePath(); c.fill();
    const i = Math.min(this.walkers.length - 1, Math.floor(this.t / this.STEP)), w = this.walkers[i];
    const u = (this.t - i * this.STEP) / this.STEP, last = i === this.walkers.length - 1;
    const x = last ? 640 : G.lerp(-160, G.W + 160, u < 0.35 ? u / 0.35 * 0.5 : u < 0.65 ? 0.5 : 0.5 + ((u - 0.65) / 0.35) * 0.5);
    let design, fabs, scale = 1, items = [];
    if (w.bow) { const look = G.scenes.desk.clientLook(G.client('batu')); design = look.design; fabs = look.fab; }
    else { design = w.design; fabs = w.fabs; scale = w.scale || 1; items = w.decorItems || []; }
    const asm = G.geo.build(design, scale, false), z = Math.min(560 / (asm.botY - asm.topY), 3.6);
    c.save(); c.translate(x, 70 - asm.topY * z + (w.bow && u > 0.4 ? Math.sin(Math.min(1, (u - 0.4) * 3) * Math.PI) * 18 : 0)); c.scale(z, z);
    G.art.garment(c, asm, fabs, { mannequin: true, cache: true, t: this.t, decorItems: items });
    c.restore();
    // caption
    const cl = G.client(w.client);
    U.card(c, 380, 610, 520, 70, { fill: 'rgba(251,246,236,0.94)' });
    G.text(c, w.bow ? 'Bà Tư cúi chào' : cl ? cl.name : '', 640, 636, { size: 20, font: G.SERIF, weight: 700, align: 'center', color: U.T.accent });
    G.text(c, w.bow ? 'Cảm ơn con đã giữ tiệm.' : `${w.title || 'Áo dài'} · ${w.quality} điểm`, 640, 662, { size: 14, align: 'center', color: U.T.soft });
    G.text(c, 'ĐÊM HỘI ÁO DÀI', 640, 92, { size: 34, font: G.SERIF, weight: 700, align: 'center', color: '#ffe3a8' });
    if (last && u > 0.6) U.primary(c, 'back', 'Về quầy  →', () => G.go('desk'));
    else G.button(c, 'skip', 'Bỏ qua ›', G.W - 150, G.H - 60, 130, 40, () => { this.t = (this.walkers.length - 1) * this.STEP + 1.8; }, { style: 'ghost', size: 14, r: 20 });
  }
};

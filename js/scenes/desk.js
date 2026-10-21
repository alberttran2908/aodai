// Front desk: ring the bell, a client walks in, tells her story and hands over a commission card.
// Also the hub of the season: chapter goals, calendar, newspaper, mailbox, client book, daily order and gifts.
G.scenes.desk = {
  DISCLAIMER: 'Các nhân vật “người nổi tiếng” trong game là hư cấu, nhại vui tên và phong cách sân khấu, không đại diện và không liên quan tới người thật. Có thể tắt họ trong phần Cài đặt ở màn hình chính.',
  enter() {
    this.t = 0; this.walk = G.state.commission ? 1 : 0; this.gift = false; this.cameoId = null; this.cameoWalk = 1;
    this.seenIssues = this.seenIssues || G.state.press.issues.length;
    if (G.state.econ.fairPending !== null && G.state.econ.fairPending !== undefined && G.scenes.fair) { G.go('fair'); return; }
    // a new day: whoever ran out of patience went to Kevin's; empty seats fill up
    const left = G.bench.on() ? G.bench.refill() : [];
    for (const st of left) G.toast(`${G.client(st.com.client).name} chờ lâu quá, sang Siêu Tốc 24h rồi…`, G.C.red);
    if (!this.billsDue()) G.story.onDesk();
  },
  // month-end bills (business modes): a short scene, then bankruptcy / end of the challenge if it came to that
  billsDue() {
    const e = G.state.econ;
    if (e.bankrupt || e.finished) { if (!e.pending) { G.go('ledger'); return true; } }
    const res = e.pending; if (!res || G.Dialog.active) return false;
    e.pending = null; G.save();
    G.Dialog.open(G.econ.billScript(res), {}, () => {
      if (res.rescue) G.story.mailFrom('batu_tip');
      if (res.bankrupt || res.finished) G.go('ledger'); else G.story.onDesk();
    });
    return true;
  },
  update(dt) {
    this.t += dt;
    if (this.cat) {
      this.cat.pet = Math.max(0, this.cat.pet - dt);
      this.cat.hearts = this.cat.hearts.filter((h) => (h.t += dt) < h.life);
      for (const h of this.cat.hearts) { h.x += h.vx * dt; h.y += h.vy * dt; }
    }
    if (G.state.commission && this.walk < 1) {
      this.walk = Math.min(1, this.walk + dt * 1.6);
      if (this.walk >= 1 && this.disclaimer) { this.disclaimer = false; G.Dialog.open([{ who: 'narr', t: this.DISCLAIMER }]); }
    }
    if (G.story.cameo !== this.cameoId) { this.cameoId = G.story.cameo; this.cameoWalk = 0; }
    this.cameoWalk = Math.min(1, this.cameoWalk + dt * 2);
    // a new issue of the paper slides under the door
    const n = G.state.press.issues.length;
    if (n > this.seenIssues) { this.seenIssues = n; G.sfx.paper(); G.toast('📰 Tí Flash vừa bỏ báo vào khe cửa!'); }
    // orders queued by a story scene take a seat as appointments right away
    if (G.state.story.queue.length && !G.Dialog.active && G.bench.on()) G.bench.pullQueue();
  },
  // the daily order (no bench) still rings the bell
  ring() { this.welcome(G.story.nextVisit()); },
  // invite a waiting client to the counter
  callIn(i) { const st = G.bench.take(i); this.welcome(st.com); },
  // close early: the day ends (waiting clients lose patience)
  closeDay() {
    const res = G.econ.advanceDay(); G.save();
    G.toast('Tiệm đóng cửa sớm. Ngày mai lại mở!');
    if (res && res.fair) { G.go('fair'); return; }
    this.enter();
  },
  welcome(com) {
    const s = G.state;
    const b = s.bond[com.client], d = G.BONDS && G.BONDS[com.client];
    if (b && b.lvl >= 5 && d && d.bell) G.sfx.tune(d.bell); else G.sfx.bell();
    if (com.kind === 'normal') { const g = G.bond.greet(com.client); if (g) com.line = g; }
    const cl = G.client(com.client);
    this.disclaimer = false;
    if (cl && cl.star && !s.settings.disclaimerSeen) { s.settings.disclaimerSeen = true; this.disclaimer = true; }
    this.walk = 0; this.t = 0; this.gift = false; this.quote = null;
    G.save();
  },
  // what a client wears to the shop: everyday clothes (they come to have an áo dài made!). Bà Tư and the
  // other alley regulars who are tailors or performers in the story keep their áo dài.
  CASUAL_F: [
    { neck: 'lasen', sleeve: 'lung', bottom: 'quan', pants: 'den' },     // blouse with a soft collar, dark trousers
    { neck: 'tron', sleeve: 'ngan', bottom: 'chanvay', pants: 'den' },   // round-neck top, skirt
    { neck: 'thuyen', sleeve: 'lung', bottom: 'ongrong', pants: 'trang' }, // boat-neck top, wide trousers
    { neck: 'vuong', sleeve: 'ngan', bottom: 'chanvay', pants: 'trang' }
  ],
  CASUAL_M: [{ neck: 'dung', sleeve: 'ngan', bottom: 'quan', pants: 'den' }, { neck: 'tron', sleeve: 'dai', bottom: 'quan', pants: 'den' }],
  clientLook(cl) {
    const fid = Object.keys(G.CAT.FABRICS).find((k) => k.startsWith(cl.outfit[0] + '.' + cl.outfit[1] + '.')) || 'lua.trang.tron';
    const f = G.CAT.FABRICS[fid];
    if (!cl.npc && G.CAT.CLIENTS.includes(cl)) {
      let h = 0; for (const ch of cl.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      const set = cl.male ? this.CASUAL_M : this.CASUAL_F, o = set[h % set.length];
      const mat = ['gam', 'nhung', 'voan', 'ren'].includes(f.mat) ? f.mat : 'dui'; // everyday cotton unless the client dresses up
      return {
        design: Object.assign({ length: 'ao', hem: 'thang', fit: cl.male ? 'nam' : 'om', slit: 'vua', buttons: 'an', accent: 'vang', casual: true, head: !cl.male && cl.hair === 'bun' && !cl.look ? 'hoacai' : 'none', male: !!cl.male, broad: !!cl.broad, look: cl.look }, o),
        fab: { mat, color: f.color, print: 'tron' }
      };
    }
    if (cl.male) return {
      design: { neck: 'dung', sleeve: 'dai', length: 'nam', hem: 'thang', fit: 'nam', slit: 'vua', buttons: 'vang', head: 'none', accent: 'vang', male: true, look: cl.look },
      fab: { mat: f.mat, color: f.color, print: f.print }
    };
    return {
      design: { neck: 'dung', sleeve: 'dai', length: 'got', hem: 'thang', fit: 'om', slit: 'vua', buttons: 'vang', head: cl.hair === 'bun' && !cl.look ? 'hoacai' : 'none', accent: 'hongsen', broad: !!cl.broad, look: cl.look },
      fab: { mat: f.mat, color: f.color, print: f.print }
    };
  },
  figure(c, cl, ease, bust) {
    const look = this.clientLook(cl), asm = G.geo.build(look.design, (bust || cl.bust) / 84, false), z = 4.6;
    c.save();
    c.beginPath(); c.rect(0, 50, G.W, 470); c.clip();
    c.translate(G.lerp(-200, 470, ease), 150 - asm.topY * z);
    c.scale(z, z);
    G.art.garment(c, asm, look.fab, { mannequin: true, t: this.t });
    c.restore();
  },
  // top-left toolbar of icon tiles; red badges for news
  nav(c) {
    const s = G.state, daily = s.isDaily;
    const items = [{ id: 'shop', label: 'Chợ vải', icon: 'fabric', cb: () => G.go('emporium', { back: 'desk' }) }, { id: 'album', label: 'Album', icon: 'album', cb: () => G.go('gallery') }];
    if (!daily) {
      items.push({ id: 'workshop', label: 'Xưởng', icon: 'workshop', cb: () => G.go('workshop') });
      items.push({ id: 'clients', label: 'Sổ khách', icon: 'clients', cb: () => G.go('clients') });
      if (G.story.unlocked('paper')) items.push({ id: 'paper', label: 'Báo', icon: 'paper', cb: () => G.go('paper'), dot: s.press.unread > 0 });
      if (G.story.unlocked('mail')) items.push({ id: 'mail', label: 'Hộp thư', icon: 'mail', cb: () => G.go('mail'), dot: G.mail.unread() > 0 });
      if (s.mode !== 'challenge') items.push({ id: 'challenges', label: 'Thử thách', icon: 'trophy', cb: () => { this.challenges = true; }, dot: !G.daily.played() });
      if (G.econ.on()) items.push({ id: 'ledger', label: 'Sổ sách', icon: 'ledger', cb: () => G.go('ledger'), dot: s.econ.debt > 0 });
      if (s.mode === 'challenge') items.push({ id: 'quit', label: 'Thoát', icon: 'exit', cb: () => G.go('title') });
    }
    G.UI.dock(c, items, 24, 68);
  },
  chapterCard(c) {
    const st = G.state.story, ch = G.story.chapter();
    if (!ch || st.phase !== 'play' || G.state.isDaily) return;
    const U = G.UI, goals = G.story.goals(), h = 48 + goals.length * 22, y = 158;
    U.card(c, 24, y, 300, h, { fill: 'rgba(251,246,236,0.96)' });
    U.fitText(c, ch.title, 42, y + 24, 266, { size: 15, weight: 800, font: G.GAME, color: U.T.accent });
    goals.forEach((g, i) => U.fitText(c, `${g.done ? '✓' : '○'} ${g.t} (${g.have}/${g.n})`, 42, y + 48 + i * 22, 266, { size: 13, weight: 600, color: g.done ? U.T.ok : U.T.ink }));
  },
  // a tear-off wall calendar, and the rent note pinned beside it
  calendarChip(c) {
    if (G.state.isDaily) return;
    const U = G.UI, s = G.state, ev = G.cal.activeEvent(), cx = G.W - 112, cy = 66, cw = 88;
    const lab = G.cal.label(), mo = (lab.match(/Tháng\s*\d+/) || [lab])[0], dn = (lab.match(/ngày\s*(\d+)/) || [])[1] || String(s.day);
    c.save();
    G.rr(c, cx + 1, cy + 6, cw, 86, 8); c.fillStyle = 'rgba(50,25,12,0.2)'; c.fill();
    G.rr(c, cx, cy, cw, 86, 8); c.fillStyle = '#fffaf0'; c.fill(); c.strokeStyle = U.T.edge; c.lineWidth = 2.2; c.stroke();
    c.save(); G.rr(c, cx, cy, cw, 26, 8); c.clip(); c.fillStyle = '#c2414f'; c.fillRect(cx, cy, cw, 26); c.restore();
    G.rr(c, cx, cy, cw, 86, 8); c.stroke();
    for (const rx of [cx + 22, cx + cw - 22]) { c.beginPath(); c.arc(rx, cy + 2, 4, 0, 7); c.fillStyle = '#5e3a24'; c.fill(); }
    G.text(c, mo, cx + cw / 2, cy + 14, { size: 14, weight: 700, font: G.GAME, align: 'center', color: '#fff6e6' });
    G.text(c, dn, cx + cw / 2, cy + 58, { size: 38, weight: 800, font: G.GAME, align: 'center', color: G.INK });
    c.restore();
    if (ev) U.ribbon(c, '🎀 ' + ev.name, cx + cw / 2 - 30, cy + 102, { size: 13, h: 24, tail: 14, col: '#c9952e', top: '#e8b955', dark: '#8a6020' });
    // wholesale cloth on its way: how long until the van arrives
    const eta = G.idle && G.idle.nextEta();
    if (eta) {
      const n = G.idle.orders().length, mins = Math.max(1, Math.ceil((eta - Date.now()) / 60e3)), x = cx - 264, y = 156;
      G.rr(c, x, y, 190, 30, 15); c.fillStyle = 'rgba(52,30,18,0.85)'; c.fill(); c.strokeStyle = 'rgba(255,225,180,0.35)'; c.lineWidth = 1.5; c.stroke();
      U.icon(c, 'fabric', x + 17, y + 15, 20);
      U.fitText(c, `Xe vải${n > 1 ? ` (${n})` : ''}: còn ${mins} phút`, x + 32, y + 16, 150, { size: 13, weight: 700, color: '#fbe9cf' });
    }
    if (G.econ.on()) {
      // next bill and this month's market, so money pressure is always visible
      const b = G.econ.bill(), m = G.econ.market(), left = G.econ.daysLeft();
      const ww = 250, x = cx - 14 - ww, y = 66, late = s.econ.debt > 0, short = s.coins < b.total;
      c.save(); c.translate(x + ww / 2, y + 40); c.rotate(-0.012); c.translate(-x - ww / 2, -y - 40);
      U.card(c, x, y, ww, 80, { r: 6, fill: late ? '#fde8e6' : '#fff6dc', stroke: late ? U.T.bad : U.T.edge, stitch: false });
      c.fillStyle = 'rgba(214,180,120,0.55)'; c.fillRect(x + ww / 2 - 22, y - 6, 44, 13);
      G.text(c, `Tiền nhà sau ${left} ngày`, x + 14, y + 22, { size: 15, weight: 800, font: G.GAME, color: short || late ? U.T.bad : G.INK });
      G.art.coin(c, x + 22, y + 46, 9);
      G.text(c, `khoảng ${b.total + (s.econ.debt || 0)} xu`, x + 36, y + 47, { size: 15, weight: 700, font: G.GAME, color: short || late ? U.T.bad : G.INK });
      U.fitText(c, `Chợ: ${m.name}`, x + 14, y + 67, ww - 28, { size: 12, color: U.T.soft });
      c.restore();
      if (s.mode === 'challenge') U.outlined(c, `Thử thách tuần: còn ${Math.max(0, s.endDay - s.day + 1)} ngày`, G.W - 24, 178, { size: 14, align: 'right', color: U.T.ok });
    }
  },
  giftPanel(c) {
    const U = G.UI, s = G.state, com = s.commission, cl = G.client(com.client);
    c.fillStyle = 'rgba(43,29,24,0.3)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'gift_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => { this.gift = false; } });
    U.card(c, 330, 150, 620, 360);
    U.title(c, `Tặng ${cl.name} 1 m vải`, 356, 186, { size: 22 });
    G.text(c, `Khách mê: ${cl.mats.map((m) => G.CAT.MATS[m].name).join(', ')}`, 356, 214, { size: 13, color: U.T.soft });
    const ids = Object.keys(s.roll).filter((id) => s.roll[id] >= 100).sort((a, b) => G.bond.giftPts(com.client, b) - G.bond.giftPts(com.client, a)).slice(0, 6);
    if (!ids.length) G.text(c, 'Kho chưa có tấm vải nào đủ 1 m.', 356, 260, { size: 15, color: U.T.soft });
    ids.forEach((id, i) => {
      const x = 356 + (i % 3) * 196, y = 236 + Math.floor(i / 3) * 128, pts = G.bond.giftPts(com.client, id);
      G.ui.hits.push({ id: 'g' + id, x, y, w: 184, h: 116, enabled: true, cb: () => {
        const res = G.bond.gift(com.client, id); if (!res) return;
        com.gifted = true; this.gift = false; G.sfx.done();
        G.toast(`♥ +${res.pts} · ${res.line || 'Cảm ơn em nha!'}`, '#b0506e');
      } });
      G.rr(c, x, y, 184, 116, 12); c.fillStyle = G.inRect(G.pointer, { x, y, w: 184, h: 116 }) ? '#fff1dc' : '#f4ecdd'; c.fill();
      U.swatch(c, id, x + 8, y + 8, 168, 54, 8);
      U.fitText(c, G.CAT.FABRICS[id].name, x + 10, y + 78, 164, { size: 12, weight: 700 });
      G.text(c, `♥ +${pts}${pts >= 6 ? ' · đúng gu!' : ''}`, x + 10, y + 100, { size: 13, weight: 800, color: '#d6698a' });
    });
    G.button(c, 'giftclose', 'Thôi', 820, 462, 110, 36, () => { this.gift = false; }, { style: 'ghost', size: 14, r: 18 });
  },
  draw(c) {
    const s = G.state, com = s.commission, U = G.UI;
    U.bg(c, 'desk');
    c.fillStyle = '#7d5236'; c.fillRect(0, 520, G.W, 200);
    c.fillStyle = '#9a6a45'; c.fillRect(0, 508, G.W, 20);
    c.fillStyle = 'rgba(0,0,0,0.1)'; for (let x = 30; x < G.W; x += 160) c.fillRect(x, 548, 120, 150);
    const counterFront = () => { c.fillStyle = '#9a6a45'; c.fillRect(0, 508, 700, 20); c.fillStyle = '#7d5236'; c.fillRect(0, 528, 700, 192); };
    if (com) {
      const cl = G.client(com.client), ease = G.easeOut(this.walk);
      this.figure(c, cl, ease, com.measures.bust);
      counterFront();
      if (ease >= 1) {
        U.card(c, 40, 556, 600, 120);
        U.fitText(c, `${cl.name} · ${cl.role}`, 62, 582, 556, { size: 16, weight: 800, color: U.T.accent });
        const shown = Math.floor((this.t - 0.6) * 50);
        if (shown > 0) G.wrap(c, '“' + com.line.slice(0, shown) + (shown >= com.line.length ? '”' : ''), 62, 600, 560, 24, { size: 17 });
        U.commission(c, 820, G.econ.on() ? 186 : 116, 400);
        U.primary(c, 'accept', 'Nhận đặt may', () => {
          if (G.haggle.skip(com)) { G.startJob(); G.go('measure'); return; }
          const note = s.haggle.notes[com.client];
          this.quote = { i: note ? Math.max(0, G.haggle.STEPS.indexOf(note.lastQ)) : 2, res: null, done: null };
        });
        if (s.isDaily) U.secondary(c, 'decline', 'Bỏ đơn ngày', () => G.daily.abort(), G.W - 420);
        else {
          U.secondary(c, 'decline', 'Từ chối', () => {
            // the client leaves for Kevin's shop; the day goes on with whoever else is waiting
            s.commission = null; this.walk = 0; G.save();
            G.toast(`${cl.name} sang tiệm Siêu Tốc 24h…`);
          }, G.W - 420);
          if (!com.gifted) G.button(c, 'later', 'Để sau', G.W - 604, G.H - 126, 170, 44, () => { G.bench.putBack(); this.walk = 0; }, { style: 'ghost', size: 15, r: 22 });
          if (!cl.npc && !com.gifted && com.kind !== 'daily') G.button(c, 'gift', '🎁 Tặng quà', G.W - 604, G.H - 66, 170, 50, () => { this.gift = true; }, { style: 'ghost', size: 16, r: 25 });
        }
      }
    } else if (G.story.cameo && G.client(G.story.cameo)) {
      this.figure(c, G.client(G.story.cameo), G.easeOut(this.cameoWalk));
      counterFront();
    } else if (G.bench.on()) {
      this.benchCards(c);
    } else {
      const bx = 640, by = 470, pulse = 1 + Math.sin(this.t * 3) * 0.03;
      c.save(); c.translate(bx, by); c.scale(pulse, pulse);
      c.fillStyle = '#c99a3e'; c.beginPath(); c.arc(0, 0, 34, Math.PI, 0); c.fill();
      c.fillStyle = '#8a6526'; c.fillRect(-46, 0, 92, 10); c.beginPath(); c.arc(0, -36, 6, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-12, -14, 8, 14, -0.5, 0, 7); c.fill();
      c.restore();
      G.ui.hits.push({ id: 'bell', x: bx - 50, y: by - 50, w: 100, h: 66, enabled: true, cb: () => this.ring() });
      G.text(c, 'Bấm chuông để đón khách', bx, by + 56, { size: 18, weight: 700, align: 'center', color: '#fbe9cf' });
      U.hint(c, 'Khách sẽ kể dịp mặc và đưa thẻ đặt may');
    }
    this.drawCat(c);
    this.nav(c);
    this.chapterCard(c);
    this.calendarChip(c);
    if (this.gift && com) this.giftPanel(c);
    if (this.quote && com) this.quotePanel(c);
    if (this.challenges) this.challengePanel(c);
    U.topbar(c, s.isDaily ? 'Đơn ngày ' + G.daily.label(s.dailyKey) : 'Quầy tiếp khách');
    if (G.idle && G.idle.pending && !(G.Dialog && G.Dialog.active)) this.awayCard(c);
    // collected coins arc up into the purse in the top bar
    if (this.coinFx && this.coinFx.length) {
      const tx = G.W - 330, ty = 28;
      for (const f of this.coinFx) {
        f.t += G.ui.dt || 0.016; const k = G.clamp(f.t / 0.7, 0, 1); if (f.t < 0) continue;
        G.art.coin(c, G.lerp(f.sx, tx, k * k), G.lerp(f.sy, ty, k) - Math.sin(k * Math.PI) * 140, 11 - k * 3);
        if (k >= 1 && !f.done) { f.done = true; G.sfx.click(); }
      }
      this.coinFx = this.coinFx.filter((f) => !f.done);
    }
  },
  // "while you were away": what the shop did in real time, collected with a shower of coins
  awayCard(c) {
    const U = G.UI, P = G.idle.pending, w = 520, x = (G.W - w) / 2;
    const n = Math.max(1, P.lines.length), h = 190 + n * 40, y = (G.H - h) / 2;
    c.fillStyle = 'rgba(43,29,24,0.45)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'away_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => {} });
    U.card(c, x, y, w, h);
    U.ribbon(c, 'Trong lúc bạn đi vắng', G.W / 2, y + 4, { size: 17 });
    G.text(c, `Bạn vắng ${G.idle.awayText(P.away)}${P.capped ? ' (tiệm tính tối đa 8 giờ)' : ''}`, G.W / 2, y + 48, { size: 14, align: 'center', color: U.T.soft });
    let ly = y + 86;
    if (!P.lines.length) {
      G.wrap(c, 'Tiệm đóng cửa, chưa có ai trông. ' + G.idle.idleTip(), x + 30, ly - 12, w - 60, 20, { size: 14, color: U.T.ink, maxLines: 3 });
    }
    for (const l of P.lines) {
      U.icon(c, l.icon === 'dress' ? 'album' : l.icon === 'fabric' ? 'fabric' : 'workshop', x + 44, ly, 28);
      U.fitText(c, l.text, x + 70, ly, w - 200, { size: 15, weight: 600 });
      if (l.coins) { G.art.coin(c, x + w - 98, ly, 9); G.text(c, `+${l.coins}`, x + w - 84, ly, { size: 16, weight: 800, font: G.GAME, color: U.T.gold }); }
      else G.text(c, l.note || '', x + w - 30, ly, { size: 14, weight: 800, align: 'right', color: U.T.ok });
      ly += 40;
    }
    if (P.lines.length) { c.fillStyle = U.T.line; c.fillRect(x + 30, ly - 14, w - 60, 1.5); G.text(c, `Tổng: +${P.coins} xu`, x + w - 30, ly + 8, { size: 18, weight: 800, font: G.GAME, align: 'right', color: U.T.gold }); }
    G.button(c, 'away_ok', P.coins ? `Nhận ${P.coins} xu` : 'Mở cửa tiệm', G.W / 2 - 110, y + h - 62, 220, 46, () => {
      if (P.coins) { this.coinFx = []; for (let k = 0; k < 14; k++) this.coinFx.push({ sx: G.W / 2 + G.rand(-80, 80), sy: y + h - 40 + G.rand(-10, 10), t: -k * 0.05 }); }
      G.idle.collect();
    }, { style: P.coins ? 'green' : 'primary', size: 17, r: 23 });
  },
  // Thử thách: the daily order (same client for everyone today) and the weekly 30-day business challenge
  challengePanel(c) {
    const U = G.UI, s = G.state;
    c.fillStyle = 'rgba(43,29,24,0.3)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'ch_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => { this.challenges = false; } });
    U.card(c, 250, 150, 780, 380);
    U.title(c, 'Thử thách', 276, 188, { size: 26 });
    G.text(c, 'Chơi riêng, không ảnh hưởng tới tiệm của bạn. Kết quả để khoe và so với bạn bè.', 276, 216, { size: 14, color: U.T.soft });
    const card = (id, x, title, lines, label, cb, enabled) => {
      U.tile(c, x, 240, 350, 270, { r: 14, hov: G.inRect(G.pointer, { x, y: 240, w: 350, h: 270 }) });
      U.icon(c, id === 'chDaily' ? 'paper' : 'trophy', x + 318, 270, 34);
      G.text(c, title, x + 20, 272, { size: 21, font: G.GAME, weight: 800, color: U.T.accent });
      let y = 296;
      for (const l of lines) y += G.wrap(c, '• ' + l, x + 20, y, 310, 20, { size: 13 }) + 4;
      G.button(c, id, label, x + 20, 448, 310, 46, cb, { size: 16, r: 23, enabled: enabled !== false });
    };
    const res = s.daily.results[G.daily.key()];
    card('chDaily', 272, `Đơn ngày ${G.daily.label()}`, ['Cả nước nhận cùng một khách, cùng yêu cầu.', 'Lượt đầu là điểm chính thức.', `Chuỗi ngày chơi: 🔥 ${s.daily.streak}`].concat(res ? [`Hôm nay: ${res.score}/100`] : []),
      res ? 'Chơi lại (luyện tập)' : 'Chơi đơn ngày', () => { this.challenges = false; if (s.commission) { G.toast('Giao xong đơn đang làm đã nhé!'); return; } G.daily.begin(); }, true);
    const ch = G.readSlot('challenge'), week = G.econ.weekKey(), live = ch && ch.seed === 'week-' + week && !(ch.econ && (ch.econ.bankrupt || ch.econ.finished));
    card('chWeek', 658, `Thử thách tuần ${week.slice(5)}`, ['30 ngày kinh doanh từ con số 0.', 'Mọi người cùng khách, cùng giá vải, cùng thị trường.', 'So “Giá trị tiệm” với các tiệm trong hẻm.'],
      live ? `Tiếp tục (ngày ${ch.day})` : 'Bắt đầu thử thách', () => { this.challenges = false; G.startChallenge(); G.go('desk'); });
  },
  // the waiting bench: one card per waiting client; click to invite them to the counter
  benchCards(c) {
    const U = G.UI, s = G.state, seats = G.bench.seats();
    // the bench itself
    c.fillStyle = '#6b4329'; G.rr(c, 120, 452, 1040, 26, 8); c.fill();
    c.fillStyle = '#56341f'; for (const x of [150, 640, 1120]) c.fillRect(x, 476, 14, 34);
    // the waiting clients themselves stand in the shop above their order tickets
    seats.slice(0, 4).forEach((st, i) => {
      const cl = G.client(st.com.client), fx = 149 + i * 262, top = 236;
      const card = { x: 24 + i * 262, y: 536, w: 250, h: 112 }, body = { x: fx - 70, y: top, w: 140, h: 508 - top };
      const hov = G.inRect(G.pointer, card) || G.inRect(G.pointer, body), urgent = !st.appt && st.patience <= 1;
      G.ui.hits.push({ id: 'seatf' + i, x: body.x, y: body.y, w: body.w, h: body.h, enabled: true, cb: () => this.callIn(i) });
      this.waiter(c, cl, fx, top - (hov ? 8 : 0) + Math.sin(this.t * 2 + i * 1.3) * 1.5, st.com.measures.bust, hov);
      if (urgent || st.appt) this.bubble(c, fx + 46, top + 4, urgent ? '⌛' : '📌', urgent);
    });
    seats.slice(0, 4).forEach((st, i) => {
      const com = st.com, cl = G.client(com.client), x = 24 + i * 262, y = 536, w = 250, h = 112;
      const hov = G.inRect(G.pointer, { x, y, w, h }) || G.inRect(G.pointer, { x: 149 + i * 262 - 70, y: 236, w: 140, h: 272 }), urgent = !st.appt && st.patience <= 1;
      G.ui.hits.push({ id: 'seat' + i, x, y, w, h, enabled: true, cb: () => this.callIn(i) });
      U.card(c, x, y - (hov ? 4 : 0), w, h, { fill: hov ? '#fffaf0' : U.T.paper, stroke: urgent && Math.sin(this.t * 6) > 0 ? U.T.bad : U.T.line });
      const yy = y - (hov ? 4 : 0);
      G.Dialog.portrait(c, com.client, x + 8, yy + 8, 72, 96);
      U.fitText(c, cl.name, x + 90, yy + 22, w - 100, { size: 15, weight: 800, color: U.T.accent });
      const lvl = G.bond.get(com.client).lvl;
      G.text(c, '♥'.repeat(lvl) + '♡'.repeat(5 - lvl), x + 90, yy + 42, { size: 11, color: '#d6698a' });
      G.text(c, `Đề nghị ${com.budget} xu`, x + 90, yy + 62, { size: 13, weight: 800, color: U.T.gold });
      const r0 = com.reqs[0];
      U.fitText(c, r0 ? G.reqText(r0) + (com.reqs.length > 1 ? ` +${com.reqs.length - 1}` : '') : 'Tuỳ em may', x + 90, yy + 80, w - 100, { size: 12 });
      G.text(c, st.appt ? '📌 Hẹn trước' : `⌛ chờ thêm ${st.patience} ngày`, x + 90, yy + 98, { size: 12, weight: 700, color: urgent ? U.T.bad : U.T.soft });
      if (com.title) { G.rr(c, x + w - 84, yy - 10, 78, 20, 10); c.fillStyle = { arc: '#d6698a', event: '#c9952e', story: '#b23a48', copy: '#6b5bb8' }[com.kind] || U.T.accent; c.fill(); U.fitText(c, { arc: 'Tâm sự', event: 'Sự kiện', story: 'Truyện', copy: 'Y chang' }[com.kind] || '', x + w - 45, yy, 70, { size: 10, weight: 800, align: 'center', color: '#fff' }); }
    });
    if (!seats.length) G.text(c, 'Hôm nay không còn ai chờ. Đóng cửa để sang ngày mới.', 640, 590, { size: 17, weight: 700, align: 'center', color: '#fbe9cf' });
    U.primary(c, 'close', 'Đóng cửa sớm', () => this.closeDay());
    const n = s.rack.length, cap = G.fair.rackSize();
    G.button(c, 'rack', n >= cap ? `Sạp đầy (${n}/${cap})` : `May áo bán sẵn (${n}/${cap})`, G.W - 444, G.H - 66, 196, 50, () => G.fair.start(false), { style: 'ghost', size: 15, r: 25, enabled: n < cap });
    U.hint(c, 'Chọn một khách để mời vào quầy · khách chờ quá lâu sẽ sang tiệm Kevin');
  },
  // Mướp, the shop's tabby, asleep on the counter. Click to pet her: she wakes, purrs and floats hearts.
  drawCat(c) {
    const K = this.cat = this.cat || { pet: 0, hearts: [] }, x = 1172, y = 510, t = this.t;
    const awake = K.pet > 0, breathe = 1 + Math.sin(t * 2.2) * 0.035;
    G.ui.hits.push({ id: 'cat', x: x - 50, y: y - 52, w: 96, h: 58, enabled: true, cb: () => {
      K.pet = 2.6; G.sfx.purr();
      for (let k = 0; k < 5; k++) K.hearts.push({ x: x - 22 + G.rand(-14, 14), y: y - 44, vy: G.rand(-46, -30), vx: G.rand(-12, 12), t: 0, life: G.rand(1, 1.5) });
      if (!K.told) { K.told = true; G.toast('Mướp kêu rừ rừ… 🐾', '#b0506e'); }
    } });
    const OR = '#e59a4a', ORD = '#b86a2a', W = '#fff4e6';
    c.save(); c.translate(x, y);
    c.beginPath(); c.ellipse(4, 2, 44, 7, 0, 0, 7); c.fillStyle = 'rgba(40,20,10,0.25)'; c.fill();
    // tail: swishes while she is being petted, otherwise curled round her front
    const sw = awake ? Math.sin(t * 7) * 6 : 0;
    c.lineCap = 'round'; c.strokeStyle = OR; c.lineWidth = 9;
    c.beginPath(); c.moveTo(30, -6); c.bezierCurveTo(44, 0 + sw, 30, 8, 4, 4); c.stroke();
    c.strokeStyle = ORD; c.lineWidth = 9; c.beginPath(); c.moveTo(9, 4.6); c.lineTo(3, 4); c.stroke();
    // loaf body, breathing
    c.save(); c.translate(6, -14); c.scale(1, breathe);
    const bg = c.createRadialGradient(-6, -10, 4, 0, 0, 34); bg.addColorStop(0, '#f2b469'); bg.addColorStop(1, OR);
    c.beginPath(); c.ellipse(0, 0, 32, 17, 0, 0, 7); c.fillStyle = bg; c.fill(); c.strokeStyle = 'rgba(90,45,15,0.5)'; c.lineWidth = 1.4; c.stroke();
    c.strokeStyle = 'rgba(150,80,30,0.55)'; c.lineWidth = 3; c.lineCap = 'round';
    for (const sx of [-2, 9, 20]) { c.beginPath(); c.moveTo(sx, -15); c.quadraticCurveTo(sx + 4, -6, sx + 1, 2); c.stroke(); }
    c.restore();
    // front paws
    for (const px of [-16, -5]) { c.beginPath(); c.ellipse(px, 0, 6, 3.6, 0, 0, 7); c.fillStyle = W; c.fill(); c.strokeStyle = 'rgba(90,45,15,0.35)'; c.lineWidth = 1; c.stroke(); }
    // head: lifts a little when awake
    c.save(); c.translate(-24, awake ? -32 : -26); c.rotate(awake ? -0.12 : 0.18);
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(s * 5, -10); c.lineTo(s * 12, -19); c.lineTo(s * 13, -6); c.closePath(); c.fillStyle = OR; c.fill(); c.strokeStyle = 'rgba(90,45,15,0.5)'; c.lineWidth = 1.2; c.stroke();
      c.beginPath(); c.moveTo(s * 7, -10); c.lineTo(s * 11.5, -16); c.lineTo(s * 11.8, -8); c.closePath(); c.fillStyle = '#f6c3b6'; c.fill();
    }
    c.beginPath(); c.arc(0, 0, 14, 0, 7); c.fillStyle = '#eda65a'; c.fill(); c.strokeStyle = 'rgba(90,45,15,0.5)'; c.lineWidth = 1.4; c.stroke();
    c.strokeStyle = 'rgba(150,80,30,0.6)'; c.lineWidth = 2; for (const sx of [-4, 0, 4]) { c.beginPath(); c.moveTo(sx, -13); c.lineTo(sx, -8); c.stroke(); }
    c.beginPath(); c.ellipse(0, 5, 7, 5, 0, 0, 7); c.fillStyle = W; c.fill();
    c.beginPath(); c.moveTo(-1.6, 3); c.lineTo(1.6, 3); c.lineTo(0, 4.8); c.closePath(); c.fillStyle = '#d97a7a'; c.fill();
    // eyes: sleepy curves, or happy ^ ^ while purring
    c.strokeStyle = '#4a2c22'; c.lineWidth = 1.6; c.lineCap = 'round';
    for (const s of [-1, 1]) { c.beginPath(); if (awake) { c.moveTo(s * 6.5 - 3, -1); c.lineTo(s * 6.5, -4); c.lineTo(s * 6.5 + 3, -1); } else c.arc(s * 6.5, -2, 3, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    if (awake) { c.fillStyle = 'rgba(240,120,130,0.45)'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * 9, 3, 2.6, 1.6, 0, 0, 7); c.fill(); } }
    c.strokeStyle = 'rgba(80,50,30,0.45)'; c.lineWidth = 0.8;
    for (const s of [-1, 1]) for (const dy of [-1, 1.5]) { c.beginPath(); c.moveTo(s * 6, 5 + dy * 0.6); c.lineTo(s * 16, 4 + dy * 2); c.stroke(); }
    c.restore();
    // z z z while asleep
    if (!awake) for (let k = 0; k < 3; k++) { const ph = (t * 0.5 + k / 3) % 1; G.UI.outlined(c, 'z', -36 - ph * 10 + k * 3, -44 - ph * 26, { size: 10 + k * 3, color: 'rgba(90,110,160,' + (1 - ph) + ')', halo: 'rgba(255,248,236,' + (1 - ph) * 0.8 + ')', lw: 3 }); }
    c.restore();
    for (const h of K.hearts) { c.save(); c.globalAlpha = 1 - h.t / h.life; G.text(c, '♥', h.x, h.y, { size: 16, align: 'center', color: '#e0607e' }); c.restore(); }
  },
  // a waiting client, small, standing behind the counter (cut off at the counter top)
  waiter(c, cl, cx, topY, bust, hov) {
    const look = this.clientLook(cl), asm = G.geo.build(look.design, (bust || cl.bust) / 84, false), z = 1.9;
    c.save();
    c.beginPath(); c.rect(cx - 140, 60, 280, 448); c.clip();
    if (hov) {
      const g = c.createRadialGradient(cx, topY + 120, 10, cx, topY + 120, 150);
      g.addColorStop(0, 'rgba(255,236,170,0.7)'); g.addColorStop(1, 'rgba(255,236,170,0)');
      c.fillStyle = g; c.fillRect(cx - 150, topY - 40, 300, 330);
    }
    c.translate(cx, topY - asm.topY * z); c.scale(z, z);
    G.art.garment(c, asm, look.fab, { mannequin: true, t: this.t });
    c.restore();
  },
  // thought bubble over a client's head
  bubble(c, x, y, glyph, shake) {
    const dx = shake ? Math.sin(this.t * 18) * 1.5 : 0;
    c.save(); c.translate(x + dx, y + Math.sin(this.t * 3) * 2);
    c.beginPath(); c.arc(-14, 22, 4, 0, 7); c.arc(-20, 30, 2.5, 0, 7); c.fillStyle = '#fffaf0'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.arc(0, 0, 17, 0, 7); c.fillStyle = shake ? '#ffe3dc' : '#fffaf0'; c.fill(); c.lineWidth = 2.2; c.stroke();
    G.text(c, glyph, 0, 1, { size: 17, align: 'center' });
    c.restore();
  },
  // Báo giá: pick a price, the client reacts (one counter-offer at most), then start measuring
  quotePanel(c) {
    const U = G.UI, s = G.state, com = s.commission, cl = G.client(com.client), Q = this.quote, H = G.haggle, steps = H.STEPS;
    const q = steps[Q.i], budget = H.budgetFor(com, q), want = H.qualityFor(com, q), avg = H.avgQuality();
    c.fillStyle = 'rgba(43,29,24,0.3)'; c.fillRect(0, 0, G.W, G.H);
    G.ui.hits.push({ id: 'quote_bg', x: 0, y: 0, w: G.W, h: G.H, enabled: true, cb: () => { if (!Q.done) this.quote = null; } });
    U.card(c, 330, 130, 620, 440);
    U.title(c, `Báo giá cho ${cl.name}`, 356, 168, { size: 24 });
    G.text(c, `Khách đề nghị ${com.baseBudget} xu · yêu cầu chất lượng gốc ${com.qualityBase}`, 356, 196, { size: 14, color: U.T.soft });
    const note = s.haggle.notes[com.client];
    if (note) G.text(c, `Lần trước: ${Math.round(note.lastQ * 100)}% · ${{ pin: 'chốt chuẩn ✨', ok: 'khách đồng ý', cheap: 'rẻ quá', counter: 'bị trả giá', robbery: 'khách phật lòng', base: 'giá gốc' }[note.result] || ''}`, 924, 196, { size: 12, weight: 700, align: 'right', color: '#b0506e' });
    const locked = !!Q.res;
    steps.forEach((v, i) => {
      const x = 380 + i * 52, on = i === Q.i;
      c.beginPath(); c.arc(x, 250, on ? 17 : 13, 0, 7); c.fillStyle = on ? U.T.accent : v < 1 ? '#cfe3d4' : v <= 1.2 ? '#f3dfc0' : '#f3cfc8'; c.fill();
      c.strokeStyle = on ? G.INK : 'rgba(90,60,40,0.35)'; c.lineWidth = on ? 2 : 1.2; c.stroke();
      G.text(c, Math.round(v * 100) + '', x, 251, { size: on ? 12 : 10, weight: 800, align: 'center', color: on ? '#fff' : U.T.ink });
      if (!locked) G.ui.hits.push({ id: 'qs' + i, x: x - 20, y: 228, w: 40, h: 44, enabled: true, cb: () => { Q.i = i; G.sfx.click(); } });
    });
    G.text(c, '%', 380 + steps.length * 52 - 22, 251, { size: 12, color: U.T.soft });
    c.font = `800 36px ${G.GAME}`;
    G.art.coin(c, 652 - c.measureText(`${Math.round(q * 100)}% = ${budget} xu`).width / 2 - 24, 311, 15);
    G.text(c, `${Math.round(q * 100)}% = ${budget} xu`, 652, 312, { size: 36, font: G.GAME, weight: 800, align: 'center', color: U.T.accent });
    G.text(c, `Khách sẽ đòi chất lượng ≥ ${want}`, 640, 344, { size: 16, weight: 800, align: 'center', color: want > avg + 5 ? U.T.bad : U.T.ok });
    G.text(c, `Chất lượng trung bình 5 áo gần đây của bạn: ${avg}`, 640, 368, { size: 13, align: 'center', color: U.T.soft });
    if (s.haggle.streak) G.text(c, `✨ Chốt chuẩn liên tiếp: ${s.haggle.streak} (+${Math.min(5, s.haggle.streak)}% tiền công)`, 640, 390, { size: 13, weight: 700, align: 'center', color: U.T.gold });
    if (Q.res) { U.card(c, 356, 404, 568, 66, { fill: '#fff6e6' }); G.wrap(c, '“' + Q.res.line + '”', 376, 418, 528, 20, { size: 16, font: G.SERIF, color: '#5a2a2a' }); }
    const go = () => { this.quote = null; G.startJob(); G.go('measure'); };
    if (Q.done) G.button(c, 'qgo', 'Bắt đầu đo  →', 744, 498, 180, 46, go, { size: 17, r: 23 });
    else if (Q.res && Q.res.counter) {
      G.button(c, 'qyes', `Đồng ý ${H.budgetFor(com, Q.res.counter)} xu`, 560, 498, 200, 46, () => { H.apply(com, Q.res.counter, Q.res.how); Q.done = true; G.sfx.done(); }, { size: 16, r: 23 });
      G.button(c, 'qbase', 'Thôi, giá gốc', 770, 498, 154, 46, () => { H.apply(com, 1, 'base'); Q.done = true; }, { style: 'ghost', size: 15, r: 23 });
    } else {
      G.button(c, 'qbase', 'Đúng giá đề nghị', 560, 498, 180, 46, () => { H.apply(com, 1, 'base'); go(); }, { style: 'ghost', size: 15, r: 23 });
      G.button(c, 'qok', 'Chốt giá', 750, 498, 174, 46, () => {
        Q.res = H.react(com, q);
        if (!Q.res.counter) { H.apply(com, q, Q.res.how); Q.done = true; G.sfx[Q.res.how === 'pin' ? 'good' : 'done'](); } else G.sfx.bad();
      }, { size: 17, r: 23 });
      G.button(c, 'qm', '−', 356, 498, 46, 46, () => { Q.i = Math.max(0, Q.i - 1); }, { style: 'ghost', size: 20, r: 23 });
      G.button(c, 'qp', '+', 410, 498, 46, 46, () => { Q.i = Math.min(steps.length - 1, Q.i + 1); }, { style: 'ghost', size: 20, r: 23 });
    }
  },
  key(e) {
    const Q = this.quote; if (!Q || Q.res) return;
    if (e.code === 'ArrowLeft') Q.i = Math.max(0, Q.i - 1);
    if (e.code === 'ArrowRight') Q.i = Math.min(G.haggle.STEPS.length - 1, Q.i + 1);
  },
  down() { if (G.state.commission && this.t < 4) this.t = 4; }
};

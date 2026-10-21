// Hộp thư: letters from Bà Tư, close clients (♥5), Kevin, Madame Sa and the festival — some with a gift.
G.scenes.mail = {
  enter(p) { this.sel = p && p.id ? Math.max(0, G.state.mail.findIndex((m) => m.id === p.id)) : 0; this.page = 0; this.open(); },
  open() { const m = G.state.mail[this.sel]; if (m && !m.read) { m.read = true; G.save(); } },
  draw(c) {
    const U = G.UI, s = G.state, list = s.mail;
    U.bg(c);
    U.card(c, 24, 62, 390, 584);
    U.title(c, 'Hộp thư', 46, 96, { size: 24 });
    if (!list.length) {
      // an empty letterbox: a big envelope and a gentle line
      U.icon(c, 'mail', 220, 300, 110);
      G.wrap(c, 'Chưa có thư nào. Khách quen và Bà Tư sẽ gửi thư khi có chuyện vui.', 70, 380, 300, 22, { size: 15, color: U.T.soft });
    }
    const per = 9, pages = Math.max(1, Math.ceil(list.length / per));
    this.page = G.clamp(this.page, 0, pages - 1);
    list.slice(this.page * per, this.page * per + per).forEach((m, k) => {
      const i = this.page * per + k, y = 120 + k * 56, sel = i === this.sel, who = G.client(m.from);
      G.ui.hits.push({ id: 'm' + i, x: 36, y, w: 366, h: 50, enabled: true, cb: () => { this.sel = i; this.open(); G.sfx.click(); } });
      G.UI.tile(c, 36, y, 366, 50, { sel, hov: G.inRect(G.pointer, { x: 36, y, w: 366, h: 50 }), r: 10 });
      // envelope
      c.fillStyle = m.gift && !m.claimed ? '#f3d27a' : '#fbf6ec'; c.fillRect(48, y + 12, 34, 24);
      c.strokeStyle = '#b89a78'; c.lineWidth = 1.2; c.strokeRect(48, y + 12, 34, 24);
      c.beginPath(); c.moveTo(48, y + 12); c.lineTo(65, y + 26); c.lineTo(82, y + 12); c.stroke();
      if (!m.read) { c.beginPath(); c.arc(84, y + 12, 5, 0, 7); c.fillStyle = G.C.red; c.fill(); }
      U.fitText(c, m.title || 'Thư', 96, y + 18, 296, { size: 14, weight: m.read ? 600 : 800 });
      U.fitText(c, who ? who.name : m.from === 'hoi' ? 'Hội Áo Dài Cố Đô' : '', 96, y + 36, 296, { size: 12, color: U.T.soft });
    });
    if (pages > 1) {
      G.button(c, 'mp', '‹', 300, 606, 40, 30, () => this.page--, { style: 'ghost', size: 15, r: 15, enabled: this.page > 0 });
      G.button(c, 'mn', '›', 350, 606, 40, 30, () => this.page++, { style: 'ghost', size: 15, r: 15, enabled: this.page < pages - 1 });
    }
    // the letter
    const m = list[this.sel];
    U.card(c, 436, 62, 820, 584, { fill: '#fffaf0' });
    c.strokeStyle = 'rgba(120,150,190,0.18)'; c.lineWidth = 1;
    for (let y = 164; y < 620; y += 30) { c.beginPath(); c.moveTo(470, y); c.lineTo(1222, y); c.stroke(); }
    if (m) {
      const who = G.client(m.from);
      G.text(c, m.title || '', 476, 104, { size: 24, font: G.SERIF, weight: 700, color: U.T.accent });
      let y = 140;
      for (const para of G.Dialog.fill(m.body || '').replace(/\{served\}/g, s.served).split('\n')) y += G.wrap(c, para, 476, y, 740, 30, { size: 18, font: G.SERIF, color: '#3a2c26' });
      G.text(c, '— ' + (who ? who.name : m.from === 'hoi' ? 'Hội Áo Dài Cố Đô' : ''), 1216, Math.min(600, y + 24), { size: 16, font: G.SERIF, align: 'right', color: '#6b5a4a' });
      if (m.gift && !m.claimed) {
        const g = m.gift, label = g.coins ? `${g.coins} xu` : g.fabric && G.CAT.FABRICS[g.fabric] ? `${((g.cm || 200) / 100).toFixed(0)} m ${G.CAT.FABRICS[g.fabric].name}` : 'quà';
        G.button(c, 'claim', `Nhận quà: ${label}`, 476, 588, 420, 44, () => G.mail.claim(m), { style: 'green', size: 15, r: 22 });
      } else if (m.gift) G.text(c, '✓ Đã nhận quà', 476, 610, { size: 14, weight: 700, color: U.T.ok });
    }
    U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.topbar(c, 'Hộp thư');
  }
};

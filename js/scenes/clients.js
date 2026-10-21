// Sổ khách: every client, how close you are (♥0–5), what they love, and their personal story progress.
G.scenes.clients = {
  enter() { this.page = 0; this.t = 0; },
  update(dt) { this.t += dt; },
  list() {
    const all = G.CAT.CLIENTS.filter(G.clientAllowed);
    return [all.filter((c) => !c.star), all.filter((c) => c.star)].filter((l) => l.length);
  },
  draw(c) {
    const U = G.UI, s = G.state, pages = this.list(), C = G.CAT;
    this.page = G.clamp(this.page, 0, pages.length - 1);
    U.bg(c);
    U.title(c, this.page === 0 ? 'Sổ khách · khách quen trong hẻm' : 'Sổ khách · người nổi tiếng (nhại vui)', 40, 90, { size: 24 });
    pages[this.page].slice(0, 10).forEach((cl, i) => {
      const x = 32 + (i % 5) * 246, y = 112 + Math.floor(i / 5) * 262, b = G.bond.get(cl.id), d = G.bond.data(cl.id);
      U.card(c, x, y, 232, 250);
      G.Dialog.portrait(c, cl.id, x + 10, y + 10, 92, 110);
      if (!b.met) { G.rr(c, x + 10, y + 10, 92, 110, 14); c.fillStyle = 'rgba(43,29,24,0.82)'; c.fill(); G.text(c, '?', x + 56, y + 66, { size: 34, weight: 800, align: 'center', color: '#f3e3c7' }); }
      U.fitText(c, cl.name, x + 112, y + 26, 112, { size: 15, weight: 800, color: U.T.accent });
      U.fitText(c, cl.role, x + 112, y + 46, 112, { size: 11, color: U.T.soft });
      for (let h = 0; h < 5; h++) G.text(c, h < b.lvl ? '♥' : '♡', x + 112 + h * 20, y + 72, { size: 17, color: h < b.lvl ? '#d6698a' : '#cdbcae' });
      G.rr(c, x + 112, y + 90, 108, 8, 4); c.fillStyle = '#f3dbe3'; c.fill();
      G.rr(c, x + 112, y + 90, Math.max(6, 108 * G.bond.frac(cl.id)), 8, 4); c.fillStyle = '#d6698a'; c.fill();
      G.text(c, G.bond.NAMES()[b.lvl], x + 112, y + 112, { size: 12, weight: 700 });
      U.fitText(c, 'Mê: ' + cl.mats.map((m) => C.MATS[m].name).join(', '), x + 14, y + 140, 206, { size: 12 });
      U.pills(c, Object.fromEntries(cl.likes.map((t, k) => [t, 2 - k])), x + 14, y + 162, 206);
      if (d && d.arcs) {
        d.arcs.forEach((a, k) => {
          const done = b.arc > k, ready = !done && b.arc === k && b.lvl >= (k ? 4 : 2);
          U.fitText(c, `${done ? '●' : ready ? '◐' : '○'} ${a.title}`, x + 14, y + 190 + k * 20, 206, { size: 12, weight: 600, color: done ? U.T.ok : ready ? '#d6698a' : U.T.soft });
        });
      }
      if (!b.met) G.text(c, 'Chưa ghé tiệm', x + 14, y + 236, { size: 12, color: U.T.soft });
      const letter = s.mail.find((m) => m.id === 'bond_' + cl.id);
      if (letter) G.button(c, 'lt' + cl.id, '✉ Đọc thư', x + 132, y + 222, 90, 24, () => G.go('mail', { id: letter.id }), { style: 'ghost', size: 11, r: 12 });
    });
    if (pages.length > 1) {
      G.button(c, 'cp', '‹ Khách quen', 400, G.H - 64, 150, 44, () => { this.page = 0; }, { style: this.page === 0 ? 'primary' : 'ghost', size: 14, r: 22 });
      G.button(c, 'cn', 'Người nổi tiếng ›', 560, G.H - 64, 180, 44, () => { this.page = 1; }, { style: this.page === 1 ? 'primary' : 'ghost', size: 14, r: 22 });
    }
    G.text(c, '♥ tăng khi giao áo đẹp, đúng gu, đúng chất vải khách mê, hoặc tặng quà ở quầy', G.W - 40, 90, { size: 13, align: 'right', color: U.T.soft });
    U.primary(c, 'back', '← Về quầy', () => G.go('desk'));
    U.topbar(c, 'Sổ khách');
  }
};

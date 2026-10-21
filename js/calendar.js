// In-game calendar: one delivery = one day, a month is 5 days (a year = 60 days), the game starts in September
// so 20/10, wedding season and Tết come early. Seasonal events bring themed orders, bonuses and a reward letter.
G.cal = {
  OFFSET: 40, // day 1 = 1 September
  date(day) {
    const d = (day || G.state.day) - 1 + this.OFFSET;
    return { month: (Math.floor(d / 5) % 12) + 1, dom: (d % 5) + 1, year: Math.floor(d / 60) + 1 };
  },
  label(day) { const t = this.date(day); return `Tháng ${t.month} · ngày ${t.dom}`; },
  activeEvent() {
    if (!G.EVENTS) return null;
    const t = this.date();
    return G.EVENTS.find((e) => e.months.includes(t.month) && t.dom >= e.days[0] && t.dom <= e.days[1]) || null;
  },
  eventCommission(ev, rng) {
    rng = rng || Math.random;
    const pool = G.clientsAllowed().filter((c) => !ev.sex || (ev.sex === 'f' ? !c.male : c.male));
    if (!pool.length) return null;
    const cl = G.pickClient({ pool, starChance: G.parody() === 'off' ? 0 : 0.2, rng });
    return G.makeCommission({ client: cl.id, kind: 'event', title: ev.name, line: G.rpick(rng, ev.lines), reqs: ev.reqs, bonus: ev.bonus, refId: ev.id, rng });
  },
  // count themed orders; at the goal the reward arrives by mail (half the second year)
  onDelivery(r, job) {
    const com = job.com; if (com.kind !== 'event' || !r.success || !G.EVENTS) return null;
    const ev = G.EVENTS.find((e) => e.id === com.refId); if (!ev) return null;
    const s = G.state, year = this.date().year, key = ev.id + '_' + year;
    s.events.progress[key] = (s.events.progress[key] || 0) + 1;
    if (s.events.progress[key] === ev.goal && !s.events.done[key]) {
      s.events.done[key] = true;
      const half = Object.keys(s.events.done).some((k) => k.startsWith(ev.id + '_') && k !== key);
      const rw = ev.reward || {}, gift = {};
      if (rw.coins) gift.coins = half ? Math.round(rw.coins / 2) : rw.coins;
      if (rw.fabric) { gift.fabric = rw.fabric; gift.cm = half ? Math.round((rw.cm || 300) / 2) : rw.cm || 300; }
      const L = (G.LETTERS && G.LETTERS[ev.letter]) || { from: 'batu', title: ev.name, body: 'Chúc mừng con đã may xong mùa ' + ev.name + '!' };
      G.mail.add(Object.assign({}, L, { id: ev.letter + '_' + year, gift: Object.keys(gift).length ? gift : L.gift }));
      return `Hoàn thành ${ev.name}! Quà đã gửi vào hộp thư`;
    }
    return `${ev.name}: ${s.events.progress[key]}/${ev.goal} đơn`;
  },
  // Tết gift: once per in-game year Bà Tư phones in (the scene mails the lì xì) at the next visit to the desk
  tetLixi() {
    const s = G.state, t = this.date(), key = 'lixi_' + t.year;
    if (t.month !== 1 || s.events.done[key] || !G.story.unlocked('mail')) return;
    s.events.done[key] = true;
    s.story.flags.lixiCall = true;
  }
};

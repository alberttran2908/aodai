// Khách sang hẹn giờ: once a Vietnam day a well-off client books a two-hour slot later today (real time). Open the
// shop during the slot and they sit on the bench as an appointment, paying half as much again; miss it and the
// booking lapses. A reason to come back at a set time, the way idle games schedule their visitors.
G.vip = {
  SLOT: 2 * 3600e3,
  LINES: ['Chị đặt lịch rồi nha, tới là may liền, chị không chờ lâu được đâu.', 'Tôi nghe đồn tiệm khéo tay. Đúng hẹn thì tôi tới, đẹp thì tôi trả hậu.',
    'Tối nay có tiệc, sáng mai đi ăn cưới. Em may kịp thì chị bo thêm.', 'Bạn chị giới thiệu tiệm. Chị muốn một bộ thật sang, tiền không thành vấn đề.'],
  on() { const s = G.state; return !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge' && G.hasSave && !(s.tut && s.tut.on) && G.rank() >= 2 && G.bench && G.bench.on(); },
  // Vietnam clock hour of a moment, for "19:00–21:00"
  hm(ms) { const d = new Date(ms + 7 * 3600e3); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`; },
  // today's booking: made on the first look of the day, starting 2–5 hours later on the hour (not past 22:00)
  get() {
    if (!this.on()) return null;
    const s = G.state, day = G.dateKeyVN(), now = Date.now();
    if (!s.vip || s.vip.day !== day) {
      const hourMs = 3600e3, startH = Math.ceil((now + (2 + Math.floor(Math.random() * 4)) * hourMs) / hourMs) * hourMs;
      const vnHour = new Date(startH + 7 * 3600e3).getUTCHours();
      // late in the evening there is no slot left today
      s.vip = vnHour >= 8 && vnHour <= 20 && G.dateKeyVN(startH) === day
        ? { day, start: startH, end: startH + this.SLOT, client: null, state: 'booked' }
        : { day, state: 'none' };
      if (s.vip.state === 'booked') {
        const pool = G.clientsAllowed().filter((c) => !c.npc);
        s.vip.client = G.pickClient({ pool, starChance: 0.5 }).id;
      }
    }
    return s.vip.state === 'none' ? null : s.vip;
  },
  // the slot is open and you are at the desk: the client walks in and sits on the bench
  tick(now) {
    const v = this.get(); now = now || Date.now();
    if (!v || v.state !== 'booked') return null;
    if (now > v.end) { v.state = 'missed'; return 'missed'; }
    if (now < v.start) return null;
    const cl = G.client(v.client); if (!cl) { v.state = 'missed'; return null; }
    const com = G.makeCommission({ client: cl.id, title: 'Khách sang hẹn giờ', line: this.LINES[Math.floor(Math.random() * this.LINES.length)], budgetMul: 1.5, bonus: 0.05, flags: { vip: true } });
    G.state.bench.seats.unshift({ com, patience: 99, appt: true, arrived: G.state.day, vip: true });
    v.state = 'came'; G.save();
    return 'came';
  },
  // the hub row text
  status() {
    const v = this.get(); if (!v) return null;
    const cl = G.client(v.client), name = cl ? cl.name : 'Khách sang', slot = `${this.hm(v.start)}–${this.hm(v.end)}`;
    if (v.state === 'came') return { title: `${name} đã tới`, sub: 'Đang chờ ở ghế (hẹn trước) · trả gấp rưỡi', dot: false };
    if (v.state === 'missed') return { title: `Lỡ hẹn với ${name}`, sub: `Hẹn ${slot} nhưng tiệm đóng cửa · mai có hẹn mới`, dot: false };
    const left = v.start - Date.now(), h = Math.floor(left / 3600e3), m = Math.ceil((left % 3600e3) / 60e3);
    return { title: `${name} hẹn ${slot} hôm nay`, sub: left > 0 ? `Mở tiệm trong khung giờ đó để đón · còn ${h ? h + ' giờ ' : ''}${m} phút` : 'Đang trong giờ hẹn!', dot: left <= 0 };
  }
};

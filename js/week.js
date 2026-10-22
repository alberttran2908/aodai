// Tin hẻm tuần này: one happening a week (Monday to Sunday, Vietnam time), the same for every player, picked
// from the week number. Each nudges one part of the shop that runs on its own: the window, the vats, the van,
// the helper, or the clients' tips. Never the same one two weeks running.
G.week = {
  EVENTS: [
    { id: 'cho', icon: 'album', name: 'Phiên chợ đêm', text: 'Hẻm mở chợ đêm cả tuần: tủ kính dễ bán gấp đôi khi bạn vắng, bán được 90% giá thay vì 80%.' },
    { id: 'nang', icon: 'fabric', name: 'Tuần nắng ráo', text: 'Trời nắng, vải nhuộm mau khô: mỗi mẻ nhuộm chỉ 1 giờ và không tốn tiền thuốc.' },
    { id: 'xakho', icon: 'fabric', name: 'Mối vải xả kho', text: 'Mối vải xả hàng: đặt vải sỉ giảm 35% thay vì 20%, được chờ 4 xe một lúc.' },
    { id: 'tho', icon: 'workshop', name: 'Tuần thợ chăm', text: 'Thợ phụ được thưởng nên chăm: nhận sửa đồ gấp đôi, may áo bán sẵn 2 giờ một chiếc.' },
    { id: 'cuoi', icon: 'mail', name: 'Mùa cưới hỏi', text: 'Nhà nhà làm đám, khách rộng tay: áo đẹp (từ 90 điểm) được boa gấp đôi.' }
  ],
  on() { const s = G.state; return !!s && G.slot === 'main' && !s.isDaily && s.mode !== 'challenge'; },
  // weeks counted from Monday 29 Dec 1969 in Vietnam time (day 0 of the epoch was a Thursday)
  num(ms) { return Math.floor((Math.floor(((ms || Date.now()) + 7 * 3600e3) / 864e5) + 3) / 7); },
  // every five weeks bring all five happenings once, shuffled; a block never opens with the one that closed the last
  order(b) {
    const rng = G.mulberry32(G.hash32('week|' + b)), p = this.EVENTS.map((_, i) => i);
    for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    return p;
  },
  idx(wk) {
    const n = this.EVENTS.length, b = Math.floor(wk / n), p = this.order(b);
    if (p[0] === this.order(b - 1)[n - 1]) [p[0], p[1]] = [p[1], p[0]];
    return p[wk - b * n];
  },
  current() { return this.on() ? this.EVENTS[this.idx(this.num())] : null; },
  is(id) { const e = this.current(); return !!e && e.id === id; },
  // when this week ends (next Monday 00:00 in Vietnam), in ms
  endsAt() { return ((this.num() + 1) * 7 - 3) * 864e5 - 7 * 3600e3; },
  leftText() {
    const m = Math.max(0, this.endsAt() - Date.now()), d = Math.floor(m / 864e5), h = Math.floor((m % 864e5) / 3600e3);
    return d ? `còn ${d} ngày ${h} giờ` : h ? `còn ${h} giờ` : `còn ${Math.max(1, Math.ceil(m / 60e3))} phút`;
  },
  next() { return this.EVENTS[this.idx(this.num() + 1)]; }
};

// Ghế chờ: each new day 2–3 clients sit waiting in front of the counter and you choose whom to serve.
// Waiting clients lose a day of patience every day; when it runs out they go to Kevin's shop instead.
// Story / personal appointments wait without limit ("Hẹn trước"). s.commission stays the one order being
// worked on, so every scene after the desk is unchanged.
G.bench = {
  on() { return !G.state.isDaily; },
  size() { return 2 + G.front.mods().seats; },
  patience() { return 2 + G.front.mods().patience; },
  seats() { return G.state.bench.seats; },
  // draw one visitor from the story / events / walk-ins without putting them at the counter
  visit() {
    const s = G.state, keep = s.commission;
    const com = G.story.nextVisit();
    s.commission = keep;
    return com;
  },
  // story orders become appointments as soon as they are queued
  pullQueue() {
    const s = G.state;
    while (s.story.queue.length) {
      const com = this.visit();
      if (com) this.seats().unshift({ com, patience: 99, appt: true, arrived: s.day });
    }
  },
  // once per day: the impatient leave, empty seats fill. Returns the clients who left.
  refill() {
    const s = G.state, b = s.bench;
    if (!this.on()) return [];
    this.pullQueue();
    if (b.day === s.day) return [];
    const left = [];
    for (const st of b.seats) if (!st.appt && b.day && --st.patience <= 0) left.push(st);
    b.seats = b.seats.filter((st) => !left.includes(st));
    let guard = 0;
    while (b.seats.filter((x) => !x.appt).length < this.size() && guard++ < 12) {
      const com = this.visit();
      if (!com || b.seats.some((x) => x.com.client === com.client)) continue;
      b.seats.push({ com, patience: this.patience(), arrived: s.day });
    }
    b.day = s.day; b.lost += left.length; s.econ.lostToRival = (s.econ.lostToRival || 0) + left.length;
    G.save();
    return left;
  },
  take(i) { const st = this.seats().splice(i, 1)[0]; G.state.commission = st.com; G.state.lastClient = st.com.client; G.save(); return st; },
  putBack() {
    const s = G.state; if (!s.commission) return;
    this.seats().unshift({ com: s.commission, patience: this.patience(), arrived: s.day, appt: ['story', 'arc'].includes(s.commission.kind) });
    s.commission = null; G.save();
  }
};

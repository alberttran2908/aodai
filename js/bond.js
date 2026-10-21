// Friendship (độ thân tình) 0–5 per client: earned by deliveries, matching their taste and gifts.
// Levels unlock personal greetings, gossip in the paper, two personal story orders (♥2, ♥4),
// a signature fabric (♥3), and at ♥5 a letter, a fabric discount and a personal doorbell tune.
G.bond = {
  AT: () => G.BOND_AT || [0, 10, 25, 45, 70, 100],
  NAMES: () => G.BOND_NAMES || ['Khách lạ', 'Quen mặt', 'Khách quen', 'Thân thiết', 'Tri kỷ', 'Người nhà'],
  data: (id) => (G.BONDS && G.BONDS[id]) || null,
  get(id) {
    const s = G.state;
    if (!s.bond) s.bond = {};
    if (!s.bond[id]) s.bond[id] = { pts: 0, lvl: 0, arc: 0, gifted: false, met: false };
    return s.bond[id];
  },
  levelFor(pts) { const A = this.AT(); let l = 0; while (l < 5 && pts >= A[l + 1]) l++; return l; },
  relevel(id) { const b = this.get(id); b.lvl = this.levelFor(b.pts); return b.lvl; },
  // progress inside the current level, 0..1
  frac(id) { const b = this.get(id), A = this.AT(); return b.lvl >= 5 ? 1 : (b.pts - A[b.lvl]) / (A[b.lvl + 1] - A[b.lvl]); },

  add(id, pts) {
    const b = this.get(id), before = b.lvl;
    b.pts = Math.min(this.AT()[5] + 50, b.pts + pts);
    b.lvl = this.levelFor(b.pts);
    const unlocks = [];
    for (let l = before + 1; l <= b.lvl; l++) unlocks.push(...this.onLevel(id, l));
    return { lvlUp: b.lvl > before, lvl: b.lvl, unlocks };
  },
  // rewards the moment a level is reached; returns short lines for the verdict card
  onLevel(id, l) {
    const d = this.data(id), cl = G.client(id), out = [];
    if (l === 1) out.push('Mở: lời chào riêng và tin hẻm trên báo');
    if (l === 2 && d && d.arcs) out.push(`Mở đơn tâm sự “${d.arcs[0].title}”`);
    if (l === 3 && d && d.sig && G.CAT.FABRICS[d.sig]) {
      G.state.roll[d.sig] = (G.state.roll[d.sig] || 0) + 300;
      out.push(`Quà: 3 m ${G.CAT.FABRICS[d.sig].name}`);
    }
    if (l === 4 && d && d.arcs && d.arcs[1]) out.push(`Mở đơn tâm sự “${d.arcs[1].title}”`);
    if (l === 5 && cl) out.push(`Giảm 10% vải ${G.CAT.MATS[cl.mats[0]].name.toLowerCase()} · chuông cửa riêng`);
    return out;
  },

  // points for one delivery (design doc §3.1)
  onDelivery(r, job) {
    const com = job.com, id = com.client, cl = G.client(id);
    if (!cl || cl.npc) return null;
    this.get(id).met = true;
    const why = [];
    let pts = r.success ? 10 : 3;
    why.push(r.success ? 'giao thành công +10' : 'khách vẫn quý tiệm +3');
    if (r.quality >= 90) { pts += 4; why.push('áo tuyệt đẹp +4'); }
    const ex = Math.min(2, r.exceeded || 0); if (ex) { pts += ex * 2; why.push(`vượt yêu cầu +${ex * 2}`); }
    const share = G.fabricShare(job.fabs);
    const liked = cl.mats.reduce((a, m) => a + (share.mats[m] || 0), 0);
    if (liked >= 0.5) { pts += 3; why.push('đúng chất vải khách mê +3'); }
    const top = G.CAT.TAG_KEYS.slice().sort((a, b) => r.tags[b] - r.tags[a])[0];
    if (top === cl.likes[0]) { pts += 2; why.push('đúng gu +2'); }
    if (com.kind === 'arc' && r.success) { pts += 10; why.push('đơn tâm sự +10'); }
    const res = this.add(id, pts);
    return Object.assign(res, { gained: pts, why, name: cl.name });
  },

  // a personal story order is ready when the level allows it and the rank is high enough
  arcReady(id) {
    const d = this.data(id), b = this.get(id), cl = G.client(id);
    if (!d || !d.arcs || !cl || !G.clientAllowed(cl)) return null;
    if (b.arc === 0 && b.lvl >= 2 && G.rank() >= 2) return d.arcs[0];
    if (b.arc === 1 && b.lvl >= 4 && G.rank() >= 4) return d.arcs[1];
    return null;
  },
  arcCommission(id, rng) {
    const a = this.arcReady(id); if (!a) return null;
    return G.makeCommission({ client: id, kind: 'arc', title: a.title, line: a.line, reqs: a.reqs, budgetMul: 1.3, refId: a.id, rng });
  },
  // after a successful personal order: reward, and the letter once both arcs are done
  arcDone(job) {
    const id = job.com.client, d = this.data(id), b = this.get(id);
    const a = d && d.arcs && d.arcs.find((x) => x.id === job.com.refId); if (!a) return [];
    const out = [];
    b.arc = Math.max(b.arc, d.arcs.indexOf(a) + 1);
    const rw = a.reward || {};
    if (rw.coins) { G.addCoins(rw.coins); out.push(`+${rw.coins} xu`); }
    if (rw.fabric && G.CAT.FABRICS[rw.fabric]) { G.state.roll[rw.fabric] = (G.state.roll[rw.fabric] || 0) + (rw.cm || 200); out.push(`+${((rw.cm || 200) / 100).toFixed(0)} m ${G.CAT.FABRICS[rw.fabric].name}`); }
    if (b.arc >= 2 && d.letter && G.mail) G.mail.add({ id: 'bond_' + id, from: id, title: d.letter.title, body: d.letter.body });
    if (G.story) G.story.count('arc' + b.arc + 'Done');
    return out;
  },

  // a gift of 1 m from the roll, once per visit
  giftPts(id, fabricId) {
    const cl = G.client(id), f = G.CAT.FABRICS[fabricId];
    if (cl.mats.includes(f.mat)) return 6;
    const top = Object.keys(f.tags).sort((a, b) => f.tags[b] - f.tags[a])[0];
    return cl.likes.includes(top) ? 3 : 2;
  },
  gift(id, fabricId) {
    const s = G.state; if (!s.roll[fabricId] || s.roll[fabricId] < 100) return null;
    s.roll[fabricId] -= 100; if (s.roll[fabricId] < 10) delete s.roll[fabricId];
    const pts = this.giftPts(id, fabricId), d = this.data(id);
    const res = this.add(id, pts);
    G.save();
    return Object.assign(res, { pts, line: d ? (pts >= 6 ? d.giftLike : d.giftOk) : null });
  },
  // ♥5 clients give a 10% discount on their favourite material
  discount(fabricId) {
    const f = G.CAT.FABRICS[fabricId]; if (!f) return 0;
    return G.CAT.CLIENTS.some((cl) => cl.mats[0] === f.mat && G.state.bond[cl.id] && G.state.bond[cl.id].lvl >= 5) ? 0.1 : 0;
  },
  greet(id) {
    const d = this.data(id), b = this.get(id);
    return d && d.greet && b.lvl >= 1 ? G.pick(d.greet) : null;
  }
};

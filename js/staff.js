// Thợ phụ: one hired helper. Re-sews your weakest seams (you always sew first), earns a little from odd jobs
// every open day, and takes a wage with the month's bills. A month in debt means an unpaid month off;
// two in a row and they quit. Bé Na leaves after three months to study design — with a thank-you letter.
G.staff = {
  current() { const id = G.state.staff && G.state.staff.id; return id && G.HELPERS ? G.HELPERS[id] : null; },
  working() { return !!this.current() && !G.state.staff.idle && !G.state.isDaily; },
  side() { const h = this.current(); return h ? Math.round(h.side * (1 + 0.1 * G.rank())) : 0; },
  hire(id) {
    const s = G.state, h = G.HELPERS[id];
    if (!h || this.current() || G.rank() < h.rank) return false;
    s.staff = { id, since: s.day, unpaid: 0, helped: 0, earned: 0, idle: false };
    G.sfx.done(); G.save();
    G.Dialog.open([{ who: id, t: h.hire }]);
    return true;
  },
  fire() {
    const s = G.state, h = this.current(); if (!h) return;
    s.staff.id = null; G.save();
    G.toast(`${h.name} đã nghỉ việc`);
  },
  // odd jobs (hems, small repairs) every day the shop is open
  onDay() {
    if (!this.working()) return;
    const n = this.side();
    G.addCoins(n); G.state.staff.earned += n;
  },
  // month end in business modes: returns a line for the bill scene (or null)
  onSettle(paid) {
    const s = G.state, st = s.staff, h = this.current(); if (!h) return null;
    if (paid) {
      st.unpaid = 0; st.idle = false;
      if (h.id === 'na' && s.day - st.since >= 15) return this.naLeaves();
      return null;
    }
    st.unpaid++; st.idle = true;
    if (st.unpaid >= 2) {
      this.fire();
      G.mail.add({ id: 'staff_quit_' + s.day, from: h.id, title: 'Thư xin nghỉ', body: `Chủ tiệm ơi,\nHai tháng rồi tiệm chưa trả lương được. Em/anh/cô hiểu mà, tiệm nhỏ ai cũng có lúc khó.\nNhưng cũng phải lo cơm áo, nên xin nghỉ. Khi nào tiệm khấm khá, cứ gọi lại nha.\n${h.name}` });
      return `${h.name} nghỉ việc vì hai tháng chưa được trả lương.`;
    }
    return `Tiệm thiếu tiền, ${h.name} nghỉ không lương tháng này.`;
  },
  naLeaves() {
    const s = G.state;
    s.staff.id = null;
    G.mail.add({ id: 'staff_na_bye', from: 'na', title: 'Em đi Đà Lạt học thiết kế!', gift: { fabric: 'voan.hongphan.tron', cm: 200 },
      body: 'Chủ tiệm ơi!\nEm đậu học bổng ngành thiết kế ở Đà Lạt rồi! Ba tháng ở tiệm em học được nhiều hơn ba năm ở trường.\nEm gửi lại cuộn voan hồng, coi như quà cảm ơn. Cái máy may “Bé Bướm” nhờ chủ tiệm chăm giùm em nha.\nBé Na' });
    return 'Bé Na xin nghỉ đi Đà Lạt học thiết kế, có gửi thư cảm ơn.';
  },
  // sewing help: how many seams the helper may still redo on this dress, and their result
  helpLeft(job) { const h = this.current(); return this.working() && job ? h.maxSeams - (job.helped || 0) : 0; },
  helpScore() { const h = this.current(); return h.skill * (0.97 + Math.random() * 0.03); },
  ironBonus() { const h = this.current(); return this.working() && h.ironBonus && !(G.state.tools.iron > 0) ? h.ironBonus : 0; }
};

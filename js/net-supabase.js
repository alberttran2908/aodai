// Supabase adapter for G.net (same async interface as the local stub in net.js). Used only when
// G.CFG.supabase has a URL and anon key. Talks to Supabase over plain fetch (no SDK): an anonymous sign-in
// gives each browser its own player id, scores go in through SQL functions that check them (docs/supabase.sql),
// and the boards are public views. Any failure leaves the game offline; nothing here may block play.
G.makeSupabaseNet = function ({ url, anonKey }) {
  const base = url.replace(/\/+$/, ''), KEY = 'aodai_sb_session';
  let sess = null;
  const load = () => { try { sess = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { sess = null; } };
  const keep = (s) => { sess = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const timed = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms || 8000))]);
  const auth = async (path, body) => {
    const r = await timed(fetch(base + '/auth/v1/' + path, { method: 'POST', headers: { apikey: anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) }));
    if (!r.ok) throw new Error('auth ' + r.status);
    const j = await r.json();
    keep({ access: j.access_token, refresh: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, uid: j.user && j.user.id });
  };
  // a valid access token: sign in anonymously once, refresh when close to expiry
  const token = async () => {
    if (!sess) load();
    if (!sess) await auth('signup', {});
    else if (Date.now() > sess.exp - 60e3) { try { await auth('token?grant_type=refresh_token', { refresh_token: sess.refresh }); } catch (e) { sess = null; await auth('signup', {}); } }
    return sess.access;
  };
  const rest = async (path, opt) => {
    const t = await token();
    const r = await timed(fetch(base + '/rest/v1/' + path, Object.assign({}, opt, { headers: { apikey: anonKey, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' } })));
    if (!r.ok) throw new Error('rest ' + r.status);
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  };
  const rpc = (fn, args) => rest('rpc/' + fn, { method: 'POST', body: JSON.stringify(args || {}) });
  const q = encodeURIComponent;
  return {
    kind: 'supabase', online: false,
    async init() {
      await token();
      if (G.state && G.state.shopName) await rpc('set_profile', { p_name: G.state.shopName });
      this.online = true;
    },
    async me() { await token(); return { id: sess.uid, name: G.state.shopName }; },
    // the daily order: first try of the day is the official score (the server keeps only the first)
    async submitDaily({ date, score, payload }) {
      await rpc('set_profile', { p_name: G.state.shopName });
      return rpc('submit_daily', { p_date: date, p_score: score, p_payload: JSON.stringify(payload || null).slice(0, 2000) });
    },
    async dailyBoard(date, opt) {
      const rows = await rest(`daily_board?date=eq.${q(date)}&order=score.desc,created_at.asc&limit=${(opt && opt.limit) || 20}&select=name,score,owner`);
      return (rows || []).map((r) => ({ name: r.name, score: r.score, me: !!sess && r.owner === sess.uid }));
    },
    async submitChallenge({ week, worth, days, bankrupt }) {
      await rpc('set_profile', { p_name: G.state.shopName });
      return rpc('submit_challenge', { p_week: String(week), p_worth: Math.round(worth), p_days: days | 0, p_bankrupt: !!bankrupt });
    },
    async challengeBoard(week, opt) {
      const rows = await rest(`challenge_board?week=eq.${q(String(week))}&order=worth.desc&limit=${(opt && opt.limit) || 20}&select=name,worth,owner`);
      return (rows || []).map((r) => ({ name: r.name, worth: r.worth, me: !!sess && r.owner === sess.uid }));
    },
    // ghosts on the alley board: this week's real challenge players
    async alleyBoard() {
      const wk = G.state && G.state.seed ? String(G.state.seed).replace('week-', '') : '';
      return wk ? (await this.challengeBoard(wk, { limit: 8 })).filter((r) => !r.me) : [];
    },
    async publishDress({ payload }) { return { id: null, url: G.share.url(payload) }; },
    async getDress() { return null; },
    async showcase() { return { ok: true }; },
    async runwayEnter() { return { ok: false, reason: 'offline' }; },
    async runwayResults() { return []; },
    async report() { return { ok: true }; }
  };
};
// pick the adapter: Supabase when configured, else the local stub stays
(function () {
  const c = G.CFG && G.CFG.supabase;
  if (c && c.url && c.anonKey) { G.net = G.makeSupabaseNet(c); G.CFG.net = 'supabase'; }
})();

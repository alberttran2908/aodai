// Firebase adapter for G.net (same async interface as the local stub in net.js). Used only when
// G.CFG.firebase has an apiKey and projectId. Plain fetch against Firebase's REST endpoints, no SDK:
// an anonymous sign-in gives each browser its own player id, scores are Firestore documents whose writes
// the security rules check (firestore.rules), and the boards are ordered queries. Any failure leaves the
// game offline; nothing here may block play.
G.makeFirebaseNet = function ({ apiKey, projectId }) {
  const KEY = 'aodai_fb_session', DB = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  let sess = null;
  const load = () => { try { sess = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { sess = null; } };
  const keep = (s) => { sess = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const timed = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms || 8000))]);
  const post = async (url, body, headers) => {
    const r = await timed(fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}), body: JSON.stringify(body) }));
    if (!r.ok) throw new Error('http ' + r.status);
    return r.json();
  };
  // a valid ID token: sign in anonymously once, refresh when close to expiry
  const signUp = async () => {
    const j = await post(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, { returnSecureToken: true });
    keep({ id: j.idToken, refresh: j.refreshToken, exp: Date.now() + (+j.expiresIn || 3600) * 1000, uid: j.localId });
  };
  const token = async () => {
    if (!sess) load();
    if (!sess) await signUp();
    else if (Date.now() > sess.exp - 60e3) {
      try {
        const r = await timed(fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(sess.refresh) }));
        if (!r.ok) throw new Error('refresh ' + r.status);
        const j = await r.json();
        keep({ id: j.id_token, refresh: j.refresh_token, exp: Date.now() + (+j.expires_in || 3600) * 1000, uid: j.user_id || sess.uid });
      } catch (e) { sess = null; await signUp(); }
    }
    return sess.id;
  };
  const auth = async () => ({ Authorization: 'Bearer ' + (await token()) });
  const name = () => String((G.state && G.state.shopName) || 'Một tiệm may').slice(0, 24) || 'Một tiệm may';
  // Firestore typed values
  const val = (v) => (typeof v === 'boolean' ? { booleanValue: v } : Number.isInteger(v) ? { integerValue: String(v) } : { stringValue: String(v) });
  const fields = (o) => { const f = {}; for (const k in o) f[k] = val(o[k]); return f; };
  const plain = (f) => { const o = {}; for (const k in f || {}) { const v = f[k]; o[k] = 'integerValue' in v ? +v.integerValue : 'booleanValue' in v ? v.booleanValue : v.stringValue !== undefined ? v.stringValue : v.timestampValue; } return o; };
  const doc = (path) => `projects/${projectId}/databases/(default)/documents/${path}`;
  // one write with the server's clock in "at" (the rules compare it with request.time)
  const commit = async (path, data, mustBeNew) => post(`${DB}:commit`, { writes: [Object.assign(
    { update: { name: doc(path), fields: fields(data) }, updateTransforms: [{ fieldPath: 'at', setToServerValue: 'REQUEST_TIME' }] },
    mustBeNew ? { currentDocument: { exists: false } } : {})] }, await auth());
  // the top rows of a board: <parent>/scores ordered by one field, highest first
  const board = async (parent, field, limit) => {
    const rows = await post(`${DB}/${parent}:runQuery`, { structuredQuery: { from: [{ collectionId: 'scores' }], orderBy: [{ field: { fieldPath: field }, direction: 'DESCENDING' }], limit } }, await auth());
    return (rows || []).filter((r) => r.document).map((r) => Object.assign(plain(r.document.fields), { me: !!sess && r.document.name.endsWith('/' + sess.uid) }));
  };
  return {
    kind: 'firebase', online: false,
    async init() { await token(); this.online = true; },
    async me() { await token(); return { id: sess.uid, name: name() }; },
    // the daily order: the first try of the day is the official score (the document can only be created once)
    async submitDaily({ date, score }) {
      await token();
      await commit(`daily/${date}/scores/${sess.uid}`, { name: name(), score: Math.max(0, Math.min(100, Math.round(score))) }, true);
      return { accepted: true, rank: null };
    },
    async dailyBoard(date, opt) { return (await board(`daily/${date}`, 'score', (opt && opt.limit) || 20)).map((r) => ({ name: r.name, score: r.score, me: r.me })); },
    // the weekly challenge keeps each player's best worth (the rules refuse a lower one)
    async submitChallenge({ week, worth, days, bankrupt }) {
      await token();
      await commit(`challenge/${week}/scores/${sess.uid}`, { name: name(), worth: Math.round(worth), days: days | 0, bankrupt: !!bankrupt }, false);
      return { accepted: true, rank: null };
    },
    async challengeBoard(week, opt) { return (await board(`challenge/${week}`, 'worth', (opt && opt.limit) || 20)).map((r) => ({ name: r.name, worth: r.worth, me: r.me })); },
    // ghosts on the alley board: this week's real challenge players
    async alleyBoard() {
      const seed = String((G.state && G.state.seed) || ''), wk = /^week-/.test(seed) ? seed.slice(5) : G.econ.weekKey();
      return (await this.challengeBoard(wk, { limit: 8 })).filter((r) => !r.me);
    },
    async publishDress({ payload }) { return { id: null, url: G.share.url(payload) }; },
    async getDress() { return null; },
    async showcase() { return { ok: true }; },
    async runwayEnter() { return { ok: false, reason: 'offline' }; },
    async runwayResults() { return []; },
    async report() { return { ok: true }; }
  };
};
// pick the adapter: Firebase when configured, else the local stub stays
(function () {
  const c = G.CFG && G.CFG.firebase;
  if (c && c.apiKey && c.projectId) { G.net = G.makeFirebaseNet(c); G.CFG.net = 'firebase'; }
})();

// Network adapter. The public build runs fully static (GitHub Pages), so this is the local stub:
// same async interface as the Firebase adapter (js/net-firebase.js), which takes over once configured.
// UI code always awaits these inside try/catch and treats failure as "offline", never blocking play.
G.net = {
  kind: 'local', online: false,
  async init() {},
  async me() { return { id: 'local', name: G.state.shopName }; },
  async submitDaily() { return { accepted: true, rank: null }; },
  async dailyBoard() { return []; },
  async submitChallenge() { return { accepted: true, rank: null }; },
  async challengeBoard() { return []; },
  async alleyBoard() { return []; },
  async publishDress({ payload }) { return { id: null, url: G.share.url(payload) }; },
  async getDress() { return null; },
  async showcase() { return { ok: true }; },
  async runwayEnter() { return { ok: false, reason: 'offline' }; },
  async runwayResults() { return []; },
  async report() { return { ok: true }; }
};

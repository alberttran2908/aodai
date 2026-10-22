// Build-wide settings, identical for every player (it is an online game: same rules, comparable scores).
// parody: 'on' all famous (parody) clients · 'safe' hides the ones flagged risk:'high' · 'off' none.
// focus: the game is about making clothes. Daily quests, weekly events, boutique contracts, VIP appointments,
// the check-in calendar and the news card stay in the code but are switched off; set false to bring them back.
G.CFG = { parody: 'safe', net: 'local', baseUrl: location.origin + location.pathname, focus: true,
  // online boards: paste the Firebase web app's apiKey and projectId here (see README, firestore.rules);
  // left empty, the game stays fully offline
  firebase: { apiKey: '', projectId: '' } };

G.parody = () => G.CFG.parody;
G.clientAllowed = function (cl) {
  if (!cl || !cl.star) return true;
  // the weekly challenge must be identical for everyone, whatever their parody setting: regulars only
  if (G.state && G.state.mode === 'challenge') return false;
  const p = G.parody();
  return p === 'on' || (p === 'safe' && cl.risk !== 'high');
};
G.clientsAllowed = () => G.CAT.CLIENTS.filter(G.clientAllowed);

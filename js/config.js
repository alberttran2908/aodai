// Build-wide settings, identical for every player (it is an online game: same rules, comparable scores).
// parody: 'on' all famous (parody) clients · 'safe' hides the ones flagged risk:'high' · 'off' none.
G.CFG = { parody: 'safe', net: 'local', baseUrl: location.origin + location.pathname,
  // online boards: paste the Supabase project's URL and its public "anon" key here (see docs/supabase.sql);
  // left empty, the game stays fully offline
  supabase: { url: '', anonKey: '' } };

G.parody = () => G.CFG.parody;
G.clientAllowed = function (cl) {
  if (!cl || !cl.star) return true;
  // the weekly challenge must be identical for everyone, whatever their parody setting: regulars only
  if (G.state && G.state.mode === 'challenge') return false;
  const p = G.parody();
  return p === 'on' || (p === 'safe' && cl.risk !== 'high');
};
G.clientsAllowed = () => G.CAT.CLIENTS.filter(G.clientAllowed);

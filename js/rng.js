// Seeded randomness: the daily order and newspaper wording must come out the same for everyone / every reload.
G.hash32 = function (str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};
G.mulberry32 = function (seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
G.rpick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
// calendar date in Vietnam (UTC+7), so the whole country shares the same daily order
G.dateKeyVN = (ms) => new Date((ms || Date.now()) + 7 * 3600e3).toISOString().slice(0, 10);

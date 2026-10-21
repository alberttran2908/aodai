// Follow-the-line tracer used by cutting and sewing (works in screen px).
// Forgiving by design: deviation is measured to the path segment (not the nearest
// sample), there is a dead zone, a wide capture radius, and the tool "snaps" toward the line.
G.Tracer = class {
  constructor(pts, o) {
    o = o || {};
    this.pts = pts;
    this.idx = 0;
    this.active = false;
    this.done = false;
    this.q = [];
    this.trail = [];
    this.tol = o.tol || 16;       // px beyond the dead zone where quality drops to ~0
    this.dead = o.dead || 5;      // px of free wobble
    this.capture = o.capture || 70;
    this.look = o.look || 30;
    this.snap = o.snap !== undefined ? o.snap : 0.6; // how much the drawn tool/trail is pulled to the line
    this.onAdvance = o.onAdvance || null;
    this.cursor = null;
  }
  get progress() { return this.idx / (this.pts.length - 1); }
  get head() { return this.pts[this.idx]; }
  dir() {
    const a = this.pts[Math.max(0, this.idx - 1)], b = this.pts[Math.min(this.pts.length - 1, this.idx + 1)];
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
  // closest point on segment i..i+1
  proj(p, i) {
    const a = this.pts[i], b = this.pts[Math.min(this.pts.length - 1, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1;
    const t = G.clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
    const x = a.x + dx * t, y = a.y + dy * t;
    return { x, y, t, d: Math.hypot(p.x - x, p.y - y) };
  }
  begin(p) {
    if (this.done) return false;
    if (G.dist(p, this.head) > this.capture * 1.15) return false;
    this.active = true;
    this.cursor = { x: this.head.x, y: this.head.y };
    this.trail.push([{ x: this.head.x, y: this.head.y }]);
    return true;
  }
  move(p) {
    if (!this.active || this.done) return 0;
    // nearest segment within the look-ahead window (a little look-back keeps it stable)
    let best = null, bi = -1;
    const from = Math.max(0, this.idx - 2), end = Math.min(this.pts.length - 2, this.idx + this.look);
    for (let i = from; i <= end; i++) {
      const pr = this.proj(p, i);
      if (!best || pr.d < best.d) { best = pr; bi = i; }
    }
    if (!best || best.d > this.capture) return 0;
    const snapped = { x: p.x + (best.x - p.x) * this.snap, y: p.y + (best.y - p.y) * this.snap };
    this.cursor = snapped;
    this.trail[this.trail.length - 1].push(snapped);
    const target = best.t > 0.5 ? bi + 1 : bi;
    if (target <= this.idx) return 0;
    const n = target - this.idx;
    const q = G.clamp(1 - Math.max(0, best.d - this.dead) / (this.tol * 2.2), 0, 1);
    for (let k = 0; k < n; k++) this.q.push(q);
    const prev = this.idx;
    this.idx = target;
    if (this.onAdvance) this.onAdvance(prev, target, best.d, p);
    if (this.idx >= this.pts.length - 1) { this.done = true; this.active = false; }
    return n;
  }
  end() { this.active = false; }
  score() {
    if (!this.q.length) return 0;
    return this.q.reduce((a, b) => a + b, 0) / this.q.length;
  }
};

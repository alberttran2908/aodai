// Ảnh dáng: a player's own drawing/photo of an áo dài used as the dress's picture. The game still decides
// everything that counts — style points come from the cut chosen in the sketchbook, pattern pieces and
// sewing from the game's own geometry; the picture only changes how the dress looks (on this device).
// Mode 'vai' paints the chosen fabric into the drawing (its light and dark become the folds); 'goc' keeps
// the drawing's own colours.
G.skins = (function () {
  const KEY = 'aodai_skins_v1', MAX = 6, H = 640;
  const list = {}; // id → { data, img, ready, shade }

  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(Object.keys(list).map((id) => ({ id, data: list[id].data })))); return true; } catch (e) { return false; } }
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i += 7) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  function add(id, data) {
    const rec = list[id] = { data, ready: false };
    const img = new Image();
    img.onload = () => { rec.img = img; rec.shade = shadeOf(img); rec.ready = true; cache.clear(); };
    img.src = data;
  }
  function load() { for (const k in list) delete list[k]; for (const it of read()) if (it && it.id && /^data:image\/(png|webp);base64,/.test(it.data)) add(it.id, it.data); }

  // the drawing's light and dark, auto-levelled, as a grey multiply map (folds and outlines survive any fabric)
  function shadeOf(img) {
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const c = cv.getContext('2d'); c.drawImage(img, 0, 0);
    const id = c.getImageData(0, 0, cv.width, cv.height), d = id.data;
    let lo = 255, hi = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 128) { const l = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; lo = Math.min(lo, l); hi = Math.max(hi, l); }
    const span = Math.max(30, hi - lo);
    for (let i = 0; i < d.length; i += 4) {
      const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] - lo) / span, v = Math.round(255 * (0.45 + 0.55 * Math.min(1, Math.max(0, l))));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    c.putImageData(id, 0, 0);
    return cv;
  }

  // the file picker: cut the dress out of a plain light background (or keep the PNG's own transparency),
  // trim to the dress, scale to 640 px tall, keep it on this device
  function pick(done) {
    if (Object.keys(list).length >= MAX) { G.toast(`Chỉ giữ được ${MAX} ảnh dáng — xoá bớt ảnh cũ`, G.C.red); return; }
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/webp';
    inp.onchange = () => {
      const file = inp.files && inp.files[0]; if (!file) return;
      if (!/^image\//.test(file.type) || file.size > 15e6) { G.toast('Chọn một file ảnh (PNG/JPG, dưới 15 MB)', G.C.red); return; }
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); const id = fromImage(img); if (id) done && done(id); };
      img.onerror = () => { URL.revokeObjectURL(url); G.toast('Không đọc được ảnh này', G.C.red); };
      img.src = url;
    };
    inp.click();
  }
  function fromImage(img) {
    const data = cutOut(img);
    if (!data) { G.toast('Không tách được dáng áo — dùng ảnh nền trắng hoặc PNG nền trong', G.C.red); return null; }
    const id = 's' + hash(data).toString(36);
    add(id, data);
    if (!write()) { delete list[id]; G.toast('Máy hết chỗ lưu ảnh', G.C.red); return null; }
    return id;
  }
  function cutOut(img) {
    const k = Math.min(1, 1200 / Math.max(img.width, img.height)), w = Math.round(img.width * k), h = Math.round(img.height * k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d'); c.drawImage(img, 0, 0, w, h);
    const id = c.getImageData(0, 0, w, h), d = id.data;
    let clear = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 200) clear++;
    if (clear < w * h * 0.05) {
      // no transparency: the background is whatever light, colourless colour touches the border — flood it away
      const seen = new Uint8Array(w * h), stack = [];
      const bg = (p) => { const i = p * 4, mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); return mx > 215 && mx - mn < 28; };
      for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
      for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
      while (stack.length) {
        const p = stack.pop(); if (seen[p] || !bg(p)) continue;
        seen[p] = 1; d[p * 4 + 3] = 0;
        const x = p % w;
        if (x > 0) stack.push(p - 1); if (x < w - 1) stack.push(p + 1); if (p >= w) stack.push(p - w); if (p < w * (h - 1)) stack.push(p + w);
      }
    }
    // trim to the dress
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0 || (x1 - x0) * (y1 - y0) < w * h * 0.02) return null;
    c.putImageData(id, 0, 0);
    const tw = x1 - x0 + 1, th = y1 - y0 + 1, z = H / th, out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(tw * z)); out.height = H;
    out.getContext('2d').drawImage(cv, x0, y0, tw, th, 0, 0, out.width, out.height);
    const webp = out.toDataURL('image/webp', 0.86);
    return /^data:image\/webp/.test(webp) ? webp : out.toDataURL('image/png');
  }
  function remove(id) { delete list[id]; write(); cache.clear(); }

  // draw the picture in place of the áo: from the collar top to the hem, centred, in garment units
  const cache = new Map();
  function draw(c, asm, fab, mode, tile) {
    const rec = list[asm.design.skin]; if (!rec || !rec.ready) return false;
    const s = asm.s, top = asm.collar ? -4.8 * s : -1 * s, bot = asm.hemY + (asm.design.length === 'got' ? 2.5 * s : 0.5 * s);
    const h = bot - top, w = h * (rec.img.width / rec.img.height), x0 = -w / 2;
    const m = c.getTransform(), px = Math.min(3, Math.hypot(m.a, m.b));
    const key = [asm.design.skin, mode, fab.mat, fab.color, fab.print, Math.round(w * px), Math.round(h * px)].join('|');
    let off = cache.get(key);
    if (!off) {
      off = document.createElement('canvas'); off.width = Math.max(1, Math.round(w * px)); off.height = Math.max(1, Math.round(h * px));
      const oc = off.getContext('2d');
      if (mode === 'goc') oc.drawImage(rec.img, 0, 0, off.width, off.height);
      else {
        oc.save(); oc.scale(px, px); oc.translate(-x0, -top);
        oc.beginPath(); oc.rect(x0, top, w, h); G.art.fillFabric(oc, fab.mat, fab.color, tile, fab.print);
        oc.restore();
        oc.globalCompositeOperation = 'multiply'; oc.drawImage(rec.shade, 0, 0, off.width, off.height);
        oc.globalCompositeOperation = 'destination-in'; oc.drawImage(rec.img, 0, 0, off.width, off.height);
        oc.globalCompositeOperation = 'source-over';
      }
      if (cache.size > 10) cache.delete(cache.keys().next().value);
      cache.set(key, off);
    }
    c.drawImage(off, x0, top, w, h);
    return true;
  }

  return { MAX, list, load, pick, fromImage, remove, draw, ready: (id) => !!(list[id] && list[id].ready) };
})();

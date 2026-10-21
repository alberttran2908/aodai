// First-order tutorial (Dressmaker style): Bà Tư walks a new tailor through one whole commission.
// Each step belongs to a scene and points at something on screen — a button by its hit id, or a
// region — with a dimmed spotlight and a speech bubble. Nothing is locked: the player still clicks the
// real thing, and a step moves on by itself once its goal is met ("ack" steps wait for "Hiểu rồi").
G.tut = (function () {
  const btn = (...ids) => ({ ids });
  const sc = () => G.scene || {};
  const STEPS = [
    { scene: 'desk', target: btn('seat0', 'bell'), text: 'Chào con, Bà Tư đây! Khách ngồi chờ ở băng ghế dưới kia. Bấm vào một người để mời vào quầy — khách chờ lâu quá sẽ bỏ sang tiệm khác đó.', done: () => !!G.state.commission },
    { scene: 'desk', target: btn('accept'), text: 'Phiếu đặt may ghi khách muốn gì: phong cách, chất liệu, chất lượng tối thiểu. Đọc kỹ rồi bấm “Nhận đặt may” nha.', done: () => !!sc().quote || G.sceneName !== 'desk' },
    { scene: 'desk', target: btn('qbase', 'qgo', 'qok'), text: 'Trả giá cao thì lời hơn, nhưng khách khó tính có thể phật ý. Đơn đầu cứ lấy đúng giá khách đề nghị cho chắc.', done: () => G.sceneName !== 'desk' },
    { scene: 'measure', target: { rect: () => ({ x: 380, y: 120, w: 440, h: 420 }) }, text: 'Đo ba vòng: ngực, eo, hông. Kéo thước dây từ mép trái sang mép phải thân người, ngay vạch đang sáng. Càng sát mép, áo càng vừa.', done: () => (sc().results || []).length > 0 },
    { scene: 'measure', target: btn('next'), text: 'Đo tiếp hai vòng còn lại, xong thì mở sổ phác thảo.', done: () => G.sceneName !== 'measure', wait: () => { const h = find('next'); return h && h.enabled; } },
    { scene: 'sketch', target: { rect: () => ({ x: 834, y: 112, w: 416, h: 520 }) }, text: 'Đây là sổ phác thảo. Chọn cổ, dáng, tay, tà, quần ở trang phải. Rê chuột lên một kiểu để xem các thanh phong cách bên trái tăng giảm ra sao.', ack: true },
    { scene: 'sketch', target: btn('tabv'), text: 'Giờ tới vải. Bấm thẻ “Vải”, rồi kéo một tấm vải thả lên thân, tay hay quần trên áo.', done: () => sc().tab === 'vai' },
    { scene: 'sketch', target: { rect: () => ({ x: 24, y: 70, w: 394, h: 560 }) }, text: 'Bên trái: dấu ✓ là đạt yêu cầu. Thiếu vải thì bấm “Mua” ngay dưới phiếu. Đủ hết thì “Vẽ rập”.', done: () => { const h = find('draft'); return h && h.enabled; } },
    { scene: 'sketch', target: btn('draft'), text: 'Đạt rồi! Bấm “Vẽ rập” để sang bàn cắt.', done: () => G.sceneName !== 'sketch' },
    { scene: 'cutting', target: { rect: () => ({ x: 20, y: 66, w: 820, h: 560 }) }, text: 'Kéo từng mảnh rập từ khay lên vải. Mũi tên xanh là đúng canh sợi, áo rủ đẹp hơn. Bấm R hoặc chuột phải để xoay. Xếp khít thì đỡ tốn vải.', ack: true },
    { scene: 'cutting', target: btn('tCut'), text: 'Xếp xong thì chọn “Kéo”, rồi bấm vào từng mảnh để cắt.', done: () => sc().mode === 'cut' },
    { scene: 'cutting', target: btn('sew'), text: 'Cắt hết rồi! Đem đi may thôi.', wait: () => { const h = find('sew'); return h && h.enabled; }, done: () => G.sceneName !== 'cutting' },
    { scene: 'sew', target: btn('pinall'), text: 'Trước khi may phải ghim. Kéo từng mảnh thả lên ma-nơ-canh, hoặc bấm “Ghim nhanh tất cả”.', done: () => !find('pinall') },
    { scene: 'sew', target: btn('go'), text: 'Chọn một đường may trong danh sách rồi bấm “May”.', done: () => !!find('leave') || !!sc().mach },
    { scene: 'sew', target: { rect: () => ({ x: 20, y: 66, w: 880, h: 560 }) }, text: 'Giữ Space hoặc giữ chuột để chạy máy. A/D hoặc kéo chuột để lái kim theo đường chấm. Tới góc thì dừng hẳn, xoay vải rồi may tiếp. W/S đổi tốc độ.', ack: true },
    { scene: 'sew', target: btn('next'), text: 'May đủ các đường là xong. Đường nào chưa ưng thì tháo chỉ may lại. Rồi sang trang trí.', wait: () => { const h = find('next'); return h && h.enabled; }, done: () => G.sceneName !== 'sew' },
    { scene: 'decorate', target: { rect: () => ({ x: 840, y: 62, w: 420, h: 560 }) }, text: 'Thêu, viền, cúc, phụ kiện… Chọn mẫu rồi bấm lên áo để đặt. Phiếu bên trái cho biết khách có cần trang trí không. Trang trí tốn xu đó nha.', ack: true },
    { scene: 'decorate', target: btn('done'), text: 'Ưng rồi thì “Hoàn thành áo”.', done: () => G.sceneName !== 'decorate' },
    { scene: 'finish', target: btn('shoot'), text: 'Chụp tấm ảnh cho album: chọn phông, ánh sáng, khung hình rồi bấm “Chụp”.', done: () => sc().phase !== 'photo' },
    { scene: 'finish', target: btn('next'), text: 'Xong đơn đầu tiên rồi! Khách hài lòng thì trả đủ tiền và quý tiệm hơn. Từ giờ con tự lo tiệm nha — có gì cứ nhớ Bà Tư.', ack: true, last: true, at: { x: 40, y: 540 } }
  ];

  function find(id) { return (G.ui.hits || []).find((h) => h.id === id) || null; }
  const st = () => G.state && G.state.tut;
  // never in the weekly challenge or the daily order (same rules and clock for everyone)
  function active() { const t = st(), s = G.state; return !!(t && t.on && !s.isDaily && s.mode !== 'challenge' && !(G.Dialog && G.Dialog.active)); }
  function start() { G.state.tut = { on: true, idx: 0 }; G.save(); }
  function stop() { if (st()) { G.state.tut.on = false; G.save(); } }
  function next() {
    const t = st(); t.idx++;
    if (t.idx >= STEPS.length) t.on = false;
    G.save(); G.sfx.click();
  }

  // the step for the current scene: never goes backwards; jumps ahead when the player took another path
  function current() {
    const t = st(); let s = STEPS[t.idx];
    if (!s) { t.on = false; return null; }
    if (s.scene !== G.sceneName) {
      const j = STEPS.findIndex((x, i) => i > t.idx && x.scene === G.sceneName);
      if (j < 0) return null;
      t.idx = j; s = STEPS[j];
    }
    return s;
  }

  function targetRect(s) {
    if (!s.target) return null;
    if (s.target.rect) return s.target.rect();
    for (const id of s.target.ids) { const h = find(id); if (h) return h; }
    return null;
  }

  let pulse = 0;
  // drawn after the scene, before toasts; adds its own buttons on top of the scene's
  function draw(c, dt) {
    if (!active()) return;
    pulse += dt;
    let s = current(); if (!s) return;
    // finished steps move on at once (several can complete in one go)
    for (let n = 0; n < 4 && s && !s.ack && s.done && s.done(); n++) { next(); if (!st().on) return; s = current(); }
    if (!s) return;
    if (s.wait && !s.wait()) return; // nothing to point at yet (e.g. the button is still disabled)
    const U = G.UI, r = targetRect(s);
    // dim everything but the target
    if (r) {
      const pad = 8;
      c.save();
      // the screen with a rounded hole cut out (G.rr would start a new path, so add the hole by hand)
      const hx = r.x - pad, hy = r.y - pad, hw = r.w + pad * 2, hh = r.h + pad * 2, hr = Math.min(14, hw / 2, hh / 2);
      c.beginPath(); c.rect(0, 0, G.W, G.H);
      c.moveTo(hx + hr, hy); c.arcTo(hx + hw, hy, hx + hw, hy + hh, hr); c.arcTo(hx + hw, hy + hh, hx, hy + hh, hr);
      c.arcTo(hx, hy + hh, hx, hy, hr); c.arcTo(hx, hy, hx + hw, hy, hr); c.closePath();
      c.fillStyle = 'rgba(30,15,8,0.42)'; c.fill('evenodd');
      const k = 0.5 + 0.5 * Math.sin(pulse * 5);
      G.rr(c, r.x - pad - k * 4, r.y - pad - k * 4, r.w + (pad + k * 4) * 2, r.h + (pad + k * 4) * 2, 16);
      c.strokeStyle = `rgba(246,205,106,${0.65 + 0.35 * k})`; c.lineWidth = 4; c.stroke();
      c.restore();
    }
    // Bà Tư's bubble, on the side away from the target
    const bw = 520, bh = 132;
    const cx = r ? r.x + r.w / 2 : G.W / 2, cy = r ? r.y + r.h / 2 : G.H / 2;
    let bx = G.clamp(cx < G.W / 2 ? Math.max(cx + (r ? r.w / 2 : 0) + 30, 420) : Math.min(cx - (r ? r.w / 2 : 0) - 30 - bw, G.W - 420 - bw), 16, G.W - bw - 16);
    let by = cy > G.H / 2 ? 70 : G.H - bh - 90;
    if (r && bx < r.x + r.w && bx + bw > r.x && by < r.y + r.h && by + bh > r.y) by = r.y > G.H / 2 ? Math.max(66, r.y - bh - 20) : Math.min(G.H - bh - 80, r.y + r.h + 20);
    if (s.at) { bx = s.at.x; by = s.at.y; } // a step may pin its bubble out of the way
    G.ui.hits.push({ id: 'tut_box', x: bx, y: by, w: bw, h: bh, enabled: true, cb: () => {} }); // swallow clicks on the bubble
    U.card(c, bx, by, bw, bh, { fill: '#fffaf0' });
    G.Dialog.portrait(c, 'batu', bx + 12, by + 14, 78, 92);
    G.text(c, 'Bà Tư', bx + 51, by + 118, { size: 12, weight: 800, font: G.GAME, align: 'center', color: U.T.accent });
    G.wrap(c, s.text, bx + 104, by + 14, bw - 120, 19, { size: 14, color: '#3a2c26' });
    const t = st();
    G.text(c, `${t.idx + 1}/${STEPS.length}`, bx + bw - 14, by + bh - 18, { size: 11, weight: 700, align: 'right', color: U.T.soft });
    if (s.ack) G.button(c, 'tut_ok', s.last ? 'Cảm ơn bà!' : 'Hiểu rồi', bx + bw - 148, by + bh - 50, 100, 34, () => next(), { size: 14, r: 17 });
    if (!s.last) G.button(c, 'tut_skip', 'Bỏ hướng dẫn', bx + 104, by + bh - 44, 110, 28, () => { stop(); G.toast('Đã tắt hướng dẫn — bật lại trong ⚙ ở màn hình chính'); }, { style: 'ghost', size: 11, r: 14 });
    // an arrow from the bubble to the target
    if (r) {
      const ax = G.clamp(cx, bx + 40, bx + bw - 40), ay = by > cy ? by - 4 : by + bh + 4, tx = cx, ty = by > cy ? r.y + r.h + 14 : r.y - 14;
      const bob = Math.sin(pulse * 6) * 4, ang = Math.atan2(ty - ay, tx - ax), len = Math.hypot(tx - ax, ty - ay);
      if (len > 40) {
        c.save(); c.translate(ax, ay); c.rotate(ang);
        c.strokeStyle = '#f6cd6a'; c.lineWidth = 5; c.lineCap = 'round'; c.setLineDash([2, 10]);
        c.beginPath(); c.moveTo(10, 0); c.lineTo(len - 20 + bob, 0); c.stroke(); c.setLineDash([]);
        c.translate(len - 12 + bob, 0); c.beginPath(); c.moveTo(10, 0); c.lineTo(-8, -10); c.lineTo(-8, 10); c.closePath();
        c.fillStyle = '#f6cd6a'; c.fill(); c.strokeStyle = G.INK; c.lineWidth = 2; c.stroke();
        c.restore();
      }
    }
  }

  return { STEPS, active, start, stop, draw, find };
})();

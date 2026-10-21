# Tiệm May Áo Dài — Thiết kế 2: "Buôn may bán đắt"

> Mốc tiếp theo, xây trên `js/economy.js` (chế độ Kinh doanh / Thong thả / Thử thách tuần), `scenes/ledger.js` và Xưởng (`G.scenes.workshop`, mua cấp `G.DATA.tools` — kỹ sư đang làm; tài liệu này **chỉ thêm tab**, không thiết kế lại).
> Ràng buộc: tĩnh (GitHub Pages), online qua `G.net` stub, Canvas 2D + art có sẵn, UI kit cũ, vòng may vẫn là trung tâm, áp lực kinh doanh "vừa phải".

---

## 0. Nghiên cứu: các game quản lý tiệm làm gì

| Game | Cơ chế đáng học | Bài học cho mình |
|---|---|---|
| **Recettear** | Người chơi tự đặt giá theo % giá gốc; khách có ngân sách; "pin" (đoán trúng giá khách chịu trả ngay lần đầu) cho thưởng XP và chuỗi combo; mặc cả kéo dài làm mất uy tín/chuỗi — cộng đồng khuyên "đặt giá đúng ngay lần đầu" (≈105% bình thường) [3] | Báo giá **một lần là chính**, thưởng cho đoán chuẩn, không bắt kỳ kèo dài dòng. |
| **Moonlighter (1 & 2)** | Phản ứng khách theo bậc: Rẻ (<88% giá chuẩn) / Chuẩn (88–104%) / Đắt (105–120%) / Cắt cổ (>121%, không ai mua); tiệm "Nổi tiếng" hoặc khách giàu nâng giá chuẩn; sổ tay ghi lại giá đã thử [4] | Phản ứng bằng **lời thoại + mặt khách** thay cho con số; có **sổ ghi giá** để người chơi học dần. |
| **Potion Craft** | Mặc cả là minigame nhỏ; uy tín cao → mặc cả được nhiều hơn, giá gốc cao hơn; mặc cả quá tay làm tụt uy tín; tách *uy tín* (làm đúng yêu cầu) và *độ nổi tiếng* [5] | Thân tình và danh tiếng **nới trần giá**; ép giá quá → phật lòng nhẹ. |
| **Shop Titans** | Thợ (worker) chế tạo thay chủ tiệm; mở rộng tiệm theo cấp; năng lượng từ kệ/trang trí để "phụ thu" hay "giảm giá"; Market giữa người chơi (offer/request); guild đầu tư chung vào thành phố, bounty tuần [1][2] | Thợ phụ là **trợ lực có lương**; đồ đạc tiệm tăng chỉ số; tính năng giữa người chơi để sau khi có backend. |
| **TCG Card Shop Simulator** | Thuê nhân viên: phí + lương ngày; nhân viên làm việc đơn giản (xếp kệ, quầy) nhưng không làm phần giá trị cao; mở rộng chỉ khi diện tích là nút thắt [6] | Thợ phụ **chỉ làm phần cơ bản** (may lại đường hỏng, việc vặt) — người chơi vẫn làm phần nghệ thuật. |
| **Supermarket Simulator** | Tự đặt giá; thu ngân là khoản đầu tư sớm tốt nhất; mở khoá nhân viên theo cấp tiệm [7] | Mở khoá thợ theo **hạng**; đầu tư nhỏ nhưng thấy hiệu quả ngay. |
| **Travellers Rest** | Danh tiếng mở thuê nhân viên (từ cấp 6) và tăng sức chứa; *comfort* (tiện nghi) tăng danh tiếng nhận được và giá phòng [8] | Đồ mặt tiền (ghế chờ, quạt, phòng thử) tăng **sức chứa hàng chờ / kiên nhẫn / thân tình**. |
| **Dressmaker** | Ngoài đơn khách còn may "freelance" bán sẵn để kiếm tiền, danh tiếng và mở đồ; giá áo phụ thuộc chi phí vải, công thợ, chất lượng, uy tín tiệm (không phụ thuộc phong cách) [9][10] | **Sạp áo may sẵn** dùng đúng vòng may; giá trị = vải + công × chất lượng × hạng. |
| **Mobile tycoon (Idle Miner…)** | Sự kiện giới hạn thời gian là điểm bùng doanh thu/giữ chân; chế độ PvP leaderboard làm "endgame" ngoài việc tăng số mãi [11] | **Bảng xếp hạng hẻm** + **tiệm bóng** (ghost) cho Thử thách tuần — cạnh tranh không cần realtime. |

Kết luận chọn lọc: (a) quyết định giá có rủi ro gắn với **tay nghề**, (b) chọn khách thay vì nhận bừa, (c) trợ lực có lương ăn vào hoá đơn tháng, (d) đầu tư tiệm có hoàn vốn rõ ràng, (e) một nguồn thu phụ dùng lại vòng may, (f) cạnh tranh bất đồng bộ.

---

## 1. Chọn tính năng (giá trị / công sức)

| # | Tính năng | Giá trị | Công | Chọn |
|---|---|---|---|---|
| F1 | **Báo giá** (tự đặt giá, giá cao → khách kỳ vọng chất lượng cao) | Rất cao: biến tay nghề thành tiền, tạo chênh lệch cạnh tranh | S | ✅ |
| F2 | **Ghế chờ** (2–3 khách chờ, chọn ai, kiên nhẫn theo ngày) | Cao: lựa chọn chiến lược mỗi ngày, ít đụng code đơn | M | ✅ |
| F3 | **Thợ phụ** (lương tháng, may lại đường hỏng, việc vặt) | Cao: "bảo hiểm" cho người chơi trung bình, thêm nhân vật | M | ✅ |
| F4 | **Mặt tiền tiệm** (bảng hiệu, ghế chờ, quạt, phòng thử, tủ kính, sạp) + **vay ngân hàng** + tài sản vào Giá trị tiệm | Cao: chỗ tiêu tiền có hoàn vốn, gắn tiền thuê | S | ✅ |
| F5 | **Sạp hội chợ cuối tháng** (áo may sẵn, đặt giá, bán cho người qua đường) | Cao: dùng vải tồn + vòng may, thêm nhịp cuối tháng | M | ✅ |
| F6 | **Bảng xếp hạng hẻm & tiệm bóng** | Cao cho cạnh tranh, rẻ | S | ✅ |
| — | Nhiều đơn song song + hạn chót | Hay nhưng phải đổi `G.job`/`s.commission` thành danh sách → rủi ro lớn | L | ✗ (F2 cho 80% cảm giác) |
| — | Kỳ kèo nhiều vòng (minigame) | Recettear cho thấy người chơi né nó [3] | M | ✗ (F1 một vòng + một lần trả giá) |
| — | Trao đổi vải giữa người chơi | Cần server để chống nhân bản | L | Để sau (§8) |
| — | Hội/guild | Cần backend, cộng đồng chưa có | L | Để sau |

---

## 2. F1 — Báo giá ("Chốt giá")

### 2.1 Trải nghiệm
Bấm **"Nhận đặt may"** → bảng **Báo giá** hiện (modal). Phiếu cũ ghi "Ngân sách" giờ ghi **"Khách đề nghị: 420 xu"**. Người chơi vặn mức giá 90%…140% (bước 5%). Mỗi nấc hiện ngay *"= 504 xu · khách sẽ đòi chất lượng ≥ 66"*. Bấm **"Chốt giá"** → khách phản ứng:

| Vị trí so với trần ẩn `c` | Phản ứng (ví dụ) | Kết quả |
|---|---|---|
| `q ≤ c − 0.15` | *"Ủa, rẻ vậy em? Chị đồng ý liền!"* | nhận; nếu `q < 1` là **giá tình thân** |
| `c − 0.15 < q < c − 0.05` | *"Hợp lý, chốt nha."* | nhận |
| `c − 0.05 ≤ q ≤ c` | *"Chốt! Em nói giá chuẩn ghê."* — **CHỐT CHUẨN** ✨ | nhận + thưởng chuỗi |
| `c < q ≤ c + 0.10` | *"Hơi chát… {c×budget} xu được không em?"* | trả giá = `floor20(c)`: **Đồng ý** / **Thôi, giá gốc** (1.0) |
| `q > c + 0.10` | *"Trời, cắt cổ vậy em! Chị chỉ đưa được {c−0.05} thôi."* | trả giá thấp hơn, khách **phật lòng** −2 ♥pts (không tụt cấp) |

Không bao giờ mất khách vì báo giá (cozy). Trả giá chỉ **một lần**.

### 2.2 Công thức
```js
// js/haggle.js
G.haggle = {
  STEPS: [0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4],
  ceil(com) {                                  // trần ẩn, seeded → challenge giống nhau
    const r = G.econ.rng('haggle|' + com.client, G.state.day)();
    const lvl = G.bond.get(com.client).lvl || 0, s = G.state;
    let c = 1.05 + 0.04 * Math.min(5, lvl) + 0.12 * r;
    if (s.press.boost > 0) c += 0.05;                         // vừa lên báo đẹp
    if (G.econ.market().id === 'rain') c -= 0.05;
    if (G.econ.market().id === 'kevinSale' && lvl < 3) c -= 0.08;
    if (com.kind === 'arc' || com.kind === 'chapter') c = Math.min(c, 1.0 + 0.04 * lvl); // khách thân, đừng chặt chém
    return G.clamp(Math.round(c * 20) / 20, 1.0, 1.35);
  },
  qualityFor(com, q) {                                         // giá cao → kỳ vọng cao
    const base = com.qualityBase;
    const d = q >= 1 ? Math.round((q - 1) * 40) : -Math.round((1 - q) * 50);
    return Math.min(92, Math.max(30, base + d));
  },
  apply(com, q, how) {                                        // how: 'pin'|'ok'|'counter'|'base'|'cheap'
    com.quote = q; com.budget = Math.round((com.baseBudget * q) / 10) * 10;
    com.quality = this.qualityFor(com, q);
    const h = G.state.haggle;
    if (how === 'pin') { h.streak++; h.pins++; } else if (how !== 'cheap') h.streak = 0;
    if (q < 1) G.bond.add(com.client, 4, 'giá tình thân');
    if (how === 'pin') G.bond.add(com.client, 2, 'chốt chuẩn');
  },
  streakTip() { return Math.min(0.05, 0.01 * G.state.haggle.streak); } // +1%/lần chốt chuẩn liên tiếp, trần 5%
};
```
- `makeCommission` lưu thêm `baseBudget = budget`, `qualityBase = quality`, `quote = 1`.
- `scoreJob`: trả khi thành công `com.budget` (+ tip 15% như cũ, + `streakTip` × budget); **khi hỏng tính trên `baseBudget`** (`0.5/0.3` business, `0.6/0.4` cozy) — hét giá rồi may hỏng là thiệt thật.
- Sổ ghi giá: `s.haggle.notes[clientId] = { lastQ, result }` → lần sau dial hiện chấm nhỏ "lần trước: 115% chốt chuẩn" (Moonlighter notebook [4]).

### 2.3 UI (modal, 1280×720)
```
nền tối 30% + hit nền (đóng = huỷ)
card(330, 140, 620, 420)
  title "Báo giá cho {client}"                          (356, 178)
  "Khách đề nghị {baseBudget} xu · yêu cầu chất lượng gốc {qualityBase}"   (356, 206, soft)
  thanh nấc: 11 ô tròn x = 372 + i*52, y = 270 (r 16); ô đang chọn đặc màu accent; nhãn % dưới (y 300)
  nút "−" (356,254,32,32)  "+" (912,254,32,32)  — phím ←/→ cũng đổi nấc
  dòng lớn: "{q%} = {budget} xu"   (640, 350, SERIF 30, center)
  dòng: "Khách sẽ đòi chất lượng ≥ {quality}"  (màu bad nếu > chất lượng trung bình 5 áo gần nhất của bạn + 5)
  gợi ý nhỏ: "Chất lượng trung bình 5 áo gần đây: {avgQ}"   ← giúp người chơi tự lượng sức
  chuỗi: "✨ Chốt chuẩn liên tiếp: {streak} (+{streak}% tiền công)"
  bong bóng phản ứng (sau khi chốt): card(356, 410, 568, 70) chữ nghiêng
  nút: [Chốt giá] primary-nhỏ (760, 498, 164, 44) · [Đúng giá đề nghị] ghost (580, 498, 170, 44)
       sau khi khách trả giá: [Đồng ý {x} xu] / [Thôi, giá gốc]
```
Khi đã chốt → `G.startJob(); G.go('measure')` như cũ. Phiếu đặt may (`U.commission`) hiện "Giá đã chốt: 504 xu (120%)".

### 2.4 Cân bằng (kiểm với simbot)
- Người giỏi (chất lượng ~88): chọn ~115–120% → +15–20% doanh thu, kỳ vọng +6–8 chất lượng vẫn đạt. Người trung bình (~75): nếu chọn 100–105% gần như không đổi; tham 120% → tỉ lệ hỏng tăng → lỗ. Người ẩu: tham giá → phá sản sớm hơn. **Đây là mục đích: nới khoảng cách kỹ năng cho cạnh tranh, không làm người trung bình khổ hơn nếu họ báo giá vừa sức.**
- Mục tiêu simbot 60 ngày (bot báo `q = clamp(1 + (skill − 0.7) × 1.2, 0.95, 1.25)` làm tròn nấc): giỏi **22–25k**, trung bình **8–13k**, ẩu vẫn phá sản **ngày 40–60**. Nếu giỏi > 26k: hạ hệ số kỳ vọng `40 → 50`.

### 2.5 Theo chế độ
- **Kinh doanh**: đầy đủ. **Thong thả**: đầy đủ nhưng hỏng không có hậu quả gì thêm (đã vậy). **Thử thách tuần**: đầy đủ, trần seeded theo `(seed, client, day)` → cùng tình huống cho mọi người. **Đơn ngày**, **ch0_batu**, đơn "may y chang": `flags.noHaggle` (bảng báo giá bỏ qua).

---

## 3. F2 — Ghế chờ

### 3.1 Trải nghiệm
Mỗi sáng (ngày mới), chuông reo 1–3 lần, khách ngồi lên **ghế chờ** trước quầy. Mỗi phiếu chờ cho xem: chân dung nhỏ, tên, ♥, đề nghị xu, 1 dòng yêu cầu chính, **⌛ kiên nhẫn** (số ngày). Bấm một phiếu → khách bước tới quầy (luồng cũ). Ở quầy: **"Để sau"** (về ghế, không mất ngày) · **"Từ chối"** (khách đi, không mất ngày). Khi ghế trống hết hoặc không muốn nhận ai: **"Đóng cửa sớm"** → `G.econ.advanceDay()` (như "Từ chối" cũ).
Sang ngày mới: khách chưa phục vụ `patience−1`; hết kiên nhẫn → *"Chị Vy sang Siêu Tốc 24h rồi…"* (đếm `econ.lostToRival`, báo có thể đưa tin). Ghế trống được lấp đầy. **Không làm mới trong ngày** → không câu khách vô hạn.

### 3.2 Dữ liệu
```js
s.bench = { day: 0, seats: [ /* { com, patience, arrived, held } */ ], lost: 0 };
G.bench = {
  size() { return 2 + (G.state.front.seat ? 1 : 0); },                  // F4 "Ghế chờ & bình trà đá"
  patience() { return G.state.mode === 'cozy' ? 99 : 2 + (G.state.front.fan ? 1 : 0); },
  refill() {                       // gọi ở desk.enter; chỉ chạy khi bench.day !== s.day
    const s = G.state, b = s.bench; if (b.day === s.day || s.isDaily) return [];
    const left = [];
    for (const st of b.seats) { if (st.held) continue; if (--st.patience <= 0) left.push(st); }
    b.seats = b.seats.filter((st) => !left.includes(st));
    // hàng đợi cốt truyện/arc/sự kiện: không chiếm ghế, kiên nhẫn ∞, gắn nhãn "Hẹn trước"
    while (s.story.queue.length) b.seats.unshift({ com: G.story.nextVisit({ queueOnly: true }), patience: 99, held: true, appt: true });
    let i = 0;
    while (b.seats.filter((x) => !x.appt).length < this.size()) {
      const rng = G.econ.rng('bench|' + i++, s.day);                       // seeded: challenge giống nhau
      b.seats.push({ com: G.story.nextVisit({ rng, noQueue: true }), patience: this.patience(), arrived: s.day });
    }
    b.day = s.day; b.lost += left.length; G.save();
    return left;                                                           // desk hiện toast cho từng người bỏ đi
  },
  take(i) { const st = G.state.bench.seats.splice(i, 1)[0]; G.state.commission = st.com; return st; },
  putBack(st) { G.state.bench.seats.unshift(Object.assign(st, { com: G.state.commission })); G.state.commission = null; }
};
```
- `G.story.nextVisit(opts)` cần nhận `rng`, `queueOnly`, `noQueue` (tách bước hàng đợi và bước khách thường hiện có).
- `s.commission` vẫn là **một** đơn đang làm → mọi scene cũ không đổi.

### 3.3 UI (desk khi quầy trống)
```
Gỗ quầy y 520–720 giữ nguyên.
Phiếu chờ: tối đa 4 (1 hẹn trước + 3 ghế), w 270, h 150, x = 30 + i*284, y = 548
  khung chân dung 70×90 (x+10, y+12) — vẽ G.art.garment thu nhỏ, cắt nửa trên
  tên + ♥ (x+92, y+28)   "Đề nghị {budget} xu" (x+92, y+52, gold)
  1 yêu cầu đầu (fitText x+92, y+76, w 168)   ⌛ "Chờ thêm {patience} ngày" (x+92, y+100; đỏ nếu 1)
  nhãn góc "Hẹn trước" (ruy băng hồng) cho appt; viền đỏ nhấp nháy nếu patience = 1
  hover: nâng 4 px; bấm: khách đi tới quầy
Chuông chuyển sang (1180, 470) nhỏ hơn, chỉ để trang trí/âm thanh.
Nút secondary "Đóng cửa sớm" (G.W−420, G.H−66) · nút "May áo bán sẵn" (F5) (G.W−604, G.H−66)
Hint: "Chọn một khách để mời vào quầy · khách chờ quá lâu sẽ sang tiệm Kevin"
```

### 3.4 Cân bằng
Chọn tốt nhất trong 2–3 khách: +~25 xu/đơn (ngân sách dao động 0–80) và tránh đơn khó → +5% doanh thu người giỏi, +8% người trung bình (né đơn vượt sức). Mất khách chỉ là cơ hội, không phạt tiền. Simbot: bot chọn ghế có `budget − 4 × độ khó` cao nhất (độ khó = số yêu cầu).

### 3.5 Theo chế độ
Kinh doanh: như trên. Thong thả: kiên nhẫn ∞, không ai bỏ đi. Thử thách: seeded theo `(seed, day, slot)`; vì lựa chọn khác nhau nên ghế sau có thể khác — chấp nhận (vẫn cùng phân phối). Đơn ngày: không có ghế.

---

## 4. F3 — Thợ phụ

### 4.1 Trải nghiệm
Tab **"Thợ phụ"** trong Xưởng (sau tab "Dụng cụ" của kỹ sư). Thuê **một** thợ phụ một lúc. Thợ phụ:
1. **May lại đường hỏng**: ở màn may, sau khi bạn may một đường, nút **"🧑‍🔧 Nhờ {tên} may lại"** thay điểm đường đó bằng tay nghề thợ phụ. Mỗi áo được nhờ tối đa `maxSeams` đường. Bạn vẫn phải tự may trước — vòng may không bị thay thế.
2. **Việc vặt**: mỗi ngày tiệm mở cửa, thợ phụ lên lai, sửa đồ → `side` xu/ngày (cộng khi `advanceDay`).
3. **Lương** trả cuối tháng cùng hoá đơn. Thiếu tiền → nợ như tiền thuê; tháng có nợ thì thợ phụ "nghỉ không lương" (không giúp, không việc vặt); 2 tháng liền → nghỉ việc, để lại thư.

### 4.2 Dữ liệu
```js
// js/content/biz.js
G.HELPERS = {
  na:  { name: 'Bé Na',   role: 'sinh viên năm hai trường may', rank: 2, wage: 180, skill: 0.80, maxSeams: 2, side: 15,
         look: { hair: 'long', bow: '#f08bb0' }, skin: '#f5d9c2', outfit: ['voan', 'hongphan'], bust: 80, waist: 60, hip: 86,
         hire: 'Dạ em chào anh/chị! Em may chưa giỏi nhưng em chăm lắm, lương sao cũng được… à mà đừng ít quá nha.',
         lines: ['Hôm nay em lên lai được ba cái quần tây đó!', 'Anh/chị may đường này đẹp ghê, em chụp hình học nha.', 'Em đặt tên cái máy may là "Bé Bướm".'] },
  teo: { name: 'Anh Tèo', role: 'cựu thợ xưởng may Gò Vấp', rank: 4, wage: 320, skill: 0.87, maxSeams: 3, side: 30, male: true,
         look: { hat: 'beanie', beard: 'stubble' }, skin: '#dcb08c', outfit: ['dui', 'reu'], bust: 94, waist: 82, hip: 94,
         hire: 'Anh may đồ hàng loạt hai chục năm. Áo dài thì… anh học. Đường thẳng thì cứ để anh.',
         lines: ['Đường may này anh may lại rồi, thẳng như đường ray.', 'Khách sửa quần trả thêm hai chục, anh bỏ vô hộp rồi nha.'] },
  ut:  { name: 'Cô Út',   role: 'người từng phụ Bà Tư ba mươi năm', rank: 6, wage: 480, skill: 0.93, maxSeams: 4, side: 40, ironBonus: 2,
         look: { hair: 'bun', hairCol: '#9c958e', glasses: 'round' }, skin: '#e3bd9a', outfit: ['lua', 'be'], bust: 88, waist: 74, hip: 94,
         hire: 'Bà Tư gọi cô lên. Cô không nói nhiều đâu, cô may thôi.',
         lines: ['Bà Tư hồi xưa cũng hay quên ủi cổ áo như con.', 'Mũi kim chậm một chút, áo đẹp thêm một chút.'] }
};
// side thực tế = side × (1 + 0.1 × hạng)   ·   ironBonus: +2 chất lượng nếu chưa có bàn ủi (tools.iron = 0)
s.staff = { id: null, since: 0, unpaid: 0, helped: 0, earned: 0, quitLetters: [] };
```
- Màn may: điểm đường nhờ thợ = `skill × (0.97 + rng×0.03)`, độ cong đường (nếu seam có `curve`) × 0.95; đánh dấu `sd[i].byHelper = true`, vẽ chỉ màu khác (xám xanh) và nhãn "Na may". Nút "Nhờ…" đặt dưới nút "✂ Tháo chỉ" (x+24, y 486, 302×46), hiện khi đường đã may, `score < skill`, còn lượt.
- Nhân vật dùng renderer khách → desk có thể vẽ thợ phụ đứng góc phải quầy (x 1050) với bong bóng `lines` mỗi ngày.
- Mini-arc Bé Na: sau 3 tháng làm việc, Na xin nghỉ đi học thiết kế ở Đà Lạt (thư cảm ơn + tặng 200 cm `voan.hongphan.tron`) → mở slot thuê lại.

### 4.3 UI tab "Thợ phụ" (trong `G.scenes.workshop`)
```
3 thẻ ứng viên card(60 + i*400, 140, 380, 440)
  chân dung toàn thân (vẽ như desk.figure, z 2.4, khung 380×220)
  tên, vai trò; "Lương {wage} xu/tháng" (gold) · "Việc vặt ~{side×(1+0.1r)} xu/ngày"
  "May lại tối đa {maxSeams} đường/áo · tay nghề {skill×100}%"
  câu hire (nghiêng, wrap)
  nút [Thuê] (khoá + "Mở ở hạng {rank}") / [Đang làm việc ✓] + [Cho nghỉ] (ghost)
Dòng chân: "Lương trả cuối tháng cùng tiền mặt bằng. Tháng còn nợ, thợ phụ nghỉ không lương."
```

### 4.4 Cân bằng
Ròng/tháng (lương − việc vặt): Na ở hạng 3 ≈ −80, Tèo ở hạng 5 ≈ −95, Út ở hạng 7 ≈ −140. Lợi ích: người chơi trung bình có 1–2 đường dưới 60%/áo → sửa 2–3 đường đưa chất lượng +4…+8 → cứu ~1 đơn hỏng/tháng (≈ +0.5 × 445 = +220 xu ở hạng 5) + thêm ♥/báo. ⇒ **Có lời với người trung bình, hoà/lỗ nhẹ với người giỏi**, giúp người ẩu sống lâu hơn (mục tiêu simbot: ẩu + Tèo trụ thêm 10–20 ngày, không thành giàu).
`G.econ.bill()` thêm `staff: wage` vào `total`; ledger hiện dòng "Lương thợ phụ".

### 4.5 Theo chế độ
Kinh doanh: như trên. Thong thả: không hoá đơn → lương trừ thẳng cuối tháng nếu đủ tiền, thiếu thì thợ vẫn làm (không nợ). Thử thách: được thuê (chiến thuật), hạng mở khoá như thường. Đơn ngày: không có thợ phụ (sandbox).

---

## 5. F4 — Mặt tiền tiệm & vay vốn

### 5.1 Đồ mặt tiền (tab "Mặt tiền" trong Xưởng)
Một lần mua (vài món 2 cấp). Một số món **tăng tiền mặt bằng** ("tiệm đẹp hơn, chủ nhà tính thêm").
```js
G.FRONT = {
  sign:    { name: 'Bảng hiệu', levels: [
             { name: 'Bảng gỗ cũ của bà', price: 0 },
             { name: 'Bảng hiệu sơn tay', price: 300, budget: 0.04, desc: 'Khách đi ngang thấy tên tiệm: ngân sách +4%.' },
             { name: 'Bảng hiệu đèn LED', price: 650, budget: 0.08, rent: 30, rank: 4, desc: 'Sáng cả hẻm: ngân sách +8%. Mặt bằng +30 xu/tháng.' } ] },
  seat:    { name: 'Ghế chờ & bình trà đá', levels: [{ price: 0 }, { name: 'Băng ghế gỗ + bình trà đá', price: 250, seats: 1, desc: 'Thêm 1 chỗ ngồi chờ.' }] },
  fan:     { name: 'Quạt trần', levels: [{ price: 0 }, { name: 'Quạt trần ba cánh', price: 200, patience: 1, util: 10, desc: 'Khách chờ thêm được 1 ngày. Điện +10 xu/tháng.' }] },
  fitting: { name: 'Phòng thử đồ', levels: [{ price: 0 }, { name: 'Rèm nhung + gương đứng', price: 600, fit: 0.05, bond: 2, rent: 20, rank: 3, desc: 'Thử áo trước khi giao: vừa người +5%, ♥ +2 mỗi lần giao. Mặt bằng +20.' }] },
  window:  { name: 'Tủ kính mặt tiền', levels: [{ price: 0 }, { name: 'Tủ kính trưng áo', price: 700, newBudget: 0.06, fair: 0.1, star: 0.05, rank: 3, desc: 'Trưng áo đẹp nhất album: khách mới (♥0) trả +6%, sạp hội chợ +10%, khách sao +5%.' }] },
  stall:   { name: 'Sạp hội chợ', levels: [{ price: 0, rack: 3 }, { name: 'Sạp gấp + móc treo', price: 400, rack: 5, desc: 'Treo được 5 áo bán sẵn (thay vì 3).' }] }
};
s.front = { sign: 0, seat: 0, fan: 0, fitting: 0, window: 0, stall: 0 };
```
Áp dụng (một chỗ duy nhất `G.front.mods()` trả `{ budget, newBudget, seats, patience, fit, bond, rent, util, fair, star, rack }`):
- `makeCommission`: `bonus += mods.budget + (lvl === 0 ? mods.newBudget : 0)` (vẫn trong trần +50%).
- `bench.size/patience` (F2), `finish`: `j.fit = min(1, j.fit + mods.fit)` trước `scoreJob`, `bond.add(+mods.bond)`.
- `econ.bill`: `rent += mods.rent`, `util += mods.util`.
- Tủ kính: desk vẽ áo chất lượng cao nhất trong album (z nhỏ, khung kính ở x 1020–1240, y 190–480) khi quầy trống.

### 5.2 Hoàn vốn (hạng 5, ~5 đơn/tháng × 445 xu)
| Món | Giá | Lợi/tháng | Hoàn vốn |
|---|---|---|---|
| Bảng sơn tay | 300 | +4% ≈ +89 | ~3.4 tháng |
| Bảng LED (thêm) | 650 | +4% − 30 ≈ +59 | ~11 tháng (xa xỉ cuối game) |
| Ghế chờ | 250 | chọn khách tốt hơn ≈ +40 | ~6 tháng |
| Quạt | 200 | ít mất khách, −10 điện | tiện nghi |
| Phòng thử | 600 | +1 chất lượng (fit 20% × 5%) + ♥ ≈ +30–60 | ~12 tháng (giá trị là ♥) |
| Tủ kính | 700 | +6% khách mới + sạp ≈ +80 | ~9 tháng |
| Sạp lớn | 400 | +2 áo/tháng ở hội chợ ≈ +150 lãi | ~3 tháng (nếu dùng F5) |

### 5.3 Tài sản trong Giá trị tiệm (bắt buộc cho cạnh tranh)
Hiện `netWorth = coins + vải×50% + prestige×40 − nợ` → mua dụng cụ/mặt tiền **làm tụt điểm**, nên người chơi tối ưu sẽ không đầu tư. Sửa:
```js
G.econ.assets = function () {          // tính từ cấp đang có, không cần lưu thêm
  const s = G.state; let v = 0;
  for (const k in G.DATA.tools) for (let l = 1; l <= (s.tools[k] || 0); l++) v += G.DATA.tools[k].levels[l].price;
  for (const k in G.FRONT) for (let l = 1; l <= (s.front[k] || 0); l++) v += G.FRONT[k].levels[l].price;
  return Math.round(v * 0.6);          // khấu hao 40%
};
// netWorth = coins + stock + prestige*40 + assets − debt − loan.left
```
Ledger thêm dòng "Dụng cụ & mặt tiền (khấu hao)". Simbot phải chạy lại (giá trị tăng ~ +600–2000 ở người có đầu tư).

### 5.4 Vay ngân hàng (tab "Vay vốn")
- Mở ở hạng 3, **chỉ một khoản một lúc**: 1.000 hoặc 2.000 xu, lãi 4%/tháng trên dư nợ, trả góp 6 tháng (gốc/6 + lãi) cộng vào hoá đơn tháng. Không trả được → thành nợ thường (8%).
- So với Bà Tư: Bà Tư chỉ **cứu phá sản** một lần (giữ nguyên). Tab hiện dòng của Bà Tư: *"Vay ngân hàng thì nhớ trả đúng hạn nghe con. Bà không có hụi đâu."*
```js
s.loan = { left: 0, monthly: 0, months: 0 };   // bill(): loan = monthly + round(left*0.04); sau settle: left −= monthly
```
- Thử thách tuần (6 tháng): khoản vay **phải trả hết trước ngày 30** (tháng cuối tự trừ phần còn lại) → không thể "vay để tăng điểm".

### 5.5 UI tab "Mặt tiền"
Lưới 3×2 thẻ 380×200 (x 60 + i*400, y 140/360): tên, cấp hiện tại → cấp sau, giá, `desc`, dòng đỏ nhỏ nếu có `rent/util`, nút [Mua {price} xu] (khoá theo hạng). Góc phải trên: "Giá trị tài sản: {assets} xu".

### 5.6 Theo chế độ
Kinh doanh: đầy đủ. Thong thả: không có tiền thuê → `rent/util` bỏ qua, vay vốn ẩn. Thử thách: đầy đủ, `s.front` bắt đầu từ 0 (save riêng).

---

## 6. F5 — Sạp hội chợ cuối tháng (áo may sẵn)

### 6.1 Trải nghiệm
Ở quầy (khi chưa có khách tại quầy), nút **"May áo bán sẵn"** → vòng may đầy đủ nhưng *tự do*: không yêu cầu, không đo (cỡ M chuẩn, `fit = 0.9`), vào thẳng Sổ phác thảo. Giao xong → áo treo lên **sạp** (tối đa 3, hoặc 5 với "Sạp gấp"). **Tốn một ngày** như một đơn (khách trên ghế chờ mất kiên nhẫn) → phải cân nhắc.
Ngày cuối mỗi tháng, **trước khi trả hoá đơn**: **"Hội chợ phố đi bộ"**. Người chơi gắn giá cho từng áo (cùng thanh nấc của F1, 80%–150% *giá trị ước tính*), bấm "Mở sạp" → 8 người qua đường lần lượt ghé (0.6 s/người, toast + mặt cười/nhăn), mua hoặc chê. Áo không bán được ở lại, mất 10% giá trị mỗi tháng ("lỗi mốt").

### 6.2 Giá trị và người mua
```js
// js/fair.js
G.fair = {
  value(it) {                                  // Dressmaker: vải + công × chất lượng × uy tín [10]
    const r = G.rank(), trend = G.state.press.trend;
    const labor = 120 + 15 * r;
    const trendMul = trend && it.tags[trend.tag] >= 50 ? 1.25 : 1;
    const mods = G.front.mods();
    return Math.round((it.matCost + it.decorCost + labor) * (0.55 + it.quality / 100) * trendMul * (1 + mods.fair) * Math.pow(0.9, it.age));
  },
  run(m) {                                      // seeded → challenge giống nhau
    const rng = G.econ.rng('fair', m), rack = G.state.rack, log = [];
    const buyers = 6 + Math.floor(rng() * 5);  // 6–10 người
    for (let b = 0; b < buyers; b++) {
      const wtp = 0.85 + rng() * 0.45;          // sẵn lòng trả 85–130% giá trị
      let best = null, gap = 0;
      for (const it of rack) if (!it.sold) { const g = wtp * G.fair.value(it) - it.price; if (g >= 0 && g >= gap) { best = it; gap = g; } }
      const near = rack.filter((it) => !it.sold).sort((a, b) => a.price / G.fair.value(a) - b.price / G.fair.value(b))[0];
      if (best) { best.sold = true; log.push({ b, it: best, say: G.rpick(rng, G.FAIR_LINES.buy) }); }
      else if (near) log.push({ b, it: near, say: G.fair.react(near.price / G.fair.value(near), rng) });
    }
    return log;
  },
  react(ratio, rng) { return G.rpick(rng, ratio > 1.21 ? G.FAIR_LINES.robbery : ratio > 1.05 ? G.FAIR_LINES.pricey : G.FAIR_LINES.browse); }
};
G.FAIR_LINES = {
  buy: ['Ui, áo này đẹp quá, chị lấy liền!', 'Mua tặng mẹ nè!', 'Cái này lên hình chắc đẹp lắm.', 'Gói giùm em, khỏi thối.'],
  browse: ['Đẹp mà… để chị đi vòng vòng đã.', 'Hôm nay chưa có dịp mặc, tiếc ghê.'],
  pricey: ['Hơi chát nha em.', 'Giá này chắc chị phải về hỏi chồng.'],
  robbery: ['Trời đất, giá này mua được chiếc xe đạp!', 'Cắt cổ quá em ơi!']
};
s.rack = [];   // { snapId, matCost, decorCost, quality, tags, price, age, sold }
s.fair = { lastMonth: -1, notes: [] /* {ratio, sold} → hiện "lần trước 115%: bán được" */ };
```
- Giá ước tính hiển thị cho người chơi = `value` làm tròn 10, kèm *"Hợp mốt ✓"* khi trúng dự báo gu (Báo Trà Đá) → người chơi có lý do đọc báo và **may đúng gu trước hội chợ**.
- Bán xong: tiền vào `G.addCoins` (đếm vào thu của tháng), mỗi áo bán được +0.25 danh tiếng; ≥ 3 áo bán → Báo Trà Đá: *"Sạp {shop} cháy hàng ở phố đi bộ!"*; 0 áo → *"Sạp {shop}: áo đẹp, giá… cũng đẹp"*.
- Album lưu áo may sẵn với `kind: 'rack'` (tem "Bán sẵn").

### 6.3 Gắn vào luồng tháng
- `G.econ.advanceDay()`: tại ranh giới tháng, nếu `rack` có áo chưa bán và `fair.lastMonth < m` → **không settle ngay**: `e.fairPending = m`, return `{ fair: true }`. `desk.enter`: nếu `fairPending !== null` → `G.go('fair')`. Màn fair xong → `G.econ.settle(m)` rồi về quầy (hộp thoại hoá đơn như cũ). Sạp trống → settle như cũ.
- Thong thả: không có hoá đơn nhưng hội chợ vẫn chạy (ranh giới tháng tính bằng `s.day`); gọi `G.fair` từ `G.cal` thay vì `settle`.

### 6.4 Luồng may áo bán sẵn
- `G.startRack({ male })`: `s.commission = G.makeCommission({ client: 'manocanh', kind: 'rack', reqs: [], quality: 0, flags: { noHaggle: true } })` với NPC `manocanh` ("Ma-nơ-canh của tiệm", số đo 84/66/90; bản nam 94/80/94) → `G.startJob(); j.fit = 0.9; G.go('sketch')`.
- `finish`: nhánh `kind === 'rack'` → không tiền, không ♥, không báo (trừ dòng "Đã treo lên sạp"), push `s.rack` (matCost = Σ m × `G.econ.price` lúc mua, lấy từ `G.fabricNeed`; decorCost = tổng giá trang trí), `advanceDay()`.
- Nút bị khoá khi sạp đầy: "Sạp đầy (3/3) · chờ hội chợ cuối tháng".

### 6.5 UI màn "Hội chợ" (`scenes/fair.js`)
```
nền: U.bg + dải đèn lồng (vòng tròn màu ấm dọc y 70, procedural đơn giản) + chữ "HỘI CHỢ PHỐ ĐI BỘ · THÁNG {m}"
5 cột áo x = 80 + i*230, y 120–470: ma-nơ-canh (G.art.garment, z vừa khung 200×330), thẻ giá treo (card nhỏ 120×44 xoay −3°)
dưới mỗi áo (y 490): "Giá trị ~{value}" · nút − / + (nấc 5%, 80–150%) · "{price} xu ({%})" · ghi chú lần trước
khi chạy: người qua đường = chữ + mặt emoji 😊/😐/😬 trượt từ trái sang (y 620), bong bóng lời; áo bán đóng dấu "ĐÃ BÁN" đỏ
cuối: tổng thu, danh tiếng; primary "Dọn sạp → trả tiền tháng"
```

### 6.6 Cân bằng
Hạng 5, áo lụa q88: (77 + 40 + 195) × 1.43 ≈ **446**; trúng gu ×1.25 ≈ 558. Đặt giá 110% → xác suất bán mỗi người ~44% → gần như chắc bán với 6–10 người. Lãi ròng ≈ 446 − vải/trang trí 117 ≈ **330/ngày may** — ngang một đơn khách (≈ 445 − 150 = 295) nhưng **không có tip, ♥, báo đẹp**, và tốn ngày khiến khách ghế chờ bỏ đi. ⇒ Hợp lý khi: dùng vải tồn (đang chỉ tính 50% trong Giá trị tiệm), trúng dự báo gu, hay tháng "Mùa mưa, hẻm vắng". Trần 3–5 áo/tháng chặn lạm dụng. Mục tiêu simbot: bot giỏi + sạp ≤ +10% so với không sạp.

### 6.7 Theo chế độ
Kinh doanh: đầy đủ. Thong thả: đầy đủ (không áp lực). Thử thách: đầy đủ, người mua seeded theo `(seed, month)`. Đơn ngày: ẩn.

---

## 7. F6 — Bảng xếp hạng hẻm & tiệm bóng

### 7.1 Trải nghiệm
- **Sổ sách → tab "Bảng hẻm"**: xếp hạng *Giá trị tiệm* hiện tại của bạn với 5 tiệm trong hẻm (và về sau: tiệm thật của người chơi khác).
- **Báo Trà Đá mỗi đầu tháng**: hộp **"TOP TIỆM HẺM CHỈ HỒNG · THÁNG {m}"** (top 5, mũi tên ▲▼ so tháng trước). Vượt Kevin lần đầu → hôm sau Kevin ghé: *"Ủa, tiệm em vượt Siêu Tốc rồi hả? Ok… anh đi mua thêm máy."*
- **Thử thách tuần**: tiệm bóng chạy *cùng seed* → so ngay từng tháng; màn kết thúc ledger hiện "Bạn đứng thứ {k}/6 · hơn Kevin {x} xu". Kỷ lục tuần trước của chính bạn cũng là một bóng ("Bạn · lần chơi trước").

### 7.2 Dữ liệu tiệm bóng
Đường cong lấy **trực tiếp từ simbot** (chạy offline, dán mảng vào file) → đúng kinh tế thật.
```js
// js/content/rivals.js — worth tại cuối mỗi tháng (ngày 5,10,…,60). Engineer tạo bằng tools/simbot.js:
//   for (const p of PROFILES) out[p.id] = monthEnds(simEconomy(p.skill, p.care, 60))   (trung bình 5 lần chạy)
G.RIVALS = [
  { id: 'kevin',  name: 'Áo Dài Siêu Tốc 24h', owner: 'Kevin Khải', skill: 0.70, care: 0.9, curve: [/* 13 số */] },
  { id: 'coba',   name: 'Tiệm Cô Ba Lụa',      owner: 'Cô Ba',      skill: 0.88, care: 0.8, curve: [] },  // khó vượt
  { id: 'bong',   name: 'Áo Dài Bống',         owner: 'Chị Bống',   skill: 0.78, care: 0.6, curve: [] },
  { id: 'ongsau', name: 'Nhà May Ông Sáu',     owner: 'Ông Sáu Kéo Vàng', skill: 0.65, care: 0.7, curve: [] }, // ông nội Kevin, chậm mà chắc
  { id: 'tun',    name: 'Tiệm Mới Của Tũn',    owner: 'Tũn',        skill: 0.55, care: 0.4, curve: [] }   // hay "phá sản" (curve về 0, rồi mở lại)
];
G.rivals = {
  worth(r, day) {                                   // nội suy + nhiễu seeded ±8% theo (seed, rival, month)
    const k = (day - 1) / 5, i = Math.min(r.curve.length - 2, Math.floor(k)), t = k - i;
    const base = r.curve[i] + (r.curve[i + 1] - r.curve[i]) * t;
    const n = 0.92 + 0.16 * G.econ.rng('rival|' + r.id, Math.floor(k))();
    return Math.round(base * n * G.rivals.marketMul(Math.floor(k)));
  },
  marketMul(m) { const b = G.econ.market(m).budget; return b ? 0.97 + (b - 1) * 0.5 : 1; }, // tháng xấu kéo cả hẻm xuống
  board() { /* [{name, worth, you?}] sắp xếp giảm dần, gồm bạn + G.RIVALS + ghosts từ G.net */ }
};
s.econ.worthLog = [];  // giá trị tiệm tại mỗi lần settle → để vẽ đường của bạn và gửi khi có backend
```
- Thử thách 30 ngày dùng 7 điểm đầu của `curve` (đã gồm tháng 0 yên ả).
- Vẽ ở tab "Bảng hẻm": biểu đồ đường 6 tiệm (màu bạn = accent, Kevin = `#6b5bb8`, khác = xám nhạt) theo tháng, bảng xếp hạng bên phải.

### 7.3 Online về sau (qua `G.net`, stub giữ nguyên hành vi offline)
```js
// net.js — mở rộng chữ ký hiện có
async submitChallenge({ week, worth, days, bankrupt, worthLog, shopName })  // + worthLog (≤ 7 số)
async challengeBoard(week, { limit = 20 } = {}) → [{ name, worth, worthLog }]  // stub: []
async alleyBoard(month) → [{ name, worth }]                                   // stub: [] (bảng hẻm cho chế độ Kinh doanh, theo "mùa")
```
- Khi có dữ liệu thật: `board()` chèn tối đa 5 tiệm người chơi gần điểm bạn nhất (trên/dưới) làm **tiệm bóng**, đánh dấu 👤.
- Supabase: thêm cột `worth_log int[]` vào bảng `challenge_scores (week, owner, worth, days, bankrupt, worth_log, created_at)`; chống gian lận: kiểm `worth_log` tăng không quá trần lý thuyết/ngày (ví dụ ≤ 1.6 × ngân sách tối đa × 5 + bán sạp), lần nộp đầu là chính thức, xếp hạng tuần reset thứ Hai.

### 7.4 Theo chế độ
Kinh doanh: bảng hẻm theo ngày đã chơi. Thong thả: ẩn tab (không có Giá trị tiệm cạnh tranh) — hoặc hiện "Tiệm bạn" vui không xếp hạng. Thử thách: trọng tâm.

---

## 8. Ảnh hưởng tổng hợp theo chế độ

| | Kinh doanh | Thong thả | Thử thách tuần | Đơn ngày |
|---|---|---|---|---|
| F1 Báo giá | ✅ | ✅ (hỏng không phạt thêm) | ✅ trần seeded | ✗ |
| F2 Ghế chờ | ✅ kiên nhẫn 2(+1) | ✅ kiên nhẫn ∞ | ✅ seeded theo ngày/ghế | ✗ |
| F3 Thợ phụ | ✅ lương vào hoá đơn | ✅ trả nếu đủ tiền | ✅ | ✗ |
| F4 Mặt tiền | ✅ + tiền thuê | ✅ bỏ tiền thuê, ẩn vay | ✅ vay phải trả hết | ✗ |
| F5 Hội chợ | ✅ trước hoá đơn | ✅ | ✅ người mua seeded | ✗ |
| F6 Bảng hẻm | ✅ | ẩn | ✅ trọng tâm | ✗ |

Trao đổi vải giữa người chơi (để sau): chỉ làm khi có backend (bảng `fabric_offers`, giao dịch phía server, giới hạn 1 m/ngày, không áp dụng ở Thử thách). Không làm "mã quà" offline vì nhân bản được.

---

## 9. Trạng thái & migration (`v: 3 → 4`)
```js
// newState() thêm
haggle: { streak: 0, pins: 0, notes: {} },
bench:  { day: 0, seats: [], lost: 0 },
staff:  { id: null, since: 0, unpaid: 0, helped: 0, earned: 0 },
front:  { sign: 0, seat: 0, fan: 0, fitting: 0, window: 0, stall: 0 },
loan:   { left: 0, monthly: 0, months: 0 },
rack: [], fair: { lastMonth: -1, notes: [] },
// econ thêm: worthLog: [], lostToRival: 0, fairPending: null
```
- `G.load`: thêm `'haggle','bench','staff','front','loan','fair'` vào danh sách key gộp mặc định (dòng `for (const k of [...])`).
- `G.migrate4(s)`: nếu `s.commission` đang có → giữ nguyên (khách đang ở quầy), gán `baseBudget = budget`, `qualityBase = quality`, `quote = 1`; `bench.day = s.day` (không đổ khách mới ngay hôm đang dở); `s.v = 4`.
- Thử thách tuần đang chạy dở (save `aodai_challenge_v1`): migrate như trên; bảng xếp hạng tuần đó đánh dấu "bản cũ" (không so với ghost).

---

## 10. Kế hoạch triển khai (theo thứ tự)

**M1 — Mặt tiền + tài sản + vay (nền cho các phần sau)** · *1 phiên*
- Mới `js/content/biz.js` (`G.FRONT`, `G.HELPERS`, `G.FAIR_LINES`), `js/front.js` (`G.front.mods/buy`).
- Sửa `economy.js`: `bill()` + `rent/util/staff/loan`, `assets()`, `netWorth()` mới, `worthLog` push trong `settle`, vay (`G.econ.borrow(n)`, trả góp trong `settle`).
- Sửa `G.scenes.workshop` (của kỹ sư): thêm `this.tab` ∈ `tools | front | staff | loan`; dải tab 4 nút ở y 70 (x 40 + i*170, 160×36). Tab `staff` để trống tới M3.
- Sửa `state.js`: newState/migrate4/load keys; `makeCommission` cộng `mods.budget/newBudget`; ledger thêm dòng tài sản, lương, góp vay.
- Simbot: chạy lại, ghi bảng kết quả vào README.

**M2 — Báo giá** · *1 phiên*
- Mới `js/haggle.js`, modal trong `desk.js` (`this.quote` state + `quotePanel(c)` như `giftPanel`), phím ←/→/Enter.
- Sửa `makeCommission` (baseBudget/qualityBase), `scoreJob` (thất bại tính trên `baseBudget`, `streakTip`), `ui.js commission()` hiện giá đã chốt.
- Simbot: `botPlay` gọi `G.haggle.apply(com, botQuote(skill))`.

**M3 — Thợ phụ** · *1 phiên*
- Mới `js/staff.js` (`hire/fire/dailySide/helpSeam/onSettle`), tab `staff` trong workshop.
- Sửa `sew.js`: nút "Nhờ … may lại" dưới nút tháo chỉ; `sd[i].byHelper`; vẽ chỉ màu `#6f8fa0`.
- Sửa `economy.js advanceDay` (cộng `side` khi ngày trôi và thợ không nghỉ), `settle` (unpaid/quit + thư).
- Desk: vẽ thợ phụ ở góc phải với 1 câu `lines`/ngày.

**M4 — Ghế chờ** · *1–2 phiên*
- Mới `js/bench.js`; sửa `story.js nextVisit(opts)` (tách queue/thường, nhận `rng`).
- Sửa `desk.js`: thay chuông bằng phiếu chờ khi quầy trống; "Để sau"/"Từ chối"/"Đóng cửa sớm"; toast khách bỏ đi; `enter()` gọi `G.bench.refill()`.
- Kiểm: chương truyện (`walkIn`, hẹn trước) vẫn hiện đúng; đơn ngày bỏ qua ghế.

**M5 — Sạp hội chợ** · *1–2 phiên*
- Mới `js/fair.js`, `js/scenes/fair.js`; NPC `manocanh` trong `content/story.js` (`G.NPCS`).
- Sửa `desk.js` (nút "May áo bán sẵn"), `finish.js` (nhánh `rack`), `economy.js` (`fairPending`), `press.js` (2 tiêu đề sạp), `gallery.js` (tem "Bán sẵn").
- `index.html`: thêm script `content/biz.js, front.js, haggle.js, staff.js, bench.js, fair.js, rivals.js` sau `economy.js`; `scenes/fair.js` sau `scenes/ledger.js`.

**M6 — Bảng hẻm & tiệm bóng** · *1 phiên*
- Chạy simbot cho 5 hồ sơ → dán `curve` vào `js/content/rivals.js`; mới `js/rivals.js`.
- Sửa `ledger.js` (tab "Thu chi" | "Bảng hẻm", nút tab ở y 70 trên card phải), `press.js` (hộp top 5 đầu tháng trong số báo đầu tiên của tháng; `paper.js` vẽ ở cột phải thay ô "Quảng cáo" tháng đó), `net.js` (chữ ký mới, stub trả []), dialog Kevin khi bị vượt (`story.flags.passedKevin`).

**Kiểm thử cuối mốc** (trong console, như `tools/simbot.js`):
1. `simEconomy(0.85, 0.8, 60)` → 22–26k; `(0.72, 0.6, 60)` → 8–13k; `(0.55, 0.3, 60)` → phá sản ngày 40–65; thêm cờ `{ staff: 'teo' }` cho hồ sơ ẩu → trụ thêm 10–20 ngày.
2. Hai tab cùng tuần Thử thách: ghế ngày 1, trần giá ngày 1, người mua hội chợ tháng 1 giống nhau.
3. Save v3 cũ đang có khách ở quầy → tải lên, giao được, giá giữ nguyên.
4. Thong thả: không ai rời ghế, không lương nợ, không tab vay.

---

## 11. Câu hỏi để người dùng/kỹ sư quyết (mặc định đã chọn)
- Báo giá có muốn **ẩn hẳn con số chất lượng kỳ vọng** (khó hơn, đúng Recettear) không? *Mặc định: hiện, vì người chơi mới.*
- Giới hạn 1 thợ phụ. *Có thể mở 2 ở hạng 8 nếu thấy thiếu mục tiêu cuối game.*
- Tên 4 tiệm NPC có thể đổi tuỳ ý; `ongsau` nối với cốt truyện Kevin (ông nội).

---

## Nguồn
1. Shop Titans Wiki — Investments / Guilds: https://shop-titans.fandom.com/wiki/Investments · https://shop-titans.fandom.com/wiki/Guilds
2. Pocket Gamer — Shop Titans guide (surcharge/discount/energy, market, guild bounties): https://www.pocketgamer.com/shop-titans/guide/
3. Recettear Wiki — Pricing Strategies: https://recettear.fandom.com/wiki/Pricing_Strategies · Steam discussion về haggle: https://steamcommunity.com/app/70400/discussions/0/864975026916713079
4. Prima Games — Moonlighter 2 Shop Guide (pricing tiers): https://primagames.com/tips/moonlighter-2-shop-guide-pricing-furniture-perks-explained · Moonlighter price guide: https://allthings.how/moonlighter-price-guide-perfect-selling-prices-for-every-item/
5. Potion Craft — Wikipedia: https://en.wikipedia.org/wiki/Potion_Craft · Reputation vs Popularity: https://attackofthefanboy.com/guides/difference-between-reputation-vs-popularity-in-potion-craft/
6. Prima Games — TCG Card Shop Simulator worker guide: https://primagames.com/tips/worker-restocking-guide-in-tcg-card-shop-simulator · Progression guide: https://www.whisperofthehouse.com/tcg-card-shop-simulator/progression-guide
7. Supermarket Simulator — employee guide: https://commonsensegamer.com/supermarket-simulator-employee-guide-how-to-hire-workers-hcfe/
8. Travellers Rest Wiki — Innkeeper: https://travellersrest.wiki.gg/wiki/Innkeeper · Steam discussion (comfort, capacity): https://steamcommunity.com/app/1139980/discussions/0/4422058658944894176
9. Plugged In — Dressmaker review (freelance off-the-rack designs): https://www.pluggedin.com/?p=42909
10. iXBT.games — Dressmaker review (giá áo = vải + công + chất lượng + uy tín): https://ixbt.games/en/reviews/2026/10/05/439975-modnyi-prigovor-sveinomu-simuliatoru-obzor-dressmaker.html
11. Mobile Free to Play — GDC 2019 Deconstructing Idle Miner Tycoon (events): https://mobilefreetoplay.com/gdc-2019-deconstructing-idle-miner-tycoon/

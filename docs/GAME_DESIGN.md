# Tiệm May Áo Dài — Thiết kế game "Mùa 1: Hẻm Chỉ Hồng"

> Tài liệu thiết kế có thể dựng trực tiếp. Lời thoại hiện cho người chơi viết bằng tiếng Việt; mã định danh (id, field, file) viết bằng tiếng Anh/không dấu, khớp với `js/catalog.js` và `js/state.js` hiện tại.
> Phạm vi: một kỹ sư, vài phiên làm việc. Toàn bộ bản phát hành đầu chạy tĩnh trên GitHub Pages, không cần backend.

---

## 0. Dressmaker làm gì (nghiên cứu) và mình lấy gì

| Dressmaker (Cozy Lives / Free Lives, 21/09/2026) | Áp dụng cho Tiệm May Áo Dài |
|---|---|
| 10 nữ chính có cốt truyện riêng, đan vào nhau, chuyện xảy ra *ngoài tiệm* và người chơi chỉ nghe kể lại [1][2] | Khách kể chuyện ở quầy, hậu quả được kể qua **báo** và **thư**. Không cần vẽ cảnh ngoài tiệm. |
| Khách vãng lai dần thành khách quen, mỗi lần ghé lại kể thêm chuyện riêng và chuyện phiếm [1] | **Độ thân tình 0–5**, mỗi cấp mở thêm lời thoại, chuyện phiếm và đơn tâm sự. |
| Thân tình hiện bằng sao, mỗi cấp mở mẫu mới. Quà đúng gu, hoặc áo chất lượng trên 80, cũng cộng điểm thân tình [1] | Cộng điểm khi giao thành công, vượt yêu cầu, đúng gu, tặng quà. Cấp cao tặng vải hiếm. |
| Báo địa phương *Spilt Tea* ("trà đổ", tức chuyện tám) đưa tin về sự kiện lớn, khen áo đẹp, chê áo hỏng. Báo khen làm uy tín tiệm tăng mạnh [1][3] | **Báo Trà Đá** (trà đá vỉa hè là nơi "tám" kiểu Việt). Mỗi bài có điểm "kim", bài tốt cộng danh tiếng và kéo khách. |
| Sự kiện chung (đám tang, hội chợ, triển lãm) mà mỗi khách muốn một kiểu áo khác nhau [1] | **Đám cưới hẻm** (chương 3) và **Đêm Hội Áo Dài** (chương cuối): nhiều đơn cho cùng một dịp. |
| Không đồng hồ ép, không mua bán trong game, không áp lực [2]. Áo hỏng không làm khách bỏ đi luôn [1] | Không có trạng thái thua. Báo chê thì chê cho vui, còn gây tò mò nên lại có khách. |
| Hoàn toàn offline. Người chơi chỉ khoe ảnh áo ngoài game [1][2] | Đây là khoảng trống để mình hơn họ: **link chia sẻ áo**, **thẻ ảnh**, **đơn ngày** có seed chung. |

Giữ chân người chơi trong game cozy và game web: một câu đố chung cho cả thế giới mỗi ngày sẽ tạo ra cộng đồng. Nên chia sẻ kết quả mà không lộ đáp án (kiểu lưới màu của Wordle), mốc ngày tính theo một múi giờ cố định, và có chuỗi ngày chơi liên tiếp (streak) [4][5]. Cách này hợp với tĩnh (static) vì seed lấy từ ngày, không cần server.

---

## 1. Trụ cột thiết kế và cảm giác người chơi

**Cảm giác người chơi:** *"Mình là người thợ trẻ mở lại tiệm may của bà trong một con hẻm Sài Gòn. Mỗi chiếc áo dài mình may đi vào một đám cưới, một buổi kỷ yếu, một cái Tết của ai đó. Cả hẻm đọc báo bàn tán về tiệm mình."*

1. **Tay nghề là trung tâm.** Vòng may theo kiểu Dressmaker (đo, phác thảo, cắt, may, trang trí, giao) giữ nguyên. Mọi hệ thống mới chỉ nằm *giữa các đơn*.
2. **Hẻm nhỏ, tình người.** Khách là hàng xóm, bạn bè. Mọi thứ đều có hậu, kể cả lúc may hỏng.
3. **Đùa duyên kiểu Việt.** Chơi chữ, Tết, đám cưới, 20/10, trà đá vỉa hè. Nhại người nổi tiếng thì chỉ nhại cái duyên trên sân khấu, không bao giờ đụng đời tư.
4. **Khoe được.** Áo nào cũng thành link và thẻ ảnh. Đơn ngày giống nhau cho cả nước.
5. **Dữ liệu điều khiển.** Nội dung là object JS, cách viết giống `catalog.js`. Không cần art mới: chỉ dùng renderer áo, ma-nơ-canh, `look` và ảnh AI sẵn có.

---

## 2. Cốt truyện — Mùa 1 "Hẻm Chỉ Hồng"

### 2.1 Tiền đề
Hẻm Chỉ Hồng là một con hẻm hư cấu ở Sài Gòn. **Bà Tư Kim Chỉ** may áo dài ở số 7 suốt bốn mươi năm, rồi đóng cửa vì tay run. Người chơi là cháu của bà (không giới tính, không tên, xưng "con"/"cháu"/"em" tuỳ người nói). Người chơi nhận chìa khoá, đặt tên tiệm mới và mở cửa lại. Mùa 1 kết thúc ở **Đêm Hội Áo Dài Sài Gòn**, khi tiệm được mời trình diễn.

### 2.2 Nhân vật chính (NPC, vẽ lại bằng renderer khách hiện có)
```js
// js/content/story.js — NPC dùng chung cấu trúc với CLIENTS để desk/finish vẽ được
G.NPCS = [
  { id: 'batu', npc: true, name: 'Bà Tư', role: 'chủ tiệm cũ, người dạy nghề', hair: 'bun', skin: '#e6c09c',
    look: { hair: 'bun', hairCol: '#d9d3cc', bunPin: true, glasses: 'round' }, outfit: ['nhung', 'timhue'],
    likes: ['truyenthong', 'thanhlich'], mats: ['lua', 'nhung'], bust: 86, waist: 72, hip: 92 },
  { id: 'sa', npc: true, name: 'Madame Sa', role: 'cây bút thời trang Báo Trà Đá', hair: 'long', skin: '#efcdae',
    look: { hair: 'bob', hairCol: '#2b2220', glasses: 'sun', pearls: true, lips: '#8e1f3a', earrings: 'drop' }, outfit: ['totam', 'den'],
    likes: ['sangtrong', 'thanhlich'], mats: ['totam'], bust: 84, waist: 63, hip: 89 },
  { id: 'ti', npc: true, male: true, name: 'Tí Flash', role: 'phóng viên kiêm thợ chụp kiêm người giao báo', skin: '#e8c4a2',
    look: { hat: 'beanie' }, outfit: ['dui', 'reu'], likes: ['hiendai'], mats: ['dui'], bust: 88, waist: 74, hip: 90 },
  { id: 'kevin', npc: true, male: true, name: 'Kevin Khải', role: 'CEO tiệm "Áo Dài Siêu Tốc 24h"', skin: '#f2d2b6',
    look: { hair: 'slick', glasses: 'gold', earrings: 'stud' }, outfit: ['nhung', 'den'],
    likes: ['hiendai', 'rucro'], mats: ['voan'], bust: 92, waist: 78, hip: 94 }
];
```
- **Bà Tư** (người dạy nghề): hiền, nói giọng Nam, hay so sánh nghề may với nấu ăn. Sau chương 0 bà về Hội An ở với dì Bảy. Từ đó bà "xài tem, không xài Zalo", nên chỉ liên lạc bằng thư. Bà cũng gọi điện nhắc mẹo khi người chơi may hỏng 3 lần liền.
- **Kevin Khải** (đối thủ): cháu nội ông Sáu Kéo Vàng, người từng giành khách với Bà Tư ở chợ Bến Thành thời thập niên 90. Mở "Áo Dài Siêu Tốc 24h" ở đầu hẻm: "đo bằng app, cắt bằng máy, giao bằng xe ôm công nghệ". Lạc quan, nói chêm tiếng Anh, không ác. Về cuối mùa thành bạn.
- **Madame Sa** (nhà phê bình): cựu người mẫu sàn diễn Sài Gòn thập niên 90, viết chuyên mục **"Kim Chỉ Nam"** (chơi chữ: kim chỉ nam là la bàn, kim chỉ là đồ may). Chấm áo bằng **1–5 kim**. Hay nói "Chèn ơi", "cưng", chêm vài từ mượn tiếng Pháp kiểu Sài Gòn xưa (ma-nơ-canh, "xì-tai"). Khó tính nhưng công bằng. *Bí mật ở chương 5:* chiếc áo dài đầu tiên bà mặc lên sàn diễn là do Bà Tư may.
- **Tí Flash** (phóng viên): nhỏ con, chạy nhanh, chụp ảnh áo sau mỗi lần giao đáng chú ý. Chính Tí "bỏ báo vào khe cửa". Tí là người báo tin cho người chơi.

### 2.3 Cấu trúc chương (gate theo hạng VÀ mục tiêu chương trước)
Hạng dùng đường cong mới (§7.1). Chương N mở khi `rank ≥ ch.rank` và chương N−1 đã xong outro. Khi mục tiêu đủ, outro phát ở lần kế tiếp về quầy.

| # | id | Tên | Hạng | Mục tiêu (counter) | Phần thưởng |
|---|---|---|---|---|---|
| 0 | `ch0` | Chìa khoá tiệm cũ | 1 | `success ≥ 3` (gồm đơn của Bà Tư) | 150 xu, mở **Hộp thư** |
| 1 | `ch1` | Báo Trà Đá ghé hẻm | 2 | `kim3 ≥ 1` bài; `bondL1 ≥ 3` khách | mở **Báo**, 1 bài đặc san, vải `lua.champagne.img_hadong` 300 cm |
| 2 | `ch2` | Đối thủ đầu hẻm | 3 | `keepVsRival ≥ 3`; `arc1Done ≥ 1` | 250 xu, +1 danh tiếng |
| 3 | `ch3` | Mùa cưới hẻm Chỉ Hồng | 4 | 3 đơn chương (`ch3_uyen`, `ch3_nam`, `ch3_thao`) | ảnh cưới tập thể vào album, `gam.hongsen.img_maudon` 300 cm |
| 4 | `ch4` | Sao về hẻm nhỏ | 5 | `starServed ≥ 3` (hoặc `vipServed ≥ 3` khi tắt nhại); `kim4 ≥ 2` | 400 xu, khách sao xuất hiện ở tỉ lệ 35% |
| 5 | `ch5` | Đêm Hội Áo Dài | 7 | 3 đơn chung kết (`ch5_open`, `ch5_muse`, `ch5_finale`) | Kết mùa: **Đê vàng** (huy hiệu ở topbar), thư mở Mùa 2 |

Từ hạng 8 trở đi là chơi tự do: đơn thường, đơn tâm sự còn lại, sự kiện lịch, đơn ngày.

Trong chương 0–3, khách sao chỉ "ghé chơi" ở tỉ lệ 10%. Từ chương 4 lên 35% như hiện tại.

### 2.4 Định dạng kịch bản
```js
// một cảnh = mảng bước; who = id NPC/khách hoặc 'narr'; {shop} {player} được thay khi hiển thị
G.SCRIPTS.ch0_open = [
  { who: 'narr', t: 'Sài Gòn, hẻm Chỉ Hồng. Tiệm may số 7 đã đóng cửa ba năm.' },
  { who: 'batu', t: '...' },
  { choice: [ { t: 'Con sẽ giữ tiệm cho bà.', go: 'a' }, { t: 'Con… con chưa biết may đâu bà.', go: 'b' } ] },
  { label: 'a', who: 'batu', t: '...', jump: 'name' },
  { label: 'b', who: 'batu', t: '...' },
  { label: 'name', do: 'nameShop' },          // hành động: nameShop | queueOrder | giveFabric | coins | flag | mailUnlock | walkIn | walkOut | photo
  { who: 'batu', t: '...' },
  { do: 'queueOrder', id: 'ch0_batu' }
];
```

### 2.5 Kịch bản các cảnh chính

**ch0_open: Chìa khoá tiệm cũ** (phát khi bấm "Mở cửa tiệm" lần đầu)
- *narr:* Sài Gòn, hẻm Chỉ Hồng. Tiệm may số 7 của Bà Tư đã đóng cửa ba năm.
- *batu:* Con tới rồi hả? Vô đây, coi chừng cái bậc thềm, nó già hơn con nữa đó.
- *batu:* Bà may áo dài ở hẻm này bốn chục năm. Giờ tay bà run, xỏ kim ba lần mới trúng một.
- *batu:* Chìa khoá nè. Cái máy may còn chạy ngon, cây kéo bà mới mài hôm qua, cuộn lụa trắng bà để dành cho con.
- *choice:* **[Con sẽ giữ tiệm cho bà.]** → *batu:* Ngoan. Giữ tiệm là giữ khách, giữ khách là giữ cái tình.
  **[Con… con chưa biết may đâu bà.]** → *batu:* Bà cũng đâu có biết, cho tới chiếc áo đầu tiên. Ai mà không vụng lần đầu.
- *batu:* Đặt tên tiệm đi con. Bảng hiệu cũ mối ăn hết chữ rồi, chỉ còn chữ "May".
- `do: nameShop`: chọn 1 trong 4 tên có sẵn ("Tiệm May Chỉ Hồng", "Áo Dài Bà Tư", "Tiệm May Gió Nam", "Áo Dài Mây Hồng") hoặc bấm "Tự đặt…" (`window.prompt`, tối đa 24 ký tự, lọc ký tự lạ).
- *batu:* "{shop}". Nghe được đó. Bà treo bảng liền.
- *batu:* Giờ rung chuông thử coi. Khách đầu tiên của tiệm là… bà nè. Bà muốn một bộ áo lụa để mặc về Hội An.
- `do: queueOrder ch0_batu` (Bà Tư đứng sẵn ở quầy; đơn hướng dẫn: `min truyenthong 20`, `mat lua 50`, ngân sách 200, chất lượng ≥ 40).

**ch0_end** (sau 3 lần giao thành công)
- *batu (thư):* Ba chiếc áo, ba người khách cười. Bà yên tâm về Hội An rồi.
- *batu:* Nhớ nè: canh sợi cho thẳng, đường may cho đều, còn lòng mình thì cho ấm.
- *batu:* Có gì bà viết thư. Bà không xài Zalo, bà xài tem. → `mailUnlock`, +150 xu.

**ch1_open: Báo Trà Đá ghé hẻm** (hạng 2)
- `walkIn ti`. *ti:* Chào tiệm! Em là Tí, phóng viên kiêm thợ chụp kiêm người giao báo của Báo Trà Đá.
- *ti:* Báo tụi em chuyên tin hẻm: ai cưới, ai giận, ai mặc đẹp. Mà dạo này ai mặc đẹp cũng nói áo may ở {shop}.
- *ti:* Sếp em muốn coi tiệm có xứng lên báo không. Sếp chấm bằng kim. Một kim là… thôi, đừng để bị một kim.
- `walkIn sa`. *sa:* Chèn ơi, bảng hiệu mới sơn hả cưng? Được. Còn tay nghề thì để tôi coi đã.
- *sa:* Tôi đi sàn diễn từ hồi ngã tư này chưa có đèn xanh đèn đỏ. Áo đẹp hay không, tôi nhìn ba giây là biết.
- *sa:* Từ hôm nay, chiếc áo nào của cưng đáng nói sẽ lên mục "Kim Chỉ Nam". Cố mà kiếm năm kim nha.
- *ti (nói nhỏ):* Sếp khen ai năm kim thì người đó được cả hẻm mời trà đá một tuần đó anh/chị.
- Mục tiêu hiện lên thẻ chương: "Lên báo với ít nhất 3 kim · Làm thân với 3 khách (♥1)".

**ch1_end:** *sa (trên báo, đặc san):* "Hẻm Chỉ Hồng có tiệm may mở cửa trở lại!" +300 cm lụa champagne hoa chìm.

**ch2_open: Đối thủ đầu hẻm** (hạng 3)
- `walkIn kevin`. *kevin:* Hello neighbor! Kevin Khải, CEO kiêm founder kiêm… thợ may duy nhất của Áo Dài Siêu Tốc 24h.
- *kevin:* Bên anh đo bằng app, cắt bằng máy, giao trong 24 tiếng. Disruption đó em, hiểu không?
- *choice:* **[Chúc anh buôn may bán đắt.]** → *kevin:* Oh, nice! Em dễ thương ghê. Anh vẫn sẽ giành khách của em nha. No hard feelings!
  **[Áo dài đâu phải trà sữa mà giao nhanh.]** → *kevin:* Ha! Trà sữa bên anh cũng giao nhanh luôn. Đùa thôi… bên anh không bán trà sữa. Chưa.
- *kevin:* Anh phát tờ rơi cả hẻm rồi. Khách nào chê tiệm em chậm thì anh nhận hết.
- `walkOut kevin`. Thư của *batu* đến ngay: "Thằng Kevin là cháu nội ông Sáu Kéo Vàng. Hồi xưa ông Sáu với bà giành khách ở chợ Bến Thành, giành tới mức hai đứa con nít hai nhà không dám chơi chung. Kệ nó. Chậm mà chắc, con."
- **Cơ chế chương 2 "Tờ rơi 24h":** trong chương này, 50% đơn thường có cờ `rival: true`. Phiếu đặt may dán một mẩu giấy vàng: *"Bên Siêu Tốc 24h hứa may xong trong một ngày đó nha!"*, và yêu cầu chất lượng +5. Giao áo chất lượng ≥ 80 thì `keepVsRival++`, khách nói: *"Thôi, chậm mà chắc. Từ giờ chị may ở đây!"*

**ch2_end:** *kevin:* Ok, ok, anh thừa nhận… đường may của em đẹp hơn máy bên anh. Mà máy anh nhanh hơn! *(Chưa)* hoà nha.

**ch3_open: Mùa cưới hẻm Chỉ Hồng** (hạng 4)
- `walkIn uyen`. *uyen:* Em… em sắp cưới rồi! Mà chồng em là cháu nội Bà Năm đó!
- `walkIn nam`. *nam:* Cái hẻm này nhỏ như cái lỗ kim, đi đâu cũng đụng người quen.
- *nam:* Đám cưới làm ngay đầu hẻm. Cô dâu một bộ, bà nội chồng một bộ, phù dâu một bộ. Tiệm cháu lo hết được không?
- `walkIn thao`. *thao:* Em làm phù dâu nè! Em xin một bộ không được đẹp hơn cô dâu, mà cũng đừng xấu quá nha chị.
- *kevin (ló đầu vào cửa):* Bên anh tài trợ… bong bóng. Một trăm cái. Hình trái tim.
- `queueOrder ch3_uyen, ch3_nam, ch3_thao`. Ba đơn lần lượt ra ở 3 lần rung chuông tới.
- **ch3_end:** cảnh "chụp ảnh cưới": ba chiếc áo vừa giao đứng cạnh nhau trên nền studio (dùng `photo`), lưu vào album với tên "Đám cưới hẻm Chỉ Hồng". *nam:* Đẹp! Bà mà trẻ lại ba chục tuổi là bà cưới thêm lần nữa.

**ch4_open: Sao về hẻm nhỏ** (hạng 5) có 2 biến thể:
- *Nhại BẬT:* *ti:* Anh chị ơi! Có chiếc xe bảy chỗ de vô hẻm, kẹt cứng rồi! → `walkIn trada`. *trada:* Hi cả nhà, đang live nha! Đây là tiệm may được Madame Sa chấm năm kim đó hả? → *trada:* Chị mà mặc áo tiệm em lên clip, mai cả showbiz kéo về hẻm này luôn. → *sa:* Người nổi tiếng khó tính lắm đó cưng. Mà khó tính mới làm nên tên tuổi.
- *Nhại TẮT:* *ti:* Anh chị ơi! Xe của đài truyền hình de vô hẻm! → `walkIn ngoc`. *ngoc:* Chị giới thiệu tiệm em trong chương trình Tết rồi. Mấy tuần tới khách sang sẽ tới, em chuẩn bị tinh thần nha. → mục tiêu dùng `vipServed` (giao áo cho khách ♥3 trở lên hoặc khách mang cờ `vip`).
- Mục tiêu: "Giao áo cho 3 ngôi sao · 2 bài báo từ 4 kim".

**ch5_open: Đêm Hội Áo Dài** (hạng 7)
- `walkIn sa`. *sa:* Ba mươi năm trước, có một bà thợ may bảng hiệu bé xíu may cho tôi chiếc áo dài đầu tiên lên sàn diễn.
- *sa:* Người đó tên Tư.
- *sa:* Năm nay Đêm Hội Áo Dài Sài Gòn mở lại. Ban tổ chức mời hai tiệm của hẻm Chỉ Hồng: {shop} và Siêu Tốc 24h.
- `walkIn kevin`. *kevin:* Anh… có một đề nghị. Áo kết show, mình may chung được không? Máy anh nhanh, tay em khéo.
- *choice:* **[Được, mình may chung.]** → *kevin:* Deal! Anh lo phần vải, em lo phần hồn. / **[Để em suy nghĩ…]** → *kevin:* Ok, anh chờ. Anh giỏi chờ lắm. *(Không giỏi.)* Hai lựa chọn đều dẫn tới cùng đơn `ch5_finale`. Chỉ khác lời thoại, và nếu chọn "Được" thì Kevin tặng 200 cm voan.
- *batu (điện thoại):* Bà về coi. Bà ngồi hàng ghế đầu. Nhớ chừa cho bà cái ghế có nệm.
- Ba đơn chung kết:
  - `ch5_open` "Áo mở màn": khách `sa`, `min truyenthong 45`, `min thanhlich 30`, `decor tranh`.
  - `ch5_muse` "Người mẫu chính": khách là **người có điểm thân tình cao nhất** (tôn trọng công tắc nhại; mặc định là `vy`). Yêu cầu lấy theo `likes[0]` của người đó (min 50) cộng một luật đúng gu.
  - `ch5_finale` "Áo hai tiệm cùng may": khách `kevin` (người mẫu nam), `min truyenthong 35`, `min hiendai 35`, `mat voan 50` (với nam thì dùng `lua`).
- **Kết mùa** `ch5_end`: Madame Sa cộng kim của 3 áo. Từ 12 kim trở lên là *"Kim Vàng"*, dưới 12 là *"Kim Bạc"*, không có kết xấu.
  - *sa:* {tổng} kim. Tôi viết báo ba chục năm, hôm nay lần đầu tôi muốn đứng dậy vỗ tay trước khi viết.
  - *batu:* Con thấy chưa. Cái tiệm này chưa bao giờ là của bà. Nó là của người nào còn chịu ngồi xỏ kim.
  - *batu:* Cái đê vàng này bà đeo bốn chục năm. Giờ tới con. → huy hiệu **Đê vàng** hiện cạnh tên tiệm ở topbar.
  - *kevin:* Anh xin lỗi vụ tờ rơi. Năm sau mình mở lớp dạy may chung nha? Bên anh có máy, bên em có… Bà Tư.
  - Màn cảm ơn khách quen: mọi khách đã gặp đi qua sàn diễn trong chiếc áo đẹp nhất của họ lấy từ album (xem §9).
  - Thư nhá hàng Mùa 2 (từ Huế, đóng dấu đỏ): *"Kính gửi {shop}. Hội Áo Dài Cố Đô trân trọng mời quý tiệm ra Huế… Áo ngũ thân, nhiễu, gấm cung đình đang chờ."*

### 2.6 Hộp thư
Thư là vật phẩm tình cảm, có thể kèm quà. Thư đến từ Bà Tư (mỗi đầu và cuối chương), khách ở mốc ♥5 (hết arc), Kevin, Madame Sa và Hội Áo Dài.
```js
{ id: 'mail_hanh_arc', from: 'hanh', day: 41, title: 'Bài văn tả người thợ may', body: '...', gift: { fabric: 'totam.trang.tron', cm: 300 }, read: false, claimed: false }
```

---

## 3. Độ thân tình (bond)

### 3.1 Điểm và cấp
`G.state.bond[id] = { pts, lvl, arc, gifted, met, seenLines }`
- Ngưỡng điểm: `BOND_AT = [0, 10, 25, 45, 70, 100]`, ứng với cấp 0 đến 5.
- Tên các cấp: 0 *Khách lạ*, 1 *Quen mặt*, 2 *Khách quen*, 3 *Thân thiết*, 4 *Tri kỷ*, 5 *Người nhà*.

| Nguồn | Điểm |
|---|---|
| Giao thành công | +10 |
| Giao chưa đạt | +3 (khách vẫn quý tiệm) |
| Chất lượng ≥ 90 | +4 |
| Mỗi yêu cầu `min` vượt ≥ 15 điểm | +2 (tối đa +4) |
| ≥ 50% chất liệu khách ưa (`cl.mats`) dù không bị đòi | +3 |
| Phong cách cao nhất của áo trùng `likes[0]` | +2 |
| Đơn tâm sự thành công | +10 thêm |
| Tặng quà ở quầy (mỗi lượt khách 1 lần): 100 cm vải trong kho | +6 nếu chất liệu khách ưa, +3 nếu tag cao nhất của vải ∈ `likes`, còn lại +2 |

Trung bình một lần giao đạt được khoảng 14–20 điểm. Lên ♥5 mất khoảng 6–7 lần ghé.

### 3.2 Cấp mở gì
| Cấp | Mở |
|---|---|
| ♥1 Quen mặt | Lời chào riêng (`greet`) và một "tin hẻm" (`gossip`) xuất hiện trên báo. Ngân sách +4%/cấp. |
| ♥2 Khách quen | **Đơn tâm sự 1** (khi `rank ≥ 2`). |
| ♥3 Thân thiết | Quà: 300 cm vải "đặc trưng" của khách (`sig`). Yêu cầu chất lượng −5 với khách này. |
| ♥4 Tri kỷ | **Đơn tâm sự 2** (khi `rank ≥ 4`). |
| ♥5 Người nhà | **Thư** + giảm 10% vĩnh viễn ở cửa hàng vải cho chất liệu `mats[0]` của khách + **tiếng chuông riêng** (§9) + ảnh khung trên tường quầy. |

Khi lên cấp, màn giao áo hiện một dòng: `♥ Cô Hạnh: Khách quen! Mở: đơn tâm sự "Buổi dạy cuối"`.

### 3.3 Chọn khách khi rung chuông (`G.nextVisit`)
Thứ tự ưu tiên:
1. Hàng đợi kịch bản `story.queue` (đơn chương, đơn sự kiện, đơn "may y chang").
2. Khách có arc sẵn sàng. Nếu đã 3 lần chuông chưa có đơn tâm sự thì chọn chắc chắn, còn không thì khi khách đó ghé có 50% ra đơn tâm sự.
3. Đơn thường: trọng số `1 + 0.25 × lvl`; khách sao theo tỉ lệ của chương; luôn loại `lastClient`.

### 3.4 Dữ liệu arc
Ký hiệu yêu cầu gọn: `['min','thanhlich',30]`, `['max','rucro',25]`, `['mat','lua',50]`, `['avoid','do']`, `['decor','theu']`. Bộ dựng sẽ **kẹp lại cho giải được** (§8, M1). `min` bị kẹp ≤ `floor(maxTag × 0.65)`. `max` được nâng tới `minCapped + 8`, quá 50 thì bỏ. Chất liệu chưa mở thì thay bằng chất liệu đã mở của khách. Nhóm trang trí chưa mở hoặc không hợp giới tính thì thay bằng `theu`. Mỗi đơn tâm sự: ngân sách ×1.3, chất lượng giữ như đơn thường, thưởng ghi trong `reward`.

```js
// js/content/bonds.js
G.BONDS = {
  hanh: {
    sig: 'lua.trang.img_hadong',
    greet: ['Em ơi, cô ghé chấm bài… à nhầm, ghé may áo.', 'Hôm nay cô có tiết trống, cô ghé tiệm em chơi.'],
    gossip: ['Cô Hạnh kể: lớp 12A năm nay có cậu viết văn tả cô giáo mặc áo dài "như mây trời". Cô cảm động, cho 9 điểm.'],
    arcs: [
      { id: 'hanh1', title: 'Buổi dạy cuối', line: 'Cuối tháng này cô nghỉ hưu. Cô muốn đứng lớp lần cuối trong một chiếc áo thật nền nã, để học trò nhớ.',
        reqs: [['min','thanhlich',30], ['mat','lua',50], ['avoid','do'], ['decor','theu']], reward: { coins: 100, fabric: 'lua.trang.img_hadong', cm: 200 } },
      { id: 'hanh2', title: 'Phát biểu ở đám cưới học trò', line: 'Thằng Bin, đứa nghịch nhất lớp năm xưa, mời cô lên phát biểu đám cưới nó. Cô hồi hộp hơn đi thi!',
        reqs: [['min','truyenthong',35], ['min','thanhlich',25], ['mat','totam',50], ['decor','cuc']], reward: { coins: 180, fabric: 'totam.trang.tron', cm: 300 } }
    ],
    letter: { title: 'Bài văn: Tả người thợ may em yêu quý', body: 'Đề bài: Tả người thợ may em yêu quý.\nBài làm: Ở hẻm Chỉ Hồng có một người thợ may. Người ấy đo vai cô bằng thước dây, mà đo lòng cô bằng sự kiên nhẫn. Hôm cô dạy tiết cuối, học trò đứng dậy vỗ tay, cô biết một nửa tràng vỗ tay ấy là dành cho chiếc áo.\nĐiểm: 10. Không trừ dấu chấm phẩy nào.\nCô Hạnh' }
  },
  // ... các khách khác cùng cấu trúc, xem bảng 3.5
};
```

### 3.5 Arc của 19 khách
*Mỗi dòng gồm: đơn 1 (♥2) / đơn 2 (♥4), yêu cầu, thưởng, rồi tóm tắt thư (♥5). Engineer chép vào `G.BONDS` theo mẫu ở trên. `sig` là vải đặc trưng tặng ở ♥3.*

**Khách quen**

1. **Cô Hạnh** (`hanh`, sig `lua.trang.img_hadong`): đã viết đầy đủ ở trên.

2. **Chị Vy** (`vy`, sig `voan.hoaca.tron`)
   - Đơn 1 **"Bộ sưu tập đầu tay"**: "Chị gom hết tiền tiết kiệm làm bộ sưu tập đầu tiên. Áo mẫu phải mới, đừng giống áo bà ngoại chị nha!". Yêu cầu `min hiendai 35`, `max truyenthong 30`, `decor dinh`. Thưởng 120 xu + `ren.trang.img_ren` 200 cm.
   - Đơn 2 **"Show thật, đèn thật"**: "Có nhãn hàng ở Đà Lạt mời chị trình diễn. Bộ kết phải lấp lánh như đèn sân khấu!". Yêu cầu `min rucro 35`, `min hiendai 30`, `mat kimsa 50`, `avoid trang`. Thưởng 200 xu + `kimsa.champagne.img_kimsa` 300 cm.
   - Thư: chị gửi từ hậu trường Đà Lạt. Nhãn hàng đặt 20 bộ, chị ghi tên tiệm trong phần "cảm ơn". Cuối thư: "Áo bà ngoại chị cũng đẹp. Chị nói vậy hồi trước là chị sai."

3. **Bà Năm** (`nam`, sig `gam.vang.img_gam_rong`)
   - Đơn 1 **"Hẹn hò lại với ông Năm"**: "Ông Năm rủ bà đi ăn kem Bạch Đằng như hồi mới quen. Bốn chục năm rồi đó cháu!". Yêu cầu `min sangtrong 35`, `min thanhlich 20`, `avoid den`, `decor cuc`. Thưởng 120 xu + `nhung.ruou.tron` 200 cm.
   - Đơn 2 **"Đám cưới vàng"**: "Kỷ niệm năm mươi năm cưới, con cháu tổ chức lại đám cưới cho ông bà. Áo phải hơn hồi xưa!". Yêu cầu `min truyenthong 40`, `min sangtrong 35`, `mat gam 50`, `decor tranh`. Thưởng 220 xu + `gam.do.img_maudon` 300 cm.
   - Thư: hai nét chữ. Bà viết "Cảm ơn cháu", ông viết thêm bằng bút bi: "Bà nhà tôi mặc đẹp quá, tôi suýt đi lạc vì nhìn bà. Ông Năm."

4. **Em Thảo** (`thao`, sig `voan.trang.img_hoanhi`)
   - Đơn 1 **"Kỷ yếu cả lớp"**: "Cả lớp em mặc áo trắng hết, em muốn khác một xíu thôi, không thì cô chủ nhiệm la!". Yêu cầu `min thanhlich 30`, `max sangtrong 25`, `mat voan 50`. Thưởng 100 xu + `lua.hongphan.img_hadong` 200 cm.
   - Đơn 2 **"Buổi phỏng vấn đầu đời"**: "Thứ Hai em phỏng vấn ở ngân hàng! Áo phải chỉn chu mà không già nha chị.". Yêu cầu `min thanhlich 35`, `min hiendai 25`, `avoid vang`, `decor cuc`. Thưởng 180 xu + `totam.champagne.tron` 200 cm.
   - Thư: "Em đậu rồi!!! Lương tháng đầu em để dành may cho mẹ một bộ. Chị nhớ chừa lịch cho em nha." Đi kèm thư, mẹ của Thảo vào hàng đợi khách như một đơn đặc biệt có cờ `vip`.

5. **Chị Ngọc** (`ngoc`, sig `totam.do.tron`)
   - Đơn 1 **"Livestream đếm ngược"**: "Đêm giao thừa chị dẫn trực tiếp. Mười giây đếm ngược mà áo không nổi là coi như mất Tết!". Yêu cầu `min rucro 40`, `min sangtrong 25`, `decor dinh`. Thưởng 130 xu + `gam.do.img_gam_rong` 200 cm.
   - Đơn 2 **"Ghế nóng"**: "Chị chuyển sang làm talkshow. Khách mời mới là nhân vật chính, áo chị phải sang mà biết nhường.". Yêu cầu `max rucro 35`, `min sangtrong 35`, `mat totam 50`. Thưởng 200 xu + `totam.covit.tron` 300 cm.
   - Thư: khán giả hỏi áo may ở đâu nhiều tới mức chị phải ghim địa chỉ tiệm lên đầu trang fanpage.

6. **Cô Diệp** (`diep`, sig `nhung.timhue.tron`)
   - Đơn 1 **"Vở cũ diễn lại"**: "Đoàn cô dựng lại một vở cải lương bốn chục năm không ai diễn. Áo phải đậm chất xưa như hồi cô mới vô nghề.". Yêu cầu `min truyenthong 40`, `mat nhung 50`, `decor dau`. Thưởng 130 xu + `nhung.do.tron` 200 cm.
   - Đơn 2 **"Trao áo cho học trò"**: "Con bé đào chánh mới của đoàn hát hay lắm mà nhà nghèo. Cô muốn tặng nó bộ áo đầu tiên.". Yêu cầu `min truyenthong 35`, `min thanhlich 20`, `decor theu`. Thưởng 200 xu + `lua.do.tron` 300 cm.
   - Thư: viết theo nhịp sáu câu vọng cổ, mỗi câu kết bằng một lời cảm ơn (do người viết nội dung tự soạn, không chép lời bài hát có sẵn).

7. **Chị Uyên** (`uyen`, sig `ren.hongphan.img_ren`). Đám cưới của chị đã nằm ở chương 3, nên arc riêng là chuyện *sau* cưới.
   - Đơn 1 **"Tết đầu làm dâu"**: "Tết đầu tiên về nhà chồng, em run quá! Áo phải hiền, phải Tết, phải được lòng Bà Năm.". Yêu cầu `min truyenthong 30`, `min thanhlich 25`, `mat gam 50`, `decor theu`. Thưởng 130 xu + `gam.hongsen.img_maudon` 200 cm.
   - Đơn 2 **"Một năm ngày cưới"**: "Anh xã đặt bàn ở nhà hàng trên sân thượng. Em muốn ảnh cưới lần hai đẹp hơn lần một!". Yêu cầu `min sangtrong 35`, `min thanhlich 30`, `avoid den`, `decor choang`. Thưởng 220 xu + `totam.champagne.tron` 300 cm.
   - Thư: kèm "ảnh" là chiếc áo đơn 2 đứng cạnh chiếc áo cưới chương 3 (ghép từ album). "Bà Năm khen em mặc đẹp. Lần đầu bà khen em đó!"

8. **Em Khánh** (`khanh`, sig `dui.be.tron`)
   - Đơn 1 **"Đêm rằm phố Hội"**: "Đêm rằm phố cổ tắt đèn điện, chỉ còn đèn lồng. Áo em phải đẹp dưới ánh nến nha chị.". Yêu cầu `min truyenthong 30`, `mat dui 50`, `avoid den`. Thưởng 110 xu + `lua.vang.tron` 200 cm.
   - Đơn 2 **"Tour áo dài của riêng em"**: "Em mở công ty tour nhỏ xíu, đúng một nhân viên là em! Áo đồng phục phải duyên và đi bộ cả ngày được.". Yêu cầu `min thanhlich 30`, `max rucro 30`, `decor dau`. Thưởng 190 xu + `dui.reu.tron` 300 cm.
   - Thư: kèm một chiếc đèn lồng giấy. Trong game là toast cộng một "đèn lồng" treo ở quầy, chỉ là chữ trang trí trong menu, không cần art. Em đã gặp Bà Tư ở Hội An, và bà dặn em gửi lời: "Bà khen con may tiến bộ."

**Người nổi tiếng (nhại vui).** Chỉ đùa vào phong cách sân khấu đã viết trong `catalog.js`. Arc nào cũng kết bằng một khoảnh khắc chân thành.

9. **Trà Đắng** (`trada`, sig `voan.hoaca.tron`)
   - Đơn 1 **"Biến hình ba giây"**: "Clip này chị búng tay một cái là từ đồ ngủ thành áo dài. Áo phải ăn hình ngay giây thứ ba!". Yêu cầu `min hiendai 35`, `min rucro 25`, `decor dinh`. Thưởng 140 xu + `kimsa.do.tron` 200 cm.
   - Đơn 2 **"Hoá thân… thành chính mình"**: "Lần này chị không hoá trang. Chị muốn mặc áo dài mộc, để fan thấy chị thật.". Yêu cầu `min thanhlich 30`, `max rucro 30`, `mat voan 50`. Thưởng 220 xu + `voan.trang.img_hoanhi` 300 cm.
   - Thư: "Clip không hoá trang lại nhiều view nhất của chị. Bình luận đứng đầu là: 'Áo này ai may vậy?' Chị ghim tên tiệm em luôn rồi."

10. **Chủ tịch Phương Thoa** (`thoa`, sig `gam.do.img_maudon`). *Xem khuyến nghị §6.6, nhân vật rủi ro cao.*
    - Đơn 1 **"Thị sát hẻm Chỉ Hồng"**: "Chị đi thị sát một vòng hẻm, áo phải ra dáng chủ tịch! … À mà có giảm giá không em?". Yêu cầu `min sangtrong 40`, `mat gam 50`, `decor dinh`. Mẹo vui: phiếu đặt may hiện "−5% chủ tịch xin giảm"; khi giao áo, chị bo lại 20%.
    - Đơn 2 **"Tiệc tri ân nhân viên"**: "Cuối năm chị đãi nhân viên. Chị muốn họ thấy chủ tịch mặc áo do tiệm nhỏ may, để họ biết cái đẹp không cần to.". Yêu cầu `min truyenthong 30`, `min sangtrong 35`, `avoid den`. Thưởng 220 xu + `totam.ruou.tron` 300 cm.
    - Thư: in trên "giấy khen". Mục *Khen thưởng* ghi: "Tiệm {shop}: đã may đẹp, đã không giảm giá, nhưng chị vẫn quý."

11. **Bà Tân Vờ Lốc** (`batan`, sig `dui.camdat.tron`)
    - Đơn 1 **"Nồi bánh chưng siêu to"**: "Bà nấu nồi bánh chưng to nhất xóm, áo phải thật Tết mà xắn tay được nha cháu!". Yêu cầu `min truyenthong 35`, `mat dui 50`, `decor theu`. Thưởng 130 xu + `gam.vang.img_gam_rong` 200 cm.
    - Đơn 2 **"Mâm cơm cả hẻm"**: "Bà nấu một mâm mời cả hẻm Chỉ Hồng. Đừng may áo trắng nha, nước mắm nó văng!". Yêu cầu `min truyenthong 30`, `min rucro 25`, `avoid trang`. Thưởng 200 xu + `dui.do.img_thocam` 300 cm.
    - Thư: một "công thức" viết bằng muôi: "Nguyên liệu: một tiệm may siêu dễ thương, một bà già siêu đói. Cách làm: may xong thì ghé bà ăn cơm."

12. **Linh Búp Bê** (`linhbb`, sig `lua.hongphan.img_hadong`)
    - Đơn 1 **"Lên cam không filter"**: "Lần này chị thử thách quay không filter. Áo phải trong trẻo tự nhiên.". Yêu cầu `min thanhlich 35`, `max rucro 25`, `mat lua 50`. Thưởng 120 xu + `lua.hongsen.tron` 200 cm.
    - Đơn 2 **"Review đồ Tết… thật lòng"**: "Năm nay chị chỉ review đồ chị thật sự thích. Áo của em là món đầu tiên.". Yêu cầu `min hiendai 30`, `min thanhlich 25`, `decor dau`. Thưởng 200 xu + `voan.hongphan.tron` 300 cm.
    - Thư: "Video review được 98% thích. 2% còn lại hỏi sao chị không quay lâu hơn."

13. **Hồ Ngọc Hả** (`ngocha`, sig `totam.champagne.tron`)
    - Đơn 1 **"Gala 'Hả?'"**: "Chị bước ra là cả khán phòng phải 'hả' lên. Thần thái, em hiểu không?". Yêu cầu `min sangtrong 40`, `min hiendai 25`, `mat totam 50`. Thưởng 140 xu + `ren.den.img_ren` 200 cm.
    - Đơn 2 **"Đêm nhạc acoustic"**: "Đêm này chị chỉ ngồi ghế đẩu hát mộc. Áo nhẹ thôi, để giọng hát được nói.". Yêu cầu `min thanhlich 30`, `max rucro 30`, `decor choang`. Thưởng 220 xu + `totam.trang.tron` 300 cm.
    - Thư: "Đêm đó không ai 'hả' cả. Mọi người im lặng nghe. Chị thích vậy hơn."

14. **Chị Phiền** (`chiphien`, sig `voan.hongphan.tron`). Cái duyên của chị là **làm thơ** và livestream. Không bao giờ đùa về vóc dáng hay giới tính (xem §6.6).
    - Đơn 1 **"Đêm thơ livestream"**: "Tối nay chị đọc thơ trên live, áo phải thướt tha cho xứng mấy câu chị làm!". Yêu cầu `min thanhlich 30`, `min rucro 25`, `mat voan 50`, `decor dau`. Thưởng 130 xu + `ren.hongphan.img_ren` 200 cm.
    - Đơn 2 **"Ra mắt tập thơ đầu tay"**: "Chị in tập thơ thật rồi em! Buổi ra mắt có ba chục người, hai chục là họ hàng, nhưng chị vẫn hồi hộp.". Yêu cầu `min truyenthong 30`, `avoid den`, `decor theu`. Thưởng 200 xu + `lua.hongsen.tron` 300 cm.
    - Thư: một bài thơ lục bát bốn câu do chị "sáng tác", vụng mà dễ thương: *"Hẻm nhỏ có tiệm may xinh / Kim đưa chỉ dệt mối tình áo hoa / Chị mặc đi khắp gần xa / Ai khen chị đẹp, chị la: tiệm này!"*

15. **Đàm Vĩnh Biệt** (`damvb`, sig `kimsa.champagne.img_kimsa`)
    - Đơn 1 **"Lấp lánh nhất sân khấu"**: "Có gì sáng nhất cứ đính hết lên cho anh! Ban tổ chức tắt đèn anh vẫn phải sáng!". Yêu cầu `min rucro 40`, `mat kimsa 50`, `decor dinh`. Thưởng 150 xu + `kimsa.den.tron` 200 cm.
    - Đơn 2 **"Đêm nhạc… chưa vĩnh biệt"**: "Anh hứa đây là đêm diễn cuối. Cuối năm nay thôi nha. Áo phải sang mà đứng đắn.". Yêu cầu `min sangtrong 40`, `max hiendai 30`, `decor cuc`. Thưởng 230 xu + `nhung.den.img_nhung` 300 cm.
    - Thư: "Đêm cuối diễn tới ba lần encore. Vậy là chưa cuối. Hẹn em năm sau may tiếp."

16. **Trấn Thành Công** (`tranthanh`, sig `totam.ruou.tron`)
    - Đơn 1 **"Gameshow Tết"**: "Anh dẫn gameshow Tết… áo mà đẹp quá chắc anh khóc trên sóng mất.". Yêu cầu `min thanhlich 30`, `min sangtrong 30`, `mat totam 50`. Thưởng 140 xu + `lua.covit.tron` 200 cm.
    - Đơn 2 **"Áo chống… nước mắt"**: "Em may cho anh bộ khóc lên áo không lộ vệt được không? Đừng màu trắng nha em.". Yêu cầu `avoid trang`, `min sangtrong 30`, `mat lua 50`, `decor cuc`. Thưởng 220 xu + `nhung.ruou.img_nhung` 300 cm.
    - Thư: giấy có ba vệt loang xanh (vẽ bằng 3 hình ellipse mờ), ghi: "Anh đã cố không khóc khi viết thư này. Thất bại."

17. **Sơn Tung Tăng** (`sontung`, sig `nhung.den.tron`)
    - Đơn 1 **"MV không đụng hàng"**: "MV mới cần áo dài cách tân, phải chất và không giống ai.". Yêu cầu `min hiendai 35`, `max truyenthong 25`, `mat nhung 50`. Thưởng 150 xu + `nhung.cobalt.img_nhung` 200 cm.
    - Đơn 2 **"Đêm diễn ở quê nhà"**: "Anh về quê diễn cho bà con xem, mộc thôi mà vẫn phải có chất riêng.". Yêu cầu `min truyenthong 30`, `min hiendai 25`, `decor vien`. Thưởng 220 xu + `gam.cobalt.img_maudon` 300 cm.
    - Thư: "Bà con ở quê không xem MV, họ chỉ khen 'thằng nhỏ mặc áo dài bảnh ghê'. Anh vui hơn được triệu view."

18. **Trắng Vâu** (`trangvau`, sig `dui.reu.tron`)
    - Đơn 1 **"Về quê ăn Tết với mẹ"**: "Anh chỉ cần bộ áo đơn giản, mặc về nhà mẹ không nhận ra là được rồi.". Yêu cầu `min truyenthong 30`, `max rucro 20`, `mat dui 50`. Thưởng 120 xu + `dui.mutat.tron` 200 cm.
    - Đơn 2 **"Sống chậm ở làng"**: "Anh ở lại làng thêm một tháng. Áo mặc đi chợ, đi chùa, ngồi hiên đều được.". Yêu cầu `min thanhlich 30`, `avoid do`, `decor dau`. Thưởng 190 xu + `lua.be.tron` 300 cm.
    - Thư: chỉ ba dòng, chữ to. "Mẹ khen. Anh viết chậm. Cảm ơn em."

19. **Xuân Nam** (`xuannam`, sig `gam.do.img_gam_rong`)
    - Đơn 1 **"Táo về chầu"**: "Năm nay Táo lên chầu, áo phải đúng chất Táo, Ngọc Hoàng nhìn là cho điểm!". Yêu cầu `min truyenthong 40`, `mat gam 50`, `decor dau`. Thưởng 140 xu + `gam.vang.img_gam_rong` 200 cm.
    - Đơn 2 **"Bản báo cáo cuối năm"**: "Anh muốn đọc 'báo cáo' về hẻm Chỉ Hồng trong tiết mục mới. Áo phải vui mà vẫn đàng hoàng!". Yêu cầu `min rucro 30`, `min truyenthong 30`, `decor vien`. Thưởng 220 xu + `nhung.do.tron` 300 cm.
    - Thư: viết theo kiểu "tấu trình": "Muôn tâu, tiệm {shop} năm nay may {served} chiếc áo, chưa để khách nào khóc. Trừ Trấn Thành Công, nhưng anh ấy khóc vì vui."

---

## 4. Báo chí — **Báo Trà Đá**
*Tagline: "Tin hẻm nóng hổi, uống mát lạnh."* Chuyên mục của Madame Sa: **"Kim Chỉ Nam"**.

### 4.1 Khi nào có bài (`G.press.onDelivery(r, job)`)
Xét từ trên xuống, gặp điều kiện đầu tiên đúng thì dừng. Tối đa một bài cho mỗi lần giao.
1. Đơn chương, đơn tâm sự, đơn sự kiện → luôn có bài (`kind: 'story' | 'event'`).
2. Khách sao → luôn có bài (`kind: 'star'`).
3. `success && quality ≥ 92` → `great`.
4. `quality < 50` → `bad` (giọng hài, cozy).
5. `!success && qualOk` → `funny` (áo đẹp nhưng sai đề).
6. Còn lại có 25% khả năng ra `brief`.

Nếu 4 ngày không có bài, tự ra một số "tin hẻm" chỉ gồm gossip, quảng cáo Kevin và dự báo gu. Kết chương ra **đặc san** (`kind: 'chapter'`).

### 4.2 Điểm kim
```
kim = 1 + (quality ≥ 60) + (quality ≥ 80) + (allReqsOk) + (quality ≥ 92 && (anyMinExceeded15 || trendHit))
if (!success) kim = min(kim, 3)
```

| Kim | Ảnh hưởng (cozy: không bao giờ trừ danh tiếng) |
|---|---|
| 5 | +0.5 danh tiếng; `press.boost = 2` (2 đơn tới ngân sách +10%); tỉ lệ khách sao +10% trong 3 đơn |
| 4 | +0.25 danh tiếng; `press.boost = 1` |
| 3 | không đổi |
| 1–2 | `press.curious = 1`: "khách hiếu kỳ" tới xem tiệm bị chê ra sao, đơn kế ngân sách +5%. Bà Tư gọi điện kèm một mẹo may. |

### 4.3 Dự báo gu
Mỗi số báo có ô "Dự báo gu 3 ngày tới": `press.trend = { tag, until: day + 3 }`, tag lấy ngẫu nhiên theo seed ngày. Giao áo có `tags[trend] ≥ 50` thì nhận +10% tiền công ("hợp mốt"), và `trendHit` được tính cho kim. Ô này cho người chơi lý do mở báo.

### 4.4 Cấu trúc bài
```js
{ id: 'a37', day: 37, kind: 'great', clientId: 'ngoc', kim: 5,
  headline: 'HIẾM: Áo đạt 96 điểm, Madame Sa đánh rơi cả kính',
  body: ['…lead…', '…detail…', '…close…'], quote: '…Madame Sa…',
  snapIdx: 41,            // chỉ số trong s.collection (ảnh áo); null nếu bài tin hẻm
  vars: { client: 'Chị Ngọc', fabric: 'Tơ tằm đỏ Tết', tag: 'Rực rỡ', quality: 96 } }
// issue: { no: 12, day: 37, articles: [lead, ...], gossip: ['…','…'], ad: 'kevin3', trend: 'rucro' }
```
Biến dùng trong template: `{client} {role} {shop} {fabric} {tag} {tag2} {quality} {kim} {reqMiss} {event} {decor} {rival} {day}`.
- `fabric` = tên vải ở ô `than`.
- `tag`, `tag2` = hai phong cách cao nhất.
- `reqMiss` = `G.reqText(miss).toLowerCase()`.
- `decor` = tên món trang trí đắt nhất.

Chọn template bằng rng có seed `hash(articleId)`, và lưu chữ đã thay biến vào bài, để tải lại game vẫn ra đúng bài cũ.

### 4.5 Tiêu đề (42 mẫu)
```js
G.PRESS_HEAD = {
  great: [
    'HIẾM: Áo đạt {quality} điểm, Madame Sa đánh rơi cả kính',
    'Chiếc áo {fabric} hoàn hảo tới mức thước dây cũng xin chữ ký',
    'Madame Sa chấm {kim} kim: "{shop} may áo như viết thơ"',
    'Chất lượng {quality}/100, con số khiến tiệm đầu hẻm mất ngủ'
  ],
  good: [
    '{client} rạng rỡ trong áo {fabric}: hẻm Chỉ Hồng có thợ giỏi rồi!',
    'Một đường may, vạn lời khen: {shop} khiến {client} "đứng hình"',
    'Tin nóng: {client} mặc áo {shop}, cả xóm quên nấu cơm',
    '{fabric} lên ngôi! Áo dài {tag} của {shop} gây sốt',
    'Từ cuộn {fabric} tới chiếc áo trong mơ của {client}',
    '{client} ({role}) tuyên bố: "Áo này tôi mặc tới già!"'
  ],
  ok: [
    '{client} hài lòng, Madame Sa gật gù: một ngày bình yên ở {shop}',
    'Áo {tag} cho {client}: đúng đề, đủ ý, thiếu chút muối',
    'Thêm một chiếc áo {fabric} rời {shop}, khách cười tủm tỉm'
  ],
  funny: [
    '{client} dặn "{reqMiss}", {shop} nghe nhầm thành "cứ làm ngược lại"',
    'Đẹp thì đẹp thật, nhưng {client} đã dặn {reqMiss}…',
    'Bí ẩn hẻm Chỉ Hồng: vì sao chiếc áo đẹp vẫn bị "trả bài"?',
    'Thợ may {shop} được khen sáng tạo… vượt quá đề bài'
  ],
  bad: [
    'Đường may của {shop} "đi dạo" khắp tà áo, {client} bật cười',
    'Áo của {client} có một đường chỉ… tự do như gió',
    'Chuyên gia khuyên {shop}: bớt cà phê trước khi ngồi máy may',
    'Madame Sa: "Tôi thấy nhiều rồi, nhưng chưa thấy đường may nào nhảy cha-cha-cha"',
    '{client} vẫn trả tiền, kèm lời nhắn: "Lần sau em may chậm thôi nha"'
  ],
  event: {
    tet: 'Tết này mặc gì? {client} đã có câu trả lời từ {shop}',
    p2010: '20/10 ngọt ngào: {client} nhận áo mới, ai cũng muốn được tặng',
    cuoi: 'Mùa cưới: {shop} tất bật, chú rể hẻm bên than "cô dâu đẹp quá nhìn không kịp"',
    kyyeu: 'Kỷ yếu năm nay: áo {fabric} của {client} chiếm hết ống kính',
    trungthu: 'Trăng rằm tròn, đường may áo {client} cũng tròn trịa',
    p83: '8/3: {client} diện áo {tag}, cả cơ quan xin số tiệm'
  },
  rival: [
    'Siêu Tốc 24h may một ngày, {shop} may một đời: khách chọn bên nào?',
    'Kevin Khải phản hồi: "Bên mình… cũng sẽ học canh sợi"'
  ],
  chapter: {
    ch1: 'ĐẶC SAN: Hẻm Chỉ Hồng có tiệm may mở cửa trở lại!',
    ch2: 'Cuộc chiến kim chỉ đầu hẻm: tiệm nhỏ giữ chân khách bằng đường may',
    ch3: 'Đám cưới hẻm Chỉ Hồng: ba chiếc áo, một tiệm may, trăm cái bong bóng',
    ch4: 'Sao về hẻm nhỏ: showbiz xếp hàng ở {shop}',
    ch5: 'ĐÊM HỘI ÁO DÀI: {shop} nhận {kim} kim, cả khán phòng đứng dậy'
  },
  star: {
    trada: 'Trà Đắng "biến hình" trong ba giây, nhưng áo của {shop} thì đẹp mãi',
    thoa: 'Chủ tịch Phương Thoa thị sát {shop}: "Đẹp! Mà có giảm giá không em?"',
    batan: 'Bà Tân Vờ Lốc mặc áo dài "vừa vặn khổng lồ" từ {shop}',
    linhbb: 'Linh Búp Bê lên hình không cần filter, nhờ áo {fabric}',
    ngocha: 'Hồ Ngọc Hả bước ra, cả khán phòng đồng thanh: "Hả?!"',
    chiphien: 'Chị Phiền làm hẳn bài thơ tặng áo: "May khéo như {shop}, ai thấy cũng mê"',
    damvb: 'Đàm Vĩnh Biệt lấp lánh tới mức ban tổ chức tắt bớt đèn sân khấu',
    tranthanh: 'Trấn Thành Công khóc ba lần trong buổi thử áo, lập kỷ lục mới',
    sontung: 'Sơn Tung Tăng mặc áo {shop} vào MV: "không đụng hàng" là có thật',
    trangvau: 'Trắng Vâu về quê, áo mộc mà mẹ khen "con trai mẹ bảnh"',
    xuannam: 'Xuân Nam mặc áo {shop} lên chầu: Ngọc Hoàng cũng phải hỏi địa chỉ',
    _fail: '{client} vẫn đăng ảnh, caption: "Áo hơi lạ nhưng thợ dễ thương"'
  }
};
```
Cách chọn nhóm: `great` khi kim 5; `good` khi kim 4; `ok` khi kim 3. Sự kiện, sao, chương và đối thủ đè lên nhóm theo kim. Khách sao giao không đạt dùng `star._fail`.

### 4.6 Thân bài và lời Madame Sa
```js
G.PRESS_BODY = {
  lead: {
    good: ['Sáng nay, {client} rời {shop} với nụ cười kéo dài tới tận đầu hẻm.', 'Tí Flash chỉ kịp bấm một kiểu, nhưng một kiểu là đủ.'],
    bad: ['Phóng viên Tí Flash ghi nhận: khách vẫn cười. Có điều là cười hơi lâu.'],
    funny: ['Chiếc áo đẹp, khách cũng khen đẹp. Chỉ có tờ phiếu đặt may là không đồng ý.']
  },
  detail: 'Áo {co}, dáng {dang}, may bằng {fabric}, nổi bật chất {tag} ({tagVal}) và {tag2}.',
  close: ['Tiệm {shop}, số 7 hẻm Chỉ Hồng, mở cửa từ lúc chuông reo.', 'Bạn đọc muốn may y chang? Ra số 7, nhớ mang theo kiên nhẫn.']
};
G.SA_QUOTES = {
  5: ['Chèn ơi. Tôi im lặng ba giây, mà tôi chưa bao giờ im lặng ba giây.', 'Áo này mà lên sàn diễn năm chín mươi mấy là tôi giành mặc trước.', 'Đường may thẳng như lời hứa của người tử tế.'],
  4: ['Đẹp. Còn thiếu một chút "xì-tai", nhưng đẹp.', 'Tôi cho bốn kim. Kim thứ năm tôi cất trong túi, chờ lần sau.', 'Cưng đang đi đúng đường. Đi chậm thôi, đừng vấp.'],
  3: ['Được. Được là được, không hơn không kém.', 'Áo đúng đề, mà lòng tôi chưa rung rinh.', 'Một chiếc áo tử tế. Tử tế cũng là một loại đẹp.'],
  2: ['Cái ma-nơ-canh nó cũng hơi ngại.', 'Cưng may bằng tay hay bằng… cảm hứng vậy?', 'Tôi cho hai kim, một kim vì cái nút áo dễ thương.'],
  1: ['Tôi xin phép không bình luận, để giữ tình làng nghĩa xóm.', 'Một kim. Kim đó tôi tặng vì cưng đã dám giao.', 'Chiếc áo này có cá tính. Rất. Nhiều. Cá tính.']
};
G.KEVIN_ADS = [
  'ÁO DÀI SIÊU TỐC 24H: Đo bằng app, cắt bằng máy, mặc bằng… người. Gọi ngay!',
  'Siêu Tốc 24h KHUYẾN MÃI: may hai tặng một tờ rơi!',
  'Siêu Tốc 24h tuyển thợ canh sợi. Lương cao. Kiên nhẫn càng cao.',
  'Kevin Khải xin đính chính: máy may bên tôi KHÔNG biết hát. Nó chỉ kêu to.'
];
```

### 4.7 Màn "Báo" (`scenes/paper.js`, 1280×720)
Phong cách giấy báo cũ: nền `#f4efe3`, mực `#2a211c`, chữ serif. Ảnh áo vẽ bằng renderer rồi làm nhạt màu: phủ một lớp `globalCompositeOperation = 'saturation'` màu xám, sau đó một lớp `'multiply'` màu `#e9d9b8`. Cách này chạy trên mọi trình duyệt, không cần `ctx.filter`.
```
y 0–50    topbar(c, 'Báo Trà Đá')
y 62–650  tờ báo: card(40, 62, 1200, 588, fill '#f4efe3')
  y 74–118  masthead "BÁO TRÀ ĐÁ" (SERIF 52, căn giữa x 640), hai đường kẻ đôi ở y 124 và 128
  y 140     dòng phụ: "Số {no} · Ngày {day} · Tin hẻm nóng hổi, uống mát lạnh · Giá: 2 xu"
  CỘT TRÁI (x 60–760) — bài chính
    y 160–230  tiêu đề SERIF 30 bold, wrap tối đa 2 dòng, rộng 700
    y 238      hàng kim: 5 biểu tượng kim (vẽ: đường mảnh 18 px + lỗ kim tròn; vàng = đạt, xám = chưa)
    x 60–320, y 256–620   khung ảnh 260×364 (viền đen 2 px, chú thích nghiêng "Ảnh: Tí Flash")
    x 340–760, y 256–620  thân bài 15 px, line 22; khối trích dẫn "Kim Chỉ Nam" nghiêng, có vạch đỏ bên trái
  CỘT PHẢI (x 790–1220), ngăn với cột trái bằng vạch dọc 1 px ở x 775
    y 160–330  "TIN HẺM": 2 gossip từ G.BONDS[id].gossip của khách ♥1 trở lên (hoặc tin chung)
    y 345–455  "QUẢNG CÁO": khung viền nét đứt, một dòng G.KEVIN_ADS
    y 470–600  "DỰ BÁO GU 3 NGÀY TỚI": chấm màu + tên tag + "Áo đạt ≥ 50 điểm {tag}: +10% tiền công"
y 660–710  ‹ Số trước | "Số 12/12" | Số sau ›  (giữa); secondary "Chia sẻ bài" (x 844); primary "← Về quầy"
```
Nếu số báo có hơn một bài thì các bài phụ thành tab nhỏ "Bài 1 · 2 · 3" dưới masthead. Báo mới đến thì nút "Báo" ở quầy có chấm đỏ, kèm âm "bộp" (dùng lại `G.sfx.stamp`).

---

## 5. Lịch và sự kiện

### 5.1 Ngày trong game
- `s.day` tăng 1 mỗi lần giao áo (ở `finish.enter`).
- Một tháng có 5 ngày, nên 60 ngày là một năm.
- `month = ((s.day − 1) / 5 | 0) % 12 + 1`, `dom = (s.day − 1) % 5 + 1`.
- Game bắt đầu ở **tháng 9, ngày 1**: `day0Offset = 40`, tức tháng hiển thị tính từ `s.day + 40`. Nhờ vậy sự kiện đầu tiên (20/10) đến sau khoảng 5 đơn, rồi lần lượt mùa cưới, Tết...
- Chip lịch ở quầy (x 1000, y 64, rộng 256): "Tháng 10 · ngày 2 · 🎀 Tuần lễ 20/10".

### 5.2 Sự kiện
```js
// js/content/events.js — reqs dùng 'auto' = giá trị chuẩn của newCommission ở hạng hiện tại
G.EVENTS = [
  { id: 'p2010', name: 'Tuần lễ 20/10', months: [10], days: [1, 5], chance: 0.6, bonus: 0.2, sex: 'f',
    lines: ['Em may cho chị bộ áo tặng mẹ nhân 20/10 nha, mẹ chị chưa bao giờ được tặng áo dài.', 'Cơ quan tổ chức 20/10, chị em mặc áo dài đồng loạt, chị phải nổi nhất phòng!'],
    reqs: [['min', 'thanhlich', 'auto'], ['decor', 'theu']], goal: 3, reward: { fabric: 'lua.hongsen.tron', cm: 300, coins: 80 } },
  { id: 'cuoi', name: 'Mùa cưới', months: [11, 12], days: [1, 5], chance: 0.45, bonus: 0.2,
    lines: ['Cuối tuần em đi đám cưới bạn thân, áo phải đẹp mà không giành spotlight cô dâu!', 'Nhà có hỷ, cả họ may áo đồng phục, em làm mẫu cho cả nhà coi nha.'],
    reqs: [['min', 'sangtrong', 'auto'], ['avoid', 'den']], goal: 3, reward: { fabric: 'ren.trang.img_ren', cm: 300, coins: 100 } },
  { id: 'tet', name: 'Tết Nguyên Đán', months: [1], days: [1, 5], chance: 0.7, bonus: 0.25, lixi: true,
    lines: ['Mùng Một đi chúc Tết, áo phải đỏ phải vàng cho hên cả năm!', 'Nhà chụp ảnh Tết, em may sao cho bà ngoại khen là được.'],
    reqs: [['min', 'truyenthong', 'auto'], ['avoid', 'den'], ['decor', 'theu']], goal: 3, reward: { fabric: 'gam.do.img_gam_rong', cm: 300, coins: 150 } },
  { id: 'p83', name: 'Quốc tế Phụ nữ 8/3', months: [3], days: [1, 3], chance: 0.5, bonus: 0.15, sex: 'f',
    lines: ['8/3 năm nay chị tự thưởng cho mình một bộ áo, không chờ ai tặng nữa!'],
    reqs: [['min', 'auto', 'auto']], goal: 2, reward: { coins: 80 } },            // tag 'auto' = likes[0]
  { id: 'kyyeu', name: 'Mùa kỷ yếu', months: [5, 6], days: [1, 5], chance: 0.4, bonus: 0.15,
    lines: ['Lớp em chụp kỷ yếu ở Hồ Con Rùa, áo phải nhẹ để chạy nhảy được!'],
    reqs: [['min', 'thanhlich', 'auto'], ['max', 'sangtrong', 30], ['mat', 'voan', 50]], goal: 3, reward: { fabric: 'voan.trang.img_hoanhi', cm: 300, coins: 80 } },
  { id: 'trungthu', name: 'Trung thu', months: [8], days: [3, 5], chance: 0.6, bonus: 0.2,
    lines: ['Rằm tháng Tám em dẫn tụi nhỏ trong xóm rước đèn, áo phải vui như đèn ông sao!'],
    reqs: [['min', 'rucro', 'auto'], ['decor', 'theu']], goal: 2, reward: { fabric: 'lua.vang.tron', cm: 300, coins: 80 } }
];
```
- Trong khung ngày của sự kiện, mỗi lần rung chuông có `chance` để ra đơn chủ đề. Đơn chủ đề có khách hợp giới tính (`sex`), câu thoại lấy từ `lines`, yêu cầu là `reqs` (đã kẹp), ngân sách `×(1 + bonus)`.
- Album đóng tem sự kiện, ví dụ góc ảnh có chữ "Tết".
- Hoàn thành `goal` đơn chủ đề thì nhận `reward` qua thư, và báo ra bài `event`. Năm sau sự kiện lặp lại, phần thưởng giảm còn một nửa.
- **Tết `lixi`:** lần đầu mở game trong ngày Tết của game, Bà Tư gửi phong bao lì xì 88 xu, kèm câu "Năm mới may mắn, kim không gãy, chỉ không rối".

---

## 6. Tính năng "online" chạy được trên GitHub Pages

### 6.1 Đơn ngày (`daily`)
- **Khoá ngày:** tính theo giờ Việt Nam để cả nước dùng chung một mốc: `dateKey = new Date(Date.now() + 7*3600e3).toISOString().slice(0, 10)`.
- **Seed:** `seed = hash32('aodai|' + dateKey)` (FNV-1a), rồi `rng = mulberry32(seed)`.
- **Hộp cát (sandbox):** không đụng tới save thật. `G.daily.begin()` cất `G.state` thật vào `G.daily.real`, rồi đặt `G.state = sandbox`. Sandbox có `prestige = RANK_AT[4]` (hạng 5), 9999 xu, mỗi vải hạng ≤ 5 có 800 cm, và cờ `daily: true`. Trong lúc chơi, `G.save` không làm gì (`G.saveLock = true`). Nhờ vậy sketch, emporium và cutting chạy y nguyên, không phải sửa. Màn finish gặp cờ `daily` thì gọi `G.daily.end(r)`, trả lại state thật rồi chỉ ghi `s.daily`.
- **Khách:** chỉ chọn trong 8 khách quen (để đơn giống nhau dù người chơi bật hay tắt nhại). Gọi `G.newCommission({ rng, rank: 5, pool: regulars, kind: 'daily' })`.
- **Điểm ngày** (0–100): `round(0.7 × quality + 30 × số_yêu_cầu_đạt / tổng_yêu_cầu)`.
- **Lần đầu là chính thức:** lượt chơi đầu trong ngày là điểm "chính thức" (công bằng kiểu Wordle). Các lượt sau chỉ cập nhật "kỷ lục cá nhân".
- **Phần thưởng (vào save thật):** lần đầu hoàn thành trong ngày được `50 + 10 × min(streak, 10)` xu. `streak` tăng nếu `lastDate` là hôm qua, ngược lại về 1.
- **Lối vào:** nút "Đơn ngày" ở quầy (có chấm đỏ nếu hôm nay chưa chơi) và một nút ở màn tiêu đề.
- **Màn kết quả** (`scenes/daily.js`): điểm, chuỗi ngày, 5 ngày gần nhất, các nút "Sao chép kết quả", "Chia sẻ áo", "Về quầy".
- **Chữ chia sẻ** (không lộ thiết kế, chỉ có link):
```
Tiệm May Áo Dài · Đơn ngày 21/10/2026
Khách: Em Thảo · Điểm 87/100 · Chuỗi 🔥4
✂️ 92  📏 88  🪡 85
Yêu cầu: ✅✅✅❌
Madame Sa: 🪡🪡🪡🪡
Xem áo: https://<user>.github.io/<repo>/#d=eyJ2Ijox…
```

### 6.2 Link chia sẻ áo (`#d=`)
```js
// js/share.js
payload = {
  v: 1,
  p: ['dung', 'om', 'dai', 'dai_thang', 'quan'],                       // PART_ORDER: co, dang, tay, ta, quan
  f: ['lua.trang.img_hadong', 'lua.trang.tron', 'lua.trang.tron', 'lua.trang.tron'], // SLOTS: than, tay, co, quan
  o: { trim: 'vang', buttons: 'ngoc', head: 'khanvan', deco: null, cape: null },
  i: [['tranh', 'img_pl_sen', 3.0, 82.0, 40.0, 0.00]],                 // group, id, x, y, size, rot (làm tròn 1–2 số lẻ)
  m: 0, b: 0, s: 1.02,                                                // nam, vai rộng (broad), tỉ lệ (scale)
  c: 'hanh', q: 93, k: 5, sh: 'Tiệm May Chỉ Hồng', d: '2026-10-21'      // khách, chất lượng, kim, tên tiệm, ngày
};
hash = '#d=' + base64url(utf8(JSON.stringify(payload)))
```
- Khi lưu áo vào album, ghi thêm `part`, `fabIds`, `decorOne`, `client`, `kim`, `kind`, `day` vào snapshot (ở finish). Có các trường này thì áo nào trong album cũng tạo được link. Album cũ thiếu `part` thì ẩn nút chia sẻ.
- **Giới hạn độ dài 1500 ký tự:** nếu dài quá thì bỏ dần những món thêu nhỏ nhất. Không dùng nén, vì không cần.
- **Kiểm tra hợp lệ khi giải mã:** id nào không có trong `C.PARTS`, `C.FABRICS`, `C.DECOR` thì thay bằng giá trị mặc định. Kẹp số: `x, y` trong ±200, `size` 4–60, `s` 0.8–1.4. `sh` cắt còn 24 ký tự, chỉ giữ chữ, số, khoảng trắng và dấu tiếng Việt, và chỉ vẽ bằng `fillText` (không có nguy cơ XSS vì không dùng DOM). Nếu `c` là khách sao mà người xem tắt nhại thì bỏ `look`.
- **Màn xem áo** (`scenes/viewer.js`). Lúc boot, nếu `location.hash` bắt đầu bằng `#d=` thì vào `viewer` thay cho `title`.
  - Trái: áo trên ma-nơ-canh dưới đèn studio (dùng lại khung vẽ của finish).
  - Phải: thẻ "May tại **{sh}** · {d}", tên khách, chất lượng, kim, 5 thanh phong cách tính lại bằng `G.computeTags`.
  - Nút "Mở tiệm của bạn": xoá hash bằng `history.replaceState`, rồi vào `title`.
  - Nút **"Đặt may y chang"**: tạo một đơn trong game của người xem (xem §9).
- **Thẻ ảnh** (`G.share.card(snap)`): canvas ẩn 1080×1350 (tỉ lệ 4:5), nền giấy, chữ "BÁO TRÀ ĐÁ · Kim Chỉ Nam", ảnh áo, tên tiệm, kim, tên khách, và dòng nhỏ "Chơi miễn phí tại <url>".
  - Xuất ảnh bằng `canvas.toBlob`. Nếu `navigator.canShare({ files })` thì gọi `navigator.share`, không thì dùng `<a download="aodai-{shop}.png">`. Hành động này do người chơi bấm.
  - Sao chép link: `navigator.clipboard.writeText`, lỗi thì dùng `prompt()`.

### 6.3 "Sàn diễn" (cần backend sau này)
- **Ý tưởng:** mỗi tuần một chủ đề (seed lấy từ tuần ISO, ví dụ "Áo dài đi Đà Lạt": `min thanhlich`, `mat dui`). Mỗi người gửi một áo từ album. Người chơi bình chọn **theo cặp** ("Áo nào hợp chủ đề hơn?"). Điểm xếp hạng theo Elo, để tránh cảnh áo nào được nhiều người biết thì thắng. Kết quả công bố thứ Hai. Top 10 lên "Báo Trà Đá bản online".
- **Bản phát hành đầu (stub):** màn **"Tủ kính"**. Người chơi ghim 3 áo trong album làm "hồ sơ tiệm". Khi có backend, Tủ kính chính là hồ sơ công khai. Nút "Sàn diễn" hiện nhãn "Sắp mở". Chế độ thử offline: một trận bình chọn với 3 áo NPC sinh theo seed tuần (do Kevin, Chị Vy, Madame Sa "gửi"), để kiểm tra giao diện.

### 6.4 Adapter `G.net` (bản phát hành dùng `LocalNet`)
```js
// js/net.js — mọi hàm là async, đều trả Promise; UI không biết đang dùng backend nào
G.net = {
  kind: 'local',            // 'local' | 'supabase'
  online: false,
  async init() {},                                          // gọi ở boot, không được làm hỏng game nếu lỗi
  async me() { return { id: 'local', name: G.state.shopName }; },
  async submitDaily({ date, score, firstTry, payload }) { /* local: lưu vào s.daily */ return { accepted: true, rank: null }; },
  async dailyBoard(date, { limit = 20 } = {}) { return []; }, // local: [] → UI hiện "Bảng xếp hạng sắp mở"
  async publishDress({ payload, title }) { return { id: null, url: G.share.url(payload) }; }, // local: link hash
  async getDress(id) { return null; },
  async showcase(list) { /* lưu 3 snapshot index */ },
  async runwayTheme(week) { return G.runway.localTheme(week); },
  async runwayEnter(week, payload) { return { ok: false, reason: 'offline' }; },
  async runwayPair(week) { return G.runway.npcPair(week); },
  async runwayVote(week, aId, bId, winnerId) { return { ok: true }; },
  async runwayResults(week) { return []; },
  async report(kind, id, reason) { return { ok: true }; }
};
// Sau này: G.net = G.makeSupabaseNet({ url, anonKey }) — cùng chữ ký hàm. Chọn adapter bằng G.CFG.net.
```
Quy tắc: UI luôn gọi `await G.net.x()` trong `try/catch`, và lỗi mạng luôn quay về trạng thái offline mà không chặn người chơi.

### 6.5 Schema Supabase sau này (tham khảo)
```sql
-- Đăng nhập ẩn danh (anonymous sign-in) → auth.users
create table profiles (id uuid primary key references auth.users on delete cascade,
  shop_name text not null check (char_length(shop_name) between 1 and 24),
  created_at timestamptz default now(), banned boolean default false);
create table dresses (id bigint generated always as identity primary key,
  owner uuid not null references profiles(id) on delete cascade,
  payload text not null check (char_length(payload) <= 2000),
  tags jsonb not null,            -- server tính lại từ payload
  quality int check (quality between 0 and 100),
  hidden boolean default false, created_at timestamptz default now());
create table daily_scores (date date not null, owner uuid not null references profiles(id),
  score int not null check (score between 0 and 100), first_try boolean not null,
  dress_id bigint references dresses(id), created_at timestamptz default now(),
  primary key (date, owner));
create table runway_entries (week text not null, owner uuid not null references profiles(id),
  dress_id bigint not null references dresses(id), elo int default 1000, matches int default 0,
  primary key (week, owner));
create table runway_votes (week text not null, voter uuid not null references profiles(id),
  a uuid not null, b uuid not null, winner uuid not null, created_at timestamptz default now(),
  primary key (week, voter, a, b));
create table reports (id bigint generated always as identity primary key, reporter uuid, kind text, target text, reason text, created_at timestamptz default now());
-- RLS: select công khai cho dresses (hidden=false), daily_scores, runway_entries; insert/update chỉ khi owner = auth.uid().
-- Ghi daily_scores/runway_entries CHỈ qua Edge Function (bảng không cấp quyền insert trực tiếp).
```

### 6.6 Chống gian lận (cho bản có backend)
- **Phong cách và yêu cầu kiểm được 100%:** Edge Function nạp `catalog.js` và `state.js` (thuần JS, dùng một lớp `G` giả) rồi tính lại `computeTags` và `reqCheck` từ payload. Payload sai thì từ chối.
- **Chất lượng không kiểm được tuyệt đối,** vì nó đến từ thao tác cắt và may của người chơi. Có thể làm:
  - Gửi kèm bản tóm tắt thao tác: số đoạn may, thời gian từng đường, độ lệch trung bình. Server loại các trường hợp phi lý, ví dụ may xong 6 đường trong 3 giây, hay độ lệch luôn bằng 0.
  - Làm tròn điểm.
  - Bảng xếp hạng ngày xếp theo điểm, hoà thì xếp theo phần phong cách kiểm được.
  - Đánh dấu ngoại lệ thay vì cấm ngay.
- Giới hạn: mỗi người 1 điểm chính thức mỗi ngày, `first_try` do server quyết theo lần ghi đầu. Giới hạn tần suất theo `auth.uid()` và IP. Mỗi người một phiếu cho mỗi cặp áo, và không tự bình chọn cho áo mình.
- Văn bản người chơi nhập chỉ có `shop_name`: lọc từ tục ở server, có nút báo cáo, và quản trị viên ẩn được.

### 6.7 Nhân vật nhại khi phát hành công khai (khuyến nghị)
1. **Lời miễn trừ trong game:**
   - Hiện ở chân màn tiêu đề và lần đầu một khách sao bước vào: *"Các nhân vật 'người nổi tiếng' trong game là hư cấu, nhại vui tên và phong cách sân khấu, không đại diện và không liên quan tới người thật."*
   - Thêm trong mục "Giới thiệu": "Nếu bạn là người được nhại và không muốn xuất hiện, hãy liên hệ để gỡ."
2. **Công tắc:** `G.CFG.parody = 'on' | 'safe' | 'off'`, kèm nút đổi trong màn tiêu đề (mục "Cài đặt").
   - `safe` là mặc định cho bản công khai: loại các nhân vật có cờ `risk: 'high'`.
   - `off` loại toàn bộ khách `star`. Chương 4 khi đó dùng biến thể "đài truyền hình" và counter `vipServed`.
3. **Gắn `risk: 'high'`** (mặc định ẩn ở `safe`) cho những nhân vật mà người thật được nhại từng vướng tranh cãi hoặc vụ việc pháp lý được báo chí đưa tin rộng. Nhại họ dễ bị hiểu là ám chỉ chuyện đó:
   - **Chủ tịch Phương Thoa**: đề xuất thay hẳn bằng nhân vật gốc, ví dụ "Bà Chủ Hột Xoàn" (bà chủ tiệm kim hoàn mê giảm giá), giữ nguyên cái duyên "có giảm giá không em".
   - **Bà Tân Vờ Lốc**: giữ ở `on`, ẩn ở `safe`.
   - Kỹ sư rà lại danh sách này trước khi phát hành. Không thêm nhân vật nào dựa trên người đang có vụ việc.
4. **Chị Phiền:** đổi `role` thành `'nhà thơ livestream'` (bỏ chữ "chị" trong ngoặc kép và chữ "cơ bắp"), vì đùa về vóc dáng hay giới tính dễ thành chế giễu. Cái duyên của chị là thơ. Áo của chị luôn được may nghiêm túc, đẹp như mọi khách khác. Giữ `broad` như một dáng người bình thường, không bao giờ biến nó thành câu đùa.
5. **Không dùng nhân vật nhại** trong ảnh bìa, store page, quảng cáo, thumbnail. Không bắt chước giọng nói. Không chép nguyên câu cửa miệng có bản quyền hay lời bài hát. Không bao giờ nhắc đời tư, chính trị, scandal.
6. Đây là khuyến nghị thiết kế, không phải tư vấn pháp lý. Nếu phát hành có doanh thu, nên hỏi luật sư về quyền nhân thân và quyền hình ảnh (Bộ luật Dân sự Việt Nam).

---

## 7. Kinh tế và tiến trình

### 7.1 Đường cong hạng mới (bắt buộc)
Hiện tại `rank = 1 + floor(prestige)` và mỗi đơn đạt được +1, nên lên hạng 10 chỉ sau khoảng 9 đơn, quá nhanh với 6 chương truyện. Thay bằng ngưỡng:
```js
G.RANK_AT = [0, 3, 7, 12, 18, 25, 33, 42, 52, 63]; // prestige cần để đạt hạng 1..10
G.rank = () => { let r = 1; while (r < 10 && G.state.prestige >= G.RANK_AT[r]) r++; return r; };
G.rankProgress = () => { const r = G.rank(); if (r >= 10) return 1; return (G.state.prestige - G.RANK_AT[r - 1]) / (G.RANK_AT[r] - G.RANK_AT[r - 1]); };
```
- **Nguồn danh tiếng:** đơn đạt +1, chưa đạt +0.25, đơn tâm sự hay đơn chương đạt +1 thêm, báo 4 kim +0.25, báo 5 kim +0.5, xong chương +1.
- **Nhịp dự kiến:** hạng 5 sau khoảng 14 đơn, hạng 7 sau khoảng 26 đơn, kết mùa khoảng 30–35 đơn (6–8 giờ chơi).
- **Migration:** `oldRank = min(10, 1 + floor(p))`, `p' = RANK_AT[oldRank−1] + frac(p) × (RANK_AT[oldRank] − RANK_AT[oldRank−1])`. Cách này giữ nguyên hạng hiện có, nên không mất mẫu đã mở.
- `topbar` dùng `G.rankProgress()` cho thanh tiến trình.

### 7.2 Quy mô thưởng
Ngân sách đơn thường là `180 + 45×hạng + 0–80`: khoảng 225–305 xu ở hạng 1, 405–485 ở hạng 5, 495–575 ở hạng 7.

| Nguồn | Giá trị | So với một đơn thường |
|---|---|---|
| Ngân sách cộng theo thân tình | +4%/cấp, tối đa +20% | — |
| Đơn tâm sự 1 | ngân sách ×1.3, thưởng 100–150 xu + 200 cm vải | khoảng 1.8 đơn |
| Đơn tâm sự 2 | ×1.3, thưởng 180–230 xu + 300 cm vải | khoảng 2 đơn |
| Quà ♥3 (300 cm vải đặc trưng) | 3 m × 14–60 xu, tức 42–180 xu | khoảng 0.3 đơn |
| Giảm giá ♥5 | −10% cho `mats[0]` | nhỏ, lâu dài |
| Tặng quà (100 cm) | tốn 14–72 xu, đổi lấy +2 đến +6 điểm thân tình | lựa chọn có chi phí |
| Sự kiện | ngân sách +15–25%; xong mốc thì +80–150 xu + vải | — |
| Báo 4–5 kim | +10% cho 1–2 đơn tới | — |
| Dự báo gu | +10% | — |
| Thưởng chương | 150 / 0 + vải / 250 / vải / 400 | — |
| Đơn ngày | 50–150 xu/ngày | khoảng 0.2–0.4 đơn, đủ hấp dẫn mà không phá kinh tế |
| Lì xì Tết | 88 xu | — |

Các bonus **cộng dồn kiểu cộng, không nhân**: `budget × (1 + bond + event + press + trend)`, tổng trần +50%.

---

## 8. Kế hoạch triển khai
Thứ tự script mới trong `index.html`:
- Sau `state.js`: `rng.js, config.js, content/story.js, content/bonds.js, content/press.js, content/events.js, dialog.js, bond.js, story.js, press.js, calendar.js, share.js, daily.js, net.js`.
- Sau `gallery.js`: `scenes/paper.js, scenes/mail.js, scenes/clients.js, scenes/viewer.js, scenes/daily.js`.

### M1 — Nền tảng (state v3, rng, hộp thoại, dựng đơn)
- **Mới `js/rng.js`:** `G.hash32(str)` (FNV-1a), `G.mulberry32(seed) → () => [0,1)`, `G.rpick(rng, arr)`, `G.dateKeyVN()`.
- **Mới `js/config.js`:** `G.CFG = { parody: 'on', net: 'local', baseUrl: location.origin + location.pathname }`. `parody` đọc đè từ `s.settings.parody`.
- **Mới `js/dialog.js`:** `G.Dialog = { active, open(scriptId, vars, onDone), draw(c), key(e) }`.
  - Khung thoại: `U.card(40, 500, 1200, 190)`. Chân dung khách hoặc NPC ở x 60–220 (vẽ áo và mặt bằng `desk.clientLook` + `G.art.garment`, cắt khung 160×170 phần ngực và đầu). Tên người nói màu `T.accent`. Chữ hiện dần 50 ký tự/giây.
  - Lựa chọn hiện thành 2 nút. Các hành động `do` gọi `G.story.act(step)`.
- **Sửa `js/core.js`:**
  - Trong `frame`, sau `G.scene.draw(c)`: nếu `G.Dialog.active` thì phủ nền tối 35% và đẩy một hit toàn màn `{ id: 'dlg_bg', x: 0, y: 0, w: G.W, h: G.H, cb: () => G.Dialog.next() }`, rồi tới các nút của hộp thoại. `hitTest` duyệt ngược nên hộp thoại luôn ở trên.
  - Khi `G.Dialog.active`, bỏ qua `scene.key` và `scene.down`.
  - Sửa `G.boot`: nếu hash là `#d=` thì `G.go('viewer')`.
- **Sửa `js/state.js`:**
  - `newState()` có thêm:
    ```js
    v: 3, shopName: 'Tiệm May Chỉ Hồng', day: 1, badges: [],
    bond: {},                                   // id → { pts, lvl, arc: 0|1|2, gifted: false, met: false }
    story: { ch: 0, phase: 'intro', counters: {}, flags: {}, queue: [], sinceArc: 0 },
    press: { issues: [], unread: 0, boost: 0, curious: 0, trend: null, lastIssueDay: 0, nextId: 1 },
    mail: [], mailUnlocked: false,
    events: { progress: {}, years: {} },
    daily: { results: {}, streak: 0, lastDate: null },
    settings: { parody: null, disclaimerSeen: false },
    showcase: []
    ```
  - `G.load()` migration: `if ((s.v || 2) < 3) G.migrate3(s)`.
    - Đổi `prestige` theo §7.1.
    - `bond[id].pts = round(friends[id] × 10)` rồi tính `lvl`.
    - `story.ch`: nếu `served ≥ 3` thì nhảy thẳng tới chương lớn nhất mà hạng cho phép, đặt `phase: 'intro'` để phát intro của chương đó (bỏ qua ch0). Không thì `ch: 0`.
    - `shopName` mặc định. Giữ `friends` nhưng không dùng nữa.
    - Đặt `v = 3`.
  - Thêm `G.RANK_AT`, `G.rank`, `G.rankProgress` (§7.1).
  - Tách hàm dựng đơn:
    ```js
    // spec: { client, kind: 'normal'|'story'|'arc'|'event'|'daily'|'chapter'|'copy', title, line, reqs: [[...]], budgetMul, quality, rank, rng, flags }
    G.makeCommission = function (spec) { /* resolve 'auto', kẹp min (≤ floor(maxTag×0.65)), sửa max bằng minCapped (+8, >50 thì bỏ),
       đổi mat chưa mở → mat đã mở của khách, decor không hợp → 'theu'; budget = round10((180+45r+rng*80) × budgetMul × (1+bonuses));
       quality = spec.quality ?? min(80, 45+3r) − (bond lvl≥3 ? 5 : 0) + (flags.rival ? 5 : 0) */ };
    G.newCommission = function (opts) { /* như cũ nhưng dùng opts.rng || Math.random, opts.rank || G.rank(), opts.pool; trả về spec → makeCommission */ };
    ```
    Thay mọi `Math.random()`/`G.pick` trong `newCommission` bằng `rng()`/`G.rpick(rng, …)`.
  - `G.client(id)` tìm thêm trong `G.NPCS`. Khách sao bị lọc theo `G.CFG.parody`: `G.clientsAllowed()`.
  - Commission có thêm trường `kind`, `title`, `refId` (id arc, event hay chapter), `flags`.
- **Sửa `js/ui.js`:**
  - `commission()`: nếu có `com.title` thì hiện ruy-băng màu theo `kind` (tâm sự: hồng, sự kiện: vàng, chương: đỏ, ngày: xanh) và tiêu đề. Có `flags.rival` thì vẽ mẩu giấy vàng xoay 4°.
  - `topbar` dùng `G.rankProgress()`, hiện `s.shopName` thay cho chữ cố định, có huy hiệu `badges`.

### M2 — Độ thân tình
- **Mới `js/content/bonds.js`:** `G.BONDS` với đủ 19 khách (§3.5). Hằng số `G.BOND_AT`, `G.BOND_NAMES`.
- **Mới `js/bond.js`:**
  - `G.bond.get(id)`
  - `G.bond.add(id, pts, why) → { lvlUp: bool, lvl, unlocks: [] }`
  - `G.bond.onDelivery(r, job) → { gained, lines: [], lvlUp }` (tính theo bảng §3.1)
  - `G.bond.arcReady(id)`
  - `G.bond.arcCommission(id)` (đi qua `makeCommission`, `kind: 'arc'`, `budgetMul: 1.3`)
  - `G.bond.gift(id, fabricId)`
  - `G.bond.discount(fabricId)` (cho emporium và nút mua vải ở sketch)
  - Khi lên ♥3: thêm vải `sig` vào kho và toast. Khi lên ♥5 sau arc 2: `G.mail.add(letter)`.
- **Sửa `scenes/finish.js`:**
  - Bỏ dòng `s.friends[...]`, thay bằng `this.bond = G.bond.onDelivery(r, j)`.
  - Nếu là đơn arc mà đạt: `bond.arc++` và nhận `reward` (xu + vải).
  - Thẻ phán quyết thêm một khối ở y ≈ 560: "♥ +16 thân tình · Khách quen!" (thanh nhỏ 0–100), cùng các dòng mở khoá.
- **Sửa `scenes/desk.js`:**
  - Khách ♥1 trở lên dùng `greet` thay cho `line`, trừ khi đơn có `line` riêng.
  - Nút "Tặng quà" (ghost, x 660, y 630) mở panel 6 ô vải trong kho có ≥ 100 cm (lưới 3×2 ở x 660–1000, y 360–600, dùng `U.swatch`). Bấm một ô thì `G.bond.gift`, hiện câu khách đáp lại, và ẩn nút đến hết lượt.
  - Thêm nút "Sổ khách" ở góc trái trên (cạnh "Album").
- **Mới `scenes/clients.js` (Sổ khách):**
  - Lưới 5 cột × 2 hàng mỗi trang, thẻ 220×250.
  - Mỗi thẻ có: chân dung nửa người, tên, vai trò, ♥ 0–5, thanh điểm, dòng "Ưa: {likes} · {mats}", và trạng thái arc (○ ◐ ●).
  - Khách chưa gặp (`met: false`) hiện bóng đen và dòng "Chưa ghé tiệm".
  - Trang 2 dành cho khách sao (ẩn nếu tắt nhại). Bấm vào thẻ thì đọc lại thư nếu đã có.

### M3 — Cốt truyện và hộp thư
- **Mới `js/content/story.js`:** `G.NPCS` (§2.2), `G.CHAPTERS`, `G.STORY_ORDERS`, `G.SCRIPTS` (§2.5).
  ```js
  G.CHAPTERS = [
    { id: 'ch0', title: 'Chương 0 · Chìa khoá tiệm cũ', rank: 1, intro: 'ch0_open', outro: 'ch0_end',
      goals: [{ k: 'success', n: 3, t: 'Giao thành công 3 áo' }], reward: { coins: 150, mail: true } },
    { id: 'ch1', title: 'Chương 1 · Báo Trà Đá ghé hẻm', rank: 2, intro: 'ch1_open', outro: 'ch1_end',
      goals: [{ k: 'kim3', n: 1, t: 'Lên báo với ít nhất 3 kim' }, { k: 'bondL1', n: 3, t: 'Làm thân với 3 khách (♥1)' }],
      reward: { fabric: 'lua.champagne.img_hadong', cm: 300, paper: true } },
    // ch2..ch5 như bảng §2.3
  ];
  G.STORY_ORDERS = {
    ch0_batu: { client: 'batu', title: 'Áo về Hội An', line: 'Một bộ lụa giản dị thôi con, bà mặc về Hội An.', reqs: [['min','truyenthong',20], ['mat','lua',50]], budget: 200, quality: 40 },
    ch3_uyen: { client: 'uyen', title: 'Áo cưới cô dâu', line: 'Áo cưới của em… em chỉ cưới một lần thôi đó!', reqs: [['min','sangtrong','auto'], ['min','thanhlich','auto'], ['avoid','den'], ['decor','dau']], budgetMul: 1.5 },
    ch3_nam:  { client: 'nam', title: 'Áo bà nội chồng', line: 'Bà phải sang mà không lấn cô dâu nghe cháu.', reqs: [['min','truyenthong','auto'], ['max','rucro',35], ['mat','gam',50]], budgetMul: 1.4 },
    ch3_thao: { client: 'thao', title: 'Áo phù dâu', line: 'Phù dâu mà, đẹp vừa vừa thôi chị!', reqs: [['min','thanhlich','auto'], ['max','sangtrong',30], ['mat','voan',50]], budgetMul: 1.3 },
    ch5_open: { client: 'sa', title: 'Áo mở màn', reqs: [['min','truyenthong',45], ['min','thanhlich',30], ['decor','tranh']], budgetMul: 1.6 },
    ch5_muse: { client: '@topBond', title: 'Người mẫu chính', reqs: [['min','@like0',50], ['mat','@mat0',50]], budgetMul: 1.6 },
    ch5_finale: { client: 'kevin', title: 'Áo hai tiệm cùng may', reqs: [['min','truyenthong',35], ['min','hiendai',35], ['mat','lua',50]], budgetMul: 1.8 }
  };
  ```
- **Mới `js/story.js`:**
  - `G.story.count(k, n = 1)` tăng counter.
  - `G.story.recount()` tính lại các counter suy ra được từ dữ liệu, như `bondL1` và `bondL2` (số khách đạt cấp đó).
  - `G.story.goalsDone()`.
  - `G.story.onDesk()`, gọi ở `desk.enter`:
    - Nếu `phase === 'intro'` và `rank ≥ ch.rank` thì `Dialog.open(ch.intro)` rồi đặt `phase = 'play'`.
    - Nếu `phase === 'play'` và mục tiêu đã đủ thì phát `outro`, nhận thưởng, đặt `ch++` và `phase = 'intro'`. Riêng ch5 thì `phase = 'done'`.
  - `G.story.onDelivery(r, job)`:
    - Tăng `success`, `starServed`/`vipServed`, `keepVsRival` (ch2, `flags.rival` và chất lượng ≥ 80), `arc1Done`.
    - Đánh dấu đơn chương đã xong.
    - Ở ch5 thì cộng kim của 3 áo vào `flags.finaleKim`.
  - `G.story.act(step)` thực thi các hành động `nameShop | queueOrder | giveFabric | coins | flag | mailUnlock | walkIn | walkOut | photo`.
  - `walkIn` đặt `desk.cameo = id`, để desk vẽ NPC đó trượt vào bằng renderer khách.
  - `G.nextVisit()` (§3.3) trả về một commission. `desk.ring()` gọi hàm này thay cho `G.newCommission()`.
  - Quy ước chương: ch0–3 thì `starChance = 0.1`, từ ch4 thì `0.35` (khi `parody != 'off'`). Ở ch2, 50% đơn thường có `flags.rival`.
- **Mới `js/mail` (đặt trong story.js):** `G.mail.add(m)`, `G.mail.unread()`.
- **Mới `scenes/mail.js` (Hộp thư):**
  - Trái (x 40–420): danh sách thư (phong bì, chấm đỏ nếu chưa đọc, người gửi, tiêu đề).
  - Phải (x 440–1240): tờ thư nền `#fffaf0` có kẻ dòng mờ, chữ `G.SERIF` nghiêng 18 px.
  - Nếu thư có quà thì có nút "Nhận quà".
- **Sửa `scenes/title.js`:**
  - Bấm "Mở cửa tiệm" (game mới) thì `G.reset()`, `G.go('desk')`, và `story.phase = 'intro'` sẽ phát `ch0_open`.
  - Thêm nút "Cài đặt" (bật/tắt nhại) và dòng miễn trừ ở chân màn.
- **Sửa `scenes/desk.js`:** gọi `G.story.onDelivery` từ finish; ở `enter` gọi `G.story.onDesk()`. Thêm thẻ chương nhỏ (x 24, y 116, 330×86): tên chương và mục tiêu dạng ✓/○.

### M4 — Báo Trà Đá
- **Mới `js/content/press.js`:** `G.PRESS_HEAD`, `G.PRESS_BODY`, `G.SA_QUOTES`, `G.KEVIN_ADS` (§4.5–4.6).
- **Mới `js/press.js`:**
  - `G.press.kim(r, job)`.
  - `G.press.onDelivery(r, job, snapIdx)`: tạo bài, `issues.push` thành một số báo mới, `unread++`, áp hiệu ứng ở §4.2, và đếm `kim3`/`kim4` cho story.
  - `G.press.filler()`.
  - `G.press.chapterIssue(chId)`.
  - `G.press.fill(tpl, vars)`.
  - Chỉ giữ 40 số báo gần nhất.
- **Sửa `scenes/finish.js`:** sau khi push vào collection thì gọi `G.press.onDelivery(r, j, s.collection.length - 1)`. Nếu có bài thì thêm dòng "📰 Tí Flash vừa chụp ảnh, đón đọc Báo Trà Đá số {no}". Snapshot ghi thêm `kim`.
  - *Lưu ý:* `collection` đang bị cắt khi quá 60 phần tử (`shift`), làm lệch `snapIdx`. Đổi sang lưu `snapId` (id tăng dần `s.snapSeq`) và tìm theo id. Nếu áo không còn trong album thì báo hiện khung "ảnh đã thất lạc".
- **Mới `scenes/paper.js`:** bố cục §4.7.
- **Sửa `state.js` (`makeCommission`):** đưa `press.boost`, `press.curious` và trend vào bonus ngân sách; trừ `boost` khi tạo đơn.
- **Sửa `G.scoreJob`:** thêm `r.trendHit`. Nếu `tags[trend] ≥ 50` thì `r.pay += round(budget × 0.1)` (chỉ khi đạt).
- **Sửa desk:** nút "Báo" (chấm đỏ nếu `unread`). Lần đầu một số báo mới xuất hiện thì có âm "bộp" và toast "Tí Flash vừa bỏ báo vào khe cửa!".

### M5 — Lịch và sự kiện
- **Mới `js/content/events.js`:** `G.EVENTS` (§5.2).
- **Mới `js/calendar.js`:**
  - `G.cal.date(day) → { month, dom, label }`
  - `G.cal.activeEvent() → event|null`
  - `G.cal.eventCommission(ev)` (lọc khách theo `sex`; reqs qua `makeCommission`)
  - `G.cal.onDelivery(r, job)` (tăng `events.progress[id]`, đủ `goal` thì gửi thư thưởng)
  - Lì xì Tết: một lần cho mỗi năm game, đánh dấu ở `events.years`.
- **Sửa `G.nextVisit`:** sau bước hàng đợi, nếu có sự kiện và `rng < chance` thì ra đơn sự kiện.
- **Sửa desk:** chip lịch. **Sửa finish:** `s.day++`. **Sửa gallery:** tem sự kiện trên thẻ áo (`it.ev`).

### M6 — Chia sẻ áo
- **Mới `js/share.js`:**
  - `G.share.encode(snap)`, `G.share.decode(hash) → payload|null` (kiểm hợp lệ như §6.2)
  - `G.share.url(payload)`, `G.share.copy(text)`
  - `G.share.card(snap) → Promise<Blob>`, `G.share.shareCard(snap)`
  - `G.share.toSnap(payload)`: dựng lại `design` bằng cách giả lập job (`{ part, fabs, decor, com: { male, broad, client } }`) rồi gọi `G.jobDesign`.
- **Sửa finish:** snapshot ghi thêm `part: {...j.part}`, `fabIds: {...j.fabs}`, `decorOne: { trim, buttons, head, deco, cape }`, `client`, `kind`, `ev`, `day`, `id`. Thêm nút secondary "Chia sẻ áo" (x 620).
- **Sửa gallery:** bấm một thẻ thì mở lớp phủ chi tiết, có các nút "Sao chép link", "Tải thẻ ảnh", "Ghim vào Tủ kính".
- **Mới `scenes/viewer.js`:** như §6.2, kèm nút "Đặt may y chang" (§9).

### M7 — Đơn ngày
- **Mới `js/daily.js`:**
  - `G.daily.key()`, `G.daily.played(key)`
  - `G.daily.begin()`: tạo sandbox, `G.saveLock = true`, `G.state.commission = G.newCommission({ rng, rank: 5, pool: regulars, kind: 'daily' })`, rồi `G.go('desk')`. Ở desk, khách bước vào như thường; nếu `daily` thì nút "Từ chối" biến thành "Bỏ đơn ngày".
  - `G.daily.end(r)`: tính điểm, trả lại state thật, `saveLock = false`, ghi `s.daily.results[key] = { score, first, best, payload, q, reqs: [bool], kim }`, cập nhật streak, cộng xu, `G.save()`, `await G.net.submitDaily(...)`.
  - `G.daily.shareText(res)`.
- **Sửa `G.save`:** `if (G.saveLock) return;`.
- **Sửa finish:** `if (G.state.daily) { G.daily.end(r); G.go('daily'); return; }`, đặt ở đầu `enter`, sau khi tính `r` và **trước** khi cộng xu, danh tiếng, thân tình. Album, báo và thân tình đều bỏ qua đơn ngày.
- **Mới `scenes/daily.js`:** màn kết quả §6.1. Topbar khi đang chơi đơn ngày hiện "Đơn ngày 21/10" ở giữa.

### M8 — `G.net` stub và Tủ kính
- **Mới `js/net.js`:** `LocalNet` (§6.4), được `G.boot` gọi `init()` trong `try/catch`.
- `s.showcase = [snapId, snapId, snapId]`.
- Màn Tủ kính đặt làm tab thứ hai của gallery: 3 ma-nơ-canh lớn, nút "Sàn diễn (sắp mở)".
- Viết sẵn `docs/` schema (§6.5), nhưng chưa có mã Supabase.

### M9 — Nhại vui, miễn trừ, hoàn thiện
- Thêm `risk: 'high'` vào khách tương ứng trong `catalog.js`, đổi `role` của Chị Phiền (§6.7).
- Màn miễn trừ lần đầu gặp khách sao (`settings.disclaimerSeen`).
- Bộ lọc `G.clientsAllowed()` dùng ở `newCommission`, Sổ khách, `@topBond`, và `viewer` (bỏ `look`).
- Cập nhật README: thêm mục "Hệ thống mới".

### Kiểm thử nhanh mỗi milestone
- Mở save v2 cũ: kiểm tra hạng giữ nguyên, thân tình chuyển đúng, không lỗi console.
- `localStorage.clear()` rồi chơi ch0: kiểm tra đặt tên, đơn Bà Tư, outro, thư.
- Ép bằng console: `G.state.prestige = 25; G.state.story.ch = 5` rồi kiểm tra intro ch5 và `@topBond`.
- Đơn ngày: hai tab cùng ngày phải ra **cùng** khách và yêu cầu. Bỏ ngang giữa chừng thì save thật không đổi.
- Link `#d=`: dán link hỏng hoặc sửa tay phải ra màn xem với giá trị mặc định, không treo.
- Tắt nhại: không còn khách sao ở bất cứ đâu; ch4 chạy biến thể TV.

---

## 9. Bất ngờ nho nhỏ
1. **Tiếng chuông riêng.** Khách lên ♥5 thì chuông cửa reo một điệu nhạc riêng (3–4 nốt WebAudio trong `audio.js`, mỗi khách một mảng `bell: [523, 659, 784]`). Lâu dần người chơi nghe chuông là biết ai tới, trước cả khi khách bước vào.
2. **"Đặt may y chang" từ link bạn bè.** Mở link `#d=` của người khác, bấm "Đặt may y chang", thì trong game của mình xuất hiện khách *"Bạn của {sh}"*: *"Bạn tôi khoe cái áo này trên mạng, em may cho tôi một cái na ná được không?"*. Yêu cầu là 2 phong cách cao nhất của áo gốc ×0.8 (đã kẹp theo hạng) cộng chất liệu chính. Giao xong thì thẻ ảnh có dòng "May theo cảm hứng từ {sh}". Đây là vòng lặp xã hội không cần server.
3. **Madame Sa đính chính.** Khoảng 1/8 số báo, bà "viết nhầm" tên vải (ví dụ gọi lụa là "lụa… à mà thôi"). Số báo sau có mục **"ĐÍNH CHÍNH"**: "Hôm trước tôi viết 'nhung', thật ra là tơ tằm. Tôi già rồi, mắt kém, nhưng gu thì không kém."
4. **Ngày thật trùng ngày lễ.** Theo đồng hồ máy (giờ Việt Nam):
   - Vào 20/10 hoặc 8/3, màn tiêu đề có thêm cành hoa thêu (dùng lại ảnh `img_pl_maudon`) và thư của Bà Tư chúc mừng.
   - Ngày Tết dương và Tết âm (bảng ngày Tết âm 2027–2030 viết cứng) thì có lì xì đăng nhập.
   - Đơn ngày của những hôm đó luôn là đơn chủ đề.
5. **Màn chào cuối mùa.** Kết chương 5, mỗi khách đã gặp lần lượt bước qua sàn diễn (trượt ngang như ở desk) trong **chiếc áo chất lượng cao nhất người đó từng nhận** từ album. Kèm theo là một dòng nhớ lại đơn đầu tiên của họ ("Cô Hạnh · Buổi dạy cuối · 94 điểm"). Cuối cùng Bà Tư cúi chào. Không cần art mới, toàn bộ là album của chính người chơi.

---

## Nguồn
1. iXBT.games, *Fashion Verdict on a Sewing Simulator: Dressmaker Review* (05/10/2026): https://ixbt.games/en/reviews/2026/10/05/439975-modnyi-prigovor-sveinomu-simuliatoru-obzor-dressmaker.html
2. Plugged In, Dressmaker review: https://www.pluggedin.com/?p=42909
3. SimsCommunity, *Dressmaker release: new cozy game out now*: https://simscommunity.info/2026/09/23/dressmaker-release-new-cozy-game-out-now/ ; GosuGamers, *Cosy tailoring game Dressmaker becomes latest viral hit on Steam*: https://www.gosugamers.net/entertainment/news/79250-cosy-tailoring-game-dressmaker-becomes-latest-viral-hit-on-steam ; 80.lv: https://80.lv/articles/this-simulation-game-lets-you-cut-and-sew-your-own-dresses
4. G&B Magazine, *A Brief Guide to Making the Next Wordle*: https://www.gandbmagazine.com/article/2022/04/a-brief-guide-to-making-the-next-wordle
5. *How to Build Your Own DLE Games* (mốc ngày UTC, chia sẻ dạng lưới, streak): https://aiidelist.com/blog/how-to-build-your-own-dle-games.md ; gamedev.net, dịch vụ seed hằng ngày dùng chung: https://gamedev.net/forums/topic/720101/

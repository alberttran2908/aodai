# Tiệm May Áo Dài (prototype)

Game mô phỏng may áo dài, đi theo luồng chơi của Dressmaker. Viết bằng HTML5 Canvas và JavaScript thuần, không cần thư viện hay bước build, nên sau này có thể đóng gói bằng Capacitor.

## Chạy thử
```
powershell -ExecutionPolicy Bypass -File serve.ps1
```
Sau đó mở http://localhost:8080. Mở thẳng file `index.html` sẽ không chạy, vì các script cần được phục vụ qua HTTP.

## Vòng chơi (theo Dressmaker)
1. **Quầy**: rung chuông để khách vào. Khách kể chuyện và đưa phiếu đặt may gồm ngân sách, chất lượng tối thiểu, yêu cầu phong cách (thanh từ/tối đa) và luật cứng (chất liệu ≥ 50%, tránh màu, phải có trang trí).
2. **Đo người**: kéo thước dây ở ngực, eo, hông. Đo càng sát thì áo càng vừa.
3. **Sổ phác thảo**:
   - Tab **Kiểu dáng**: mỗi phần (cổ, dáng, tay, tà, quần) là một lưới thẻ. Mỗi thẻ có hình minh hoạ và điểm phong cách (TT+18…). Kiểu chưa mở ghi rõ hạng cần đạt.
   - Tab **Vải**: chọn ô (thân, tay, cổ, quần) rồi chọn vải, lọc theo đã có, tất cả hoặc từng chất liệu. Thẻ vải hiện điểm phong cách góp vào ô đang chọn, dấu ✓ nếu đúng chất liệu khách đòi, và cảnh báo nếu là màu khách tránh. Nút "Dùng vải này cho cả áo" gán một vải cho cả áo.
   - Bấm thẳng vào thân, tay, cổ hay quần trên hình để chọn ô vải (giống công cụ tô của Dressmaker).
   - Rê chuột lên bất kỳ lựa chọn nào: áo đổi theo ngay và thanh phong cách hiện mức tăng (▲) hoặc giảm (▼).
   - Trang trái liệt kê vải cần dùng và cho mua phần còn thiếu ngay tại chỗ ("Mua", "Mua hết phần thiếu").
   - Yêu cầu trang trí được ghi chú "ở bước trang trí" thay vì báo lỗi.
4. **Cửa hàng vải**: mua cây vải theo mét, phần thừa nằm lại trong kho. Lọc theo 8 chất liệu, khoá theo hạng.
5. **Phòng cắt**: mỗi loại vải là một cuộn nằm ngang. Kéo mảnh rập lên vải, xoay bằng R hoặc chuột phải. Đặt mũi tên canh sợi song song với biên vải thì được 100%, nghiêng thì 75%. Đổi sang kéo (C) rồi bấm mảnh để cắt. Phần vải đã dùng sẽ bị trừ khỏi cuộn.
6. **May**: các mảnh được ghim lên ma-nơ-canh. Chọn một đường may để chuyển sang máy may.
   - Kim đứng yên, người chơi đưa vải qua kim: giữ Space hoặc giữ chuột để chạy máy, lái vải bằng A/D hoặc kéo chuột sang trái/phải, đổi tốc độ bằng W/S.
   - Điểm chất lượng hiện trực tiếp trong lúc may.
   - Vải trượt quá xa khỏi đường may thì hỏng, phải may lại đường đó từ đầu.
   - Đường đã may có thể tháo chỉ để may lại.
7. **Trang trí**: một bước riêng. Đặt thêu nhỏ và tranh thêu lớn ở bất cứ đâu trên áo (kéo để dời, Q/E xoay, [ ] đổi cỡ, chuột phải để gỡ). Chọn thêm viền, cúc, đính kết, phụ kiện đầu và áo choàng voan.
8. **Giao áo**: chụp ảnh và nhận nhận xét.
   - **Chất lượng** = 30% canh sợi + 20% vừa người + 50% đường may. Vải và trang trí chỉ ảnh hưởng đến điểm phong cách.
   - Đạt mọi yêu cầu: khách trả đủ, cộng 1 danh tiếng, và thưởng thêm 15% nếu chất lượng ≥ 90.
   - Không đạt: khách chỉ trả 60%, hoặc 40% nếu chất lượng cũng không đạt.

Đơn hàng luôn làm được ở hạng hiện tại: chỉ khách có gu mà người chơi đáp ứng được mới đến, và mức trần phong cách được kiểm tra bằng bộ giải `G.minCapped`.

## Mùa 1: Hẻm Chỉ Hồng
Thiết kế đầy đủ nằm ở [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md).
- **Cốt truyện 6 chương** (`js/story.js`, nội dung trong `js/content/story.js`):
  - Người chơi nhận lại tiệm may của Bà Tư và tự đặt tên tiệm.
  - Các nhân vật chính: Madame Sa (cây bút "Kim Chỉ Nam" của Báo Trà Đá), Tí Flash (phóng viên), Kevin Khải (tiệm đối thủ "Áo Dài Siêu Tốc 24h").
  - Mỗi chương mở theo hạng và có mục tiêu riêng: đám cưới hẻm, khách sao về hẻm, Đêm Hội Áo Dài.
  - Kết mùa có màn chào cuối mùa: mọi khách đi qua sàn diễn trong chiếc áo đẹp nhất người chơi từng may cho họ. Người chơi nhận huy hiệu Đê vàng.
- **Độ thân tình ♥0–5** (`js/bond.js`, `js/content/bonds.js`):
  - Thêm điểm khi giao áo đẹp, đúng gu, đúng chất vải khách mê, hoặc tặng 1 m vải ở quầy.
  - ♥1 mở lời chào riêng và tin hẻm trên báo.
  - ♥2 và ♥4 mở hai **đơn tâm sự**.
  - ♥3 được tặng vải đặc trưng của khách.
  - ♥5 nhận thư, được giảm 10% vải và có tiếng chuông cửa riêng.
  - Xem tất cả trong **Sổ khách**.
- **Báo Trà Đá** (`js/press.js`, `js/content/press.js`):
  - Madame Sa chấm áo 1–5 kim; Tí Flash chụp ảnh áo.
  - Mỗi số báo có tin hẻm, quảng cáo của Kevin và **dự báo gu** (áo hợp mốt được +10% tiền công). Đôi khi có mục "đính chính".
  - Báo khen thì tăng danh tiếng và khách trả cao hơn. Báo chê không bao giờ làm mất gì.
- **Hộp thư**: thư của Bà Tư, khách thân, Kevin, Madame Sa; có thư kèm quà.
- **Lịch và sự kiện** (`js/calendar.js`, `js/content/events.js`):
  - Mỗi lần giao áo là một ngày, mỗi tháng có 5 ngày.
  - Sự kiện theo mùa: 20/10, mùa cưới, Tết (có lì xì), 8/3, kỷ yếu, Trung thu. Mỗi sự kiện có đơn chủ đề và thưởng.
- **Đường lên hạng** chậm lại: khoảng 30–60 đơn cho một mùa. Bản lưu cũ được chuyển sang tự động và giữ nguyên hạng.

## Kinh doanh và sinh tồn (`js/economy.js`)
Game online nên **mọi người chơi cùng một luật**: không có chế độ dễ, không công tắc nào làm đổi gameplay (chỉ có bật/tắt âm thanh). Điểm *Giá trị tiệm* và bảng xếp hạng nhờ vậy mới so được.
- **Tiệm của bạn**:
  - Cuối mỗi tháng (5 ngày) trả tiền mặt bằng (`250 + 110 × hạng`) và điện nước. Tiệm càng lớn thì tiền thuê càng cao.
  - Từ chối khách thì ngày vẫn trôi, khách sang tiệm Kevin.
  - Mỗi tháng có giá vải lên xuống và một sự kiện thị trường: chủ nhà tăng giá, mùa mưa vắng khách, phố đi bộ mở hội, Siêu Tốc 24h xả hàng, lụa mất mùa… Tin này đăng trên Báo Trà Đá.
  - Áo hỏng thì khách chỉ trả 50% (đẹp mà sai đề) hoặc 30% (đường may kém).
  - Không đủ tiền thì thành **nợ**, lãi 8%/tháng. Nợ vượt 2 tháng chi phí, hoặc 3 tháng liền còn nợ, là phá sản. Bà Tư cứu đúng một lần.
  - **Sổ sách** cho xem *Giá trị tiệm* và biểu đồ thu chi từng tháng.
- Tiệm mở từ các bản cũ (kể cả chế độ Thong thả trước đây) tự chuyển sang cùng luật này.
- **Thử thách tuần**:
  - Một ô lưu riêng, 30 ngày kinh doanh.
  - Hạt giống ngẫu nhiên theo tuần ISO, nên mọi người gặp cùng dãy khách (chỉ khách quen), cùng giá vải và cùng thị trường.
  - Kết thúc có điểm *Giá trị tiệm* để so; kỷ lục tuần lưu trên máy. Đã có sẵn chỗ cắm bảng xếp hạng online (`G.net.submitChallenge`).

Cân bằng bằng `tools/simbot.js`: bot chơi theo các mức tay nghề, tự mua vải theo giá thị trường. Kết quả sau 60 ngày:
- Chơi giỏi: giá trị khoảng 20.000 xu.
- Trung bình: khoảng 7.000–12.000 xu, chững lại khi tiền thuê tăng theo hạng.
- Ẩu: được cứu một lần, rồi phá sản khoảng ngày 40–60.

## Buôn may bán đắt (thiết kế 2, [docs/GAME_DESIGN_2.md](docs/GAME_DESIGN_2.md))
Học từ Recettear, Moonlighter, Shop Titans, Potion Craft, TCG Card Shop Simulator và Travellers Rest:
- **Ghế chờ** (`js/bench.js`):
  - Mỗi ngày 2–3 khách ngồi chờ trước quầy; bạn chọn mời ai vào.
  - Khách chờ quá 2 ngày (3 nếu có quạt trần) thì sang tiệm Kevin.
  - Đơn của cốt truyện là "Hẹn trước", không bao giờ bỏ đi.
  - Đơn càng nhiều yêu cầu thì trả càng cao, nên chỉ chọn đơn dễ cũng là đánh đổi.
  - "Để sau" đưa khách về ghế; "Đóng cửa sớm" sang ngày mới.
- **Báo giá** (`js/haggle.js`):
  - Bạn tự đặt giá 90–140% so với đề nghị của khách. Mỗi khách có một mức trần ẩn, nâng lên nhờ thân tình và báo khen.
  - Đoán đúng trần là "chốt chuẩn": thưởng chuỗi tới +5% tiền công.
  - Đòi quá cao thì khách trả giá lại một lần.
  - Giá cao thì khách đòi chất lượng cao hơn. Áo hỏng tính tiền theo giá gốc khách đề nghị.
- **Xưởng may**, chia 4 tab:
  - *Dụng cụ*: kéo, máy may, bàn ủi.
  - *Mặt tiền* (`js/front.js`): bảng hiệu, ghế chờ, quạt, phòng thử đồ, tủ kính, sạp lớn. Mỗi món có lợi riêng; vài món tăng tiền thuê.
  - *Thợ phụ* (`js/staff.js`): Bé Na, Anh Tèo, Cô Út. Họ may lại đường bạn may chưa đẹp, làm việc vặt kiếm thêm, lĩnh lương cuối tháng; nợ lương thì nghỉ.
  - *Vay vốn*: 1.000 hoặc 2.000 xu, góp 6 tháng, lãi 4%.
  - Dụng cụ và mặt tiền tính 60% vào Giá trị tiệm, nên đầu tư không làm tụt điểm.
- **Sạp hội chợ** (`js/fair.js`, `scenes/fair.js`):
  - May áo bán sẵn bằng đúng vòng may, trên ma-nơ-canh của tiệm. Mỗi áo tốn một ngày; sạp treo tối đa 3 áo, hoặc 5 với sạp lớn.
  - Cuối tháng, trước khi trả hoá đơn, bạn tự đặt giá ở hội chợ phố đi bộ.
  - Áo hợp dự báo gu trên báo có giá trị +25%. Áo ế mất 10% giá trị mỗi tháng.
- **Bảng hẻm** (`js/rivals.js`, `js/content/rivals.js`):
  - 5 tiệm đối thủ: Cô Ba Lụa, Siêu Tốc 24h của Kevin, Áo Dài Bống, Nhà May Ông Sáu, Tiệm Mới Của Tũn.
  - Đường giá trị của họ đo bằng `tools/simbot.js`.
  - Xem ở Sổ sách (tab Bảng hẻm). Báo đăng top 5 mỗi đầu tháng. Vượt Kevin lần đầu thì Kevin ghé chọc.
  - Có sẵn chỗ để sau này chèn "tiệm bóng" của người chơi thật (`G.net.alleyBoard`).

Cân bằng hiện tại (simbot, chế độ Kinh doanh, sau 60 ngày):
- Chơi giỏi: khoảng 26.000 xu.
- Trung bình: khoảng 12.000–16.000 xu.
- Ẩu: lên tới khoảng 6.000 xu quanh ngày 50, rồi trượt dần vì tiền thuê tăng theo hạng; Bà Tư cứu khoảng ngày 90, phá sản sau đó.

## Tiệm chạy cả khi bạn vắng (idle)
Theo giờ thật. Tính từ 5 phút vắng, tối đa 8 giờ; không cộng âm thầm. Lúc quay lại, quầy hiện thẻ **"Trong lúc bạn đi vắng"** để bấm nhận (`js/idle.js`). Có những gì:
- **Thợ phụ:**
  - Nhận sửa đồ lặt vặt theo giờ.
  - Cứ 3 giờ may một áo bán sẵn từ vải trơn trong kho rồi treo lên sạp.
  - Luyện tay nghề khi bạn vắng: 5 bậc, ở mốc 4/12/24/48 giờ, mỗi bậc khéo hơn 1% và tiền việc vặt tăng 10% (`js/staff.js`).
- **Bán hàng:**
  - Tủ kính có thể bán áo trên sạp cho khách qua đường, với giá 80%.
  - **Đơn shop** (`js/contract.js`): shop online đặt 2–3 áo bán sẵn trong 24 giờ, trả khoảng 1,3 lần giá hội chợ.
- **Khách:**
  - Khách thấy tiệm đóng thì **nhắn Zalo** đặt ghế chờ, trả thêm 10%.
  - Khách thân (từ "Khách quen") ghé **tặng quà**: tiền mừng, và 1 m vải ruột nếu là "Tri kỷ".
  - **Khách sang hẹn giờ** (`js/vip.js`): mỗi ngày một khung 2 giờ; mở game đúng giờ để đón, khách trả gấp rưỡi.
- **Vải:**
  - **Đặt vải sỉ** 10 m, giảm 20%, xe giao sau 1 giờ.
  - **Chậu nhuộm** ở Xưởng: 3 m vải trắng thành vải màu sau 2 giờ.
- **Mỗi ngày (giờ Việt Nam):**
  - Điểm danh nhận quà, chuỗi 7 ngày.
  - **3 nhiệm vụ** giống nhau cho mọi người (`js/quests.js`).
- **Mỗi tuần:** **Tin hẻm tuần này** (`js/week.js`). Mỗi tuần một sự kiện, giống nhau cho mọi người, xoay vòng 5 tuần:
  - Chợ đêm
  - Nắng ráo
  - Xả kho vải
  - Thợ chăm
  - Mùa cưới
- **Dài hạn:** **Thành tựu chủ tiệm**, 12 mốc có thưởng xu (`js/ach.js`).
- **Ô "Hôm nay" trên thanh công cụ** gom nhiệm vụ, khách sang, đơn shop, thành tựu và tin tuần, mục nào cần xem có chấm đỏ.

## Cài lên máy, chuyển máy
- **Cài như ứng dụng (PWA):** có `manifest.webmanifest`, `sw.js` và `icons/`. Thêm vào màn hình chính là mở toàn màn hình, xoay ngang, chơi được khi mất mạng. Chrome Android có nút "📲 Cài game lên máy" ở màn tiêu đề.
- **Chuyển tiệm sang máy khác** (⚙ Cài đặt, `js/transfer.js`):
  - Lưu file tiệm (gồm cả vải tự thiết kế), hoặc sao chép mã tiệm khoảng 4 KB để gửi qua Zalo.
  - Bên nhận được hỏi trước khi thay, và tiệm cũ được giữ làm bản dự phòng.

## Tính năng "online" không cần server
- **Ghé tiệm bạn** (`scenes/visit.js`):
  - Album › "Khoe cả tiệm" sao chép link `#s=…` gồm biển tiệm và 3 áo đẹp nhất.
  - Bạn bè mở link thì được "Đặt may y chang", và nhận quà ghé thăm 30 xu (tối đa 3 tiệm mỗi ngày).
- **Link chia sẻ áo** (`js/share.js`):
  - Cả chiếc áo được mã hoá trong đường link (`#d=…`). Ai mở link cũng xem được ở màn **Xem áo**.
  - Album có nút 🔗 sao chép link và 🖼 tải thẻ ảnh 1080×1350 kiểu trang báo.
  - Nút **"Đặt may y chang"** biến áo của bạn bè thành một đơn trong tiệm của mình.
- **Đơn ngày** (`js/daily.js`):
  - Cả nước nhận cùng một khách và cùng yêu cầu mỗi ngày, theo giờ Việt Nam.
  - Chơi trong "hộp cát" nên không đụng tới bản lưu thật. Lượt đầu là điểm chính thức.
  - Có chuỗi ngày chơi, thưởng xu và nút sao chép kết quả kiểu Wordle.
- **`js/net.js`**: bản giả lập chạy cục bộ (mặc định).
- **Bật bảng xếp hạng cả nước (Firebase, gói miễn phí Spark)** — `js/net-firebase.js`, không cần SDK:
  1. Vào console.firebase.google.com, tạo dự án (có thể tắt Google Analytics).
  2. **Build › Authentication** › Get started › tab Sign-in method, bật **Anonymous**.
  3. **Build › Firestore Database** › Create database. Chọn vị trí `asia-southeast1` (Singapore) và chế độ production.
  4. Ở tab **Rules** của Firestore, dán toàn bộ [firestore.rules](firestore.rules), rồi bấm Publish.
  5. Vào ⚙ Project settings › General › Your apps, bấm nút web `</>` để thêm ứng dụng web. Chép **apiKey** và **projectId** vào `G.CFG.firebase` trong `js/config.js`, rồi đẩy lên GitHub.
  - Khi đó:
    - Điểm Đơn ngày (lượt đầu) và giá trị tiệm ở Thử thách tuần được gửi lên máy chủ.
    - Bảng "Thử thách" có thêm nút **🏆 Bảng xếp hạng**.
    - Các tiệm thật hiện làm "tiệm bóng" trong Bảng hẻm.
  - apiKey của Firebase web là khoá công khai. Dữ liệu được bảo vệ bằng security rules:
    - Mỗi người chỉ ghi điểm của chính mình, đúng ngày, điểm 0–100.
    - Điểm Đơn ngày chỉ ghi được một lần. Điểm Thử thách tuần chỉ được tăng, tối đa 1 lần mỗi phút.
  - Mất mạng hoặc máy chủ lỗi thì game vẫn chơi offline bình thường.
- **Nhân vật nhại vui**: có lời miễn trừ. Cấu hình cố định cho mọi người (G.CFG.parody = 'safe' trong js/config.js), không phải công tắc của từng người chơi.
  - Mặc định là *An toàn*: ẩn nhân vật bị đánh dấu `risk: 'high'`.
  - "Chủ tịch Phương Thoa" đã được thay bằng nhân vật gốc **Bà Chủ Hột Xoàn**.

## Đưa lên GitHub Pages
1. Cài [Git for Windows](https://git-scm.com/download/win).
2. Tạo một repo trên GitHub (ví dụ `aodai`).
3. Trong thư mục game, chạy:
   ```
   git init
   git add .
   git commit -m "Tiệm May Áo Dài"
   git branch -M main
   git remote add origin https://github.com/<tên-bạn>/aodai.git
   git push -u origin main
   ```
4. Trên GitHub, vào Settings → Pages, chọn *Deploy from a branch*, branch `main`, thư mục `/ (root)`.
5. Vài phút sau game chạy ở `https://<tên-bạn>.github.io/aodai/`.

## Xưởng vải và Vải cộng đồng
Trong game: Cửa hàng vải → **Tự thiết kế vải** (`js/studio.js`, `js/scenes/studio.js`).
- **Ghép mẫu**: chất liệu, màu nền, hoạ tiết thêu / sọc / chấm bi / kẻ ô, bố cục, cỡ, màu chỉ. Gửi cho bạn bè bằng link `#f=…`.
- **Ảnh của bạn**: chọn ảnh trên máy. Ảnh được cắt vuông, thu còn 384 px và chỉ lưu trên máy đó (tối đa 8 ảnh). Có thể giữ màu ảnh hoặc nhuộm theo màu nền, lặp thẳng hoặc lặp soi gương.
- Mẫu đã lưu (tối đa 12) thành cây vải thật trên kệ **Cộng đồng**, giá và điểm phong cách tính theo cùng một công thức cho mọi người.

Dáng áo trong Sổ phác thảo → Kiểu dáng → **Dáng**:
- **Kéo nút trên áo** để chỉnh eo, hông, chỗ xẻ tà và độ xoè tà. Mỗi nút có giới hạn để áo vẫn tôn dáng. Rập cắt và đường may tự đổi theo (`shape` trong `js/geo.js`).
- **Ảnh dáng của bạn** (`js/skins.js`): tải ảnh hoặc bản vẽ một chiếc áo dài (nền trắng hoặc PNG nền trong). Game tự tách nền rồi dùng ảnh thay cho hình áo:
  - *Phủ vải đã chọn*: vải trong sổ được phủ vào hình, phần sáng tối của bản vẽ thành nếp vải.
  - *Giữ màu ảnh*: giữ nguyên màu của ảnh.
  - Ảnh chỉ đổi hình. Điểm phong cách, rập cắt và khâu may vẫn tính theo dáng đã chọn trong game.

Vải cộng đồng chạy qua GitHub Discussions, không cần server:
1. Settings → General → Features: bật **Discussions**.
2. Tạo category tên *Vải cộng đồng* với slug `vai-cong-dong`. Nên chọn kiểu *Open-ended discussion* để có nút bầu ⬆.
3. Tạo label `duyet`.
4. Người chơi bấm **Gửi cộng đồng** trong xưởng. Game tải ảnh về máy họ và mở sẵn một bài đăng; họ chỉ cần thả ảnh vào bài.
5. Mọi người bầu ⬆ hoặc 👍. Bạn gắn label `duyet` cho mẫu hợp lệ (ảnh tự vẽ hay tự chụp, không vi phạm bản quyền).
6. Cứ 6 giờ (hoặc khi gắn hay gỡ label), workflow `.github/workflows/community-fabrics.yml` chạy `tools/community-fabrics.mjs`. Script đưa mọi bài có `duyet` và đủ phiếu vào `community/` (ảnh và `fabrics.json`), sau đó commit. Game tải danh sách này khi mở.
   - Số phiếu tối thiểu mặc định là 10. Đổi bằng biến `FABRIC_MIN_VOTES` trong Settings → Secrets and variables → Actions → Variables.
   - Gỡ label `duyet` thì mẫu rời khỏi game ở lần chạy sau.

Những thứ không đưa lên web:
- `assets_src/` chứa ảnh gốc cỡ lớn. Game dùng bản đã tối ưu trong `assets/`, tạo bằng `tools/optimize-assets.ps1`.
- `screenshots/` và `.claude/` cũng được bỏ qua (đã khai báo trong `.gitignore`).

## Nội dung (`js/catalog.js`)
- **Loại đồ** (`G.CAT.GARMENTS`): áo dài, và **áo bà ba**. Khách đặt loại nào thì trong sổ phác thảo chỉ hiện kiểu hợp với loại đó.
  - Áo bà ba dài ngang hông, xẻ tà ngắn, cài nút giữa, có hai túi trước; có cả bản nam.
  - Rập áo bà ba gồm: hai vạt trước, vạt sau, hai túi.
  - Đường may riêng của áo bà ba: nẹp nút, may túi, lai áo.
  - Muốn thêm loại đồ mới thì khai báo ở `GARMENTS`, đánh dấu `garment: '…'` cho các lựa chọn riêng, rồi dựng rập và đường may trong `js/geo.js`.
- **Dịp mặc** (`js/content/occasions.js`): khoảng một nửa khách vãng lai kể dịp mặc bằng lời. Có 11 dịp, trong đó 3 dịp đòi áo bà ba:
  - Đám cưới ở biển, ra mắt nhà chồng, chụp kỷ yếu, lễ chùa đầu năm, thuyết trình, thi hoa khôi, áo Tết, mừng thọ.
  - Đờn ca tài tử, chợ nổi, dẫn khách du lịch (áo bà ba).
  - Yêu cầu của đơn đi theo dịp. Khi nhận áo, khách khen hoặc chê đúng chuyện của dịp đó.
- **5 phong cách**: Truyền thống, Thanh lịch, Sang trọng, Rực rỡ, Hiện đại
- **Các phần áo**: 11 kiểu cổ, 3 dáng, 9 kiểu tay, 7 kiểu tà (gồm cả độ dài), 4 kiểu quần/váy. Mỗi lựa chọn mang điểm phong cách và mở theo hạng.
- **8 chất liệu chuẩn**: đũi, voan, lụa, nhung, gấm, ren, tơ tằm, kim sa. Có giá theo mét và hạng mở khoá.
- **69 cây vải**: tên theo dạng `chấtliệu.màu.hoạtiết`. Gồm vải trơn và 10 hoạ tiết nhỏ chuẩn (lụa Hà Đông, gấm rồng, mẫu đơn dệt chìm, nhung, ren, Chu Đậu, Bát Tràng, hoa nhí, thổ cẩm, kim sa), tất cả cùng một tỉ lệ.
- **Trang trí**: 12 mẫu thêu nhỏ, 8 tranh thêu lớn, 5 viền, 2 kiểu cúc, 4 kiểu đính kết, 4 phụ kiện đầu, 2 áo choàng voan. Hoạ tiết lớn chỉ nằm ở bước này, không còn dùng làm hoạ tiết vải.
- **Đơn lạ** (`G.THEMES` trong `js/state.js`). Từ hạng 2, khoảng 14% khách vãng lai mang tới một trong ba đơn:
  - **Đồ đi đám tang**: ≥80% màu trắng, đen hoặc be; không thêu, viền, đính hay choàng; kín đáo (gợi cảm tối đa 18).
  - **Áo dài gợi cảm** (chỉ khách nữ): đạt "độ gợi cảm" tối thiểu. Điểm này tính từ cổ hở, tay ngắn hoặc không tay, tà ngắn, xẻ cao, eo thon và vải mỏng (voan, ren).
  - **Đồ đóng vai nghèo**: mọi vải ≤ 16 xu/m, màu cũ bạc, phải có miếng vá hoặc chỗ rách (nhóm trang trí mới "Vá & sờn"). Chất lượng tối đa 65, nên may quá khéo là trượt.
- **8 khách quen**, mỗi người có gu, chất liệu ưa thích, số đo và lời thoại riêng.
- **Bà Chủ Hột Xoàn**: nhân vật gốc (không nhại ai), chủ tiệm kim hoàn mê giảm giá.
- **10 "người nổi tiếng"** (tên nói lái/nhại, đùa vui, không dùng ảnh người thật). Họ xuất hiện khoảng 1/3 số lần, và chỉ khi gu của họ làm được ở hạng hiện tại.
  - Nữ: Trà Đắng, Bà Tân Vờ Lốc, Linh Búp Bê, Hồ Ngọc Hả.
  - Nam: Đàm Vĩnh Biệt, Trấn Thành Công, Sơn Tung Tăng, Trắng Vâu, Xuân Nam.
  - Chị Phiền: dáng người nam vạm vỡ (`broad`) nhưng may áo dài nữ.
  - Mỗi người có bộ nhận dạng biếm hoạ (`look` trong `catalog.js`, vẽ bằng `lookFace` và `lookFront` trong `art.js`). Bộ này chỉ dùng nét đặc trưng, không vẽ giống mặt thật:
    - Kiểu tóc và màu tóc (bob, búi cài trâm, tóc vuốt ngược, tóc mái idol).
    - Kính (râm, gọng tròn, gọng vàng), khuyên tai, son, mi, má hồng.
    - Râu, mũ len, mũ cánh chuồn, nơ.
    - Chuỗi ngọc, nhẫn, và đồ cầm tay (quạt, muôi to, khăn tay, micro).
- **Áo dài nam** cho khách nam:
  - Người mẫu nam vai rộng.
  - Dáng suông hoặc cách tân, có thể chọn ngũ thân.
  - Tà qua gối, ngang gối hoặc vạt bầu, lai vuông, không xoè sóng.
  - Khăn xếp. Mục trang trí chỉ dành cho nữ (nón lá, khăn vấn, áo choàng voan) sẽ tự ẩn.

Áo dài được tạo bằng tham số trong `js/geo.js`, nên rập cắt, đường may và hình vẽ luôn khớp nhau với mọi kiểu.

## Ảnh AI (ChatGPT)
- `assets/textures/`: texture vải. Chỉ 10 ảnh được khai báo dùng làm hoạ tiết chuẩn.
- `assets/placements/`: 8 tranh thêu lớn, nền trong suốt
- `assets/motifs/`: 12 mẫu thêu, nền trong suốt

Danh sách và cách dùng khai báo trong `js/assets.js`, prompt nằm trong `assets/PROMPTS.md`. Khi thêm ảnh mới:
1. Tải ảnh về Downloads, đặt tên `aodai__<tên file>`.
2. Chạy `tools/import-downloads.ps1`.
3. Khai báo file trong `js/assets.js` và `js/catalog.js`.

## Cấu trúc
- `js/core.js`: vòng lặp game, xử lý input, chuyển màn, nút
- `js/ui.js`: bộ giao diện dùng chung cho mọi màn (thanh trên, thẻ, phiếu đặt may, nút chính và phụ, gợi ý)
- `js/catalog.js`: phong cách, chất liệu, cây vải, phần áo, trang trí, khách
- `js/data.js`: dữ liệu kiểu dáng gốc mà renderer dùng
- `js/geo.js`: tạo áo dài từ tham số (hình nhìn chính diện, rập phẳng theo ô vải, đường may)
- `js/textures.js`, `js/assets.js`: vải chuẩn, ảnh AI
- `js/art.js`: vẽ áo, người mẫu, phụ kiện, nền
- `js/state.js`: lưu game, tạo đơn hàng, tính phong cách, chấm điểm
- `js/tracer.js`: cơ chế đi theo đường của máy may
- `js/rng.js`, `js/config.js`: số ngẫu nhiên có hạt giống, cấu hình (công tắc nhại vui)
- `js/dialog.js`: hộp thoại kể chuyện (chân dung, lựa chọn, đặt tên tiệm)
- `js/story.js`, `js/bond.js`, `js/press.js`, `js/calendar.js`, `js/share.js`, `js/daily.js`, `js/net.js`: các hệ thống của Mùa 1
- `js/content/*`: nội dung (kịch bản, đơn tâm sự, báo, sự kiện)
- `js/scenes/*`: title, desk, measure, sketch, emporium, cutting, sew, decorate, finish, gallery, paper, mail, clients, viewer, parade

# Prompt ChatGPT để tạo ảnh cho game

Lưu ảnh vào đúng thư mục và đúng tên file như dưới đây. Ảnh đã có trong `js/assets.js` thì game tự nạp khi khởi động.

## A. Texture vải lặp (lưu vào `assets/textures/`, JPG vuông 1024×1024)
Câu mở đầu chung cho mọi prompt:
> Seamless tileable fabric texture, flat top-down scan, even lighting, no shadows, no folds, no perspective, fills the whole square, high detail, 1024x1024.

Mục nào ghi (tint) là ảnh nên làm đơn sắc hoặc tông trầm. Game sẽ tự nhuộm ảnh sang màu vải người chơi chọn. Mục ghi (full) là giữ nguyên màu gốc.

| File | Mô tả thêm vào prompt |
|---|---|
| gam_rong.jpg (tint) | Vietnamese silk brocade (gấm), woven dragon and cloud roundels, tone-on-tone ivory on ivory, subtle metallic thread sheen |
| luahadong.jpg (tint) | Hà Đông silk jacquard, small lozenge (quả trám) and flower lattice woven tone-on-tone, very fine weave |
| maudon_damask.jpg (tint) | silk damask with large peony medallions in ogee layout, tone-on-tone |
| chudau.jpg (full) | Chu Đậu ceramic style cobalt blue hand-painted chrysanthemums and vines on cream silk |
| battrang.jpg (full) | Bát Tràng blue-and-white lotus and bamboo pattern on ivory silk |
| cungdinh.jpg (full) | Huế royal court embroidery, gold dragons and phoenix with clouds on imperial yellow silk |
| thocam.jpg (full) | Vietnamese thổ cẩm ethnic brocade, red black yellow white geometric diamond bands |
| hoanhi.jpg (full) | tiny ditsy pastel flowers scattered on cream chiffon |
| sen_hoavan.jpg (full) | soft watercolor lotus flowers and leaves on pale green silk |
| dao_mai.jpg (full) | peach blossom and yellow apricot blossom branches on red silk, Tết theme |
| hac_may.jpg (full) | white cranes and golden clouds embroidered on navy silk |
| ren_hoa.jpg (tint) | delicate floral guipure lace, white, on transparent background look |
| kimsa.jpg (full) | champagne sequin fabric, overlapping small round sequins catching light |
| nhung_hoa.jpg (tint) | embossed velvet with burnout floral pattern |
| tamthai.jpg (full) | Vietnamese three-color glaze ceramic florals, brown green and ochre on beige |
| dongho.jpg (full) | Đông Hồ folk woodblock print motifs (carp, rooster) on dó paper colored silk |

## B. Tranh đặt trên tà áo (lưu vào `assets/placements/`, PNG nền trong suốt)
Câu mở đầu chung:
> Isolated artwork on a transparent background, no fabric, no garment, vertical composition 2:3, painted for an áo dài front panel, high detail.

| File | Mô tả |
|---|---|
| sen_ve.png | hand-painted pink lotus flowers rising from green lotus leaves at the bottom, watercolor |
| rong_theu.png | gold thread embroidered dragon coiling upward, satin-stitch texture |
| phuong_theu.png | phoenix in red, gold and teal embroidery with long trailing tail |
| hac_bay.png | three white cranes flying with soft gold clouds, ink-wash style |
| mau_don.png | peony branch with large pink blooms and leaves, diagonal, watercolor |
| trong_dong.png | Đông Sơn bronze drum face pattern, circular, gold on transparent |
| ngua.png | galloping golden horse with clouds, Bính Ngọ 2026 Tết theme, embroidery |
| son_thuy.png | ink-wash mountains, river and small boat, landscape strip for the hem |

## C. Mẫu áo dài tham khảo (lưu vào `assets/reference/`, chỉ để tham khảo khi vẽ)
> Fashion illustration of a modern Vietnamese áo dài on a dress form, full body front view, plain background — [kiểu: cổ yếm tà kép / trễ vai tay bồng / lệch vai kim sa / ngũ thân cổ phục / cách tân chân váy tuyn]

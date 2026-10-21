// Báo Trà Đá ("Tin hẻm nóng hổi, uống mát lạnh"): headline / body templates, Madame Sa quotes, ads, filler, corrections, trend blurbs.
// Template variables: {client} {role} {shop} {fabric} {tag} {tag2} {quality} {kim} {reqMiss} {title} {day}

G.PRESS_HEAD = {
  great: [
    'HIẾM: Áo đạt {quality} điểm, Madame Sa đánh rơi cả kính',
    'Chiếc áo {fabric} hoàn hảo tới mức thước dây cũng xin chữ ký',
    'Madame Sa chấm {kim} kim: “{shop} may áo như viết thơ”',
    'Chất lượng {quality}/100, con số khiến tiệm đầu hẻm mất ngủ',
    '{client} bước ra khỏi {shop}, cả hẻm Chỉ Hồng đứng hình năm giây',
    'Năm kim cho {shop}: Madame Sa xin phép đứng dậy vỗ tay',
    'Áo {tag} đạt {quality} điểm, giới mộ điệu Sài Gòn xôn xao về một tiệm hẻm'
  ],
  good: [
    '{client} rạng rỡ trong áo {fabric}: hẻm Chỉ Hồng có thợ giỏi rồi!',
    'Một đường may, vạn lời khen: {shop} khiến {client} “đứng hình”',
    'Tin nóng: {client} mặc áo {shop}, cả xóm quên nấu cơm',
    '{fabric} lên ngôi! Áo dài {tag} của {shop} gây sốt',
    'Từ cuộn {fabric} tới chiếc áo trong mơ của {client}',
    '{client} ({role}) tuyên bố: “Áo này tôi mặc tới già!”',
    'Áo {tag} pha chút {tag2}: {client} được khen suốt đường về'
  ],
  ok: [
    '{client} hài lòng, Madame Sa gật gù: một ngày bình yên ở {shop}',
    'Áo {tag} cho {client}: đúng đề, đủ ý, thiếu chút muối',
    'Thêm một chiếc áo {fabric} rời {shop}, khách cười tủm tỉm',
    '{client} nhận áo, gật đầu hai cái. Ở hẻm này, hai cái gật là khen',
    'Một chiếc áo tử tế nữa rời số 7 hẻm Chỉ Hồng'
  ],
  funny: [
    '{client} dặn “{reqMiss}”, {shop} nghe nhầm thành “cứ làm ngược lại”',
    'Đẹp thì đẹp thật, nhưng {client} đã dặn {reqMiss}…',
    'Bí ẩn hẻm Chỉ Hồng: vì sao chiếc áo đẹp vẫn bị “trả bài”?',
    'Thợ may {shop} được khen sáng tạo… vượt quá đề bài',
    '{client} mặc áo đẹp đi khắp hẻm, chỉ tiếc là khác đề một chút'
  ],
  bad: [
    'Đường may của {shop} “đi dạo” khắp tà áo, {client} bật cười',
    'Áo của {client} có một đường chỉ… tự do như gió',
    'Chuyên gia khuyên {shop}: bớt cà phê trước khi ngồi máy may',
    'Madame Sa: “Tôi thấy nhiều rồi, nhưng chưa thấy đường may nào nhảy cha-cha-cha”',
    '{client} vẫn trả tiền, kèm lời nhắn: “Lần sau em may chậm thôi nha”'
  ],
  story: [
    'Chuyện của {client}: “{title}”, và chiếc áo may riêng cho ngày ấy',
    '“{title}”: {client} kể chuyện ở quầy, {shop} may thành áo',
    'Có những chiếc áo mang theo cả một câu chuyện: “{title}” của {client}',
    '{client} tâm sự, {shop} trả lời bằng đường kim mũi chỉ',
    'Từ phiếu đặt may “{title}”, một ngày đáng nhớ của {client}',
    'Hẻm Chỉ Hồng rưng rưng: chiếc áo “{title}” của {client}'
  ],
  event: {
    p2010: '20/10 ngọt ngào: {client} nhận áo mới, ai cũng muốn được tặng',
    cuoi: 'Mùa cưới: {shop} tất bật, chú rể hẻm bên than “cô dâu đẹp quá nhìn không kịp”',
    tet: 'Tết này mặc gì? {client} đã có câu trả lời từ {shop}',
    p83: '8/3: {client} diện áo {tag}, cả cơ quan xin số tiệm',
    kyyeu: 'Kỷ yếu năm nay: áo {fabric} của {client} chiếm hết ống kính',
    trungthu: 'Trăng rằm tròn, đường may áo {client} cũng tròn trịa'
  },
  rival: [
    'Siêu Tốc 24h may một ngày, {shop} may một đời: khách chọn bên nào?',
    'Kevin Khải phản hồi: “Bên mình… cũng sẽ học canh sợi”',
    'Tờ rơi 24h bay khắp hẻm, {client} vẫn quay về số 7'
  ],
  chapter: {
    ch1: 'ĐẶC SAN: Hẻm Chỉ Hồng có tiệm may mở cửa trở lại!',
    ch2: 'Cuộc chiến kim chỉ đầu hẻm: tiệm nhỏ giữ chân khách bằng đường may',
    ch3: 'Đám cưới hẻm Chỉ Hồng: ba chiếc áo, một tiệm may, trăm cái bong bóng',
    ch4: 'Sao về hẻm nhỏ: khách sang xếp hàng ở {shop}',
    ch5: 'ĐÊM HỘI ÁO DÀI: {shop} nhận {kim} kim, cả khán phòng đứng dậy'
  },
  star: {
    trada: 'Trà Đắng “biến hình” trong ba giây, nhưng áo của {shop} thì đẹp mãi',
    batan: 'Bà Tân Vờ Lốc khoe áo dài từ {shop}: “Đẹp siêu to khổng lồ!”',
    linhbb: 'Linh Búp Bê lên hình không cần filter, nhờ áo {fabric}',
    ngocha: 'Hồ Ngọc Hả bước ra, cả khán phòng đồng thanh: “Hả?!”',
    chiphien: 'Chị Phiền làm hẳn bài thơ tặng áo: “May khéo như {shop}, ai thấy cũng mê”',
    damvb: 'Đàm Vĩnh Biệt lấp lánh tới mức ban tổ chức tắt bớt đèn sân khấu',
    tranthanh: 'Trấn Thành Công khóc ba lần trong buổi thử áo, lập kỷ lục mới',
    sontung: 'Sơn Tung Tăng mặc áo {shop} vào MV: “không đụng hàng” là có thật',
    trangvau: 'Trắng Vâu về quê, áo mộc mà mẹ khen “con trai mẹ bảnh”',
    xuannam: 'Xuân Nam mặc áo {shop} lên chầu: Ngọc Hoàng cũng phải hỏi địa chỉ',
    _fail: '{client} vẫn đăng ảnh, caption: “Áo hơi lạ nhưng thợ dễ thương”'
  }
};

G.PRESS_BODY = {
  lead: {
    good: [
      'Sáng nay, {client} rời {shop} với nụ cười kéo dài tới tận đầu hẻm.',
      'Tí Flash chỉ kịp bấm một kiểu, nhưng một kiểu là đủ.',
      'Chuông cửa số 7 vừa reo, {client} đã bước ra trong chiếc áo khiến hàng xóm ngừng quét sân.',
      '{client} ({role}) xoay một vòng trước gương rồi tuyên bố: “Khỏi sửa gì hết.”'
    ],
    ok: [
      '{client} nhận áo, ngắm một hồi rồi cười hiền. Một ngày làm ăn yên ả ở {shop}.',
      'Không pháo hoa, không nước mắt, chỉ có một chiếc áo vừa vặn và một vị khách hài lòng.',
      'Tí Flash ghé {shop} đúng lúc {client} thử áo. Phóng viên ghi nhận: khách gật gù.'
    ],
    funny: [
      'Chiếc áo đẹp, khách cũng khen đẹp. Chỉ có tờ phiếu đặt may là không đồng ý.',
      '{client} đã dặn kỹ, {shop} đã may khéo. Hai chuyện đó tiếc là không gặp nhau.',
      'Áo đạt {quality} điểm tay nghề, còn đề bài thì vẫn nằm yên trên phiếu.'
    ],
    bad: [
      'Phóng viên Tí Flash ghi nhận: khách vẫn cười. Có điều là cười hơi lâu.',
      'Đường may hôm nay có vẻ… hơi vội. {client} vẫn vui vẻ trả tiền.',
      'Theo nguồn tin từ quán trà đá, chiếc áo của {client} sẽ được nhớ rất lâu. Vì lý do riêng.'
    ]
  },
  detail: [
    'Áo may bằng {fabric}, nổi bật chất {tag}, điểm xuyết thêm chút {tag2}.',
    'Chất liệu chính là {fabric}. Theo Madame Sa, tinh thần {tag} được giữ trọn từ cổ tới tà.',
    'Tay nghề chấm {quality} điểm. Nét {tag} đi trước, nét {tag2} theo sau như người bạn đồng hành.',
    'Từ cuộn {fabric}, thợ may {shop} dựng nên một dáng áo {tag} không lẫn vào đâu được.'
  ],
  close: [
    'Tiệm {shop}, số 7 hẻm Chỉ Hồng, mở cửa từ lúc chuông reo.',
    'Bạn đọc muốn may y chang? Ra số 7, nhớ mang theo kiên nhẫn.',
    'Báo Trà Đá sẽ tiếp tục theo dõi. Và uống trà.',
    'Ngày {day}, hẻm Chỉ Hồng. Tí Flash đưa tin.'
  ]
};

G.SA_QUOTES = {
  5: ['Chèn ơi. Tôi im lặng ba giây, mà tôi chưa bao giờ im lặng ba giây.', 'Áo này mà lên sàn diễn năm chín mươi mấy là tôi giành mặc trước.',
    'Đường may thẳng như lời hứa của người tử tế.', 'Năm kim. Kim thứ sáu tôi không có, chứ có là tôi cho luôn.'],
  4: ['Đẹp. Còn thiếu một chút “xì-tai”, nhưng đẹp.', 'Tôi cho bốn kim. Kim thứ năm tôi cất trong túi, chờ lần sau.',
    'Cưng đang đi đúng đường. Đi chậm thôi, đừng vấp.', 'Cái tà áo này biết đi. Còn cái cổ áo thì đang học.'],
  3: ['Được. Được là được, không hơn không kém.', 'Áo đúng đề, mà lòng tôi chưa rung rinh.',
    'Một chiếc áo tử tế. Tử tế cũng là một loại đẹp.'],
  2: ['Cái ma-nơ-canh nó cũng hơi ngại.', 'Cưng may bằng tay hay bằng… cảm hứng vậy?',
    'Tôi cho hai kim, một kim vì cái nút áo dễ thương.'],
  1: ['Tôi xin phép không bình luận, để giữ tình làng nghĩa xóm.', 'Một kim. Kim đó tôi tặng vì cưng đã dám giao.',
    'Chiếc áo này có cá tính. Rất. Nhiều. Cá tính.']
};

G.KEVIN_ADS = [
  'ÁO DÀI SIÊU TỐC 24H: Đo bằng app, cắt bằng máy, mặc bằng… người. Gọi ngay!',
  'Siêu Tốc 24h KHUYẾN MÃI: may hai tặng một tờ rơi!',
  'Siêu Tốc 24h tuyển thợ canh sợi. Lương cao. Kiên nhẫn càng cao.',
  'Kevin Khải xin đính chính: máy may bên tôi KHÔNG biết hát. Nó chỉ kêu to.',
  'Siêu Tốc 24h: may xong trước khi bạn kịp đổi ý!',
  'Đặt áo dài qua app Siêu Tốc, tặng kèm sticker Kevin Khải mặt cười.',
  'MỚI: gói “Áo dài cấp tốc cho người lỡ quên ngày cưới”. Siêu Tốc 24h, đầu hẻm Chỉ Hồng.'
];

G.PRESS_FILLER = [
  'Quán trà đá đầu hẻm tăng giá… thêm một cục đá. Giá giữ nguyên.',
  'Con mèo vàng nhà số 12 lại ngủ trên yên xe số 9. Chủ xe số 9 đã chấp nhận số phận.',
  'Cây hoa giấy đầu hẻm nở rộ, ai đi ngang cũng dừng chụp hình. Kẹt xe nhẹ lúc năm giờ chiều.',
  'Hội bóng đá nhí hẻm Chỉ Hồng thua đậm hẻm bên cạnh 7–1. Huấn luyện viên đổ tại trái banh.',
  'Bà bán xôi đầu hẻm đổi giờ bán sớm hơn mười lăm phút. Cả hẻm dậy sớm hơn mười lăm phút.',
  'Ông Ba sửa xe khoe vừa vá cái ruột xe thứ mười ngàn trong đời. Không ai kiểm chứng, nhưng ai cũng vỗ tay.',
  'Mưa chiều qua làm ngập nửa hẻm. Tụi nhỏ thả thuyền giấy, người lớn thả dép.',
  'Loa phường thông báo lịch phun thuốc muỗi. Lũ muỗi chưa có phản hồi.',
  'Chú bán trà đá đầu hẻm vừa học được ba câu tiếng Anh từ Kevin Khải. Câu thứ ba là “no hard feelings”.',
  'Tiệm tạp hoá số 3 nhập về loại kẹo mới. Hết sạch trước khi kịp dán giá.',
  'Một cây kim may bị rơi ở đầu hẻm đã được trả về đúng tiệm số 7. Hẻm Chỉ Hồng: đến kim cũng không lạc.',
  'Đội văn nghệ phường tập múa quạt cho dịp lễ. Tiếng nhạc vọng tới tận chợ.'
];

G.PRESS_CORRECTIONS = [
  'Hôm trước tôi viết “nhung”, thật ra là {fabric}. Tôi già rồi, mắt kém, nhưng gu thì không kém. — Madame Sa',
  'Số trước tôi gọi vải của tiệm là “lụa… à mà thôi”. Xin đính chính: đó là {fabric}. Tôi chưa thôi gì hết. — Madame Sa',
  'Tôi lỡ viết chiếc áo {fabric} “đẹp vừa phải”. Ý tôi là đẹp vừa phải… để tôi còn chỗ khen lần sau. — Madame Sa',
  'Bài kỳ trước in nhầm “năm kim” thành “năm kem”. Không ai được tặng kem. Tôi xin lỗi bạn đọc nhỏ tuổi. — Madame Sa',
  'Tôi viết vải {fabric} là “hàng Pháp”. Không phải. Hàng mình. Mà đẹp vậy thì ai cũng tưởng hàng Pháp. — Madame Sa'
];

G.PRESS_TREND = {
  truyenthong: 'Gió chướng về, cả hẻm nhớ áo xưa: cổ đứng, tà dài, thêu hoa sen. Mặc vô là thấy Tết tới gần.',
  thanhlich: 'Sài Gòn mấy bữa nay dịu nắng, người ta chuộng áo thanh lịch: màu nhẹ, đường gọn, nói ít mà duyên.',
  sangtrong: 'Mùa tiệc tới rồi! Gấm, nhung, ngọc trai được hỏi nhiều nhất chợ. Sang mà đừng sến nha.',
  rucro: 'Dự báo: tuần này đỏ, vàng, kim sa lên ngôi. Áo phải nổi từ đầu hẻm tới cuối chợ.',
  hiendai: 'Giới trẻ đang mê áo dài cách tân: cổ lạ, tà ngắn, phối voan. Bà ngoại chưa chắc chịu, mà cháu thì chịu.'
};

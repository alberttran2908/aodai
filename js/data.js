// Static game data
G.DATA = {
  // weave = texture renderer in textures.js; grade C < B < A < S
  materials: {
    lua:     { name: 'Lụa Hàng Châu',  weave: 'lua',    grade: 'B', price: 30,  rep: 0,  width: 120, sheen: 0.5,  desc: 'Mềm, rủ, dễ may' },
    voan:    { name: 'Voan',           weave: 'voan',   grade: 'C', price: 28,  rep: 0,  width: 110, sheen: 0.15, sheer: 0.12, desc: 'Mỏng nhẹ, xuyên thấu' },
    satin:   { name: 'Phi bóng',       weave: 'satin',  grade: 'C', price: 25,  rep: 0,  width: 140, sheen: 0.7,  desc: 'Bóng, giá mềm' },
    dui:     { name: 'Đũi',            weave: 'dui',    grade: 'B', price: 35,  rep: 3,  width: 115, sheen: 0,    desc: 'Mộc mạc, sợi thô tự nhiên' },
    luanhan: { name: 'Lụa nhăn',       weave: 'chiffon', grade: 'B', price: 40, rep: 6,  width: 115, sheen: 0.25, desc: 'Gợn sóng li ti, không nhàu' },
    tafta:   { name: 'Tafta',          weave: 'tafta',  grade: 'B', price: 45,  rep: 8,  width: 140, sheen: 0.55, desc: 'Cứng, óng ánh hai màu' },
    gam:     { name: 'Gấm',            weave: 'gam',    grade: 'A', price: 70,  rep: 10, width: 100, sheen: 0.35, desc: 'Dệt hoa nổi sợi kim' },
    organza: { name: 'Organza',        weave: 'organza', grade: 'B', price: 50, rep: 12, width: 140, sheen: 0.5,  sheer: 0.25, desc: 'Xuyên thấu, đứng phom' },
    hadong:  { name: 'Lụa Hà Đông',    weave: 'totam',  grade: 'A', price: 75,  rep: 15, width: 90,  sheen: 0.6,  desc: 'Lụa Vạn Phúc dệt hoa chìm' },
    nhung:   { name: 'Nhung',          weave: 'nhung',  grade: 'A', price: 65,  rep: 18, width: 110, sheen: 0.1,  desc: 'Dày, ấm, sâu màu' },
    ren:     { name: 'Ren',            weave: 'ren',    grade: 'A', price: 80,  rep: 22, width: 120, sheen: 0.15, sheer: 0.08, desc: 'Ren hoa trên nền lót' },
    toong:   { name: 'Tơ óng',         weave: 'toong',  grade: 'B', price: 55,  rep: 25, width: 110, sheen: 0.75, sheer: 0.15, desc: 'Tơ sống, óng vàng, hơi trong' },
    kimtuyen:{ name: 'Kim tuyến',      weave: 'satin',  grade: 'B', price: 60,  rep: 28, width: 120, sheen: 0.6,  sparkle: true, desc: 'Sợi ánh kim lấp lánh' },
    baoloc:  { name: 'Lụa Bảo Lộc',    weave: 'lua',    grade: 'A', price: 85,  rep: 32, width: 100, sheen: 0.7,  desc: 'Tơ tằm Lâm Đồng, mịn mượt' },
    totam:   { name: 'Lụa tơ tằm',     weave: 'totam',  grade: 'A', price: 95,  rep: 35, width: 96,  sheen: 0.8,  desc: 'Cao cấp, khổ hẹp' },
    kimsa:   { name: 'Vải kim sa',     weave: 'kimsa',  grade: 'A', price: 110, rep: 45, width: 110, sheen: 0.4,  sparkle: true, desc: 'Phủ kim sa toàn thân' },
    mya:     { name: 'Lãnh Mỹ A',      weave: 'mya',    grade: 'S', price: 160, rep: 60, width: 90,  sheen: 1,    desc: 'Nữ hoàng tơ lụa, bóng như gương' }
  },
  grades: { C: 'Thường', B: 'Khá', A: 'Cao cấp', S: 'Thượng hạng' },
  fabricLength: 260,
  colors: {
    do:       { name: 'đỏ Tết',          hex: '#b71c1c' },
    ruou:     { name: 'đỏ rượu vang',    hex: '#722f37' },
    hongsen:  { name: 'hồng sen',        hex: '#e58fa6' },
    hongphan: { name: 'hồng phấn',       hex: '#d8a7a7' },
    cam:      { name: 'cam đào',         hex: '#ec8f6a' },
    camdat:   { name: 'cam đất',         hex: '#c1663f' },
    vang:     { name: 'vàng hoàng bào',  hex: '#e8b923' },
    mutat:    { name: 'vàng mù tạt',     hex: '#c9971c' },
    champagne:{ name: 'champagne',       hex: '#e6d3a3' },
    be:       { name: 'be kem',          hex: '#e8dcc4' },
    trang:    { name: 'trắng ngà',       hex: '#f8f4e8' },
    chuoi:    { name: 'xanh lá chuối',   hex: '#a8c66c' },
    reu:      { name: 'xanh rêu',        hex: '#5b6b3a' },
    ngoc:     { name: 'xanh ngọc',       hex: '#3fb8af' },
    covit:    { name: 'xanh cổ vịt',     hex: '#0f5257' },
    thien:    { name: 'xanh da trời',    hex: '#a7c7e7' },
    lam:      { name: 'xanh lam',        hex: '#2f5fa8' },
    cobalt:   { name: 'xanh cobalt',     hex: '#1f4e9a' },
    hoaca:    { name: 'tím hoa cà',      hex: '#b39ddb' },
    tim:      { name: 'tím',             hex: '#7a4a9e' },
    timhue:   { name: 'tím Huế',         hex: '#5e2b5e' },
    den:      { name: 'đen lãnh',        hex: '#1d1a1c' }
  },
  lightColors: ['trang', 'vang', 'hongsen', 'hongphan', 'thien', 'hoaca', 'cam', 'champagne', 'be', 'chuoi', 'ngoc', 'mutat'],
  prints: {}, // filled from G.tex in textures.js
  garments: {
    truyen: { name: 'Áo dài', base: 120, rep: 0, kid: false },
    treem:  { name: 'Áo dài trẻ em', base: 85, rep: 5, kid: true }
  },
  sizes: { S: 0.93, M: 1, L: 1.08 },

  // ---- Design options (price 0 = unlocked from start) ----
  style: {
    neck: { label: 'Cổ áo', opts: {
      dung:   { name: 'Cổ đứng', price: 0 },
      thap:   { name: 'Cổ thấp', price: 0 },
      tron:   { name: 'Cổ tròn', price: 60 },
      thuyen: { name: 'Cổ thuyền', price: 80 },
      tim:    { name: 'Cổ tim', price: 80 },
      vuong:  { name: 'Cổ vuông', price: 100 },
      lasen:  { name: 'Cổ lá sen', price: 70 },
      no:     { name: 'Cổ nơ', price: 90 },
      yem:    { name: 'Cổ yếm', price: 120 },
      trevai: { name: 'Trễ vai', price: 130 },
      lechvai:{ name: 'Lệch vai', price: 140 }
    } },
    sleeve: { label: 'Tay áo', opts: {
      dai:      { name: 'Tay dài', price: 0 },
      lung:     { name: 'Tay lửng', price: 0 },
      ngan:     { name: 'Tay ngắn', price: 60 },
      loe:      { name: 'Tay loe', price: 90 },
      bong:     { name: 'Tay bồng dài', price: 90 },
      bonglung: { name: 'Tay bồng lửng', price: 80 },
      voan:     { name: 'Tay voan xuyên thấu', price: 100 },
      canhtien: { name: 'Tay cánh tiên', price: 110 },
      khong:    { name: 'Sát nách', price: 120 }
    } },
    length: { label: 'Độ dài', opts: {
      got:  { name: 'Chấm gót', price: 80 },
      chan: { name: 'Qua bắp chân', price: 0 },
      goi:  { name: 'Qua gối', price: 0 },
      ngan: { name: 'Ngang đùi', price: 70 }
    } },
    hem: { label: 'Tà áo', opts: {
      thang: { name: 'Tà thẳng', price: 0 },
      bau:   { name: 'Tà bầu', price: 0 },
      nhon:  { name: 'Tà nhọn', price: 70 },
      xeo:   { name: 'Tà xéo', price: 110 },
      xoe:   { name: 'Tà xoè xếp ly', price: 90 },
      kep:   { name: 'Tà kép', price: 120 }
    } },
    slit: { label: 'Xẻ tà', opts: {
      thap: { name: 'Xẻ thấp', price: 0 },
      vua:  { name: 'Xẻ vừa', price: 0 },
      cao:  { name: 'Xẻ cao', price: 60 }
    } },
    fit: { label: 'Dáng', opts: {
      om:    { name: 'Ôm eo', price: 0 },
      suong: { name: 'Suông', price: 0 },
      nguthan: { name: 'Ngũ thân cổ phục', price: 150 }
    } },
    trim: { label: 'Viền', opts: {
      none:  { name: 'Không viền', price: 0 },
      vang:  { name: 'Viền vàng', price: 0, hex: '#e2b23c' },
      trang: { name: 'Viền trắng', price: 40, hex: '#f7f2e8' },
      do:    { name: 'Viền đỏ', price: 40, hex: '#b8323f' },
      den:   { name: 'Viền đen', price: 40, hex: '#2e2529' },
      ngoc:  { name: 'Viền ngọc', price: 40, hex: '#2f9e8f' }
    } },
    bottom: { label: 'Quần/Váy', opts: {
      quan:    { name: 'Quần lụa suông', price: 0 },
      ongrong: { name: 'Quần ống rộng 7/8', price: 50 },
      chanvay: { name: 'Chân váy xoè', price: 90 },
      tuyn:    { name: 'Chân váy tuyn', price: 110 }
    } },
    pants: { label: 'Màu quần', opts: {
      trang:   { name: 'Trắng', price: 0, hex: '#f6f2ea' },
      cungmau: { name: 'Cùng màu áo', price: 0 },
      phoi:    { name: 'Màu phối', price: 40 },
      den:     { name: 'Đen', price: 40, hex: '#2e2529' },
      vang:    { name: 'Vàng', price: 40, hex: '#e8c25a' },
      hong:    { name: 'Hồng', price: 40, hex: '#efb3c2' }
    } },
    deco: { label: 'Đính kết', opts: {
      none:     { name: 'Không', price: 0 },
      kimsaco:  { name: 'Kim sa cổ & vai', price: 80 },
      kimsata:  { name: 'Kim sa rải tà', price: 90 },
      ngoctrai: { name: 'Chuỗi ngọc cổ áo', price: 100 },
      longvu:   { name: 'Lông vũ lai áo', price: 120 }
    } },
    buttons: { label: 'Cúc', opts: {
      vang: { name: 'Cúc vàng', price: 0, hex: '#e9c46a' },
      ngoc: { name: 'Ngọc trai', price: 50, hex: '#fbf6ee' },
      an:   { name: 'Cúc ẩn', price: 0 }
    } },
    // extras: these use the accent color ("Màu phối") and some need extra fabric per garment
    twotone: { label: 'Phối màu', opts: {
      none:   { name: 'Một màu', price: 0 },
      tay:    { name: 'Tay khác màu', price: 80, fabric: 15 },
      tayco:  { name: 'Tay & cổ khác màu', price: 100, fabric: 15 }
    } },
    layer: { label: 'Số lớp', opts: {
      mot: { name: 'Một lớp', price: 0 },
      hai: { name: 'Hai lớp', price: 100, fabric: 25 }
    } },
    cape: { label: 'Áo choàng', opts: {
      none:  { name: 'Không choàng', price: 0 },
      trang: { name: 'Voan trắng', price: 120, fabric: 25, hex: '#ffffff' },
      phoi:  { name: 'Voan màu phối', price: 140, fabric: 25 },
      vang:  { name: 'Voan ánh kim', price: 160, fabric: 25, hex: '#f3d68a' }
    } },
    head: { label: 'Phụ kiện đầu', opts: {
      none:    { name: 'Không', price: 0 },
      khanvan: { name: 'Khăn vấn', price: 90 },
      nonla:   { name: 'Nón lá', price: 60 },
      quaithao:{ name: 'Nón quai thao', price: 110 },
      hoacai:  { name: 'Búi tóc cài hoa', price: 70 }
    } }
  },
  defaultDesign: { neck: 'dung', sleeve: 'dai', length: 'chan', hem: 'thang', slit: 'vua', fit: 'om', trim: 'none', bottom: 'quan', pants: 'trang', buttons: 'vang', deco: 'none', twotone: 'none', layer: 'mot', cape: 'none', head: 'none', accent: 'vang' },
  // phrases customers use for style requests
  stylePhrase: {
    neck: (o) => o.toLowerCase(), sleeve: (o) => o.toLowerCase(), length: (o) => 'dài ' + o.toLowerCase(),
    hem: (o) => o.toLowerCase(), slit: (o) => o.toLowerCase(), fit: (o) => 'dáng ' + o.toLowerCase(),
    twotone: (o) => o.toLowerCase(), layer: (o) => 'áo ' + o.toLowerCase(), cape: (o) => 'khoác áo choàng ' + o.toLowerCase(),
    head: (o) => o.toLowerCase(), bottom: (o) => 'mặc ' + o.toLowerCase(), deco: (o) => 'đính ' + o.toLowerCase()
  },
  plainOpts: ['none', 'mot', 'quan'], // never requested by customers

  motifs: {
    sen:       { name: 'Hoa sen',   price: 0 },
    mai:       { name: 'Hoa mai',   price: 0 },
    dao:       { name: 'Hoa đào',   price: 60 },
    cuc:       { name: 'Hoa cúc',   price: 60 },
    tre:       { name: 'Cành tre',  price: 80 },
    buom:      { name: 'Bướm',      price: 90 },
    en:        { name: 'Chim én',   price: 100 },
    may:       { name: 'Mây cuộn',  price: 110 },
    hac:       { name: 'Chim hạc',  price: 150 },
    trongdong: { name: 'Trống đồng', price: 180 },
    phuong:    { name: 'Phượng',    price: 250 },
    rong:      { name: 'Rồng',      price: 320 }
  },
  borders: {
    none:      { name: 'Không', price: 0 },
    song:      { name: 'Sóng nước', price: 0 },
    hoanhi:    { name: 'Hoa nhí', price: 70 },
    kyha:      { name: 'Kỷ hà', price: 90 },
    trongdong: { name: 'Vòng trống đồng', price: 140 }
  },
  threadCost: 8,
  borderCost: 20,
  tools: {
    // workshop upgrades (Xưởng may). off: grain score of a piece cut off-grain · speed: wider stitch tolerance
    // (and +30 xu/month electricity per level in business mode) · bonus: quality points on every dress
    scissors: {
      label: 'Kéo', levels: [
        { name: 'Kéo sắt', tol: 1, off: 0.75, price: 0, desc: 'Mảnh cắt lệch canh sợi được 75%.' },
        { name: 'Kéo bạc', tol: 1.35, off: 0.82, price: 320, desc: 'Lưỡi bén hơn: mảnh lệch canh còn 82%.' },
        { name: 'Kéo vàng', tol: 1.75, off: 0.9, price: 850, desc: 'Kéo thợ cả: mảnh lệch canh còn 90%.' }
      ], effect: 'Đỡ mất điểm khi cắt lệch canh sợi'
    },
    machine: {
      label: 'Máy may', levels: [
        { name: 'Máy may đạp chân', speed: 1, price: 0, desc: 'Máy của Bà Tư, chạy bền.' },
        { name: 'Máy may điện', speed: 1.5, price: 480, desc: 'Mũi chỉ ổn định hơn, khó lệch hơn. Tốn thêm tiền điện.' },
        { name: 'Máy may Nhật', speed: 2.1, price: 1150, desc: 'Êm như ru, gần như không lệch mũi. Tốn điện nhất.' }
      ], effect: 'Đường may khó lệch hơn'
    },
    iron: {
      label: 'Bàn ủi', levels: [
        { name: 'Chưa có', bonus: 0, price: 0, desc: 'Áo giao đi còn nếp gấp.' },
        { name: 'Bàn ủi hơi nước', bonus: 4, price: 400, desc: 'Ủi phẳng từng đường may: +4 điểm chất lượng mỗi áo.' },
        { name: 'Bàn ủi treo chuyên nghiệp', bonus: 7, price: 1000, desc: 'Như tiệm lớn: +7 điểm chất lượng mỗi áo.' }
      ], effect: 'Cộng điểm chất lượng mỗi áo'
    }
  },
  names: ['Cô Lan', 'Chị Hoa', 'Bà Năm', 'Em Thảo', 'Chị Mai', 'Cô Hằng', 'Chị Vy', 'Cô Thu', 'Bà Tư', 'Chị Ngọc', 'Em Linh', 'Cô Diệp', 'Chị Quyên', 'Bà Sáu', 'Em Trâm', 'Chị Uyên', 'Cô Phương', 'Em Khánh'],
  occasions: ['đi đám cưới', 'chụp ảnh Tết', 'lễ tốt nghiệp', 'đi lễ chùa', 'dự tiệc công ty', 'lễ ăn hỏi', 'biểu diễn văn nghệ', 'đi làm ngày thứ Hai', 'ngày 20 tháng 10', 'dạo phố Hội An', 'chụp ảnh kỷ yếu', 'thi hoa khôi'],
  greets: ['Chào chủ tiệm!', 'Xin chào!', 'Tiệm mình còn nhận may không?', 'Nghe nói tiệm may đẹp lắm!', 'Chào em!'],
  skin: ['#f3d2b5', '#e8bf9a', '#d9a77f', '#c68e66'],
  hair: ['#1f1715', '#2b1d18', '#3d2a20', '#4a3326']
};

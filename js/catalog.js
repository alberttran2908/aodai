// Game catalog (Dressmaker-style): style tags, standard fabric bolts, design parts, decorations, clients.
G.CAT = (function () {
  const TAGS = {
    truyenthong: { name: 'Truyền thống', col: '#b23a48' },
    thanhlich:   { name: 'Thanh lịch',   col: '#5b8fa8' },
    sangtrong:   { name: 'Sang trọng',   col: '#b8862a' },
    rucro:       { name: 'Rực rỡ',       col: '#e2683c' },
    hiendai:     { name: 'Hiện đại',     col: '#6b5bb8' }
  };
  const TAG_KEYS = Object.keys(TAGS);

  // ---------- materials (8 types) — price per metre ----------
  const MATS = {
    dui:   { name: 'Đũi',      price: 14, rank: 1, tags: { truyenthong: 2 } },
    voan:  { name: 'Voan',     price: 16, rank: 1, tags: { hiendai: 2, thanhlich: 1 } },
    lua:   { name: 'Lụa',      price: 22, rank: 1, tags: { thanhlich: 2, truyenthong: 1 } },
    nhung: { name: 'Nhung',    price: 36, rank: 2, tags: { sangtrong: 3 } },
    gam:   { name: 'Gấm',      price: 40, rank: 2, tags: { sangtrong: 3, truyenthong: 2 } },
    ren:   { name: 'Ren',      price: 34, rank: 3, tags: { hiendai: 2, sangtrong: 1 } },
    totam: { name: 'Tơ tằm',   price: 48, rank: 3, tags: { sangtrong: 2, thanhlich: 2 } },
    kimsa: { name: 'Kim sa',   price: 60, rank: 4, tags: { rucro: 3, hiendai: 1 } }
  };
  const COLOR_TAGS = {
    do: { rucro: 1, truyenthong: 1 }, vang: { rucro: 1, truyenthong: 1 }, ruou: { sangtrong: 1 }, den: { sangtrong: 1 },
    timhue: { sangtrong: 1, truyenthong: 1 }, covit: { sangtrong: 1 }, cobalt: { sangtrong: 1 },
    trang: { thanhlich: 1 }, be: { thanhlich: 1 }, champagne: { thanhlich: 1, sangtrong: 1 },
    hongsen: { thanhlich: 1 }, hongphan: { thanhlich: 1 }, hoaca: { thanhlich: 1 },
    ngoc: { hiendai: 1 }, chuoi: { hiendai: 1 }, thien: { hiendai: 1 }, reu: { truyenthong: 1 },
    camdat: { truyenthong: 1 }, mutat: { hiendai: 1 }, cam: { rucro: 1 }, lam: { hiendai: 1 }, tim: { rucro: 1 }
  };
  // standard repeat prints (all at the same real-world scale); full = keeps its own colours
  const PRINTS = {
    tron:         { name: '', tags: {}, extra: 0 },
    img_hadong:   { name: 'hoa chìm quả trám', tags: { truyenthong: 1, thanhlich: 1 }, extra: 8 },
    img_gam_rong: { name: 'rồng mây dệt nổi', tags: { truyenthong: 2, sangtrong: 1 }, extra: 10 },
    img_maudon:   { name: 'mẫu đơn dệt chìm', tags: { sangtrong: 2 }, extra: 10 },
    img_nhung:    { name: 'hoa nổi', tags: { sangtrong: 1 }, extra: 8 },
    img_ren:      { name: 'hoa guipure', tags: { sangtrong: 1 }, extra: 0 },
    img_chudau:   { name: 'vẽ gốm Chu Đậu', tags: { truyenthong: 2 }, extra: 12, full: ['trang', 'cobalt'] },
    img_battrang: { name: 'vẽ gốm Bát Tràng', tags: { truyenthong: 2 }, extra: 12, full: ['trang', 'cobalt'] },
    img_hoanhi:   { name: 'hoa nhí', tags: { thanhlich: 1, hiendai: 1 }, extra: 6, full: ['trang', 'hongphan'] },
    img_thocam:   { name: 'thổ cẩm', tags: { truyenthong: 2, rucro: 1 }, extra: 12, full: ['do', 'den', 'vang'] },
    img_kimsa:    { name: 'champagne', tags: { rucro: 1 }, extra: 0, full: ['champagne'] }
  };

  // ---------- fabric bolts ----------
  const FABRICS = {};
  function bolt(mat, color, print, rankBonus) {
    const pr = PRINTS[print];
    const colors = pr.full || [color];
    const id = mat + '.' + (pr.full ? colors[0] : color) + '.' + print;
    const colName = G.DATA.colors[colors[0]] ? G.DATA.colors[colors[0]].name : colors[0];
    FABRICS[id] = {
      id, mat, color: colors[0], colors, print,
      name: `${MATS[mat].name} ${pr.full ? '' : colName}${pr.name ? (pr.full ? pr.name : ' ' + pr.name) : ''}`.replace(/\s+/g, ' ').trim(),
      price: MATS[mat].price + pr.extra,
      rank: MATS[mat].rank + (rankBonus || 0) + (pr.extra >= 10 ? 1 : 0),
      tags: sumTags([MATS[mat].tags, COLOR_TAGS[colors[0]] || {}, pr.tags])
    };
  }
  function sumTags(list) {
    const out = {};
    for (const t of list) for (const k in t) out[k] = (out[k] || 0) + t[k];
    return out;
  }
  ['trang', 'be', 'hongsen', 'hongphan', 'do', 'vang', 'ngoc', 'thien', 'hoaca', 'covit', 'cobalt', 'den'].forEach((c) => bolt('lua', c, 'tron'));
  ['trang', 'champagne', 'hongphan', 'thien', 'ngoc'].forEach((c) => bolt('lua', c, 'img_hadong'));
  bolt('lua', 'trang', 'img_chudau'); bolt('lua', 'trang', 'img_battrang');
  ['trang', 'champagne', 'do', 'ruou', 'timhue', 'den', 'covit'].forEach((c) => bolt('totam', c, 'tron'));
  ['do', 'vang', 'ruou', 'covit', 'champagne', 'den'].forEach((c) => bolt('gam', c, 'img_gam_rong'));
  ['do', 'hongsen', 'champagne', 'timhue', 'cobalt'].forEach((c) => bolt('gam', c, 'img_maudon'));
  ['ruou', 'den', 'timhue', 'covit', 'do', 'reu'].forEach((c) => bolt('nhung', c, 'tron'));
  ['ruou', 'den', 'cobalt'].forEach((c) => bolt('nhung', c, 'img_nhung'));
  ['trang', 'hongphan', 'thien', 'hoaca', 'chuoi', 'be'].forEach((c) => bolt('voan', c, 'tron'));
  bolt('voan', 'trang', 'img_hoanhi');
  ['trang', 'be', 'den', 'do', 'hongphan'].forEach((c) => bolt('ren', c, 'img_ren'));
  ['be', 'trang', 'reu', 'camdat', 'mutat'].forEach((c) => bolt('dui', c, 'tron'));
  bolt('dui', 'do', 'img_thocam');
  ['den', 'do', 'cobalt', 'champagne'].forEach((c) => bolt('kimsa', c, 'tron'));
  bolt('kimsa', 'champagne', 'img_kimsa');

  // ---------- design parts (sketchbook) ----------
  // each option: tags it adds, rank needed. 'ta' sets both length and hem.
  // sex: who can wear it — 'f' (default) women's, 'm' men's only, 'mf' both
  const PARTS = {
    co: { name: 'Cổ áo', key: 'neck', opts: {
      dung: { rank: 1, sex: 'mf', tags: { truyenthong: 18, thanhlich: 6 } }, thap: { rank: 1, sex: 'mf', tags: { thanhlich: 14 } },
      tron: { rank: 2, tags: { hiendai: 10, thanhlich: 8 } }, lasen: { rank: 2, tags: { thanhlich: 16 } },
      thuyen: { rank: 3, tags: { hiendai: 14, sangtrong: 4 } }, no: { rank: 3, tags: { hiendai: 10, thanhlich: 8 } },
      tim: { rank: 4, tags: { hiendai: 16, rucro: 4 } }, vuong: { rank: 4, tags: { hiendai: 12, sangtrong: 6 } },
      yem: { rank: 5, tags: { rucro: 12, hiendai: 10 } }, trevai: { rank: 6, tags: { hiendai: 18, rucro: 8 } },
      lechvai: { rank: 7, tags: { hiendai: 22, rucro: 6 } },
      baba: { rank: 1, sex: 'mf', garment: 'baba', name: 'Cổ tròn bà ba', tags: { truyenthong: 14, thanhlich: 6 } }
    } },
    tay: { name: 'Tay áo', key: 'sleeve', opts: {
      dai: { rank: 1, sex: 'mf', tags: { truyenthong: 14, thanhlich: 8 } }, lung: { rank: 1, sex: 'mf', tags: { thanhlich: 12, hiendai: 4 } },
      ngan: { rank: 2, tags: { hiendai: 12 } }, loe: { rank: 2, tags: { sangtrong: 10, hiendai: 8 } },
      voan: { rank: 3, tags: { sangtrong: 12, hiendai: 6 } }, bonglung: { rank: 4, tags: { hiendai: 12, rucro: 6 } },
      bong: { rank: 4, tags: { hiendai: 10, rucro: 8 } }, canhtien: { rank: 5, tags: { rucro: 10, thanhlich: 6 } },
      khong: { rank: 6, tags: { hiendai: 16, rucro: 6 } }
    } },
    dang: { name: 'Dáng thân', key: 'fit', opts: {
      om: { rank: 1, tags: { thanhlich: 10, truyenthong: 6 } }, suong: { rank: 1, tags: { hiendai: 8, thanhlich: 6 } },
      nguthan: { rank: 3, sex: 'mf', tags: { truyenthong: 22 } },
      nam: { rank: 1, sex: 'm', name: 'Dáng nam suông', tags: { truyenthong: 10, thanhlich: 8 } },
      namom: { rank: 2, sex: 'm', name: 'Dáng nam cách tân', tags: { hiendai: 12, thanhlich: 6 } },
      baba: { rank: 1, sex: 'mf', garment: 'baba', name: 'Dáng bà ba', tags: { truyenthong: 10, thanhlich: 6 } }
    } },
    ta: { name: 'Tà áo', key: 'ta', opts: {
      dai_thang: { rank: 1, set: { length: 'got', hem: 'thang' }, name: 'Tà dài chấm gót', tags: { truyenthong: 12, thanhlich: 8 } },
      chan_bau: { rank: 1, set: { length: 'chan', hem: 'bau' }, name: 'Tà bầu qua bắp chân', tags: { truyenthong: 10, thanhlich: 6 } },
      goi_thang: { rank: 2, set: { length: 'goi', hem: 'thang' }, name: 'Tà cách tân qua gối', tags: { hiendai: 12, thanhlich: 4 } },
      dai_xoe: { rank: 3, set: { length: 'got', hem: 'xoe' }, name: 'Tà xoè xếp ly', tags: { sangtrong: 12, rucro: 6 } },
      chan_nhon: { rank: 3, set: { length: 'chan', hem: 'nhon' }, name: 'Tà nhọn', tags: { hiendai: 10, rucro: 6 } },
      dai_kep: { rank: 4, set: { length: 'got', hem: 'kep' }, name: 'Tà kép', tags: { sangtrong: 14, hiendai: 6 } },
      ngan_xeo: { rank: 5, set: { length: 'ngan', hem: 'xeo' }, name: 'Tà xéo ngang đùi', tags: { hiendai: 18, rucro: 4 } },
      nam_dai: { rank: 1, sex: 'm', set: { length: 'nam', hem: 'thang' }, name: 'Tà nam qua gối', tags: { truyenthong: 12, thanhlich: 6 } },
      nam_ngan: { rank: 2, sex: 'm', set: { length: 'namngan', hem: 'thang' }, name: 'Tà nam ngang gối', tags: { hiendai: 10, thanhlich: 6 } },
      nam_bau: { rank: 3, sex: 'm', set: { length: 'nam', hem: 'bau' }, name: 'Tà nam vạt bầu', tags: { truyenthong: 10, sangtrong: 6 } },
      baba: { rank: 1, sex: 'mf', garment: 'baba', set: { length: 'baba', hem: 'thang', garment: 'baba' }, name: 'Ngang hông, xẻ tà ngắn', tags: { truyenthong: 12, hiendai: 4 } }
    } },
    quan: { name: 'Quần / váy', key: 'bottom', opts: {
      quan: { rank: 1, sex: 'mf', tags: { truyenthong: 8 } }, ongrong: { rank: 2, sex: 'mf', tags: { hiendai: 10 } },
      chanvay: { rank: 3, tags: { hiendai: 12, sangtrong: 4 } }, tuyn: { rank: 4, tags: { rucro: 10, hiendai: 8 } }
    } }
  };
  const PART_ORDER = ['co', 'dang', 'tay', 'ta', 'quan'];
  // what can be sewn: each garment has its own options (marked garment: '…') plus a few shared ones;
  // the áo dài uses every option that belongs to no other garment
  const GARMENTS = {
    aodai: { name: 'Áo dài' },
    baba: { name: 'Áo bà ba', short: 'Bà ba',
      allow: { co: ['baba', 'tron', 'tim', 'vuong'], dang: ['baba'], tay: ['dai', 'lung', 'ngan'], ta: ['baba'], quan: ['ongrong', 'quan', 'chanvay'] },
      def: { co: 'baba', dang: 'baba', tay: 'dai', ta: 'baba', quan: 'ongrong' } }
  };
  const garmentAllows = (part, key, o, garment) => {
    const g = GARMENTS[garment] ? garment : 'aodai';
    return g === 'aodai' ? !o.garment : (GARMENTS[g].allow[part] || []).includes(key);
  };
  // fabric slots and how much each counts toward fabric share
  const SLOTS = { than: { name: 'Thân & tà', w: 0.6 }, tay: { name: 'Tay áo', w: 0.2 }, co: { name: 'Cổ áo', w: 0.05 }, quan: { name: 'Quần / váy', w: 0.15 } };

  // ---------- decorations (separate final step) ----------
  // place: dropped anywhere on the dress (embroidery/appliqué); one: single choice per slot
  // items default to sex 'mf' (anyone); headwear and capes say who wears them
  const DECOR = {
    vien: { name: 'Viền', kind: 'one', field: 'trim', items: {
      vang: { name: 'Viền vàng', price: 12, tags: { sangtrong: 4, truyenthong: 2 } }, trang: { name: 'Viền trắng', price: 10, tags: { thanhlich: 4 } },
      do: { name: 'Viền đỏ', price: 10, tags: { rucro: 4 } }, den: { name: 'Viền đen', price: 10, tags: { sangtrong: 3, hiendai: 2 } },
      ngoc: { name: 'Viền ngọc', price: 10, tags: { hiendai: 4 } }
    } },
    cuc: { name: 'Cúc áo', kind: 'one', field: 'buttons', items: {
      vang: { name: 'Cúc vàng', price: 8, tags: { truyenthong: 3 } }, ngoc: { name: 'Cúc ngọc trai', price: 16, tags: { sangtrong: 5 } }
    } },
    dau: { name: 'Phụ kiện đầu', kind: 'one', field: 'head', items: {
      khanvan: { name: 'Khăn vấn', price: 30, rank: 1, sex: 'f', tags: { truyenthong: 10 } }, nonla: { name: 'Nón lá', price: 20, rank: 1, sex: 'f', tags: { truyenthong: 8, thanhlich: 2 } },
      hoacai: { name: 'Búi tóc cài hoa', price: 18, rank: 2, sex: 'f', tags: { thanhlich: 6, rucro: 4 } }, quaithao: { name: 'Nón quai thao', price: 40, rank: 3, sex: 'f', tags: { truyenthong: 12 } },
      khanxep: { name: 'Khăn xếp', price: 30, rank: 1, sex: 'm', tags: { truyenthong: 12 } }
    } },
    dinh: { name: 'Đính kết', kind: 'one', field: 'deco', items: {
      ngoctrai: { name: 'Chuỗi ngọc cổ áo', price: 40, rank: 2, tags: { sangtrong: 8 } }, kimsaco: { name: 'Kim sa cổ & vai', price: 30, rank: 2, tags: { rucro: 8 } },
      kimsata: { name: 'Kim sa rải tà', price: 45, rank: 3, tags: { rucro: 8, sangtrong: 4 } }, longvu: { name: 'Lông vũ lai áo', price: 50, rank: 4, tags: { hiendai: 6, rucro: 6 } }
    } },
    choang: { name: 'Áo choàng voan', kind: 'one', field: 'cape', items: {
      trang: { name: 'Choàng voan trắng', price: 45, rank: 3, sex: 'f', tags: { thanhlich: 6, sangtrong: 4 } }, vang: { name: 'Choàng ánh kim', price: 60, rank: 4, sex: 'f', tags: { sangtrong: 6, rucro: 6 } }
    } },
    theu: { name: 'Thêu nhỏ', kind: 'place', items: {
      sen: { name: 'Hoa sen', price: 15, size: 12, tags: { truyenthong: 5, thanhlich: 2 } }, mai: { name: 'Hoa mai', price: 15, size: 11, tags: { truyenthong: 4, rucro: 2 } },
      dao: { name: 'Hoa đào', price: 15, size: 11, tags: { thanhlich: 4, rucro: 2 } }, cuc: { name: 'Hoa cúc', price: 15, size: 10, tags: { truyenthong: 3, thanhlich: 2 } },
      tre: { name: 'Cành tre', price: 15, size: 12, tags: { truyenthong: 4 } }, buom: { name: 'Bướm', price: 18, size: 10, tags: { hiendai: 4, thanhlich: 2 } },
      en: { name: 'Chim én', price: 18, size: 11, tags: { thanhlich: 4 } }, may: { name: 'Mây cuộn', price: 18, size: 12, tags: { truyenthong: 3, sangtrong: 2 } },
      hac: { name: 'Chim hạc', price: 25, size: 13, rank: 2, tags: { truyenthong: 4, sangtrong: 3 } }, trongdong: { name: 'Trống đồng', price: 25, size: 12, rank: 2, tags: { truyenthong: 6 } },
      phuong: { name: 'Phượng', price: 35, size: 14, rank: 3, tags: { sangtrong: 4, rucro: 4 } }, rong: { name: 'Rồng', price: 40, size: 14, rank: 3, tags: { truyenthong: 5, sangtrong: 4 } }
    } },
    tranh: { name: 'Tranh thêu lớn', kind: 'place', items: {
      img_pl_sen: { name: 'Sen vẽ tay', price: 60, size: 40, rank: 2, tags: { thanhlich: 8, truyenthong: 6 } },
      img_pl_maudon: { name: 'Cành mẫu đơn', price: 60, size: 34, rank: 2, tags: { sangtrong: 8, thanhlich: 4 } },
      img_pl_hac: { name: 'Hạc bay', price: 70, size: 32, rank: 3, tags: { truyenthong: 6, thanhlich: 6 } },
      img_pl_sonthuy: { name: 'Sơn thuỷ', price: 70, size: 40, rank: 3, tags: { truyenthong: 8, thanhlich: 4 } },
      img_pl_trongdong: { name: 'Mặt trống đồng', price: 80, size: 28, rank: 4, tags: { truyenthong: 12 } },
      img_pl_rong: { name: 'Rồng thêu kim tuyến', price: 100, size: 32, rank: 4, tags: { truyenthong: 8, sangtrong: 8 } },
      img_pl_phuong: { name: 'Phượng hoàng thêu', price: 100, size: 34, rank: 5, tags: { sangtrong: 8, rucro: 8 } },
      img_pl_ngua: { name: 'Linh mã Bính Ngọ', price: 110, size: 32, rank: 5, tags: { rucro: 10, truyenthong: 6 } }
    } },
    // patches and wear, for costumes that must look poor and much-mended (stage plays, films)
    va: { name: 'Vá & sờn', kind: 'place', items: {
      nau: { name: 'Vá vải nâu', price: 2, size: 8, color: 'camdat', tags: {} },
      cham: { name: 'Vá vải chàm', price: 2, size: 8, color: 'lam', tags: {} },
      be: { name: 'Vá vải mộc', price: 2, size: 7, color: 'be', tags: {} },
      rach: { name: 'Chỗ rách tuột chỉ', price: 0, size: 7, tags: {} }
    } }
  };
  const DECOR_ORDER = ['theu', 'tranh', 'vien', 'cuc', 'dinh', 'dau', 'choang', 'va'];

  // ---------- clients ----------
  const CLIENTS = [
    { id: 'hanh', name: 'Cô Hạnh', role: 'giáo viên văn', likes: ['thanhlich', 'truyenthong'], mats: ['lua', 'totam'], hair: 'bun', skin: '#f0cfb0', outfit: ['lua', 'thien'], bust: 84, waist: 66, hip: 90,
      lines: ['Trường sắp tổ chức lễ tri ân, cô muốn một chiếc áo thật nền nã.', 'Cô sắp dự đám cưới học trò cũ, em may giúp cô nhé.'] },
    { id: 'vy', name: 'Chị Vy', role: 'nhà thiết kế trẻ', likes: ['hiendai', 'rucro'], mats: ['voan', 'ren', 'kimsa'], hair: 'long', skin: '#f3d6bd', outfit: ['voan', 'hoaca'], bust: 82, waist: 61, hip: 88,
      lines: ['Show diễn tuần sau, chị cần một bộ thật phá cách!', 'Chị muốn áo dài mà mặc đi tiệc vẫn nổi bật.'] },
    { id: 'nam', name: 'Bà Năm', role: 'chủ tiệm vàng', likes: ['sangtrong', 'truyenthong'], mats: ['gam', 'nhung'], hair: 'bun', skin: '#e3bd9a', outfit: ['gam', 'ruou'], bust: 92, waist: 76, hip: 98,
      lines: ['Tết này cả nhà chụp hình, bà phải là người sang nhất.', 'Bà đi ăn hỏi cho cháu, áo phải thật quý phái.'] },
    { id: 'thao', name: 'Em Thảo', role: 'sinh viên', likes: ['thanhlich', 'hiendai'], mats: ['lua', 'voan'], hair: 'long', skin: '#f5d9c2', outfit: ['lua', 'trang'], bust: 80, waist: 60, hip: 86,
      lines: ['Em sắp chụp kỷ yếu, muốn áo nhẹ nhàng mà vẫn trẻ trung.', 'Lễ tốt nghiệp của em, chị may giúp em với!'] },
    { id: 'ngoc', name: 'Chị Ngọc', role: 'MC truyền hình', likes: ['rucro', 'sangtrong'], mats: ['totam', 'gam', 'kimsa'], hair: 'long', skin: '#efcdae', outfit: ['totam', 'do'], bust: 86, waist: 64, hip: 92,
      lines: ['Chị dẫn chương trình Tết, cần áo thật rực rỡ trên sân khấu.', 'Gala cuối năm, chị muốn lộng lẫy nhất đêm đó.'] },
    { id: 'diep', name: 'Cô Diệp', role: 'nghệ sĩ cải lương', likes: ['truyenthong', 'rucro'], mats: ['gam', 'nhung', 'lua'], hair: 'bun', skin: '#ecc7a5', outfit: ['nhung', 'timhue'], bust: 88, waist: 70, hip: 94,
      lines: ['Đoàn hát về quê diễn, cô cần áo thật đậm chất xưa.', 'Cô đi lễ chùa đầu năm, may cho cô bộ thật đẹp.'] },
    { id: 'uyen', name: 'Chị Uyên', role: 'cô dâu tháng sau', likes: ['sangtrong', 'thanhlich'], mats: ['totam', 'ren', 'gam'], hair: 'bun', skin: '#f2d2b6', outfit: ['lua', 'hongphan'], bust: 83, waist: 62, hip: 89,
      lines: ['Lễ vu quy của chị, áo phải đẹp nhất đời chị!', 'Chị cần áo cho lễ ăn hỏi, sang mà vẫn dịu dàng.'] },
    { id: 'khanh', name: 'Em Khánh', role: 'hướng dẫn viên Hội An', likes: ['truyenthong', 'thanhlich'], mats: ['dui', 'lua'], hair: 'long', skin: '#e6c09c', outfit: ['dui', 'be'], bust: 81, waist: 63, hip: 87,
      lines: ['Em dẫn đoàn khách đi phố cổ, cần áo mặc cả ngày vẫn thoải mái.', 'Hội An có lễ hội đèn lồng, em muốn áo thật duyên.'] },
    // ----- "người nổi tiếng" (parody, names twisted, all in good fun) -----
    { id: 'trada', star: true, look: { hair: 'bob', hairCol: '#b04fc4', earrings: 'hoop', lips: '#d23a6b', lashes: true }, name: 'Trà Đắng', role: 'thánh hoá trang TikTok', likes: ['rucro', 'hiendai'], mats: ['kimsa', 'voan', 'ren'], hair: 'long', skin: '#f3d6bd', outfit: ['voan', 'hoaca'], bust: 82, waist: 62, hip: 88,
      lines: ['Clip sau chị hoá thân thành… chính chị mặc áo dài! Em may sao cho cú "biến hình" ăn tiền nha.', 'Trend mới đang hot, chị cần bộ áo vừa quay xong là triệu view.'] },
    // an original character (not a parody): the jeweller from the alley who always asks for a discount
    { id: 'hotxoan', look: { hair: 'bun', bunPin: true, glasses: 'gold', pearls: true, lips: '#b8323f', earrings: 'drop' }, name: 'Bà Chủ Hột Xoàn', role: 'chủ tiệm kim hoàn đầu chợ', likes: ['sangtrong', 'truyenthong'], mats: ['gam', 'totam', 'nhung'], hair: 'bun', skin: '#efcdae', outfit: ['gam', 'do'], bust: 86, waist: 66, hip: 92,
      lines: ['Áo phải sang như hột xoàn tiệm chị! Tiền không thành vấn đề… mà có giảm giá không em?', 'Mai chị đi đám cưới khách VIP, áo phải lấp lánh mà vẫn quý phái nha.'] },
    { id: 'batan', star: true, risk: 'high', look: { hair: 'bun', hairCol: '#a9a39c', glasses: 'round', prop: 'ladle' }, name: 'Bà Tân Vờ Lốc', role: 'đầu bếp "siêu to khổng lồ"', likes: ['truyenthong', 'rucro'], mats: ['dui', 'gam'], hair: 'bun', skin: '#e3bd9a', outfit: ['dui', 'camdat'], bust: 94, waist: 82, hip: 100,
      lines: ['Hôm nay bà may áo dài siêu to khổng lồ! À không… vừa người bà thôi cháu ạ.', 'Bà quay clip nấu nồi bánh chưng khổng lồ, cần bộ áo thật Tết.'] },
    { id: 'linhbb', star: true, look: { hairCol: '#c9a46a', bow: '#f08bb0', lashes: true, blush: true, lips: '#e0607a' }, name: 'Linh Búp Bê', role: 'hot girl làm đẹp', likes: ['thanhlich', 'hiendai'], mats: ['lua', 'voan'], hair: 'long', skin: '#f5d9c2', outfit: ['lua', 'hongphan'], bust: 82, waist: 59, hip: 88,
      lines: ['Áo phải tôn dáng như búp bê, lên cam không cần filter luôn.', 'Chị review đồ Tết, cần áo trong trẻo, nhìn là muốn thả tim.'] },
    { id: 'ngocha', star: true, look: { hair: 'bob', earrings: 'drop', lips: '#c0283c', lashes: true }, name: 'Hồ Ngọc Hả', role: 'nữ hoàng giải trí', likes: ['sangtrong', 'hiendai'], mats: ['totam', 'ren', 'kimsa'], hair: 'long', skin: '#f0d0b2', outfit: ['totam', 'champagne'], bust: 85, waist: 62, hip: 90,
      lines: ['Hả? Em chưa nghe tin chị đi gala à? Áo phải thật thần thái nha.', 'Show cuối năm, chị muốn bước ra là cả khán phòng phải "hả" lên.'] },
    { id: 'chiphien', star: true, look: { hair: 'bun', bunPin: true, lips: '#c42d3a', lashes: true, blush: true, earrings: 'hoop', prop: 'fan' }, broad: true, name: 'Chị Phiền', role: 'nhà thơ livestream', likes: ['rucro', 'thanhlich'], mats: ['voan', 'lua', 'ren'], skin: '#e3bd9a', outfit: ['voan', 'hongphan'], bust: 102, waist: 84, hip: 98,
      lines: ['Chị đây chân yếu tay mềm… may cho chị bộ áo dài thật hiền, nhưng phải sang nha em!', 'Áo dài chị mặc thướt tha, livestream một phát cả nhà mê say… thơ chị làm đó, may cho xứng nha!', 'Drama nào cũng đổ cho chị, thôi thì chị mặc áo dài cho đẹp, ai nói gì kệ!'] },
    { id: 'damvb', star: true, look: { hair: 'slick', glasses: 'sun', rings: true, earrings: 'diamond' }, male: true, name: 'Đàm Vĩnh Biệt', role: '"Mr. Đàm" của showbiz', likes: ['sangtrong', 'rucro'], mats: ['kimsa', 'gam', 'nhung'], skin: '#e8c4a2', outfit: ['kimsa', 'champagne'], bust: 96, waist: 82, hip: 96,
      lines: ['Đêm nhạc chia tay… à không, "Vĩnh Biệt" là tên anh thôi! Áo phải lấp lánh nhất sân khấu.', 'Kim sa, kim tuyến, có gì sáng nhất cứ đính lên cho anh!'] },
    { id: 'tranthanh', star: true, look: { tears: true, prop: 'hanky' }, male: true, name: 'Trấn Thành Công', role: 'MC hay khóc', likes: ['thanhlich', 'sangtrong'], mats: ['totam', 'lua'], skin: '#efcdae', outfit: ['totam', 'ruou'], bust: 94, waist: 84, hip: 96,
      lines: ['Anh dẫn gameshow Tết… áo mà đẹp quá chắc anh khóc mất.', 'Mới nghe em nhận may thôi là anh rưng rưng rồi đó.'] },
    { id: 'sontung', star: true, look: { hair: 'idol', earrings: 'stud', prop: 'mic' }, male: true, name: 'Sơn Tung Tăng', role: 'ca sĩ trẻ triệu view', likes: ['hiendai', 'rucro'], mats: ['nhung', 'kimsa', 'voan'], skin: '#f2d2b6', outfit: ['nhung', 'den'], bust: 88, waist: 72, hip: 90,
      lines: ['MV mới cần áo dài cách tân, phải chất và không đụng hàng.', 'Fan đang chờ, em may sao cho anh lên hình là thành trend.'] },
    { id: 'trangvau', star: true, look: { hat: 'beanie', glasses: 'round', beard: 'stubble' }, male: true, name: 'Trắng Vâu', role: 'rapper sống chậm', likes: ['truyenthong', 'thanhlich'], mats: ['dui', 'lua'], skin: '#dcb08c', outfit: ['dui', 'reu'], bust: 92, waist: 80, hip: 94,
      lines: ['Anh chỉ cần bộ áo dài đơn giản, mặc về quê ăn Tết với mẹ.', 'Đi diễn ở làng, anh muốn mộc thôi, đừng màu mè quá em.'] },
    { id: 'xuannam', star: true, look: { hat: 'canhchuon', beard: 'long' }, male: true, name: 'Xuân Nam', role: 'danh hài Táo Quân', likes: ['truyenthong', 'rucro'], mats: ['gam', 'lua'], skin: '#e6c09c', outfit: ['gam', 'do'], bust: 98, waist: 88, hip: 98,
      lines: ['Năm nay Táo về chầu, anh cần bộ áo dài thật "chất Táo".', 'Diễn hài Tết mà áo không đẹp là khán giả cười… sai chỗ đấy!'] }
  ];
  const AVOID_COLORS = ['den', 'trang', 'do', 'vang'];
  // can this client wear it? part options default to women's, decorations to anyone
  const wear = (sx, male) => (male ? sx !== 'f' : sx !== 'm');
  const partFits = (o, male) => wear(o.sex || 'f', male);
  const decorFits = (it, male) => wear(it.sex || 'mf', male);

  return { TAGS, TAG_KEYS, MATS, COLOR_TAGS, PRINTS, FABRICS, PARTS, PART_ORDER, GARMENTS, garmentAllows, SLOTS, DECOR, DECOR_ORDER, CLIENTS, AVOID_COLORS, sumTags, partFits, decorFits };
})();

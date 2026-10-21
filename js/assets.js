// Image assets (e.g. generated with ChatGPT) layered on top of the procedural engine.
// textures: repeat fabrics. mode 'tint' recolors the image to the bolt color (keeps its light/dark detail),
//           mode 'full' keeps the image's own colors. seam 'mirror' builds a 2x2 mirrored tile so any
//           image repeats without visible edges.
// placements: transparent PNG artworks painted onto the garment body.
//           anchor: 'chest' | 'flap' | 'hem', w = width in cm.
G.ASSET_LIST = {
  // standard fabric prints only: every repeat shown at the same real-world scale
  // (scale 1.2 ≈ 30 cm per tile, 0.75 ≈ 19 cm for fine prints). Large artworks live in the decoration step.
  textures: [
    { id: 'img_gam_rong', name: 'Rồng mây dệt nổi', tech: 'det', tier: 4, file: 'assets/textures/gam_rong.jpg', mode: 'tint', scale: 1.2 },
    { id: 'img_hadong', name: 'Hoa chìm quả trám', tech: 'det', tier: 3, file: 'assets/textures/luahadong.jpg', mode: 'tint', scale: 1.2 },
    { id: 'img_maudon', name: 'Mẫu đơn dệt chìm', tech: 'det', tier: 4, file: 'assets/textures/maudon_damask.jpg', mode: 'tint', scale: 1.2 },
    { id: 'img_nhung', name: 'Nhung hoa nổi', tech: 'det', tier: 4, file: 'assets/textures/nhung_hoa.jpg', mode: 'tint', scale: 1.2 },
    { id: 'img_chudau', name: 'Vẽ gốm Chu Đậu', tech: 've', tier: 4, file: 'assets/textures/chudau.jpg', mode: 'full', scale: 1.2 },
    { id: 'img_battrang', name: 'Vẽ gốm Bát Tràng', tech: 've', tier: 4, file: 'assets/textures/battrang.jpg', mode: 'full', scale: 1.2 },
    { id: 'img_thocam', name: 'Thổ cẩm', tech: 'det', tier: 3, file: 'assets/textures/thocam.jpg', mode: 'full', scale: 1.2 },
    { id: 'img_hoanhi', name: 'Hoa nhí', tech: 'in', tier: 2, file: 'assets/textures/hoanhi.jpg', mode: 'full', scale: 0.75 },
    { id: 'img_ren', name: 'Ren guipure', tech: 'theu', tier: 4, file: 'assets/textures/ren_hoa.jpg', mode: 'tint', scale: 0.75 },
    { id: 'img_kimsa', name: 'Kim sa', tech: 'dinh', tier: 5, file: 'assets/textures/kimsa.jpg', mode: 'full', scale: 0.75 }
  ],
  placements: [
    { id: 'img_pl_sen', name: 'Sen vẽ tay ✦ (đặt)', tech: 've', tier: 5, file: 'assets/placements/sen_ve.png', anchor: 'hem', w: 44 },
    { id: 'img_pl_rong', name: 'Rồng thêu kim tuyến ✦ (đặt)', tech: 'theu', tier: 5, file: 'assets/placements/rong_theu.png', anchor: 'flap', w: 34 },
    { id: 'img_pl_phuong', name: 'Phượng thêu ✦ (đặt)', tech: 'theu', tier: 5, file: 'assets/placements/phuong_theu.png', anchor: 'flap', w: 38 },
    { id: 'img_pl_hac', name: 'Hạc bay thuỷ mặc ✦ (đặt)', tech: 've', tier: 4, file: 'assets/placements/hac_bay.png', anchor: 'chest', w: 34 },
    { id: 'img_pl_maudon', name: 'Cành mẫu đơn ✦ (đặt)', tech: 've', tier: 4, file: 'assets/placements/mau_don.png', anchor: 'flap', w: 36 },
    { id: 'img_pl_trongdong', name: 'Mặt trống đồng ✦ (đặt)', tech: 'det', tier: 4, file: 'assets/placements/trong_dong.png', anchor: 'flap', w: 30 },
    { id: 'img_pl_ngua', name: 'Linh mã Bính Ngọ ✦ (đặt)', tech: 'theu', tier: 5, file: 'assets/placements/ngua.png', anchor: 'flap', w: 34 },
    { id: 'img_pl_sonthuy', name: 'Sơn thuỷ ✦ (đặt)', tech: 've', tier: 4, file: 'assets/placements/son_thuy.png', anchor: 'hem', w: 44 }
  ]
};

// embroidery motif photos (transparent PNG) replace the vector stickers when present
G.ASSET_LIST.motifs = ['sen', 'mai', 'dao', 'cuc', 'tre', 'buom', 'en', 'may', 'hac', 'trongdong', 'phuong', 'rong']
  .map((id) => ({ id, file: 'assets/motifs/' + id + '.png' }));
G.MOTIF_IMG = {};

G.loadAssets = async function () {
  let all = G.ASSET_LIST.textures.concat(G.ASSET_LIST.placements, G.ASSET_LIST.motifs);
  // the local dev server lists which files exist so missing ones are skipped quietly;
  // on the published site (GitHub Pages) every listed file is shipped, so just load them
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    try {
      const r = await fetch('__assets');
      if (r.ok) { const have = new Set(await r.json()); all = all.filter((a) => have.has(a.file)); }
    } catch (e) { /* no listing: try every file */ }
  }
  return Promise.all(all.map((a) => new Promise((res) => {
    const img = new Image();
    img.onload = () => { a.img = img; res(); };
    img.onerror = () => { console.warn('Missing asset', a.file); res(); };
    img.src = a.file;
  }))).then(() => {
    for (const m of G.ASSET_LIST.motifs) if (m.img) G.MOTIF_IMG[m.id] = m.img;
    G.tex.registerImages(G.ASSET_LIST);
  });
};

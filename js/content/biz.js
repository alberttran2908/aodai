// Business content (design doc 2): shop-front upgrades, hireable helpers, street-fair chatter.
G.FRONT = {
  sign: { name: 'Bảng hiệu', levels: [
    { name: 'Bảng gỗ cũ của bà', price: 0 },
    { name: 'Bảng hiệu sơn tay', price: 300, budget: 0.04, desc: 'Khách đi ngang thấy tên tiệm: ngân sách +4%.' },
    { name: 'Bảng hiệu đèn LED', price: 650, budget: 0.08, rent: 30, rank: 4, desc: 'Sáng cả hẻm: ngân sách +8%. Mặt bằng +30 xu/tháng.' }] },
  seat: { name: 'Ghế chờ & bình trà đá', levels: [
    { name: 'Một cái ghế nhựa', price: 0 },
    { name: 'Băng ghế gỗ + bình trà đá', price: 250, seats: 1, desc: 'Thêm 1 chỗ ngồi chờ cho khách.' }] },
  fan: { name: 'Quạt trần', levels: [
    { name: 'Quạt nan của bà', price: 0 },
    { name: 'Quạt trần ba cánh', price: 200, patience: 1, util: 10, desc: 'Khách chờ thêm được 1 ngày. Điện +10 xu/tháng.' }] },
  fitting: { name: 'Phòng thử đồ', levels: [
    { name: 'Tấm rèm tạm', price: 0 },
    { name: 'Rèm nhung + gương đứng', price: 600, fit: 0.05, bond: 2, rent: 20, rank: 3, desc: 'Thử áo trước khi giao: vừa người +5%, ♥ +2 mỗi lần giao. Mặt bằng +20.' }] },
  window: { name: 'Tủ kính mặt tiền', levels: [
    { name: 'Cửa sổ trống', price: 0 },
    { name: 'Tủ kính trưng áo', price: 700, newBudget: 0.06, fair: 0.1, star: 0.05, rank: 3, desc: 'Trưng áo đẹp nhất album: khách mới trả +6%, sạp hội chợ +10%, khách sao ghé nhiều hơn.' }] },
  stall: { name: 'Sạp hội chợ', levels: [
    { name: 'Sạp mượn hàng xóm', price: 0, rack: 3 },
    { name: 'Sạp gấp + móc treo', price: 400, rack: 5, desc: 'Treo được 5 áo bán sẵn (thay vì 3).' }] }
};
G.FRONT_ORDER = ['sign', 'seat', 'fan', 'fitting', 'window', 'stall'];

G.HELPERS = {
  na: { id: 'na', npc: true, name: 'Bé Na', role: 'sinh viên năm hai trường may', rank: 2, wage: 180, skill: 0.8, maxSeams: 2, side: 15,
    look: { hair: 'long', bow: '#f08bb0' }, hair: 'long', skin: '#f5d9c2', outfit: ['voan', 'hongphan'], likes: ['thanhlich'], mats: ['voan'], bust: 80, waist: 60, hip: 86,
    hire: 'Dạ em chào chủ tiệm! Em may chưa giỏi nhưng em chăm lắm, lương sao cũng được… à mà đừng ít quá nha.',
    lines: ['Hôm nay em lên lai được ba cái quần tây đó!', 'Chủ tiệm may đường này đẹp ghê, em chụp hình học nha.', 'Em đặt tên cái máy may là “Bé Bướm”.'] },
  teo: { id: 'teo', npc: true, male: true, name: 'Anh Tèo', role: 'cựu thợ xưởng may Gò Vấp', rank: 4, wage: 320, skill: 0.87, maxSeams: 3, side: 30,
    look: { hat: 'beanie', beard: 'stubble' }, skin: '#dcb08c', outfit: ['dui', 'reu'], likes: ['truyenthong'], mats: ['dui'], bust: 94, waist: 82, hip: 94,
    hire: 'Anh may đồ hàng loạt hai chục năm. Áo dài thì… anh học. Đường thẳng thì cứ để anh.',
    lines: ['Đường may này anh may lại rồi, thẳng như đường ray.', 'Khách sửa quần trả thêm hai chục, anh bỏ vô hộp rồi nha.'] },
  ut: { id: 'ut', npc: true, name: 'Cô Út', role: 'người từng phụ Bà Tư ba mươi năm', rank: 6, wage: 480, skill: 0.93, maxSeams: 4, side: 40, ironBonus: 2,
    look: { hair: 'bun', hairCol: '#9c958e', glasses: 'round' }, hair: 'bun', skin: '#e3bd9a', outfit: ['lua', 'be'], likes: ['truyenthong'], mats: ['lua'], bust: 88, waist: 74, hip: 94,
    hire: 'Bà Tư gọi cô lên. Cô không nói nhiều đâu, cô may thôi.',
    lines: ['Bà Tư hồi xưa cũng hay quên ủi cổ áo như con.', 'Mũi kim chậm một chút, áo đẹp thêm một chút.'] }
};
G.HELPER_ORDER = ['na', 'teo', 'ut'];

// the shop's own mannequins stand in as the "client" of a ready-to-wear dress
G.SHOP_NPCS = {
  manocanh: { id: 'manocanh', npc: true, name: 'Ma-nơ-canh của tiệm', role: 'áo may sẵn để bán ở hội chợ', likes: ['thanhlich', 'truyenthong'], mats: ['lua'],
    outfit: ['lua', 'trang'], skin: '#efe2cc', bust: 84, waist: 66, hip: 90, lines: ['(Ma-nơ-canh đứng im, chờ một chiếc áo thật đẹp.)'] },
  manocanh_nam: { id: 'manocanh_nam', npc: true, male: true, name: 'Ma-nơ-canh nam', role: 'áo nam may sẵn', likes: ['truyenthong'], mats: ['lua'],
    outfit: ['lua', 'be'], skin: '#efe2cc', bust: 94, waist: 80, hip: 94, lines: ['(Ma-nơ-canh nam đứng nghiêm.)'] }
};

G.FAIR_LINES = {
  buy: ['Ui, áo này đẹp quá, chị lấy liền!', 'Mua tặng mẹ nè!', 'Cái này lên hình chắc đẹp lắm.', 'Gói giùm em, khỏi thối.', 'Đúng màu đang hot trên báo luôn!'],
  browse: ['Đẹp mà… để chị đi vòng vòng đã.', 'Hôm nay chưa có dịp mặc, tiếc ghê.', 'Áo xinh ghê, mà chị lỡ tiêu hết tiền rồi.'],
  pricey: ['Hơi chát nha em.', 'Giá này chắc chị phải về hỏi chồng.', 'Bớt chút đỉnh được không em?'],
  robbery: ['Trời đất, giá này mua được chiếc xe đạp!', 'Cắt cổ quá em ơi!', 'Giá này là giá áo của hoa hậu hả?']
};

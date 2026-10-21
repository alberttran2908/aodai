// Friendship (bond) content: thresholds, level names, and per-client greetings, gossip, gifts, doorbells, personal arcs, letters.
// Req shorthand: ['min', tag, n] ['max', tag, n] ['mat', mat, pct] ['avoid', colour] ['decor', group]

G.BOND_AT = [0, 10, 25, 45, 70, 100];
G.BOND_NAMES = ['Khách lạ', 'Quen mặt', 'Khách quen', 'Thân thiết', 'Tri kỷ', 'Người nhà'];

G.BONDS = {
  // ================= Khách quen =================
  hanh: {
    sig: 'lua.trang.img_hadong',
    greet: ['Em ơi, cô ghé chấm bài… à nhầm, ghé may áo.', 'Hôm nay cô có tiết trống, cô ghé tiệm em chơi.',
      'Học trò hỏi áo cô may ở đâu, cô nói: bí mật nghề nghiệp!'],
    gossip: ['Cô Hạnh kể: lớp 12A năm nay có cậu viết văn tả cô giáo mặc áo dài “như mây trời”. Cô cảm động, cho 9 điểm.',
      'Cô Hạnh dạy học trò viết thư tay. Bưu điện phường tuần này bán hết sạch tem.'],
    giftLike: 'Vải này đúng ý cô quá! Em hiểu cô hơn cả cái đề văn cô ra. Cô cảm ơn em nhiều.',
    giftOk: 'Cô cảm ơn em. Cô để dành, biết đâu may cho con gái cô.',
    bell: [523, 659, 784],
    arcs: [
      { id: 'hanh1', title: 'Buổi dạy cuối', line: 'Cuối tháng này cô nghỉ hưu. Cô muốn đứng lớp lần cuối trong một chiếc áo thật nền nã, để học trò nhớ.',
        reqs: [['min', 'thanhlich', 30], ['mat', 'lua', 50], ['avoid', 'do'], ['decor', 'theu']], reward: { coins: 100, fabric: 'lua.trang.img_hadong', cm: 200 } },
      { id: 'hanh2', title: 'Phát biểu ở đám cưới học trò', line: 'Thằng Bin, đứa nghịch nhất lớp năm xưa, mời cô lên phát biểu đám cưới nó. Cô hồi hộp hơn đi thi!',
        reqs: [['min', 'truyenthong', 35], ['min', 'thanhlich', 25], ['mat', 'totam', 50], ['decor', 'cuc']], reward: { coins: 180, fabric: 'totam.trang.tron', cm: 300 } }
    ],
    letter: { title: 'Bài văn: Tả người thợ may em yêu quý',
      body: 'Đề bài: Tả người thợ may em yêu quý.\nBài làm: Ở hẻm Chỉ Hồng có một người thợ may. Người ấy đo vai cô bằng thước dây, mà đo lòng cô bằng sự kiên nhẫn.\nHôm cô dạy tiết cuối, học trò đứng dậy vỗ tay, cô biết một nửa tràng vỗ tay ấy là dành cho chiếc áo.\nHôm đám cưới thằng Bin, cô phát biểu không vấp chữ nào. Nó nói: “Cô mặc đẹp quá, em quên mất là em từng sợ cô.”\nĐiểm: 10. Không trừ dấu chấm phẩy nào.\nCô Hạnh' }
  },

  vy: {
    sig: 'voan.hoaca.tron',
    greet: ['Hey em! Chị mới vẽ xong mười cái phác thảo, bỏ hết chín cái.', 'Chị ghé xin chút cảm hứng. Tiệm em thơm mùi vải mới ghê.',
      'Em ơi, chị nghĩ ra một kiểu tà áo mới lúc đang kẹt xe. Nghe nè!'],
    gossip: ['Chị Vy dán bảng màu kín cả cửa sổ phòng trọ. Chủ nhà tưởng chị mở tiệm sơn.',
      'Nghe nói có tạp chí hỏi mượn ảnh bộ sưu tập của chị Vy. Chị hỏi lại ba lần cho chắc là không phải nhầm số.'],
    giftLike: 'Trời, chất này mà làm tà xếp ly thì đỉnh! Chị lấy nha, cảm ơn em!',
    giftOk: 'Ồ, cảm ơn em. Để chị nghĩ coi biến nó thành cái gì “phá cách” được.',
    bell: [659, 784, 988, 1175],
    arcs: [
      { id: 'vy1', title: 'Bộ sưu tập đầu tay', line: 'Chị gom hết tiền tiết kiệm làm bộ sưu tập đầu tiên. Áo mẫu phải mới, đừng giống áo bà ngoại chị nha!',
        reqs: [['min', 'hiendai', 35], ['max', 'truyenthong', 30], ['decor', 'dinh']], reward: { coins: 120, fabric: 'ren.trang.img_ren', cm: 200 } },
      { id: 'vy2', title: 'Show thật, đèn thật', line: 'Có nhãn hàng ở Đà Lạt mời chị trình diễn. Bộ kết phải lấp lánh như đèn sân khấu!',
        reqs: [['min', 'rucro', 35], ['min', 'hiendai', 30], ['mat', 'kimsa', 50], ['avoid', 'trang']], reward: { coins: 200, fabric: 'kimsa.champagne.img_kimsa', cm: 300 } }
    ],
    letter: { title: 'Thư từ hậu trường Đà Lạt',
      body: 'Em ơi,\nChị viết thư này ở hậu trường, tay còn dính kim tuyến. Đà Lạt lạnh mà chị nóng ran: nhãn hàng vừa đặt hai mươi bộ!\nLúc người mẫu mặc bộ kết bước ra, đèn chiếu vô, cả khán phòng “ồ” lên một tiếng. Chị đứng sau cánh gà mà muốn khóc.\nTrong phần cảm ơn, chị ghi tên tiệm {shop} ngay dòng đầu, trên cả tên chị.\nÀ, còn một chuyện. Áo bà ngoại chị cũng đẹp. Chị nói vậy hồi trước là chị sai.\nChị Vy' }
  },

  nam: {
    sig: 'gam.vang.img_gam_rong',
    greet: ['Cháu ơi, bà ghé coi tiệm cháu làm ăn sao. Ăn bánh bò không, bà mua dư.', 'Ông Năm gửi lời hỏi thăm cháu. Ổng nói ổng thích cái áo bà mặc bữa trước.',
      'Bà đóng tiệm vàng sớm một bữa, ghé đây ngồi chơi cho mát.'],
    gossip: ['Bà Năm khoe: ông Năm tập nhảy cha-cha-cha để chuẩn bị đám cưới vàng. Hàng xóm nghe tiếng dép mỗi tối.',
      'Tiệm vàng Bà Năm treo bảng “Hôm nay bà đi may áo, mai mở cửa”. Không ai phàn nàn.'],
    giftLike: 'Vải này sang nè! Cháu biết gu bà ghê. Bà cất kỹ, Tết may.',
    giftOk: 'Bà cảm ơn cháu. Bà đem về cho đứa cháu dâu, nó thích mấy màu nhẹ.',
    bell: [392, 494, 587],
    arcs: [
      { id: 'nam1', title: 'Hẹn hò lại với ông Năm', line: 'Ông Năm rủ bà đi ăn kem Bạch Đằng như hồi mới quen. Bốn chục năm rồi đó cháu!',
        reqs: [['min', 'sangtrong', 35], ['min', 'thanhlich', 20], ['avoid', 'den'], ['decor', 'cuc']], reward: { coins: 120, fabric: 'nhung.ruou.tron', cm: 200 } },
      { id: 'nam2', title: 'Đám cưới vàng', line: 'Kỷ niệm năm mươi năm cưới, con cháu tổ chức lại đám cưới cho ông bà. Áo phải hơn hồi xưa!',
        reqs: [['min', 'truyenthong', 40], ['min', 'sangtrong', 35], ['mat', 'gam', 50], ['decor', 'tranh']], reward: { coins: 220, fabric: 'gam.do.img_maudon', cm: 300 } }
    ],
    letter: { title: 'Hai nét chữ',
      body: 'Cháu ơi,\nĐám cưới vàng của ông bà vui lắm. Con cháu về đông đủ, ai cũng khen áo bà mặc sang mà hiền. Bà cảm ơn cháu.\nBà còn nhớ hồi bà cưới, áo do Bà Tư may, bả thức ba đêm. Giờ tới cháu của bả may cho bà. Cái hẻm này nó tròn như vậy đó.\n(Tới đây là nét chữ khác, bút bi xanh, nghiêng nghiêng:)\nBà nhà tôi mặc đẹp quá, tôi suýt đi lạc vì nhìn bà. Năm chục năm rồi mà vẫn vậy.\nÔng Năm' }
  },

  thao: {
    sig: 'voan.trang.img_hoanhi',
    greet: ['Chị ơi! Em mới thi xong, em ghé khoe điểm nè.', 'Em đi học ngang qua, ghé chào chị một cái rồi chạy!',
      'Em mua hai ly trà tắc, một ly cho chị nè!'],
    gossip: ['Em Thảo lập nhóm học ở quán trà đá đầu hẻm. Chú bán trà giờ thuộc luôn bảng tuần hoàn.',
      'Lớp em Thảo bình chọn “áo dài đẹp nhất khoá”. Kết quả còn giữ bí mật, nhưng ai cũng biết áo may ở đâu.'],
    giftLike: 'Trời ơi chị! Vải này em mơ lâu rồi. Em cảm ơn chị nhiều nhiều!',
    giftOk: 'Em cảm ơn chị! Để em hỏi mẹ coi may gì cho hợp.',
    bell: [784, 880, 1047],
    arcs: [
      { id: 'thao1', title: 'Kỷ yếu cả lớp', line: 'Cả lớp em mặc áo trắng hết, em muốn khác một xíu thôi, không thì cô chủ nhiệm la!',
        reqs: [['min', 'thanhlich', 30], ['max', 'sangtrong', 25], ['mat', 'voan', 50]], reward: { coins: 100, fabric: 'lua.hongphan.img_hadong', cm: 200 } },
      { id: 'thao2', title: 'Buổi phỏng vấn đầu đời', line: 'Thứ Hai em phỏng vấn ở ngân hàng! Áo phải chỉn chu mà không già nha chị.',
        reqs: [['min', 'thanhlich', 35], ['min', 'hiendai', 25], ['avoid', 'vang'], ['decor', 'cuc']], reward: { coins: 180, fabric: 'totam.champagne.tron', cm: 200 } }
    ],
    letter: { title: 'Em đậu rồi!!!',
      body: 'Chị ơi!\nEm đậu rồi!!! Ngân hàng gọi lúc em đang ăn mì gói, em làm đổ hết nước lèo.\nAnh phỏng vấn nói em trả lời tự tin. Em không nói với ảnh là em tự tin vì cái áo.\nLương tháng đầu em để dành may cho mẹ một bộ. Mẹ em cả đời chưa có cái áo dài nào may đo. Chị nhớ chừa lịch cho mẹ em nha.\nEm Thảo' }
  },

  ngoc: {
    sig: 'totam.do.tron',
    greet: ['Chào em! Chị vừa ghi hình xong, còn nguyên lớp trang điểm nè.', 'Hôm nay chị không lên sóng, chị chỉ muốn ghé tiệm em uống miếng trà.'],
    gossip: ['Chị Ngọc tập đếm ngược ở nhà mỗi tối. Con mèo nhà chị giờ nghe “mười, chín…” là chạy trốn.',
      'Fanpage của chị Ngọc vừa có bình luận thứ một ngàn hỏi cùng một câu: “Áo chị may ở đâu vậy?”'],
    giftLike: 'Vải này lên đèn đẹp lắm nè! Chị cảm ơn em, chị để dành cho show Tết.',
    giftOk: 'Cảm ơn em nha. Chị nhờ stylist coi thử, chắc phối được.',
    bell: [523, 784, 1047],
    arcs: [
      { id: 'ngoc1', title: 'Livestream đếm ngược', line: 'Đêm giao thừa chị dẫn trực tiếp. Mười giây đếm ngược mà áo không nổi là coi như mất Tết!',
        reqs: [['min', 'rucro', 40], ['min', 'sangtrong', 25], ['decor', 'dinh']], reward: { coins: 130, fabric: 'gam.do.img_gam_rong', cm: 200 } },
      { id: 'ngoc2', title: 'Ghế nóng', line: 'Chị chuyển sang làm talkshow. Khách mời mới là nhân vật chính, áo chị phải sang mà biết nhường.',
        reqs: [['max', 'rucro', 35], ['min', 'sangtrong', 35], ['mat', 'totam', 50]], reward: { coins: 200, fabric: 'totam.covit.tron', cm: 300 } }
    ],
    letter: { title: 'Ghim lên đầu trang',
      body: 'Em thân mến,\nTừ hôm chị mặc áo của em lên sóng, hộp tin nhắn của chị toàn một câu: “Áo chị may ở đâu vậy?”\nChị trả lời không xuể, nên chị ghim địa chỉ tiệm em lên đầu trang fanpage luôn. Bài ghim đó giờ nhiều lượt thích hơn cả ảnh cưới của chị.\nLàm MC mười năm, chị học được một điều: người đứng trên sân khấu chỉ sáng khi có người đứng sau lo cho họ. Cảm ơn em đã là người đứng sau.\nChị Ngọc' }
  },

  diep: {
    sig: 'nhung.timhue.tron',
    greet: ['Cô ghé nè con! Đêm qua cô ca tới khuya, giọng còn khàn khàn.', 'Đoàn hát nghỉ diễn bữa nay, cô ghé nghe tiếng máy may cho vui tai.',
      'Con ơi, tiếng máy may của con có nhịp lắm, cô nghe mà muốn ca theo.'],
    gossip: ['Cô Diệp tập vai mới ngay sân nhà. Cả hẻm Chỉ Hồng được nghe vọng cổ miễn phí mỗi sáng.',
      'Đoàn hát của cô Diệp có đào chánh mới. Nghe nói con bé ca hay tới mức cô Diệp ngồi rưng rưng ở hàng ghế cuối.'],
    giftLike: 'Chất vải này đứng đèn sân khấu đẹp lắm con. Cô cảm ơn, cô mang theo đoàn.',
    giftOk: 'Cô cảm ơn con. Để cô may cái áo bà ba mặc ở nhà.',
    bell: [440, 523, 659, 587],
    arcs: [
      { id: 'diep1', title: 'Vở cũ diễn lại', line: 'Đoàn cô dựng lại một vở cải lương bốn chục năm không ai diễn. Áo phải đậm chất xưa như hồi cô mới vô nghề.',
        reqs: [['min', 'truyenthong', 40], ['mat', 'nhung', 50], ['decor', 'dau']], reward: { coins: 130, fabric: 'nhung.do.tron', cm: 200 } },
      { id: 'diep2', title: 'Trao áo cho học trò', line: 'Con bé đào chánh mới của đoàn hát hay lắm mà nhà nghèo. Cô muốn tặng nó bộ áo đầu tiên.',
        reqs: [['min', 'truyenthong', 35], ['min', 'thanhlich', 20], ['decor', 'theu']], reward: { coins: 200, fabric: 'lua.do.tron', cm: 300 } }
    ],
    letter: { title: 'Sáu câu cảm ơn',
      body: 'Con ơi,\nCô viết thư này theo nhịp sáu câu vọng cổ, con đọc chậm chậm cho đúng điệu nghen.\nCâu một: Đêm đó đèn vừa lên, con bé đào chánh bước ra trong chiếc áo con may, cả rạp im phăng phắc… cô cảm ơn con.\nCâu hai: Nó ca tới đoạn mùi, tà áo khẽ lay theo từng tiếng đàn, như có gió đồng thổi vô rạp… cô cảm ơn con.\nCâu ba: Hạ màn, nó ôm cô khóc, nói con chưa bao giờ được mặc áo đẹp vậy… cô cảm ơn con.\nCâu bốn: Bốn chục năm đứng sân khấu, giờ cô mới hiểu cái áo cũng biết ca, biết khóc như người… cô cảm ơn con.\nCâu năm: Mai mốt cô già, cô không còn lên đèn, mà chiếc áo nầy còn đi diễn với tụi nhỏ… cô cảm ơn con.\nCâu sáu: Thôi cô xuống xề ở đây, kim con đưa, chỉ con giữ, hẻm mình còn hoài tiếng hát… cô cảm ơn con.\nCô Diệp' }
  },

  uyen: {
    sig: 'ren.hongphan.img_ren',
    greet: ['Chị ơi, em ghé nè! Em mới học nấu canh chua, chưa ai dám ăn.', 'Anh xã em gửi lời cảm ơn chị. Ảnh nói cưới được em là nhờ cái áo một phần.',
      'Em mới đi chợ với Bà Năm về. Bà dắt em đi khoe khắp chợ luôn!'],
    gossip: ['Chị Uyên tập gói bánh tét với Bà Năm. Đòn bánh đầu tiên méo như trái bí, bà vẫn khen.',
      'Nghe nói anh xã chị Uyên lén học may để vá áo cho vợ. Tới giờ mới vá được… cái gối.'],
    giftLike: 'Vải này mà may áo đi chùa với Bà Năm thì bà khen chắc luôn! Em cảm ơn chị.',
    giftOk: 'Em cảm ơn chị nha! Em để dành may áo cho đứa em gái.',
    bell: [587, 740, 880, 1175],
    arcs: [
      { id: 'uyen1', title: 'Tết đầu làm dâu', line: 'Tết đầu tiên về nhà chồng, em run quá! Áo phải hiền, phải Tết, phải được lòng Bà Năm.',
        reqs: [['min', 'truyenthong', 30], ['min', 'thanhlich', 25], ['mat', 'gam', 50], ['decor', 'theu']], reward: { coins: 130, fabric: 'gam.hongsen.img_maudon', cm: 200 } },
      { id: 'uyen2', title: 'Một năm ngày cưới', line: 'Anh xã đặt bàn ở nhà hàng trên sân thượng. Em muốn ảnh cưới lần hai đẹp hơn lần một!',
        reqs: [['min', 'sangtrong', 35], ['min', 'thanhlich', 30], ['avoid', 'den'], ['decor', 'choang']], reward: { coins: 220, fabric: 'totam.champagne.tron', cm: 300 } }
    ],
    letter: { title: 'Lần đầu bà khen em',
      body: 'Chị ơi,\nEm gửi chị “tấm ảnh” nè: chiếc áo một năm ngày cưới đứng cạnh chiếc áo cưới chị may hồi đó. Hai chiếc đứng chung, em nhìn hoài không chán.\nTối kỷ niệm, anh xã quên đặt bánh mà nhớ đặt bàn. Vậy là tiến bộ rồi.\nMà chuyện lớn nhất là: Bà Năm khen em mặc đẹp. Lần đầu bà khen em đó! Bà còn nói “cháu dâu nhà này”. Em suýt làm rớt ly nước.\nEm cảm ơn chị đã may cho em cả hai lần quan trọng nhất.\nUyên' }
  },

  khanh: {
    sig: 'dui.be.tron',
    greet: ['Chị ơi, em mới dẫn đoàn từ Hội An vô nè! Em có mang bánh đậu xanh.', 'Em ghé tiệm chị như ghé một điểm tham quan: “Tiệm may đẹp nhất hẻm Chỉ Hồng”!'],
    gossip: ['Em Khánh kể: ở Hội An có một bà cụ ngày nào cũng ra bờ sông khen áo dài của người qua đường.',
      'Em Khánh đi bộ trung bình mười hai cây số mỗi ngày. Đôi dép thứ ba trong năm vừa xin “nghỉ hưu”.'],
    giftLike: 'Vải này mặc đi bộ cả ngày cũng mát! Em cảm ơn chị, em mang về Hội An khoe.',
    giftOk: 'Em cảm ơn chị! Em may cái túi đựng bản đồ cho đoàn khách.',
    bell: [349, 440, 523, 698],
    arcs: [
      { id: 'khanh1', title: 'Đêm rằm phố Hội', line: 'Đêm rằm phố cổ tắt đèn điện, chỉ còn đèn lồng. Áo em phải đẹp dưới ánh nến nha chị.',
        reqs: [['min', 'truyenthong', 30], ['mat', 'dui', 50], ['avoid', 'den']], reward: { coins: 110, fabric: 'lua.vang.tron', cm: 200 } },
      { id: 'khanh2', title: 'Tour áo dài của riêng em', line: 'Em mở công ty tour nhỏ xíu, đúng một nhân viên là em! Áo đồng phục phải duyên và đi bộ cả ngày được.',
        reqs: [['min', 'thanhlich', 30], ['max', 'rucro', 30], ['decor', 'dau']], reward: { coins: 190, fabric: 'dui.reu.tron', cm: 300 } }
    ],
    letter: { title: 'Đèn lồng từ phố Hội',
      body: 'Chị ơi,\nEm gửi chị một chiếc đèn lồng giấy, em tự dán đó. Chị treo ở quầy cho tiệm sáng nha.\nCông ty tour của em giờ có hai nhân viên rồi! Đứa mới vô cũng đòi mặc đồng phục giống em, chắc em phải dẫn nó vô Sài Gòn may.\nChuyện này mới lạ nè: hôm trước em dẫn đoàn đi bờ sông, có một bà cụ khen áo em, hỏi ai may. Em nói tên tiệm, bà cười tít mắt: “Tiệm của cháu bà đó!” Là Bà Tư đó chị!\nBà dặn em gửi lời: “Bà khen con may tiến bộ.”\nEm Khánh' }
  },

  // ================= Bà Chủ Hột Xoàn (nhân vật gốc, không phải nhại) =================
  hotxoan: {
    sig: 'gam.do.img_maudon',
    greet: ['Em ơi, chị ghé coi áo mới… mà hôm nay tiệm em có khuyến mãi gì không?', 'Chị mới bán được bộ hột xoàn năm ly, vui quá ghé em chơi. Giảm giá cho chị nha?',
      'Chị đi chợ ngang, ghé hỏi thăm em. Hỏi thăm thôi, không xin giảm. Mà có thì cũng được.'],
    gossip: ['Bà Chủ Hột Xoàn treo bảng “Mua hột xoàn tặng lời khen”. Lời khen thì không giảm giá.',
      'Nghe nói Bà Chủ Hột Xoàn trả giá với cả cái máy bán nước tự động ở đầu chợ. Máy chưa chịu.'],
    giftLike: 'Ủa tặng chị hả? Miễn phí luôn hả? Trời, lần đầu chị được giảm giá một trăm phần trăm!',
    giftOk: 'Chị cảm ơn em nha. Quà là quý rồi, chị không trả giá quà đâu.',
    bell: [1047, 988, 880, 1047],
    arcs: [
      { id: 'hotxoan1', title: 'Khai trương chi nhánh hai', line: 'Chị mở thêm tiệm hột xoàn ở đầu chợ bên kia! Áo phải sáng như hột năm ly… À mà có giảm giá không em?',
        reqs: [['min', 'sangtrong', 40], ['mat', 'gam', 50], ['decor', 'dinh']], reward: { coins: 140, fabric: 'gam.champagne.img_gam_rong', cm: 200 } },
      { id: 'hotxoan2', title: 'Tiệc tri ân bạn hàng', line: 'Cuối năm chị đãi bạn hàng trong chợ. Chị muốn họ thấy áo do tiệm nhỏ trong hẻm may, để biết cái đẹp không cần to.',
        reqs: [['min', 'truyenthong', 30], ['min', 'sangtrong', 35], ['avoid', 'den']], reward: { coins: 220, fabric: 'totam.ruou.tron', cm: 300 } }
    ],
    letter: { title: 'Hoá đơn số 001',
      body: 'HOÁ ĐƠN SỐ 001 · TIỆM KIM HOÀN ĐẦU CHỢ\nKhách hàng: Tiệm {shop}, số 7 hẻm Chỉ Hồng.\nMặt hàng: lòng biết ơn, loại 24K, hột to cỡ trái nhãn.\nSố lượng: không đếm xuể. Đơn giá: không bán, chỉ tặng.\nGiảm giá: 0%. Lần đầu tiên trong đời chị không xin giảm.\nGhi chú: Tiệm {shop} đã may đẹp, đã không giảm giá, nhưng chị vẫn quý.\nKý tên: Bà Chủ Hột Xoàn' }
  },

  // ================= Người nổi tiếng (nhại vui phong cách sân khấu) =================
  trada: {
    sig: 'voan.hoaca.tron',
    greet: ['Hi em! Chị đang live nha, vẫy tay chào cả nhà đi em!', 'Hôm nay chị hoá trang thành… khách quen của tiệm em. Giống không?'],
    gossip: ['Trà Đắng vừa đăng clip “biến hình thành thợ may trong ba giây”. Cây thước dây trong clip là mượn của tiệm số 7.',
      'Clip mới của Trà Đắng quay ngay đầu hẻm Chỉ Hồng. Chú bán trà đá lên hình hai giây, giờ đòi cát-xê.'],
    giftLike: 'Ui vải này lên cam là “ăn” luôn! Chị cảm ơn em, clip sau có em nha.',
    giftOk: 'Cảm ơn em nha! Chị dùng làm phông nền quay clip được nè.',
    bell: [988, 784, 659, 988],
    arcs: [
      { id: 'trada1', title: 'Biến hình ba giây', line: 'Clip này chị búng tay một cái là từ đồ ngủ thành áo dài. Áo phải ăn hình ngay giây thứ ba!',
        reqs: [['min', 'hiendai', 35], ['min', 'rucro', 25], ['decor', 'dinh']], reward: { coins: 140, fabric: 'kimsa.do.tron', cm: 200 } },
      { id: 'trada2', title: 'Hoá thân… thành chính mình', line: 'Lần này chị không hoá trang. Chị muốn mặc áo dài mộc, để fan thấy chị thật.',
        reqs: [['min', 'thanhlich', 30], ['max', 'rucro', 30], ['mat', 'voan', 50]], reward: { coins: 220, fabric: 'voan.trang.img_hoanhi', cm: 300 } }
    ],
    letter: { title: 'Clip không hoá trang',
      body: 'Em ơi,\nChị kể em nghe: clip không hoá trang lại là clip nhiều view nhất của chị. Chị hoá trang mười năm, hoá ra khán giả thích nhìn chị thật nhất.\nBình luận đứng đầu là: “Áo này ai may vậy?” Chị ghim tên tiệm em luôn rồi.\nLần sau chị hoá trang, chị vẫn ghé em. Lần sau chị không hoá trang, chị càng ghé em.\nTrà Đắng' }
  },

  batan: {
    sig: 'dui.camdat.tron',
    greet: ['Cháu ơi, bà mới nấu xong nồi chè siêu to, bà để dành cho cháu một chén… siêu to luôn!', 'Hôm nay bà không quay clip, bà ghé tiệm cháu ngồi chơi cho đỡ nóng bếp.'],
    gossip: ['Bà Tân Vờ Lốc nấu nồi cháo đậu xanh mời cả hẻm. Hẻm ăn ba ngày chưa hết.',
      'Clip mới của Bà Tân Vờ Lốc: chiên trứng bằng chảo… siêu to. Cả hẻm Chỉ Hồng đứng xem.'],
    giftLike: 'Vải này mặc nấu ăn mát nè, dính dầu cũng dễ giặt! Bà cảm ơn cháu siêu to khổng lồ!',
    giftOk: 'Bà cảm ơn cháu nha. Bà may cái tạp dề, mặc vô quay clip.',
    bell: [262, 330, 392, 523],
    arcs: [
      { id: 'batan1', title: 'Nồi bánh chưng siêu to', line: 'Bà nấu nồi bánh chưng to nhất xóm, áo phải thật Tết mà xắn tay được nha cháu!',
        reqs: [['min', 'truyenthong', 35], ['mat', 'dui', 50], ['decor', 'theu']], reward: { coins: 130, fabric: 'gam.vang.img_gam_rong', cm: 200 } },
      { id: 'batan2', title: 'Mâm cơm cả hẻm', line: 'Bà nấu một mâm mời cả hẻm Chỉ Hồng. Đừng may áo trắng nha, nước mắm nó văng!',
        reqs: [['min', 'truyenthong', 30], ['min', 'rucro', 25], ['avoid', 'trang']], reward: { coins: 200, fabric: 'dui.do.img_thocam', cm: 300 } }
    ],
    letter: { title: 'Công thức của bà',
      body: 'Cháu ơi,\nBà viết thư bằng… cái muôi, nên chữ hơi to, cháu thông cảm.\nCÔNG THỨC: MÓN TIỆM MAY SIÊU DỄ THƯƠNG\nNguyên liệu: một tiệm may siêu dễ thương, một bà già siêu đói, một mâm cơm siêu to.\nCách làm: may xong thì ghé bà ăn cơm. Ăn no thì về may tiếp. Lặp lại mỗi tuần.\nMẹo nhỏ: áo cháu may, bà mặc nấu cả mâm cho hẻm, nước mắm văng mà không dính. Bí quyết là ở tay cháu.\nBà Tân' }
  },

  linhbb: {
    sig: 'lua.hongphan.img_hadong',
    greet: ['Hello em! Hôm nay chị không filter nè, nhìn được không?', 'Chị ghé review… à không, ghé chơi thôi. Tiệm em ánh sáng đẹp ghê.'],
    gossip: ['Linh Búp Bê vừa ra clip “trang điểm năm phút đi may áo”. Ba phút đầu là để chọn son.',
      'Nghe nói Linh Búp Bê tặng quán trà đá đầu hẻm một cái gương lớn. Giờ ai uống trà cũng ngồi sửa tóc.'],
    giftLike: 'Màu này lên da xinh lắm á! Chị cảm ơn em, chị thả tim liền.',
    giftOk: 'Cảm ơn em nha! Chị làm phông chụp ảnh sản phẩm được nè.',
    bell: [880, 988, 1175, 1319],
    arcs: [
      { id: 'linhbb1', title: 'Lên cam không filter', line: 'Lần này chị thử thách quay không filter. Áo phải trong trẻo tự nhiên.',
        reqs: [['min', 'thanhlich', 35], ['max', 'rucro', 25], ['mat', 'lua', 50]], reward: { coins: 120, fabric: 'lua.hongsen.tron', cm: 200 } },
      { id: 'linhbb2', title: 'Review đồ Tết… thật lòng', line: 'Năm nay chị chỉ review đồ chị thật sự thích. Áo của em là món đầu tiên.',
        reqs: [['min', 'hiendai', 30], ['min', 'thanhlich', 25], ['decor', 'dau']], reward: { coins: 200, fabric: 'voan.hongphan.tron', cm: 300 } }
    ],
    letter: { title: 'Không filter',
      body: 'Em ơi,\nVideo review áo của em được 98% thích. 2% còn lại hỏi sao chị không quay lâu hơn.\nLần đầu tiên chị quay mà không mở app chỉnh ảnh. Chị sợ lắm. Mà lên hình, cái áo đẹp tới mức không ai để ý chị quên kẻ chân mày.\nCảm ơn em đã cho chị một lần dám là chính mình trước ống kính.\nLinh' }
  },

  ngocha: {
    sig: 'totam.champagne.tron',
    greet: ['Hả? Em chưa pha trà cho chị à? Đùa thôi, chị ghé chơi.', 'Chị vừa tập xong, ghé tiệm em ngồi chút. Đừng nói với ai chị ở đây nha.'],
    gossip: ['Hồ Ngọc Hả đi ngang quán trà đá đầu hẻm. Cả quán đồng thanh “hả?” rồi quên trả tiền.',
      'Nghe nói Hồ Ngọc Hả tập hát mộc ở công viên. Có cụ ông ngồi nghe tới hết, rồi khen “giọng giống cháu gái tôi”.'],
    giftLike: 'Chất vải này có thần thái nè. Chị nhận, cảm ơn em.',
    giftOk: 'Cảm ơn em nha. Chị cất, biết đâu có show cần.',
    bell: [440, 554, 659, 880],
    arcs: [
      { id: 'ngocha1', title: 'Gala “Hả?”', line: 'Chị bước ra là cả khán phòng phải “hả” lên. Thần thái, em hiểu không?',
        reqs: [['min', 'sangtrong', 40], ['min', 'hiendai', 25], ['mat', 'totam', 50]], reward: { coins: 140, fabric: 'ren.den.img_ren', cm: 200 } },
      { id: 'ngocha2', title: 'Đêm nhạc acoustic', line: 'Đêm này chị chỉ ngồi ghế đẩu hát mộc. Áo nhẹ thôi, để giọng hát được nói.',
        reqs: [['min', 'thanhlich', 30], ['max', 'rucro', 30], ['decor', 'choang']], reward: { coins: 220, fabric: 'totam.trang.tron', cm: 300 } }
    ],
    letter: { title: 'Đêm không ai “hả”',
      body: 'Em,\nĐêm acoustic đó không ai “hả” cả. Mọi người im lặng nghe. Chị thích vậy hơn.\nChị ngồi ghế đẩu, áo em may nhẹ như hơi thở, chị quên luôn là mình đang mặc áo diễn.\nNhiều năm chị làm cho người ta phải ngước nhìn. Lần này chị chỉ muốn người ta lắng nghe. Cảm ơn em đã hiểu điều đó trước cả chị.\nHả? Lần này là chị hỏi em đó: năm sau may tiếp cho chị nha?\nNgọc Hả' }
  },

  chiphien: {
    sig: 'voan.hongphan.tron',
    greet: ['Em ơi chị tới nè! Chị mới làm hai câu: “Tiệm may ở cuối hẻm xa / Bước vô một bước, ra ba câu chào.”',
      'Chị ghé chơi nè. Hôm nay chị chưa làm thơ, để chị ngồi xíu là có liền.'],
    gossip: ['Chị Phiền livestream đọc thơ lúc nửa đêm. Ba trăm người xem, hai trăm chín mươi chín người thả tim.',
      'Chị Phiền làm thơ tặng chú bán trà đá. Chú cảm động, tặng lại một ly trà… có đá.'],
    giftLike: 'Chèn ơi vải này đẹp như thơ! Tối nay chị làm một bài tặng em liền.',
    giftOk: 'Chị cảm ơn em nha. Vải này chị làm khăn trải bàn đọc thơ.',
    bell: [523, 587, 659, 784],
    arcs: [
      { id: 'chiphien1', title: 'Đêm thơ livestream', line: 'Tối nay chị đọc thơ trên live, áo phải thướt tha cho xứng mấy câu chị làm!',
        reqs: [['min', 'thanhlich', 30], ['min', 'rucro', 25], ['mat', 'voan', 50], ['decor', 'dau']], reward: { coins: 130, fabric: 'ren.hongphan.img_ren', cm: 200 } },
      { id: 'chiphien2', title: 'Ra mắt tập thơ đầu tay', line: 'Chị in tập thơ thật rồi em! Buổi ra mắt có ba chục người, hai chục là họ hàng, nhưng chị vẫn hồi hộp.',
        reqs: [['min', 'truyenthong', 30], ['avoid', 'den'], ['decor', 'theu']], reward: { coins: 200, fabric: 'lua.hongsen.tron', cm: 300 } }
    ],
    letter: { title: 'Thơ tặng tiệm may',
      body: 'Em ơi,\nBuổi ra mắt tập thơ có ba mươi người, hai mươi là họ hàng, mười người còn lại là… họ hàng xa. Mà ai cũng khen áo chị đẹp.\nChị làm tặng em bài này, chị thức tới ba giờ sáng đó:\nHẻm nhỏ có tiệm may xinh\nKim đưa chỉ dệt mối tình áo hoa\nChị mặc đi khắp gần xa\nAi khen chị đẹp, chị la: tiệm này!\nThơ hơi vụng, mà lòng chị thì thật. Cảm ơn em.\nChị Phiền' }
  },

  damvb: {
    sig: 'kimsa.champagne.img_kimsa',
    greet: ['Em ơi, anh tới nè! Đèn tiệm em hơi tối, để anh đứng gần cửa sổ cho sáng.', 'Hôm nay anh chưa đính gì hết, anh thấy mình hơi… trơn.'],
    gossip: ['Đàm Vĩnh Biệt đi ngang hẻm lúc cúp điện. Cả hẻm vẫn thấy đường nhờ áo kim sa của anh.',
      'Nghe nói Đàm Vĩnh Biệt lại công bố “đêm diễn cuối cùng”. Đây là lần thứ… không ai đếm nữa.'],
    giftLike: 'Vải này sáng nè! Anh thích! Đính thêm chút nữa là hết chê.',
    giftOk: 'Cảm ơn em. Hơi ít lấp lánh, mà anh quý tấm lòng.',
    bell: [698, 880, 1047, 1397],
    arcs: [
      { id: 'damvb1', title: 'Lấp lánh nhất sân khấu', line: 'Có gì sáng nhất cứ đính hết lên cho anh! Ban tổ chức tắt đèn anh vẫn phải sáng!',
        reqs: [['min', 'rucro', 40], ['mat', 'kimsa', 50], ['decor', 'dinh']], reward: { coins: 150, fabric: 'kimsa.den.tron', cm: 200 } },
      { id: 'damvb2', title: 'Đêm nhạc… chưa vĩnh biệt', line: 'Anh hứa đây là đêm diễn cuối. Cuối năm nay thôi nha. Áo phải sang mà đứng đắn.',
        reqs: [['min', 'sangtrong', 40], ['max', 'hiendai', 30], ['decor', 'cuc']], reward: { coins: 230, fabric: 'nhung.den.img_nhung', cm: 300 } }
    ],
    letter: { title: 'Chưa vĩnh biệt',
      body: 'Em,\nĐêm diễn cuối của anh có ba lần encore. Vậy là chưa cuối.\nKhán giả không cho anh về, nên anh hát thêm. Rồi hát thêm. Áo em may vẫn đứng dáng tới bài cuối, không sứt một hột cúc.\nAnh tính rồi: năm sau anh làm thêm một đêm cuối nữa. Hẹn em năm sau may tiếp.\nTái bút: Áo không kim sa mà anh vẫn thấy mình sáng. Lạ ghê.\nMr. Đàm' }
  },

  tranthanh: {
    sig: 'totam.ruou.tron',
    greet: ['Em ơi… anh mới bước vô thôi mà thấy tiệm ấm cúng quá, anh rưng rưng.', 'Hôm nay anh hứa không khóc. Anh chỉ mang khăn dự phòng thôi.'],
    gossip: ['Trấn Thành Công dẫn chương trình ở chợ hoa, khóc khi nghe giá một chậu mai. Vì rẻ quá.',
      'Nghe nói Trấn Thành Công mua khăn tay theo lố. Mỗi lố một trăm cái.'],
    giftLike: 'Em tặng anh hả… thôi xong, anh khóc. Cảm ơn em nhiều lắm.',
    giftOk: 'Cảm ơn em nha. Anh không khóc đâu… chỉ hơi cay mắt.',
    bell: [392, 349, 330, 294],
    arcs: [
      { id: 'tranthanh1', title: 'Gameshow Tết', line: 'Anh dẫn gameshow Tết… áo mà đẹp quá chắc anh khóc trên sóng mất.',
        reqs: [['min', 'thanhlich', 30], ['min', 'sangtrong', 30], ['mat', 'totam', 50]], reward: { coins: 140, fabric: 'lua.covit.tron', cm: 200 } },
      { id: 'tranthanh2', title: 'Áo chống… nước mắt', line: 'Em may cho anh bộ khóc lên áo không lộ vệt được không? Đừng màu trắng nha em.',
        reqs: [['avoid', 'trang'], ['min', 'sangtrong', 30], ['mat', 'lua', 50], ['decor', 'cuc']], reward: { coins: 220, fabric: 'nhung.ruou.img_nhung', cm: 300 } }
    ],
    letter: { title: 'Thất bại',
      body: 'Em ơi,\nAnh đã cố không khóc khi viết thư này. Thất bại.\n(Tờ giấy có ba vệt loang xanh.)\nGameshow Tết năm nay anh khóc bốn lần trên sóng, mà không ai thấy vệt nào trên áo. Đạo diễn hỏi anh có phép thuật gì. Anh nói: có tiệm may.\nCảm ơn em. Anh đi lấy khăn đây.\nTrấn Thành Công' }
  },

  sontung: {
    sig: 'nhung.den.tron',
    greet: ['Hi em, anh ghé nè! Ê, góc này của tiệm em quay MV được đó.', 'Anh vừa thu âm xong, ghé nghe tiếng máy may. Nhịp hay ghê.'],
    gossip: ['Sơn Tung Tăng đứng chờ đèn đỏ ở đầu hẻm, hai trăm bạn trẻ đứng chờ… Sơn Tung Tăng.',
      'Nghe nói Sơn Tung Tăng thu tiếng máy may của tiệm số 7 làm nhạc nền. Chưa biết cho bài nào.'],
    giftLike: 'Chất này lên hình là có “vibe” riêng. Anh lấy nha, cảm ơn em!',
    giftOk: 'Cảm ơn em. Anh đưa stylist, chắc họ biến nó thành gì đó hay ho.',
    bell: [330, 392, 494, 659],
    arcs: [
      { id: 'sontung1', title: 'MV không đụng hàng', line: 'MV mới cần áo dài cách tân, phải chất và không giống ai.',
        reqs: [['min', 'hiendai', 35], ['max', 'truyenthong', 25], ['mat', 'nhung', 50]], reward: { coins: 150, fabric: 'nhung.cobalt.img_nhung', cm: 200 } },
      { id: 'sontung2', title: 'Đêm diễn ở quê nhà', line: 'Anh về quê diễn cho bà con xem, mộc thôi mà vẫn phải có chất riêng.',
        reqs: [['min', 'truyenthong', 30], ['min', 'hiendai', 25], ['decor', 'vien']], reward: { coins: 220, fabric: 'gam.cobalt.img_maudon', cm: 300 } }
    ],
    letter: { title: 'Bà con khen',
      body: 'Em,\nĐêm diễn ở quê, bà con không xem MV, không biết triệu view là gì. Họ chỉ khen: “Thằng nhỏ mặc áo dài bảnh ghê.”\nAnh vui hơn được triệu view.\nMẹ anh đứng hàng đầu, cầm cây quạt nan quạt hoài. Không phải vì nóng, mà vì mẹ không biết làm gì với tay khi xúc động.\nCảm ơn em đã may cho anh một chiếc áo về được tới nhà.\nSơn Tung' }
  },

  trangvau: {
    sig: 'dui.reu.tron',
    greet: ['Chào em. Anh ghé. Không có gì gấp.', 'Anh đi bộ từ đầu hẻm vô mất hai mươi phút. Tại anh dừng nói chuyện với mấy con mèo.'],
    gossip: ['Trắng Vâu ngồi quán trà đá đầu hẻm ba tiếng, uống đúng một ly. Chú bán trà gọi đó là “sống chậm”.',
      'Nghe nói Trắng Vâu đang viết một bài rap về cây chổi tre. Sáu tháng, đã xong hai câu.'],
    giftLike: 'Vải mộc. Anh thích. Cảm ơn em.',
    giftOk: 'Cảm ơn em nha. Anh mang về cho mẹ coi.',
    bell: [294, 330, 392],
    arcs: [
      { id: 'trangvau1', title: 'Về quê ăn Tết với mẹ', line: 'Anh chỉ cần bộ áo đơn giản, mặc về nhà mẹ không nhận ra là được rồi.',
        reqs: [['min', 'truyenthong', 30], ['max', 'rucro', 20], ['mat', 'dui', 50]], reward: { coins: 120, fabric: 'dui.mutat.tron', cm: 200 } },
      { id: 'trangvau2', title: 'Sống chậm ở làng', line: 'Anh ở lại làng thêm một tháng. Áo mặc đi chợ, đi chùa, ngồi hiên đều được.',
        reqs: [['min', 'thanhlich', 30], ['avoid', 'do'], ['decor', 'dau']], reward: { coins: 190, fabric: 'lua.be.tron', cm: 300 } }
    ],
    letter: { title: 'Ba dòng',
      body: 'Mẹ khen.\nAnh viết chậm.\nCảm ơn em.\nTrắng Vâu' }
  },

  xuannam: {
    sig: 'gam.do.img_gam_rong',
    greet: ['Khởi bẩm chủ tiệm, Táo đã tới! Hôm nay không báo cáo, chỉ ghé chơi.', 'Anh ghé nè em. Năm nay lại phải lên chầu, phải tập dượt cái áo trước.'],
    gossip: ['Xuân Nam tập vai Táo ngay đầu hẻm. Mấy đứa nhỏ tưởng thật, xếp hàng xin… điều ước.',
      'Nghe nói Xuân Nam mượn cái bếp lò của Bà Tân Vờ Lốc để “nhập vai”. Bà đòi lại vì đang hầm xương.'],
    giftLike: 'Muôn tâu, vải này đẹp! Táo xin nhận và ghi vào bản báo cáo cuối năm.',
    giftOk: 'Cảm ơn em nhé. Táo cất vào kho, chờ Ngọc Hoàng phê duyệt.',
    bell: [392, 523, 392, 659],
    arcs: [
      { id: 'xuannam1', title: 'Táo về chầu', line: 'Năm nay Táo lên chầu, áo phải đúng chất Táo, Ngọc Hoàng nhìn là cho điểm!',
        reqs: [['min', 'truyenthong', 40], ['mat', 'gam', 50], ['decor', 'dau']], reward: { coins: 140, fabric: 'gam.vang.img_gam_rong', cm: 200 } },
      { id: 'xuannam2', title: 'Bản báo cáo cuối năm', line: 'Anh muốn đọc “báo cáo” về hẻm Chỉ Hồng trong tiết mục mới. Áo phải vui mà vẫn đàng hoàng!',
        reqs: [['min', 'rucro', 30], ['min', 'truyenthong', 30], ['decor', 'vien']], reward: { coins: 220, fabric: 'nhung.do.tron', cm: 300 } }
    ],
    letter: { title: 'Bản tấu trình cuối năm',
      body: 'Muôn tâu Ngọc Hoàng, và kính gửi tiệm {shop},\nTáo xin tấu trình về hẻm Chỉ Hồng năm nay: tiệm {shop} may không biết bao nhiêu chiếc áo, chưa để khách nào khóc.\nTrừ Trấn Thành Công, nhưng anh ấy khóc vì vui.\nVề kinh tế: tiệm làm ăn khấm khá. Về văn hoá: cả hẻm mặc áo dài đi chợ. Về an ninh: không có gì đáng lo, trừ tiếng máy may lúc nửa đêm.\nTáo kính xin Ngọc Hoàng ban cho tiệm một năm mới kim không gãy, chỉ không rối.\nTáo Xuân Nam kính tấu' }
  }
};

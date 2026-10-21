// The other shops in the alley. Net-worth curves at each month end (day 1, 6, 11 … 61), measured with
// tools/simbot.js (business mode, quoting on) for each owner's skill/care, then scaled for character.
G.RIVALS = [
  { id: 'coba', name: 'Tiệm Cô Ba Lụa', owner: 'Cô Ba', col: '#4a86b8', note: 'thợ lành nghề nhất hẻm',
    curve: [450, 1700, 3140, 3620, 6980, 9280, 12490, 14560, 16620, 18580, 19770, 22360, 25290] },
  { id: 'kevin', name: 'Áo Dài Siêu Tốc 24h', owner: 'Kevin Khải', col: '#6b5bb8', note: 'nhanh, rẻ, hơi ẩu',
    curve: [450, 1440, 2730, 3650, 5900, 8030, 10480, 12170, 13910, 15500, 17690, 18890, 21070] },
  { id: 'bong', name: 'Áo Dài Bống', owner: 'Chị Bống', col: '#d6698a', note: 'trẻ, mê áo cách tân',
    curve: [450, 1320, 1700, 3220, 3720, 5780, 8940, 11320, 13330, 14450, 15560, 17760, 19890] },
  { id: 'ongsau', name: 'Nhà May Ông Sáu', owner: 'Ông Sáu Kéo Vàng', col: '#c9952e', note: 'ông nội Kevin, chậm mà chắc',
    curve: [450, 1100, 2420, 3960, 4910, 5710, 7070, 8470, 10870, 11500, 13340, 13980, 14760] },
  { id: 'tun', name: 'Tiệm Mới Của Tũn', owner: 'Tũn', col: '#8a7366', note: 'liều, từng phá sản một lần',
    curve: [450, 1010, 2080, 2770, 3230, 1500, 400, 900, 1700, 2400, 3100, 3600, 4100] }
];

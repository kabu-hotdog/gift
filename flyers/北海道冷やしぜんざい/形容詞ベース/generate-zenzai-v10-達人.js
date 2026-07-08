// 北海道冷やしぜんざい v10「達人」
// テーマ：一生を小豆に捧げた和菓子職人が、その技をひんやりスイーツに応用した——という体裁。
// 落款(はんこ)風の「極」印、巨大な一文字「匠」を掛け軸のように据え、証書のような枠で全体を締める。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', '..', 'products', '北海道冷やしぜんざい');
const dims = loadDims(DIR);

const SIZZLE = '北海道冷やしぜんざい2種6本ｾｯﾄ_2.jpg';
const JAR = {
  plain: '北海道冷やしぜんざい(プレーン).png',
  ichigo: '北海道冷やしぜんざい(いちご).png',
  ringo: '北海道冷やしぜんざい(りんご).png',
};

const CREAM = 'F0E6D2';
const CREAM_LT = 'F8F1E1';
const INK = '231F1A';
const INDIGO = '1E3A5F';
const VERM = 'B7402F';
const GOLD = 'C9A227';
const WHITE = 'FFFFFF';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: CREAM };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

const CX = 0.55;
const CW = 7.17;

// ============ 和紙風の淡い罫線テクスチャ ============
for (let i = 0; i < 34; i++) {
  slide.addShape('line', {
    x: 0.3, y: 0.35 + i * 0.335, w: 7.67, h: 0,
    line: { color: GOLD, width: 0.5, transparency: 90 },
  });
}

// ============ 証書風の外枠 ============
slide.addShape('rect', {
  x: 0.3, y: 0.3, w: 7.67, h: 11.09,
  fill: { type: 'none' }, line: { color: GOLD, width: 1.5 },
});
slide.addShape('rect', {
  x: 0.4, y: 0.4, w: 7.47, h: 10.89,
  fill: { type: 'none' }, line: { color: GOLD, width: 0.75 },
});

// ============ 落款風の印「極」 ============
const sealBox = { x: 6.47, y: 0.55, w: 1.15, h: 1.15 };
slide.addShape('roundRect', {
  ...sealBox, rectRadius: 0.08,
  fill: { color: VERM }, line: { color: GOLD, width: 2.25 },
});
slide.addText('極', {
  x: sealBox.x, y: sealBox.y + 0.03, w: sealBox.w, h: sealBox.h * 0.68,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 50, bold: true, color: WHITE, align: 'center', valign: 'middle',
});
slide.addText('職人監修', {
  x: sealBox.x, y: sealBox.y + sealBox.h * 0.68, w: sealBox.w, h: sealBox.h * 0.30,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 9.5, bold: true, color: WHITE, align: 'center', valign: 'middle',
});

// ============ 見出し前口上 ============
slide.addText('十勝産小豆を、ひと粒ずつ吟味する。', {
  x: CX, y: 0.72, w: 5.6, h: 0.32,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 11, color: INK, align: 'left', valign: 'middle', wrap: false,
});

// ============ 巨大な一文字「匠」（掛け軸のように） ============
slide.addText('匠', {
  x: 0, y: 1.5, w: 8.27, h: 3.15,
  fontFace: 'HGMinchoE', fontSize: 205, bold: true, color: INDIGO, transparency: 78,
  align: 'center', valign: 'middle',
});

// ============ 題字 ============
slide.addText('匠の技、ひと粒に。', {
  x: CX, y: 3.55, w: CW, h: 0.6,
  fontFace: 'HGGyoshotai', fontSize: 34, color: INDIGO, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('北海道冷やしぜんざい', {
  x: CX, y: 4.16, w: CW, h: 0.42,
  fontFace: 'HGMinchoE', fontSize: 19, bold: true, color: INK, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('十勝産小豆と北海道牛乳。ふたつの吟味から生まれる甘さ。', {
  x: CX, y: 4.60, w: CW, h: 0.28,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 10.5, color: '5A4A32', align: 'center', valign: 'middle', wrap: false,
});

// ============ 商品写真（証書に添える一葉のように） ============
const photoBox = { x: CX, y: 5.00, w: CW, h: 3.35 };
slide.addShape('roundRect', {
  ...photoBox, rectRadius: 0.04,
  fill: { color: WHITE }, line: { color: GOLD, width: 2 },
});
addCover(SIZZLE, { x: photoBox.x + 0.1, y: photoBox.y + 0.1, w: photoBox.w - 0.2, h: photoBox.h - 0.2 });
slide.addShape('rect', {
  x: photoBox.x + 0.1, y: photoBox.y + 0.1, w: photoBox.w - 0.2, h: photoBox.h - 0.2,
  fill: { type: 'none' }, line: { color: GOLD, width: 1 },
});

// ============ 三種の仕込み書（フレーバー） ============
const flavors = [
  { key: 'plain', name: 'プレーン' },
  { key: 'ichigo', name: 'いちご' },
  { key: 'ringo', name: 'りんご' },
];
const rowY = 8.62;
const colW = CW / 3;
flavors.forEach((fl, i) => {
  const cx = CX + i * colW;
  const d = 0.78;
  const circleX = cx + colW / 2 - d / 2;
  slide.addShape('ellipse', {
    x: circleX, y: rowY, w: d, h: d,
    fill: { color: CREAM_LT }, line: { color: GOLD, width: 1.5 },
  });
  placeContain(JAR[fl.key], { x: circleX + 0.09, y: rowY + 0.09, w: d - 0.18, h: d - 0.18 });
  slide.addText(fl.name, {
    x: cx, y: rowY + d + 0.04, w: colW, h: 0.26,
    fontFace: 'HGMinchoE', fontSize: 12.5, bold: true, color: INK, align: 'center', valign: 'middle',
  });
});

// ============ 職人の基準（クレデンシャル） ============
const credY = 9.82;
slide.addShape('line', { x: CX + CW / 2 - 0.85, y: credY + 0.13, w: 0.55, h: 0, line: { color: VERM, width: 1 } });
slide.addShape('line', { x: CX + CW / 2 + 0.30, y: credY + 0.13, w: 0.55, h: 0, line: { color: VERM, width: 1 } });
slide.addText('職人の基準', {
  x: CX, y: credY, w: CW, h: 0.27,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 14.5, color: VERM, align: 'center', valign: 'middle',
});
slide.addText('小豆は北海道十勝産のみ。ひと粒の艶と大きさを見極め、\n手間を惜しまず、丁寧に炊き上げる。それが職人の流儀。', {
  x: CX, y: credY + 0.30, w: CW, h: 0.42,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 11, color: INK, align: 'center', valign: 'middle', lineSpacingMultiple: 1.2,
});

// ============ 木札ならぬ証書の但し書き（スペック） ============
const boardY = 10.62;
const boardH = 0.63;
slide.addShape('roundRect', {
  x: CX, y: boardY, w: CW, h: boardH, rectRadius: 0.04,
  fill: { color: CREAM_LT }, line: { color: GOLD, width: 1.5 },
});
const specs = [
  ['商品名', '北海道冷やしぜんざい'],
  ['内容量', '90g'],
  ['賞味期限', '冷凍60日'],
  ['入数', '40'],
];
const specColW = CW / 4;
specs.forEach(([label, value], i) => {
  const sx = CX + i * specColW;
  slide.addText(label, {
    x: sx, y: boardY + 0.05, w: specColW, h: 0.20,
    fontFace: 'BIZ UDPMincho Medium', fontSize: 8.5, color: '8A6A3A', align: 'center', valign: 'middle',
  });
  slide.addText(value, {
    x: sx, y: boardY + 0.25, w: specColW, h: 0.34,
    fontFace: 'HGMinchoE', fontSize: 11.5, bold: true, color: INDIGO, align: 'center', valign: 'middle', wrap: false,
  });
});

safeWriteFile(pptx, path.join(__dirname, 'zenzai-v10-達人.pptx')).then(() => console.log('written v10'));

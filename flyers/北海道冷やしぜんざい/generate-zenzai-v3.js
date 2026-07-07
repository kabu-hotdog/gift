// 北海道冷やしぜんざい v3「ひんやり処方箋」
// テーマ：夏バテ・ほてりに効く「処方箋」として商品情報を言い換える。
// 症状→処方→用法・用量、3フレーバーを薬剤名のように並べる。写真はテープ留めした添付写真の体裁。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers } = require('../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', 'products', '北海道冷やしぜんざい');
const dims = loadDims(DIR);

const SIZZLE = '北海道冷やしぜんざい2種6本ｾｯﾄ_2.jpg';
const JAR = {
  plain: '北海道冷やしぜんざい(プレーン).png',
  ichigo: '北海道冷やしぜんざい(いちご).png',
  ringo: '北海道冷やしぜんざい(りんご).png',
};

const PAPER = 'FBFAF4';
const MINT = '1E5B4F';
const MINT_LT = 'E4EFE9';
const INK = '2B2320';
const SUBINK = '6B5D50';
const RED = 'B7402F';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: PAPER };
const { addCover, placeContain, img } = makeHelpers(slide, dims, DIR);

// ============ ヘッダー：処方箋の題字 ============
const HEAD_H = 1.15;
slide.addShape('rect', { x: 0, y: 0, w: 8.27, h: HEAD_H, fill: { color: MINT }, line: { type: 'none' } });
slide.addText('Rp.', {
  x: 0.35, y: 0.18, w: 1.3, h: 0.8,
  fontFace: 'Yu Mincho Demibold', fontSize: 40, italic: true, color: 'FFFFFF', valign: 'middle',
});
slide.addText('ひんやり処方箋', {
  x: 1.5, y: 0.18, w: 5.0, h: 0.8,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 26, color: 'FFFFFF', valign: 'middle', wrap: false,
});
// 印（丸スタンプ）
slide.addShape('ellipse', { x: 6.95, y: 0.15, w: 0.85, h: 0.85, fill: { color: 'FFFFFF' }, line: { color: RED, width: 2 } });
slide.addText('なな\nいろ', {
  x: 6.95, y: 0.2, w: 0.85, h: 0.75,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 15, color: RED, align: 'center', valign: 'middle', lineSpacingMultiple: 0.95,
});
// パンチ穴（切り取り線の表現）
for (let i = 0; i < 14; i++) {
  slide.addShape('ellipse', { x: 0.15 + i * 0.585, y: HEAD_H - 0.08, w: 0.16, h: 0.16, fill: { color: PAPER }, line: { type: 'none' } });
}

// ============ 添付写真（テープ留め風、少し傾ける） ============
const photoBox = { x: 0.75, y: 1.55, w: 6.77, h: 4.55 };
slide.addShape('rect', { x: photoBox.x - 0.06, y: photoBox.y - 0.06, w: photoBox.w + 0.12, h: photoBox.h + 0.12, fill: { color: 'FFFFFF' }, line: { color: 'D8D0C0', width: 1 }, rotate: -1.2 });
addCover(SIZZLE, photoBox);
// 洗濯テープ（角に貼った風の半透明矩形）
[[photoBox.x - 0.2, photoBox.y - 0.2], [photoBox.x + photoBox.w - 0.55, photoBox.y - 0.2]].forEach(([tx, ty]) => {
  slide.addShape('rect', { x: tx, y: ty, w: 0.75, h: 0.32, fill: { color: 'FDE9A8', transparency: 30 }, line: { type: 'none' }, rotate: -35 });
});
slide.addText('添付：実物写真', {
  x: photoBox.x, y: photoBox.y + photoBox.h + 0.1, w: photoBox.w, h: 0.25,
  fontFace: 'BIZ UDGothic', fontSize: 9, color: SUBINK, align: 'right',
});

// ============ 症状・処方・用法（罫線区切りの記入欄） ============
const fieldY0 = 6.55;
const fields = [
  ['症状', '夏バテ・ほてり気味'],
  ['処方', '北海道冷やしぜんざい（プレーン・いちご・りんご）'],
  ['用法・用量', 'よく冷やして1日1本。そのままスプーンでお召し上がりください。'],
];
let fy = fieldY0;
fields.forEach(([label, value]) => {
  slide.addShape('line', { x: 0.75, y: fy, w: 6.77, h: 0, line: { color: 'CFC6B4', width: 1 } });
  slide.addShape('rect', { x: 0.75, y: fy + 0.08, w: 1.15, h: 0.34, fill: { color: MINT_LT }, line: { type: 'none' } });
  slide.addText(label, {
    x: 0.75, y: fy + 0.08, w: 1.15, h: 0.34,
    fontFace: 'BIZ UDGothic', fontSize: 11, bold: true, color: MINT, align: 'center', valign: 'middle',
  });
  slide.addText(value, {
    x: 2.05, y: fy + 0.06, w: 5.45, h: 0.4,
    fontFace: 'Yu Mincho Demibold', fontSize: 12.5, color: INK, valign: 'middle', wrap: false,
  });
  fy += 0.56;
});
slide.addShape('line', { x: 0.75, y: fy, w: 6.77, h: 0, line: { color: 'CFC6B4', width: 1 } });

// ============ 3フレーバー＝処方薬剤（ブリスターパック風） ============
const flavors = [
  { key: 'plain', name: 'プレーン', note: '北海道産小豆・生乳' },
  { key: 'ichigo', name: 'いちご', note: '国産いちご果肉入り' },
  { key: 'ringo', name: 'りんご', note: '国産りんご果肉入り' },
];
const rowY0 = fy + 0.35;
const colGap = 0.25;
const colW = (6.77 - colGap * 2) / 3;
flavors.forEach((fl, i) => {
  const cx = 0.75 + i * (colW + colGap);
  slide.addShape('roundRect', { x: cx, y: rowY0, w: colW, h: 1.85, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: 'D8D0C0', width: 1 } });
  // ブリスター窓（円形の凹み風）
  slide.addShape('ellipse', { x: cx + colW / 2 - 0.55, y: rowY0 + 0.12, w: 1.1, h: 1.1, fill: { color: MINT_LT }, line: { color: MINT, width: 1, dashType: 'dash' } });
  placeContain(JAR[fl.key], { x: cx + colW / 2 - 0.42, y: rowY0 + 0.2, w: 0.84, h: 0.94 });
  slide.addText(fl.name, {
    x: cx, y: rowY0 + 1.28, w: colW, h: 0.28,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 13, color: INK, align: 'center',
  });
  slide.addText(fl.note, {
    x: cx + 0.05, y: rowY0 + 1.55, w: colW - 0.1, h: 0.28,
    fontFace: 'BIZ UDGothic', fontSize: 8, color: SUBINK, align: 'center', wrap: false,
  });
});

// ============ スペック（薬局受付印風） ============
const specY = rowY0 + 2.15;
slide.addShape('rect', { x: 0.75, y: specY, w: 6.77, h: 0.85, fill: { color: MINT }, line: { type: 'none' } });
const specs = [
  ['商品名', '北海道冷やしぜんざい'],
  ['内容量', '90g'],
  ['賞味期限', '冷凍60日'],
  ['入数', '40'],
];
const specColW = 6.77 / 4;
specs.forEach(([label, value], i) => {
  const sx = 0.75 + i * specColW;
  slide.addText(label, {
    x: sx, y: specY + 0.08, w: specColW, h: 0.28,
    fontFace: 'BIZ UDGothic', fontSize: 9.5, color: 'D9E8E1', align: 'center',
  });
  slide.addText(value, {
    x: sx, y: specY + 0.38, w: specColW, h: 0.38,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 13, color: 'FFFFFF', align: 'center', wrap: false,
  });
});

// ============ フッター ============
slide.addText('この処方箋は、あなたの夏を守るために。 — なないろキッチン', {
  x: 0.75, y: specY + 1.05, w: 6.77, h: 0.3,
  fontFace: 'Yu Mincho Demibold', fontSize: 10, italic: true, color: SUBINK, align: 'center',
});

pptx.writeFile({ fileName: path.join(__dirname, 'zenzai-v3.pptx') }).then(() => console.log('written v3'));

// 北海道冷やしぜんざい v4「なつまつり夜店」
// テーマ：縁日の夜店（かき氷屋台）に見立てる。写真は暖簾の内側から覗く構図、
// 3フレーバーは提灯、スペックは屋台の木札看板に言い換える。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', 'products', '北海道冷やしぜんざい');
const dims = loadDims(DIR);

const SIZZLE = '北海道冷やしぜんざい2種6本ｾｯﾄ_2.jpg';
const JAR = {
  plain: '北海道冷やしぜんざい(プレーン).png',
  ichigo: '北海道冷やしぜんざい(いちご).png',
  ringo: '北海道冷やしぜんざい(りんご).png',
};

const INDIGO = '16233F';
const INDIGO_DK = '0E1830';
const GOLD = 'C9A227';
const VERM = 'D14A24';
const CREAM = 'FBF3DE';
const WHITE = 'FFFFFF';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: INDIGO };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// ============ 写真バンド（上部・暖簾の内側から覗く体裁） ============
const photoH = 4.5;
addCover(SIZZLE, { x: 0, y: 0, w: 8.27, h: photoH });
slide.addShape('rect', { x: 0, y: photoH - 1.0, w: 8.27, h: 1.0, fill: { color: INDIGO, transparency: 15 }, line: { type: 'none' } });

// 暖簾のフリンジ
const fringeCount = 12;
const fringeW = 8.27 / fringeCount;
for (let i = 0; i < fringeCount; i++) {
  slide.addShape('triangle', {
    x: i * fringeW, y: photoH - 0.38, w: fringeW, h: 0.45,
    fill: { color: INDIGO }, line: { type: 'none' }, flipV: true,
  });
}

// ============ 提灯ロゴ「ぜ」 ============
const logoBox = { x: 8.27 / 2 - 0.65, y: photoH - 0.42, w: 1.3, h: 1.3 };
slide.addShape('ellipse', { ...logoBox, fill: { color: VERM }, line: { color: GOLD, width: 3 } });
slide.addText('ぜ', {
  x: logoBox.x, y: logoBox.y + 0.04, w: logoBox.w, h: logoBox.h - 0.08,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 54, bold: true, color: WHITE, align: 'center', valign: 'middle',
});

// ============ 題字 ============
const titleY = logoBox.y + logoBox.h + 0.15;
slide.addText('なつまつり夜店', {
  x: 0.3, y: titleY, w: 7.67, h: 0.95,
  fontFace: 'HGGyoshotai', fontSize: 38, color: GOLD, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('北海道冷やしぜんざい', {
  x: 0.3, y: titleY + 0.9, w: 7.67, h: 0.42,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 20, color: WHITE, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('つるん、ひんやり、あまい。北の恵みを、ひと粒に。', {
  x: 0.3, y: titleY + 1.35, w: 7.67, h: 0.3,
  fontFace: 'BIZ UDGothic', fontSize: 11, color: 'B9C4DE', align: 'center', valign: 'middle', wrap: false,
});

// ============ 3フレーバー＝提灯 ============
const flavors = [
  { key: 'plain', name: 'プレーン' },
  { key: 'ichigo', name: 'いちご' },
  { key: 'ringo', name: 'りんご' },
];
const lanternY0 = titleY + 1.85;
const lanternH = 1.55;
const gap = 0.3;
const lanternW = (7.67 - gap * 2) / 3;
flavors.forEach((fl, i) => {
  const cx = 0.3 + i * (lanternW + gap);
  const lift = i === 1 ? -0.12 : 0;
  const ly = lanternY0 + lift;
  slide.addShape('line', { x: cx + lanternW / 2, y: ly - 0.16, w: 0, h: 0.16, line: { color: GOLD, width: 1.5 } });
  slide.addShape('roundRect', { x: cx, y: ly, w: lanternW, h: lanternH, rectRadius: 0.28, fill: { color: VERM }, line: { color: GOLD, width: 2 } });
  slide.addShape('line', { x: cx + 0.08, y: ly + 0.26, w: lanternW - 0.16, h: 0, line: { color: GOLD, width: 1 } });
  slide.addShape('line', { x: cx + 0.08, y: ly + lanternH - 0.32, w: lanternW - 0.16, h: 0, line: { color: GOLD, width: 1 } });
  const winD = 0.82;
  slide.addShape('ellipse', { x: cx + lanternW / 2 - winD / 2, y: ly + 0.34, w: winD, h: winD, fill: { color: 'FFF7E6' }, line: { type: 'none' } });
  placeContain(JAR[fl.key], { x: cx + lanternW / 2 - 0.3, y: ly + 0.4, w: 0.6, h: 0.68 });
  slide.addText(fl.name, {
    x: cx, y: ly + lanternH - 0.3, w: lanternW, h: 0.26,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 12.5, color: WHITE, align: 'center', valign: 'middle',
  });
});

// ============ 木札看板（スペック） ============
const boardY = lanternY0 + lanternH + 0.4;
const boardH = 0.9;
slide.addShape('roundRect', { x: 0.3, y: boardY, w: 7.67, h: boardH, rectRadius: 0.05, fill: { color: CREAM }, line: { color: GOLD, width: 2 } });
[0.45, 7.62].forEach((tx) => {
  slide.addShape('ellipse', { x: tx, y: boardY - 0.1, w: 0.13, h: 0.13, fill: { color: GOLD }, line: { type: 'none' } });
});
const specs = [
  ['商品名', '北海道冷やしぜんざい'],
  ['内容量', '90g'],
  ['賞味期限', '冷凍60日'],
  ['入数', '40'],
];
const specColW = 7.67 / 4;
specs.forEach(([label, value], i) => {
  const sx = 0.3 + i * specColW;
  slide.addText(label, {
    x: sx, y: boardY + 0.08, w: specColW, h: 0.24,
    fontFace: 'BIZ UDGothic', fontSize: 9, color: '8A6A3A', align: 'center', valign: 'middle',
  });
  slide.addText(value, {
    x: sx, y: boardY + 0.34, w: specColW, h: 0.46,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 12, color: INDIGO_DK, align: 'center', valign: 'middle', wrap: false,
  });
});

// ============ フッター ============
slide.addText('なないろキッチン', {
  x: 0.3, y: boardY + boardH + 0.15, w: 7.67, h: 0.32,
  fontFace: 'HGGyoshotai', fontSize: 15, color: GOLD, align: 'center', valign: 'middle',
});

safeWriteFile(pptx, path.join(__dirname, 'zenzai-v4.pptx')).then(() => console.log('written v4'));

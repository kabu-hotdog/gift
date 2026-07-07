// なないろキッチン スープカレーキッチン v1「スパイス調合ラボ」
// テーマ：2種のスープカレーの素を「調合レポート」に見立てる。瓶は検体、写真の具材にはピン留めの解説線。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', 'products', 'なないろキッチン');
const dims = loadDims(DIR);

const SIZZLE = 'screenshot.876.jpg';
const JAR = { coconut: 'アセット 1ココナッツ.png', wafu: 'アセット 1和風.png' };

const KRAFT = '2F2620';
const KRAFT_LT = '3E3327';
const CREAM = 'F4EBDA';
const MUSTARD = 'D9A441';
const RED = 'B8402E';
const GREEN = '7A8C5A';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: KRAFT };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// 外枠（レポート用紙の二重線）
slide.addShape('rect', { x: 0.18, y: 0.18, w: 7.91, h: 11.33, fill: { type: 'none' }, line: { color: MUSTARD, width: 1 } });

// ============ ヘッダー ============
slide.addShape('ellipse', { x: 0.4, y: 0.4, w: 1.05, h: 1.05, fill: { type: 'none' }, line: { color: RED, width: 2.5 } });
slide.addText('調合\n分析済', {
  x: 0.4, y: 0.45, w: 1.05, h: 0.95,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 12, color: RED, align: 'center', valign: 'middle', lineSpacingMultiple: 1.05, rotate: -8,
});
slide.addText('SPICE LAB — 調合レポート', {
  x: 1.65, y: 0.42, w: 6.0, h: 0.35,
  fontFace: 'BIZ UDGothic', fontSize: 12, color: MUSTARD, charSpacing: 2,
});
slide.addText('スープカレーキッチン', {
  x: 1.6, y: 0.72, w: 6.1, h: 0.75,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 34, color: CREAM, wrap: false,
});

// ============ 2種＝検体サンプル瓶 ============
const sampleY = 1.75;
const sampleH = 3.05;
const gap = 0.3;
const colW = (7.67 - gap) / 2;
const samples = [
  {
    key: 'coconut', name: 'ココナッツ味', tag: 'No.01',
    desc: '風味豊かなココナッツとスパイスのコクに、野菜の旨味を合わせたまろやかで濃厚な一杯。',
    profile: [['スパイス感', 55, MUSTARD], ['コク', 75, RED], ['まろやかさ', 85, GREEN]],
  },
  {
    key: 'wafu', name: '和風だし味', tag: 'No.02',
    desc: 'かつお節エキスの旨味を効かせ、チキン・ポークエキスでガラ感を付与。トマトと玉ねぎの甘みにスパイスを合わせて。',
    profile: [['スパイス感', 60, MUSTARD], ['旨味（だし）', 90, RED], ['まろやかさ', 55, GREEN]],
  },
];
samples.forEach((s, i) => {
  const cx = 0.3 + i * (colW + gap);
  slide.addShape('rect', { x: cx, y: sampleY, w: colW, h: sampleH, fill: { color: KRAFT_LT }, line: { color: MUSTARD, width: 1 } });
  slide.addText(s.tag, {
    x: cx + 0.15, y: sampleY + 0.1, w: 1.2, h: 0.3,
    fontFace: 'BIZ UDGothic', fontSize: 10, color: MUSTARD, charSpacing: 1,
  });
  placeContain(JAR[s.key], { x: cx + colW / 2 - 0.75, y: sampleY + 0.35, w: 1.5, h: 1.5 });
  slide.addText(s.name, {
    x: cx + 0.15, y: sampleY + 1.9, w: colW - 0.3, h: 0.35,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 16, color: CREAM, align: 'center', wrap: false,
  });
  slide.addText(s.desc, {
    x: cx + 0.18, y: sampleY + 2.28, w: colW - 0.36, h: 0.7,
    fontFace: 'BIZ UDGothic', fontSize: 8.2, color: 'CFC3AC', lineSpacingMultiple: 1.25,
  });
  // 風味プロフィール（イメージ）バー
  let by = sampleY + sampleH + 0.12;
  s.profile.forEach(([label, pct, color]) => {
    slide.addText(label, { x: cx, y: by, w: 1.3, h: 0.2, fontFace: 'BIZ UDGothic', fontSize: 7.5, color: 'B8AC94' });
    slide.addShape('rect', { x: cx + 1.3, y: by + 0.03, w: colW - 1.3, h: 0.12, fill: { color: KRAFT_LT }, line: { color: 'B8AC94', width: 0.5 } });
    slide.addShape('rect', { x: cx + 1.3, y: by + 0.03, w: (colW - 1.3) * (pct / 100), h: 0.12, fill: { color }, line: { type: 'none' } });
    by += 0.24;
  });
});

// ============ しずる写真（実食データ） ============
const photoY = sampleY + sampleH + 1.35;
const photoH = 4.55;
slide.addShape('rect', { x: 0.3, y: photoY - 0.32, w: 2.0, h: 0.3, fill: { color: RED }, line: { type: 'none' } });
slide.addText('実食データ', {
  x: 0.3, y: photoY - 0.32, w: 2.0, h: 0.3,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 12, color: CREAM, align: 'center', valign: 'middle',
});
addCover(SIZZLE, { x: 0.3, y: photoY, w: 7.67, h: photoH });
slide.addShape('rect', { x: 0.3, y: photoY, w: 7.67, h: photoH, fill: { type: 'none' }, line: { color: MUSTARD, width: 1.5 } });

// 具材の解説ピン（写真内の見える具材にラベル付け）
const pins = [
  { x: 0.55, y: photoY + 0.25, label: 'ターメリックライス' },
  { x: 5.9, y: photoY + 0.35, label: 'にんにく丸ごと' },
  { x: 6.0, y: photoY + 2.6, label: '厚切りベーコン' },
  { x: 0.6, y: photoY + 3.9, label: '香味スパイス' },
];
pins.forEach((p) => {
  slide.addShape('ellipse', { x: p.x, y: p.y, w: 0.1, h: 0.1, fill: { color: MUSTARD }, line: { type: 'none' } });
  slide.addShape('rect', { x: p.x - 0.02, y: p.y + 0.08, w: 1.35, h: 0.24, fill: { color: KRAFT, transparency: 15 }, line: { color: MUSTARD, width: 0.75 } });
  slide.addText(p.label, {
    x: p.x - 0.02, y: p.y + 0.08, w: 1.35, h: 0.24,
    fontFace: 'BIZ UDGothic', fontSize: 7.5, color: CREAM, align: 'center', valign: 'middle', wrap: false,
  });
});

// ============ フッター ============
slide.addText('なないろキッチン', {
  x: 0.3, y: photoY + photoH + 0.15, w: 7.67, h: 0.35,
  fontFace: 'BIZ UDGothic', fontSize: 12, color: MUSTARD, align: 'center', charSpacing: 2,
});

safeWriteFile(pptx, path.join(__dirname, 'curry-v1.pptx')).then(() => console.log('written curry v1'));

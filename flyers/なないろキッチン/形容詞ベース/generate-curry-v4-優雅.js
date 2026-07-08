// なないろキッチン スープカレーキッチン v4「優雅」
// テーマ：ラフなスープカレーの素を、上質なテイスティングメニューへと格上げする。
// 濃い色の余白・細い金の罫線・二皿仕立ての構成で静かな高級感を出す。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', '..', 'products', 'なないろキッチン');
const dims = loadDims(DIR);

const SIZZLE = 'screenshot.876.jpg';
const JAR = { coconut: 'アセット 1ココナッツ.png', wafu: 'アセット 1和風.png' };

const CHARCOAL = '211C18';
const CHARCOAL_LT = '2B241F';
const GOLD = 'C9A227';
const CREAM = 'EFE6D4';
const CREAM_DIM = 'BFB39C';
const AMBER = 'C77B3A';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: CHARCOAL };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// ============ 外枠：細い金の二重ライン ============
slide.addShape('rect', { x: 0.32, y: 0.32, w: 7.63, h: 11.05, fill: { type: 'none' }, line: { color: GOLD, width: 0.75 } });
slide.addShape('rect', { x: 0.4, y: 0.4, w: 7.47, h: 10.89, fill: { type: 'none' }, line: { color: GOLD, width: 0.5 } });

// ============ ヘッダー：小さな案内文 + 大きなタイトル ============
slide.addText('S O U P   C U R R Y', {
  x: 0, y: 0.72, w: 8.27, h: 0.3,
  fontFace: 'BIZ UDGothic', fontSize: 11, color: GOLD, align: 'center', charSpacing: 5, wrap: false,
});

slide.addShape('line', { x: 3.63, y: 1.12, w: 1.0, h: 0, line: { color: GOLD, width: 0.75 } });

slide.addText('スープカレーキッチン', {
  x: 0.4, y: 1.28, w: 7.47, h: 1.0,
  fontFace: 'HGMinchoE', fontSize: 40, color: CREAM, align: 'center', valign: 'middle', wrap: false,
});

slide.addText('なないろキッチン', {
  x: 0.4, y: 2.18, w: 7.47, h: 0.35,
  fontFace: 'BIZ UDGothic', fontSize: 11, color: CREAM_DIM, align: 'center', charSpacing: 3, wrap: false,
});

slide.addShape('line', { x: 3.63, y: 2.62, w: 1.0, h: 0, line: { color: GOLD, width: 0.75 } });

// ============ しずる写真：生成的な余白で呼吸させる ============
const photoY = 2.95;
const photoH = 3.85;
const photoW = 6.47;
const photoX = (8.27 - photoW) / 2;
addCover(SIZZLE, { x: photoX, y: photoY, w: photoW, h: photoH });
slide.addShape('rect', { x: photoX, y: photoY, w: photoW, h: photoH, fill: { type: 'none' }, line: { color: GOLD, width: 1 } });

// 隅の飾り罫（フレームのアクセント）
const cornerLen = 0.22;
// 各コーナーはL字型（横棒＋縦棒）を正の幅・高さのみで組み立てる
function cornerLines(hx, hy, vx, vy) {
  slide.addShape('line', { x: hx, y: hy, w: cornerLen, h: 0, line: { color: GOLD, width: 1 } });
  slide.addShape('line', { x: vx, y: vy, w: 0, h: cornerLen, line: { color: GOLD, width: 1 } });
}
// 左上
cornerLines(photoX - 0.09, photoY - 0.09, photoX - 0.09, photoY - 0.09);
// 右上
cornerLines(photoX + photoW + 0.09 - cornerLen, photoY - 0.09, photoX + photoW + 0.09, photoY - 0.09);
// 左下
cornerLines(photoX - 0.09, photoY + photoH + 0.09, photoX - 0.09, photoY + photoH + 0.09 - cornerLen);
// 右下
cornerLines(photoX + photoW + 0.09 - cornerLen, photoY + photoH + 0.09, photoX + photoW + 0.09, photoY + photoH + 0.09 - cornerLen);

// ============ テイスティングメニュー：第一皿／第二皿 ============
const menuY = photoY + photoH + 0.35;
slide.addText('T A S T I N G   M E N U', {
  x: 0, y: menuY, w: 8.27, h: 0.28,
  fontFace: 'BIZ UDGothic', fontSize: 10, color: GOLD, align: 'center', charSpacing: 4, wrap: false,
});

const courseY = menuY + 0.40;
const gap = 0.5;
const colW = (7.47 - gap) / 2;

const courses = [
  {
    key: 'coconut', course: '第一皿', name: 'ココナッツ',
    desc: '風味豊かなココナッツとスパイスのコクに、\n野菜の旨味を重ねたまろやかで濃厚な一杯。',
  },
  {
    key: 'wafu', course: '第二皿', name: '和風だし',
    desc: 'かつお節エキスの旨味にチキン・ポークの\nガラ感、トマトと玉ねぎの甘みを香るスパイスで。',
  },
];

courses.forEach((c, i) => {
  const cx = 0.4 + i * (colW + gap);

  // コース番号
  slide.addText(c.course, {
    x: cx, y: courseY, w: colW, h: 0.32,
    fontFace: 'BIZ UDGothic', fontSize: 10.5, color: AMBER, align: 'center', charSpacing: 3, wrap: false,
  });

  // 小さなワックスシール風の円 + 瓶
  const jarBoxSize = 1.0;
  const jarCx = cx + colW / 2 - jarBoxSize / 2;
  slide.addShape('ellipse', {
    x: jarCx - 0.14, y: courseY + 0.34, w: jarBoxSize + 0.28, h: jarBoxSize + 0.28,
    fill: { type: 'none' }, line: { color: GOLD, width: 0.75 },
  });
  placeContain(JAR[c.key], { x: jarCx, y: courseY + 0.48, w: jarBoxSize, h: jarBoxSize });

  // 罫線
  slide.addShape('line', { x: cx + colW / 2 - 0.35, y: courseY + 1.72, w: 0.7, h: 0, line: { color: GOLD, width: 0.5 } });

  // 名称
  slide.addText(c.name, {
    x: cx, y: courseY + 1.80, w: colW, h: 0.32,
    fontFace: 'HGMinchoE', fontSize: 16, color: CREAM, align: 'center', wrap: false,
  });

  // 説明文
  slide.addText(c.desc, {
    x: cx + 0.05, y: courseY + 2.14, w: colW - 0.1, h: 0.6,
    fontFace: 'BIZ UDGothic', fontSize: 8.3, color: CREAM_DIM, align: 'center', lineSpacingMultiple: 1.35,
  });
});

// ============ 共通情報：控えめな一行（辛さ・容量） ============
const infoY = courseY + 2.90;
slide.addShape('line', { x: 3.63, y: infoY, w: 1.0, h: 0, line: { color: GOLD, width: 0.75 } });
slide.addText('中辛　　1瓶で4皿分', {
  x: 0.4, y: infoY + 0.14, w: 7.47, h: 0.32,
  fontFace: 'BIZ UDGothic', fontSize: 10.5, color: CREAM_DIM, align: 'center', charSpacing: 2, wrap: false,
});

// ============ フッター ============
const footerY = infoY + 0.14 + 0.32 + 0.15;
slide.addText('N A N A I R O   K I T C H E N', {
  x: 0.4, y: footerY, w: 7.47, h: 0.28,
  fontFace: 'BIZ UDGothic', fontSize: 9, color: GOLD, align: 'center', charSpacing: 3, wrap: false,
});

safeWriteFile(pptx, path.join(__dirname, 'curry-v4-優雅.pptx')).then(() => console.log('written curry v4'));

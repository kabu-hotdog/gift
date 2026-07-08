// なないろキッチン スープカレーキッチン v5「スパイスの匠」
// テーマ：伝統工芸の匠が仕上げた逸品、という静かな威厳。認定証・落款(はんこ)のモチーフ。
// v1「調合ラボ」とは明確に異なる方向性（データバー・ピン留め解説線・クラフト紙の実験室感は使わない）。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', '..', 'products', 'なないろキッチン');
const dims = loadDims(DIR);

const SIZZLE = 'screenshot.876.jpg';
const JAR = { coconut: 'アセット 1ココナッツ.png', wafu: 'アセット 1和風.png' };

const ESPRESSO = '2E1F16';
const ESPRESSO_LT = '3D2B1D';
const GOLD = 'C9A227';
const CREAM = 'EFE0C8';
const VERMILLION = 'A8362A';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: ESPRESSO };
const { addCover, placeContain, img } = makeHelpers(slide, dims, DIR);

// ============ 外枠（二重の金の細線＝認定証のあしらい） ============
slide.addShape('rect', { x: 0.22, y: 0.22, w: 7.83, h: 11.25, fill: { type: 'none' }, line: { color: GOLD, width: 1.25 } });
slide.addShape('rect', { x: 0.32, y: 0.32, w: 7.63, h: 11.05, fill: { type: 'none' }, line: { color: GOLD, width: 0.5 } });

// ============ ヘッダー：巨大な「匠」＋題字＋落款 ============
slide.addText('匠', {
  x: 0.42, y: 0.5, w: 2.15, h: 2.15,
  fontFace: 'HGGyoshotai', fontSize: 168, color: GOLD, align: 'center', valign: 'middle',
});
slide.addText('スパイスの匠', {
  x: 2.75, y: 0.68, w: 4.7, h: 0.42,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 17, color: GOLD, charSpacing: 3,
});
slide.addText('スープカレーキッチン', {
  x: 2.72, y: 1.08, w: 4.85, h: 1.0,
  fontFace: 'HGMinchoE', fontSize: 33, color: CREAM, wrap: false, bold: true,
});
slide.addText('永年培った目利きで選び抜いた、二種の調べ。', {
  x: 2.75, y: 1.95, w: 4.7, h: 0.4,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 11, color: 'C9B896', charSpacing: 0.5,
});

// 落款（はんこ）：題字の右上にオーバーラップさせる
slide.addShape('rect', {
  x: 6.72, y: 0.55, w: 0.92, h: 0.92, fill: { color: VERMILLION }, line: { color: GOLD, width: 1.5 }, rotate: -4,
});
slide.addText('匠\n監修', {
  x: 6.72, y: 0.55, w: 0.92, h: 0.92, rotate: -4,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 19, color: CREAM, align: 'center', valign: 'middle', lineSpacingMultiple: 1.0,
});

slide.addShape('line', { x: 0.5, y: 2.72, w: 7.27, h: 0, line: { color: GOLD, width: 0.75 } });

// ============ 二種の調べ（瓶を台座に載せて静かに紹介） ============
slide.addText('二 種 の 調 べ', {
  x: 0.5, y: 2.9, w: 7.27, h: 0.4,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 16, color: GOLD, align: 'center', charSpacing: 6,
});

const jarY = 3.3;
const jarH = 3.0;
const gap = 0.3;
const colW = (7.27 - gap) / 2;
const samples = [
  {
    key: 'coconut', name: 'ココナッツ味',
    desc: '風味豊かなココナッツとスパイスのコクに、野菜の旨味を重ねた、まろやかで濃厚な一杯。',
  },
  {
    key: 'wafu', name: '和風だし味',
    desc: 'かつお節エキスの旨味を効かせ、チキン・ポークのガラ感を加えた、トマトと玉ねぎの甘み薫るひと椀。',
  },
];
samples.forEach((s, i) => {
  const cx = 0.5 + i * (colW + gap);
  // 台座
  slide.addShape('rect', { x: cx, y: jarY, w: colW, h: jarH, fill: { color: ESPRESSO_LT }, line: { color: GOLD, width: 0.75 } });
  slide.addShape('rect', { x: cx + 0.14, y: jarY + 0.14, w: colW - 0.28, h: jarH - 0.28, fill: { type: 'none' }, line: { color: GOLD, width: 0.25 } });

  placeContain(JAR[s.key], { x: cx + colW / 2 - 0.75, y: jarY + 0.22, w: 1.5, h: 1.5 });

  slide.addShape('line', { x: cx + colW / 2 - 0.55, y: jarY + 1.82, w: 1.1, h: 0, line: { color: GOLD, width: 0.5 } });

  slide.addText(s.name, {
    x: cx + 0.15, y: jarY + 1.9, w: colW - 0.3, h: 0.35,
    fontFace: 'HGMinchoE', fontSize: 18, color: CREAM, align: 'center', bold: true, wrap: false,
  });
  slide.addText(s.desc, {
    x: cx + 0.28, y: jarY + 2.28, w: colW - 0.56, h: 0.65,
    fontFace: 'BIZ UDPMincho Medium', fontSize: 9, color: 'D9CBAE', align: 'center', lineSpacingMultiple: 1.25,
  });
});

// ============ しずる写真 ============
const photoY = jarY + jarH + 0.35;
const photoH = 3.45;
addCover(SIZZLE, { x: 0.5, y: photoY, w: 7.27, h: photoH });
slide.addShape('rect', { x: 0.5, y: photoY, w: 7.27, h: photoH, fill: { type: 'none' }, line: { color: GOLD, width: 1.25 } });
// 四隅の金の角あしらい（認定証らしい装飾）
const corner = 0.28;
[[0.5, photoY], [0.5 + 7.27 - corner, photoY], [0.5, photoY + photoH - corner], [0.5 + 7.27 - corner, photoY + photoH - corner]].forEach(([cx, cy]) => {
  slide.addShape('rect', { x: cx, y: cy, w: corner, h: corner, fill: { type: 'none' }, line: { color: GOLD, width: 2 } });
});

// ============ フッター：静かな詳細（辛さ・容量） ============
const footY = photoY + photoH + 0.28;
slide.addShape('line', { x: 0.5, y: footY, w: 7.27, h: 0, line: { color: GOLD, width: 0.5 } });
slide.addText('辛さ　中辛　　　　1瓶で4皿分', {
  x: 0.5, y: footY + 0.12, w: 7.27, h: 0.34,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 11, color: 'C9B896', align: 'center', charSpacing: 1.5, wrap: false,
});
slide.addText('な な い ろ キ ッ チ ン', {
  x: 0.5, y: footY + 0.5, w: 7.27, h: 0.4,
  fontFace: 'HGSeikaishotaiPRO', fontSize: 15, color: GOLD, align: 'center', charSpacing: 4,
});

safeWriteFile(pptx, path.join(__dirname, 'curry-v5-達人.pptx')).then(() => console.log('written curry v5'));

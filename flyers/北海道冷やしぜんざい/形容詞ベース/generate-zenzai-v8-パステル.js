// 北海道冷やしぜんざい v8「パステル」
// テーマ：形容詞ムード「パステル」＝ソフト・キュート・インスタ映え。
// 色ブロック（ミント/ブラッシュピンク/バターイエロー）を波形の柔らかい境界で分割し、
// メイン写真は丸みの強いフレーム、3フレーバーは円いバブルに浮かせる。
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

// ---- パステルパレット ----
const MINT = 'C9E8DD';
const BLUSH = 'F6D6D9';
const BUTTER = 'FBEBB5';
const LAVENDER = 'E3D9F2';
const CORAL = 'E8A798';
const PLUM = '5B4A55'; // 本文用の柔らかいダークトーン
const WHITE = 'FFFFFF';
const CREAM = 'FFFBF6';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: CREAM };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

const PAGE_W = 8.27;

// ============ 背景カラーブロック（波形境界っぽく重ねる） ============
// 上部：ミント帯
slide.addShape('rect', { x: 0, y: 0, w: PAGE_W, h: 4.9, fill: { color: MINT }, line: { type: 'none' } });
// 波の縁：円弧をタイル状に重ねてミント→クリームへ柔らかく移行
for (let i = 0; i < 10; i++) {
  slide.addShape('ellipse', {
    x: i * 0.9 - 0.15, y: 4.55, w: 0.95, h: 0.7,
    fill: { color: MINT }, line: { type: 'none' },
  });
}
// 下部：ブラッシュピンク帯（脚注ゾーン）
slide.addShape('rect', { x: 0, y: 10.55, w: PAGE_W, h: 1.14, fill: { color: BLUSH }, line: { type: 'none' } });
for (let i = 0; i < 10; i++) {
  slide.addShape('ellipse', {
    x: i * 0.9 - 0.15, y: 10.25, w: 0.95, h: 0.65,
    fill: { color: BLUSH }, line: { type: 'none' },
  });
}

// ふわふわ雲モチーフ（アクセント、ごく薄く）
function cloud(cx, cy, s, color, alpha) {
  const parts = [
    { dx: -0.35 * s, dy: 0.05 * s, d: 0.5 * s },
    { dx: 0, dy: -0.1 * s, d: 0.62 * s },
    { dx: 0.35 * s, dy: 0.05 * s, d: 0.5 * s },
  ];
  parts.forEach((p) => {
    slide.addShape('ellipse', {
      x: cx + p.dx - p.d / 2, y: cy + p.dy - p.d / 2, w: p.d, h: p.d,
      fill: { color, transparency: alpha }, line: { type: 'none' },
    });
  });
}
cloud(1.0, 0.55, 0.9, WHITE, 45);
cloud(7.3, 0.4, 0.7, WHITE, 45);
cloud(0.55, 9.8, 0.6, WHITE, 55);
cloud(7.6, 10.9, 0.55, WHITE, 40);

// ============ メイン写真：丸みの強いフレーム ============
const photoBox = { x: 0.75, y: 0.55, w: 6.77, h: 3.55 };
// 白フチ（フレーム感）
slide.addShape('roundRect', {
  x: photoBox.x - 0.09, y: photoBox.y - 0.09, w: photoBox.w + 0.18, h: photoBox.h + 0.18,
  rectRadius: 0.5, fill: { color: WHITE }, line: { type: 'none' },
  shadow: { type: 'outer', color: '9AB8AC', opacity: 0.35, blur: 10, offset: 3, angle: 90 },
});
addCover(SIZZLE, photoBox, { rounding: false });
// フレーム自体は丸角の白マスクを四隅にかぶせて丸みを強調（roundRect枠線オーバーレイ）
slide.addShape('roundRect', {
  x: photoBox.x, y: photoBox.y, w: photoBox.w, h: photoBox.h,
  rectRadius: 0.42, fill: { type: 'none' }, line: { color: WHITE, width: 10 },
});

// ============ ブランドマーク（柔らかいコーラルの「ぜ」） ============
const logoBox = { x: PAGE_W - 1.55, y: photoBox.y + photoBox.h - 0.55, w: 1.15, h: 1.15 };
slide.addShape('ellipse', {
  ...logoBox, fill: { color: CORAL }, line: { color: WHITE, width: 4 },
  shadow: { type: 'outer', color: 'B98A7A', opacity: 0.4, blur: 8, offset: 2, angle: 90 },
});
slide.addText('ぜ', {
  x: logoBox.x, y: logoBox.y + 0.02, w: logoBox.w, h: logoBox.h - 0.04,
  fontFace: 'HGMaruGothicMPRO', fontSize: 46, bold: true, color: WHITE, align: 'center', valign: 'middle',
});

// ============ 題字 ============
const titleY = photoBox.y + photoBox.h + 0.35;
slide.addText('ふわもち、パステルおやつ。', {
  x: 0.3, y: titleY, w: 7.67, h: 0.5,
  fontFace: 'Klee One SemiBold', fontSize: 19, color: CORAL, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('北海道冷やしぜんざい', {
  x: 0.3, y: titleY + 0.46, w: 7.67, h: 0.62,
  fontFace: 'HGMaruGothicMPRO', fontSize: 34, bold: true, color: PLUM, align: 'center', valign: 'middle', wrap: false,
});
slide.addText('つるん、ひんやり、しあわせな甘さ。', {
  x: 0.3, y: titleY + 1.08, w: 7.67, h: 0.32,
  fontFace: 'BIZ UDGothic', fontSize: 12, color: PLUM, align: 'center', valign: 'middle', wrap: false,
});

// ============ 3フレーバー：円いバブルに浮かせる ============
const flavors = [
  { key: 'plain', name: 'プレーン', color: BUTTER, dark: 'A88A3E' },
  { key: 'ichigo', name: 'いちご', color: BLUSH, dark: 'C46E78' },
  { key: 'ringo', name: 'りんご', color: LAVENDER, dark: '8B79AC' },
];
const bubbleY0 = titleY + 1.55;
const bubbleD = 2.05;
const gap = 0.28;
const totalW = bubbleD * 3 + gap * 2;
const startX = (PAGE_W - totalW) / 2;
flavors.forEach((fl, i) => {
  const bx = startX + i * (bubbleD + gap);
  const lift = i === 1 ? -0.14 : 0;
  const by = bubbleY0 + lift;
  slide.addShape('ellipse', {
    x: bx, y: by, w: bubbleD, h: bubbleD,
    fill: { color: fl.color }, line: { type: 'none' },
    shadow: { type: 'outer', color: '9C8F98', opacity: 0.28, blur: 9, offset: 3, angle: 90 },
  });
  slide.addShape('ellipse', {
    x: bx + 0.12, y: by + 0.12, w: bubbleD - 0.24, h: bubbleD - 0.24,
    fill: { color: WHITE }, line: { type: 'none' },
  });
  placeContain(JAR[fl.key], { x: bx + 0.32, y: by + 0.28, w: bubbleD - 0.64, h: bubbleD - 0.9 });
  slide.addText(fl.name, {
    x: bx, y: by + bubbleD - 0.56, w: bubbleD, h: 0.4,
    fontFace: 'HGMaruGothicMPRO', bold: true, fontSize: 16, color: fl.dark, align: 'center', valign: 'middle',
  });
});

// ============ スペック：丸ピルタグ ============
const pillY = bubbleY0 + bubbleD + 0.32;
const specs = [
  { label: '内容量', value: '90g', color: MINT, dark: '3E8267' },
  { label: '賞味期限', value: '冷凍60日', color: BLUSH, dark: 'C46E78' },
  { label: '入数', value: '40個', color: BUTTER, dark: 'A88A3E' },
];
const pillGap = 0.25;
const pillW = (7.67 - pillGap * 2) / 3;
const pillH = 0.82;
specs.forEach((sp, i) => {
  const px = 0.3 + i * (pillW + pillGap);
  slide.addShape('roundRect', {
    x: px, y: pillY, w: pillW, h: pillH, rectRadius: pillH / 2,
    fill: { color: sp.color }, line: { type: 'none' },
    shadow: { type: 'outer', color: '9C8F98', opacity: 0.22, blur: 6, offset: 2, angle: 90 },
  });
  slide.addText(sp.label, {
    x: px, y: pillY + 0.09, w: pillW, h: 0.26,
    fontFace: 'BIZ UDGothic', fontSize: 10, color: sp.dark, align: 'center', valign: 'middle',
  });
  slide.addText(sp.value, {
    x: px, y: pillY + 0.33, w: pillW, h: 0.42,
    fontFace: 'HGMaruGothicMPRO', bold: true, fontSize: 17, color: PLUM, align: 'center', valign: 'middle', wrap: false,
  });
});

// ============ 中間の余白を埋める小さな紙吹雪ドット（パステル各色） ============
const confetti = [
  { x: 0.9, y: 9.55, d: 0.16, c: MINT },
  { x: 2.6, y: 9.85, d: 0.1, c: BUTTER },
  { x: 4.13, y: 9.5, d: 0.14, c: CORAL },
  { x: 5.7, y: 9.9, d: 0.12, c: LAVENDER },
  { x: 7.15, y: 9.55, d: 0.16, c: BLUSH },
  { x: 1.8, y: 10.15, d: 0.1, c: LAVENDER },
  { x: 6.3, y: 10.15, d: 0.1, c: MINT },
];
confetti.forEach((c) => {
  slide.addShape('ellipse', { x: c.x, y: c.y, w: c.d, h: c.d, fill: { color: c.c }, line: { type: 'none' } });
});

// ============ フッター（ブランド帯：ブラッシュピンク上） ============
slide.addText('なないろキッチン', {
  x: 0.3, y: 10.68, w: 7.67, h: 0.42,
  fontFace: 'Klee One SemiBold', fontSize: 16, color: CORAL, align: 'center', valign: 'middle',
});
slide.addText('やさしい甘さを、あなたに。', {
  x: 0.3, y: 11.08, w: 7.67, h: 0.3,
  fontFace: 'BIZ UDGothic', fontSize: 10, color: PLUM, align: 'center', valign: 'middle', wrap: false,
});

safeWriteFile(pptx, path.join(__dirname, 'zenzai-v8-パステル.pptx')).then(() => console.log('written v8'));

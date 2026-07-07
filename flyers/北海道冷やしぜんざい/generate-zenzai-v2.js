// 北海道冷やしぜんざい フライヤー v2（試作・構造修正版）
// v1は「上に写真/中にキャッチ/下に情報」の禁止三段構成に陥っていたため、
// 左に縦書きスパイン（ロゴ+商品名）を通す非対称2カラム構造に作り直した。
// スパインの深緑＝「ひんやり」の色。しずる文のアクア色と呼応させて統一感を出す。
const PptxGenJS = require('pptxgenjs');
const { imageSize } = require('image-size');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'products', '北海道冷やしぜんざい');
const dims = {};
for (const f of fs.readdirSync(DIR)) {
  if (/\.(jpg|jpeg|png)$/i.test(f)) {
    dims[f] = imageSize(fs.readFileSync(path.join(DIR, f)));
  }
}
const img = (name) => path.join(DIR, name);

const SIZZLE = '北海道冷やしぜんざい2種6本ｾｯﾄ_2.jpg';
const JAR = {
  plain: '北海道冷やしぜんざい(プレーン).png',
  ichigo: '北海道冷やしぜんざい(いちご).png',
  ringo: '北海道冷やしぜんざい(りんご).png',
};

const CREAM = 'FBF5EA';
const INK = '2B2320';
const SUBINK = '6B5D50';
const AQUA = '6FAFC4';
const SPINE = '1C3438'; // 深緑=ひんやり
const STRIPE = {
  plain: { a: 'D8D3CC', b: 'FFFFFF' },
  ichigo: { a: 'F3BFCB', b: 'FFFFFF' },
  ringo: { a: 'F5DE8E', b: 'FFFFFF' },
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: CREAM };

function addCover(imgPath, box) {
  const d = dims[path.basename(imgPath)];
  const boxAspect = box.w / box.h;
  const imgAspect = d.width / d.height;
  let topW, topH;
  if (imgAspect > boxAspect) { topH = box.h; topW = box.h * imgAspect; }
  else { topW = box.w; topH = box.w / imgAspect; }
  slide.addImage({ path: imgPath, x: box.x, y: box.y, w: topW, h: topH, sizing: { type: 'cover', w: box.w, h: box.h } });
}

function placeContain(imgPath, box) {
  const d = dims[path.basename(imgPath)];
  const boxAspect = box.w / box.h;
  const imgAspect = d.width / d.height;
  let w, h;
  if (imgAspect > boxAspect) { w = box.w; h = box.w / imgAspect; }
  else { h = box.h; w = box.h * imgAspect; }
  const x = box.x + (box.w - w) / 2;
  const y = box.y + (box.h - h) / 2;
  slide.addImage({ path: imgPath, x, y, w, h });
}

// ============ 左スパイン：ロゴ+縦書き商品名+ブランド名 ============
const SPINE_W = 1.75;
slide.addShape('rect', { x: 0, y: 0, w: SPINE_W, h: 11.69, fill: { color: SPINE }, line: { type: 'none' } });

const logoBox = { x: 0.2, y: 0.5, w: 1.35, h: 1.35 };
slide.addShape('ellipse', { ...logoBox, fill: { color: 'FFFFFF' }, line: { color: INK, width: 2.5 } });
slide.addText('ぜ', {
  x: logoBox.x, y: logoBox.y + 0.06, w: logoBox.w, h: logoBox.h - 0.12,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 56, bold: true, color: INK, align: 'center', valign: 'middle',
});

// 縦書き商品名（1文字ずつ個別ボックス。vert:'eaVert'の蛇行回避のためvText方式）
const chars = ['冷', 'や', 'し', 'ぜ', 'ん', 'ざ', 'い'];
const charBoxH = 0.82;
let cy = 2.15;
chars.forEach((c) => {
  slide.addText(c, {
    x: 0.15, y: cy, w: SPINE_W - 0.3, h: charBoxH,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 34, bold: true, color: 'FFFFFF',
    align: 'center', valign: 'middle',
  });
  cy += charBoxH;
});

slide.addShape('line', { x: 0.3, y: cy + 0.1, w: SPINE_W - 0.6, h: 0, line: { color: AQUA, width: 1.5 } });
slide.addText('北の恵みを、\nひと粒に。', {
  x: 0.15, y: cy + 0.25, w: SPINE_W - 0.3, h: 0.7,
  fontFace: 'BIZ UDGothic', fontSize: 10.5, color: AQUA, align: 'center', lineSpacingMultiple: 1.2,
});
slide.addText('なないろ\nキッチン', {
  x: 0.15, y: 10.8, w: SPINE_W - 0.3, h: 0.7,
  fontFace: 'BIZ UDGothic', fontSize: 10, color: 'FFFFFF', align: 'center', lineSpacingMultiple: 1.2,
});

// ============ 右カラム：写真・コピー・特徴・フレーバー・スペック ============
const RX = SPINE_W;
const RW = 8.27 - SPINE_W;

// 写真（斜めカットで下へ受け渡す）
const bandA = { x: RX, y: 0, w: RW, h: 5.55 };
addCover(img(SIZZLE), bandA);
slide.addShape('rtTriangle', {
  x: RX, y: 4.85, w: RW, h: 0.8,
  fill: { color: CREAM }, line: { type: 'none' }, flipV: true,
});

// しずる文（タイトルの上に斜めに独立配置）
slide.addText('つるん、ひんやり、あまい。', {
  x: RX + 0.15, y: 5.68, w: RW - 0.3, h: 0.55,
  fontFace: 'Klee One SemiBold', fontSize: 23, bold: true, color: AQUA, rotate: -3.5,
});
// キャッチコピー
slide.addText('冷たいのに、ほっとする味。', {
  x: RX + 0.18, y: 6.28, w: RW - 0.3, h: 0.6,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 30, bold: true, color: INK, wrap: false,
});
slide.addText('北海道産小豆と生乳のぜんざいを、キンと冷たく仕立てました。', {
  x: RX + 0.2, y: 6.92, w: RW - 0.35, h: 0.4,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 12.5, color: SUBINK, wrap: false,
});

// 特徴3点
const features = [
  '北海道産小豆・生乳を使用',
  'なめらかなクリームと香り豊かな小豆',
  '3フレーバー（プレーン・いちご・りんご）',
];
let featY = 7.42;
features.forEach((t) => {
  slide.addShape('ellipse', { x: RX + 0.2, y: featY + 0.03, w: 0.14, h: 0.14, fill: { color: 'C0453A' }, line: { type: 'none' } });
  slide.addText(t, {
    x: RX + 0.45, y: featY, w: RW - 0.6, h: 0.28,
    fontFace: 'BIZ UDGothic', fontSize: 12, color: INK, valign: 'middle', wrap: false,
  });
  featY += 0.3;
});

// 3フレーバー・ストライプ
const flavors = [
  { key: 'plain', name: 'プレーン' },
  { key: 'ichigo', name: 'いちご' },
  { key: 'ringo', name: 'りんご' },
];
const bandDY = 8.5;
const bandDH = 1.5;
const gap = 0.13;
const colW = (RW - gap * 4) / 3;

flavors.forEach((fl, i) => {
  const colX = RX + gap + i * (colW + gap);
  const stripe = STRIPE[fl.key];
  const stripeCount = 6;
  const stripeW = colW / stripeCount;
  for (let s = 0; s < stripeCount; s++) {
    slide.addShape('rect', {
      x: colX + s * stripeW, y: bandDY, w: stripeW, h: bandDH,
      fill: { color: s % 2 === 0 ? stripe.a : stripe.b }, line: { type: 'none' },
    });
  }
  const jarBox = { x: colX + 0.12, y: bandDY + 0.06, w: colW - 0.24, h: bandDH - 0.42 };
  placeContain(img(JAR[fl.key]), jarBox);
  slide.addText(fl.name, {
    x: colX, y: bandDY + bandDH - 0.36, w: colW, h: 0.32,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 14, bold: true, color: INK, align: 'center', valign: 'middle',
  });
});

// スペック表
const specY = 10.35;
const specs = [
  ['商品名', '北海道冷やしぜんざい'],
  ['内容量', '90g'],
  ['賞味期限', '冷凍60日'],
  ['入数', '40'],
];
let sx = RX + 0.15;
specs.forEach(([label, value]) => {
  const labelW = 0.72;
  slide.addShape('roundRect', { x: sx, y: specY, w: labelW, h: 0.26, rectRadius: 0.13, fill: { color: INK }, line: { type: 'none' } });
  slide.addText(label, { x: sx, y: specY, w: labelW, h: 0.26, fontFace: 'BIZ UDGothic', fontSize: 7.5, color: 'FFFFFF', align: 'center', valign: 'middle' });
  const valueW = label === '商品名' ? 1.25 : 0.55;
  slide.addText(value, { x: sx + labelW + 0.04, y: specY, w: valueW, h: 0.26, fontFace: 'BIZ UDGothic', fontSize: 8, color: INK, align: 'left', valign: 'middle', wrap: false });
  sx += labelW + valueW + 0.1;
});

pptx.writeFile({ fileName: path.join(__dirname, 'zenzai-v2.pptx') }).then(() => console.log('written'));

// 北海道冷やしぜんざい フライヤー v1（試作）
// スライド構成：1枚のみ
//   帯A(写真+ロゴ) / 帯B(コピー) / 帯C(特徴3点) / 帯D(3フレーバー・ストライプ) / 帯E(スペック+フッター)
// 素材: products/北海道冷やしぜんざい/
// テーマ発想：しずる写真(6本セット_2.jpg)の「白木の上に果物と並ぶ」ナチュラルな物語から逆算。
//   ラベル自体の縞ストライプ(フレーバー識別)をポスター側の情報構造に翻訳して3案の軸にした。
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

const SIZZLE = '北海道冷やしぜんざい2種6本ｾｯﾄ_2.jpg'; // 木の台+果物+スプーンのスタイリング写真
const JAR = {
  plain: '北海道冷やしぜんざい(プレーン).png',
  ichigo: '北海道冷やしぜんざい(いちご).png',
  ringo: '北海道冷やしぜんざい(りんご).png',
};

// 実測ラベルストライプに寄せた配色（プレーン=グレー、いちご=ピンク、りんご=イエロー）
const CREAM = 'FBF5EA';
const INK = '2B2320';
const SUBINK = '6B5D50';
const AQUA = '6FAFC4';
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

// --- cover画像ヘルパー（実寸アスペクト比を渡してからsizingでボックス指定。cover伸び bug対策） ---
function addCover(imgPath, box) {
  const d = dims[path.basename(imgPath)];
  const boxAspect = box.w / box.h;
  const imgAspect = d.width / d.height;
  let topW, topH;
  if (imgAspect > boxAspect) {
    topH = box.h;
    topW = box.h * imgAspect;
  } else {
    topW = box.w;
    topH = box.w / imgAspect;
  }
  slide.addImage({
    path: imgPath,
    x: box.x, y: box.y, w: topW, h: topH,
    sizing: { type: 'cover', w: box.w, h: box.h },
  });
}

// --- contain配置ヘルパー（伸びない。box内で中央寄せ） ---
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
  return { x, y, w, h };
}

// ============ 帯A：しずる写真 + 巨大ロゴ ============
const bandA = { x: 0, y: 0, w: 8.27, h: 6.3 };
addCover(img(SIZZLE), bandA);

// 断ち落としの斜めカット（写真の下端を斜めに切ってクリーム地に受け渡す）
slide.addShape('rtTriangle', {
  x: 0, y: 5.5, w: 8.27, h: 0.85,
  fill: { color: CREAM },
  line: { type: 'none' },
  flipV: true,
});

// 「ぜ」ロゴを図形で再現（円+文字。実物ロゴ準拠：白地に黒縁・黒文字）
const logoBox = { x: 0.4, y: 0.4, w: 1.55, h: 1.55 };
slide.addShape('ellipse', {
  ...logoBox,
  fill: { color: 'FFFFFF' },
  line: { color: INK, width: 3 },
});
slide.addText('ぜ', {
  x: logoBox.x, y: logoBox.y + 0.08, w: logoBox.w, h: logoBox.h - 0.16,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 64, bold: true, color: INK,
  align: 'center', valign: 'middle',
});
slide.addText('Hiyashi Zenzai', {
  x: logoBox.x - 0.25, y: logoBox.y + logoBox.h - 0.05, w: logoBox.w + 0.5, h: 0.3,
  fontFace: 'Great Vibes', fontSize: 15, color: INK, align: 'center',
});

// ============ 帯B：しずる文＋キャッチ＋サブ ============
slide.addText('つるん、ひんやり、あまい。', {
  x: 0.35, y: 6.35, w: 6.5, h: 0.6,
  fontFace: 'Klee One SemiBold', fontSize: 27, bold: true, color: AQUA,
  rotate: -4, align: 'left',
});
slide.addText('冷たいのに、ほっとする味。', {
  x: 0.4, y: 6.95, w: 7.6, h: 0.75,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 38, bold: true, color: INK,
  align: 'left', wrap: false,
});
slide.addText('北海道産小豆と生乳のぜんざいを、キンと冷たく仕立てました。', {
  x: 0.42, y: 7.68, w: 7.5, h: 0.4,
  fontFace: 'BIZ UDPMincho Medium', fontSize: 14.5, color: SUBINK,
  align: 'left', wrap: false,
});

// ============ 帯C：特徴3点（赤丸アイコン） ============
const features = [
  '北海道産小豆・生乳を使用',
  'なめらかなクリームと香り豊かな小豆',
  '3フレーバー（プレーン・いちご・りんご）',
];
const featY = 8.18;
features.forEach((t, i) => {
  const y = featY + i * 0.34;
  slide.addShape('ellipse', { x: 0.42, y: y + 0.03, w: 0.16, h: 0.16, fill: { color: 'C0453A' }, line: { type: 'none' } });
  slide.addText(t, {
    x: 0.7, y, w: 7.2, h: 0.3,
    fontFace: 'BIZ UDGothic', fontSize: 13.5, color: INK, valign: 'middle', wrap: false,
  });
});

// ============ 帯D：3フレーバー・ストライプ（ラベルの縞を情報構造に翻訳） ============
const flavors = [
  { key: 'plain', name: 'プレーン' },
  { key: 'ichigo', name: 'いちご' },
  { key: 'ringo', name: 'りんご' },
];
const bandDY = 9.35;
const bandDH = 1.55;
const gap = 0.15;
const colW = (8.27 - gap * 4) / 3;

flavors.forEach((fl, i) => {
  const colX = gap + i * (colW + gap);
  const stripe = STRIPE[fl.key];
  // 縦縞背景（実物ラベルの縞を拡大転写）
  const stripeCount = 7;
  const stripeW = colW / stripeCount;
  for (let s = 0; s < stripeCount; s++) {
    slide.addShape('rect', {
      x: colX + s * stripeW, y: bandDY, w: stripeW, h: bandDH,
      fill: { color: s % 2 === 0 ? stripe.a : stripe.b },
      line: { type: 'none' },
    });
  }
  // 瓶写真（containで中央配置、下寄せ）
  const jarBox = { x: colX + 0.15, y: bandDY + 0.08, w: colW - 0.3, h: bandDH - 0.5 };
  placeContain(img(JAR[fl.key]), jarBox);
  // フレーバー名
  slide.addText(fl.name, {
    x: colX, y: bandDY + bandDH - 0.4, w: colW, h: 0.35,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 16, bold: true, color: INK,
    align: 'center', valign: 'middle',
  });
});

// ============ 帯E：スペック表（丸ピルラベル+プレーン値）＋フッター ============
const specY = 11.05;
const specs = [
  ['商品名', '北海道冷やしぜんざい'],
  ['内容量', '90g'],
  ['賞味期限', '冷凍60日'],
  ['入数', '40'],
];
let sx = 0.4;
specs.forEach(([label, value]) => {
  const labelW = 0.95;
  slide.addShape('roundRect', {
    x: sx, y: specY, w: labelW, h: 0.28, rectRadius: 0.14,
    fill: { color: INK }, line: { type: 'none' },
  });
  slide.addText(label, {
    x: sx, y: specY, w: labelW, h: 0.28,
    fontFace: 'BIZ UDGothic', fontSize: 9, color: 'FFFFFF', align: 'center', valign: 'middle',
  });
  const valueW = label === '商品名' ? 1.55 : 0.75;
  slide.addText(value, {
    x: sx + labelW + 0.05, y: specY, w: valueW, h: 0.28,
    fontFace: 'BIZ UDGothic', fontSize: 9.5, color: INK, align: 'left', valign: 'middle', wrap: false,
  });
  sx += labelW + valueW + 0.18;
});

slide.addText('なないろキッチン', {
  x: 5.6, y: 11.4, w: 2.3, h: 0.25,
  fontFace: 'BIZ UDGothic', fontSize: 11, bold: true, color: SUBINK, align: 'right',
});

safeWriteFile(pptx, path.join(__dirname, 'zenzai-v1.pptx')).then(() => {
  console.log('written');
});

// 北海道冷やしぜんざい v9「優雅」
// テーマ：高級菓子・香水のような静謐な余白と細線フレームで、90gのジャムを
// ハイブランドの佇まいに引き上げる。装飾は最小限、タイポグラフィと余白で語る。
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

const DUSTY_ROSE = 'C99B94';
const SAGE = '9CAF97';
const CREAM = 'F5EFE4';
const GOLD = 'C9A227';
const INK = '2B2320';
const BORDEAUX = '6E2A34';
const WHITE = 'FFFFFF';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: CREAM };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// ============ 外周の細線フレーム（余白の中の静かな縁） ============
slide.addShape('rect', {
  x: 0.32, y: 0.32, w: 8.27 - 0.64, h: 11.69 - 0.64,
  fill: { type: 'none' }, line: { color: GOLD, width: 0.75 },
});

// ============ ロゴマーク（円に「ぜ」） ============
const logoBox = { x: 8.27 / 2 - 0.36, y: 0.56, w: 0.72, h: 0.72 };
slide.addShape('ellipse', { ...logoBox, fill: { color: BORDEAUX }, line: { color: GOLD, width: 1.5 } });
slide.addText('ぜ', {
  x: logoBox.x, y: logoBox.y + 0.02, w: logoBox.w, h: logoBox.h - 0.04,
  fontFace: 'HGMinchoE', fontSize: 30, bold: true, color: CREAM, align: 'center', valign: 'middle',
});

// ============ 小さな一輪の枝（フラッシュ装飾・ロゴ下の細線に添えて） ============
const sprigY = logoBox.y + logoBox.h + 0.16;
slide.addShape('line', { x: 8.27 / 2 - 0.85, y: sprigY, w: 0.62, h: 0, line: { color: GOLD, width: 0.75 } });
slide.addShape('line', { x: 8.27 / 2 + 0.23, y: sprigY, w: 0.62, h: 0, line: { color: GOLD, width: 0.75 } });
slide.addShape('ellipse', { x: 8.27 / 2 - 0.05, y: sprigY - 0.05, w: 0.1, h: 0.1, fill: { color: GOLD }, line: { type: 'none' } });
[[8.27 / 2 - 0.58, sprigY - 0.09], [8.27 / 2 + 0.48, sprigY - 0.09]].forEach(([lx, ly]) => {
  slide.addShape('ellipse', {
    x: lx, y: ly, w: 0.16, h: 0.09, rotate: lx < 8.27 / 2 ? 35 : -35,
    fill: { color: SAGE, transparency: 15 }, line: { type: 'none' },
  });
});

// ============ 題字（大きく、字間をゆったりと） ============
const titleY = sprigY + 0.26;
slide.addText('北海道冷やしぜんざい', {
  x: 0.3, y: titleY, w: 7.67, h: 0.95,
  fontFace: 'HGMinchoE', fontSize: 33, bold: true, color: INK, align: 'center', valign: 'middle',
  wrap: false, charSpacing: 4,
});
slide.addText('ひと匙の、涼やかな甘さを。', {
  x: 0.3, y: titleY + 0.92, w: 7.67, h: 0.34,
  fontFace: 'Yu Mincho Demibold', fontSize: 12.5, color: DUSTY_ROSE, align: 'center', valign: 'middle',
  wrap: false, charSpacing: 3,
});

// ============ 写真（細線フレーム付き・余白を残して中央に） ============
const photoY = titleY + 1.4;
const photoBox = { x: 0.62, y: photoY, w: 7.03, h: 4.3 };
slide.addShape('rect', {
  x: photoBox.x - 0.06, y: photoBox.y - 0.06, w: photoBox.w + 0.12, h: photoBox.h + 0.12,
  fill: { type: 'none' }, line: { color: GOLD, width: 1 },
});
addCover(SIZZLE, photoBox);
slide.addShape('rect', { ...photoBox, fill: { type: 'none' }, line: { color: WHITE, width: 2.5 } });

// ============ 3フレーバー・カード ============
const flavors = [
  { key: 'plain', name: 'プレーン' },
  { key: 'ichigo', name: 'いちご' },
  { key: 'ringo', name: 'りんご' },
];
const cardsY = photoBox.y + photoBox.h + 0.42;
const cardGap = 0.24;
const cardW = (7.03 - cardGap * 2) / 3;
const cardH = 1.86;
flavors.forEach((fl, i) => {
  const cx = photoBox.x + i * (cardW + cardGap);
  slide.addShape('rect', {
    x: cx, y: cardsY, w: cardW, h: cardH,
    fill: { color: WHITE }, line: { color: GOLD, width: 0.75 },
  });
  placeContain(JAR[fl.key], { x: cx + 0.2, y: cardsY + 0.22, w: cardW - 0.4, h: cardH - 0.72 });
  slide.addShape('line', {
    x: cx + cardW / 2 - 0.32, y: cardsY + cardH - 0.44, w: 0.64, h: 0,
    line: { color: SAGE, width: 0.75 },
  });
  slide.addText(fl.name, {
    x: cx, y: cardsY + cardH - 0.38, w: cardW, h: 0.3,
    fontFace: 'Yu Mincho Demibold', fontSize: 13, color: INK, align: 'center', valign: 'middle', charSpacing: 1,
  });
});

// ============ スペック（静かなキャプション行） ============
const specY = cardsY + cardH + 0.38;
slide.addShape('line', { x: 8.27 / 2 - 1.5, y: specY, w: 3.0, h: 0, line: { color: GOLD, width: 0.5 } });
slide.addText('内容量 90g　　冷凍保存 60日　　入数 40個', {
  x: 0.3, y: specY + 0.14, w: 7.67, h: 0.32,
  fontFace: 'Yu Mincho Demibold', fontSize: 10.5, color: INK, align: 'center', valign: 'middle',
  wrap: false, charSpacing: 1,
});
slide.addShape('line', { x: 8.27 / 2 - 1.5, y: specY + 0.56, w: 3.0, h: 0, line: { color: GOLD, width: 0.5 } });

// ============ フッター（ブランド名） ============
const footerY = specY + 0.86;
slide.addText('な な い ろ キ ッ チ ン', {
  x: 0.3, y: footerY, w: 7.67, h: 0.34,
  fontFace: 'HGMinchoE', fontSize: 13, color: GOLD, align: 'center', valign: 'middle', wrap: false,
});

safeWriteFile(pptx, path.join(__dirname, 'zenzai-v9-優雅.pptx')).then(() => console.log('written v9'));

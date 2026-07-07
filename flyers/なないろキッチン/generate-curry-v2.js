// なないろキッチン スープカレーキッチン v2「食堂の行灯品書き」
// テーマ：木の食堂の品書き。写真を暖簾越しの一枚として大きく見せ、2種を短冊メニューで紹介する。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', 'products', 'なないろキッチン');
const dims = loadDims(DIR);

const SIZZLE = 'screenshot.876.jpg';
const JAR = { coconut: 'アセット 1ココナッツ.png', wafu: 'アセット 1和風.png' };

const WOOD = '4A2F22';
const WOOD_DK = '3A2419';
const CREAM = 'F6EAD3';
const GOLD = 'C8983E';
const RED = 'A8362A';
const INK = '2A1D14';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: WOOD };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// 木目テクスチャ（薄い横線を数本）
for (let i = 0; i < 24; i++) {
  slide.addShape('line', { x: 0, y: i * 0.5, w: 8.27, h: 0, line: { color: WOOD_DK, width: 0.5, transparency: 40 } });
}

// ============ 写真ヒーロー（暖簾越し） ============
const photoH = 5.6;
addCover(SIZZLE, { x: 0, y: 0, w: 8.27, h: photoH });
slide.addShape('rect', { x: 0, y: photoH - 1.3, w: 8.27, h: 1.3, fill: { color: WOOD, transparency: 20 }, line: { type: 'none' } });
// スキャロップ（暖簾のフリンジ）
const scCount = 10;
const scW = 8.27 / scCount;
for (let i = 0; i < scCount; i++) {
  slide.addShape('pie', {
    x: i * scW - scW / 4, y: photoH - scW / 2, w: scW * 1.5, h: scW * 1.5,
    fill: { color: WOOD }, line: { type: 'none' }, angleRange: [180, 360],
  });
}

// ============ 行灯（看板）タイトル ============
const boardBox = { x: 8.27 / 2 - 2.7, y: photoH - 0.15, w: 5.4, h: 1.15 };
slide.addShape('roundRect', { ...boardBox, rectRadius: 0.06, fill: { color: CREAM }, line: { color: GOLD, width: 2.5 } });
slide.addText('スープカレーキッチン', {
  x: boardBox.x, y: boardBox.y + 0.06, w: boardBox.w, h: boardBox.h - 0.12,
  fontFace: 'HGGyoshotai', fontSize: 34, color: INK, align: 'center', valign: 'middle', wrap: false,
});

// ============ サブコピー ============
const subY = boardBox.y + boardBox.h + 0.25;
slide.addText('野菜の旨味、スパイスの香り。今日はどっちで、あたためる？', {
  x: 0.4, y: subY, w: 7.47, h: 0.4,
  fontFace: 'BIZ UDGothic', fontSize: 13, color: CREAM, align: 'center', wrap: false,
});

// ============ 品書き短冊×2 ============
const menuY0 = subY + 0.65;
const menus = [
  {
    key: 'coconut', name: 'ココナッツ味', kana: '中辛',
    desc: '風味豊かなココナッツとスパイスのコクに、野菜の旨味を合わせたまろやかで濃厚な一杯。',
  },
  {
    key: 'wafu', name: '和風だし味', kana: '中辛',
    desc: 'かつお節のうまみを効かせ、トマトと玉ねぎの甘みに香り豊かなスパイスを合わせて。',
  },
];
const menuGap = 0.35;
const menuW = (7.47 - menuGap) / 2;
const menuH = 3.3;
menus.forEach((m, i) => {
  const cx = 0.4 + i * (menuW + menuGap);
  // 短冊本体
  slide.addShape('rect', { x: cx, y: menuY0, w: menuW, h: menuH, fill: { color: CREAM }, line: { color: GOLD, width: 1.5 } });
  slide.addShape('rect', { x: cx, y: menuY0, w: 0.12, h: menuH, fill: { color: RED }, line: { type: 'none' } });
  // 吊り下げ紐
  slide.addShape('line', { x: cx + menuW / 2, y: menuY0 - 0.2, w: 0, h: 0.2, line: { color: GOLD, width: 1.5 } });
  slide.addShape('ellipse', { x: cx + menuW / 2 - 0.06, y: menuY0 - 0.26, w: 0.12, h: 0.12, fill: { color: GOLD }, line: { type: 'none' } });

  placeContain(JAR[m.key], { x: cx + menuW / 2 - 0.62, y: menuY0 + 0.25, w: 1.24, h: 1.24 });
  slide.addShape('roundRect', { x: cx + menuW - 0.75, y: menuY0 + 0.2, w: 0.6, h: 0.34, rectRadius: 0.05, fill: { color: RED }, line: { type: 'none' } });
  slide.addText(m.kana, {
    x: cx + menuW - 0.75, y: menuY0 + 0.2, w: 0.6, h: 0.34,
    fontFace: 'BIZ UDGothic', fontSize: 10, color: CREAM, align: 'center', valign: 'middle',
  });
  slide.addText(m.name, {
    x: cx + 0.15, y: menuY0 + 1.6, w: menuW - 0.3, h: 0.4,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 18, color: INK, align: 'center', wrap: false,
  });
  slide.addShape('line', { x: cx + 0.3, y: menuY0 + 2.05, w: menuW - 0.6, h: 0, line: { color: GOLD, width: 1 } });
  slide.addText(m.desc, {
    x: cx + 0.22, y: menuY0 + 2.15, w: menuW - 0.44, h: 1.05,
    fontFace: 'BIZ UDGothic', fontSize: 9.5, color: '5A4636', lineSpacingMultiple: 1.35,
  });
});

// ============ フッター ============
slide.addText('なないろキッチン', {
  x: 0.4, y: menuY0 + menuH + 0.35, w: 7.47, h: 0.4,
  fontFace: 'HGGyoshotai', fontSize: 17, color: GOLD, align: 'center',
});

safeWriteFile(pptx, path.join(__dirname, 'curry-v2.pptx')).then(() => console.log('written curry v2'));

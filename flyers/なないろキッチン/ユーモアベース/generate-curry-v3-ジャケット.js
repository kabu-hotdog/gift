// なないろキッチン スープカレーキッチン v3「レコードジャケット」
// テーマ：2種のスープカレーを7インチレコードの Side A / Side B に見立てる。
// 中央に背割れ（スパインクリーズ）、各面に丸窓のセンターラベル、下部にトラックリスト風の実食写真帯。
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const { loadDims, makeHelpers, safeWriteFile } = require('../../_lib/pptx-helpers');

const DIR = path.join(__dirname, '..', '..', '..', 'products', 'なないろキッチン');
const dims = loadDims(DIR);

const SIZZLE = 'screenshot.876.jpg';
const JAR = { coconut: 'アセット 1ココナッツ.png', wafu: 'アセット 1和風.png' };

const BLACK = '1A1A1A';
const BLACK_LT = '242424';
const TEAL = '2E6B5E';
const RUST = 'B5502E';
const CREAM = 'F1E6D2';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 });
pptx.layout = 'A4';
const slide = pptx.addSlide();
slide.background = { color: BLACK };
const { addCover, placeContain } = makeHelpers(slide, dims, DIR);

// ============ スリーブ外枠 ============
const sleeveX = 0.35;
const sleeveY = 0.35;
const sleeveW = 8.27 - sleeveX * 2; // 7.57
const sleeveH = 9.40; // スクエア寄りのアルバムゾーン（下部のトラックリスト帯を収めるため再計算）
slide.addShape('rect', {
  x: sleeveX, y: sleeveY, w: sleeveW, h: sleeveH,
  fill: { color: BLACK_LT }, line: { color: CREAM, width: 1 },
});

// ============ ヘッダー：タイトル ============
slide.addText('スープカレーキッチン', {
  x: sleeveX + 0.3, y: sleeveY + 0.2, w: sleeveW - 0.6, h: 0.6,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 26, color: CREAM, align: 'center', wrap: false, charSpacing: 1,
});
slide.addText('by なないろキッチン', {
  x: sleeveX + 0.3, y: sleeveY + 0.78, w: sleeveW - 0.6, h: 0.3,
  fontFace: 'BIZ UDGothic', fontSize: 11, color: 'B8AC94', align: 'center', charSpacing: 3, wrap: false,
});

// ============ 限定盤バッジ（右上コーナースタンプ） ============
slide.addShape('ellipse', {
  x: sleeveX + sleeveW - 1.35, y: sleeveY + 0.15, w: 1.15, h: 1.15,
  fill: { color: RUST }, line: { color: CREAM, width: 1.5 }, rotate: -12,
});
slide.addText('限定盤', {
  x: sleeveX + sleeveW - 1.35, y: sleeveY + 0.4, w: 1.15, h: 0.65,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 16, color: CREAM, align: 'center', valign: 'middle', rotate: -12, charSpacing: 2,
});

// ============ 中央スパインクリーズ ============
const midX = sleeveX + sleeveW / 2;
const bandTop = sleeveY + 1.25;
const bandBottom = sleeveY + 5.97; // ラベル円＋説明文の下端に合わせて固定（sleeveHから独立させ、後段の帯とのオーバーラップを回避）
slide.addShape('line', {
  x: midX, y: bandTop, w: 0, h: bandBottom - bandTop,
  line: { color: CREAM, width: 1, dashType: 'dash', transparency: 30 },
});

// ============ Side A / Side B 各半面 ============
const halfW = sleeveW / 2;
const sides = [
  {
    key: 'coconut', side: 'SIDE A', name: 'ココナッツ味', color: TEAL,
    desc: '風味豊かなココナッツとスパイスのコクに\n野菜の旨味、まろやかで濃厚な一杯。',
    cx: sleeveX,
  },
  {
    key: 'wafu', side: 'SIDE B', name: '和風だし味', color: RUST,
    desc: 'かつお節エキスの旨味、チキン・ポーク\nエキスでガラ感。トマトと玉ねぎの甘みに\n香り豊かなスパイス。',
    cx: midX,
  },
];

const labelSize = 2.55; // 円形ラベル窓の一辺
const labelY = bandTop + 0.35;

sides.forEach((s) => {
  const half = { x: s.cx, y: bandTop, w: halfW, h: bandBottom - bandTop };
  // 半面の色帯（うっすら）
  slide.addShape('rect', {
    x: half.x, y: half.y, w: half.w, h: half.h,
    fill: { color: s.color, transparency: 88 }, line: { type: 'none' },
  });

  // SIDE ラベル
  slide.addText(s.side, {
    x: half.x, y: half.y + 0.08, w: half.w, h: 0.32,
    fontFace: 'BIZ UDGothic', fontSize: 13, color: s.color, align: 'center', charSpacing: 4, bold: true, wrap: false,
  });

  // 円形センターラベル窓（クリーム地のリングにジャー写真を丸窓クロップ）
  const labelX = s.cx + (halfW - labelSize) / 2;
  slide.addShape('ellipse', {
    x: labelX - 0.12, y: labelY - 0.12, w: labelSize + 0.24, h: labelSize + 0.24,
    fill: { color: CREAM }, line: { color: s.color, width: 2 },
  });
  addCover(JAR[s.key], { x: labelX + 0.18, y: labelY + 0.18, w: labelSize - 0.36, h: labelSize - 0.36 }, { rounding: true });
  slide.addShape('ellipse', {
    x: labelX + 0.18, y: labelY + 0.18, w: labelSize - 0.36, h: labelSize - 0.36,
    fill: { type: 'none' }, line: { color: s.color, width: 1.5 },
  });

  // フレーバー名（リング下部に印字風）
  slide.addText(s.name, {
    x: half.x + 0.15, y: labelY + labelSize + 0.28, w: half.w - 0.3, h: 0.4,
    fontFace: 'HGSoeiKakugothicUB', fontSize: 17, color: CREAM, align: 'center', wrap: false,
  });
  slide.addText(s.desc, {
    x: half.x + 0.35, y: labelY + labelSize + 0.72, w: half.w - 0.7, h: 0.85,
    fontFace: 'BIZ UDGothic', fontSize: 8.5, color: 'CFC3AC', align: 'center', lineSpacingMultiple: 1.3,
  });
});

// 中央の丸ラベル穴っぽい小さいピボット（レコードの中心穴イメージ）
slide.addShape('ellipse', {
  x: midX - 0.09, y: labelY + labelSize / 2 - 0.09, w: 0.18, h: 0.18,
  fill: { color: BLACK }, line: { color: CREAM, width: 1 },
});

// ============ BPM風タグ + Recorded in Sapporo（小さい印字） ============
const tagY = bandBottom + 0.15;
slide.addShape('rect', {
  x: sleeveX + 0.3, y: tagY, w: 1.85, h: 0.4,
  fill: { type: 'none' }, line: { color: CREAM, width: 1 },
});
slide.addText('SPICE LEVEL: 中辛', {
  x: sleeveX + 0.3, y: tagY, w: 1.85, h: 0.4,
  fontFace: 'BIZ UDGothic', fontSize: 9.5, color: CREAM, align: 'center', valign: 'middle', charSpacing: 1, wrap: false,
});
slide.addText('Recorded in Sapporo, Hokkaido', {
  x: sleeveX + sleeveW - 3.0, y: tagY, w: 2.7, h: 0.4,
  fontFace: 'BIZ UDGothic', fontSize: 9, color: 'B8AC94', align: 'right', valign: 'middle', italic: true, wrap: false,
});

// 「1瓶で4皿分」小さい印字（レーベル注記風）
slide.addText('1本で4皿分', {
  x: midX - 0.9, y: tagY, w: 1.8, h: 0.4,
  fontFace: 'BIZ UDGothic', fontSize: 9, color: 'B8AC94', align: 'center', valign: 'middle', wrap: false,
});

// ============ トラックリスト帯（実食写真＋トラック風テキスト） ============
const stripY = tagY + 1.13;
const stripH = 2.0;
slide.addShape('rect', {
  x: sleeveX + 0.3, y: stripY - 0.32, w: 2.4, h: 0.3,
  fill: { color: CREAM }, line: { type: 'none' },
});
slide.addText('TRACKLIST', {
  x: sleeveX + 0.3, y: stripY - 0.32, w: 2.4, h: 0.3,
  fontFace: 'HGSoeiKakugothicUB', fontSize: 11, color: BLACK, align: 'center', valign: 'middle', charSpacing: 2,
});
addCover(SIZZLE, { x: sleeveX + 0.3, y: stripY, w: sleeveW - 0.6, h: stripH });
slide.addShape('rect', {
  x: sleeveX + 0.3, y: stripY, w: sleeveW - 0.6, h: stripH,
  fill: { type: 'none' }, line: { color: CREAM, width: 1.5 },
});
// 写真下にトラックリスト風の帯（半透明黒＋テキスト）
const trackBandH = 0.85;
slide.addShape('rect', {
  x: sleeveX + 0.3, y: stripY + stripH - trackBandH, w: sleeveW - 0.6, h: trackBandH,
  fill: { color: BLACK, transparency: 22 }, line: { type: 'none' },
});
const tracks = [
  'Track 1: ゴロっとチキンレッグ',
  'Track 2: 深煮込みポークベリー',
  'Track 3: 温泉たまごとかぼちゃ',
];
tracks.forEach((t, i) => {
  slide.addText(t, {
    x: sleeveX + 0.5, y: stripY + stripH - trackBandH + 0.08 + i * 0.24, w: sleeveW - 1.0, h: 0.24,
    fontFace: 'BIZ UDGothic', fontSize: 9.5, color: CREAM, wrap: false,
  });
});

// ============ フッター（スリーブ外・裏ジャケット的な帯） ============
const footerY = sleeveY + sleeveH + 0.35;
slide.addShape('rect', {
  x: sleeveX, y: footerY, w: sleeveW, h: 1.3,
  fill: { color: BLACK_LT }, line: { color: CREAM, width: 0.75 },
});
slide.addText('Flip the sleeve, flip the flavor.', {
  x: sleeveX + 0.3, y: footerY + 0.15, w: sleeveW - 0.6, h: 0.35,
  fontFace: 'BIZ UDGothic', fontSize: 11, color: CREAM, align: 'center', italic: true, charSpacing: 1, wrap: false,
});
slide.addText('Side A ココナッツ味 × Side B 和風だし味', {
  x: sleeveX + 0.3, y: footerY + 0.55, w: sleeveW - 0.6, h: 0.35,
  fontFace: 'BIZ UDGothic', fontSize: 10, color: 'B8AC94', align: 'center', charSpacing: 1, wrap: false,
});
slide.addText('なないろキッチン', {
  x: sleeveX + 0.3, y: footerY + 0.95, w: sleeveW - 0.6, h: 0.3,
  fontFace: 'BIZ UDGothic', fontSize: 9, color: '8A7F68', align: 'center', charSpacing: 1, wrap: false,
});

safeWriteFile(pptx, path.join(__dirname, 'curry-v3-ジャケット.pptx')).then(() => console.log('written curry v3'));

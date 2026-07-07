// 生成スクリプト共通ヘルパー。flyer-knowhow.md §6 の実装規約を実装したもの。
const { imageSize } = require('image-size');
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// 商品フォルダ内の画像サイズを名前解決できる形でロード
function loadDims(dir) {
  const dims = {};
  for (const f of fs.readdirSync(dir)) {
    if (/\.(jpg|jpeg|png)$/i.test(f)) {
      dims[f] = imageSize(fs.readFileSync(path.join(dir, f)));
    }
  }
  return dims;
}

// 透過PNGのアルファbboxを実測（透明余白込みでcontain-fitして被写体が縮む事故を防ぐ）
function alphaBBox(pngPath) {
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  let minX = png.width, minY = png.height, maxX = 0, maxY = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const a = png.data[(png.width * y + x) * 4 + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY, width: png.width, height: png.height };
}

// slide/dims をクロージャに持つヘルパー一式を作る
function makeHelpers(slide, dims, dir) {
  const img = (name) => path.join(dir, name);

  // 実績のあるv1/v2方式：左上アンカーでオーバーサイズ配置＋sizing.cover任せ（中央寄せオフセットを足すとcover計算とズレる）
  function addCover(name, box) {
    const d = dims[name];
    const boxAspect = box.w / box.h;
    const imgAspect = d.width / d.height;
    let w, h;
    if (imgAspect > boxAspect) { h = box.h; w = box.h * imgAspect; }
    else { w = box.w; h = box.w / imgAspect; }
    slide.addImage({ path: img(name), x: box.x, y: box.y, w, h, sizing: { type: 'cover', w: box.w, h: box.h } });
  }

  function placeContain(name, box, opts = {}) {
    const d = dims[name];
    const boxAspect = box.w / box.h;
    const imgAspect = d.width / d.height;
    let w, h;
    if (imgAspect > boxAspect) { w = box.w; h = box.w / imgAspect; }
    else { h = box.h; w = box.h * imgAspect; }
    const x = box.x + (box.w - w) / 2;
    const y = box.y + (box.h - h) / 2;
    const imgOpts = { path: img(name), x, y, w, h };
    if (opts.rotate) imgOpts.rotate = opts.rotate;
    slide.addImage(imgOpts);
    return { x, y, w, h };
  }

  // 1文字ずつ個別ボックスで縦書き（vert:'eaVert'の蛇行回避）
  function vText(chars, opts) {
    const { x, w, y0, charH, fontFace, fontSize, color, bold = true } = opts;
    let cy = y0;
    chars.forEach((c) => {
      const isSmall = ['っ', 'ゃ', 'ゅ', 'ょ'].includes(c);
      const isPunct = ['、', '。'].includes(c);
      slide.addText(c, {
        x, y: cy, w, h: isPunct ? charH * 0.5 : charH,
        fontFace, fontSize: isSmall ? fontSize * 0.75 : fontSize, bold, color,
        align: isPunct ? 'right' : 'center', valign: isPunct ? 'top' : 'middle',
      });
      cy += isPunct ? charH * 0.5 : charH;
    });
    return cy;
  }

  return { addCover, placeContain, vText, img };
}

module.exports = { loadDims, alphaBBox, makeHelpers };

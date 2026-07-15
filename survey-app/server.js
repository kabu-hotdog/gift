const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "letmein";

const DATA_DIR = path.join(__dirname, "data");
const VOTES_FILE = path.join(DATA_DIR, "votes.ndjson");
const STATE_FILE = path.join(DATA_DIR, "state.json");
fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(VOTES_FILE)) fs.writeFileSync(VOTES_FILE, "");
if (!fs.existsSync(STATE_FILE)) fs.writeFileSync(STATE_FILE, JSON.stringify({ shown: {} }));

// 商品ごとにグループ化（別商品同士は比較しない＝デザインの勝敗だけを見るため）
const PRODUCTS = [
  {
    id: "nanairo",
    name: "なないろキッチン",
    images: [
      { id: "n1", label: "ジャケット", file: "n1.jpg" },
      { id: "n2", label: "スパイスラボ", file: "n2.jpg" },
      { id: "n3", label: "優雅", file: "n3.jpg" },
      { id: "n4", label: "行灯品書き", file: "n4.jpg" },
      { id: "n5", label: "達人", file: "n5.jpg" },
    ],
  },
  {
    id: "zenzai",
    name: "北海道冷やしぜんざい",
    images: [
      { id: "z1", label: "パステル", file: "z1.jpg" },
      { id: "z2", label: "優雅", file: "z2.jpg" },
      { id: "z3", label: "夜店", file: "z3.jpg" },
      { id: "z4", label: "達人", file: "z4.jpg" },
    ],
  },
];

const ALL_IMAGES = {};
for (const p of PRODUCTS) for (const img of p.images) ALL_IMAGES[img.id] = { ...img, product: p.id, productName: p.name };

const REASONS = [
  { key: "color", label: "色・配色が好み" },
  { key: "photo", label: "写真がおいしそう／魅力的" },
  { key: "copy", label: "キャッチコピーが刺さった" },
  { key: "clarity", label: "情報が見やすい" },
  { key: "premium", label: "高級感・特別感がある" },
  { key: "casual", label: "カジュアルで親しみやすい" },
];

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { shown: {} };
  }
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}
function appendVote(record) {
  fs.appendFileSync(VOTES_FILE, JSON.stringify(record) + "\n");
}
function loadVotes() {
  const raw = fs.readFileSync(VOTES_FILE, "utf8").trim();
  if (!raw) return [];
  return raw.split("\n").map((l) => JSON.parse(l));
}

function weightedPick(ids, shown, exclude) {
  const pool = ids.filter((id) => id !== exclude).map((id) => ({ id, weight: 1 / ((shown[id] || 0) + 1) }));
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) return p.id;
  }
  return pool[pool.length - 1].id;
}

function pickPair() {
  const state = loadState();
  // 商品はペア数（総当たり数）に比例した確率で選ぶ
  const weighted = PRODUCTS.map((p) => ({ p, weight: (p.images.length * (p.images.length - 1)) / 2 }));
  const totalW = weighted.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * totalW;
  let product = weighted[weighted.length - 1].p;
  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) {
      product = w.p;
      break;
    }
  }
  const ids = product.images.map((i) => i.id);
  const first = weightedPick(ids, state.shown, null);
  const second = weightedPick(ids, state.shown, first);
  const pair = Math.random() < 0.5 ? [first, second] : [second, first];

  state.shown[pair[0]] = (state.shown[pair[0]] || 0) + 1;
  state.shown[pair[1]] = (state.shown[pair[1]] || 0) + 1;
  saveState(state);

  return pair;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const BASE_STYLE = `
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic", sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; line-height: 1.6; }
  h1 { font-size: 1.3rem; }
  .images { display: flex; gap: 12px; margin: 16px 0; }
  .option { flex: 1; position: relative; }
  .option img { width: 100%; height: auto; border-radius: 8px; display: block; border: 2px solid #ddd; }
  .tag { position: absolute; top: 8px; left: 8px; background: #222; color: #fff; font-weight: bold; padding: 2px 10px; border-radius: 4px; opacity: 0.85; }
  fieldset { border: 1px solid #ccc; border-radius: 8px; margin: 14px 0; padding: 10px 14px; }
  legend { font-weight: bold; padding: 0 6px; }
  fieldset.muted { opacity: 0.75; }
  fieldset.muted legend { font-weight: normal; font-size: 0.9rem; }
  label.choice { display: inline-block; margin-right: 20px; font-size: 1.1rem; }
  label.check { display: block; margin: 6px 0; }
  textarea, input[type=text] { width: 100%; box-sizing: border-box; padding: 8px; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
  button { width: 100%; padding: 14px; font-size: 1.1rem; font-weight: bold; border: none; border-radius: 8px; background: #5b4bff; color: #fff; margin-top: 16px; }
  a.button { display: block; text-align: center; text-decoration: none; }
  .thanks { text-align: center; padding: 40px 0; }
  table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: center; }
`;

app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.get("/", (req, res) => {
  const [aId, bId] = pickPair();
  const a = ALL_IMAGES[aId];
  const b = ALL_IMAGES[bId];

  const reasonsHtml = REASONS.map(
    (r) => `<label class="check"><input type="checkbox" name="reasons" value="${r.key}"> ${r.label}</label>`
  ).join("");

  res.send(`<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ポスターどっちが良い？アンケート</title>
<style>${BASE_STYLE}</style>
</head><body>
<h1>🎁 ポスター、どっちが良い？</h1>
<p>2枚のフライヤー案を見て、直感で答えてください。1分で終わります。</p>
<div class="images">
  <div class="option"><span class="tag">A</span><img src="/images/${a.file}" alt="A"></div>
  <div class="option"><span class="tag">B</span><img src="/images/${b.file}" alt="B"></div>
</div>
<form method="POST" action="/vote">
  <input type="hidden" name="imageA" value="${a.id}">
  <input type="hidden" name="imageB" value="${b.id}">

  <fieldset>
    <legend>① もらったら嬉しいのはどっち？</legend>
    <label class="choice"><input type="radio" name="giftWinner" value="A" required> A</label>
    <label class="choice"><input type="radio" name="giftWinner" value="B"> B</label>
  </fieldset>

  <fieldset>
    <legend>② 写真を撮ってSNSに載せたいのはどっち？</legend>
    <label class="choice"><input type="radio" name="shareWinner" value="A" required> A</label>
    <label class="choice"><input type="radio" name="shareWinner" value="B"> B</label>
  </fieldset>

  <fieldset>
    <legend>③ 選んだ理由（複数選択可・任意）</legend>
    ${reasonsHtml}
    <input type="text" name="otherReason" placeholder="その他（自由記述・任意）">
  </fieldset>

  <fieldset class="muted">
    <legend>参考：食品ギフトを贈った/もらった経験は？（任意・初回だけでOK）</legend>
    <label class="choice"><input type="radio" name="experience" value="often"> よくある</label>
    <label class="choice"><input type="radio" name="experience" value="sometimes"> たまにある</label>
    <label class="choice"><input type="radio" name="experience" value="rarely"> ほとんどない</label>
  </fieldset>

  <textarea name="comment" rows="2" placeholder="気になった点・コメント（任意）"></textarea>

  <button type="submit">回答する</button>
</form>
</body></html>`);
});

app.post("/vote", (req, res) => {
  const { imageA, imageB, giftWinner, shareWinner, otherReason, experience, comment } = req.body;
  if (!ALL_IMAGES[imageA] || !ALL_IMAGES[imageB] || !["A", "B"].includes(giftWinner) || !["A", "B"].includes(shareWinner)) {
    return res.status(400).send("不正なリクエストです");
  }
  let reasons = req.body.reasons || [];
  if (!Array.isArray(reasons)) reasons = [reasons];
  reasons = reasons.filter((r) => REASONS.some((x) => x.key === r));

  appendVote({
    ts: new Date().toISOString(),
    imageA,
    imageB,
    giftWinnerId: giftWinner === "A" ? imageA : imageB,
    shareWinnerId: shareWinner === "A" ? imageA : imageB,
    reasons,
    otherReason: (otherReason || "").slice(0, 200),
    experience: experience || null,
    comment: (comment || "").slice(0, 500),
  });

  res.send(`<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ありがとうございました</title>
<style>${BASE_STYLE}</style>
</head><body>
<div class="thanks">
  <h1>回答ありがとうございました！</h1>
  <p>もう一組、比較してみますか？</p>
  <a class="button" href="/"><button type="button">もう一組やってみる</button></a>
</div>
</body></html>`);
});

app.get("/results", (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).send("forbidden");
  const votes = loadVotes();
  const state = loadState();

  const tally = {};
  for (const id of Object.keys(ALL_IMAGES)) tally[id] = { giftWins: 0, shareWins: 0, shown: state.shown[id] || 0 };
  const reasonTally = {};
  for (const r of REASONS) reasonTally[r.key] = 0;

  for (const v of votes) {
    if (tally[v.giftWinnerId]) tally[v.giftWinnerId].giftWins++;
    if (tally[v.shareWinnerId]) tally[v.shareWinnerId].shareWins++;
    for (const r of v.reasons || []) if (reasonTally[r] !== undefined) reasonTally[r]++;
  }

  const rows = Object.entries(ALL_IMAGES)
    .map(([id, img]) => {
      const t = tally[id];
      return `<tr><td>${escapeHtml(img.productName)}</td><td>${escapeHtml(img.label)}</td><td>${t.shown}</td><td>${t.giftWins}</td><td>${t.shareWins}</td></tr>`;
    })
    .join("");

  const reasonRows = REASONS.map((r) => `<tr><td>${escapeHtml(r.label)}</td><td>${reasonTally[r.key]}</td></tr>`).join("");

  res.send(`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>集計結果</title><style>${BASE_STYLE}</style></head><body>
<h1>集計結果（回答数: ${votes.length}）</h1>
<table>
<tr><th>商品</th><th>案</th><th>表示回数</th><th>もらって嬉しい 勝利数</th><th>SNS映え 勝利数</th></tr>
${rows}
</table>
<h2 style="margin-top:24px">選んだ理由の内訳</h2>
<table><tr><th>理由</th><th>件数</th></tr>${reasonRows}</table>
<p style="margin-top:20px"><a href="/export.json?key=${escapeHtml(req.query.key)}">生データをエクスポート(JSON)</a></p>
</body></html>`);
});

app.get("/export.json", (req, res) => {
  if (req.query.key !== ADMIN_KEY) return res.status(403).send("forbidden");
  res.json({ images: ALL_IMAGES, votes: loadVotes(), state: loadState() });
});

app.listen(PORT, () => console.log(`poster-survey listening on :${PORT}`));

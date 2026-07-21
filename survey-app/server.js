const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "letmein";
const DATABASE_URL = process.env.DATABASE_URL;

// DATABASE_URLがあればPostgresに永続化（Render本番向け）。
// なければメモリ上に保持するだけ（ローカル動作確認用・再起動で消える）。
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } }) : null;
const memory = { votes: [], shown: {} };

async function initDb() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      image_a TEXT NOT NULL,
      image_b TEXT NOT NULL,
      gift_winner_id TEXT NOT NULL,
      share_winner_id TEXT NOT NULL,
      reasons_gift TEXT[] NOT NULL DEFAULT '{}',
      reasons_share TEXT[] NOT NULL DEFAULT '{}',
      other_reason_gift TEXT DEFAULT '',
      other_reason_share TEXT DEFAULT '',
      experience_giving TEXT,
      experience_receiving TEXT,
      comment TEXT DEFAULT ''
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS shown_counts (
      image_id TEXT PRIMARY KEY,
      count INT NOT NULL DEFAULT 0
    )
  `);
}

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

async function getShownCounts() {
  if (!pool) return { ...memory.shown };
  const { rows } = await pool.query("SELECT image_id, count FROM shown_counts");
  const map = {};
  for (const r of rows) map[r.image_id] = r.count;
  return map;
}

async function bumpShown(ids) {
  if (!pool) {
    for (const id of ids) memory.shown[id] = (memory.shown[id] || 0) + 1;
    return;
  }
  for (const id of ids) {
    await pool.query(
      `INSERT INTO shown_counts (image_id, count) VALUES ($1, 1)
       ON CONFLICT (image_id) DO UPDATE SET count = shown_counts.count + 1`,
      [id]
    );
  }
}

async function appendVote(record) {
  if (!pool) {
    record.id = memory.votes.length ? Math.max(...memory.votes.map((v) => v.id)) + 1 : 1;
    memory.votes.push(record);
    return;
  }
  await pool.query(
    `INSERT INTO votes
      (image_a, image_b, gift_winner_id, share_winner_id, reasons_gift, reasons_share,
       other_reason_gift, other_reason_share, experience_giving, experience_receiving, comment)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      record.imageA,
      record.imageB,
      record.giftWinnerId,
      record.shareWinnerId,
      record.reasonsGift,
      record.reasonsShare,
      record.otherReasonGift,
      record.otherReasonShare,
      record.experienceGiving,
      record.experienceReceiving,
      record.comment,
    ]
  );
}

async function loadVotes() {
  if (!pool) return memory.votes;
  const { rows } = await pool.query("SELECT * FROM votes ORDER BY id");
  return rows.map((r) => ({
    id: r.id,
    ts: r.ts,
    imageA: r.image_a,
    imageB: r.image_b,
    giftWinnerId: r.gift_winner_id,
    shareWinnerId: r.share_winner_id,
    reasonsGift: r.reasons_gift || [],
    reasonsShare: r.reasons_share || [],
    otherReasonGift: r.other_reason_gift || "",
    otherReasonShare: r.other_reason_share || "",
    experienceGiving: r.experience_giving,
    experienceReceiving: r.experience_receiving,
    comment: r.comment || "",
  }));
}

async function deleteVote(id) {
  if (!pool) {
    memory.votes = memory.votes.filter((v) => v.id !== id);
    return;
  }
  await pool.query("DELETE FROM votes WHERE id = $1", [id]);
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

async function pickPair() {
  const shown = await getShownCounts();
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
  const first = weightedPick(ids, shown, null);
  const second = weightedPick(ids, shown, first);
  const pair = Math.random() < 0.5 ? [first, second] : [second, first];

  await bumpShown(pair);
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
  p.sub { font-size: 0.85rem; color: #666; margin: 10px 0 4px; }
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

function reasonsBlock(fieldName) {
  return REASONS.map(
    (r) => `<label class="check"><input type="checkbox" name="${fieldName}" value="${r.key}"> ${r.label}</label>`
  ).join("");
}

app.get("/", async (req, res, next) => {
  try {
    const [aId, bId] = await pickPair();
    const a = ALL_IMAGES[aId];
    const b = ALL_IMAGES[bId];

    res.send(`<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>フライヤーどっちが良い？アンケート</title>
<style>${BASE_STYLE}</style>
</head><body>
<h1>🎁 フライヤー、どっちが良い？</h1>
<p>2枚のフライヤー案を見て、直感で答えてください。1分で終わります。</p>
<div class="images">
  <div class="option"><span class="tag">A</span><img src="/images/${a.file}" alt="A"></div>
  <div class="option"><span class="tag">B</span><img src="/images/${b.file}" alt="B"></div>
</div>
<form method="POST" action="/vote">
  <input type="hidden" name="imageA" value="${a.id}">
  <input type="hidden" name="imageB" value="${b.id}">

  <fieldset>
    <legend>① どちらのチラシのほうが「もらったら嬉しい」と思いますか？</legend>
    <label class="choice"><input type="radio" name="giftWinner" value="A" required> A</label>
    <label class="choice"><input type="radio" name="giftWinner" value="B"> B</label>
    <p class="sub">そう思う理由は？（複数選択可・任意）</p>
    ${reasonsBlock("reasonsGift")}
    <input type="text" name="otherReasonGift" placeholder="その他（自由記述・任意）">
  </fieldset>

  <fieldset>
    <legend>② どちらのチラシのほうが「写真を撮ってSNSに載せたい」と思いますか？</legend>
    <label class="choice"><input type="radio" name="shareWinner" value="A" required> A</label>
    <label class="choice"><input type="radio" name="shareWinner" value="B"> B</label>
    <p class="sub">そう思う理由は？（複数選択可・任意）</p>
    ${reasonsBlock("reasonsShare")}
    <input type="text" name="otherReasonShare" placeholder="その他（自由記述・任意）">
  </fieldset>

  <fieldset class="muted">
    <legend>参考：ふだん、食品ギフトを贈ることは？（任意）</legend>
    <label class="choice"><input type="radio" name="experienceGiving" value="often"> よくある</label>
    <label class="choice"><input type="radio" name="experienceGiving" value="sometimes"> たまにある</label>
    <label class="choice"><input type="radio" name="experienceGiving" value="rarely"> ほとんどない</label>
  </fieldset>

  <fieldset class="muted">
    <legend>参考：ふだん、食品ギフトをもらうことは？（任意）</legend>
    <label class="choice"><input type="radio" name="experienceReceiving" value="often"> よくある</label>
    <label class="choice"><input type="radio" name="experienceReceiving" value="sometimes"> たまにある</label>
    <label class="choice"><input type="radio" name="experienceReceiving" value="rarely"> ほとんどない</label>
  </fieldset>

  <p class="sub">今回見た2案について、気になった点・コメント（任意）</p>
  <textarea name="comment" rows="2" placeholder="例：文字が読みにくかった、価格が気になった、など"></textarea>

  <button type="submit">回答する</button>
</form>
</body></html>`);
  } catch (err) {
    next(err);
  }
});

function cleanReasons(v) {
  let reasons = v || [];
  if (!Array.isArray(reasons)) reasons = [reasons];
  return reasons.filter((r) => REASONS.some((x) => x.key === r));
}

app.post("/vote", async (req, res, next) => {
  try {
    const {
      imageA,
      imageB,
      giftWinner,
      shareWinner,
      otherReasonGift,
      otherReasonShare,
      experienceGiving,
      experienceReceiving,
      comment,
    } = req.body;
    if (!ALL_IMAGES[imageA] || !ALL_IMAGES[imageB] || !["A", "B"].includes(giftWinner) || !["A", "B"].includes(shareWinner)) {
      return res.status(400).send("不正なリクエストです");
    }

    await appendVote({
      imageA,
      imageB,
      giftWinnerId: giftWinner === "A" ? imageA : imageB,
      shareWinnerId: shareWinner === "A" ? imageA : imageB,
      reasonsGift: cleanReasons(req.body.reasonsGift),
      reasonsShare: cleanReasons(req.body.reasonsShare),
      otherReasonGift: (otherReasonGift || "").slice(0, 200),
      otherReasonShare: (otherReasonShare || "").slice(0, 200),
      experienceGiving: experienceGiving || null,
      experienceReceiving: experienceReceiving || null,
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
  } catch (err) {
    next(err);
  }
});

app.get("/results", async (req, res, next) => {
  try {
    if (req.query.key !== ADMIN_KEY) return res.status(403).send("forbidden");
    const votes = await loadVotes();
    const shown = await getShownCounts();

    const tally = {};
    for (const id of Object.keys(ALL_IMAGES)) tally[id] = { giftWins: 0, shareWins: 0, shown: shown[id] || 0 };
    const reasonTallyGift = {};
    const reasonTallyShare = {};
    for (const r of REASONS) {
      reasonTallyGift[r.key] = 0;
      reasonTallyShare[r.key] = 0;
    }

    for (const v of votes) {
      if (tally[v.giftWinnerId]) tally[v.giftWinnerId].giftWins++;
      if (tally[v.shareWinnerId]) tally[v.shareWinnerId].shareWins++;
      for (const r of v.reasonsGift || []) if (reasonTallyGift[r] !== undefined) reasonTallyGift[r]++;
      for (const r of v.reasonsShare || []) if (reasonTallyShare[r] !== undefined) reasonTallyShare[r]++;
    }

    const rows = Object.entries(ALL_IMAGES)
      .map(([id, img]) => {
        const t = tally[id];
        return `<tr><td>${escapeHtml(img.productName)}</td><td>${escapeHtml(img.label)}</td><td>${t.shown}</td><td>${t.giftWins}</td><td>${t.shareWins}</td></tr>`;
      })
      .join("");

    const reasonRows = (tallyObj) =>
      REASONS.map((r) => `<tr><td>${escapeHtml(r.label)}</td><td>${tallyObj[r.key]}</td></tr>`).join("");

    res.send(`<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>集計結果</title><style>${BASE_STYLE}</style></head><body>
<h1>集計結果（回答数: ${votes.length}）</h1>
<table>
<tr><th>商品</th><th>案</th><th>表示回数</th><th>もらって嬉しい 勝利数</th><th>SNS映え 勝利数</th></tr>
${rows}
</table>
<h2 style="margin-top:24px">①「もらって嬉しい」を選んだ理由</h2>
<table><tr><th>理由</th><th>件数</th></tr>${reasonRows(reasonTallyGift)}</table>
<h2 style="margin-top:24px">②「SNS映え」を選んだ理由</h2>
<table><tr><th>理由</th><th>件数</th></tr>${reasonRows(reasonTallyShare)}</table>
<p style="margin-top:20px"><a href="/export.json?key=${escapeHtml(req.query.key)}">生データをエクスポート(JSON)</a></p>
</body></html>`);
  } catch (err) {
    next(err);
  }
});

app.get("/export.json", async (req, res, next) => {
  try {
    if (req.query.key !== ADMIN_KEY) return res.status(403).send("forbidden");
    res.json({ images: ALL_IMAGES, votes: await loadVotes(), shown: await getShownCounts() });
  } catch (err) {
    next(err);
  }
});

app.get("/admin/delete-vote", async (req, res, next) => {
  try {
    if (req.query.key !== ADMIN_KEY) return res.status(403).send("forbidden");
    const id = Number(req.query.id);
    if (!Number.isInteger(id)) return res.status(400).send("idを指定してください（/export.jsonで確認できます）");
    await deleteVote(id);
    res.redirect(`/results?key=${encodeURIComponent(req.query.key)}`);
  } catch (err) {
    next(err);
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`poster-survey listening on :${PORT} (storage: ${pool ? "postgres" : "memory"})`));
  })
  .catch((err) => {
    console.error("DB init failed", err);
    process.exit(1);
  });

# フライヤー比較アンケート（poster-survey）

フライヤー案をランダムに2枚（同一商品内のみ）ペアで出し、「もらったら嬉しいのはどっち？」「SNS映えするのはどっち？」を聞くアンケートアプリ。サーバー側で投票を集計する。

## ローカルで試す

```
cd survey-app
npm install
npm start
```

http://localhost:3000 を開く。

## Render.comへのデプロイ

1. このリポジトリをGitHubにpushしておく
2. https://dashboard.render.com を開き、"New +" → "Blueprint" を選択
3. このリポジトリを接続する（`survey-app/render.yaml` が自動検出される）
4. `ADMIN_KEY` 環境変数を適当な文字列に設定する（結果ページの鍵になる）
5. デプロイが終わると `https://poster-survey-xxxx.onrender.com` のようなURLが発行される。このURLをクラスに共有する

もしBlueprintでうまく検出されない場合は、"New +" → "Web Service" → リポジトリ選択 → **Root Directory に `survey-app` を指定** → Build Command: `npm install` / Start Command: `node server.js` で手動作成してもよい。

## 結果の見方

`https://<デプロイ先>/results?key=<ADMIN_KEYの値>` で集計結果（表示回数・「もらって嬉しい」勝利数・「SNS映え」勝利数・選んだ理由の内訳）が見られる。

`https://<デプロイ先>/export.json?key=<ADMIN_KEYの値>` で生データをJSONでダウンロードできる。

## 注意

- Render無料プランはディスクが永続化されないため、**手動で再デプロイ/再起動すると投票データが消える**。アンケート期間中は再デプロイしないこと。こまめに `/export.json` で結果をバックアップ推奨。
- 別商品同士（なないろキッチン × 北海道冷やしぜんざい）はペアにならない。商品が違うとデザインの勝敗ではなく商品自体の好みを測ってしまうため。

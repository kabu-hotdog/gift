# gift フライヤー工房 — 設計ドキュメント（2026-07-06 承認済み）

「若者にギフトを広めるAIフライヤー」活動の制作基盤。
hotdog-stall プロジェクトで確立したスキル構成・ワークフロー・技術知見を移植し、
食品ギフト全般に汎用化したもの。想定モデルは Sonnet。

## 解決する問題（旧・1枚岩プロンプトの限界）

1. **仕上がりのばらつき** → レンダリングQAループ（PowerPoint COM で PNG 書き出し→目視→修正）を必須化して解決
2. **1パターンの限界** → 固定テンプレ・スタイル軸・字数構造・案数固定をすべて廃止。商品写真・商品情報からのテーマ逆算に一本化（案数はテーマ次第で複数パターン）
3. **手動編集パワポを勝手に消す事故** → 5層防御（下記）
4. **指示の混在** → 創作方針・技術知見・商品情報・行動規範を4ファイルに分離

## フォルダ構成

```
gift/
├─ CLAUDE.md                       # プロジェクト規範
├─ export-slides.ps1               # PowerPoint COM スライド書き出し（hotdog-stallから移植）
├─ scripts/
│  ├─ approve-flyer.ps1            # 承認時にSHA256をハッシュ台帳に記録
│  └─ check-flyer-hash.ps1         # 再生成前の手動編集検知（不一致なら停止）
├─ .claude/skills/
│  ├─ context-framework.md         # 行動規範（hotdog-stallから移植）
│  ├─ gift-info.md                 # 活動全体の情報（ターゲット・トーン・実績）
│  └─ flyer/
│     ├─ flyer-prompt.md           # 創作の核（商品非依存）
│     └─ flyer-knowhow.md          # 技術知見・QA手順・手動編集保護
├─ products/<商品名>/
│  ├─ images/                      # 商品写真
│  └─ product-info.md              # 自由記述メモ
└─ flyers/<商品名>/
   ├─ generate-*.js / *.pptx / *.jpg
   └─ .approved-hashes.json        # 承認済みハッシュ台帳
```

## 手動編集保護（5層防御）

1. CLAUDE.md に例外なしルール（無断プロセスkill・無断上書きの禁止）
2. skill（flyer-knowhow.md §7）に事故の経緯と具体的手順
3. プロジェクトメモリに保存（`~/.claude/projects/C--Users-kabu6-Documents-gift/memory/`）
4. ユーザー承認時に git commit でスナップショット化
5. ハッシュ台帳：承認時に SHA256 記録、再生成前に必ず照合。不一致＝手動編集ありとして停止

## 制作フロー

1. 商品フォルダスキャン（images/ + product-info.md）
2. しずる写真の見極め
3. テーマ発想：写真・商品の物語から逆算（固定テンプレ・スタイル軸なし。新ジャンルはリサーチ）
4. コピー作成（型なし。テーマの文法で書き、案ごとに書き分け）
5. pptxgenjs で生成（案数はテーマ次第、各案は構造から別物）
6. PowerPoint COM で PNG 書き出し→目視QA→修正、収束するまで（見せるのは仕上がってから）
7. 提示 → ユーザー承認 → approve-flyer.ps1 + git commit → JPG納品

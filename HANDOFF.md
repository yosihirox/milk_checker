# 引き継ぎ：ミルクけいさん（milk_guide）

最終更新：2026-11-20

## 1. これは何か

作りたいミルクの総量（ml）を入れるだけで、次を表示するアプリ。

- ① お湯（全体の ⅔）と、注ぐ目盛り
- ② さまし湯（全体の ⅓）と、足す目盛り
- ③ 粉ミルクのグラム数
- 100ml用・50ml用・20ml用スプーンの杯数（イラスト付き）

提供先：**Web / PWA / App Store / Google Play**（同じ HTML/CSS/JS を Capacitor で iOS・Android に包む方式）。

GitHub リポジトリ：https://github.com/yosihirox/milk_checker （このフォルダが main ブランチ）

## 2. 今の状態（重要）

| 項目 | 状態 |
|---|---|
| Web/PWA 版 | 完成。ブラウザでスマホ幅・PC幅とも表示と計算を確認済み |
| iOS / Android プロジェクト | **未生成**（この Mac に Node.js が入っていないため） |
| GitHub | milk_checker の main に push 済み（コミット作者は `yosihirox` / `yosihirox@users.noreply.github.com`） |
| ストア申請 | 未着手（Apple Developer Program / Google Play Console の登録が必要） |

## 3. ファイル構成

```
www/                    アプリ本体（Web・PWA・ネイティブ共通）
  index.html            画面（イラストは全部インライン SVG）
  style.css             デザイン。スマホ2列／PC3列のグリッド、ダークモード対応
  app.js                計算と描画、設定の保存
  manifest.webmanifest  PWA の設定
  sw.js                 Service Worker（ネット優先・オフライン時はキャッシュ）
  icons/                icon.svg と 192/512px の PNG
resources/icon.png      ストア用アイコン元画像（1024×1024）
capacitor.config.json   Capacitor 設定（appId は仮の com.example.milkcalc）
package.json            Capacitor の依存と npm スクリプト
README.md               公開・ストア申請の手順
.gitignore
```

ビルド工程はなし。`www/` を静的ファイルとしてそのまま配信すれば動く。

## 4. 次にやること

1. **Web 公開**：GitHub Pages などで `www/` を公開すれば、Web 版と PWA 版がすぐ使える。
2. **Node.js を入れる** → `npm install` → `npm run setup`（iOS/Android の追加とアイコン生成）。
3. `capacitor.config.json` の `appId` を自分のもの（例：`jp.yosihirox.milkcalc`）に変更。
4. `npm run ios` で Xcode、`npm run android` で Android Studio を開いて署名し、ストアに提出する。

## 5. 仕様と決めたこと

- **お湯とさまし湯**：お湯は `round(総量 × 2/3)`、さまし湯は `総量 − お湯`。合計が必ず総量になるようにしている。
- **粉ミルク**：`総量 × (100mlあたりのg) / 100`。小数第1位まで表示。
  - **初期値 13.5g/100ml は仮の値**（20mlで2.7gの製品が多いため）。製品ごとに違うので、⚙ 設定で缶の表示に合わせてもらう前提。画面にも注意書きあり。
- **スプーンの杯数**：10ml単位の動的計画法で、**ぴったり量れて杯数が最少**の組み合わせを選ぶ（例：210ml → 100×1 + 50×1 + 20×3）。
  - 10ml・30ml のようにぴったり作れない量は、20ml用の ½ 杯で補う（例：30ml → 20×1 + 20×½）。
  - それでも余る量（10の倍数でない入力など）は「のこり ◯ml分（約◯g）は量れません」と表示する。
  - 使うスプーンは設定でオン/オフできる。
- **入力**：数字を直接入力（10〜400ml）、−/＋ボタンで10mlずつ、スライダー（10〜300）、よく使う量のボタン（40〜240）。
- **保存**：最後の量・g数・スプーン設定は localStorage に保存（端末内だけで、外には送らない）。
- **Service Worker**：ネイティブアプリ（Capacitor）の中では登録しない。

## 6. 注意点・既知の課題

- Apple は「Web をアプリに包んだだけ」のアプリを審査で落とすことがある（ガイドライン 4.2）。落ちた場合は、ハプティクス、授乳記録、ウィジェットなどネイティブらしい機能を足す。
- `package.json` の Capacitor バージョン（^7）は、実際にインストールするときに最新を確認する。
- アイコンはシンプルな哺乳瓶の絵の仮デザイン。

## 7. 手元での確認方法

```bash
cd /Users/nana/milk_guide
python3 -m http.server 5173 -d www
```

ブラウザで http://localhost:5173 を開く。

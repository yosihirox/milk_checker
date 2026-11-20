# ミルクけいさん

作りたいミルクの総量を入れるだけで、次を表示するアプリです。

- ① お湯（全体の⅔）と注ぐ目盛り
- ② さまし湯（全体の⅓）と足す目盛り
- ③ 粉ミルクのグラム数
- 100ml用・50ml用・20ml用スプーンの杯数（ぴったり量れて、杯数がいちばん少ない組み合わせ）

粉ミルクの濃さ（初期値：100mlあたり13.5g）と使うスプーンは ⚙ 設定で変えられます。必ずお使いの缶の表示に合わせてください。

## 構成

```
www/                 ← アプリ本体（HTML/CSS/JS。Web・PWA・ネイティブ共通）
  index.html / style.css / app.js
  manifest.webmanifest / sw.js   ← PWA（ホーム画面追加・オフライン）
  icons/
resources/icon.png   ← ストア用アイコン元画像 (1024×1024)
capacitor.config.json← iOS / Android 化の設定（Capacitor）
```

## 1. Web / PWA

`www/` フォルダをそのまま HTTPS の静的ホスティング（GitHub Pages、Netlify、Cloudflare Pages、Firebase Hosting など）に置くだけで公開できます。
スマホで開いて「ホーム画面に追加」すれば PWA としてアプリのように使え、オフラインでも動きます。

ローカル確認:

```bash
python3 -m http.server 5173 -d www
```

## 2. App Store（iOS）と Google Play（Android）

[Capacitor](https://capacitorjs.com/) で同じ `www/` をネイティブアプリに包みます。

必要なもの: Node.js 20 以上、Xcode（iOS）、Android Studio（Android）、
Apple Developer Program（年額）、Google Play Console（初回登録料）。

1. `capacitor.config.json` の `appId`（`com.example.milkcalc`）を自分のもの（例 `jp.yourname.milkcalc`）に変更
2. 依存を入れてプラットフォームを追加・アイコン生成

   ```bash
   npm install
   ```

   ```bash
   npm run setup
   ```

3. iOS: `npm run ios` → Xcode で Signing を設定 → Product ▸ Archive → App Store Connect へアップロード
4. Android: `npm run android` → Android Studio で Build ▸ Generate Signed App Bundle (.aab) → Play Console へアップロード

`www/` を直したら `npm run sync` で両アプリに反映されます。

## ストア申請メモ

- カテゴリ: 「ライフスタイル」または「医療」ではなく「育児/ライフスタイル」が無難
- プライバシー: 個人データは収集しない（設定は端末内にのみ保存）
- 注意書き: 「分量は製品の表示に従ってください」をアプリ説明にも記載
- Apple は「Web を包んだだけのアプリ」を審査で落とすことがあります（ガイドライン 4.2）。
  リジェクトされた場合は、ハプティクス、ウィジェット、授乳記録など、ネイティブならではの機能を追加すると通りやすくなります。

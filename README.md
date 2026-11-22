# ムニ助電卓

時計付きのシンプルな電卓アプリです。画面の上に現在の時刻、その下に電卓があります。
iPad / iPhone のホーム画面に追加すると、アプリのように全画面で使えます(オフラインでも動きます)。

## GitHub Pages で公開する

1. GitHub のリポジトリで **Settings → Pages** を開く
2. **Build and deployment** の Source を「Deploy from a branch」にする
3. Branch で公開したいブランチ(例: `main`)と `/ (root)` を選んで **Save**
4. 数分後に `https://<ユーザー名>.github.io/-munisuke-app/` で開けるようになります

## iPad のホーム画面に追加する

1. iPad の **Safari** で上の URL を開く
2. 共有ボタン(□に↑)をタップ
3. 「**ホーム画面に追加**」を選んで「追加」
4. ホーム画面の「ムニ助電卓」アイコンから起動すると全画面で表示されます

## 使い方

- `AC` / `C` : 全部消す / 入力中の数字だけ消す
- `±` : プラス・マイナス切り替え
- `%` : パーセント(`100 + 10 %` → 10 のように、足し算・引き算では前の数の◯%)
- `=` を続けて押すと、直前の計算をくり返します
- 外付けキーボードの数字・`+ - * /`・Enter・Esc・Backspace も使えます

## ファイル構成

| ファイル | 内容 |
| --- | --- |
| `index.html` | 画面 |
| `style.css` | 見た目 |
| `app.js` | 時計と電卓の処理 |
| `manifest.webmanifest` | ホーム画面用アプリ情報 |
| `sw.js` | オフライン用キャッシュ(ファイルを更新したら `CACHE` の番号を上げる) |
| `icons/` | アイコン画像 |
| `tools/make_icons.py` | アイコンを作り直すスクリプト(`python3 tools/make_icons.py`、Pillow が必要) |

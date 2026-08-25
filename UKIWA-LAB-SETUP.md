# UKIWA LAB セットアップ（2026-08-25）

Firebase 側は以下まで完了済み：
- プロジェクト: `ukiwalabo`
- Web アプリ登録済み
- Authentication: Google 有効
- Cloud Firestore 作成済み
- Firestore Rules: `reoasctsae@gmail.com` のみ read/write 許可

## GitHub 側に置くファイル

- `ukiwa-lab.html`
- `ukiwa-lab.js`
- `ukiwa-lab-config.js`
- `ukiwa-lab-entry.js`

秘密の記事本文はこれらには入らず、Firestore に保存されます。

## index.html に追加する1行

`</body>` の直前に以下を追加します。

```html
<script src="ukiwa-lab-entry.js"></script>
```

これでトップ左上の「うきわメモ」を約1.5秒長押しすると、
「🛟 ひみつのうきわを見つけました」→ `ukiwa-lab.html` に移動します。

## Firebase Authentication の承認済みドメイン

GitHub Pages から Google ログインするため、Firebase Console の
Authentication → 設定 → 承認済みドメイン に以下を追加します。

`saxntanco.github.io`

もし追加していない場合でも、UKIWA LAB 側で `auth/unauthorized-domain` を日本語で案内します。

## セキュリティ

公開 GitHub には Firebase Web の接続設定とメールアドレスの SHA-256 ハッシュだけ置きます。
記事本文は Firestore に保存され、Firestore Rules で本人の Google アカウントだけが読み書きできます。

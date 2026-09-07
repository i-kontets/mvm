# ロリポップ公開メモ

## 今回使う情報

- サイト: `http://burijake.namaste.jp/`
- 共有SSL: `https://namaste-burijake.ssl-lolipop.jp/`
- データベース名: `LAA1658847-mvm`
- データベースホスト: `mysql401.phy.lolipop.lan`
- データベースバージョン: `8.4`
- データベースユーザー名: `LAA1658847`

DBパスワードはこのファイルに書かず、ロリポップ管理画面で確認して `api/.env` にだけ入れる。

## 事前ビルド

フロントエンドはローカルでビルドしてからアップロードする。

```bash
cp .env.production.example .env.production
npm run build
```

Laravel側は本番用 `.env` を作る。

```bash
cp api/.env.lolipop.example api/.env
```

`api/.env` の `DB_PASSWORD` と `APP_KEY` を設定する。`APP_KEY` はローカルで作る場合、以下で生成する。

```bash
cd api
php artisan key:generate --show
```

## アップロード方針

Laravelは `public` だけをWeb公開するのが安全。ロリポップの公開フォルダは、可能ならLaravelの `api/public` に向ける。

Reactは `dist` の中身を公開側に置く。APIは `/mvm-api` でLaravelに届く構成にする。

## DB作成

ロリポップのphpMyAdminで `database/mvm.sql` をインポートする。

## アップロードしないもの

- `node_modules/`
- `dist/` 以外の開発用フロント成果物
- `.env`
- `api/.env`
- `api/vendor/` はComposerをサーバー上で使えない場合だけローカルからアップロードする
- `compose.yaml`
- `docker/`

## 本番確認

1. `https://namaste-burijake.ssl-lolipop.jp/` を開く
2. 画面が表示される
3. 記録を1件登録できる
4. phpMyAdminで `workouts` にデータが入っている
5. 予定・動画・進捗画面も開ける

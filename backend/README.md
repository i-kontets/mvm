# Laravel API

このフォルダの `app`、`database`、`routes` は Laravel プロジェクトに配置する API 実装です。

PHP / Composer を導入後、Laravel プロジェクトを作成してこのフォルダの内容を対応する位置にコピーします。`.env` は phpMyAdmin で作成した MySQL データベースに合わせて、以下を設定してください。

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mvm
DB_USERNAME=root
DB_PASSWORD=
```

その後 `php artisan migrate` を実行すると、ER図に対応したテーブルが作成されます。

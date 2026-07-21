# Docker 開発用データベース

MySQL と phpMyAdmin を起動します。Docker Desktop を起動した状態で、リポジトリのルートから実行してください。

```bash
docker compose up -d
```

- MySQL: `127.0.0.1:3306`
- phpMyAdmin: [http://localhost:8080](http://localhost:8080)
- phpMyAdminのログイン: `mvm_user` / `mvm_password`
- DB名: `mvm`

設定値を変更するときは、`docker/.env.example` を `docker/.env` へコピーしてから次を実行します。

```bash
docker compose --env-file docker/.env up -d
```

停止は `docker compose down`、データも含めて初期化する場合は `docker compose down -v` です。

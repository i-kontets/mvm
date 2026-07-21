# MVM SQL

[mvm.sql](./mvm.sql) は phpMyAdmin 用の初期スキーマです。

1. Docker の phpMyAdmin（`http://localhost:8080`）へログインします。
2. 「インポート」を開き、`mvm.sql` を選択します。
3. 実行後、`mvm` データベースに必要なテーブルが作成されます。

このSQLは既存のテーブルやデータを削除しません。

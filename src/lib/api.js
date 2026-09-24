// 開発時は .env.local のURL、本番ではビルド時に渡した公開API URLを利用する。
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// 画面コンポーネントがfetchの詳細を持たないよう、Laravel API通信をここに集約する。
export const api = {
  // 一覧取得
  get: path => fetch(`${baseUrl}${path}`).then(response => {
    if (!response.ok) throw new Error('データの取得に失敗しました');
    return response.json();
  }),

  // JSONで新規データを登録
  post: (path, data) => fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) throw new Error('データの登録に失敗しました');
    return response.json();
  }),

  // JSONで既存データを更新
  put: (path, data) => fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(data),
  }).then(response => {
    if (!response.ok) throw new Error('データの更新に失敗しました');
    return response.json();
  }),

  // 削除成功時は本文を返さないAPIのため、ステータスだけ確認する。
  delete: path => fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  }).then(response => {
    if (!response.ok) throw new Error('データの削除に失敗しました');
  }),
};

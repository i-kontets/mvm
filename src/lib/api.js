// 開発時は .env.local の /api-local、本番ではビルド時の公開API URLを利用する。
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  // 画面側では通信の詳細を持たず、この共通窓口からLaravel APIを呼び出す。
  get: path => fetch(`${baseUrl}${path}`).then(response => { if (!response.ok) throw new Error('データの取得に失敗しました'); return response.json(); }),
  post: (path, data) => fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) }).then(response => { if (!response.ok) throw new Error('データの登録に失敗しました'); return response.json(); }),
  put: (path, data) => fetch(`${baseUrl}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) }).then(response => { if (!response.ok) throw new Error('データの更新に失敗しました'); return response.json(); }),
  delete: path => fetch(`${baseUrl}${path}`, { method: 'DELETE', headers: { Accept: 'application/json' } }).then(response => { if (!response.ok) throw new Error('データの削除に失敗しました'); }),
};

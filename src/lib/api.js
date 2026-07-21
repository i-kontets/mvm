const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
  get: path => fetch(`${baseUrl}${path}`).then(response => { if (!response.ok) throw new Error('データの取得に失敗しました'); return response.json(); }),
  post: (path, data) => fetch(`${baseUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) }).then(response => { if (!response.ok) throw new Error('データの登録に失敗しました'); return response.json(); }),
  put: (path, data) => fetch(`${baseUrl}${path}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) }).then(response => { if (!response.ok) throw new Error('データの更新に失敗しました'); return response.json(); }),
  delete: path => fetch(`${baseUrl}${path}`, { method: 'DELETE', headers: { Accept: 'application/json' } }).then(response => { if (!response.ok) throw new Error('データの削除に失敗しました'); }),
};

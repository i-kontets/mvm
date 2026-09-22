/**
 * 古いSafariなど、crypto.randomUUID() が未実装の環境でも使える識別子を返す。
 * APIの新規登録リクエストと画面内の操作ログで共通して利用する。
 */
export function createClientId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // randomUUID非対応環境向け。サーバー側で採番されるデータの一時識別子として十分な一意性を持たせる。
  const randomPart = Math.random().toString(36).slice(2, 12);
  return `client-${Date.now()}-${randomPart}`;
}

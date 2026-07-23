export default function VideoFormModal({ editingVideo, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <p className="eyebrow">REFERENCE VIDEO</p>
        <h2>{editingVideo ? '参考動画を編集' : '参考動画を保存'}</h2>

        <label>
          動画タイトル
          <input
            name="title"
            defaultValue={editingVideo?.title || ''}
            placeholder="例: ベンチプレスのフォーム解説"
            required
            autoFocus
          />
        </label>

        <label>
          YouTube URL
          <input
            name="url"
            type="url"
            defaultValue={editingVideo?.url || ''}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
        </label>

        <label>
          カテゴリ（任意）
          <input
            name="category"
            defaultValue={editingVideo?.category || ''}
            placeholder="例: 胸・三頭"
          />
        </label>

        <button className="primary-button">
          {editingVideo ? '変更を保存する' : '登録する'} <span>→</span>
        </button>
      </form>
    </div>
  );
}

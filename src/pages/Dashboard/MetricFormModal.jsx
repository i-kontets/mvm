import { todayString } from '../../lib/date.js';

export default function MetricFormModal({ onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>体重を記録</h2>

        <label>
          体重 (kg)
          <input name="weight" type="number" min="0" step="0.1" required autoFocus />
        </label>

        <label>
          記録日
          <input name="date" type="date" defaultValue={todayString()} required />
        </label>

        <button className="primary-button">登録する <span>→</span></button>
      </form>
    </div>
  );
}

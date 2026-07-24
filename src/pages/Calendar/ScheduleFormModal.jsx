import { addOneDay, subtractOneDay, todayString } from '../../lib/date.js';

export function WeeklyPlanModal({ planDay, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>毎週の予定を追加</h2>

        <DaySelect defaultValue={planDay} />

        <label>
          メニュー名
          <input name="title" placeholder="例: 胸・三頭" required autoFocus />
        </label>

        <button className="primary-button">登録する <span>→</span></button>
      </form>
    </div>
  );
}

export function DateEventModal({ eventDate, onClose, onSubmit }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>期間指定の予定を追加</h2>

        <label>
          予定名
          <input name="title" placeholder="例: 連続トレーニング週間" required autoFocus />
        </label>

        <div className="input-grid">
          <label>
            開始日
            <input name="start" type="date" defaultValue={eventDate || todayString()} required />
          </label>
          <label>
            終了日
            <input name="end" type="date" defaultValue={eventDate || ''} />
          </label>
        </div>

        <button className="primary-button">登録する <span>→</span></button>
      </form>
    </div>
  );
}

export function ScheduleDetailModal({ selected, onClose, onSubmit, onDelete }) {
  const schedule = selected.item;
  const isPlan = selected.type === 'plan';
  const displayEnd = schedule.end ? subtractOneDay(schedule.end) : '';

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>{isPlan ? '毎週の予定を編集' : '期間指定予定を編集'}</h2>

        {isPlan ? (
          <>
            <DaySelect defaultValue={schedule.day} />
            <label>
              メニュー名
              <input name="title" defaultValue={schedule.title} required />
            </label>
          </>
        ) : (
          <>
            <label>
              予定名
              <input name="title" defaultValue={schedule.title} required />
            </label>
            <div className="input-grid">
              <label>
                開始日
                <input name="start" type="date" defaultValue={schedule.start} required />
              </label>
              <label>
                終了日
                <input name="end" type="date" defaultValue={displayEnd} />
              </label>
            </div>
          </>
        )}

        <div className="detail-actions">
          <button type="button" onClick={onDelete}>削除</button>
          <button className="primary-button">変更を保存する →</button>
        </div>
      </form>
    </div>
  );
}

export const inclusiveEndToCalendarEnd = endDate => (
  endDate ? addOneDay(endDate) : null
);

function DaySelect({ defaultValue }) {
  return (
    <label>
      曜日
      <select name="day" defaultValue={defaultValue}>
        <option value="0">日曜日</option>
        <option value="1">月曜日</option>
        <option value="2">火曜日</option>
        <option value="3">水曜日</option>
        <option value="4">木曜日</option>
        <option value="5">金曜日</option>
        <option value="6">土曜日</option>
      </select>
    </label>
  );
}

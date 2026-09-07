import { useEffect, useState } from 'react';
import { todayString } from '../../lib/date.js';

export default function WorkoutFormModal({
  editingWorkout,
  videos,
  suggestions,
  onClose,
  onSubmit,
}) {
  const [isBodyweight, setIsBodyweight] = useState(editingWorkout?.weight_mode === 'bodyweight');
  const [recordType, setRecordType] = useState(editingWorkout?.record_type || 'strength');

  useEffect(() => {
    setIsBodyweight(editingWorkout?.weight_mode === 'bodyweight');
    setRecordType(editingWorkout?.record_type || 'strength');
  }, [editingWorkout]);

  const isCardio = recordType === 'cardio';

  const handleExerciseChange = event => {
    if (event.target.value.includes('エアロバイク')) {
      setRecordType('cardio');
      setIsBodyweight(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>{editingWorkout ? 'ワークアウトを編集' : 'ワークアウトを記録'}</h2>

        <WorkoutSuggestions suggestions={suggestions} />

        <label>
          場所
          <select name="training_place" defaultValue={editingWorkout?.training_place || 'gym'}>
            <option value="gym">ジム</option>
            <option value="home">自宅</option>
          </select>
        </label>

        <label>
          記録タイプ
          <select
            name="record_type"
            value={recordType}
            onChange={event => setRecordType(event.target.value)}
          >
            <option value="strength">筋トレ</option>
            <option value="cardio">有酸素</option>
          </select>
        </label>

        <label>
          ワークアウト名
          <input
            name="name"
            list="workout-names"
            defaultValue={editingWorkout?.name || ''}
            placeholder="例: Push Day"
            required
            autoFocus
          />
        </label>

        <label>
          種目
          <input
            name="exercise"
            list="exercise-names"
            defaultValue={editingWorkout?.exercise || ''}
            onChange={handleExerciseChange}
            placeholder="例: ベンチプレス"
            required
          />
        </label>

        <label>
          カテゴリ（任意）
          <input
            name="category"
            list="category-names"
            defaultValue={editingWorkout?.category || ''}
            placeholder="例: Push / Pull / Legs"
          />
        </label>

        <label>
          ラベル（任意）
          <input
            name="tags"
            list="tag-names"
            defaultValue={(editingWorkout?.tags || []).join(', ')}
            placeholder="例: 胸, 三頭, フリーウェイト（カンマ区切り）"
          />
        </label>

        {isCardio ? (
          <label>
            時間（分）
            <input
              name="duration_minutes"
              type="number"
              min="1"
              defaultValue={editingWorkout?.duration_minutes || ''}
              placeholder="例: 20"
              required
            />
          </label>
        ) : (
          <>
            <div className="input-grid">
              <label>
                重量方式
                <select
                  name="weight_mode"
                  defaultValue={editingWorkout?.weight_mode || 'weighted'}
                  onChange={event => setIsBodyweight(event.target.value === 'bodyweight')}
                >
                  <option value="weighted">重量を入力</option>
                  <option value="bodyweight">自重</option>
                </select>
              </label>

              <label>
                回数
                <input name="reps" type="number" min="1" defaultValue={editingWorkout?.reps || ''} required />
              </label>
            </div>

            <label>
              重量 (kg)
              <input
                name="weight"
                type="number"
                min="0"
                step="0.5"
                defaultValue={editingWorkout?.weight || ''}
                disabled={isBodyweight}
                required={!isBodyweight}
              />
            </label>
          </>
        )}

        <label>
          日付
          <input name="date" type="date" defaultValue={editingWorkout?.date || todayString()} required />
        </label>

        <label>
          この日に使った参考動画（任意）
          <div className="video-options">
            {videos.length ? (
              videos.map(video => (
                <label className="video-option" key={video.id}>
                  <input
                    type="checkbox"
                    name="video_ids"
                    value={video.id}
                    defaultChecked={(editingWorkout?.video_ids || []).includes(Number(video.id))}
                  />
                  {video.thumbnail && <img src={video.thumbnail} alt="" />}
                  <span>{video.title}</span>
                </label>
              ))
            ) : (
              <small>先に「動画」画面から動画を登録してください。</small>
            )}
          </div>
        </label>

        <button className="primary-button">
          {editingWorkout ? '変更を保存する' : '登録する'} <span>→</span>
        </button>
      </form>
    </div>
  );
}

function WorkoutSuggestions({ suggestions }) {
  return (
    <>
      <datalist id="workout-names">
        {suggestions.names.map(item => <option value={item} key={item} />)}
      </datalist>
      <datalist id="exercise-names">
        {suggestions.exercises.map(item => <option value={item} key={item} />)}
      </datalist>
      <datalist id="category-names">
        {suggestions.categories.map(item => <option value={item} key={item} />)}
      </datalist>
      <datalist id="tag-names">
        {suggestions.tags.map(item => <option value={item} key={item} />)}
      </datalist>
    </>
  );
}

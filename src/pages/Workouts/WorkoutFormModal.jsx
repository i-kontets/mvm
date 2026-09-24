import { useEffect, useState } from 'react';
import { todayString } from '../../lib/date.js';

const gymExercises = [
  'シーテッドレッグプレス',
  'チェストプレス',
  'ショルダープレス',
  '自転車エルゴメーター／エアロバイク',
];
// ジムでは機器を選択式にし、表記ゆれのない記録・集計を維持する。
const cardioExercise = '自転車エルゴメーター／エアロバイク';

// 場所・種目に応じて入力内容を切り替える、記録の新規登録・編集モーダル。
export default function WorkoutFormModal({
  editingWorkout,
  videos,
  suggestions,
  onClose,
  onSubmit,
}) {
  // 編集時は保存済みの値、新規時はジムの最初の種目を初期表示する。
  const [trainingPlace, setTrainingPlace] = useState(editingWorkout?.training_place || 'gym');
  const [exercise, setExercise] = useState(editingWorkout?.exercise || gymExercises[0]);
  const [isBodyweight, setIsBodyweight] = useState(editingWorkout?.weight_mode === 'bodyweight');
  const [recordType, setRecordType] = useState(editingWorkout?.record_type || 'strength');

  // エアロバイクは常に有酸素として扱い、重量・回数入力を出さない。
  const isCardioExercise = exercise === cardioExercise;
  const isCardio = isCardioExercise || recordType === 'cardio';

  useEffect(() => {
    const place = editingWorkout?.training_place || 'gym';
    const nextExercise = editingWorkout?.exercise || (place === 'gym' ? gymExercises[0] : '');

    setTrainingPlace(place);
    setExercise(nextExercise);
    setIsBodyweight(editingWorkout?.weight_mode === 'bodyweight');
    setRecordType(editingWorkout?.record_type || 'strength');
  }, [editingWorkout]);

  // 場所変更時に、前の場所の種目を入力欄へ残さない。
  const handlePlaceChange = event => {
    const nextPlace = event.target.value;
    setTrainingPlace(nextPlace);

    if (nextPlace === 'home') {
      // ジムの選択値を自宅の手入力欄へ持ち越さない。
      setExercise('');
      return;
    }

    // 自宅で入力した種目はジムの選択肢にないため、初期値へ戻す。
    if (!gymExercises.includes(exercise)) {
      setExercise(gymExercises[0]);
      setRecordType('strength');
    }
  };

  // 種目変更時に、有酸素・筋トレの入力モードを自動で整える。
  const handleExerciseChange = event => {
    const nextExercise = event.target.value;
    setExercise(nextExercise);

    if (nextExercise === cardioExercise) {
      // エアロバイクは重量・回数ではなく、時間で記録する。
      setRecordType('cardio');
      setIsBodyweight(false);
    } else if (recordType === 'cardio') {
      setRecordType('strength');
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}>
        <button className="dialog-close" type="button" onClick={onClose}>×</button>
        <h2>{editingWorkout ? 'ワークアウトを編集' : 'ワークアウトを記録'}</h2>

        {/* 手入力した過去の種目・ラベルを、ブラウザ標準の候補として再利用する。 */}
        <WorkoutSuggestions suggestions={suggestions} />

        <label>
          場所
          <select name="training_place" value={trainingPlace} onChange={handlePlaceChange}>
            <option value="gym">ジム</option>
            <option value="home">自宅</option>
          </select>
        </label>

        <label>
          記録タイプ
          {isCardioExercise && <input type="hidden" name="record_type" value="cardio" />}
          <select
            name={isCardioExercise ? undefined : 'record_type'}
            value={isCardio ? 'cardio' : 'strength'}
            disabled={isCardioExercise}
            onChange={event => setRecordType(event.target.value)}
          >
            <option value="strength">筋トレ</option>
            <option value="cardio">有酸素</option>
          </select>
        </label>

        <label>
          種目
          {trainingPlace === 'gym' ? (
            <select name="exercise" value={exercise} onChange={handleExerciseChange}>
              {gymExercises.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
          ) : (
            <input
              name="exercise"
              list="exercise-names"
              value={exercise}
              onChange={handleExerciseChange}
              placeholder="例: ベンチプレス"
              required
              autoFocus
            />
          )}
        </label>

        <label>
          ラベル（任意）
          <input
            name="tags"
            list="tag-names"
            defaultValue={(editingWorkout?.tags || []).join(', ')}
            placeholder="例: 胸, 三頭（カンマ区切り）"
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

        {/* 記録と参考動画は中間テーブルで複数紐付けできる。 */}
        <div className="video-field">
          <span>この日に使った参考動画（任意）</span>
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
        </div>

        <button className="primary-button">
          {editingWorkout ? '変更を保存する' : '登録する'} <span>→</span>
        </button>
      </form>
    </div>
  );
}

// datalistは見た目を増やさず、入力候補だけをフォームへ追加する。
function WorkoutSuggestions({ suggestions }) {
  return (
    <>
      <datalist id="exercise-names">
        {suggestions.exercises.map(item => <option value={item} key={item} />)}
      </datalist>
      <datalist id="tag-names">
        {suggestions.tags.map(item => <option value={item} key={item} />)}
      </datalist>
    </>
  );
}

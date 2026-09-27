import { useMemo, useState } from 'react';
import styles from './Workouts.module.css';

// 場所・キーワードで過去の記録を絞り込み、編集・削除の入口を出す画面。
export default function Workouts({ workouts, videos, onAdd, onEdit, onDelete }) {
  const [place, setPlace] = useState('all');
  const [keyword, setKeyword] = useState('');

  // 各カードが動画IDからすぐ動画情報を引けるよう、検索用Mapを作る。
  const videoById = useMemo(
    () => new Map(videos.map(video => [Number(video.id), video])),
    [videos],
  );
  // 種目名とラベルをまとめて検索対象にする。
  const visibleWorkouts = workouts.filter(workout => {
    const searchable = `${workout.exercise} ${(workout.tags || []).join(' ')}`;

    return (
      (place === 'all' || workout.training_place === place) &&
      searchable.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  return (
    <section className={styles.page}>
      <header>
        <h1>記録</h1>
        <span>種目とラベルで、過去の記録を探せます。</span>
      </header>

      <button className={styles.primary} onClick={onAdd}>＋ 新しい記録</button>

      {workouts.length === 0 ? (
        <div className={styles.empty}>
          <b>まだ記録はありません</b>
          <p>種目とラベルを登録すると、過去の記録としてここに残ります。</p>
          <button onClick={onAdd}>最初の記録を追加 →</button>
        </div>
      ) : (
        <>
          <section className={styles.placeTabs} aria-label="場所で絞り込み">
            {[
              ['all', 'すべて'],
              ['home', '自宅'],
              ['gym', 'ジム'],
            ].map(([value, label]) => (
              <button
                className={place === value ? styles.activeTab : ''}
                key={value}
                onClick={() => setPlace(value)}
              >
                {label}
              </button>
            ))}
          </section>

          <section className={styles.filters}>
            <input
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="種目・ラベルを検索"
            />
          </section>
          <p className={styles.count}>{visibleWorkouts.length} 件の記録</p>
          <div className={styles.list}>
            {visibleWorkouts.map(workout => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                videoById={videoById}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
          {visibleWorkouts.length === 0 && <p className={styles.noMatch}>条件に一致する記録はありません。</p>}
        </>
      )}
    </section>
  );
}

// 1件のワークアウトと、紐付く動画サムネイルを表示するカード。
function WorkoutCard({ workout, videoById, onEdit, onDelete }) {
  const linkedVideos = (workout.video_ids || [])
    .map(id => videoById.get(Number(id)))
    .filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <time>{workout.date}</time>
        <div className={styles.badges}>
          <span className={styles.place}>{placeLabel(workout.training_place)}</span>
        </div>
      </div>
      <h2>{workout.exercise}</h2>
      <div className={styles.cardBottom}>
        <strong>
          {workout.record_type === 'cardio' ? (
            <>
              {workout.duration_minutes}
              <span> 分</span>
            </>
          ) : (
            <>
              {workout.weight_mode === 'bodyweight' ? '自重' : `${workout.weight} kg`}
              <span> × {workout.reps}回</span>
            </>
          )}
        </strong>
        <div className={styles.tags}>
          {(workout.tags || []).map(tag => <i key={tag}>#{tag}</i>)}
        </div>
      </div>
      {linkedVideos.length > 0 && (
        <div className={styles.videoRefs}>
          <span>参考動画</span>
          <div>{linkedVideos.map(video => <img key={video.id} src={video.thumbnail} alt={video.title} />)}</div>
        </div>
      )}
      <div className={styles.actions}>
        <button className={styles.edit} onClick={() => onEdit(workout)}>編集</button>
        <button className={styles.delete} onClick={() => onDelete(workout)}>削除</button>
      </div>
    </article>
  );
}

// DBの値を、カードに表示する日本語へ変換する。
function placeLabel(place) {
  return place === 'gym' ? 'ジム' : '自宅';
}

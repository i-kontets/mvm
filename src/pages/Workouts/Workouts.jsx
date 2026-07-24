import { useMemo, useState } from 'react';
import styles from './Workouts.module.css';

export default function Workouts({ workouts, videos, onAdd, onEdit }) {
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');

  const categories = useMemo(
    () => [...new Set(workouts.map(workout => workout.category).filter(Boolean))],
    [workouts],
  );
  const videoById = useMemo(
    () => new Map(videos.map(video => [Number(video.id), video])),
    [videos],
  );
  const visibleWorkouts = workouts.filter(workout => {
    const searchable = `${workout.name} ${workout.exercise} ${(workout.tags || []).join(' ')}`;
    return (
      (category === 'all' || workout.category === category) &&
      searchable.toLowerCase().includes(keyword.toLowerCase())
    );
  });

  return (
    <section className={styles.page}>
      <header>
        <h1>記録</h1>
        <span>過去のメニューを、カテゴリ・ラベルで探せます。</span>
      </header>

      <button className={styles.primary} onClick={onAdd}>＋ 新しい記録</button>

      {workouts.length === 0 ? (
        <div className={styles.empty}>
          <b>まだ記録はありません</b>
          <p>メニュー名、種目、カテゴリ、ラベルを登録すると、過去メニューとしてここに残ります。</p>
          <button onClick={onAdd}>最初の記録を追加 →</button>
        </div>
      ) : (
        <>
          <section className={styles.filters}>
            <input
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="メニュー・種目・ラベルを検索"
            />
            <select value={category} onChange={event => setCategory(event.target.value)}>
              <option value="all">すべてのカテゴリ</option>
              {categories.map(item => <option value={item} key={item}>{item}</option>)}
            </select>
          </section>
          <p className={styles.count}>{visibleWorkouts.length} 件の記録</p>
          <div className={styles.list}>
            {visibleWorkouts.map(workout => (
              <WorkoutCard key={workout.id} workout={workout} videoById={videoById} onEdit={onEdit} />
            ))}
          </div>
          {visibleWorkouts.length === 0 && <p className={styles.noMatch}>条件に一致する記録はありません。</p>}
        </>
      )}
    </section>
  );
}

function WorkoutCard({ workout, videoById, onEdit }) {
  const linkedVideos = (workout.video_ids || [])
    .map(id => videoById.get(Number(id)))
    .filter(Boolean);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <time>{workout.date}</time>
        {workout.category && <span className={styles.category}>{workout.category}</span>}
      </div>
      <h2>{workout.name}</h2>
      <p>{workout.exercise}</p>
      <div className={styles.cardBottom}>
        <strong>
          {workout.weight_mode === 'bodyweight' ? '自重' : `${workout.weight} kg`}
          <span> × {workout.reps}回</span>
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
      <button className={styles.edit} onClick={() => onEdit(workout)}>編集</button>
    </article>
  );
}

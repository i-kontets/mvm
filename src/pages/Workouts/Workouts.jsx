import { useMemo, useState } from 'react';
import styles from './Workouts.module.css';

export default function Workouts({ workouts, onAdd }) {
  const [category, setCategory] = useState('all');
  const [keyword, setKeyword] = useState('');
  const categories = useMemo(() => [...new Set(workouts.map(workout => workout.category).filter(Boolean))], [workouts]);
  const visibleWorkouts = workouts.filter(workout => (category === 'all' || workout.category === category) && `${workout.name} ${workout.exercise} ${workout.tags.join(' ')}`.toLowerCase().includes(keyword.toLowerCase()));
  return <section className={styles.page}>
    <header><p>WORKOUT LOG</p><h1>記録</h1><span>過去のメニューを、カテゴリ・ラベルで探せます。</span></header>
    <button className={styles.primary} onClick={onAdd}>＋ 新しい記録</button>
    {workouts.length === 0 ? <div className={styles.empty}><b>まだ記録はありません</b><p>メニュー名、種目、カテゴリ、ラベルを登録すると、過去メニューとしてここに残ります。</p><button onClick={onAdd}>最初の記録を追加 →</button></div> : <>
      <section className={styles.filters}><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="メニュー・種目・ラベルを検索"/><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">すべてのカテゴリ</option>{categories.map(item => <option value={item} key={item}>{item}</option>)}</select></section>
      <p className={styles.count}>{visibleWorkouts.length} 件の記録</p>
      <div className={styles.list}>{visibleWorkouts.map(workout => <article className={styles.card} key={workout.id}><div className={styles.cardHeader}><time>{workout.date}</time>{workout.category && <span className={styles.category}>{workout.category}</span>}</div><h2>{workout.name}</h2><p>{workout.exercise}</p><div className={styles.cardBottom}><strong>{workout.weight}<small> kg</small><span> × {workout.reps}回</span></strong><div className={styles.tags}>{workout.tags.map(tag => <i key={tag}>#{tag}</i>)}</div></div></article>)}</div>
      {visibleWorkouts.length === 0 && <p className={styles.noMatch}>条件に一致する記録はありません。</p>}
    </>}
  </section>;
}

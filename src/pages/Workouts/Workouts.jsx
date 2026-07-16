import styles from './Workouts.module.css';

export default function Workouts({ workouts, onAdd }) {
  return <section className={styles.page}><header><p>WORKOUT LOG</p><h1>記録</h1><span>トレーニングの内容を残しましょう。</span></header><button className={styles.primary} onClick={onAdd}>＋ 新しい記録</button>{workouts.length === 0 ? <div className={styles.empty}><b>まだ記録はありません</b><p>重量・回数・セットを記録すると、ここに一覧表示されます。</p><button onClick={onAdd}>最初の記録を追加 →</button></div> : <div className={styles.list}>{workouts.map(workout => <article className={styles.card} key={workout.id}><div><time>{workout.date}</time><h2>{workout.name}</h2><p>{workout.exercise}</p></div><strong>{workout.weight}<small> kg</small><span> × {workout.reps}回</span></strong></article>)}</div>}</section>;
}

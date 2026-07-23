import styles from './Progress.module.css';

export default function Progress({ workouts, metrics }) {
  const weightedWorkouts = workouts.filter(
    workout => workout.weight_mode !== 'bodyweight',
  );
  const bodyweightWorkouts = workouts.filter(
    workout => workout.weight_mode === 'bodyweight',
  );

  const bodyweightAt = date =>
    Number(metrics.find(metric => metric.date <= date)?.weight || metrics[0]?.weight || 0);

  const weightedVolume = weightedWorkouts.reduce(
    (sum, workout) => sum + Number(workout.weight || 0) * Number(workout.reps || 0),
    0,
  );
  const bodyweightVolume = bodyweightWorkouts.reduce(
    (sum, workout) =>
      sum + (Number(workout.weight || 0) || bodyweightAt(workout.date)) * Number(workout.reps || 0),
    0,
  );
  const totalVolume = weightedVolume + bodyweightVolume;

  return (
    <section className={styles.page}>
      <header>
        <p>YOUR PROGRESS</p>
        <h1>進捗</h1>
        <span>登録したデータから、成長を振り返ります。</span>
      </header>

      <div className={styles.metrics}>
        <MetricCard title="総記録" volume={totalVolume} count={workouts.length} />
        <MetricCard title="自重を除く総重量" volume={weightedVolume} count={weightedWorkouts.length} />
        <MetricCard title="自重の総重量" volume={bodyweightVolume} count={bodyweightWorkouts.length} />
      </div>

      {workouts.length === 0 && metrics.length === 0 ? (
        <div className={styles.empty}>
          <b>振り返るデータがまだありません</b>
          <p>ワークアウトや体重を登録すると、ここに進捗が表示されます。</p>
        </div>
      ) : (
        <section className={styles.note}>
          <p>次のステップ</p>
          <b>記録が増えると、体重・トレーニング量・種目ごとの伸びをグラフで表示できます。</b>
        </section>
      )}
    </section>
  );
}

function MetricCard({ title, volume, count }) {
  return (
    <article>
      <p>{title}</p>
      <div className="metric-pair">
        <div>
          <span>総重量</span>
          <strong>
            {volume.toLocaleString()}
            <small> kg</small>
          </strong>
        </div>
        <div>
          <span>記録回数</span>
          <strong>
            {count.toLocaleString()}
            <small> 回</small>
          </strong>
        </div>
      </div>
    </article>
  );
}

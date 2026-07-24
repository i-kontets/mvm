import styles from './Dashboard.module.css';

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

export default function Dashboard({
  workouts,
  plans,
  metrics,
  logs,
  onStartWorkout,
  onAddPlan,
  onAddMetric,
}) {
  const today = new Date().getDay();
  const todayPlan = plans.find(plan => Number(plan.day) === today);
  const latestWeight = metrics[0];

  return (
    <section className={styles.page}>
      <header className={styles.heading}>
        <h1>今日のトレーニング</h1>
      </header>

      <article className={styles.todayCard}>
        <div>
          <span className={styles.overline}>今日の予定</span>
          <h2>{todayPlan ? todayPlan.title : '予定はありません'}</h2>
          <p>{todayPlan ? '予定を確認して、記録を始めましょう。' : '予定を追加するか、自由に記録を始められます。'}</p>
          <button className={styles.primary} onClick={onStartWorkout}>
            記録を始める <span>→</span>
          </button>
        </div>
        <div className={styles.todayDate}>
          {weekdays[today]}
          <small>今日</small>
        </div>
      </article>

      <div className={styles.quickGrid}>
        <article className={styles.quickCard}>
          <p>体重</p>
          {latestWeight ? (
            <>
              <strong>
                {latestWeight.weight}
                <small> kg</small>
              </strong>
              <span>{latestWeight.date} に記録</span>
            </>
          ) : (
            <>
              <strong>—</strong>
              <span>まだ記録がありません</span>
            </>
          )}
          <button onClick={onAddMetric}>＋ 体重を記録</button>
        </article>

        <article className={styles.quickCard}>
          <p>記録数</p>
          <strong>
            {workouts.length}
            <small> 回</small>
          </strong>
          <span>登録した記録がここに集計されます</span>
        </article>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>最近の記録</h2>
          </div>
          <button onClick={onStartWorkout}>＋ 追加</button>
        </div>
        {workouts.length === 0 ? (
          <Empty text="まだワークアウトの記録はありません" action="最初の記録を追加" onClick={onStartWorkout} />
        ) : (
          <div className={styles.list}>
            {workouts.slice(0, 3).map(workout => (
              <div className={styles.row} key={workout.id}>
                <div className={styles.icon}>⌁</div>
                <div>
                  <b>{workout.name}</b>
                  <span>{workout.exercise} · {workout.weight} kg × {workout.reps}回</span>
                </div>
                <time>{workout.date}</time>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>今週の予定</h2>
          </div>
          <button onClick={onAddPlan}>＋ 追加</button>
        </div>
        {plans.length === 0 ? (
          <Empty text="毎週のトレーニング予定はありません" action="予定を追加" onClick={onAddPlan} />
        ) : (
          <div className={styles.planGrid}>
            {plans.map(plan => (
              <div className={styles.plan} key={plan.id}>
                <span>{weekdays[plan.day]}</span>
                <b>{plan.title}</b>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>登録ログ</h2>
          </div>
        </div>
        {logs.length === 0 ? (
          <p className={styles.emptyLog}>データを登録すると、ここに操作ログが表示されます。</p>
        ) : (
          <div className={styles.logs}>
            {logs.slice(0, 5).map(log => <p key={log.id}><span>{log.time}</span>{log.message}</p>)}
          </div>
        )}
      </section>
    </section>
  );
}

function Empty({ text, action, onClick }) {
  return (
    <div className={styles.empty}>
      <p>{text}</p>
      <button onClick={onClick}>{action} →</button>
    </div>
  );
}

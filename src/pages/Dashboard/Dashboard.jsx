import styles from './Dashboard.module.css';

export default function Dashboard({ workouts, plans, metrics, logs, onStartWorkout, onAddPlan, onAddMetric }) {
  const today = new Date().getDay();
  const todayPlan = plans.find(plan => Number(plan.day) === today);
  const latestWeight = metrics[0];
  return <section className={styles.page}>
    <header className={styles.heading}><p>YOUR TRAINING SPACE</p><h1>今日のトレーニング</h1></header>
    <article className={styles.todayCard}><div><span className={styles.overline}>TODAY'S PLAN</span><h2>{todayPlan ? todayPlan.title : '予定はありません'}</h2><p>{todayPlan ? '予定を確認して、記録を始めましょう。' : '予定を追加するか、自由に記録を始められます。'}</p><button className={styles.primary} onClick={onStartWorkout}>記録を始める <span>→</span></button></div><div className={styles.todayDate}>{['日','月','火','水','木','金','土'][today]}<small>TODAY</small></div></article>
    <div className={styles.quickGrid}><article className={styles.quickCard}><p>BODY METRICS</p>{latestWeight ? <><strong>{latestWeight.weight}<small> kg</small></strong><span>{latestWeight.date} に記録</span></> : <><strong>—</strong><span>まだ記録がありません</span></>}<button onClick={onAddMetric}>＋ 体重を記録</button></article><article className={styles.quickCard}><p>THIS WEEK</p><strong>{workouts.length}<small> workouts</small></strong><span>登録した記録がここに集計されます</span></article></div>
    <section className={styles.section}><div className={styles.sectionHead}><div><p>RECENT WORKOUTS</p><h2>最近の記録</h2></div><button onClick={onStartWorkout}>＋ 追加</button></div>{workouts.length === 0 ? <Empty text="まだワークアウトの記録はありません" action="最初の記録を追加" onClick={onStartWorkout}/> : <div className={styles.list}>{workouts.slice(0, 3).map(workout => <div className={styles.row} key={workout.id}><div className={styles.icon}>⌁</div><div><b>{workout.name}</b><span>{workout.exercise} · {workout.weight} kg × {workout.reps}回</span></div><time>{workout.date}</time></div>)}</div>}</section>
    <section className={styles.section}><div className={styles.sectionHead}><div><p>WEEKLY ROUTINE</p><h2>今週の予定</h2></div><button onClick={onAddPlan}>＋ 追加</button></div>{plans.length === 0 ? <Empty text="毎週のトレーニング予定はありません" action="予定を追加" onClick={onAddPlan}/> : <div className={styles.planGrid}>{plans.map(plan => <div className={styles.plan} key={plan.id}><span>{['日','月','火','水','木','金','土'][plan.day]}</span><b>{plan.title}</b></div>)}</div>}</section>
    <section className={styles.section}><div className={styles.sectionHead}><div><p>ACTIVITY LOG</p><h2>登録ログ</h2></div></div>{logs.length === 0 ? <p className={styles.emptyLog}>データを登録すると、ここに操作ログが表示されます。</p> : <div className={styles.logs}>{logs.slice(0, 5).map(log => <p key={log.id}><span>{log.time}</span>{log.message}</p>)}</div>}</section>
  </section>;
}

function Empty({ text, action, onClick }) { return <div className={styles.empty}><p>{text}</p><button onClick={onClick}>{action} →</button></div>; }

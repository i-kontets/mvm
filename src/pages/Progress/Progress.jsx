import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from './Progress.module.css';

ChartJS.register(
  BarElement,
  CategoryScale,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      displayColors: false,
      backgroundColor: '#142016',
      padding: 10,
      titleFont: { size: 11 },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#89938c', font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: '#edf0eb' },
      ticks: { color: '#89938c', font: { size: 10 } },
    },
  },
};

export default function Progress({ workouts, metrics }) {
  const sortedMetrics = sortByDate(metrics);
  const sortedWorkouts = sortByDate(workouts);
  const weightedWorkouts = workouts.filter(workout => workout.weight_mode !== 'bodyweight');
  const bodyweightWorkouts = workouts.filter(workout => workout.weight_mode === 'bodyweight');

  const bodyweightAt = date =>
    Number([...sortedMetrics].reverse().find(metric => metric.date <= date)?.weight || sortedMetrics.at(-1)?.weight || 0);

  const weightedVolume = getWorkoutVolume(weightedWorkouts, bodyweightAt);
  const bodyweightVolume = getWorkoutVolume(bodyweightWorkouts, bodyweightAt);
  const totalVolume = weightedVolume + bodyweightVolume;
  const volumeByDate = buildVolumeByDate(sortedWorkouts, bodyweightAt);
  const exerciseSeries = buildExerciseSeries(sortedWorkouts, bodyweightAt);

  return (
    <section className={styles.page}>
      <header>
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
        <div className={styles.charts}>
          <ChartPanel title="体重推移" emptyText="体重を1件登録すると表示されます。">
            {sortedMetrics.length > 0 && (
              <Line
                data={lineData(
                  sortedMetrics.map(metric => metric.date),
                  sortedMetrics.map(metric => Number(metric.weight || 0)),
                  '#7ac65b',
                )}
                options={chartOptions}
              />
            )}
          </ChartPanel>

          <ChartPanel title="日別トレーニング量" emptyText="ワークアウトを1件登録すると表示されます。">
            {volumeByDate.length > 0 && (
              <Bar
                data={barData(
                  volumeByDate.map(item => item.date),
                  volumeByDate.map(item => item.volume),
                )}
                options={volumeChartOptions(volumeByDate.map(item => item.exercises))}
              />
            )}
          </ChartPanel>

          <section className={styles.exercisePanel}>
            <div className={styles.panelHead}>
              <h2>種目ごとの伸び</h2>
            </div>

            {exerciseSeries.length === 0 ? (
              <p className={styles.emptyLine}>ワークアウトを1件登録すると表示されます。</p>
            ) : (
              <div className={styles.exerciseGrid}>
                {exerciseSeries.map(exercise => (
                  <article className={styles.exerciseCard} key={exercise.name}>
                    <div>
                      <span>{exercise.name}</span>
                      <strong>
                        {exercise.latestVolume.toLocaleString()}
                        <small> kg</small>
                      </strong>
                    </div>
                    <div className={styles.miniChart}>
                      <Line
                        data={lineData(exercise.labels, exercise.values, '#9aff62')}
                        options={miniChartOptions}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
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

function ChartPanel({ title, emptyText, children }) {
  return (
    <section className={styles.chartPanel}>
      <div className={styles.panelHead}>
        <h2>{title}</h2>
      </div>
      <div className={styles.chartBox}>
        {children || <p className={styles.emptyLine}>{emptyText}</p>}
      </div>
    </section>
  );
}

function sortByDate(items) {
  return [...items].sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function workoutVolume(workout, bodyweightAt) {
  const weight = workout.weight_mode === 'bodyweight'
    ? Number(workout.weight || 0) || bodyweightAt(workout.date)
    : Number(workout.weight || 0);

  return weight * Number(workout.reps || 0);
}

function getWorkoutVolume(workouts, bodyweightAt) {
  return workouts.reduce((sum, workout) => sum + workoutVolume(workout, bodyweightAt), 0);
}

function buildVolumeByDate(workouts, bodyweightAt) {
  const volumeByDate = workouts.reduce((result, workout) => {
    const volume = workoutVolume(workout, bodyweightAt);
    const current = result.get(workout.date) || { volume: 0, exercises: new Set() };

    current.volume += volume;
    current.exercises.add(workout.exercise || workout.name);
    result.set(workout.date, current);

    return result;
  }, new Map());

  return [...volumeByDate.entries()].map(([date, item]) => ({
    date,
    volume: item.volume,
    exercises: [...item.exercises],
  }));
}

function buildExerciseSeries(workouts, bodyweightAt) {
  const exerciseMap = workouts.reduce((result, workout) => {
    const name = workout.exercise || workout.name;
    const records = result.get(name) || [];
    records.push({
      date: workout.date,
      volume: workoutVolume(workout, bodyweightAt),
    });
    result.set(name, records);
    return result;
  }, new Map());

  return [...exerciseMap.entries()]
    .map(([name, records]) => ({
      name,
      labels: records.map(record => record.date),
      values: records.map(record => record.volume),
      latestVolume: records.at(-1).volume,
    }))
    .sort((a, b) => b.latestVolume - a.latestVolume)
    .slice(0, 4);
}

function lineData(labels, values, color) {
  return {
    labels,
    datasets: [{
      data: values,
      borderColor: color,
      backgroundColor: `${color}26`,
      pointBackgroundColor: color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      tension: labels.length > 1 ? 0.35 : 0,
      fill: true,
    }],
  };
}

function barData(labels, values) {
  return {
    labels,
    datasets: [{
      data: values,
      backgroundColor: '#9aff62',
      borderRadius: 6,
      maxBarThickness: 38,
    }],
  };
}

function volumeChartOptions(exercisesByIndex) {
  return {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: context => `総重量: ${Number(context.raw || 0).toLocaleString()} kg`,
          afterBody: items => {
            const exercises = exercisesByIndex[items[0].dataIndex] || [];
            return exercises.length ? [`種目: ${exercises.join(', ')}`] : [];
          },
        },
      },
    },
  };
}

const miniChartOptions = {
  ...chartOptions,
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
  scales: {
    x: { display: false },
    y: { display: false, beginAtZero: true },
  },
};

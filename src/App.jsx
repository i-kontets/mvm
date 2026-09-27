import { useEffect, useRef, useState } from 'react';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Workouts from './pages/Workouts/Workouts.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import Progress from './pages/Progress/Progress.jsx';
import Videos from './pages/Videos/Videos.jsx';
import MetricFormModal from './pages/Dashboard/MetricFormModal.jsx';
import WorkoutFormModal from './pages/Workouts/WorkoutFormModal.jsx';
import VideoFormModal from './pages/Videos/VideoFormModal.jsx';
import {
  DateEventModal,
  ScheduleDetailModal,
  WeeklyPlanModal,
  inclusiveEndToCalendarEnd,
} from './pages/Calendar/ScheduleFormModal.jsx';
import { api } from './lib/api.js';
import { thisMonday, toLocalDate } from './lib/date.js';
import { youtubeThumbnail } from './lib/youtube.js';
import { createClientId } from './lib/id.js';
import HomeIcon from './assets/navigation/home.svg?react';
import WorkoutsIcon from './assets/navigation/workouts.svg?react';
import ScheduleIcon from './assets/navigation/schedule.svg?react';
import VideosIcon from './assets/navigation/videos.svg?react';
import ProgressIcon from './assets/navigation/progress.svg?react';

// --- アプリ全体で共有する表示定義 ---
const navItems = [
  { Icon: HomeIcon, name: 'ホーム' },
  { Icon: WorkoutsIcon, name: '記録' },
  { Icon: ScheduleIcon, name: '予定' },
  { Icon: VideosIcon, name: '動画' },
  { Icon: ProgressIcon, name: '進捗' },
];
const pageTitles = { ホーム: 'ホーム', 記録: '記録', 予定: '予定', 動画: '参考動画', 進捗: '進捗' };
const sampleMonday = thisMonday();
const sampleThursday = new Date(sampleMonday);
sampleThursday.setDate(sampleThursday.getDate() + 3);
const samplePlans = [{ id: 'sample-recurring', day: 2, title: '胸・三頭' }];
const sampleEvents = [{ id: 'sample-week', title: '連続トレーニング週間', start: toLocalDate(sampleMonday), end: toLocalDate(sampleThursday) }];
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const gymExercises = [
  'シーテッドレッグプレス',
  'チェストプレス',
  'ショルダープレス',
  '自転車エルゴメーター／エアロバイク',
];

export default function App() {
  // --- 画面状態 ---
  // APIから取得したデータと、現在開いている画面・モーダルをここで一元管理する。
  const [activePage, setActivePage] = useState('ホーム');
  const [modal, setModal] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [plans, setPlans] = useState(samplePlans);
  const [calendarEvents, setCalendarEvents] = useState(sampleEvents);
  const [videos, setVideos] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [planDay, setPlanDay] = useState(1);
  const [eventDate, setEventDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadVersion = useRef(0);
  const isOverlayOpen = Boolean(modal || selectedSchedule);

  // モーダル表示中は、スマホを含めて背面のページをスクロールさせない。
  useEffect(() => {
    if (!isOverlayOpen) return undefined;

    // iPhone Safariでも背面のページ位置を固定する。閉じる時に元の位置へ戻す。
    const scrollY = window.scrollY;
    const bodyStyle = document.body.style;
    const previousStyle = {
      overflow: bodyStyle.overflow,
      position: bodyStyle.position,
      top: bodyStyle.top,
      width: bodyStyle.width,
    };

    Object.assign(bodyStyle, {
      overflow: 'hidden',
      position: 'fixed',
      top: `-${scrollY}px`,
      width: '100%',
    });

    return () => {
      Object.assign(bodyStyle, previousStyle);
      window.scrollTo(0, scrollY);
    };
  }, [isOverlayOpen]);

  // 入力中にモーダルをスクロールした時だけキーボードを閉じ、フォーム移動を楽にする。
  useEffect(() => {
    if (!isOverlayOpen) return undefined;

    let touchStartY = null;
    const blurActiveTextInput = () => {
      const activeElement = document.activeElement;

      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        activeElement.blur();
      }
    };

    const handleTouchStart = event => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = event => {
      const currentY = event.touches[0]?.clientY;
      if (touchStartY === null || currentY === undefined) return;

      // タップでは閉じず、スクロール意図がある程度見えた時だけキーボードを閉じる。
      if (Math.abs(currentY - touchStartY) > 8) {
        blurActiveTextInput();
        touchStartY = null;
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('wheel', blurActiveTextInput, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', blurActiveTextInput);
    };
  }, [isOverlayOpen]);

  // 操作ログは画面表示用とブラウザの調査用コンソールへ同時に残す。
  const addLog = message => {
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const entry = { id: createClientId(), time, message };
    setLogs(current => [entry, ...current]);
    console.info('[MVM Activity Log]', entry);
  };

  // --- APIからの初期・再取得処理 ---
  const loadData = async () => {
    // 遅れて届いた古い通信結果で、画面の最新状態を上書きしないための番号。
    const version = ++loadVersion.current;
    try {
      const [savedWorkouts, savedMetrics, savedPlans, savedEvents, savedVideos] = await Promise.all([
        api.get('/workouts'),
        api.get('/body-metrics'),
        api.get('/training-plans'),
        api.get('/schedule-events'),
        api.get('/reference-videos'),
      ]);
      if (version !== loadVersion.current) return;

      setWorkouts(savedWorkouts);
      setMetrics(savedMetrics);
      setPlans(savedPlans);
      setCalendarEvents(savedEvents);
      setVideos(savedVideos);
    } catch {
      if (version === loadVersion.current) {
        addLog('APIに接続できませんでした。DockerのAPIコンテナを確認してください。');
      }
    } finally {
      // 初回表示では空配列を「データなし」と見せず、通信完了を待ってから画面を描画する。
      if (version === loadVersion.current) setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- フォーム送信処理 ---
  // 各モーダルから送られたFormDataを、Laravel APIが受け取る形に変換して保存する。
  const saveWorkout = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const exercise = String(form.get('exercise') || '').trim();
    const recordType = form.get('record_type') || 'strength';
    const weightMode = form.get('weight_mode') || 'weighted';
    const tags = String(form.get('tags') || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    const workout = {
      // 現行UIでは種目名を記録の表示名としても利用する。
      name: exercise,
      exercise,
      category: '',
      tags,
      training_place: form.get('training_place') || 'gym',
      record_type: recordType,
      weight_mode: weightMode,
      weight: recordType === 'cardio' || weightMode === 'bodyweight' ? 0 : Number(form.get('weight') || 0),
      reps: recordType === 'cardio' ? null : Number(form.get('reps')),
      duration_minutes: recordType === 'cardio' ? Number(form.get('duration_minutes')) : null,
      date: form.get('date'),
      video_ids: form.getAll('video_ids').map(Number),
    };

    try {
      if (editingWorkout) {
        await api.put(`/workouts/${editingWorkout.id}`, workout);
      } else {
        await api.post('/workouts', { ...workout, id: createClientId() });
      }
      await loadData();
      addLog(`ワークアウトを${editingWorkout ? '更新' : '登録'}: ${placeLabel(workout.training_place)} ${workout.exercise}`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  // 削除前に対象を確認し、成功時は一覧を再取得して表示を同期する。
  const deleteWorkout = async workout => {
    const label = `${placeLabel(workout.training_place)}・${workout.exercise}`;

    // 取り消せない操作なので、APIを呼ぶ前に利用者へ対象を明示する。
    if (!window.confirm(`「${label}」の記録を削除しますか？`)) return;

    try {
      await api.delete(`/workouts/${workout.id}`);
      await loadData();
      addLog(`ワークアウトを削除: ${label}`);
    } catch (error) {
      addLog(error.message);
    }
  };

  // 曜日固定のルーティンを登録する。
  const savePlan = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plan = { id: createClientId(), day: Number(form.get('day')), title: form.get('title') };

    try {
      await api.post('/training-plans', plan);
      await loadData();
      addLog(`週間予定を登録: ${plan.title}`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  // 体重の時系列データを登録する。
  const saveMetric = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const metric = { id: createClientId(), weight: form.get('weight'), date: form.get('date') };

    try {
      await api.post('/body-metrics', metric);
      await loadData();
      addLog(`体重を登録: ${metric.weight} kg`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  // 開始日・終了日を持つ、単発または期間予定を登録する。
  const saveEvent = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const calendarEvent = {
      id: createClientId(),
      title: form.get('title'),
      start: form.get('start'),
      end: inclusiveEndToCalendarEnd(form.get('end')),
    };

    try {
      await api.post('/schedule-events', calendarEvent);
      await loadData();
      addLog(`期間指定予定を登録: ${calendarEvent.title}`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  // YouTube URLから作ったサムネイルURLも一緒に保存する。
  const saveVideo = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const url = form.get('url').trim();
    const video = { id: createClientId(), title: form.get('title'), category: form.get('category'), url, thumbnail: youtubeThumbnail(url) };

    try {
      if (editingVideo) {
        await api.put(`/reference-videos/${editingVideo.id}`, video);
      } else {
        await api.post('/reference-videos', video);
      }
      await loadData();
      addLog(`参考動画を${editingVideo ? '更新' : '登録'}: ${video.title}`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  // --- 既存の予定の編集・削除 ---
  const updatePlan = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plan = { day: Number(form.get('day')), title: form.get('title') };

    try {
      await api.put(`/training-plans/${selectedSchedule.item.id}`, plan);
      await loadData();
      addLog(`毎週の予定を更新: ${plan.title}`);
      setSelectedSchedule(null);
    } catch (error) {
      addLog(error.message);
    }
  };

  const updateEvent = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      title: form.get('title'),
      start: form.get('start'),
      end: inclusiveEndToCalendarEnd(form.get('end')),
    };

    try {
      await api.put(`/schedule-events/${selectedSchedule.item.id}`, item);
      await loadData();
      addLog(`期間指定予定を更新: ${item.title}`);
      setSelectedSchedule(null);
    } catch (error) {
      addLog(error.message);
    }
  };

  // 選択した予定の種類に応じて、正しいAPIエンドポイントを選ぶ。
  const deleteSchedule = async () => {
    if (!window.confirm(`「${selectedSchedule.item.title}」を削除しますか？`)) return;

    const path = selectedSchedule.type === 'plan'
      ? `/training-plans/${selectedSchedule.item.id}`
      : `/schedule-events/${selectedSchedule.item.id}`;

    try {
      await api.delete(path);
      await loadData();
      addLog(`${selectedSchedule.type === 'plan' ? '毎週の予定' : '期間指定予定'}を削除: ${selectedSchedule.item.title}`);
      setSelectedSchedule(null);
    } catch (error) {
      addLog(error.message);
    }
  };

  // --- モーダルを開閉する共通処理 ---
  // 編集対象やカレンダーで選んだ日付も、開く直前にセットする。
  const open = (type, value) => {
    if (type === 'plan' && Number.isInteger(value)) setPlanDay(value);
    if (type === 'event') setEventDate(typeof value === 'string' ? value : null);
    if (type === 'video') setEditingVideo(value || null);
    if (type === 'workout') setEditingWorkout(value || null);
    setModal(type);
  };

  // 閉じる時は、次回新規登録に古い編集データを持ち越さない。
  const closeModal = () => {
    setModal(null);
    setEditingVideo(null);
    setEditingWorkout(null);
  };

  // 過去の入力値を候補として使い、種目・ラベルの手入力を減らす。
  const suggestions = {
    exercises: [...new Set([...gymExercises, ...workouts.map(item => item.exercise)])],
    tags: [...new Set(workouts.flatMap(item => item.tags || []))],
  };
  const dashboardLogs = [
    ...logs,
    ...buildRegisteredLogs({ workouts, metrics, plans, calendarEvents, videos }),
  ].slice(0, 8);

  // ページごとに必要なデータと操作関数だけを渡す。
  const pages = {
    ホーム: (
      <Dashboard
        workouts={workouts}
        plans={plans}
        metrics={metrics}
        logs={dashboardLogs}
        onStartWorkout={() => open('workout')}
        onAddPlan={() => open('plan')}
        onAddMetric={() => open('metric')}
      />
    ),
    記録: (
      <Workouts
        workouts={workouts}
        videos={videos}
        onAdd={() => open('workout')}
        onEdit={workout => open('workout', workout)}
        onDelete={deleteWorkout}
      />
    ),
    予定: (
      <Calendar
        plans={plans}
        calendarEvents={calendarEvents}
        onAdd={day => open('plan', day)}
        onAddOneTime={date => open('event', date)}
        onSelectPlan={item => setSelectedSchedule({ type: 'plan', item })}
        onSelectEvent={item => setSelectedSchedule({ type: 'event', item })}
      />
    ),
    動画: (
      <Videos
        videos={videos}
        onAdd={() => open('video')}
        onEdit={video => open('video', video)}
      />
    ),
    進捗: <Progress workouts={workouts} metrics={metrics} />,
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-mark">M</span>
          <span>MVM</span>
        </a>
        <nav>
          {navItems.map(({ Icon, name }) => (
            <button
              key={name}
              className={`nav-link ${activePage === name ? 'active' : ''}`}
              onClick={() => setActivePage(name)}
            >
              <span className="nav-icon-slot" aria-hidden="true">
                <Icon className="nav-icon" focusable="false" />
              </span>
              <span className="nav-label">{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <div className="desktop-page-label">{pageTitles[activePage]}</div>
        {isInitialLoading ? (
          <div className="page-loading" role="status">データを読み込んでいます…</div>
        ) : pages[activePage]}
      </main>

      {modal === 'workout' && (
        <WorkoutFormModal
          editingWorkout={editingWorkout}
          videos={videos}
          suggestions={suggestions}
          onClose={closeModal}
          onSubmit={saveWorkout}
        />
      )}
      {modal === 'plan' && <WeeklyPlanModal planDay={planDay} onClose={closeModal} onSubmit={savePlan} />}
      {modal === 'event' && <DateEventModal eventDate={eventDate} onClose={closeModal} onSubmit={saveEvent} />}
      {modal === 'video' && <VideoFormModal editingVideo={editingVideo} onClose={closeModal} onSubmit={saveVideo} />}
      {modal === 'metric' && <MetricFormModal onClose={closeModal} onSubmit={saveMetric} />}

      {selectedSchedule && (
        <ScheduleDetailModal
          selected={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onSubmit={selectedSchedule.type === 'plan' ? updatePlan : updateEvent}
          onDelete={deleteSchedule}
        />
      )}
    </div>
  );
}

// APIから取得済みのデータを、ダッシュボード用の読みやすい操作ログに変換する。
function buildRegisteredLogs({ workouts, metrics, plans, calendarEvents, videos }) {
  const datedLogs = [
    ...workouts.map(workout => ({
      id: `saved-workout-${workout.id}`,
      time: workout.date,
      message: `記録: ${placeLabel(workout.training_place)} ${workout.exercise}`,
      date: workout.date,
    })),
    ...metrics.map(metric => ({
      id: `saved-metric-${metric.id}`,
      time: metric.date,
      message: `体重: ${metric.weight} kg`,
      date: metric.date,
    })),
    ...calendarEvents
      .filter(event => !String(event.id).startsWith('sample-'))
      .map(event => ({
        id: `saved-event-${event.id}`,
        time: event.start,
        message: `期間指定予定: ${event.title}`,
        date: event.start,
      })),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const undatedLogs = [
    ...plans
      .filter(plan => !String(plan.id).startsWith('sample-'))
      .map(plan => ({
        id: `saved-plan-${plan.id}`,
        time: `${weekdays[plan.day]}曜`,
        message: `毎週の予定: ${plan.title}`,
      })),
    ...videos.map(video => ({
      id: `saved-video-${video.id}`,
      time: '動画',
      message: `参考動画: ${video.title}`,
    })),
  ];

  return [...datedLogs, ...undatedLogs];
}

// DBの識別値を画面に表示する日本語へ変換する。
function placeLabel(place) {
  return place === 'gym' ? 'ジム' : '自宅';
}

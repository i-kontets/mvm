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

const navItems = [['▦', 'ホーム'], ['⌁', '記録'], ['□', '予定'], ['▷', '動画'], ['↗', '進捗']];
const pageTitles = { ホーム: 'ホーム', 記録: '記録', 予定: '予定', 動画: '参考動画', 進捗: '進捗' };
const sampleMonday = thisMonday();
const sampleThursday = new Date(sampleMonday);
sampleThursday.setDate(sampleThursday.getDate() + 3);
const samplePlans = [{ id: 'sample-recurring', day: 2, title: '胸・三頭' }];
const sampleEvents = [{ id: 'sample-week', title: '連続トレーニング週間', start: toLocalDate(sampleMonday), end: toLocalDate(sampleThursday) }];
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

export default function App() {
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
  const loadVersion = useRef(0);

  const addLog = message => {
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const entry = { id: crypto.randomUUID(), time, message };
    setLogs(current => [entry, ...current]);
    console.info('[MVM Activity Log]', entry);
  };

  const loadData = async () => {
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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveWorkout = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const weightMode = form.get('weight_mode') || 'weighted';
    const tags = String(form.get('tags') || '')
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    const workout = {
      name: form.get('name'),
      exercise: form.get('exercise'),
      category: String(form.get('category') || '').trim(),
      tags,
      weight_mode: weightMode,
      weight: weightMode === 'bodyweight' ? 0 : Number(form.get('weight') || 0),
      reps: Number(form.get('reps')),
      date: form.get('date'),
      video_ids: form.getAll('video_ids').map(Number),
    };

    try {
      if (editingWorkout) {
        await api.put(`/workouts/${editingWorkout.id}`, workout);
      } else {
        await api.post('/workouts', { ...workout, id: crypto.randomUUID() });
      }
      await loadData();
      addLog(`ワークアウトを${editingWorkout ? '更新' : '登録'}: ${workout.name}（${workout.exercise}）`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  const savePlan = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const plan = { id: crypto.randomUUID(), day: Number(form.get('day')), title: form.get('title') };

    try {
      await api.post('/training-plans', plan);
      await loadData();
      addLog(`週間予定を登録: ${plan.title}`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  const saveMetric = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const metric = { id: crypto.randomUUID(), weight: form.get('weight'), date: form.get('date') };

    try {
      await api.post('/body-metrics', metric);
      await loadData();
      addLog(`体重を登録: ${metric.weight} kg`);
      closeModal();
    } catch (error) {
      addLog(error.message);
    }
  };

  const saveEvent = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const calendarEvent = {
      id: crypto.randomUUID(),
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

  const saveVideo = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const url = form.get('url').trim();
    const video = { id: crypto.randomUUID(), title: form.get('title'), category: form.get('category'), url, thumbnail: youtubeThumbnail(url) };

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

  const open = (type, value) => {
    if (type === 'plan' && Number.isInteger(value)) setPlanDay(value);
    if (type === 'event') setEventDate(typeof value === 'string' ? value : null);
    if (type === 'video') setEditingVideo(value || null);
    if (type === 'workout') setEditingWorkout(value || null);
    setModal(type);
  };

  const closeModal = () => {
    setModal(null);
    setEditingVideo(null);
    setEditingWorkout(null);
  };

  const suggestions = {
    names: [...new Set(workouts.map(item => item.name))],
    exercises: [...new Set(workouts.map(item => item.exercise))],
    categories: [...new Set(workouts.map(item => item.category).filter(Boolean))],
    tags: [...new Set(workouts.flatMap(item => item.tags || []))],
  };
  const dashboardLogs = [
    ...logs,
    ...buildRegisteredLogs({ workouts, metrics, plans, calendarEvents, videos }),
  ].slice(0, 8);

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
          {navItems.map(([icon, name]) => (
            <button
              key={name}
              className={`nav-link ${activePage === name ? 'active' : ''}`}
              onClick={() => setActivePage(name)}
            >
              <b className="nav-glyph">{icon}</b>
              <span>{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main>
        <div className="desktop-page-label">{pageTitles[activePage]}</div>
        {pages[activePage]}
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

function buildRegisteredLogs({ workouts, metrics, plans, calendarEvents, videos }) {
  const datedLogs = [
    ...workouts.map(workout => ({
      id: `saved-workout-${workout.id}`,
      time: workout.date,
      message: `記録: ${workout.name}（${workout.exercise}）`,
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

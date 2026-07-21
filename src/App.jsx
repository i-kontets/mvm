import { useEffect, useRef, useState } from 'react';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Workouts from './pages/Workouts/Workouts.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import Progress from './pages/Progress/Progress.jsx';
import Videos from './pages/Videos/Videos.jsx';
import { api } from './lib/api.js';

const navItems = [['▦', 'ホーム'], ['⌁', '記録'], ['□', '予定'], ['▷', '動画'], ['↗', '進捗']];
const pageTitles = { ホーム: 'ホーム', 記録: '記録', 予定: '予定', 動画: '参考動画', 進捗: '進捗' };
const toLocalDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const thisMonday = () => { const date = new Date(); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return date; };
const sampleMonday = thisMonday();
const sampleThursday = new Date(sampleMonday); sampleThursday.setDate(sampleThursday.getDate() + 3);
const samplePlans = [{ id: 'sample-recurring', day: 2, title: '胸・三頭' }];
const sampleEvents = [{ id: 'sample-week', title: '連続トレーニング週間', start: toLocalDate(sampleMonday), end: toLocalDate(sampleThursday) }];
const youtubeThumbnail = url => {
  try { const parsed = new URL(url); const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).at(-1); return id && /^[\w-]{11}$/.test(id) ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null; } catch { return null; }
};

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
      const [savedWorkouts, savedMetrics, savedPlans, savedEvents, savedVideos] = await Promise.all([api.get('/workouts'), api.get('/body-metrics'), api.get('/training-plans'), api.get('/schedule-events'), api.get('/reference-videos')]);
      if (version !== loadVersion.current) return;
      setWorkouts(savedWorkouts); setMetrics(savedMetrics); setPlans(savedPlans); setCalendarEvents(savedEvents); setVideos(savedVideos);
    } catch { if (version === loadVersion.current) addLog('APIに接続できませんでした。DockerのAPIコンテナを確認してください。'); }
  };
  useEffect(() => { loadData(); }, []);
  const saveWorkout = async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const tags = form.get('tags').split(',').map(tag => tag.trim()).filter(Boolean);
    const workout = { id: crypto.randomUUID(), name: form.get('name'), exercise: form.get('exercise'), category: form.get('category').trim(), tags, weight: form.get('weight'), reps: form.get('reps'), date: form.get('date') };
    try { await api.post('/workouts', workout); await loadData(); addLog(`ワークアウトを登録: ${workout.name}（${workout.exercise}）`); setModal(null); } catch (error) { addLog(error.message); }
  };
  const savePlan = async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const plan = { id: crypto.randomUUID(), day: Number(form.get('day')), title: form.get('title') };
    try { await api.post('/training-plans', plan); await loadData(); addLog(`週間予定を登録: ${plan.title}`); setModal(null); } catch (error) { addLog(error.message); }
  };
  const saveMetric = async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const metric = { id: crypto.randomUUID(), weight: form.get('weight'), date: form.get('date') };
    try { await api.post('/body-metrics', metric); await loadData(); addLog(`体重を登録: ${metric.weight} kg`); setModal(null); } catch (error) { addLog(error.message); }
  };
  const saveEvent = async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const endInput = form.get('end'); const endDate = endInput ? new Date(`${endInput}T00:00:00`) : null; if (endDate) endDate.setDate(endDate.getDate() + 1);
    const calendarEvent = { id: crypto.randomUUID(), title: form.get('title'), start: form.get('start'), end: endDate ? toLocalDate(endDate) : null };
    try { await api.post('/schedule-events', calendarEvent); await loadData(); addLog(`期間指定予定を登録: ${calendarEvent.title}`); setModal(null); } catch (error) { addLog(error.message); }
  };
  const saveVideo = async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const url = form.get('url').trim();
    const video = { id: crypto.randomUUID(), title: form.get('title'), category: form.get('category'), url, thumbnail: youtubeThumbnail(url) };
    try { await api.post('/reference-videos', video); await loadData(); addLog(`参考動画を登録: ${video.title}`); setModal(null); } catch (error) { addLog(error.message); }
  };
  const updatePlan = async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const plan = { day: Number(form.get('day')), title: form.get('title') }; try { await api.put(`/training-plans/${selectedSchedule.item.id}`, plan); await loadData(); addLog(`毎週の予定を更新: ${plan.title}`); setSelectedSchedule(null); } catch (error) { addLog(error.message); } };
  const updateEvent = async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const end = form.get('end'); const endDate = end ? new Date(`${end}T00:00:00`) : null; if (endDate) endDate.setDate(endDate.getDate() + 1); const item = { title: form.get('title'), start: form.get('start'), end: endDate ? toLocalDate(endDate) : null }; try { await api.put(`/schedule-events/${selectedSchedule.item.id}`, item); await loadData(); addLog(`期間指定予定を更新: ${item.title}`); setSelectedSchedule(null); } catch (error) { addLog(error.message); } };
  const deleteSchedule = async () => { if (!window.confirm(`「${selectedSchedule.item.title}」を削除しますか？`)) return; const path = selectedSchedule.type === 'plan' ? `/training-plans/${selectedSchedule.item.id}` : `/schedule-events/${selectedSchedule.item.id}`; try { await api.delete(path); await loadData(); addLog(`${selectedSchedule.type === 'plan' ? '毎週の予定' : '期間指定予定'}を削除: ${selectedSchedule.item.title}`); setSelectedSchedule(null); } catch (error) { addLog(error.message); } };
  const open = (type, value) => { if (type === 'plan' && Number.isInteger(value)) setPlanDay(value); if (type === 'event') setEventDate(typeof value === 'string' ? value : null); setModal(type); };
  const suggestions = { names: [...new Set(workouts.map(item => item.name))], exercises: [...new Set(workouts.map(item => item.exercise))], categories: [...new Set(workouts.map(item => item.category).filter(Boolean))], tags: [...new Set(workouts.flatMap(item => item.tags || []))] };
  const pages = { ホーム: <Dashboard workouts={workouts} plans={plans} metrics={metrics} logs={logs} onStartWorkout={() => open('workout')} onAddPlan={() => open('plan')} onAddMetric={() => open('metric')}/>, 記録: <Workouts workouts={workouts} onAdd={() => open('workout')}/>, 予定: <Calendar plans={plans} calendarEvents={calendarEvents} onAdd={day => open('plan', day)} onAddOneTime={date => open('event', date)} onSelectPlan={item => setSelectedSchedule({ type: 'plan', item })} onSelectEvent={item => setSelectedSchedule({ type: 'event', item })}/>, 動画: <Videos videos={videos} onAdd={() => open('video')}/>, 進捗: <Progress workouts={workouts} metrics={metrics}/> };

  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="#home"><span className="brand-mark">M</span><span>MVM</span></a><nav>{navItems.map(([icon, name]) => <button key={name} className={`nav-link ${activePage === name ? 'active' : ''}`} onClick={() => setActivePage(name)}><b className="nav-glyph">{icon}</b><span>{name}</span></button>)}</nav></aside>
    <main><div className="desktop-page-label">{pageTitles[activePage]}</div>{pages[activePage]}</main>
    {modal && <Modal type={modal} planDay={planDay} eventDate={eventDate} suggestions={suggestions} onClose={() => setModal(null)} onSubmit={modal === 'workout' ? saveWorkout : modal === 'plan' ? savePlan : modal === 'event' ? saveEvent : modal === 'video' ? saveVideo : saveMetric}/>}
    {selectedSchedule && <ScheduleDetail selected={selectedSchedule} onClose={() => setSelectedSchedule(null)} onSubmit={selectedSchedule.type === 'plan' ? updatePlan : updateEvent} onDelete={deleteSchedule}/>} 
  </div>;
}

function ScheduleDetail({ selected, onClose, onSubmit, onDelete }) {
  const plan = selected.item; const isPlan = selected.type === 'plan';
  const displayEnd = plan.end ? toLocalDate(new Date(new Date(`${plan.end}T00:00:00`).getTime() - 86400000)) : '';
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" onClick={onClose}>×</button><p className="eyebrow">{isPlan ? 'WEEKLY ROUTINE' : 'DATE EVENT'}</p><h2>{isPlan ? '毎週の予定を編集' : '期間指定予定を編集'}</h2>{isPlan ? <><label>曜日<select name="day" defaultValue={plan.day}><option value="0">日曜日</option><option value="1">月曜日</option><option value="2">火曜日</option><option value="3">水曜日</option><option value="4">木曜日</option><option value="5">金曜日</option><option value="6">土曜日</option></select></label><label>メニュー名<input name="title" defaultValue={plan.title} required/></label></> : <><label>予定名<input name="title" defaultValue={plan.title} required/></label><div className="input-grid"><label>開始日<input name="start" type="date" defaultValue={plan.start} required/></label><label>終了日<input name="end" type="date" defaultValue={displayEnd}/></label></div></>}<div className="detail-actions"><button type="button" onClick={onDelete}>削除</button><button className="primary-button">変更を保存する →</button></div></form></div>;
}

function Modal({ type, planDay, eventDate, suggestions, onClose, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const labels = { workout: ['NEW WORKOUT', 'ワークアウトを記録'], plan: ['WEEKLY ROUTINE', '毎週の予定を追加'], event: ['DATE EVENT', '期間指定の予定を追加'], video: ['REFERENCE VIDEO', '参考動画を保存'], metric: ['BODY METRIC', '体重を記録'] }[type];
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" onClick={onClose}>×</button><p className="eyebrow">{labels[0]}</p><h2>{labels[1]}</h2>{type === 'workout' && <><datalist id="workout-names">{suggestions.names.map(item => <option value={item} key={item}/>)}</datalist><datalist id="exercise-names">{suggestions.exercises.map(item => <option value={item} key={item}/>)}</datalist><datalist id="category-names">{suggestions.categories.map(item => <option value={item} key={item}/>)}</datalist><datalist id="tag-names">{suggestions.tags.map(item => <option value={item} key={item}/>)}</datalist><label>ワークアウト名<input name="name" list="workout-names" placeholder="例: Push Day" required autoFocus/></label><label>種目<input name="exercise" list="exercise-names" placeholder="例: ベンチプレス" required/></label><label>カテゴリ（任意）<input name="category" list="category-names" placeholder="例: Push / Pull / Legs"/></label><label>ラベル（任意）<input name="tags" list="tag-names" placeholder="例: 胸, 三頭, フリーウェイト（カンマ区切り）"/></label><div className="input-grid"><label>重量 (kg)<input name="weight" type="number" min="0" step="0.5" required/></label><label>回数<input name="reps" type="number" min="1" required/></label></div><label>日付<input name="date" type="date" defaultValue={today} required/></label></>}{type === 'plan' && <><label>曜日<select name="day" defaultValue={planDay}><option value="0">日曜日</option><option value="1">月曜日</option><option value="2">火曜日</option><option value="3">水曜日</option><option value="4">木曜日</option><option value="5">金曜日</option><option value="6">土曜日</option></select></label><label>メニュー名<input name="title" placeholder="例: 胸・三頭" required autoFocus/></label></>}{type === 'event' && <><label>予定名<input name="title" placeholder="例: 連続トレーニング週間" required autoFocus/></label><div className="input-grid"><label>開始日<input name="start" type="date" defaultValue={eventDate || today} required/></label><label>終了日<input name="end" type="date" defaultValue={eventDate || ''}/></label></div></>}{type === 'video' && <><label>動画タイトル<input name="title" placeholder="例: ベンチプレスのフォーム解説" required autoFocus/></label><label>YouTube URL<input name="url" type="url" placeholder="https://www.youtube.com/watch?v=..." required/></label><label>カテゴリ（任意）<input name="category" placeholder="例: 胸・三頭"/></label></>}{type === 'metric' && <><label>体重 (kg)<input name="weight" type="number" min="0" step="0.1" required autoFocus/></label><label>記録日<input name="date" type="date" defaultValue={today} required/></label></>}<button className="primary-button">登録する <span>→</span></button></form></div>;
}

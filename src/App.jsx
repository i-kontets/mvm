import { useState } from 'react';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import Workouts from './pages/Workouts/Workouts.jsx';
import Calendar from './pages/Calendar/Calendar.jsx';
import Progress from './pages/Progress/Progress.jsx';

const navItems = [['▦', 'ホーム'], ['⌁', '記録'], ['□', '予定'], ['↗', '進捗']];
const pageTitles = { ホーム: 'ホーム', 記録: '記録', 予定: '予定', 進捗: '進捗' };
const toLocalDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const thisMonday = () => { const date = new Date(); date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); return date; };
const sampleMonday = thisMonday();
const sampleThursday = new Date(sampleMonday); sampleThursday.setDate(sampleThursday.getDate() + 3);
const samplePlans = [{ id: 'sample-recurring', day: 2, title: '胸・三頭' }];
const sampleEvents = [{ id: 'sample-week', title: '連続トレーニング週間', start: toLocalDate(sampleMonday), end: toLocalDate(sampleThursday) }];

export default function App() {
  const [activePage, setActivePage] = useState('ホーム');
  const [modal, setModal] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [plans, setPlans] = useState(samplePlans);
  const [calendarEvents, setCalendarEvents] = useState(sampleEvents);
  const [metrics, setMetrics] = useState([]);
  const [logs, setLogs] = useState([]);
  const [planDay, setPlanDay] = useState(1);

  const addLog = message => {
    const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const entry = { id: crypto.randomUUID(), time, message };
    setLogs(current => [entry, ...current]);
    console.info('[MVM Activity Log]', entry);
  };
  const saveWorkout = event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const workout = { id: crypto.randomUUID(), name: form.get('name'), exercise: form.get('exercise'), weight: form.get('weight'), reps: form.get('reps'), date: form.get('date') };
    setWorkouts(current => [workout, ...current]); addLog(`ワークアウトを登録: ${workout.name}（${workout.exercise}）`); setModal(null);
  };
  const savePlan = event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const plan = { id: crypto.randomUUID(), day: Number(form.get('day')), title: form.get('title') };
    setPlans(current => [...current, plan].sort((a, b) => a.day - b.day)); addLog(`週間予定を登録: ${plan.title}`); setModal(null);
  };
  const saveMetric = event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const metric = { id: crypto.randomUUID(), weight: form.get('weight'), date: form.get('date') };
    setMetrics(current => [metric, ...current]); addLog(`体重を登録: ${metric.weight} kg`); setModal(null);
  };
  const saveEvent = event => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const calendarEvent = { id: crypto.randomUUID(), title: form.get('title'), start: form.get('start'), end: form.get('end') || null };
    setCalendarEvents(current => [...current, calendarEvent]); addLog(`期間指定予定を登録: ${calendarEvent.title}`); setModal(null);
  };
  const open = (type, day) => { if (type === 'plan' && Number.isInteger(day)) setPlanDay(day); setModal(type); };
  const pages = { ホーム: <Dashboard workouts={workouts} plans={plans} metrics={metrics} logs={logs} onStartWorkout={() => open('workout')} onAddPlan={() => open('plan')} onAddMetric={() => open('metric')}/>, 記録: <Workouts workouts={workouts} onAdd={() => open('workout')}/>, 予定: <Calendar plans={plans} calendarEvents={calendarEvents} onAdd={day => open('plan', day)} onAddOneTime={() => open('event')}/>, 進捗: <Progress workouts={workouts} metrics={metrics}/> };

  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="#home"><span className="brand-mark">M</span><span>MVM</span></a><nav>{navItems.map(([icon, name]) => <button key={name} className={`nav-link ${activePage === name ? 'active' : ''}`} onClick={() => setActivePage(name)}><b className="nav-glyph">{icon}</b><span>{name}</span></button>)}</nav></aside>
    <main><div className="desktop-page-label">{pageTitles[activePage]}</div>{pages[activePage]}</main>
    {modal && <Modal type={modal} planDay={planDay} onClose={() => setModal(null)} onSubmit={modal === 'workout' ? saveWorkout : modal === 'plan' ? savePlan : modal === 'event' ? saveEvent : saveMetric}/>} 
  </div>;
}

function Modal({ type, planDay, onClose, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const labels = { workout: ['NEW WORKOUT', 'ワークアウトを記録'], plan: ['WEEKLY ROUTINE', '毎週の予定を追加'], event: ['DATE EVENT', '期間指定の予定を追加'], metric: ['BODY METRIC', '体重を記録'] }[type];
  return <div className="modal-backdrop" onMouseDown={onClose}><form className="modal" onSubmit={onSubmit} onMouseDown={event => event.stopPropagation()}><button className="dialog-close" type="button" onClick={onClose}>×</button><p className="eyebrow">{labels[0]}</p><h2>{labels[1]}</h2>{type === 'workout' && <><label>ワークアウト名<input name="name" placeholder="例: Push Day" required autoFocus/></label><label>種目<input name="exercise" placeholder="例: ベンチプレス" required/></label><div className="input-grid"><label>重量 (kg)<input name="weight" type="number" min="0" step="0.5" required/></label><label>回数<input name="reps" type="number" min="1" required/></label></div><label>日付<input name="date" type="date" defaultValue={today} required/></label></>}{type === 'plan' && <><label>曜日<select name="day" defaultValue={planDay}><option value="0">日曜日</option><option value="1">月曜日</option><option value="2">火曜日</option><option value="3">水曜日</option><option value="4">木曜日</option><option value="5">金曜日</option><option value="6">土曜日</option></select></label><label>メニュー名<input name="title" placeholder="例: 胸・三頭" required autoFocus/></label></>}{type === 'event' && <><label>予定名<input name="title" placeholder="例: 連続トレーニング週間" required autoFocus/></label><div className="input-grid"><label>開始日<input name="start" type="date" defaultValue={today} required/></label><label>終了日<input name="end" type="date"/></label></div></>}{type === 'metric' && <><label>体重 (kg)<input name="weight" type="number" min="0" step="0.1" required autoFocus/></label><label>記録日<input name="date" type="date" defaultValue={today} required/></label></>}<button className="primary-button">登録する <span>→</span></button></form></div>;
}

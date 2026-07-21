import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import styles from './Calendar.module.css';
import './Calendar.extra.css';
import todayStyles from './CalendarToday.module.css';
import actionStyles from './CalendarActions.module.css';

export default function Calendar({ plans, calendarEvents, onAdd, onAddOneTime, onSelectPlan, onSelectEvent }) {
  const recurringEvents = plans.map(plan => ({ id: `plan-${plan.id}`, title: `↻ ${plan.title}`, daysOfWeek: [plan.day], extendedProps: { source: 'plan', item: plan }, classNames: ['training-event'] }));
  const oneTimeEvents = calendarEvents.map(event => ({ ...event, id: `event-${event.id}`, allDay: true, extendedProps: { source: 'event', item: event }, classNames: ['one-time-event'] }));
  const events = [...recurringEvents, ...oneTimeEvents];
  const now = new Date(); const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayPlans = [...plans.filter(plan => plan.day === now.getDay()).map(plan => ({ id: `plan-${plan.id}`, title: plan.title, kind: '毎週' })), ...calendarEvents.filter(event => event.start <= today && (!event.end || event.end > today)).map(event => ({ id: `event-${event.id}`, title: event.title, kind: '期間' }))];
  return <section className={styles.page}>
    <header><p>WEEKLY ROUTINE</p><h1>予定</h1><span>日付をタップして、その日の予定を追加できます。</span></header>
    <section className={todayStyles.today}><div className={todayStyles.todayHead}><p>TODAY'S PLAN</p><span>{now.getMonth() + 1}月{now.getDate()}日</span></div>{todayPlans.length === 0 ? <p className={todayStyles.empty}>今日は登録された予定がありません。</p> : <div className={todayStyles.todayList}>{todayPlans.map(plan => <div className={todayStyles.todayItem} key={plan.id}><b>{plan.kind}</b><span>{plan.title}</span></div>)}</div>}</section>
    <div className={styles.calendarWrap}><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" locale={jaLocale} firstDay={1} height="auto" fixedWeekCount={false} dayMaxEvents={2} events={events} dateClick={info => onAddOneTime(info.dateStr)} eventClick={info => { info.jsEvent.preventDefault(); const { source, item } = info.event.extendedProps; source === 'plan' ? onSelectPlan(item) : onSelectEvent(item); }} buttonText={{ today: '今日' }} headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}/></div>
    <section className={styles.routine}><div><p>WEEKLY ROUTINE</p><h2>繰り返し予定</h2></div><div className={actionStyles.actions}><button onClick={() => onAdd()}>＋ 毎週の予定</button><button className={actionStyles.period} onClick={() => onAddOneTime()}>＋ 期間指定</button></div></section>
    <div className={styles.week}>{plans.map(plan => <button className={`${styles.day} calendar-day-button`} key={plan.id} onClick={() => onSelectPlan(plan)}><span>{['日','月','火','水','木','金','土'][plan.day]}曜日</span><b>{plan.title}</b><small>毎週</small></button>)}</div>
  </section>;
}

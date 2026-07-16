import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import styles from './Calendar.module.css';
import './Calendar.extra.css';

export default function Calendar({ plans, calendarEvents, onAdd, onAddOneTime }) {
  const recurringEvents = plans.map(plan => ({ id: plan.id, title: `↻ ${plan.title}`, daysOfWeek: [plan.day], classNames: ['training-event'] }));
  const oneTimeEvents = calendarEvents.map(event => ({ ...event, allDay: true, classNames: ['one-time-event'] }));
  const events = [...recurringEvents, ...oneTimeEvents];
  return <section className={styles.page}>
    <header><p>WEEKLY ROUTINE</p><h1>予定</h1><span>日付をタップして予定を追加できます。</span></header>
    <div className={styles.calendarWrap}><FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" locale={jaLocale} firstDay={1} height="auto" fixedWeekCount={false} dayMaxEvents={2} events={events} dateClick={info => onAdd(new Date(info.dateStr).getDay())} eventClick={info => info.jsEvent.preventDefault()} buttonText={{ today: '今日' }} headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}/></div>
    <section className={styles.routine}><div><p>WEEKLY ROUTINE</p><h2>繰り返し予定</h2></div><button onClick={() => onAdd()}>＋ 毎週の予定</button></section>
    <div className={styles.actionRow}><button onClick={onAddOneTime}>＋ 期間指定の予定</button><span>例: 今週の月曜〜水曜</span></div>
    <div className={styles.week}>{plans.map(plan => <article className={styles.day} key={plan.id}><span>{['日','月','火','水','木','金','土'][plan.day]}曜日</span><b>{plan.title}</b><small>毎週</small></article>)}</div>
  </section>;
}

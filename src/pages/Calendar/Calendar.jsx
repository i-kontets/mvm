import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import styles from './Calendar.module.css';
import './Calendar.extra.css';
import todayStyles from './CalendarToday.module.css';
import actionStyles from './CalendarActions.module.css';

const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

// DBの週間予定・期間予定を、FullCalendarが理解できるイベント形式に変換して表示する。
export default function Calendar({
  plans,
  calendarEvents,
  onAdd,
  onAddOneTime,
  onSelectPlan,
  onSelectEvent,
}) {
  //期間指定は単発、指定なしは折り返し

  // 繰り返しイベント
  const recurringEvents = plans.map(plan => ({
    id: `plan-${plan.id}`,
    title: `↻ ${plan.title}`,
    daysOfWeek: [plan.day],
    extendedProps: { source: 'plan', item: plan },
    classNames: ['training-event'],
  }));
  // 単発イベント
  const oneTimeEvents = calendarEvents.map(event => ({
    ...event,
    id: `event-${event.id}`,
    allDay: true,
    extendedProps: { source: 'event', item: event },
    classNames: ['one-time-event'],
  }));
  const events = [...recurringEvents, ...oneTimeEvents];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  // カレンダーだけでなく、今日やる予定を先に確認できるよう抽出する。
  const todayPlans = [
    ...plans
      .filter(plan => plan.day === now.getDay())
      .map(plan => ({ id: `plan-${plan.id}`, title: plan.title, kind: '毎週' })),
    ...calendarEvents
      .filter(event => event.start <= today && (!event.end || event.end > today))
      .map(event => ({ id: `event-${event.id}`, title: event.title, kind: '期間' })),
  ];

  return (
    <section className={styles.page}>
      <header>
        <h1>予定</h1>
        <span>日付をタップして、その日の予定を追加できます。</span>
      </header>

      <section className={todayStyles.today}>
        <div className={todayStyles.todayHead}>
          <p>今日の予定</p>
          <span>{now.getMonth() + 1}月{now.getDate()}日</span>
        </div>
        {todayPlans.length === 0 ? (
          <p className={todayStyles.empty}>今日は登録された予定がありません。</p>
        ) : (
          <div className={todayStyles.todayList}>
            {todayPlans.map(plan => (
              <div className={todayStyles.todayItem} key={plan.id}>
                <b>{plan.kind}</b>
                <span>{plan.title}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={styles.calendarWrap}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          firstDay={1}
          height="auto"
          fixedWeekCount={false}
          dayMaxEvents={2}
          events={events}
          // 空白の日付タップは、選んだ日付を初期値にして期間指定予定を開く。
          dateClick={info => onAddOneTime(info.dateStr)}
          // 予定タップは種類ごとに編集モーダルへ
          eventClick={info => {
            info.jsEvent.preventDefault();
            const { source, item } = info.event.extendedProps;
            source === 'plan' ? onSelectPlan(item) : onSelectEvent(item);
          }}
          buttonText={{ today: '今日' }}
          headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
        />
      </div>

      <section className={styles.routine}>
        <div>
          <h2>繰り返し予定</h2>
        </div>
        <div className={actionStyles.actions}>
          <button onClick={() => onAdd()}>＋ 毎週の予定</button>
          <button className={actionStyles.period} onClick={() => onAddOneTime()}>＋ 期間指定</button>
        </div>
      </section>

      <div className={styles.week}>
        {plans.map(plan => (
          <button
            className={`${styles.day} calendar-day-button`}
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
          >
            <span>{weekdays[plan.day]}曜日</span>
            <b>{plan.title}</b>
            <small>毎週</small>
          </button>
        ))}
      </div>
    </section>
  );
}

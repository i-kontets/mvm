import './style.css';

const icon = (name, size = 20) => {
  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    dumbbell: '<path d="M6 6v12M18 6v12M4 9v6M20 9v6M6 12h12"/><path d="M2 10v4M22 10v4"/>',
    chart: '<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20.3h-3v-.08A1.7 1.7 0 0 0 10.66 18.66a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.56-1.04h-.08v-3h.08A1.7 1.7 0 0 0 7 9.92a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56v-.08h3v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.04h.08v3h-.08A1.7 1.7 0 0 0 19.4 15Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/>',
    more: '<circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#"><span class="brand-mark">M</span><span>MVM</span></a>
      <nav>
        <a class="nav-link active" href="#dashboard">${icon('grid')}<span>ダッシュボード</span></a>
        <a class="nav-link" href="#workouts">${icon('dumbbell')}<span>ワークアウト</span></a>
        <a class="nav-link" href="#progress">${icon('chart')}<span>進捗</span></a>
        <a class="nav-link" href="#calendar">${icon('calendar')}<span>カレンダー</span></a>
      </nav>
      <div class="sidebar-bottom">
        <a class="nav-link" href="#settings">${icon('settings')}<span>設定</span></a>
        <div class="profile"><div class="avatar">HY</div><div><strong>Hiroki Y.</strong><small>Free plan</small></div><button aria-label="プロフィールメニュー">${icon('more', 18)}</button></div>
      </div>
    </aside>
    <main>
      <header class="topbar">
        <div><p class="eyebrow">WEDNESDAY, JUL 16</p><h1>おかえりなさい、Hiroki <span>👋</span></h1></div>
        <button class="outline-button">${icon('calendar', 18)}<span>今週</span></button>
      </header>
      <section class="hero" id="dashboard">
        <div class="hero-text"><div class="spark">${icon('bolt', 16)} <span>WEEKLY GOAL</span></div><h2>今週の勢いを<br>そのまま力に。</h2><p>あと1回のワークアウトで、今週の目標を達成できます。</p><button class="primary-button" id="start-workout">ワークアウトを始める ${icon('arrow', 18)}</button></div>
        <div class="progress-circle"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="51"/><circle class="progress" cx="60" cy="60" r="51"/></svg><div><strong>3<span>/4</span></strong><small>WORKOUTS</small></div></div>
        <div class="hero-orb orb-one"></div><div class="hero-orb orb-two"></div>
      </section>
      <section class="stats-grid">
        <article class="stat-card"><div class="stat-label"><span>今月の総ボリューム</span><span class="trend good">↗ 12.4%</span></div><strong>46,820 <small>kg</small></strong><div class="bar-chart"><i style="height:35%"></i><i style="height:55%"></i><i style="height:43%"></i><i style="height:71%"></i><i style="height:62%"></i><i style="height:88%"></i><i style="height:76%"></i></div><div class="chart-days"><span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span><span>日</span></div></article>
        <article class="stat-card"><div class="stat-label"><span>現在の体重</span><button class="mini-button" id="metric-button">記録する</button></div><strong>68.4 <small>kg</small></strong><div class="weight-row"><span class="trend good">↓ 0.6 kg</span><small>先週比</small></div><svg class="line-chart" viewBox="0 0 270 75" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9bff5c" stop-opacity=".26"/><stop offset="1" stop-color="#9bff5c" stop-opacity="0"/></linearGradient></defs><path d="M0 53 C21 48,24 55,44 46 S68 42,85 47 S108 36,124 40 S146 45,160 32 S186 37,202 24 S232 29,270 9 L270 75 L0 75Z" fill="url(#fill)"/><path d="M0 53 C21 48,24 55,44 46 S68 42,85 47 S108 36,124 40 S146 45,160 32 S186 37,202 24 S232 29,270 9" fill="none" stroke="#9bff5c" stroke-width="2.5"/></svg></article>
        <article class="streak-card"><div class="stat-label"><span>継続日数</span>${icon('bolt', 19)}</div><strong>12 <small>days</small></strong><p>最高記録まであと <b>5日</b> 🔥</p><div class="streak-dots"><i></i><i></i><i></i><i></i><i></i><i></i><i class="empty"></i></div></article>
      </section>
      <section class="content-grid">
        <article class="panel workout-panel" id="workouts"><div class="section-heading"><div><p class="eyebrow">RECENT ACTIVITY</p><h3>最近のワークアウト</h3></div><a href="#workouts">すべて見る ${icon('chevron', 16)}</a></div><div class="workout-list">
          <div class="workout-item"><div class="workout-icon orange">${icon('dumbbell', 20)}</div><div class="workout-name"><strong>Push Day</strong><span>ベンチプレス、ショルダープレス 他</span></div><div class="workout-meta"><strong>8,240 kg</strong><span>今日 18:30</span></div><button class="icon-button">${icon('chevron', 18)}</button></div>
          <div class="workout-item"><div class="workout-icon purple">${icon('dumbbell', 20)}</div><div class="workout-name"><strong>Pull Day</strong><span>デッドリフト、ラットプルダウン 他</span></div><div class="workout-meta"><strong>12,580 kg</strong><span>7月14日</span></div><button class="icon-button">${icon('chevron', 18)}</button></div>
          <div class="workout-item"><div class="workout-icon blue">${icon('dumbbell', 20)}</div><div class="workout-name"><strong>Leg Day</strong><span>スクワット、レッグプレス 他</span></div><div class="workout-meta"><strong>15,120 kg</strong><span>7月12日</span></div><button class="icon-button">${icon('chevron', 18)}</button></div>
        </div></article>
        <article class="panel muscle-panel"><div class="section-heading"><div><p class="eyebrow">THIS WEEK</p><h3>部位ごとのボリューム</h3></div><button class="icon-button">${icon('more', 18)}</button></div><div class="muscle-list"><div><span>胸</span><div class="meter"><i style="width:82%"></i></div><b>8,240</b></div><div><span>背中</span><div class="meter"><i style="width:68%"></i></div><b>6,820</b></div><div><span>脚</span><div class="meter"><i style="width:91%"></i></div><b>9,760</b></div><div><span>肩</span><div class="meter"><i style="width:43%"></i></div><b>3,120</b></div></div><p class="muted">単位: kg</p></article>
      </section>
    </main>
  </div>
  <dialog id="workout-dialog"><form method="dialog"><button class="dialog-close" value="cancel">×</button><p class="eyebrow">NEW WORKOUT</p><h2>今日のワークアウト</h2><label>ワークアウト名<input value="Push Day" /></label><label>日付<input type="date" value="2026-07-16" /></label><button class="primary-button" value="default">記録を開始する ${icon('arrow', 18)}</button></form></dialog>
  <dialog id="metric-dialog"><form method="dialog"><button class="dialog-close" value="cancel">×</button><p class="eyebrow">BODY METRICS</p><h2>身体指標を記録</h2><label>体重 (kg)<input type="number" value="68.4" step="0.1" /></label><label>腕周り (cm)<input type="number" value="34.2" step="0.1" /></label><button class="primary-button" value="default">保存する ${icon('arrow', 18)}</button></form></dialog>`;

document.querySelector('#start-workout').addEventListener('click', () => document.querySelector('#workout-dialog').showModal());
document.querySelector('#metric-button').addEventListener('click', () => document.querySelector('#metric-dialog').showModal());
document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => { document.querySelector('.nav-link.active')?.classList.remove('active'); link.classList.add('active'); }));

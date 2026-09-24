// UTC変換による日付ずれを避けるため、画面表示用はローカル日付で整形する。
export const toLocalDate = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// date入力の初期値用。表示上の今日をYYYY-MM-DDで返す。
export const todayString = () => new Date().toISOString().slice(0, 10);

// カレンダーの週始まり（月曜）を求め、サンプル予定の基準日に使う。
export const thisMonday = () => {
  const date = new Date();
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
};

// FullCalendarの終了日変換に使う、日付を1日戻す処理。
export const subtractOneDay = dateString => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return toLocalDate(date);
};

// FullCalendarの終了日変換に使う、日付を1日進める処理。
export const addOneDay = dateString => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return toLocalDate(date);
};

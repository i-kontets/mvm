export const toLocalDate = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const todayString = () => new Date().toISOString().slice(0, 10);

export const thisMonday = () => {
  const date = new Date();
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
};

export const subtractOneDay = dateString => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);
  return toLocalDate(date);
};

export const addOneDay = dateString => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + 1);
  return toLocalDate(date);
};

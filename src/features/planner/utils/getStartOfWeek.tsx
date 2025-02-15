export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const offset = (day + 6) % 7;
  newDate.setDate(newDate.getDate() - offset);
  return newDate;
};

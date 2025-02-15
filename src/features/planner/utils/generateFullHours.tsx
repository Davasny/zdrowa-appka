export function generateFullHours(): string[] {
  const startHour = 7;
  const endHour = 23;
  const hours: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    // Format the hour to always have two digits (e.g., "07:00")
    const formattedHour = hour.toString().padStart(2, "0") + ":00";
    hours.push(formattedHour);
  }

  return hours;
}

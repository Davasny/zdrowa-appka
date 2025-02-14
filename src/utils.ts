import { DateString } from "./zdrofit/types/common";

export function getNextWeekMWF(): {
  monday: Date;
  wednesday: Date;
  friday: Date;
} {
  const today = new Date();
  const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, … Saturday = 6

  // Calculate how many days to add to get to next week's Monday.
  // If today is Sunday (0), we want Monday to be tomorrow (diff = 1).
  // Otherwise, we add (8 - dayOfWeek) days.
  const diffToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

  // Get next Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  // Next Wednesday is 2 days after Monday
  const wednesday = new Date(monday);
  wednesday.setDate(monday.getDate() + 2);

  // Next Friday is 4 days after Monday
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return { monday, wednesday, friday };
}

export function convertDateToString(date: Date): DateString {
  return date.toISOString().split("T")[0] as DateString;
}

export function getNextWeekMFSStrings(): {
  monday: DateString;
  wednesday: DateString;
  friday: DateString;
} {
  const { monday, wednesday, friday } = getNextWeekMWF();

  return {
    monday: convertDateToString(monday),
    wednesday: convertDateToString(wednesday),
    friday: convertDateToString(friday),
  };
}

export function getNthNextDay(n: number): Date {
  const now = new Date();
  const result = new Date(now.getTime());
  result.setDate(result.getDate() + n);
  return result;
}

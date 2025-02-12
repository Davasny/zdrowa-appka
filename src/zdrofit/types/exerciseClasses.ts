import { Club } from "./clubs";
import { DateString, HourString } from "./common";
import { ClassType } from "./classTypes";
import { Instructor } from "./instructors";
import { Category } from "./categories";
import { Card } from "./cards";

type DurationTimes = 15 | 20 | 50 | 55 | 60 | 90;

export interface ExerciseClass {
  location: Club["id"];
  id: number;
  duration: `${DurationTimes} min` | string;
  date: DateString;
  classType: ClassType["id"];
  start_time: HourString;
  coach: Instructor["id"];
  category: Category["id"];
  room: string;
}

type ExerciseClassState =
  | "to_be_standby"
  | "to_be_booked"
  | "to_be_notify"
  | "booked"
  | string;

export interface ExerciseClassesResponse {
  fav_instructors: Array<Instructor["id"]>;
  fav_class_types: Array<ClassType["id"]>;
  fav_clubs: Array<Club["id"]>;

  data: Record<HourString, Array<ExerciseClass>>;
  state: Record<ExerciseClass["id"], ExerciseClassState>;

  calendar_ids: object;

  order: Array<HourString>;
}

export interface ExerciseClassesPayload {
  instructors: Array<Instructor["id"]>;
  clubs: Array<Club["id"]>;
  class_types: Array<ClassType["id"]>;
  class_categories: Array<Category["id"]>;
  /**
   * Not sure about partner_cards, in my case it was always empty array
   * */
  partner_cards: unknown;
  class_tags: null | unknown;
  time_ranges: Array<unknown>;
  search_date: DateString;
}

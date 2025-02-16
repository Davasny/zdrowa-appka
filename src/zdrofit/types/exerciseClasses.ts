import { Club } from "./clubs";
import { DateString, HourString } from "./common";
import { ClassType } from "./classTypes";
import { Instructor } from "./instructors";
import { Category } from "./categories";

type DurationTimes = 15 | 20 | 50 | 55 | 60 | 90;

export interface ExerciseClassApi {
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

export type ExerciseClassSimple = ExerciseClassApi & {
  dateObject: Date;
  state: ExerciseClassState;
};

export type ExerciseClassFull = ExerciseClassSimple & {
  classTypeObject: ClassType | null;
  coachObject: Instructor | null;
  categoryObject: Category | null;
  clubObject: Club | null;
};

type ExerciseClassState = keyof typeof ExerciseClassStateEnum;

export enum ExerciseClassStateEnum {
  to_be_standby = "Zapisz się na listę rezerwową",
  standby = "Na liście rezerwowej",
  to_be_booked = "Zapisz się",
  booked = "Zapisany",
  to_be_notify = "Powiadom mnie",
  notify = "Powiadomiono",
}

export interface ExerciseClassesResponse {
  fav_instructors: Array<Instructor["id"]>;
  fav_class_types: Array<ClassType["id"]>;
  fav_clubs: Array<Club["id"]>;

  data: Record<HourString, Array<ExerciseClassApi>>;
  state: Record<ExerciseClassApi["id"], ExerciseClassState>;

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

export interface BookOrCancelExerciseClassPayload {
  search_classes: {
    instructors: [];
    clubs: [];
    class_types: [];
    class_categories: [];
    partner_cards: [];
    class_tags: null;
    time_ranges: [];
    search_date: DateString;
  };
}

export type BookExerciseClassPayload = BookOrCancelExerciseClassPayload & {
  book_class: {
    classId: string;
    /**
     * Not sure what is this, it was always false in my case
     * */
    reserve: false;
  };
};

export type CancelExerciseClassPayload = BookOrCancelExerciseClassPayload & {
  book_cancel_class: {
    classId: string;
  };
};

export interface BookExerciseClassResponse {
  search_classes: ExerciseClassesResponse;
  book_class: {
    // todo: catch more statuses
    message: "success";
    status: "booked";
  };
}

export interface ExerciseClassDetails {
  id: number;
  location: Club["id"];
  duration: ExerciseClassApi["duration"];
  date: DateString;
  classType: ClassType["id"];
  attendeesCount: number;
  attendeesLimit: number;
  category: Category["id"];
  room: string;
  day_of_week: string;
  start_time: `${number}:${number}`;
  end_time: `${number}:${number}`;
  coach: Instructor["id"];
}

export interface ExerciseClassDetailsResponse {
  fav_instructors: Array<Instructor["id"]>;
  fav_class_types: Array<ClassType["id"]>;
  fav_clubs: Array<Club["id"]>;
  def: ExerciseClassDetails;
  rating: {
    amt: number;
    value: number;
  };
  state: ExerciseClassState;
}

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

export type ExerciseClass = ExerciseClassApi & {
  dateObject: Date;
  state: ExerciseClassState;
};

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

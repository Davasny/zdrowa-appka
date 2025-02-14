import { Instructor } from "./instructors";
import { Club } from "./clubs";

export interface UserHistoryPayload {
  types: Array<"device" | "club">;
  page: number;
}

export interface UserHistoryEntry {
  date: string;
  duration: string;
  id: string;
  name: string;
  type: "club";
  coach: {
    name: string;
    id: Instructor["id"];
    title: string;
  };
  club: {
    name: string;
    id: Club["id"];
  };
  device: "club_activity" | "club_visit";
  additional_values: Array<unknown>;
  has_attended: boolean;
}

export interface UserHistoryResponse {
  pages: number;
  activities: UserHistoryEntry[];
  page: number;
}

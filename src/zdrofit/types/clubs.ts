import { Card } from "./cards";
import { Instructor } from "./instructors";
import { DateString, HourString, Timestamp } from "./common";

interface Location {
  street: string;
  city: "Kraków" | string;
  description: string;
}

interface Functionality {
  name: string;
  description: string;
  id: number;
}

interface Contact {
  receptionEmail: string;
  receptionPhone: string;
  clubManagerName: string;
  clubManagerEmail: string;
  groupManagerName: string;
  groupManagerEmail: string;
}

interface OpeningHours {
  hours: `${HourString}-${HourString}`;
  hourStart: HourString;
  hourEnd: HourString;
}

type WeeklyOpeningHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  string
>;

type DailyOpeningHours = Record<DateString, OpeningHours>;

export interface Club {
  name: string;
  location: Location;
  id: number;
  shortDescription: string;
  cards: Array<Card["id"]>;
  longitude: number;
  latitude: number;
  out_opening_hours: WeeklyOpeningHours;
  addressStreet: string;
  receptionPhone: string;
  addressCity: string;
  instructors: Array<Instructor["id"]>;
  functionalities: Functionality[];
  contact: Contact;
  openingHours: DailyOpeningHours;
  saunaOpeningHours: Record<string, unknown>;
  locationDescription: string;
}

export interface ClubsResponse {
  def: Record<Club["id"], Club>;
  version: Timestamp;
  order: Array<keyof ClubsResponse["def"]>;
}

import { Timestamp } from "./common";

export interface Instructor {
  id: number;
  name: string;
  title: string;
  description: string;
  imagePath: string;
}

export interface InstructorsResponse {
  def: Record<Instructor["id"], Instructor>;
  version: Timestamp;
  order: Array<keyof InstructorsResponse["def"]>;
}

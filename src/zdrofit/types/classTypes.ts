import { Timestamp } from "./common";

interface ClassCategory {
  id: number;
  name: string;
  slug: string;
}

interface ClassLevel {
  id: number;
  name: string;
  slug: string;
}

interface ClassIntensity {
  id: number;
  name: string;
  slug: string;
}

interface ClassTarget {
  id: number;
  name: string;
  slug: string;
}

interface ClassTag {
  id: number;
  name: string;
  slug: string;
}

export interface ClassType {
  id: number;
  name: string;
  audienceText: string;
  description: string;
  effectText: string;
  category: ClassCategory;
  level: ClassLevel;
  intensity: ClassIntensity;
  targets: ClassTarget[];
  tags: ClassTag[];
}

export interface ClassTypesResponse {
  def: Record<ClassType["id"], ClassType>;
  version: Timestamp;
  order: Array<keyof ClassTypesResponse["def"]>;
}

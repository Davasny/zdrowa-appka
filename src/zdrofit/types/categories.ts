import { Timestamp } from "./common";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface CategoriesResponse {
  def: Record<Category["id"], Category>;
  version: Timestamp;
  order: Array<keyof CategoriesResponse["def"]>;
}

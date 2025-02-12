export interface Card {
  /**
   * Only here id is string
   * */
  id: string;
  name: string;
}

export interface CardsResponse {
  def: Record<Card["id"], Card>;
  /**
   * In this case, version is just single digit number
   * */
  version: number;
  order: Array<keyof CardsResponse["def"]>;
}

type Path = string;

export interface PaginationResponse {
  path: "/static/authorized/";
  /**
   * @deprecated
   * def seems to be not used in requests
   * */
  def: {
    clubs: Path[];
    instructors: Path[];
    class_types: Path[];
    categories: Path[];
    cards: Path[];
  };
  /**
   * def_2 seems to be always url relative to path prefixed with "mfp:"
   * e.g. /static/authorized/mfp:1739285137805:dict_clubs_1.json?access_token=
   * */
  def_2: {
    clubs: Path[];
    instructors: Path[];
    class_types: Path[];
    categories: Path[];
    cards: Path[];
  };
  order: Array<keyof PaginationResponse["def_2"]>;
}

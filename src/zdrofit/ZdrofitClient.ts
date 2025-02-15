import wretch, { Wretch } from "wretch";
import { AccessToken, LoginPayload, LoginResponse } from "./types/login";
import { PaginationResponse, Path } from "./types/pagination";
import { Club } from "./types/clubs";
import { Instructor } from "./types/instructors";
import { ClassType } from "./types/classTypes";
import { Category } from "./types/categories";
import {
  BookExerciseClassPayload,
  BookExerciseClassResponse,
  BookOrCancelExerciseClassPayload,
  CancelExerciseClassPayload,
  ExerciseClassApi,
  ExerciseClassDetailsResponse,
  ExerciseClassesPayload,
  ExerciseClassesResponse,
  ExerciseClassFull,
  ExerciseClassSimple,
} from "./types/exerciseClasses";
import { DateString } from "./types/common";
import { UserHistoryPayload, UserHistoryResponse } from "./types/userHistory";

const ZDROFIT_API_URL = "https://appfitness.zdrofit.pl";

const DEVICE_SPECIFIC_HEADERS = {
  "x-device-id": "f0e9c82635357034",
  "x-device-other": "AC2003:Nord",
  "x-language": "en",
  "x-device-os": "android:12",
  "x-app-version": "1.0.1:203",
  "user-agent":
    "com.pl.benefit_systems_mobile.prod/203 (Linux; U; Android 12; en_US; AC2003; Build/RKQ1.211119.001; Cronet/133.0.6876.3)",
};

export class ZdrofitClient {
  private readonly client: Wretch;

  private accessToken: AccessToken;
  private networkId: LoginPayload["network_id"];

  private pages: PaginationResponse["def_2"];
  private pagesPrefix: PaginationResponse["path"];

  private clubs: Map<Club["id"], Club>;
  private instructors: Map<Instructor["id"], Instructor>;
  private classTypes: Map<ClassType["id"], ClassType>;
  private categories: Map<Category["id"], Category>;

  constructor(
    accessToken: AccessToken,
    networkId: LoginPayload["network_id"] = "mfp",
  ) {
    this.accessToken = accessToken;
    this.networkId = networkId;

    this.client = wretch(ZDROFIT_API_URL).headers({
      authorization: `Bearer ${accessToken}`,
      ...DEVICE_SPECIFIC_HEADERS,
    });

    this.pagesPrefix = "/static/authorized/";
    this.pages = {
      clubs: [],
      instructors: [],
      categories: [],
      class_types: [],
      cards: [],
    };

    this.clubs = new Map();
    this.instructors = new Map();
    this.classTypes = new Map();
    this.categories = new Map();
  }

  static async getAccessToken(payload: LoginPayload): Promise<AccessToken> {
    const token = await wretch(ZDROFIT_API_URL)
      .url("/api-service/v2/without_auth/login?parent_view=login")
      .headers(DEVICE_SPECIFIC_HEADERS)
      .post(payload)
      .json<LoginResponse>();

    return token.access_token;
  }

  async getPagination(): Promise<PaginationResponse["def_2"]> {
    const shouldFetch = Object.values(this.pages).some((p) => p.length === 0);

    if (shouldFetch) {
      const response = await this.client
        .url("/api-service/v2/with_auth/dict_pagination?parent_view=home")
        .get()
        .json<PaginationResponse>();

      this.pages = response.def_2;
      this.pagesPrefix = response.path;
    }

    return this.pages;
  }

  async getClubs(): Promise<Club[]> {
    if (this.clubs.size === 0) {
      const data = await this.getPaginatedData<Club>(this.pages.clubs);
      this.clubs = new Map(data.map((c) => [c.id, c]));
    }

    return Array.from(this.clubs.values());
  }

  async getInstructors(): Promise<Instructor[]> {
    if (this.instructors.size === 0) {
      const data = await this.getPaginatedData<Instructor>(
        this.pages.instructors,
      );
      this.instructors = new Map(data.map((i) => [i.id, i]));
    }

    return Array.from(this.instructors.values());
  }

  async getClassTypes(): Promise<ClassType[]> {
    if (this.classTypes.size === 0) {
      const data = await this.getPaginatedData<ClassType>(
        this.pages.class_types,
      );
      this.classTypes = new Map(data.map((t) => [t.id, t]));
    }

    return Array.from(this.classTypes.values());
  }

  async getCategories(): Promise<Category[]> {
    if (this.categories.size === 0) {
      const data = await this.getPaginatedData<Category>(this.pages.categories);
      this.categories = new Map(data.map((c) => [c.id, c]));
    }

    return Array.from(this.categories.values());
  }

  async findExerciseClasses(date: DateString): Promise<ExerciseClassSimple[]> {
    const payload: ExerciseClassesPayload = {
      instructors: [],
      clubs: [],
      class_types: [],
      class_categories: [],
      partner_cards: [],
      class_tags: [],
      time_ranges: [],
      search_date: date,
    };

    const response = await this.client
      .url(
        "/api-service/v2/with_auth/search_classes?parent_view=schedule_page_2",
      )
      .post(payload)
      .json<ExerciseClassesResponse>();

    const classesWithDate: ExerciseClassSimple[] = Object.values(response.data)
      .flat()
      .map((e) => this.fillExerciseClassesWithDate(e, response.state));

    return classesWithDate;
  }

  async bookOrCancelClass(props: {
    classId: string;
    date: DateString;
    action: "book" | "cancel";
  }): Promise<BookExerciseClassResponse> {
    const searchClasses: BookOrCancelExerciseClassPayload = {
      search_classes: {
        instructors: [],
        clubs: [],
        class_types: [],
        class_categories: [],
        partner_cards: [],
        class_tags: null,
        time_ranges: [],
        search_date: props.date,
      },
    };

    let payload: BookExerciseClassPayload | CancelExerciseClassPayload;
    let url: string;

    if (props.action === "book") {
      url =
        "/api-service/v2/with_auth/agregate?$providers=%5Bbook_class,%20search_classes%5D&parent_view=schedule_page_2";
      payload = {
        ...searchClasses,
        book_class: {
          reserve: false,
          classId: props.classId,
        },
      };
    } else {
      url =
        "/api-service/v2/with_auth/agregate?$providers=%5Bbook_cancel_class,%20search_classes%5D&parent_view=schedule_page_2";
      payload = {
        ...searchClasses,
        book_cancel_class: {
          classId: props.classId,
        },
      };
    }

    const response = await this.client
      .url(url)
      .post(payload)
      .json<BookExerciseClassResponse>();

    return response;
  }

  async getUserClasses(): Promise<ExerciseClassSimple[]> {
    const response = await this.client
      .url("/api-service/v2/with_auth/user_classes?parent_view=schedule_page_2")
      .get()
      .json<ExerciseClassesResponse>();

    const classesWithDate: ExerciseClassSimple[] = Object.values(response.data)
      .flat()
      .map((e) => this.fillExerciseClassesWithDate(e, response.state));

    return classesWithDate;
  }

  async getUserHistory(): Promise<UserHistoryResponse> {
    const payload: UserHistoryPayload = {
      types: ["club", "device"],
      page: 1,
    };

    return await this.client
      .url(
        "/api-service/v2/with_auth/lifestyle_act_history?parent_view=workouts_history_page",
      )
      .post(payload)
      .json<UserHistoryResponse>();
  }

  async getExerciseClasses(date: DateString): Promise<ExerciseClassFull[]> {
    const classes = await this.findExerciseClasses(date);

    const fullClasses: ExerciseClassFull[] = classes.map((c) => {
      const coach = this.instructors.get(c.coach);
      const classType = this.classTypes.get(c.classType);
      const category = this.categories.get(c.category);
      const club = this.clubs.get(c.location);

      return {
        ...c,
        clubObject: club || null,
        classTypeObject: classType || null,
        coachObject: coach || null,
        categoryObject: category || null,
      };
    });

    return fullClasses;
  }

  async getExerciseClassesDetails(
    clasId: number,
  ): Promise<ExerciseClassDetailsResponse> {
    return await this.client
      .url(
        `/api-service/v2/with_auth/class?id=${clasId}&parent_view=class_details`,
      )
      .get()
      .json<ExerciseClassDetailsResponse>();
  }

  private async getPaginatedData<T>(pages: Path[]): Promise<T[]> {
    let data: T[] = [];

    for (const page of pages) {
      const url = `${this.pagesPrefix}${this.networkId}:${page}?access_token=${this.accessToken}`;

      const response = await this.client
        .url(url)
        .get()
        .json<{ def: Record<string | number, T> }>();

      data = [...data, ...Object.values(response.def)];
    }

    return data;
  }

  private fillExerciseClassesWithDate(
    apiClass: ExerciseClassApi,
    states: ExerciseClassesResponse["state"],
  ): ExerciseClassSimple {
    return {
      ...apiClass,
      dateObject: new Date(`${apiClass.date}T${apiClass.start_time}:00`),
      state: states[apiClass.id],
    };
  }
}

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
  ExerciseClass,
  ExerciseClassesPayload,
  ExerciseClassesResponse,
} from "./types/exerciseClasses";
import { DateString } from "./types/common";

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

  private clubs: Club[];
  private instructors: Instructor[];
  private classTypes: ClassType[];
  private categories: Category[];

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

    this.clubs = [];
    this.instructors = [];
    this.classTypes = [];
    this.categories = [];
  }

  static async getAccessToken(payload: LoginPayload): Promise<AccessToken> {
    const token = await wretch(ZDROFIT_API_URL)
      .url("/api-service/v2/without_auth/login?parent_view=login")
      .headers(DEVICE_SPECIFIC_HEADERS)
      .post(payload)
      .json<LoginResponse>();

    return token.access_token;
  }

  async loadPagination(): Promise<PaginationResponse["def_2"]> {
    const response = await this.client
      .url("/api-service/v2/with_auth/dict_pagination?parent_view=home")
      .get()
      .json<PaginationResponse>();

    this.pages = response.def_2;
    this.pagesPrefix = response.path;

    return response.def_2;
  }

  async loadClubs(): Promise<Club[]> {
    const data = await this.getPaginatedData<Club>(this.pages.clubs);
    this.clubs = data;
    return data;
  }

  async loadInstructors(): Promise<Instructor[]> {
    const data = await this.getPaginatedData<Instructor>(
      this.pages.instructors,
    );
    this.instructors = data;
    return data;
  }

  async loadClassTypes(): Promise<ClassType[]> {
    const data = await this.getPaginatedData<ClassType>(this.pages.class_types);
    this.classTypes = data;
    return data;
  }

  async loadCategories(): Promise<Category[]> {
    const data = await this.getPaginatedData<Category>(this.pages.categories);
    this.categories = data;
    return data;
  }

  async findExerciseClasses(date: DateString): Promise<ExerciseClass[]> {
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

    const classesWithDate: ExerciseClass[] = Object.values(response.data)
      .flat()
      .map((item) => ({
        ...item,
        dateObject: new Date(`${item.date}T${item.start_time}:00`),
        state: response.state[item.id],
      }));

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
}

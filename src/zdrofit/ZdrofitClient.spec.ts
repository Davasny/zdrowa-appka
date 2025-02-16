import { assert, beforeAll, describe, expect, it } from "vitest";
import { ZdrofitClient } from "./ZdrofitClient";
import {
  convertDateToString,
  getNextWeekMFSStrings,
  getNthNextDay,
} from "./utils";

import { LoginPayload } from "@/zdrofit/types/login";
import "dotenv/config";

const username = process.env.ZDROFIT_USERNAME;
const password = process.env.ZDROFIT_PASSWORD;

assert(username, "Username is not defined");
assert(password, "Password is not defined");

const loginPayload: LoginPayload = {
  username,
  password,
  network_id: "mfp",
};

const getClient = async () => await ZdrofitClient.getInstance(loginPayload);

describe("Check login flow", async () => {
  it("Checks if it's possible to authorize", async () => {
    const client = await getClient();

    const token = client.getToken();

    expect(token).toBeDefined();
    expect(token?.length).toBe(73);
  });

  it("Checks if client is able to refresh auth token", async () => {
    const client1 = new ZdrofitClient(loginPayload);
    await client1.authorize();

    const client2 = new ZdrofitClient(loginPayload);
    await client2.authorize();

    await client1.getPagination(); // this request is being retried by wretch middleware
    await client1.getCategories(); // make sure new token is valid
  });
});

describe("Check fetching list of pages", async () => {
  it("Checks if pagination endpoint returns data", async () => {
    const client = await getClient();

    const pagination = await client.getPagination();

    expect(pagination.clubs.length).toBeGreaterThan(0);
    expect(pagination.cards.length).toBeGreaterThan(0);
    expect(pagination.categories.length).toBeGreaterThan(0);
    expect(pagination.class_types.length).toBeGreaterThan(0);
    expect(pagination.instructors.length).toBeGreaterThan(0);
  });
});

describe("Check fetching data from authorized endpoints", async () => {
  let client: ZdrofitClient;

  beforeAll(async () => {
    client = await getClient();
    await client.getPagination();
  });

  const getNextWeekExerciseClasses = async () => {
    // checking three days to make sure we don't fell into some national holiday

    const { monday, wednesday, friday } = getNextWeekMFSStrings();

    const nextMondayClasses = await client.findExerciseClasses(monday);
    const nextWednesdayClasses = await client.findExerciseClasses(wednesday);
    const nextFridayClasses = await client.findExerciseClasses(friday);

    // merge all classes
    return [
      ...nextMondayClasses,
      ...nextWednesdayClasses,
      ...nextFridayClasses,
    ];
  };

  it("Checks if loadClubs returns list of clubs", async () => {
    const clubs = await client.getClubs();

    expect(clubs.length).toBeGreaterThan(0);
  });

  it("Checks if loadInstructors returns list of instructors", async () => {
    const instructors = await client.getInstructors();

    expect(instructors.length).toBeGreaterThan(0);
  });

  it("Checks if loadClassTypes returns list of instructors", async () => {
    const classTypes = await client.getClassTypes();

    expect(classTypes.length).toBeGreaterThan(0);
  });

  it("Checks if loadCategories returns list of instructors", async () => {
    const categories = await client.getCategories();

    expect(categories.length).toBeGreaterThan(0);
  });

  it("Checks if findExerciseClasses returns any class for next week", async () => {
    const nextWeekClasses = await getNextWeekExerciseClasses();
    // any of the days should have classes
    expect(nextWeekClasses.length).toBeGreaterThan(0);
  });

  it("Checks booking and cancelling class flow", async () => {
    const nextDaysClasses = [
      ...(await client.findExerciseClasses(
        convertDateToString(getNthNextDay(1)),
      )),
      ...(await client.findExerciseClasses(
        convertDateToString(getNthNextDay(2)),
      )),
    ];

    expect(nextDaysClasses.length).toBeGreaterThan(0);

    const sortedClasses = nextDaysClasses.sort(
      (a, b) => b.dateObject.getTime() - a.dateObject.getTime(),
    );

    const now = new Date();
    const fortyEightHoursFromNow = new Date(
      now.getTime() + 48 * 60 * 60 * 1000,
    );

    // find last class that is at least 48 hours from now
    const lastClassIndex = sortedClasses.findIndex(
      (c) =>
        c.dateObject.getTime() <= fortyEightHoursFromNow.getTime() &&
        c.state === "to_be_booked",
    );

    const pickedClass = sortedClasses[lastClassIndex];

    expect(pickedClass).toBeDefined();

    // ensure we book class at least 12 hours from now
    // in case of exceptions we can always cancel it by hand in app
    const twelveHoursInMs = 12 * 60 * 60 * 1000;
    const twelveHoursFromNow = new Date(now.getTime() + twelveHoursInMs);
    expect(pickedClass.dateObject.getTime()).toBeGreaterThanOrEqual(
      twelveHoursFromNow.getTime(),
    );

    await client.bookOrCancelClass({
      classId: pickedClass.id.toString(),
      action: "book",
      date: pickedClass.date,
    });

    let bookedClasses = await client.getUserClasses();
    let bookedClass = bookedClasses.find((c) => c.id === pickedClass.id);

    expect(bookedClass).toBeDefined();
    expect(bookedClass?.state).toBe("booked");

    await client.bookOrCancelClass({
      classId: pickedClass.id.toString(),
      action: "cancel",
      date: pickedClass.date,
    });

    bookedClasses = await client.getUserClasses();
    bookedClass = bookedClasses.find((c) => c.id === pickedClass.id);

    expect(bookedClass).not.toBeDefined();
  });

  it("Checks if getUserHistory returns anything", async () => {
    const response = await client.getUserHistory();
    expect(response.activities.length).toBeGreaterThan(0);
  });
});

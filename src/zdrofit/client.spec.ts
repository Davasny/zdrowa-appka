import { assert, beforeAll, describe, expect, it } from "vitest";
import { ZdrofitClient } from "./client";

import "dotenv/config";

const username = process.env.ZDROFIT_USERNAME;
const password = process.env.ZDROFIT_PASSWORD;

assert(username, "Username is not defined");
assert(password, "Password is not defined");

describe("Check login flow", async () => {
  it("Checks if it's possible to get auth token", async () => {
    const token = await ZdrofitClient.getAccessToken({
      username,
      password,
      network_id: "mfp",
    });

    expect(token.length).toBe(73);
  });
});

describe("Check fetching list of pages", async () => {
  it("Checks if pagination endpoint returns data", async () => {
    const token = await ZdrofitClient.getAccessToken({
      username,
      password,
      network_id: "mfp",
    });
    const client = new ZdrofitClient(token);

    const pagination = await client.loadPagination();

    expect(pagination.clubs.length).toBeGreaterThan(0);
    expect(pagination.cards.length).toBeGreaterThan(0);
    expect(pagination.categories.length).toBeGreaterThan(0);
    expect(pagination.class_types.length).toBeGreaterThan(0);
    expect(pagination.instructors.length).toBeGreaterThan(0);
  });
});

describe("Check fetching data from authorized endpoints", async () => {
  let token: string;
  let client: ZdrofitClient;

  beforeAll(async () => {
    token = await ZdrofitClient.getAccessToken({
      username,
      password,
      network_id: "mfp",
    });

    client = new ZdrofitClient(token);

    await client.loadPagination();
  });

  it("Checks if loadClubs returns list of clubs", async () => {
    const clubs = await client.loadClubs();

    expect(clubs.length).toBeGreaterThan(0);
  });

  it("Checks if loadInstructors returns list of instructors", async () => {
    const instructors = await client.loadInstructors();

    expect(instructors.length).toBeGreaterThan(0);
  });

  it("Checks if loadClassTypes returns list of instructors", async () => {
    const classTypes = await client.loadClassTypes();

    expect(classTypes.length).toBeGreaterThan(0);
  });

  it("Checks if loadCategories returns list of instructors", async () => {
    const categories = await client.loadCategories();

    expect(categories.length).toBeGreaterThan(0);
  });
});

import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { PageConfig } from "next";
import { ZdrofitClient } from "@/zdrofit/ZdrofitClient";
import { number, object, pipe, regex, string, transform } from "valibot";
import { vValidator } from "@hono/valibot-validator";
import { DateString } from "@/zdrofit/types/common";

export const config: PageConfig = {
  runtime: "edge",
};

const app = new Hono().basePath("/api");

const username = process.env.ZDROFIT_USERNAME;
const password = process.env.ZDROFIT_PASSWORD;

if (!username) {
  throw new Error("Username is not defined");
}

if (!password) {
  throw new Error("Password is not defined");
}

const zdrofitClient = await ZdrofitClient.getInstance({
  username,
  password,
  network_id: "mfp",
});
await zdrofitClient.getPagination();

const findClassesSchema = object({
  date: pipe(
    string(),
    regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Invalid date format. Must be YYYY-MM-DD",
    ),
  ),
});

app.get("/find-classes", vValidator("query", findClassesSchema), async (c) => {
  const { date } = c.req.valid("query");
  const classes = await zdrofitClient.findExerciseClasses(date as DateString);
  return c.json(classes);
});

app.get("/instructors", async (c) => {
  const data = await zdrofitClient.getInstructors();
  return c.json(data);
});

app.get("/class-types", async (c) => {
  const data = await zdrofitClient.getClassTypes();
  return c.json(data);
});

app.get("/categories", async (c) => {
  const data = await zdrofitClient.getCategories();
  return c.json(data);
});

app.get("/user-classes", async (c) => {
  const data = await zdrofitClient.getUserClasses();
  return c.json(data);
});

app.get("/clubs", async (c) => {
  const data = await zdrofitClient.getClubs();
  return c.json(data);
});

const classDetailsSchema = object({
  classId: pipe(
    string(),
    transform((v) => parseInt(v, 10)),
  ),
});

app.get(
  "/class-details",
  vValidator("query", classDetailsSchema),
  async (c) => {
    const { classId } = c.req.valid("query");
    const data = await zdrofitClient.getExerciseClassesDetails(classId);
    return c.json(data);
  },
);

const bookClassSchema = object({
  classId: number(),
  date: pipe(
    string(),
    regex(
      /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
      "Invalid date format. Must be YYYY-MM-DD",
    ),
  ),
});

app.post("/book-class", vValidator("json", bookClassSchema), async (c) => {
  const { classId, date } = c.req.valid("json");

  const data = await zdrofitClient.bookOrCancelClass({
    classId: classId.toString(),
    date: date as DateString,
    action: "book",
  });

  return c.json(data);
});

app.post("/cancel-class", vValidator("json", bookClassSchema), async (c) => {
  const { classId, date } = c.req.valid("json");

  const data = await zdrofitClient.bookOrCancelClass({
    classId: classId.toString(),
    date: date as DateString,
    action: "cancel",
  });

  return c.json(data);
});

app.post("/reset-cache", async (c) => {
  await zdrofitClient.removeCachedData();
  return c.json({ message: "Cache reset" });
});

export default handle(app);

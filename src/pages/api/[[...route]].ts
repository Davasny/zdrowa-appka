import { JobsStorage } from "@/storage/JobsStorage";
import { DateString } from "@/zdrofit/types/common";
import { ZdrofitClient } from "@/zdrofit/ZdrofitClient";
import { vValidator } from "@hono/valibot-validator";
import { number, object, pipe, regex, string, transform } from "valibot";

import { handle } from "@hono/node-server/vercel";
import { Hono } from "hono";
import type { PageConfig } from "next";

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
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

  const classDetails = await zdrofitClient.getExerciseClassesDetails(classId);

  if (classDetails.state === "to_be_notify") {
    // we can sign up for notification so we should create cron which will sign us up
    const jobStorage = new JobsStorage();

    const classDate = zdrofitClient.convertStringsToDate(
      classDetails.def.date,
      classDetails.def.start_time,
    );

    await jobStorage.createJob({
      state: "scheduled",
      class: {
        classId,
        date: date as DateString,
      },
      executionTimestamp: classDate.getTime() - 48 * 60 * 60 * 1000,
    });

    return c.json({ message: "job created" });
  } else {
    try {
      const zdrofitResponse = await zdrofitClient.bookOrCancelClass({
        classId: classId.toString(),
        date: date as DateString,
        action: "book",
      });

      return c.json(zdrofitResponse);
    } catch (e) {
      let msg = e instanceof Error ? e.message : "unknown";
      return c.json({ message: `Error occurred: ${msg}` }, 400);
    }
  }
});

app.post("/cancel-class", vValidator("json", bookClassSchema), async (c) => {
  const { classId, date } = c.req.valid("json");

  const jobStorage = new JobsStorage();
  const scheduledJobs = await jobStorage.getPendingJobs();

  const scheduledJob = scheduledJobs.find(
    (job) => job.class.classId === classId,
  );

  if (scheduledJob) {
    await jobStorage.updateJobState(scheduledJob.id, "canceled");
    return c.json({ message: "job canceled" });
  } else {
    const data = await zdrofitClient.bookOrCancelClass({
      classId: classId.toString(),
      date: date as DateString,
      action: "cancel",
    });

    return c.json(data);
  }
});

app.get("/planned-jobs", async (c) => {
  const jobStorage = new JobsStorage();
  const jobs = await jobStorage.getPendingJobs();
  return c.json(jobs);
});

app.get("/jobs", async (c) => {
  const jobStorage = new JobsStorage();
  const jobs = await jobStorage.getJobs();
  return c.json(jobs);
});

app.get("/user-history", async (c) => {
  const userHistory = await zdrofitClient.getUserHistory();
  return c.json(userHistory);
});

app.post("/reset-cache", async (c) => {
  await zdrofitClient.removeCachedData();
  return c.json({ message: "Cache reset" });
});

export default handle(app);

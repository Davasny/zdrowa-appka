import { Job, JobsStorage } from "@/storage/JobsStorage";
import { ZdrofitClient } from "@/zdrofit/ZdrofitClient";
import "dotenv/config";

const username = process.env.ZDROFIT_USERNAME;
const password = process.env.ZDROFIT_PASSWORD;

if (!username) {
  throw new Error("Username is not defined");
}

if (!password) {
  throw new Error("Password is not defined");
}

const MAX_RETRIES = 5;
const SLEEP_TIME = 1_000;

const bookClassJob = async (job: Job) => {
  const zdrofitClient = await ZdrofitClient.getInstance(
    {
      username,
      password,
      network_id: "mfp",
    },
    false,
  );

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      console.log(
        `[${new Date().toISOString()}] [${job.class.classId}] [${i}/${MAX_RETRIES}] Booking class`,
      );

      await zdrofitClient.bookOrCancelClass({
        action: "book",
        date: job.class.date,
        classId: job.class.classId.toString(),
      });

      console.log(
        `[${new Date().toISOString()}] [${job.class.classId}] [${i}/${MAX_RETRIES}] Booked class`,
      );

      break;
    } catch (e) {
      console.log(
        `[${i}/${MAX_RETRIES}] [${job.class.classId}] Error occurred`,
        e,
      );

      await new Promise((resolve) => setTimeout(resolve, SLEEP_TIME));
    }
  }

  console.log(
    `[${new Date().toISOString()}] Booked`,
    JSON.stringify(job.class),
  );
};

const main = async () => {
  const s = new JobsStorage();

  const intervalMs = 2_000;

  console.log(
    `[${new Date().toISOString()}] Starting bookerJob and checking jobs every ${intervalMs / 1000}s`,
  );

  setInterval(async () => {
    const jobs = await s.getPendingJobs();

    const jobsToExecute = jobs.filter(
      (job) => job.executionTimestamp < new Date().getTime(),
    );

    for (const job of jobsToExecute) {
      console.log(
        `[${new Date().toISOString()}] Starting job:`,
        JSON.stringify(job),
      );

      await s.updateJobState(job.id, "inProgress");

      bookClassJob(job)
        .then(async () => {
          await s.updateJobState(job.id, "done");
        })
        .catch(async (error) => {
          if (error instanceof Error) {
            await s.markJobAsFailed(job.id, error.message);
          } else {
            await s.markJobAsFailed(job.id, "Unknown error");
          }
        });
    }
  }, intervalMs);
};

main();

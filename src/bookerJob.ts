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

const bookClassJob = async (job: Job) => {
  const zdrofitClient = await ZdrofitClient.getInstance(
    {
      username,
      password,
      network_id: "mfp",
    },
    false,
  );

  const maxRetries = 10;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(
        `[${new Date().toISOString()}] [${job.class.classId}] [${i}/${maxRetries}] Booking class`,
      );

      await zdrofitClient.bookOrCancelClass({
        action: "book",
        date: job.class.date,
        classId: job.class.classId.toString(),
      });

      console.log(
        `[${new Date().toISOString()}] [${job.class.classId}] [${i}/${maxRetries}] Booked class`,
      );

      await new Promise((resolve) => setTimeout(resolve, 2_000));

      break;
    } catch (e) {
      console.log(`[${i}/${maxRetries}] [${job.class.classId}] Retrying`);
    }
  }

  console.log(
    `[${new Date().toISOString()}] Booked`,
    JSON.stringify(job.class),
  );
};

const main = async () => {
  const s = new JobsStorage();

  setInterval(async () => {
    console.log(`[${new Date().toISOString()}] Checking for pending jobs`);

    const jobs = await s.getPendingJobs();

    const jobsToExecute = jobs.filter(
      (job) => job.executionTimestamp < new Date().getTime(),
    );

    console.log(
      `[${new Date().toISOString()}] Pending jobs: ${jobs.length}, to be executed now: ${jobsToExecute.length}`,
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
  }, 2_000);
};

main();

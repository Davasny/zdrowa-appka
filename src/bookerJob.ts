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
  const zdrofitClient = await ZdrofitClient.getInstance({
    username,
    password,
    network_id: "mfp",
  });

  console.log("Booking class", JSON.stringify(job.class));

  await zdrofitClient.bookOrCancelClass({
    action: "book",
    date: job.class.date,
    classId: job.class.classId.toString(),
  });

  console.log("Booked", JSON.stringify(job.class));
};

const main = async () => {
  const s = new JobsStorage();

  setInterval(async () => {
    console.log("Checking for pending jobs");

    const jobs = await s.getPendingJobs();

    console.log("Found pending jobs: ", jobs.length);

    for (const job of jobs) {
      if (job.executionTimestamp < new Date().getTime() + 5_000) {
        console.log("Starting job", JSON.stringify(job));

        await s.updateJobState(job.id, "inProgress");

        bookClassJob(job).then(async () => {
          await s.updateJobState(job.id, "done");
        });
      }
    }
  }, 2_000);
};

main();

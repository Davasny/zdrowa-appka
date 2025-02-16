import { Job, JobsStorage } from "@/storage/JobsStorage";

const bookClassJob = async (job: Job) => {
  console.log("Booking");
  await new Promise((resolve) => setTimeout(resolve, 2_000));
  console.log("Booked");
};

const main = async () => {
  const s = new JobsStorage();

  setInterval(async () => {
    console.log("Checking for pending jobs");

    const jobs = await s.getPendingJobs();

    console.log("Found pending jobs", jobs.length);

    for (const job of jobs) {
      if (job.executionTimestamp < new Date().getTime() + 5_000) {
        console.log("Starting job", job);
        await s.updateJobState(job.id, "inProgress");

        bookClassJob(job).then(async () => {
          await s.updateJobState(job.id, "done");
        });
      }
    }
  }, 2_000);
};

main();

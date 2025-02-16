import { promises as fs } from "fs";
import { DateString } from "@/zdrofit/types/common";
import { ExerciseClassSimple } from "@/zdrofit/types/exerciseClasses";
import { ULID, ulid } from "ulidx";

export interface Job {
  id: ULID;
  executionTimestamp: number;
  state: "scheduled" | "done" | "inProgress";
  class: {
    classId: ExerciseClassSimple["id"];
    date: DateString;
  };
}

export class JobsStorage {
  private readonly storageFilePath = "storage.json";

  constructor() {}

  // Helper method: read jobs from the storage file.
  private async readJobsFromFile(): Promise<Job[]> {
    const data = await fs.readFile(this.storageFilePath, "utf8");
    return JSON.parse(data) as Job[];
  }

  // Helper method: write jobs to the storage file.
  private async writeJobsToFile(jobs: Job[]): Promise<void> {
    await fs.writeFile(
      this.storageFilePath,
      JSON.stringify(jobs, null, 2),
      "utf8",
    );
  }

  // Creates a random id for the job, adds it to storage and saves the updated job list.
  public async createJob(job: Omit<Job, "id">): Promise<void> {
    const jobs = await this.readJobsFromFile();
    // Create a random id (you could also check for uniqueness if needed)
    jobs.push({
      ...job,
      id: ulid(),
    });
    await this.writeJobsToFile(jobs);
  }

  // Retrieves all jobs from storage.
  public async getJobs(): Promise<Job[]> {
    return this.readJobsFromFile();
  }

  // Returns jobs with state "scheduled".
  public async getPendingJobs(): Promise<Job[]> {
    const jobs = await this.getJobs();
    return jobs.filter((job) => job.state === "scheduled");
  }

  // Updates the state of a job by its id, saves the updated job list, and returns it.
  public async updateJobState(
    id: Job["id"],
    state: Job["state"],
  ): Promise<Job[]> {
    const jobs = await this.getJobs();
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      throw new Error(`Job with id ${id} not found.`);
    }
    jobs[jobIndex].state = state;
    await this.writeJobsToFile(jobs);
    return jobs;
  }
}

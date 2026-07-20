import { createJob, validateJob } from "../models/job.model.js";
import { STORAGE_KEYS } from "../utils/constants.js";
import { storageGet, storageSet } from "./storage.service.js";

export async function getJobs() {
  const jobs = await storageGet(STORAGE_KEYS.JOBS);
  return Array.isArray(jobs) ? jobs : [];
}

export async function saveJobs(jobs) {
  await storageSet(STORAGE_KEYS.JOBS, jobs);
  return jobs;
}

export async function addJob(fields = {}) {
  const draft = createJob(fields);
  const { valid, errors } = validateJob(draft);

  if (!valid) {
    throw new Error(Object.values(errors).join(" "));
  }

  const jobs = await getJobs();
  const nextJobs = [draft, ...jobs];
  await saveJobs(nextJobs);

  return draft;
}

export async function deleteJob(jobId) {
  const jobs = await getJobs();
  const nextJobs = jobs.filter((job) => job.id !== jobId);
  await saveJobs(nextJobs);

  return nextJobs;
}

/**
 * Returns a single job by its id.
 */
export async function getJobById(jobId) {
  const jobs = await getJobs();
  return jobs.find((job) => job.id === jobId) || null;
}

/**
 * Updates an existing job while preserving its id.
 */
export async function updateJob(updatedJob) {
  if (!updatedJob?.id) {
    throw new Error("Job id is required.");
  }

  const { valid, errors } = validateJob(updatedJob);

  if (!valid) {
    throw new Error(Object.values(errors).join(" "));
  }

  const jobs = await getJobs();

  const index = jobs.findIndex((job) => job.id === updatedJob.id);

  if (index === -1) {
    throw new Error(`Job with id '${updatedJob.id}' not found.`);
  }

  jobs[index] = {
    ...jobs[index],
    ...updatedJob,
  };

  await saveJobs(jobs);

  return jobs[index];
}
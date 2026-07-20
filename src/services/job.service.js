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

import { JOB_STATUS } from "../utils/constants.js";

/**
 * Canonical shape of a tracked job application.
 * Defining this in one place (rather than letting each form/table infer
 * its own shape) is what lets the form, dashboard, and storage layer all
 * agree on field names without a schema drifting between them.
 *
 * @typedef {Object} Job
 * @property {string} id                 - Unique id (crypto.randomUUID)
 * @property {string} role                - Job title
 * @property {string} company
 * @property {string} location
 * @property {string} applicationUrl
 * @property {string} portal              - e.g. "LinkedIn", "Greenhouse"
 * @property {string} dateApplied         - ISO date string (yyyy-mm-dd)
 * @property {string} status              - One of JOB_STATUS
 * @property {string} employmentType
 * @property {string} workMode
 * @property {string} salary              - Optional, free text
 * @property {string} notes               - Optional
 * @property {boolean} archived
 * @property {string} createdAt           - ISO timestamp
 * @property {string} updatedAt           - ISO timestamp
 */

/** Fields the Track Job form must fill in before a job can be saved. */
export const REQUIRED_FIELDS = ["role", "company", "dateApplied", "status"];

/**
 * Builds a new Job record with sane defaults, merging in whatever the
 * caller (the Track Job form) supplies.
 * @param {Partial<Job>} fields
 * @returns {Job}
 */
export function createJob(fields = {}) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    role: "",
    company: "",
    location: "",
    applicationUrl: "",
    portal: "",
    dateApplied: now.slice(0, 10),
    status: JOB_STATUS.APPLIED,
    employmentType: "",
    workMode: "",
    salary: "",
    notes: "",
    archived: false,
    createdAt: now,
    updatedAt: now,
    ...fields,
  };
}

/**
 * Validates a job draft before it's persisted.
 * @param {Partial<Job>} fields
 * @returns {{ valid: boolean, errors: Record<string,string> }}
 */
export function validateJob(fields) {
  const errors = {};

  if (!fields.role?.trim()) errors.role = "Role is required.";
  if (!fields.company?.trim()) errors.company = "Company is required.";
  if (!fields.dateApplied?.trim())
    errors.dateApplied = "Date applied is required.";
  if (!fields.status?.trim()) errors.status = "Status is required.";

  if (fields.applicationUrl?.trim()) {
    try {
      new URL(fields.applicationUrl.trim());
    } catch {
      errors.applicationUrl = "Enter a valid URL.";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

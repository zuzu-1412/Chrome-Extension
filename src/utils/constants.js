/**
 * Centralized constants.
 * Keeping storage keys and enums here means every module references the
 * same literal values — renaming a key or adding a status is a one-line
 * change instead of a find-and-replace across the codebase.
 */

export const STORAGE_KEYS = {
  JOBS: "jobs",
  THEME: "theme",
  DASHBOARD_PREFS: "dashboardPrefs",
};

export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

export const JOB_STATUS = {
  APPLIED: "applied",
  INTERVIEW: "interview",
  OFFER: "offer",
  REJECTED: "rejected",
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.APPLIED]: "Applied",
  [JOB_STATUS.INTERVIEW]: "Interview",
  [JOB_STATUS.OFFER]: "Offer",
  [JOB_STATUS.REJECTED]: "Rejected",
};

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Internship",
  "Contract",
  "Temporary",
];

export const WORK_MODES = ["On-site", "Hybrid", "Remote"];

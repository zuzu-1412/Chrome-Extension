/**
 * Background Service Worker
 * -----------------------------------------------------------------------
 * MV3 uses an event-driven, non-persistent service worker instead of the
 * old persistent background page. It stays dormant until an event wakes
 * it, so we only put listeners here — no long-lived state.
 *
 * Today this just seeds a default theme on install. Later phases can add
 * things like a context menu ("Track this job") or badge-count updates
 * without touching any UI code, since the worker is fully decoupled from
 * the popup/dashboard.
 */
import { STORAGE_KEYS, THEMES } from "../utils/constants.js";
import { storageGet, storageSet } from "../services/storage.service.js";

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== "install") return;

  const existingTheme = await storageGet(STORAGE_KEYS.THEME);
  if (!existingTheme) {
    await storageSet(STORAGE_KEYS.THEME, THEMES.DARK);
  }

  const existingJobs = await storageGet(STORAGE_KEYS.JOBS);
  if (!existingJobs) {
    await storageSet(STORAGE_KEYS.JOBS, []);
  }
});

/**
 * Storage Service
 * -----------------------------------------------------------------------
 * Thin Promise-based wrapper around chrome.storage.local.
 *
 * Why a wrapper at all: every other module (popup, form, dashboard)
 * should depend on this file's API, never on chrome.storage directly.
 * That gives us one place to change persistence strategy later (e.g.
 * chrome.storage.sync, or namespacing keys) without touching UI code,
 * and it lets us unit-test the rest of the app against a mock.
 *
 * chrome.storage.local is used (not .sync) because job application data
 * can grow large and is device-local by nature — sync has tight quota
 * limits that this dataset would outgrow.
 */

/**
 * @param {string} key
 * @returns {Promise<any>}
 */
export function storageGet(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(result[key]);
    });
  });
}

/**
 * @param {string} key
 * @param {any} value
 * @returns {Promise<void>}
 */
export function storageSet(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * @param {string} key
 * @returns {Promise<void>}
 */
export function storageRemove(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([key], () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      resolve();
    });
  });
}

/**
 * Subscribes to changes for a specific key. Returns an unsubscribe fn.
 * Used by the dashboard so it can stay in sync if data changes in
 * another view (e.g. the popup saves a job while the dashboard is open).
 * @param {string} key
 * @param {(newValue: any, oldValue: any) => void} callback
 */
export function onStorageChange(key, callback) {
  const listener = (changes, areaName) => {
    if (areaName !== "local" || !changes[key]) return;
    callback(changes[key].newValue, changes[key].oldValue);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

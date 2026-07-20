import { STORAGE_KEYS, THEMES } from "./constants.js";
import { storageGet, storageSet } from "../services/storage.service.js";

/**
 * Applies a theme to the document immediately (no flash) and persists it.
 * Any surface (popup, dashboard, options page) can import this and get
 * identical theming behavior without duplicating logic.
 */
export async function initTheme() {
  const stored = await storageGet(STORAGE_KEYS.THEME);
  const theme = stored ?? getSystemPreference();
  applyTheme(theme);
  return theme;
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export async function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  applyTheme(next);
  await storageSet(STORAGE_KEYS.THEME, next);
  return next;
}

function getSystemPreference() {
  const prefersLight = window.matchMedia?.(
    "(prefers-color-scheme: light)"
  ).matches;
  return prefersLight ? THEMES.LIGHT : THEMES.DARK;
}

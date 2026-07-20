import { initTheme, toggleTheme } from "../utils/theme.util.js";
import { THEMES } from "../utils/constants.js";

const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;

const themeToggleBtn = document.getElementById("theme-toggle");
const trackJobBtn = document.getElementById("track-job-btn");
const dashboardBtn = document.getElementById("dashboard-btn");
const formOverlay = document.getElementById("job-form-overlay");
const backdrop = document.querySelector("[data-close-overlay]");

async function openStandaloneForm(prefill = {}) {
  const params = new URLSearchParams({
    url: prefill.url || "",
    portal: prefill.portal || "",
  });

  const formUrl = chrome.runtime.getURL(
    `src/job-form/job-form.html?${params.toString()}`
  );

  await chrome.windows.create({
    url: formUrl,
    type: "popup",
    width: 600,
    height: 900,
    focused: true,
  });

  // Close the extension popup
  window.close();
}

function renderToggleIcon(theme) {
  themeToggleBtn.innerHTML = theme === THEMES.DARK ? SUN_ICON : MOON_ICON;
}

function openExtensionPage(path, params = {}) {
  const url = new URL(path, window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  window.open(url.toString(), "_blank");
}

async function handleTrackJob() {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  const rawUrl = activeTab?.url || "";
  const title = activeTab?.title || "";
  const portal = (() => {
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  openStandaloneForm({ url: rawUrl, title, portal });
}

async function handleDashboard() {
  const dashboardUrl = chrome.runtime.getURL("src/dashboard/dashboard.html");

  try {
    await chrome.tabs.create({ url: dashboardUrl });
  } catch {
    openExtensionPage("../dashboard/dashboard.html");
  }
}

async function bootstrap() {
  const theme = await initTheme();
  renderToggleIcon(theme);
}

themeToggleBtn.addEventListener("click", async () => {
  const next = await toggleTheme();
  renderToggleIcon(next);
});

trackJobBtn.addEventListener("click", handleTrackJob);
dashboardBtn.addEventListener("click", handleDashboard);

bootstrap();

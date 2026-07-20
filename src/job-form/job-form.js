import { initTheme, toggleTheme } from "../utils/theme.util.js";
import {
  EMPLOYMENT_TYPES,
  JOB_STATUS,
  JOB_STATUS_LABELS,
  THEMES,
  WORK_MODES,
} from "../utils/constants.js";
import { addJob } from "../services/job.service.js";

const form = document.getElementById("job-form");
const messageBox = document.getElementById("form-message");
const themeToggleBtn = document.getElementById("form-theme-toggle") || document.getElementById("theme-toggle");
const closeFormBtn = document.getElementById("close-form-btn");
const formOverlay = document.getElementById("job-form-overlay");
const searchParams = new URLSearchParams(window.location.search);

const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;

function renderToggleIcon(theme) {
  themeToggleBtn.innerHTML = theme === THEMES.DARK ? SUN_ICON : MOON_ICON;
}

function populateSelect(select, values, selectedValue = "") {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === selectedValue) option.selected = true;
    select.appendChild(option);
  });
}

function renderStatusOptions() {
  const statusSelect = document.getElementById("status");
  const entries = Object.entries(JOB_STATUS).map(([key, value]) => ({
    value,
    label: JOB_STATUS_LABELS[value] ?? key,
  }));

  statusSelect.innerHTML = "";
  entries.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    statusSelect.appendChild(option);
  });

  statusSelect.value = JOB_STATUS.APPLIED;
}

function getPrefillValues() {
  const injectedPrefill = window.__jobFormPrefill || {};
  const queryUrl = searchParams.get("url") || "";
  const queryPortal = searchParams.get("portal") || "";

  return {
    url: injectedPrefill.url ?? queryUrl,
    portal: injectedPrefill.portal ?? queryPortal,
  };
}

function prefillForm() {
  const today = new Date().toISOString().slice(0, 10);
  const { url, portal } = getPrefillValues();

  document.getElementById("application-url").value = url;
  document.getElementById("portal").value = portal;
  document.getElementById("role").focus();
  document.getElementById("date-applied").value = today;
  document.getElementById("status").value = JOB_STATUS.APPLIED;
  document.getElementById("employment-type").value = EMPLOYMENT_TYPES[0] || "";
  document.getElementById("work-mode").value = WORK_MODES[0] || "";
}

function showMessage(text, tone = "info") {
  messageBox.textContent = text;
  messageBox.className = `form-message ${tone}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showMessage("Saving your job…", "info");

  const formData = new FormData(form);
  const payload = {
    role: String(formData.get("role") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    location: String(formData.get("location") || "").trim(),
    applicationUrl: String(formData.get("applicationUrl") || "").trim(),
    portal: String(formData.get("portal") || "").trim(),
    dateApplied: String(formData.get("dateApplied") || "").trim(),
    status: String(formData.get("status") || "").trim(),
    employmentType: String(formData.get("employmentType") || "").trim(),
    workMode: String(formData.get("workMode") || "").trim(),
    salary: String(formData.get("salary") || "").trim(),
  };

  try {
    await addJob(payload);
    window.close();
  } catch (error) {
    showMessage(error.message || "Could not save that job.", "error");
  }
});

async function bootstrap() {
  const theme = await initTheme();
  renderToggleIcon(theme);
  renderStatusOptions();
  populateSelect(document.getElementById("employment-type"), EMPLOYMENT_TYPES);
  populateSelect(document.getElementById("work-mode"), WORK_MODES);
  prefillForm();
}

themeToggleBtn.addEventListener("click", async () => {
  const next = await toggleTheme();
  renderToggleIcon(next);
});

closeFormBtn?.addEventListener("click", () => {
  if (formOverlay?.classList.contains("is-open")) {
    formOverlay.classList.remove("is-open");
    formOverlay.setAttribute("aria-hidden", "true");
    document.getElementById("dashboard-btn")?.classList.remove("is-hidden");
    return;
  }

  window.close();
});

document.addEventListener("job-form:prefill", (event) => {
  window.__jobFormPrefill = event.detail || {};
  prefillForm();
});

bootstrap();

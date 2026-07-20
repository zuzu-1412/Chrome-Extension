import { initTheme, toggleTheme } from "../utils/theme.util.js";
import { JOB_STATUS, JOB_STATUS_LABELS, THEMES } from "../utils/constants.js";
import { deleteJob, getJobs } from "../services/job.service.js";

const emptyState = document.getElementById("dashboard-empty");
const themeToggleBtn = document.getElementById("theme-toggle");
const statTotal = document.getElementById("stat-total");
const statApplied = document.getElementById("stat-applied");
const statInterview = document.getElementById("stat-interview");
const statOffer = document.getElementById("stat-offer");

const SUN_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`;

let jobs = [];

function renderToggleIcon(theme) {
  themeToggleBtn.innerHTML = theme === THEMES.DARK ? SUN_ICON : MOON_ICON;
}

function buildStatusOptions() {
  const statusSelect = document.getElementById("filter-status");
  const options = Object.values(JOB_STATUS).map((value) => ({ value, label: JOB_STATUS_LABELS[value] || value }));
  statusSelect.innerHTML = '<option value="all">All statuses</option>';
  options.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    statusSelect.appendChild(option);
  });
}

function getFilteredJobs() {
  const roleFilter = document.getElementById("filter-role").value.trim().toLowerCase();
  const companyFilter = document.getElementById("filter-company").value.trim().toLowerCase();
  const locationFilter = document.getElementById("filter-location").value.trim().toLowerCase();
  const selectedStatus = document.getElementById("filter-status").value;
  const dateFilter = document.getElementById("filter-date").value;
  const portalFilter = document.getElementById("filter-portal").value.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesRole = !roleFilter || (job.role || "").toLowerCase().includes(roleFilter);
    const matchesCompany = !companyFilter || (job.company || "").toLowerCase().includes(companyFilter);
    const matchesLocation = !locationFilter || (job.location || "").toLowerCase().includes(locationFilter);
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    const matchesDate = !dateFilter || (job.dateApplied || "").includes(dateFilter);
    const matchesPortal = !portalFilter || (job.portal || "").toLowerCase().includes(portalFilter);

    return matchesRole && matchesCompany && matchesLocation && matchesStatus && matchesDate && matchesPortal;
  });
}

function updateStats(items) {
  statTotal.textContent = items.length;
  statApplied.textContent = items.filter((job) => job.status === JOB_STATUS.APPLIED).length;
  statInterview.textContent = items.filter((job) => job.status === JOB_STATUS.INTERVIEW).length;
  statOffer.textContent = items.filter((job) => job.status === JOB_STATUS.OFFER).length;
}

async function handleDeleteJob(jobId) {
  if (!jobId) {
    return;
  }

  await deleteJob(jobId);
  jobs = await getJobs();
  renderDashboard();
}

function renderJobs(items) {
  const tableBody = document.getElementById("dashboard-table-body");
  tableBody.innerHTML = "";

  if (!items.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    const emptyRow = document.createElement("tr");
    emptyRow.className = "empty-table-row";
    emptyRow.innerHTML = `
      <td colspan="7">
        <div class="empty-state-content">
          <h3>No matching applications</h3>
          <p>Try a different filter or clear a column filter to see more results.</p>
        </div>
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  items.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="job-role">${job.role || "Untitled role"}</div>
      </td>
      <td>
        <div class="job-company">${job.company || "Unknown company"}</div>
      </td>
      <td>${job.location || "—"}</td>
      <td><span class="job-status">${JOB_STATUS_LABELS[job.status] || "Applied"}</span></td>
      <td>${job.dateApplied || "—"}</td>
      <td>${job.portal || "—"}</td>
      <td class="job-actions">
        <button type="button" data-delete-id="${job.id || ""}">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleDeleteJob(button.getAttribute("data-delete-id"));
    });
  });
}

function renderDashboard() {
  const filtered = getFilteredJobs();
  updateStats(jobs);
  renderJobs(filtered);
}

async function bootstrap() {
  const theme = await initTheme();
  renderToggleIcon(theme);
  jobs = await getJobs();
  buildStatusOptions();
  renderDashboard();
}

const filterInputs = [
  document.getElementById("filter-role"),
  document.getElementById("filter-company"),
  document.getElementById("filter-location"),
  document.getElementById("filter-status"),
  document.getElementById("filter-date"),
  document.getElementById("filter-portal"),
];

filterInputs.forEach((input) => {
  input?.addEventListener("input", renderDashboard);
  input?.addEventListener("change", renderDashboard);
});

themeToggleBtn.addEventListener("click", async () => {
  const next = await toggleTheme();
  renderToggleIcon(next);
});

bootstrap();

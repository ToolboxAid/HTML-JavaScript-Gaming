import { readAdminSetupStatus } from "../../../../src/api/admin-setup-api-client.js";
import { formatStatusMessage } from "../../js/shared/status.js";

const refreshButtons = Array.from(document.querySelectorAll("[data-admin-setup-refresh]"));
const statusFields = Array.from(document.querySelectorAll("[data-admin-setup-status]"));
const statusRows = Array.from(document.querySelectorAll("[data-admin-setup-status-rows]"));

function setStatus(message, status = "PASS") {
  const text = formatStatusMessage(status, message);
  statusFields.forEach((field) => {
    field.textContent = text;
  });
}

function setBusy(isBusy) {
  refreshButtons.forEach((button) => {
    button.disabled = isBusy;
    if (isBusy) {
      button.setAttribute("aria-disabled", "true");
    } else {
      button.removeAttribute("aria-disabled");
    }
  });
}

function appendCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
}

function renderSetupRows(report) {
  statusRows.forEach((body) => {
    body.replaceChildren();
    (report.areas || []).forEach((area) => {
      const row = document.createElement("tr");
      appendCell(row, area.label || area.id || "Setup Area");
      appendCell(row, area.action || "Server-owned setup check");
      appendCell(row, area.status || "WARN");
      appendCell(row, area.message || "No setup status message returned.");
      body.appendChild(row);
    });
  });
}

function refreshSetupStatus() {
  setBusy(true);
  setStatus("Reading Site Setup status through Admin setup.", "WARN");
  try {
    const report = readAdminSetupStatus();
    renderSetupRows(report);
    setStatus(report.message || "Site Setup status refreshed.", report.status || "PASS");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Admin setup status failed.");
    setStatus(message, "FAIL");
  } finally {
    setBusy(false);
  }
}

refreshButtons.forEach((button) => {
  button.addEventListener("click", refreshSetupStatus);
});

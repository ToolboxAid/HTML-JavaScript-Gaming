import { readAdminSetupStatus, reseedAdminSetup } from "../../../src/engine/api/admin-setup-api-client.js";

const reseedButtons = Array.from(document.querySelectorAll("[data-admin-setup-reseed]"));
const refreshButtons = Array.from(document.querySelectorAll("[data-admin-setup-refresh]"));
const statusFields = Array.from(document.querySelectorAll("[data-admin-setup-status]"));
const statusRows = Array.from(document.querySelectorAll("[data-admin-setup-status-rows]"));

function setStatus(message, status = "PASS") {
  const text = `${status}: ${message}`;
  statusFields.forEach((field) => {
    field.textContent = text;
  });
}

function setBusy(isBusy) {
  [...reseedButtons, ...refreshButtons].forEach((button) => {
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

function runReseed() {
  setBusy(true);
  setStatus("Running Local DB reseed through Admin setup.", "WARN");
  try {
    const result = reseedAdminSetup();
    setStatus(result.message || "Local DB reseed completed through Admin setup.", result.status || "PASS");
    window.dispatchEvent(new CustomEvent("gamefoundry:mock-db-changed", {
      detail: result.snapshot || null,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "Admin setup reseed failed.");
    setStatus(message, "FAIL");
  } finally {
    setBusy(false);
  }
}

reseedButtons.forEach((button) => {
  button.addEventListener("click", runReseed);
});

refreshButtons.forEach((button) => {
  button.addEventListener("click", refreshSetupStatus);
});

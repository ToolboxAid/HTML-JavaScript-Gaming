import { reseedAdminSetup } from "../../../src/engine/api/admin-setup-api-client.js";

const reseedButtons = Array.from(document.querySelectorAll("[data-admin-setup-reseed]"));
const statusFields = Array.from(document.querySelectorAll("[data-admin-setup-status]"));

function setStatus(message, status = "PASS") {
  const text = `${status}: ${message}`;
  statusFields.forEach((field) => {
    field.textContent = text;
  });
}

function setBusy(isBusy) {
  reseedButtons.forEach((button) => {
    button.disabled = isBusy;
    if (isBusy) {
      button.setAttribute("aria-disabled", "true");
    } else {
      button.removeAttribute("aria-disabled");
    }
  });
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

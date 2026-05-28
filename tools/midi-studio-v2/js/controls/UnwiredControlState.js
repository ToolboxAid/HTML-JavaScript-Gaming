const DEFAULT_STATUS = "Not implemented";

function statusToken(status) {
  return String(status || DEFAULT_STATUS)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "not-implemented";
}

function controlLabel(element) {
  return String(element.getAttribute("aria-label") || element.textContent || element.id || "Control").trim();
}

function storeOriginalAttributes(element) {
  if (!Object.hasOwn(element.dataset, "midiStudioOriginalTitle")) {
    element.dataset.midiStudioOriginalTitle = element.getAttribute("title") || "";
  }
  if (!Object.hasOwn(element.dataset, "midiStudioOriginalAriaLabel")) {
    element.dataset.midiStudioOriginalAriaLabel = element.getAttribute("aria-label") || "";
  }
}

function restoreAttribute(element, attributeName, originalValue) {
  if (originalValue) {
    element.setAttribute(attributeName, originalValue);
    return;
  }
  element.removeAttribute(attributeName);
}

export function setUnwiredControlState(element, { active, detail = "", status = DEFAULT_STATUS } = {}) {
  if (!element) {
    return;
  }
  if (!active) {
    element.classList.remove("midi-studio-v2__unwired-control");
    delete element.dataset.midiStudioUnwired;
    delete element.dataset.midiStudioUnwiredStatus;
    restoreAttribute(element, "title", element.dataset.midiStudioOriginalTitle || "");
    restoreAttribute(element, "aria-label", element.dataset.midiStudioOriginalAriaLabel || "");
    delete element.dataset.midiStudioOriginalTitle;
    delete element.dataset.midiStudioOriginalAriaLabel;
    return;
  }
  storeOriginalAttributes(element);
  const statusText = String(status || DEFAULT_STATUS).trim() || DEFAULT_STATUS;
  const detailText = String(detail || "").trim();
  const tooltip = detailText ? `${statusText}: ${detailText}` : statusText;
  const originalAriaLabel = element.dataset.midiStudioOriginalAriaLabel || controlLabel(element);
  element.classList.add("midi-studio-v2__unwired-control");
  element.dataset.midiStudioUnwired = statusToken(statusText);
  element.dataset.midiStudioUnwiredStatus = statusText;
  element.title = tooltip;
  element.setAttribute("aria-label", `${originalAriaLabel} (${statusText})`);
}

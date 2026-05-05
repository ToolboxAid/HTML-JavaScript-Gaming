const TOOL_ID = "preview-generator-v2";
const TOOL_NAME = "Preview Generator V2";
const TOOL_DESCRIPTION = "Generate preview.svg assets for samples, games, and tools.";
const HEADER_TEXT = `${TOOL_NAME} - ${TOOL_DESCRIPTION}`;
const INTRO_TEXT = `${TOOL_NAME}: ${TOOL_DESCRIPTION}`;

let suppressFullscreenSync = false;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getHeaderDetails() {
  return document.querySelector(".is-collapsible");
}

function getSummaryElement() {
  return document.querySelector("[data-preview-generator-v2-summary]");
}

function getHeaderHost() {
  return document.querySelector("[data-preview-generator-v2-header]");
}

function getStatusHost() {
  return document.querySelector("[data-preview-generator-v2-status]");
}

function applyFullscreenState(isActive) {
  document.body.classList.toggle("tools-platform-fullscreen-active", isActive);
  document.documentElement.classList.toggle("tools-platform-fullscreen-active", isActive);
  if (isActive) {
    document.body.setAttribute("data-tools-platform-fullscreen", "1");
    document.documentElement.setAttribute("data-tools-platform-fullscreen", "1");
  } else {
    document.body.removeAttribute("data-tools-platform-fullscreen");
    document.documentElement.removeAttribute("data-tools-platform-fullscreen");
  }
}

function updateSummary() {
  const details = getHeaderDetails();
  const summary = getSummaryElement();
  if (!(details instanceof HTMLDetailsElement) || !(summary instanceof HTMLElement)) {
    return;
  }

  const isFullscreen = Boolean(document.fullscreenElement);
  const isExpanded = details.open === true;
  summary.textContent = isExpanded
    ? "Hide Header and Details"
    : (isFullscreen ? HEADER_TEXT : "Show Header and Details");

  if (isFullscreen) {
    summary.style.maxWidth = "calc(100vw - 24px)";
    summary.style.whiteSpace = "nowrap";
    summary.style.overflow = "hidden";
    summary.style.textOverflow = "ellipsis";
  } else {
    summary.style.removeProperty("max-width");
    summary.style.removeProperty("white-space");
    summary.style.removeProperty("overflow");
    summary.style.removeProperty("text-overflow");
  }

  summary.setAttribute("data-tools-platform-summary-active", "1");
  summary.setAttribute("data-tools-platform-summary-error", "0");
  summary.setAttribute("data-tools-platform-summary-state", isExpanded ? "expanded" : "collapsed");
  summary.setAttribute("data-tools-platform-summary-mode", isFullscreen ? "fullscreen" : "normal");
  summary.setAttribute("data-tool-id", TOOL_ID);
  summary.setAttribute("title", `${HEADER_TEXT}\n${INTRO_TEXT}`);
}

function renderHeader() {
  const headerHost = getHeaderHost();
  if (!(headerHost instanceof HTMLElement)) {
    return;
  }

  headerHost.innerHTML = `
    <section class="tools-platform-frame preview-generator-v2__local-shell-frame">
      <div class="tools-platform-frame__accordion-content">
        <div class="tools-platform-frame__accordion-summary">
          <div class="tools-platform-frame__summary-copy">
            <h1 class="tools-platform-frame__title" data-tool-id="${escapeHtml(TOOL_ID)}">${escapeHtml(TOOL_NAME)}</h1>
            <h2 class="tools-platform-frame__eyebrow">First-Class Tools Surface</h2>
          </div>
          <div class="tools-platform-frame__summary-meta">
            <div class="tools-platform-frame__meta">Tool-local shell, engine theme, and destination validation are active.</div>
          </div>
        </div>
        <div class="tools-platform-frame__topline">
          <p class="tools-platform-frame__description">${escapeHtml(TOOL_DESCRIPTION)}</p>
        </div>
      </div>
    </section>
  `;
}

function renderStatus() {
  const statusHost = getStatusHost();
  if (!(statusHost instanceof HTMLElement)) {
    return;
  }

  statusHost.innerHTML = `
    <div class="tools-platform-statusbar preview-generator-v2__local-statusbar">
      <span>Preview Generator V2 local shell is active.</span>
      <span>${escapeHtml(TOOL_NAME)} | No active workspace</span>
      <span>Destination schema is selected by target mode.</span>
    </div>
  `;
}

async function enterFullscreenIfAvailable() {
  if (document.fullscreenElement || !document.fullscreenEnabled) {
    return;
  }
  if (typeof document.documentElement?.requestFullscreen !== "function") {
    return;
  }
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    // Non-fatal: collapsed header state remains usable without fullscreen.
  }
}

async function exitFullscreenIfActive() {
  if (!document.fullscreenElement || typeof document.exitFullscreen !== "function") {
    return;
  }
  try {
    await document.exitFullscreen();
  } catch {
    // Non-fatal: the fullscreenchange listener will resync if the browser exits later.
  }
}

function bindHeaderDetails() {
  const details = getHeaderDetails();
  if (!(details instanceof HTMLDetailsElement)) {
    return;
  }

  details.addEventListener("toggle", () => {
    updateSummary();
    if (suppressFullscreenSync) {
      suppressFullscreenSync = false;
      return;
    }

    if (details.open) {
      void exitFullscreenIfActive();
      return;
    }

    void enterFullscreenIfAvailable();
  });

  document.addEventListener("fullscreenchange", () => {
    const isFullscreen = Boolean(document.fullscreenElement);
    applyFullscreenState(isFullscreen);
    if (!isFullscreen && !details.open) {
      suppressFullscreenSync = true;
      details.open = true;
    }
    updateSummary();
  });
}

function initPreviewGeneratorShell() {
  document.body.classList.add("tools-platform-surface", "preview-generator-v2-local-shell");
  applyFullscreenState(Boolean(document.fullscreenElement));
  renderHeader();
  renderStatus();
  bindHeaderDetails();
  updateSummary();
}

initPreviewGeneratorShell();

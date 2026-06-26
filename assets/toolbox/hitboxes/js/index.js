const FOUNDATION_MILESTONES = Object.freeze([
  Object.freeze({
    milestone: "Tool shell",
    notes: "Theme V2 page shell is available from the toolbox.",
    status: "Ready",
  }),
  Object.freeze({
    milestone: "Local API contract",
    notes: "Placeholder service boundary is reserved for later persistence work.",
    status: "Placeholder",
  }),
  Object.freeze({
    milestone: "Editor",
    notes: "Drawing and editing start in a later focused PR.",
    status: "Deferred",
  }),
]);

const elements = {
  contractCount: document.querySelector("[data-hitboxes-contract-count]"),
  foundationStatus: document.querySelector("[data-hitboxes-foundation-status]"),
  log: document.querySelector("[data-hitboxes-log]"),
  mode: document.querySelector("[data-hitboxes-mode]"),
  owner: document.querySelector("[data-hitboxes-owner]"),
  persistence: document.querySelector("[data-hitboxes-persistence]"),
  scopeCount: document.querySelector("[data-hitboxes-scope-count]"),
  service: document.querySelector("[data-hitboxes-service]"),
  table: document.querySelector("[data-hitboxes-foundation-table]"),
  toolState: document.querySelector("[data-hitboxes-tool-state]"),
};

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function createCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function createRow(milestone) {
  const row = document.createElement("tr");
  const heading = document.createElement("th");
  heading.scope = "row";
  heading.textContent = milestone.milestone;
  row.append(heading, createCell(milestone.status), createCell(milestone.notes));
  return row;
}

function renderFoundation() {
  elements.table?.replaceChildren(...FOUNDATION_MILESTONES.map(createRow));
  setText(elements.contractCount, String(FOUNDATION_MILESTONES.length));
  setText(elements.scopeCount, "0");
  setText(elements.foundationStatus, "Foundation ready");
  setText(elements.owner, "Team Delta");
  setText(elements.persistence, "Local API contract pending");
  setText(elements.service, "hitboxes-service-placeholder");
  setText(elements.mode, "read-only foundation");
  setText(elements.toolState, "Foundation");
  setText(elements.log, "Hitboxes foundation loaded. Drawing and editing are intentionally deferred.");
}

renderFoundation();

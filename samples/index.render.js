const METADATA_PATH = "./metadata/samples.index.metadata.json";
const BASE_PHASES = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19"
];
const PHASE_FALLBACK_DETAILS = {
  "16": {
    title: "Phase 16 - 3D Foundations",
    description: "3D execution track including camera, input, lighting, and runtime debug slices."
  },
  "17": {
    title: "Phase 17 - Advanced 3D + Gameplay",
    description: "Extended rendering and gameplay-focused 3D samples with integrated debug surfaces."
  },
  "18": {
    title: "Phase 18 - Runtime Hardening",
    description: "Runtime and boundary hardening slices that preserve engine/shared separation."
  },
  "19": {
    title: "Phase 19 - Integration Validation",
    description: "System integration and lifecycle validation for stable execution flow."
  }
};

export function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function dedupeSortedPhases(samples, phaseDetails) {
  const phaseSet = new Set();
  for (const detail of phaseDetails) {
    const id = normalize(detail.phase);
    if (/^\d{2}$/.test(id)) {
      phaseSet.add(id);
    }
  }
  for (const sample of samples) {
    const id = normalize(sample.phase);
    if (/^\d{2}$/.test(id)) {
      phaseSet.add(id);
    }
  }
  return [...phaseSet].sort((a, b) => Number(a) - Number(b));
}

export function buildPhaseRows(metadata) {
  const samples = Array.isArray(metadata?.samples) ? metadata.samples : [];
  const phaseDetails = Array.isArray(metadata?.phases) ? metadata.phases : [];
  const detailByPhase = new Map(
    phaseDetails
      .map((detail) => [normalize(detail.phase), detail])
      .filter(([phase]) => /^\d{2}$/.test(phase))
  );
  const phases = dedupeSortedPhases(samples, phaseDetails);
  for (const basePhase of BASE_PHASES) {
    phases.push(basePhase);
  }
  const normalizedPhases = [...new Set(phases)].sort((a, b) => Number(a) - Number(b));
  return normalizedPhases.map((phase) => {
    const sampleCount = samples.filter((entry) => normalize(entry.phase) === phase).length;
    const detail = detailByPhase.get(phase) || PHASE_FALLBACK_DETAILS[phase];
    const title = normalize(detail?.title) || `Phase ${phase}`;
    const description =
      normalize(detail?.description) || "Phase content available in the sample lane.";
    return {
      phase,
      href: `./phase-${phase}/${phase}01/index.html`,
      title,
      description
    };
  });
}

export function renderPhaseCards(container, rows) {
  container.innerHTML = "";
  for (const row of rows) {
    const card = document.createElement("a");
    card.className = "card-link";
    card.href = row.href;
    card.dataset.phase = row.phase;
    card.innerHTML = `<h3>${row.title}</h3><p>${row.description}</p>`;
    container.appendChild(card);
  }
}

export function filterPhaseRows(rows, query) {
  const normalizedQuery = normalize(query).toLowerCase();
  if (!normalizedQuery) {
    return rows;
  }
  return rows.filter((row) => {
    const haystack = `${row.phase} ${row.title} ${row.description}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function updateStatus(statusNode, shown, total, query) {
  const label = normalize(query);
  if (!label) {
    statusNode.textContent = `Showing all ${total} phases.`;
    return;
  }
  statusNode.textContent = `Showing ${shown} of ${total} phases for "${label}".`;
}

export async function initSamplesIndex() {
  const container = document.getElementById("samples-phase-list");
  const input = document.getElementById("samples-phase-filter-input");
  const statusNode = document.getElementById("samples-phase-filter-status");
  if (!container || !input || !statusNode) {
    return;
  }

  try {
    const response = await fetch(METADATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load samples metadata (${response.status})`);
    }
    const metadata = await response.json();
    const allRows = buildPhaseRows(metadata);
    const applyFilter = () => {
      const filteredRows = filterPhaseRows(allRows, input.value);
      renderPhaseCards(container, filteredRows);
      updateStatus(statusNode, filteredRows.length, allRows.length, input.value);
    };
    input.addEventListener("input", applyFilter);
    applyFilter();
  } catch (error) {
    container.innerHTML = "";
    statusNode.textContent = "Unable to load phase list. Verify local server access to sample metadata.";
    console.error(error);
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initSamplesIndex();
}

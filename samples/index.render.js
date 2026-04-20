const METADATA_PATH = "./metadata/samples.index.metadata.json";
const PINNED_KEY = "samples-index-pinned";

export function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTag(tag) {
  return normalize(tag).toLowerCase().replace(/[_\s]+/g, "-").replace(/-+/g, "-");
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function sortPhaseIds(values) {
  return [...new Set(values.filter((value) => /^\d{2}$/.test(value)))].sort((a, b) => Number(a) - Number(b));
}

function readPinnedSet() {
  try {
    const raw = window.localStorage.getItem(PINNED_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.map((value) => normalize(value)).filter((value) => /^\d{4}$/.test(value)));
  } catch {
    return new Set();
  }
}

function savePinnedSet(pinnedSet) {
  const ordered = [...pinnedSet].sort();
  window.localStorage.setItem(PINNED_KEY, JSON.stringify(ordered));
}

export function buildPhaseModel(metadata, pinnedSet = new Set()) {
  const phaseDetails = new Map(
    safeArray(metadata?.phases)
      .map((phase) => {
        const id = normalize(phase?.phase);
        return [id, {
          phase: id,
          title: normalize(phase?.title) || `Phase ${id}`,
          description: normalize(phase?.description)
        }];
      })
      .filter(([id]) => /^\d{2}$/.test(id))
  );

  const samples = safeArray(metadata?.samples)
    .map((sample) => {
      const id = normalize(sample?.id);
      const phase = normalize(sample?.phase);
      if (!/^\d{4}$/.test(id) || !/^\d{2}$/.test(phase)) {
        return null;
      }
      const title = normalize(sample?.indexLabel) || `Sample ${id} - ${normalize(sample?.title) || "Untitled"}`;
      const description = normalize(sample?.description) || "No description available.";
      const href = normalize(sample?.href) || `./phase-${phase}/${id}/index.html`;
      const tags = safeArray(sample?.tags).map((tag) => normalizeTag(tag)).filter(Boolean);
      const thumbnail = normalize(sample?.thumbnail) || normalize(sample?.preview) || "";
      return {
        id,
        phase,
        title,
        description,
        href,
        tags,
        thumbnail,
        pinned: pinnedSet.has(id)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));

  const phaseIds = sortPhaseIds([
    ...[...phaseDetails.keys()],
    ...samples.map((sample) => sample.phase)
  ]);

  return phaseIds.map((phase) => {
    const detail = phaseDetails.get(phase) || {
      phase,
      title: `Phase ${phase}`,
      description: "Phase samples"
    };
    const phaseSamples = samples.filter((sample) => sample.phase === phase);
    return {
      phase,
      title: detail.title,
      description: detail.description || `Samples for phase ${phase}.`,
      samples: phaseSamples
    };
  });
}

export function filterPhaseModel(phaseModel, query, pinnedOnly) {
  const normalizedQuery = normalize(query).toLowerCase();
  return phaseModel
    .map((phase) => {
      const phaseText = `${phase.phase} ${phase.title} ${phase.description}`.toLowerCase();
      const samples = phase.samples.filter((sample) => {
        if (pinnedOnly && !sample.pinned) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }
        const sampleText = `${sample.id} ${sample.title} ${sample.description} ${sample.tags.join(" ")}`.toLowerCase();
        return phaseText.includes(normalizedQuery) || sampleText.includes(normalizedQuery);
      });
      if (!normalizedQuery && !pinnedOnly) {
        return phase;
      }
      return { ...phase, samples };
    })
    .filter((phase) => phase.samples.length > 0);
}

function buildSampleCard(sample) {
  const card = document.createElement("article");
  card.className = "card-link";
  card.dataset.sampleId = sample.id;

  const header = document.createElement("p");
  header.textContent = `Sample ${sample.id}`;

  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = sample.href;
  titleLink.textContent = sample.title;
  titleLink.className = "sample-link";
  title.appendChild(titleLink);

  const description = document.createElement("p");
  description.textContent = sample.description;

  const tagLine = document.createElement("p");
  tagLine.textContent = sample.tags.length > 0 ? `Tags: ${sample.tags.join(", ")}` : "Tags: none";

  const actions = document.createElement("p");
  const pinButton = document.createElement("button");
  pinButton.type = "button";
  pinButton.dataset.samplePin = sample.id;
  pinButton.textContent = sample.pinned ? "Unpin" : "Pin";
  actions.appendChild(pinButton);

  card.appendChild(header);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(tagLine);
  card.appendChild(actions);
  return card;
}

export function renderPhaseModel(container, phaseModel) {
  container.innerHTML = "";
  for (const phase of phaseModel) {
    const section = document.createElement("section");
    section.className = "content-section";
    section.dataset.phase = phase.phase;

    const h = document.createElement("h2");
    h.textContent = phase.title;

    const d = document.createElement("p");
    d.textContent = phase.description;

    const grid = document.createElement("div");
    grid.className = "card-grid";
    for (const sample of phase.samples) {
      grid.appendChild(buildSampleCard(sample));
    }

    section.appendChild(h);
    section.appendChild(d);
    section.appendChild(grid);
    container.appendChild(section);
  }
}

export function updateStatus(statusNode, visiblePhases, totalPhases, visibleSamples, totalSamples, query, pinnedOnly) {
  const q = normalize(query);
  const pinnedLabel = pinnedOnly ? " (pinned only)" : "";
  if (!q) {
    statusNode.textContent = `Showing ${visibleSamples} of ${totalSamples} samples across ${visiblePhases} of ${totalPhases} phases${pinnedLabel}.`;
    return;
  }
  statusNode.textContent = `Showing ${visibleSamples} of ${totalSamples} samples across ${visiblePhases} of ${totalPhases} phases for "${q}"${pinnedLabel}.`;
}

function countSamples(phaseModel) {
  return phaseModel.reduce((total, phase) => total + phase.samples.length, 0);
}

export async function initSamplesIndex() {
  const container = document.getElementById("samples-phase-list");
  const input = document.getElementById("samples-phase-filter-input");
  const pinnedOnlyInput = document.getElementById("samples-phase-filter-pinned-only");
  const statusNode = document.getElementById("samples-phase-filter-status");
  if (!container || !input || !statusNode || !pinnedOnlyInput) {
    return;
  }

  try {
    const response = await fetch(METADATA_PATH, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to load samples metadata (${response.status})`);
    }

    const metadata = await response.json();
    let pinnedSet = readPinnedSet();

    const apply = () => {
      const allPhases = buildPhaseModel(metadata, pinnedSet);
      const filtered = filterPhaseModel(allPhases, input.value, pinnedOnlyInput.checked);
      renderPhaseModel(container, filtered);
      updateStatus(
        statusNode,
        filtered.length,
        allPhases.length,
        countSamples(filtered),
        countSamples(allPhases),
        input.value,
        pinnedOnlyInput.checked
      );
    };

    container.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }
      const id = normalize(target.dataset.samplePin);
      if (!/^\d{4}$/.test(id)) {
        return;
      }
      if (pinnedSet.has(id)) {
        pinnedSet.delete(id);
      } else {
        pinnedSet.add(id);
      }
      savePinnedSet(pinnedSet);
      apply();
    });

    input.addEventListener("input", apply);
    pinnedOnlyInput.addEventListener("change", apply);
    apply();
  } catch (error) {
    container.innerHTML = "";
    statusNode.textContent = "Unable to load sample list. Verify local server access to sample metadata.";
    console.error(error);
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initSamplesIndex();
}
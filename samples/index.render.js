const METADATA_PATH = "./metadata/samples.index.metadata.json";
const PINNED_KEY = "samples-index-pinned";

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalize(value).toLowerCase();
}

function normalizeTag(value) {
  return normalizeToken(value).replace(/[_\s]+/g, "-").replace(/-+/g, "-");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function sortPhase(phaseA, phaseB) {
  return Number(phaseA) - Number(phaseB);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    return new Set(parsed.map((entry) => normalize(entry)).filter((entry) => /^\d{4}$/.test(entry)));
  } catch {
    return new Set();
  }
}

function writePinnedSet(pinnedSet) {
  window.localStorage.setItem(PINNED_KEY, JSON.stringify([...pinnedSet].sort()));
}

function buildClassTokens(classValues, engineClassesUsed) {
  const classEntries = asArray(classValues).length > 0 ? asArray(classValues) : asArray(engineClassesUsed);
  const deduped = [...new Set(classEntries.map((entry) => normalize(entry)).filter(Boolean))];
  return deduped
    .map((entry) => {
      const name = entry.split("/").at(-1) || entry;
      return { value: entry, label: name };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

function buildSampleRows(metadata, pinnedSet) {
  const phaseInfoMap = new Map(
    asArray(metadata?.phases)
      .map((phase) => {
        const phaseId = normalize(phase?.phase);
        return [
          phaseId,
          {
            phase: phaseId,
            title: normalize(phase?.title) || `Phase ${phaseId}`,
            description: normalize(phase?.description) || `Samples for phase ${phaseId}.`
          }
        ];
      })
      .filter(([phaseId]) => /^\d{2}$/.test(phaseId))
  );

  const sampleRows = asArray(metadata?.samples)
    .map((sample) => {
      const id = normalize(sample?.id);
      const phase = normalize(sample?.phase);
      if (!/^\d{4}$/.test(id) || !/^\d{2}$/.test(phase)) {
        return null;
      }
      const titleText = normalize(sample?.title) || "Untitled";
      const phaseInfo = phaseInfoMap.get(phase);
      const explicitLabel = normalize(sample?.indexLabel);
      const titleAlreadyPrefixed = new RegExp(`^sample\\s+${id}\\s*-`, "i").test(titleText);
      const title = explicitLabel || (titleAlreadyPrefixed ? titleText : `Sample ${id} - ${titleText}`);
      const description = normalize(sample?.description) || "No description available.";
      const href = normalize(sample?.href) || `./phase-${phase}/${id}/index.html`;
      const tags = asArray(sample?.tags).map((tag) => normalizeTag(tag)).filter(Boolean);
      const classTokens = buildClassTokens(sample?.classValues, sample?.engineClassesUsed);
      const previewSrc = normalize(sample?.thumbnail) || normalize(sample?.preview) || "";
      return {
        id,
        phase,
        phaseTitle: phaseInfo?.title || `Phase ${phase}`,
        phaseDescription: phaseInfo?.description || `Samples for phase ${phase}.`,
        title,
        description,
        href,
        tags,
        classTokens,
        previewSrc,
        pinned: pinnedSet.has(id)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));

  const phases = [...new Set(sampleRows.map((sample) => sample.phase))].sort(sortPhase);
  const classes = [...new Map(
    sampleRows.flatMap((sample) => sample.classTokens).map((token) => [token.value, token.label])
  ).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  const tags = [...new Set(sampleRows.flatMap((sample) => sample.tags))].sort();

  return { sampleRows, phases, classes, tags, phaseInfoMap };
}

function filterSampleRows(sampleRows, filterState) {
  const query = normalizeToken(filterState.query);
  return sampleRows.filter((sample) => {
    if (filterState.phase && sample.phase !== filterState.phase) {
      return false;
    }
    if (filterState.className && !sample.classTokens.some((token) => token.value === filterState.className)) {
      return false;
    }
    if (filterState.tag && !sample.tags.includes(filterState.tag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const classText = sample.classTokens.map((token) => `${token.label} ${token.value}`).join(" ");
    const haystack = `${sample.phase} ${sample.phaseTitle} ${sample.id} ${sample.title} ${sample.description} ${sample.tags.join(" ")} ${classText}`.toLowerCase();
    return haystack.includes(query);
  });
}

function groupByPhase(sampleRows, phaseInfoMap) {
  const grouped = new Map();
  for (const sample of sampleRows) {
    if (!grouped.has(sample.phase)) {
      const phaseInfo = phaseInfoMap.get(sample.phase);
      grouped.set(sample.phase, {
        phase: sample.phase,
        title: phaseInfo?.title || `Phase ${sample.phase}`,
        description: phaseInfo?.description || `Samples for phase ${sample.phase}.`,
        samples: []
      });
    }
    grouped.get(sample.phase).samples.push(sample);
  }
  return [...grouped.values()].sort((a, b) => sortPhase(a.phase, b.phase));
}

function buildSampleCard(sample) {
  const card = document.createElement("article");
  card.className = "card-link sample-card";
  card.dataset.sampleId = sample.id;

  const previewWrap = document.createElement("div");
  previewWrap.className = "sample-preview-wrap";

  const launch = document.createElement("a");
  launch.className = "sample-preview-link";
  launch.href = sample.href;
  launch.setAttribute("aria-label", `${sample.title} preview`);
  if (sample.previewSrc) {
    launch.innerHTML = `<img class="sample-thumb" loading="lazy" decoding="async" alt="${escapeHtml(sample.title)} thumbnail" src="${escapeHtml(sample.previewSrc)}">`;
  } else {
    launch.textContent = "No Preview";
    launch.classList.add("sample-preview-missing");
  }

  const pinInputId = `sample-pin-${sample.id}`;
  const pinInput = document.createElement("input");
  pinInput.id = pinInputId;
  pinInput.type = "checkbox";
  pinInput.className = "sample-pin-toggle";
  pinInput.dataset.samplePin = sample.id;
  pinInput.checked = sample.pinned;

  const pinLabel = document.createElement("label");
  pinLabel.className = "sample-pin-label";
  pinLabel.setAttribute("for", pinInputId);
  pinLabel.setAttribute("title", sample.pinned ? "Unpin" : "Pin");
  pinLabel.setAttribute("aria-label", sample.pinned ? "Unpin sample" : "Pin sample");
  pinLabel.innerHTML = `<span class="sample-pin-icon" aria-hidden="true"></span>`;

  previewWrap.appendChild(launch);

  const title = document.createElement("h3");
  title.className = "sample-title-row";
  title.appendChild(pinInput);
  title.appendChild(pinLabel);
  const titleLink = document.createElement("a");
  titleLink.className = "sample-title-link";
  titleLink.href = sample.href;
  titleLink.textContent = sample.title;
  title.appendChild(titleLink);

  const description = document.createElement("p");
  description.textContent = sample.description;

  card.appendChild(title);
  card.appendChild(previewWrap);
  card.appendChild(description);
  return card;
}

function renderPinnedList(container, rows) {
  container.innerHTML = "";
  if (rows.length === 0) {
    const note = document.createElement("p");
    note.textContent = "No pinned samples yet.";
    container.appendChild(note);
    return;
  }
  for (const sample of rows) {
    container.appendChild(buildSampleCard(sample));
  }
}

function renderPhaseSections(container, phaseGroups) {
  container.innerHTML = "";
  for (const phaseGroup of phaseGroups) {
    const section = document.createElement("section");
    section.className = "content-section";
    section.dataset.phase = phaseGroup.phase;
    section.innerHTML = `<h2>${escapeHtml(phaseGroup.title)}</h2><p>${escapeHtml(phaseGroup.description)}</p>`;
    const grid = document.createElement("div");
    grid.className = "card-grid";
    for (const sample of phaseGroup.samples) {
      grid.appendChild(buildSampleCard(sample));
    }
    section.appendChild(grid);
    container.appendChild(section);
  }
}

function updateStatus(node, filteredRows, totalRows, phaseGroups) {
  const totalPhases = new Set(totalRows.map((entry) => entry.phase)).size;
  node.textContent = `Showing ${filteredRows.length} of ${totalRows.length} samples across ${phaseGroups.length} of ${totalPhases} phases.`;
}

function setSelectOptions(selectNode, values, labelResolver) {
  const first = selectNode.querySelector("option");
  selectNode.innerHTML = "";
  if (first) {
    selectNode.appendChild(first);
  }
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labelResolver(value);
    selectNode.appendChild(option);
  }
}

export async function initSamplesIndex() {
  const listContainer = document.getElementById("samples-phase-list");
  const pinnedContainer = document.getElementById("samples-pinned-list");
  const phaseSelect = document.getElementById("samples-filter-phase");
  const classSelect = document.getElementById("samples-filter-class");
  const tagSelect = document.getElementById("samples-filter-tag");
  const searchInput = document.getElementById("samples-phase-filter-input");
  const statusNode = document.getElementById("samples-phase-filter-status");
  if (!listContainer || !pinnedContainer || !phaseSelect || !classSelect || !tagSelect || !searchInput || !statusNode) {
    return;
  }

  const response = await fetch(METADATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    statusNode.textContent = "Unable to load sample list metadata.";
    return;
  }
  const metadata = await response.json();
  let pinnedSet = readPinnedSet();

  const model = buildSampleRows(metadata, pinnedSet);
  setSelectOptions(phaseSelect, model.phases, (value) => `Phase ${value}`);
  setSelectOptions(classSelect, model.classes.map((entry) => entry.value), (value) => {
    const found = model.classes.find((entry) => entry.value === value);
    return found?.label || value.split("/").at(-1) || value;
  });
  setSelectOptions(tagSelect, model.tags, (value) => value);

  const render = () => {
    const nextModel = buildSampleRows(metadata, pinnedSet);
    const filterState = {
      phase: normalize(phaseSelect.value),
      className: normalize(classSelect.value),
      tag: normalize(tagSelect.value),
      query: normalize(searchInput.value)
    };
    const filteredRows = filterSampleRows(nextModel.sampleRows, filterState);
    const pinnedRows = filteredRows.filter((entry) => entry.pinned);
    const phaseGroups = groupByPhase(filteredRows, nextModel.phaseInfoMap);
    renderPinnedList(pinnedContainer, pinnedRows);
    renderPhaseSections(listContainer, phaseGroups);
    updateStatus(statusNode, filteredRows, nextModel.sampleRows, phaseGroups);
  };

  const handlePinEvent = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return;
    }
    const sampleId = normalize(target.dataset.samplePin);
    if (!/^\d{4}$/.test(sampleId)) {
      return;
    }
    if (target.checked) {
      pinnedSet.add(sampleId);
    } else {
      pinnedSet.delete(sampleId);
    }
    writePinnedSet(pinnedSet);
    render();
  };

  listContainer.addEventListener("change", handlePinEvent);
  pinnedContainer.addEventListener("change", handlePinEvent);

  phaseSelect.addEventListener("change", render);
  classSelect.addEventListener("change", render);
  tagSelect.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  render();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initSamplesIndex();
}

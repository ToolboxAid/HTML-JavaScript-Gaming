import { getToolRegistry } from "../tools/toolRegistry.js";

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

function toStandaloneToolHref(entryPoint) {
  const normalized = String(entryPoint || "").replace(/^\.?\/*/, "");
  return normalized ? `/tools/${encodeURI(normalized)}` : "";
}

function normalizePresetPath(value) {
  const normalized = normalize(value).replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  if (normalized.startsWith("/samples/")) {
    return normalized;
  }
  if (normalized.startsWith("samples/")) {
    return `/${normalized}`;
  }
  if (normalized.startsWith("./samples/")) {
    return `/${normalized.slice(2)}`;
  }
  return "";
}

function getExplicitRoundtripPresetPath(sample, toolId) {
  const safeToolId = normalizeToken(toolId);
  if (!safeToolId) {
    return "";
  }
  const mappedEntries = asArray(sample?.roundtripToolPresets);
  for (const entry of mappedEntries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const mappedToolId = normalizeToken(entry.toolId);
    if (mappedToolId !== safeToolId) {
      continue;
    }
    const presetPath = normalizePresetPath(entry.presetPath);
    if (presetPath) {
      return presetPath;
    }
  }
  return "";
}

function buildRoundtripLinks(sample, toolRegistryMap) {
  const orderedToolHints = asArray(sample?.toolHints)
    .map((entry) => normalizeToken(entry))
    .filter(Boolean)
    .filter((toolId) => toolId !== "workspace-manager");
  const dedupedToolHints = [...new Set(orderedToolHints)];
  const links = [];

  dedupedToolHints.forEach((toolId) => {
    const tool = toolRegistryMap.get(toolId);
    if (!tool) {
      return;
    }
    const baseHref = toStandaloneToolHref(tool.entryPoint);
    if (!baseHref) {
      return;
    }

    let href = baseHref;
    let label = `Open ${normalize(tool.displayName) || normalize(tool.name) || toolId}`;
    const presetPath = getExplicitRoundtripPresetPath(sample, toolId);
    if (presetPath) {
      href = `${baseHref}?sampleId=${encodeURIComponent(sample.id)}&sampleTitle=${encodeURIComponent(sample.title || "")}&samplePresetPath=${encodeURIComponent(presetPath)}`;
    }

    links.push({ toolId, href, label });
  });

  return links;
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
    .filter((entry) => {
      const phase20SampleMatch = entry.match(/^samples\/phase-20\/(\d{4})$/i);
      if (!phase20SampleMatch) {
        return true;
      }
      const sampleNumber = Number(phase20SampleMatch[1]);
      return !Number.isInteger(sampleNumber) || sampleNumber < 2001 || sampleNumber > 2051;
    })
    .map((entry) => {
      const name = entry.split("/").at(-1) || entry;
      return { value: entry, label: name };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

function buildToolTokens(toolHints, toolLabelMap) {
  const deduped = [...new Set(asArray(toolHints).map((entry) => normalizeToken(entry)).filter(Boolean))];
  return deduped
    .filter((toolId) => toolId !== "workspace-manager")
    .map((toolId) => ({
      value: toolId,
      label: toolLabelMap.get(toolId) || toolId
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

function buildSampleRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap) {
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
      const toolTokens = buildToolTokens(sample?.toolHints, toolLabelMap);
      const roundtripLinks = buildRoundtripLinks({ id, phase, toolHints: sample?.toolHints }, toolRegistryMap);
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
        toolTokens,
        roundtripLinks,
        previewSrc,
        pinned: pinnedSet.has(id)
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));

  const phases = [...new Set(sampleRows.map((sample) => sample.phase))].sort(sortPhase);
  const phaseOptions = phases.map((phase) => {
    const info = phaseInfoMap.get(phase);
    const phaseTitle = normalize(info?.title) || `Phase ${phase}`;
    return {
      value: phase,
      label: phaseTitle
    };
  });
  const classes = [...new Map(
    sampleRows.flatMap((sample) => sample.classTokens).map((token) => [token.value, token.label])
  ).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  const tools = [...new Map(
    sampleRows.flatMap((sample) => sample.toolTokens).map((token) => [token.value, token.label])
  ).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  const tags = [...new Set(sampleRows.flatMap((sample) => sample.tags))].sort();

  return { sampleRows, phases, phaseOptions, classes, tools, tags, phaseInfoMap };
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
    if (filterState.toolId && !sample.toolTokens.some((token) => token.value === filterState.toolId)) {
      return false;
    }
    if (filterState.tag && !sample.tags.includes(filterState.tag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const classText = sample.classTokens.map((token) => `${token.label} ${token.value}`).join(" ");
    const toolText = sample.toolTokens.map((token) => `${token.label} ${token.value}`).join(" ");
    const haystack = `${sample.phase} ${sample.phaseTitle} ${sample.id} ${sample.title} ${sample.description} ${sample.tags.join(" ")} ${classText} ${toolText}`.toLowerCase();
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
  pinInput.className = "pin-toggle";
  pinInput.dataset.samplePin = sample.id;
  pinInput.checked = sample.pinned;

  const pinLabel = document.createElement("label");
  pinLabel.className = "pin-label";
  pinLabel.setAttribute("for", pinInputId);
  pinLabel.setAttribute("title", sample.pinned ? "Unpin" : "Pin");
  pinLabel.setAttribute("aria-label", sample.pinned ? "Unpin sample" : "Pin sample");
  pinLabel.innerHTML = `<span class="pin-icon" aria-hidden="true"></span>`;

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
  if (Array.isArray(sample.roundtripLinks) && sample.roundtripLinks.length > 0) {
    const roundtripSection = document.createElement("section");
    roundtripSection.className = "sample-tool-roundtrip";
    roundtripSection.innerHTML = `
      <h4>Tool Roundtrip Links</h4>
      <p>Use these to validate tool to sample and sample back to tool workflows.</p>
      <ul>
        ${sample.roundtripLinks.map((entry) => `<li><a href="${escapeHtml(entry.href)}">${escapeHtml(entry.label)}</a></li>`).join("")}
      </ul>
    `;
    card.appendChild(roundtripSection);
  }
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
    const section = document.createElement("details");
    section.className = "is-collapsible samples-phase-accordion";
    section.dataset.phase = phaseGroup.phase;
    section.open = true;

    const summary = document.createElement("summary");
    summary.className = "is-collapsible__summary";
    summary.innerHTML = `
      <span class="samples-phase-accordion__title">${escapeHtml(phaseGroup.title)}</span>
      <span class="samples-phase-accordion__count">${phaseGroup.samples.length} sample${phaseGroup.samples.length === 1 ? "" : "s"}</span>
    `;

    const content = document.createElement("div");
    content.className = "is-collapsible__content samples-phase-accordion__content";
    content.innerHTML = `<p>${escapeHtml(phaseGroup.description)}</p>`;

    const grid = document.createElement("div");
    grid.className = "card-grid";
    for (const sample of phaseGroup.samples) {
      grid.appendChild(buildSampleCard(sample));
    }
    content.appendChild(grid);
    section.appendChild(summary);
    section.appendChild(content);
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
  const toolSelect = document.getElementById("samples-filter-tool");
  const tagSelect = document.getElementById("samples-filter-tag");
  const searchInput = document.getElementById("samples-phase-filter-input");
  const statusNode = document.getElementById("samples-phase-filter-status");
  if (!listContainer || !pinnedContainer || !phaseSelect || !classSelect || !toolSelect || !tagSelect || !searchInput || !statusNode) {
    return;
  }

  const response = await fetch(METADATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    statusNode.textContent = "Unable to load sample list metadata.";
    return;
  }
  const metadata = await response.json();
  let pinnedSet = readPinnedSet();
  const toolRegistry = getToolRegistry();
  const toolLabelMap = new Map(
    toolRegistry
      .filter((tool) => tool.id !== "workspace-manager")
      .map((tool) => [normalizeToken(tool.id), normalize(tool.displayName) || normalize(tool.name) || normalize(tool.id)])
      .filter((entry) => entry[0] && entry[1])
  );
  const toolRegistryMap = new Map(
    toolRegistry
      .filter((tool) => tool.id !== "workspace-manager")
      .map((tool) => [normalizeToken(tool.id), tool])
      .filter((entry) => entry[0] && entry[1])
  );

  const model = buildSampleRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap);
  setSelectOptions(phaseSelect, model.phaseOptions.map((entry) => entry.value), (value) => {
    const found = model.phaseOptions.find((entry) => entry.value === value);
    return found?.label || `Phase ${value}`;
  });
  setSelectOptions(classSelect, model.classes.map((entry) => entry.value), (value) => {
    const found = model.classes.find((entry) => entry.value === value);
    return found?.label || value.split("/").at(-1) || value;
  });
  setSelectOptions(toolSelect, model.tools.map((entry) => entry.value), (value) => {
    const found = model.tools.find((entry) => entry.value === value);
    return found?.label || value;
  });
  setSelectOptions(tagSelect, model.tags, (value) => value);
  const toolQuery = normalizeToken(new URLSearchParams(window.location.search).get("tool"));
  if (toolQuery && model.tools.some((entry) => entry.value === toolQuery)) {
    toolSelect.value = toolQuery;
  }

  const render = () => {
    const nextModel = buildSampleRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap);
    const filterState = {
      phase: normalize(phaseSelect.value),
      className: normalize(classSelect.value),
      toolId: normalizeToken(toolSelect.value),
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
  toolSelect.addEventListener("change", render);
  tagSelect.addEventListener("change", render);
  searchInput.addEventListener("input", render);

  render();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initSamplesIndex();
}

import { getToolRegistry } from "../tools/toolRegistry.js";

const METADATA_PATH = "./metadata/games.index.metadata.json";
const GAMES_PINNED_KEY = "games-index-pinned";

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalize(value).toLowerCase();
}

function normalizeTag(value) {
  return normalizeToken(value).replace(/[_\s]+/g, "-").replace(/-+/g, "-");
}

function levelSortKey(level) {
  const value = normalize(level);
  const numericMatch = value.match(/Level\s+(\d+)/i);
  if (numericMatch) {
    return { bucket: 0, order: Number(numericMatch[1]), label: value };
  }
  if (/LovelXX/i.test(value)) {
    return { bucket: 2, order: Number.POSITIVE_INFINITY, label: value };
  }
  return { bucket: 1, order: Number.POSITIVE_INFINITY, label: value };
}

function sortLevels(a, b) {
  const left = levelSortKey(a);
  const right = levelSortKey(b);
  if (left.bucket !== right.bucket) {
    return left.bucket - right.bucket;
  }
  if (left.order !== right.order) {
    return left.order - right.order;
  }
  return left.label.localeCompare(right.label, undefined, { sensitivity: "base" });
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeGameHref(value) {
  const href = normalize(value).replace(/\\/g, "/");
  if (!href || href.includes("..") || !href.startsWith("/games/")) {
    return "";
  }
  return href;
}

function normalizePresetPath(value) {
  const normalized = normalize(value).replace(/\\/g, "/");
  if (!normalized || normalized.includes("..")) {
    return "";
  }
  if (normalized.startsWith("/samples/")) {
    return normalized;
  }
  if (normalized.startsWith("/games/")) {
    return normalized;
  }
  if (normalized.startsWith("samples/")) {
    return `/${normalized}`;
  }
  if (normalized.startsWith("games/")) {
    return `/${normalized}`;
  }
  if (normalized.startsWith("./samples/")) {
    return `/${normalized.slice(2)}`;
  }
  if (normalized.startsWith("./games/")) {
    return `/${normalized.slice(2)}`;
  }
  return "";
}

function getExplicitRoundtripPresetPath(game, toolId) {
  const safeToolId = normalizeToken(toolId);
  if (!safeToolId) {
    return "";
  }
  const mappedEntries = asArray(game?.roundtripToolPresets);
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

function buildWorkspaceManagerHref(gameId) {
  const normalizedGameId = normalize(gameId);
  return normalizedGameId
    ? `/tools/Workspace%20Manager/index.html?game=${encodeURIComponent(normalizedGameId)}`
    : "/tools/Workspace%20Manager/index.html";
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

function buildRoundtripLinks(game, toolRegistryMap) {
  const orderedToolHints = asArray(game?.toolHints)
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
    const workspaceHref = "/tools/Workspace%20Manager/index.html";
    const query = new URLSearchParams();
    query.set("tool", tool.id);
    query.set("game", game.id);
    query.set("gameId", game.id);
    if (game.title) {
      query.set("gameTitle", game.title);
    }
    if (game.href) {
      query.set("gameHref", game.href);
    }
    const presetPath = getExplicitRoundtripPresetPath(game, tool.id);
    if (presetPath) {
      query.set("samplePresetPath", presetPath);
      const sampleIdMatch = /sample-(\d{4})-[^.]+\.json$/i.exec(presetPath);
      if (sampleIdMatch?.[1]) {
        query.set("sampleId", sampleIdMatch[1]);
      }
    }
    query.set("workspaceHref", buildWorkspaceManagerHref(game.id));
    const href = `${workspaceHref}?${query.toString()}`;
    const label = `Open ${normalize(tool.displayName) || normalize(tool.name) || toolId}`;
    links.push({ toolId, href, label });
  });

  return links;
}

function statusLabel(status) {
  switch (status) {
    case "playable":
      return "Playable";
    case "in-progress":
      return "In Progress";
    case "planned":
      return "Planned";
    default:
      return "Unknown";
  }
}

function readPinnedSet() {
  try {
    const raw = window.localStorage.getItem(GAMES_PINNED_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.map((entry) => normalize(entry)).filter(Boolean));
  } catch {
    return new Set();
  }
}

function writePinnedSet(pinnedSet) {
  window.localStorage.setItem(GAMES_PINNED_KEY, JSON.stringify([...pinnedSet].sort()));
}

function buildRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap) {
  const rows = asArray(metadata?.games)
    .map((game) => {
      const id = normalize(game?.id);
      const title = normalize(game?.title) || id;
      const level = normalize(game?.level) || "Unassigned";
      if (!id || !title) {
        return null;
      }
      const classValues = [...new Set(asArray(game?.classValues).map((value) => normalize(value)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      const tags = [...new Set(asArray(game?.tags).map((value) => normalizeTag(value)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
      const href = normalizeGameHref(game?.href);
      const toolTokens = buildToolTokens(game?.toolHints, toolLabelMap);
      const roundtripLinks = buildRoundtripLinks({
        id,
        title,
        href,
        toolHints: game?.toolHints,
        roundtripToolPresets: game?.roundtripToolPresets
      }, toolRegistryMap);
      return {
        id,
        title,
        description: normalize(game?.description) || "No description available.",
        level,
        status: normalize(game?.status) || "planned",
        classValues,
        toolTokens,
        roundtripLinks,
        tags,
        preview: normalize(game?.preview),
        href,
        workspaceHref: href ? buildWorkspaceManagerHref(id) : "",
        sampleTrack: game?.sampleTrack === true,
        debugShowcase: game?.debugShowcase === true,
        requiresService: game?.requiresService === true
        ,
        pinned: pinnedSet.has(id)
      };
    })
    .filter(Boolean);

  const levels = [...new Set(rows.map((row) => row.level))].sort(sortLevels);
  const classes = [...new Set(rows.flatMap((row) => row.classValues))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  const tools = [...new Map(
    rows.flatMap((row) => row.toolTokens).map((token) => [token.value, token.label])
  ).entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  const skinEditorLabel = toolLabelMap.get("skin-editor");
  if (skinEditorLabel && !tools.some((entry) => entry.value === "skin-editor")) {
    tools.push({ value: "skin-editor", label: skinEditorLabel });
    tools.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }
  const tags = [...new Set(rows.flatMap((row) => row.tags))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return { rows, levels, classes, tools, tags };
}

function filterRows(rows, state) {
  const query = normalizeToken(state.query);
  return rows.filter((row) => {
    if (state.level && row.level !== state.level) {
      return false;
    }
    if (state.classValue && !row.classValues.includes(state.classValue)) {
      return false;
    }
    if (state.toolId && !row.toolTokens.some((token) => token.value === state.toolId)) {
      return false;
    }
    if (state.tag && !row.tags.includes(state.tag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const toolText = row.toolTokens.map((token) => `${token.label} ${token.value}`).join(" ");
    const haystack = `${row.level} ${row.title} ${row.description} ${row.classValues.join(" ")} ${toolText} ${row.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });
}

function groupByLevel(rows) {
  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.level)) {
      grouped.set(row.level, []);
    }
    grouped.get(row.level).push(row);
  }
  return [...grouped.entries()]
    .sort((a, b) => sortLevels(a[0], b[0]))
    .map(([level, items]) => ({ level, items }));
}

function badge(className, text) {
  return `<span class="game-badge ${className}">${escapeHtml(text)}</span>`;
}

function renderCard(row, instanceKey = "main") {
  const article = document.createElement("article");
  article.className = "card-link game-card";
  article.dataset.gameId = row.id;

  const launchHref = row.workspaceHref || "";
  const previewHtml = row.preview
    ? `<a class="game-preview-link" href="${escapeHtml(launchHref || "#")}" ${launchHref ? "" : "aria-disabled=\"true\""}><img class="game-thumb" loading="lazy" decoding="async" alt="${escapeHtml(row.title)} thumbnail" src="${escapeHtml(row.preview)}"></a>`
    : `<span class="game-preview-link game-preview-missing">No Preview</span>`;

  const pinInputId = `game-pin-${escapeHtml(row.id)}-${escapeHtml(instanceKey)}`;
  const titleLabel = launchHref
    ? `<a class="game-title-link" href="${escapeHtml(launchHref)}">${escapeHtml(row.title)}</a>`
    : `${escapeHtml(row.title)}`;
  const titleHtml = `<h3 class="game-title-row"><input id="${pinInputId}" type="checkbox" class="pin-toggle" data-game-pin="${escapeHtml(row.id)}" ${row.pinned ? "checked" : ""}><label for="${pinInputId}" class="pin-label" title="${row.pinned ? "Unpin" : "Pin"}" aria-label="${row.pinned ? "Unpin game" : "Pin game"}"><span class="pin-icon" aria-hidden="true"></span></label>${titleLabel}</h3>`;

  const badges = [
    badge(`game-badge--${row.status}`, statusLabel(row.status)),
    row.sampleTrack ? badge("game-badge--sample-track", "Sample Track") : "",
    row.debugShowcase ? badge("game-badge--debug-showcase", "Debug Showcase") : ""
  ].filter(Boolean).join("");

  const classText = row.classValues.length > 0 ? row.classValues.map((value) => value.split("/").at(-1) || value).join(", ") : "none";
  const tagText = row.tags.length > 0 ? row.tags.join(", ") : "none";
  const workspaceSection = row.workspaceHref
    ? `
      <section class="game-tool-roundtrip">
        <h4>Open with Workspace Manager</h4>
        <p><a href="${escapeHtml(row.workspaceHref)}">Open with Workspace Manager</a></p>
        <h4>JSON Input</h4>
        <p>Paste JSON to inspect arbitrary state payloads.</p>
      </section>
    `
    : "";
  const roundtripSection = Array.isArray(row.roundtripLinks) && row.roundtripLinks.length > 0
    ? `
      <section class="game-tool-roundtrip">
        <h4>Tool Roundtrip Links</h4>
        <p>Open game-related tools with workspace context and a return path back to Games.</p>
        <ul>
          ${row.roundtripLinks.map((entry) => `<li><a href="${escapeHtml(entry.href)}">${escapeHtml(entry.label)}</a></li>`).join("")}
        </ul>
      </section>
    `
    : "";

  article.innerHTML = `
    ${titleHtml}
    <div class="game-badges">${badges}</div>
    ${previewHtml}
    <p>${escapeHtml(row.description)}</p>
    ${workspaceSection}
    ${roundtripSection}
    <p>Classes: ${escapeHtml(classText)}</p>
    <p>Tags: ${escapeHtml(tagText)}</p>
    ${row.requiresService ? '<p class="game-service-note">Requires background service.</p>' : ""}
  `;
  return article;
}

function setSelect(selectNode, values, labelFn) {
  const first = selectNode.querySelector("option");
  selectNode.innerHTML = "";
  if (first) {
    selectNode.appendChild(first);
  }
  for (const value of values) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = labelFn(value);
    selectNode.appendChild(opt);
  }
}

function render(container, statusNode, rows, state) {
  const filtered = filterRows(rows, state);
  const groups = groupByLevel(filtered);
  container.innerHTML = "";
  for (const group of groups) {
    const section = document.createElement("details");
    section.className = "is-collapsible games-level-accordion";
    section.dataset.level = group.level;
    section.open = true;
    const summary = document.createElement("summary");
    summary.className = "is-collapsible__summary";
    summary.innerHTML = `
      <span class="games-level-accordion__title">${escapeHtml(group.level)}</span>
      <span class="games-level-accordion__count">${group.items.length} game${group.items.length === 1 ? "" : "s"}</span>
    `;
    const content = document.createElement("div");
    content.className = "is-collapsible__content games-level-accordion__content";
    const grid = document.createElement("div");
    grid.className = "game-level-grid";
    for (const row of group.items) {
      grid.appendChild(renderCard(row, `main-${row.id}`));
    }
    content.appendChild(grid);
    section.appendChild(summary);
    section.appendChild(content);
    container.appendChild(section);
  }
  const totalLevels = new Set(rows.map((row) => row.level)).size;
  statusNode.textContent = `Showing ${filtered.length} of ${rows.length} games across ${groups.length} of ${totalLevels} levels.`;
}

function renderPinned(container, rows) {
  container.innerHTML = "";
  if (rows.length === 0) {
    container.innerHTML = "<p>No pinned games yet.</p>";
    return;
  }
  for (const row of rows) {
    container.appendChild(renderCard(row, `pinned-${row.id}`));
  }
}

export async function initGamesIndex() {
  const container = document.getElementById("games-index-list");
  const pinnedContainer = document.getElementById("games-pinned-list");
  const statusNode = document.getElementById("games-filter-status");
  const levelSelect = document.getElementById("games-filter-level");
  const classSelect = document.getElementById("games-filter-class");
  const toolSelect = document.getElementById("games-filter-tool");
  const tagSelect = document.getElementById("games-filter-tag");
  const searchInput = document.getElementById("games-filter-search");
  if (!container || !pinnedContainer || !statusNode || !levelSelect || !classSelect || !toolSelect || !tagSelect || !searchInput) {
    return;
  }

  const response = await fetch(METADATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    container.innerHTML = "<p>Unable to load games index metadata.</p>";
    return;
  }
  const metadata = await response.json();
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
  let pinnedSet = readPinnedSet();
  let model = buildRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap);
  setSelect(levelSelect, model.levels, (value) => value);
  setSelect(classSelect, model.classes, (value) => value.split("/").at(-1) || value);
  setSelect(toolSelect, model.tools.map((entry) => entry.value), (value) => {
    const found = model.tools.find((entry) => entry.value === value);
    return found?.label || value;
  });
  setSelect(tagSelect, model.tags, (value) => value);
  const toolQuery = normalizeToken(new URLSearchParams(window.location.search).get("tool"));
  if (toolQuery && model.tools.some((entry) => entry.value === toolQuery)) {
    toolSelect.value = toolQuery;
  }

  const apply = () => {
    model = buildRows(metadata, pinnedSet, toolLabelMap, toolRegistryMap);
    const state = {
      level: normalize(levelSelect.value),
      classValue: normalize(classSelect.value),
      toolId: normalizeToken(toolSelect.value),
      tag: normalize(tagSelect.value),
      query: normalize(searchInput.value)
    };
    render(container, statusNode, model.rows, state);
    renderPinned(pinnedContainer, model.rows.filter((row) => row.pinned));
  };

  const handlePin = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return;
    }
    const gameId = normalize(target.dataset.gamePin);
    if (!gameId) {
      return;
    }
    if (target.checked) {
      pinnedSet.add(gameId);
    } else {
      pinnedSet.delete(gameId);
    }
    writePinnedSet(pinnedSet);
    apply();
  };

  levelSelect.addEventListener("change", apply);
  classSelect.addEventListener("change", apply);
  toolSelect.addEventListener("change", apply);
  tagSelect.addEventListener("change", apply);
  searchInput.addEventListener("input", apply);
  container.addEventListener("change", handlePin);
  pinnedContainer.addEventListener("change", handlePin);
  apply();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initGamesIndex();
}

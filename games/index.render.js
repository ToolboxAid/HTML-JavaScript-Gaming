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

function buildRows(metadata, pinnedSet) {
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
      return {
        id,
        title,
        description: normalize(game?.description) || "No description available.",
        level,
        status: normalize(game?.status) || "planned",
        classValues,
        tags,
        preview: normalize(game?.preview),
        href: normalize(game?.href),
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
  const tags = [...new Set(rows.flatMap((row) => row.tags))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  return { rows, levels, classes, tags };
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
    if (state.tag && !row.tags.includes(state.tag)) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = `${row.level} ${row.title} ${row.description} ${row.classValues.join(" ")} ${row.tags.join(" ")}`.toLowerCase();
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

  const previewHtml = row.preview
    ? `<a class="game-preview-link" href="${escapeHtml(row.href || "#")}" ${row.href ? "" : "aria-disabled=\"true\""}><img class="game-thumb" loading="lazy" decoding="async" alt="${escapeHtml(row.title)} thumbnail" src="${escapeHtml(row.preview)}"></a>`
    : `<span class="game-preview-link game-preview-missing">No Preview</span>`;

  const pinInputId = `game-pin-${escapeHtml(row.id)}-${escapeHtml(instanceKey)}`;
  const titleLabel = row.href
    ? `<a class="game-title-link" href="${escapeHtml(row.href)}">${escapeHtml(row.title)}</a>`
    : `${escapeHtml(row.title)}`;
  const titleHtml = `<h3 class="game-title-row"><input id="${pinInputId}" type="checkbox" class="pin-toggle" data-game-pin="${escapeHtml(row.id)}" ${row.pinned ? "checked" : ""}><label for="${pinInputId}" class="pin-label" title="${row.pinned ? "Unpin" : "Pin"}" aria-label="${row.pinned ? "Unpin game" : "Pin game"}"><span class="pin-icon" aria-hidden="true"></span></label>${titleLabel}</h3>`;

  const badges = [
    badge(`game-badge--${row.status}`, statusLabel(row.status)),
    row.sampleTrack ? badge("game-badge--sample-track", "Sample Track") : "",
    row.debugShowcase ? badge("game-badge--debug-showcase", "Debug Showcase") : ""
  ].filter(Boolean).join("");

  const classText = row.classValues.length > 0 ? row.classValues.map((value) => value.split("/").at(-1) || value).join(", ") : "none";
  const tagText = row.tags.length > 0 ? row.tags.join(", ") : "none";
  const asteroidDebugLink = row.id === "Asteroids"
    ? '<p><a class="game-title-link" href="/games/Asteroids/index.html?debug=1">Debug Mode</a></p>'
    : "";

  article.innerHTML = `
    ${titleHtml}
    <div class="game-badges">${badges}</div>
    ${previewHtml}
    <p>${escapeHtml(row.description)}</p>
    ${asteroidDebugLink}
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
  const tagSelect = document.getElementById("games-filter-tag");
  const searchInput = document.getElementById("games-filter-search");
  if (!container || !pinnedContainer || !statusNode || !levelSelect || !classSelect || !tagSelect || !searchInput) {
    return;
  }

  const response = await fetch(METADATA_PATH, { cache: "no-store" });
  if (!response.ok) {
    container.innerHTML = "<p>Unable to load games index metadata.</p>";
    return;
  }
  const metadata = await response.json();
  let pinnedSet = readPinnedSet();
  let model = buildRows(metadata, pinnedSet);
  setSelect(levelSelect, model.levels, (value) => value);
  setSelect(classSelect, model.classes, (value) => value.split("/").at(-1) || value);
  setSelect(tagSelect, model.tags, (value) => value);

  const apply = () => {
    model = buildRows(metadata, pinnedSet);
    const state = {
      level: normalize(levelSelect.value),
      classValue: normalize(classSelect.value),
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
  tagSelect.addEventListener("change", apply);
  searchInput.addEventListener("input", apply);
  container.addEventListener("change", handlePin);
  pinnedContainer.addEventListener("change", handlePin);
  apply();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initGamesIndex();
}

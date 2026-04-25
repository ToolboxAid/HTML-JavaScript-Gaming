const GAMES_METADATA_PATH = "/games/metadata/games.index.metadata.json";

let gamesMetadataPromise = null;

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeToken(value) {
  return normalizeText(value).toLowerCase();
}

function whenDocumentReady(documentRef, callback) {
  if (!documentRef) {
    return;
  }
  if (documentRef.readyState === "loading") {
    documentRef.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }
  callback();
}

function getMetadataPromise() {
  if (gamesMetadataPromise) {
    return gamesMetadataPromise;
  }
  gamesMetadataPromise = fetch(GAMES_METADATA_PATH, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
  return gamesMetadataPromise;
}

function findGameMetadataEntry(metadata, gameId) {
  const safeGameId = normalizeToken(gameId);
  if (!safeGameId || !metadata || typeof metadata !== "object") {
    return null;
  }
  const games = Array.isArray(metadata.games) ? metadata.games : [];
  return games.find((entry) => normalizeToken(entry?.id) === safeGameId) || null;
}

function toEngineClasses(value) {
  const entries = Array.isArray(value) ? value : [];
  return [...new Set(entries.map((entry) => normalizeText(entry)).filter(Boolean))];
}

function findOrCreateEngineClassesSection(documentRef) {
  const main = documentRef.querySelector("main");
  if (!(main instanceof HTMLElement)) {
    return null;
  }

  const sections = Array.from(main.querySelectorAll("section"));
  for (const section of sections) {
    if (!(section instanceof HTMLElement)) {
      continue;
    }
    const heading = section.querySelector("h3");
    const headingText = normalizeToken(heading?.textContent);
    if (headingText.includes("engine classes used") || headingText.includes("engine + debug classes used")) {
      return section;
    }
  }

  const nextSection = documentRef.createElement("section");
  const heading = documentRef.createElement("h3");
  heading.textContent = "Engine Classes Used";
  const list = documentRef.createElement("ul");
  nextSection.append(heading, list);
  main.appendChild(nextSection);
  return nextSection;
}

function renderEngineClasses(section, classes, documentRef) {
  const heading = section.querySelector("h3") || documentRef.createElement("h3");
  heading.textContent = "Engine Classes Used";
  if (!heading.parentElement) {
    section.prepend(heading);
  }

  const list = section.querySelector("ul") || documentRef.createElement("ul");
  list.innerHTML = "";
  if (classes.length === 0) {
    const item = documentRef.createElement("li");
    item.textContent = "none";
    list.appendChild(item);
  } else {
    classes.forEach((value) => {
      const item = documentRef.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
  }
  if (!list.parentElement) {
    section.appendChild(list);
  }
}

export function hydrateWorkspaceGameMetadata(gameId, documentRef = globalThis.document ?? null) {
  const safeGameId = normalizeText(gameId);
  if (!safeGameId || !documentRef) {
    return;
  }

  whenDocumentReady(documentRef, () => {
    void getMetadataPromise().then((metadata) => {
      const entry = findGameMetadataEntry(metadata, safeGameId);
      if (!entry) {
        return;
      }
      const section = findOrCreateEngineClassesSection(documentRef);
      if (!section) {
        return;
      }
      const classes = toEngineClasses(entry.engineClassesUsed);
      renderEngineClasses(section, classes, documentRef);
    });
  });
}

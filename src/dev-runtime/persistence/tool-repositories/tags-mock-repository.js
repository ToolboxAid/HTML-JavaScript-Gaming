import {
  MOCK_DB_KEYS,
  mockDbPersistenceEnabled,
  loadMockDbTables,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const TAGS_TOOL_TABLES = Object.freeze([
  "workspace_tag_records"
]);

const TAGS_DB_OWNER = "tags";
const TAGS_SYSTEM_USER_KEY = MOCK_DB_KEYS.users.forgeBot;
const DEFAULT_TAG_USER_KEY = MOCK_DB_KEYS.users.user1;
const DEFAULT_GAME_ID = "demo-game";

function normalizeText(value) {
  return String(value || "").trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function timestamp() {
  return new Date().toISOString();
}

function auditFields(userKey) {
  const now = timestamp();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy: userKey,
    updatedBy: userKey,
  };
}

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function cloneTables(tables) {
  return Object.fromEntries(
    TAGS_TOOL_TABLES.map((tableName) => [tableName, cloneRows(tables[tableName] || [])])
  );
}

function createEmptyTables() {
  return {
    workspace_tag_records: [],
  };
}

function normalizeTagName(value) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function tagKeyForName(name, rows) {
  const base = slugify(name) || "tag";
  if (!rows.some((row) => row.id === base)) {
    return base;
  }
  let index = 2;
  while (rows.some((row) => row.id === `${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

function usageRowsForTag(tag, usageProvider) {
  const tagId = normalizeText(tag.id);
  if (!tagId || typeof usageProvider !== "function") {
    return [];
  }

  return usageProvider()
    .filter((asset) => Array.isArray(asset.tagKeys) && asset.tagKeys.includes(tagId))
    .map((asset) => ({
      itemName: normalizeText(asset.name) || normalizeText(asset.id) || "Unnamed asset",
      itemKey: normalizeText(asset.id),
      tool: "Assets",
    }))
    .sort((left, right) => left.tool.localeCompare(right.tool) || left.itemName.localeCompare(right.itemName));
}

export function createTagsToolMockRepository(options = {}) {
  const loadedMockDbTables = loadMockDbTables(TAGS_DB_OWNER, createEmptyTables(), options);
  const persistenceEnabled = mockDbPersistenceEnabled(options);
  let hasPersistedTables = Boolean(loadedMockDbTables.persisted);
  let tables = loadedMockDbTables.tables;

  function persistTables() {
    saveMockDbTables(TAGS_DB_OWNER, tables, options);
    if (persistenceEnabled || options.memoryDbTables) {
      hasPersistedTables = true;
    }
  }

  function activeUserKey() {
    const sessionUserKey = typeof options.sessionUserKey === "function"
      ? options.sessionUserKey()
      : options.sessionUserKey;
    return normalizeText(sessionUserKey) || DEFAULT_TAG_USER_KEY;
  }

  function activeGameId() {
    const repository = options.gameWorkspaceRepository;
    const activeGame = typeof repository?.getActiveGame === "function" ? repository.getActiveGame() : null;
    return normalizeText(activeGame?.key || activeGame?.id) || DEFAULT_GAME_ID;
  }

  function usageProvider() {
    if (typeof options.usageProvider === "function") {
      return options.usageProvider();
    }
    return [];
  }

  function decorateTag(row) {
    const usage = usageRowsForTag(row, usageProvider);
    return {
      ...row,
      usage,
      usageCount: usage.length,
    };
  }

  function listTags() {
    const gameId = activeGameId();
    return tables.workspace_tag_records
      .filter((row) => row.gameId === gameId)
      .map(decorateTag)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  function findTag(tagId) {
    const id = normalizeText(tagId);
    return listTags().find((tag) => tag.id === id) || null;
  }

  function validateTagInput(input = {}, existingId = "") {
    const name = normalizeTagName(input.name || input.tagName);
    const description = normalizeText(input.description);
    const duplicate = tables.workspace_tag_records.some((row) => (
      row.gameId === activeGameId()
      && row.id !== existingId
      && row.name.toLowerCase() === name.toLowerCase()
    ));
    const findings = [];

    if (!name) {
      findings.push({
        action: "Enter a tag name before saving.",
        label: "Tag Name",
        status: "Missing",
      });
    }
    if (duplicate) {
      findings.push({
        action: "Choose a unique workspace tag name.",
        label: "Tag Name",
        status: "Duplicate",
      });
    }

    return {
      description,
      findings,
      name,
      status: findings.length ? "Needs Input" : "Ready",
    };
  }

  function addTag(input = {}) {
    const validation = validateTagInput(input);
    if (validation.findings.length) {
      return {
        added: false,
        message: validation.findings[0].action,
        snapshot: getSnapshot(),
        validation,
      };
    }

    const userKey = activeUserKey();
    const id = tagKeyForName(validation.name, tables.workspace_tag_records);
    const row = {
      id,
      gameId: activeGameId(),
      name: validation.name,
      description: validation.description,
      ...auditFields(userKey),
    };
    tables.workspace_tag_records.push(row);
    persistTables();
    return {
      added: true,
      message: `Added ${row.name}.`,
      snapshot: getSnapshot(),
      tag: decorateTag(row),
      validation,
    };
  }

  function updateTag(tagId, input = {}) {
    const id = normalizeText(tagId);
    const row = tables.workspace_tag_records.find((candidate) => candidate.gameId === activeGameId() && candidate.id === id);
    if (!row) {
      return {
        message: "Tag update blocked: choose a workspace tag.",
        snapshot: getSnapshot(),
        updated: false,
      };
    }

    const validation = validateTagInput(input, id);
    if (validation.findings.length) {
      return {
        message: validation.findings[0].action,
        snapshot: getSnapshot(),
        updated: false,
        validation,
      };
    }

    row.name = validation.name;
    row.description = validation.description;
    row.updatedAt = timestamp();
    row.updatedBy = activeUserKey();
    persistTables();
    return {
      message: `Updated ${row.name}.`,
      snapshot: getSnapshot(),
      tag: decorateTag(row),
      updated: true,
      validation,
    };
  }

  function deleteTag(tagId) {
    const tag = findTag(tagId);
    if (!tag) {
      return {
        deleted: false,
        message: "Tag delete blocked: choose a workspace tag.",
        snapshot: getSnapshot(),
      };
    }
    if (tag.usageCount > 0) {
      return {
        deleted: false,
        message: `${tag.name} is used by ${tag.usageCount} item${tag.usageCount === 1 ? "" : "s"}. Remove usage before deleting.`,
        snapshot: getSnapshot(),
      };
    }

    tables.workspace_tag_records = tables.workspace_tag_records.filter((row) => !(row.gameId === tag.gameId && row.id === tag.id));
    persistTables();
    return {
      deleted: true,
      message: `Deleted ${tag.name}.`,
      snapshot: getSnapshot(),
      tagId: tag.id,
    };
  }

  function clearTags() {
    tables = createEmptyTables();
    persistTables();
    return getSnapshot();
  }

  function getTables() {
    return normalizeMockDbTables(TAGS_DB_OWNER, cloneTables(tables), options);
  }

  function getSnapshot() {
    const tags = listTags();
    return {
      gameId: activeGameId(),
      status: tags.length ? "Ready" : "Needs Tags",
      tableCounts: TAGS_TOOL_TABLES.map((tableName) => ({
        rows: tables[tableName].length,
        table: tableName,
      })),
      tables: getTables(),
      tags,
    };
  }

  if (!hasPersistedTables) {
    tables = createEmptyTables();
  }

  return {
    TAGS_TOOL_TABLES,
    addTag,
    clearTags,
    deleteTag,
    findTag,
    getSnapshot,
    getTables,
    listTags,
    updateTag,
    validateTagInput,
  };
}

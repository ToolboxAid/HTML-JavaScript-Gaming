import { makeSeedUlid } from "../../seed/seed-db-keys.mjs";
import {
  MOCK_DB_KEYS,
  mockDbPersistenceEnabled,
  loadMockDbTables,
  normalizeMockDbTables,
  saveMockDbTables,
} from "../mock-db-store.js";

export const TAGS_TOOL_TABLES = Object.freeze([
  "project_tags",
  "project_tag_assignments",
]);

const TAGS_DB_OWNER = "tags";
const TAGS_SYSTEM_USER_KEY = MOCK_DB_KEYS.users.forgeBot;
const DEFAULT_TAG_USER_KEY = MOCK_DB_KEYS.users.user1;
const DEFAULT_PROJECT_KEY = "demo-game";

const STARTER_TAGS = Object.freeze([
  Object.freeze({ label: "platformer", description: "Platforming, jumping, and movement-focused projects." }),
  Object.freeze({ label: "fantasy", description: "Magic, legends, and fantasy world themes." }),
  Object.freeze({ label: "medium", description: "Medium-sized project scope." }),
  Object.freeze({ label: "pixel-art", description: "Pixel art visual direction." }),
  Object.freeze({ label: "kids", description: "Designed for younger players." }),
  Object.freeze({ label: "boss-fight", description: "Includes a climactic boss encounter." }),
]);

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

function normalizeTagLabel(value) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function createEmptyTables() {
  return {
    project_tag_assignments: [],
    project_tags: [],
  };
}

function tagKeyForIndex(index) {
  return makeSeedUlid(7200 + index);
}

function assignmentKeyForIndex(index) {
  return makeSeedUlid(7600 + index);
}

function createSeedTables() {
  const audit = auditFields(TAGS_SYSTEM_USER_KEY);
  const projectTags = STARTER_TAGS.map((tag, index) => ({
    ...audit,
    active: true,
    description: tag.description,
    id: slugify(tag.label),
    key: tagKeyForIndex(index + 1),
    label: tag.label,
    slug: slugify(tag.label),
  }));
  return {
    project_tag_assignments: projectTags.slice(0, 2).map((tag, index) => ({
      ...audit,
      key: assignmentKeyForIndex(index + 1),
      projectKey: DEFAULT_PROJECT_KEY,
      tagKey: tag.key,
    })),
    project_tags: projectTags,
  };
}

function usageRowsForTag(tag, usageProvider) {
  const tagId = normalizeText(tag.id || tag.slug);
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
  let tagCounter = tables.project_tags?.length || STARTER_TAGS.length;
  let assignmentCounter = tables.project_tag_assignments?.length || 0;

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

  function activeProject() {
    const repository = options.gameWorkspaceRepository;
    const activeGame = typeof repository?.getActiveGame === "function" ? repository.getActiveGame() : null;
    return {
      key: normalizeText(activeGame?.key || activeGame?.id) || DEFAULT_PROJECT_KEY,
      name: normalizeText(activeGame?.name) || "Demo Game",
    };
  }

  function usageProvider() {
    if (typeof options.usageProvider === "function") {
      return options.usageProvider();
    }
    return [];
  }

  function assignmentRowsForTag(tagKey) {
    return tables.project_tag_assignments.filter((assignment) => assignment.tagKey === tagKey);
  }

  function decorateTag(row) {
    const project = activeProject();
    const usage = usageRowsForTag(row, usageProvider);
    const assignments = assignmentRowsForTag(row.key);
    const assigned = assignments.some((assignment) => assignment.projectKey === project.key);
    return {
      ...row,
      assignmentCount: assignments.length,
      assigned,
      assignedProjectKey: assigned ? project.key : "",
      name: row.label,
      usage,
      usageCount: usage.length + assignments.length,
    };
  }

  function listTags() {
    return tables.project_tags
      .filter((row) => row.active !== false)
      .map(decorateTag)
      .sort((left, right) => left.label.localeCompare(right.label));
  }

  function findTag(tagId) {
    const id = normalizeText(tagId);
    return listTags().find((tag) => tag.id === id || tag.slug === id || tag.key === id) || null;
  }

  function assignedTagsForProject(projectKey = activeProject().key) {
    const assignedKeys = new Set(tables.project_tag_assignments
      .filter((assignment) => assignment.projectKey === projectKey)
      .map((assignment) => assignment.tagKey));
    return listTags().filter((tag) => assignedKeys.has(tag.key));
  }

  function validateTagInput(input = {}, existingKey = "") {
    const label = normalizeTagLabel(input.label || input.name || input.tagName);
    const description = normalizeText(input.description);
    const slug = slugify(input.slug || label);
    const duplicate = tables.project_tags.some((row) => (
      row.key !== existingKey &&
      (row.label.toLowerCase() === label.toLowerCase() || row.slug === slug)
    ));
    const findings = [];

    if (!label) {
      findings.push({
        action: "Enter a tag label before saving.",
        label: "Tag Label",
        status: "Missing",
      });
    }
    if (duplicate) {
      findings.push({
        action: "Choose a unique project tag label.",
        label: "Tag Label",
        status: "Duplicate",
      });
    }

    return {
      description,
      findings,
      label,
      name: label,
      slug,
      status: findings.length ? "Needs Input" : "Ready",
    };
  }

  function nextTagKey() {
    tagCounter += 1;
    return makeSeedUlid(7200 + tagCounter);
  }

  function nextAssignmentKey() {
    assignmentCounter += 1;
    return makeSeedUlid(7600 + assignmentCounter);
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
    const row = {
      active: true,
      description: validation.description,
      id: validation.slug,
      key: nextTagKey(),
      label: validation.label,
      slug: validation.slug,
      ...auditFields(userKey),
    };
    tables.project_tags.push(row);
    persistTables();
    return {
      added: true,
      message: `Added ${row.label}.`,
      snapshot: getSnapshot(),
      tag: decorateTag(row),
      validation,
    };
  }

  function updateTag(tagId, input = {}) {
    const tag = findTag(tagId);
    const row = tag ? tables.project_tags.find((candidate) => candidate.key === tag.key) : null;
    if (!row) {
      return {
        message: "Tag update blocked: choose a project tag.",
        snapshot: getSnapshot(),
        updated: false,
      };
    }

    const validation = validateTagInput(input, row.key);
    if (validation.findings.length) {
      return {
        message: validation.findings[0].action,
        snapshot: getSnapshot(),
        updated: false,
        validation,
      };
    }

    row.description = validation.description;
    row.id = validation.slug;
    row.label = validation.label;
    row.slug = validation.slug;
    row.updatedAt = timestamp();
    row.updatedBy = activeUserKey();
    persistTables();
    return {
      message: `Updated ${row.label}.`,
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
        message: "Tag delete blocked: choose a project tag.",
        snapshot: getSnapshot(),
      };
    }
    if (tag.usageCount > 0) {
      return {
        deleted: false,
        message: `${tag.label} is used by ${tag.usageCount} item${tag.usageCount === 1 ? "" : "s"}. Remove usage before deleting.`,
        snapshot: getSnapshot(),
      };
    }

    const row = tables.project_tags.find((candidate) => candidate.key === tag.key);
    if (row) {
      row.active = false;
      row.id = `${row.id}-deleted-${row.key.slice(-6)}`;
      row.slug = `${row.slug}-deleted-${row.key.slice(-6)}`;
      row.updatedAt = timestamp();
      row.updatedBy = activeUserKey();
    }
    persistTables();
    return {
      deleted: true,
      message: `Deleted ${tag.label}.`,
      snapshot: getSnapshot(),
      tagId: tag.id,
    };
  }

  function assignTagToProject(tagId, projectKey = activeProject().key) {
    const tag = findTag(tagId);
    const project = activeProject();
    const targetProjectKey = normalizeText(projectKey) || project.key;
    if (!tag) {
      return {
        assigned: false,
        message: "Tag assignment blocked: choose a project tag.",
        snapshot: getSnapshot(),
      };
    }
    const existing = tables.project_tag_assignments.find((assignment) =>
      assignment.projectKey === targetProjectKey && assignment.tagKey === tag.key
    );
    if (existing) {
      return {
        assigned: false,
        message: `${tag.label} is already assigned to ${project.name}.`,
        snapshot: getSnapshot(),
        tag,
      };
    }
    tables.project_tag_assignments.push({
      key: nextAssignmentKey(),
      projectKey: targetProjectKey,
      tagKey: tag.key,
      ...auditFields(activeUserKey()),
    });
    persistTables();
    return {
      assigned: true,
      message: `Assigned ${tag.label} to ${project.name}.`,
      snapshot: getSnapshot(),
      tag: findTag(tag.id),
    };
  }

  function removeTagFromProject(tagId, projectKey = activeProject().key) {
    const tag = findTag(tagId);
    const project = activeProject();
    const targetProjectKey = normalizeText(projectKey) || project.key;
    if (!tag) {
      return {
        message: "Tag removal blocked: choose a project tag.",
        removed: false,
        snapshot: getSnapshot(),
      };
    }
    const before = tables.project_tag_assignments.length;
    tables.project_tag_assignments = tables.project_tag_assignments.filter((assignment) =>
      !(assignment.projectKey === targetProjectKey && assignment.tagKey === tag.key)
    );
    const removed = tables.project_tag_assignments.length !== before;
    if (removed) {
      persistTables();
    }
    return {
      message: removed
        ? `Removed ${tag.label} from ${project.name}.`
        : `${tag.label} was not assigned to ${project.name}.`,
      removed,
      snapshot: getSnapshot(),
      tag: findTag(tag.id),
    };
  }

  function clearTags() {
    tables = createEmptyTables();
    persistTables();
    return getSnapshot();
  }

  function resetTags() {
    tables = createSeedTables();
    tagCounter = tables.project_tags.length;
    assignmentCounter = tables.project_tag_assignments.length;
    persistTables();
    return getSnapshot();
  }

  function getTables() {
    return normalizeMockDbTables(TAGS_DB_OWNER, cloneTables(tables), options);
  }

  function getSnapshot() {
    const tags = listTags();
    const project = activeProject();
    const assignedTags = assignedTagsForProject(project.key);
    return {
      activeProject: project,
      assignedTags,
      availableTags: tags.filter((tag) => !tag.assigned),
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
    tables = createSeedTables();
  }

  return {
    TAGS_TOOL_TABLES,
    addTag,
    assignTagToProject,
    clearTags,
    deleteTag,
    findTag,
    getSnapshot,
    getTables,
    listTags,
    removeTagFromProject,
    resetTags,
    updateTag,
    validateTagInput,
  };
}

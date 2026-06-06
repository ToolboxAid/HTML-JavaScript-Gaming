import { createProjectJourneyMockRepository } from "../toolbox/project-journey/project-journey-mock-repository.js";
import { createAssetToolMockRepository } from "../toolbox/assets/assets-mock-repository.js";
import { createProjectWorkspacePaletteRepository } from "../toolbox/colors/palette-workspace-repository.js";
import {
  getAllPersistedMockDbTables,
  getStandaloneMockDbTables,
} from "../src/shared/mock-db/mock-db-store.js";

const AUDIT_FIELDS = ["createdAt", "updatedAt", "createdByType", "updatedByType"];
const TOOL_GROUP_ORDER = ["project-journey", "palette", "asset"];
const TOOL_GROUP_LABELS = Object.freeze({
  asset: "Asset",
  palette: "Palette",
  "project-journey": "Project Journey",
});
const STANDALONE_TABLE_LABELS = Object.freeze({
  users: "Users",
  actors: "Actors",
});
const AUDIT_REQUIRED_TABLES = new Set(["users", "actors"]);

class AdminDbViewer {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.projectJourneyRepository = createProjectJourneyMockRepository();
    this.paletteRepository = createProjectWorkspacePaletteRepository();
    this.assetRepository = createAssetToolMockRepository();
    this.activeFilter = "all";
    this.filterRoot = documentRef.querySelector("[data-admin-db-filters]");
    this.status = documentRef.querySelector("[data-admin-db-status]");
    this.diagnostics = documentRef.querySelector("[data-admin-db-diagnostics]");
    this.relationships = documentRef.querySelector("[data-admin-db-relationships]");
    this.tablesRoot = documentRef.querySelector("[data-admin-db-tables]");
  }

  start() {
    this.projectJourneyRepository.openProject("demo-project");
    this.render();
    this.filterRoot?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admin-db-filter]");
      if (!button) {
        return;
      }
      this.activeFilter = button.dataset.adminDbFilter || "all";
      this.render();
    });
  }

  createElement(tagName, options = {}) {
    const element = this.document.createElement(tagName);
    if (options.className) {
      element.className = options.className;
    }
    if (options.text !== undefined) {
      element.textContent = options.text;
    }
    return element;
  }

  recordId(record) {
    return record.key || record.name || "record";
  }

  isUlidKey(value) {
    return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(String(value || ""));
  }

  formatKeyValue(value) {
    const key = String(value);
    return key.slice(0, 10);
  }

  formatValue(value) {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    if (value === undefined || value === null || value === "") {
      return "(empty)";
    }
    return String(value);
  }

  tableFields(records) {
    const fields = [];
    records.forEach((record) => {
      Object.keys(record).forEach((field) => {
        if (!fields.includes(field)) {
          fields.push(field);
        }
      });
    });
    return fields;
  }

  collectSnapshot() {
    const projectJourneyTables = this.projectJourneyRepository.getTables();
    const paletteTables = this.paletteRepository.getTables();
    const assetTables = this.assetRepository.getTables();
    const standaloneTables = getStandaloneMockDbTables();
    const persistedTables = getAllPersistedMockDbTables();
    const tables = {
      ...persistedTables,
      ...projectJourneyTables,
      ...paletteTables,
      ...assetTables,
      ...standaloneTables,
    };
    const groups = [
      {
        id: "all",
        label: "All",
        tableNames: Object.keys(tables).sort(),
        type: "all",
      },
      ...TOOL_GROUP_ORDER.map((id) => ({
        id,
        label: TOOL_GROUP_LABELS[id],
        tableNames: Object.keys(
          id === "project-journey"
            ? projectJourneyTables
            : id === "palette"
              ? paletteTables
              : assetTables,
        ).sort(),
        type: "tool",
      })),
      ...Object.entries(STANDALONE_TABLE_LABELS).map(([tableName, label]) => ({
        id: tableName,
        label,
        tableNames: [tableName],
        type: "table",
      })),
    ];
    return {
      groups,
      tables,
    };
  }

  activeGroup(groups) {
    return groups.find((group) => group.id === this.activeFilter) || groups[0];
  }

  renderTable(tableName, records) {
    const details = this.createElement("details", {
      className: "vertical-accordion",
    });
    details.open = true;
    details.dataset.adminDbTable = tableName;

    const summary = this.createElement("summary", {
      text: `${tableName} (${records.length} records)`,
    });
    const body = this.createElement("div", {
      className: "accordion-body",
    });
    const wrapper = this.createElement("div", {
      className: "table-wrapper",
    });
    const table = this.createElement("table", {
      className: "data-table data-table--preserve-casing",
    });
    table.setAttribute("aria-label", `${tableName} records`);

    const fields = this.tableFields(records);
    const head = this.createElement("thead");
    const headerRow = this.createElement("tr");
    fields.forEach((field) => {
      headerRow.append(this.createElement("th", { text: field }));
    });
    head.append(headerRow);

    const tableBody = this.createElement("tbody");
    records.forEach((record) => {
      const row = this.createElement("tr");
      row.dataset.adminDbRecord = this.recordId(record);
      fields.forEach((field) => {
        const value = record[field];
        const cell = this.createElement("td", {
          text: this.isUlidKey(value) ? this.formatKeyValue(value) : this.formatValue(value),
        });
        if (this.isUlidKey(value)) {
          cell.title = String(value);
        }
        row.append(cell);
      });
      tableBody.append(row);
    });

    table.append(head, tableBody);
    wrapper.append(table);
    body.append(wrapper);
    details.append(summary, body);
    return details;
  }

  renderTables(tables) {
    this.tablesRoot.replaceChildren();
    Object.keys(tables)
      .sort()
      .forEach((tableName) => {
        this.tablesRoot.append(this.renderTable(tableName, tables[tableName]));
      });
  }

  renderFilters(groups) {
    if (!this.filterRoot) {
      return;
    }
    this.filterRoot.replaceChildren();
    groups.forEach((group) => {
      const button = this.createElement("button", {
        className: group.id === this.activeFilter ? "btn btn--compact primary" : "btn btn--compact",
        text: group.label,
      });
      button.type = "button";
      button.dataset.adminDbFilter = group.id;
      button.setAttribute("aria-pressed", String(group.id === this.activeFilter));
      this.filterRoot.append(button);
    });
  }

  auditFindings(tables) {
    const findings = [];
    Object.entries(tables).forEach(([tableName, records]) => {
      if (!tableName.startsWith("project_journey_") && !AUDIT_REQUIRED_TABLES.has(tableName)) {
        return;
      }
      records.forEach((record) => {
        AUDIT_FIELDS.forEach((field) => {
          if (!Object.hasOwn(record, field)) {
            findings.push(`${tableName}.${this.recordId(record)} is missing ${field}.`);
          }
        });
      });
    });
    return findings;
  }

  relationshipsForTables(tables) {
    const noteTypeKeys = new Set((tables.project_journey_note_types || []).map((type) => type.key));
    const noteKeys = new Set((tables.project_journey_notes || []).map((note) => note.key));
    const userKeys = new Set((tables.users || []).map((user) => user.key));
    const actorUserKeys = new Set((tables.actors || []).map((actor) => actor.userKey));
    const activeTemplateKeys = new Set(
      (tables.project_journey_templates || [])
        .filter((template) => template.isActive)
        .map((template) => template.key),
    );
    const paletteGlobals = new Set((tables.project_workspace_palette_globals || []).map((row) => row.projectId));
    const paletteColorKeys = new Set((tables.palette_colors || []).map((row) => `${row.projectId}:${row.symbol}`));
    const assetIds = new Set((tables.asset_library_items || []).map((asset) => asset.id));
    const assetStorageIds = new Set((tables.asset_storage_objects || []).map((object) => object.id));
    return [
      {
        name: "project_journey_notes.typeKey -> project_journey_note_types.key",
        checked: (tables.project_journey_notes || []).length,
        missing: (tables.project_journey_notes || []).filter((note) => !noteTypeKeys.has(note.typeKey)),
      },
      {
        name: "project_journey_notes.ownerKey -> users.key",
        checked: (tables.project_journey_notes || []).length,
        missing: (tables.project_journey_notes || []).filter((note) => !userKeys.has(note.ownerKey)),
      },
      {
        name: "project_journey_items.noteKey -> project_journey_notes.key",
        checked: (tables.project_journey_items || []).length,
        missing: (tables.project_journey_items || []).filter((item) => !noteKeys.has(item.noteKey)),
      },
      {
        name: "system project_journey_items.templateKey -> active project_journey_templates.key",
        checked: (tables.project_journey_items || []).filter((item) => item.createdByType === "system").length,
        missing: (tables.project_journey_items || []).filter(
          (item) => item.createdByType === "system" && !activeTemplateKeys.has(item.templateKey),
        ),
      },
      {
        name: "project_journey_activity.noteKey -> project_journey_notes.key",
        checked: (tables.project_journey_activity || []).length,
        missing: (tables.project_journey_activity || []).filter((activity) => !noteKeys.has(activity.noteKey)),
      },
      {
        name: "actors.userKey -> users.key",
        checked: (tables.actors || []).length,
        missing: (tables.actors || []).filter((actor) => !userKeys.has(actor.userKey)),
      },
      {
        name: "users.key -> actors.userKey",
        checked: (tables.users || []).length,
        missing: (tables.users || []).filter((user) => !actorUserKeys.has(user.key)),
      },
      {
        name: "palette_colors.projectId -> project_workspace_palette_globals.projectId",
        checked: (tables.palette_colors || []).length,
        missing: (tables.palette_colors || []).filter((row) => !paletteGlobals.has(row.projectId)),
      },
      {
        name: "palette_swatch_usages.swatchSymbol -> palette_colors.symbol",
        checked: (tables.palette_swatch_usages || []).length,
        missing: (tables.palette_swatch_usages || []).filter((row) => !paletteColorKeys.has(`${row.projectId}:${row.swatchSymbol}`)),
      },
      {
        name: "palette_swatch_usages.assetId -> asset_library_items.id",
        checked: (tables.palette_swatch_usages || []).length,
        missing: (tables.palette_swatch_usages || []).filter((row) => !assetIds.has(row.assetId)),
      },
      {
        name: "asset_library_items.storageObjectId -> asset_storage_objects.id",
        checked: (tables.asset_library_items || []).length,
        missing: (tables.asset_library_items || []).filter((asset) => !assetStorageIds.has(asset.storageObjectId)),
      },
      {
        name: "asset_import_events.assetId -> asset_library_items.id",
        checked: (tables.asset_import_events || []).length,
        missing: (tables.asset_import_events || []).filter((event) => !assetIds.has(event.assetId)),
      },
    ];
  }

  tableBleedFindings(tables) {
    const notesByKey = new Map((tables.project_journey_notes || []).map((note) => [note.key, note]));
    const findings = [];
    (tables.project_journey_items || []).forEach((item) => {
      const note = notesByKey.get(item.noteKey);
      if (note && note.projectKey !== item.projectKey) {
        findings.push(`${item.key} projectKey ${item.projectKey} does not match note ${note.key} projectKey ${note.projectKey}.`);
      }
    });
    (tables.project_journey_activity || []).forEach((activity) => {
      const note = notesByKey.get(activity.noteKey);
      if (note && note.projectKey !== activity.projectKey) {
        findings.push(`${activity.key} projectKey ${activity.projectKey} does not match note ${note.key} projectKey ${note.projectKey}.`);
      }
    });
    return findings;
  }

  staleDisplayFindings(tables, groups) {
    const groupTableNames = new Set(groups.flatMap((group) => group.tableNames));
    const unownedTables = Object.keys(tables).filter((tableName) => !groupTableNames.has(tableName));
    if (unownedTables.length) {
      return unownedTables.map((tableName) => `${tableName} has live data but no Mock DB filter owner.`);
    }
    return ["No stale display data detected; tables are rendered from current mock DB snapshots."];
  }

  renderList(messages, dataName) {
    const list = this.createElement("ul");
    list.dataset[dataName] = "";
    messages.forEach((message) => {
      list.append(this.createElement("li", { text: message }));
    });
    return list;
  }

  renderDiagnostics(tables, groups) {
    this.diagnostics.replaceChildren();
    const auditFindings = this.auditFindings(tables);
    const bleedFindings = this.tableBleedFindings(tables);
    const staleFindings = this.staleDisplayFindings(tables, groups);
    const auditSummary = auditFindings.length
      ? auditFindings
      : ["All current mock DB tables include createdAt, updatedAt, createdByType, and updatedByType where required by the owning mock model."];
    const bleedSummary = bleedFindings.length ? bleedFindings : ["No table bleed detected."];
    this.diagnostics.append(
      this.renderList(auditSummary, "adminDbAuditFindings"),
      this.renderList(bleedSummary, "adminDbBleedFindings"),
      this.renderList(staleFindings, "adminDbStaleDisplayFindings"),
    );
  }

  renderRelationships(tables) {
    this.relationships.replaceChildren();
    const relationshipRows = this.relationshipsForTables(tables);
    const missingLinks = relationshipRows.flatMap((relationship) =>
      relationship.missing.map((record) => `${relationship.name} missing for ${this.recordId(record)}.`),
    );
    const relationshipList = this.createElement("ul");
    relationshipList.dataset.adminDbRelationshipSummary = "";
    relationshipRows.forEach((relationship) => {
      const linkedCount = relationship.checked - relationship.missing.length;
      relationshipList.append(
        this.createElement("li", {
          text: `${relationship.name}: ${linkedCount}/${relationship.checked} records linked.`,
        }),
      );
    });
    this.relationships.append(relationshipList);
    this.relationships.append(
      this.renderList(missingLinks.length ? missingLinks : ["No missing links detected."], "adminDbMissingLinks"),
    );
  }

  render() {
    const snapshot = this.collectSnapshot();
    const group = this.activeGroup(snapshot.groups);
    const visibleTables = Object.fromEntries(
      group.tableNames
        .filter((tableName) => Object.hasOwn(snapshot.tables, tableName))
        .map((tableName) => [tableName, snapshot.tables[tableName]]),
    );
    this.renderFilters(snapshot.groups);
    this.renderDiagnostics(snapshot.tables, snapshot.groups);
    this.renderRelationships(snapshot.tables);
    this.renderTables(visibleTables);
    if (this.status) {
      const recordCount = Object.values(visibleTables).reduce((total, rows) => total + rows.length, 0);
      this.status.textContent = `Mock DB loaded ${Object.keys(visibleTables).length} table${Object.keys(visibleTables).length === 1 ? "" : "s"} and ${recordCount} record${recordCount === 1 ? "" : "s"} for ${group.label}.`;
    }
  }
}

new AdminDbViewer().start();

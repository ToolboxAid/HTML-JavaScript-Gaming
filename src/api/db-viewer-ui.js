import { getDbViewerSnapshot } from "./db-viewer-api-client.js";

const AUDIT_FIELDS = ["createdAt", "updatedAt", "createdBy", "updatedBy"];
const DEPRECATED_TABLE_NOTES = Object.freeze({
  palette_source_swatches: "Deprecated source history: retained for migration/reference only. Current Colors grid rendering, editing, save/load, and import/export do not read this table.",
});
const PROVIDER_DISPLAY = Object.freeze({
  "supabase-postgres": Object.freeze({
    connectionLabel: "supabase-postgres (Supabase Postgres)",
    modeLabel: "Supabase Postgres",
    sourceLabel: "Supabase product DB",
  }),
});

class AdminDbViewer {
  constructor(documentRef = document, options = {}) {
    this.document = documentRef;
    this.activeFilter = "all";
    this.clearButton = documentRef.querySelector("[data-admin-db-clear]");
    this.filterRoot = documentRef.querySelector("[data-admin-db-filters]");
    this.status = documentRef.querySelector("[data-admin-db-status]");
    this.diagnostics = documentRef.querySelector("[data-admin-db-diagnostics]");
    this.relationships = documentRef.querySelector("[data-admin-db-relationships]");
    this.tablesRoot = documentRef.querySelector("[data-admin-db-tables]");
    this.connectionFields = Array.from(documentRef.querySelectorAll("[data-admin-db-status-connection]"));
    this.sourceFields = Array.from(documentRef.querySelectorAll("[data-admin-db-status-source]"));
    this.session = options.session || {};
    this.modeLabel = "Configured Data";
    this.providerId = "configured";
    this.sourceLabel = "Configured connection";
    this.canWrite = false;
  }

  start() {
    this.renderModeChrome();
    this.render();
    this.filterRoot?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-admin-db-filter]");
      if (!button) {
        return;
      }
      this.activeFilter = button.dataset.adminDbFilter || "all";
      this.render();
    });
    this.clearButton?.remove();
    this.clearButton = null;
  }

  providerInfo(snapshot = {}) {
    const providerId = snapshot.databaseProviderId || snapshot.provider?.databaseProviderId || snapshot.providerId || "configured";
    const source = snapshot.source || snapshot.provider?.source || "configured";
    const display = PROVIDER_DISPLAY[providerId] || {};
    return {
      modeLabel: display.modeLabel || "Configured Data",
      providerId,
      connectionLabel: display.connectionLabel || "Configured connection",
      source,
      sourceLabel: display.sourceLabel || "Configured connection",
    };
  }

  applyProviderInfo(providerInfo) {
    this.modeLabel = providerInfo.modeLabel;
    this.providerId = providerInfo.providerId;
    this.sourceLabel = providerInfo.sourceLabel;
  }

  renderModeChrome(providerInfo = {
    modeLabel: this.modeLabel,
    connectionLabel: "Configured connection",
    sourceLabel: this.sourceLabel,
  }) {
    const modeLabel = providerInfo.modeLabel;
    this.document.querySelectorAll("[data-admin-db-mode-title]").forEach((element) => {
      element.textContent = modeLabel;
    });
    this.document.querySelectorAll("[data-admin-db-mode-kicker]").forEach((element) => {
      element.textContent = element.closest(".page-title") ? `Admin Only / ${modeLabel}` : modeLabel;
    });
    this.document.querySelectorAll("[data-admin-db-mode-description]").forEach((element) => {
      element.textContent = "Read-only project data view for tables, relationships, and diagnostics.";
    });
    this.document.querySelectorAll("[data-admin-db-scope-description]").forEach((element) => {
      element.textContent = "Current tool records are displayed as a read-only human-readable view.";
    });
    this.filterRoot?.setAttribute("aria-label", `${modeLabel} table filters`);
    this.tablesRoot?.setAttribute("aria-label", `${modeLabel} tables`);
    this.connectionFields.forEach((element) => {
      element.textContent = providerInfo.connectionLabel;
    });
    this.sourceFields.forEach((element) => {
      element.textContent = providerInfo.sourceLabel;
    });
    this.document.title = `${modeLabel} - GameFoundryStudio`;
  }

  renderClearSeedButton(cleared) {
    if (!this.clearButton || !this.canWrite) {
      return;
    }
    this.clearButton.textContent = cleared ? "Restore Baseline" : "Clear Records";
    this.clearButton.dataset.adminDbClearMode = cleared ? "seed" : "clear";
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

  tableDisplayName(tableName) {
    if (Object.hasOwn(DEPRECATED_TABLE_NOTES, tableName)) {
      return `${tableName} (deprecated)`;
    }
    return tableName;
  }

  tableRuntimeState(tableName, records) {
    if (Object.hasOwn(DEPRECATED_TABLE_NOTES, tableName)) {
      return {
        label: "Deprecated/history",
        note: DEPRECATED_TABLE_NOTES[tableName],
      };
    }
    if (!records.length) {
      return {
        label: "Empty schema-only",
        note: "Empty schema-only table. Headers remain visible so missing records and future writes are inspectable.",
      };
    }
    return {
      label: "Active runtime data",
      note: "Active runtime table data from the configured connection snapshot.",
    };
  }

  collectSnapshot() {
    const snapshot = getDbViewerSnapshot();
    const tables = snapshot.tables;
    const schemas = snapshot.schemas || {};
    const groups = Array.isArray(snapshot.viewerGroups) ? snapshot.viewerGroups : [];
    if (!groups.length) {
      throw new Error("DB Viewer snapshot is missing server-provided groups.");
    }
    return {
      cleared: Boolean(snapshot.cleared),
      groups,
      providerInfo: this.providerInfo(snapshot),
      schemas,
      sourceDiagnostics: this.sourceDiagnostics(snapshot),
      tables,
    };
  }

  activeGroup(groups) {
    return groups.find((group) => group.id === this.activeFilter) || groups[0];
  }

  renderTable(tableName, records, schemaFields = []) {
    const details = this.createElement("details", {
      className: "vertical-accordion",
    });
    details.open = true;
    details.dataset.adminDbTable = tableName;
    const tableDisplayName = this.tableDisplayName(tableName);
    const tableRuntimeState = this.tableRuntimeState(tableName, records);

    const summary = this.createElement("summary", {
      text: `${tableDisplayName} - ${tableRuntimeState.label} (${records.length} records)`,
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
    table.setAttribute("aria-label", `${tableDisplayName} records`);

    const fields = [
      ...schemaFields,
      ...this.tableFields(records),
    ].filter((field, index, allFields) => field !== "key" && allFields.indexOf(field) === index);
    const head = this.createElement("thead");
    const headerRow = this.createElement("tr");
    headerRow.append(this.createElement("th", { text: "Key" }));
    fields.forEach((field) => {
      headerRow.append(this.createElement("th", { text: field }));
    });
    head.append(headerRow);

    const tableBody = this.createElement("tbody");
    if (!records.length) {
      const row = this.createElement("tr");
      const cell = this.createElement("td", {
        text: this.canWrite
          ? "No records in this table. Add records from its tool or restore baseline user and role records."
          : `No records in this table. ${this.modeLabel} read-only inspection still shows schema headers.`,
      });
      cell.colSpan = Math.max(1, fields.length + 1);
      row.append(cell);
      tableBody.append(row);
    }
    records.forEach((record) => {
      const row = this.createElement("tr");
      row.dataset.adminDbRecord = this.recordId(record);
      const keyCell = this.createElement("td", {
        text: this.isUlidKey(record.key) ? this.formatKeyValue(record.key) : this.formatValue(record.key),
      });
      if (this.isUlidKey(record.key)) {
        keyCell.title = String(record.key);
      }
      row.append(keyCell);
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
    body.append(this.createElement("p", {
      className: "status",
      text: tableRuntimeState.note,
    }));
    body.append(wrapper);
    details.append(summary, body);
    return details;
  }

  renderTables(tables, schemas = {}) {
    this.tablesRoot.replaceChildren();
    Object.keys(tables)
      .forEach((tableName) => {
        this.tablesRoot.append(this.renderTable(tableName, tables[tableName], schemas[tableName] || []));
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
    const noteTypeKeys = new Set((tables.game_journey_note_types || []).map((type) => type.key));
    const noteKeys = new Set((tables.game_journey_notes || []).map((note) => note.key));
    const userKeys = new Set((tables.users || []).map((user) => user.key));
    const roleKeys = new Set((tables.roles || []).map((role) => role.key));
    const systemRoleKeys = new Set(
      (tables.roles || [])
        .filter((role) => role.roleSlug === "system" || role.name === "system")
        .map((role) => role.key),
    );
    const systemUserKeys = new Set(
      (tables.user_roles || [])
        .filter((row) => systemRoleKeys.has(row.roleKey))
        .map((row) => row.userKey),
    );
    const activeTemplateKeys = new Set(
      (tables.game_journey_templates || [])
        .filter((template) => template.isActive)
        .map((template) => template.key),
    );
    const paletteGlobals = new Set((tables.project_workspace_palette_globals || []).map((row) => row.gameId));
    const paletteColorKeys = new Set((tables.palette_colors || []).map((row) => `${row.gameId}:${row.swatchKey}`));
    const assetIds = new Set((tables.asset_library_items || []).map((asset) => asset.id));
    const assetStorageIds = new Set((tables.asset_storage_objects || []).map((object) => object.id));
    const userOwnedToolStateSamples = (tables.tool_state_samples || []).filter((sample) => sample.userKey);
    const allRecords = Object.entries(tables).flatMap(([tableName, records]) =>
      records.map((record) => ({
        ...record,
        tableName,
      })),
    );
    return [
      {
        name: "*.createdBy -> users.key",
        checked: allRecords.length,
        missing: allRecords.filter((record) => !userKeys.has(record.createdBy)),
      },
      {
        name: "*.updatedBy -> users.key",
        checked: allRecords.length,
        missing: allRecords.filter((record) => !userKeys.has(record.updatedBy)),
      },
      {
        name: "game_journey_notes.typeKey -> game_journey_note_types.key",
        checked: (tables.game_journey_notes || []).length,
        missing: (tables.game_journey_notes || []).filter((note) => !noteTypeKeys.has(note.typeKey)),
      },
      {
        name: "game_journey_notes.ownerKey -> users.key",
        checked: (tables.game_journey_notes || []).length,
        missing: (tables.game_journey_notes || []).filter((note) => !userKeys.has(note.ownerKey)),
      },
      {
        name: "game_journey_items.noteKey -> game_journey_notes.key",
        checked: (tables.game_journey_items || []).length,
        missing: (tables.game_journey_items || []).filter((item) => !noteKeys.has(item.noteKey)),
      },
      {
        name: "system game_journey_items.templateKey -> active game_journey_templates.key",
        checked: (tables.game_journey_items || []).filter((item) => systemUserKeys.has(item.createdBy)).length,
        missing: (tables.game_journey_items || []).filter(
          (item) => systemUserKeys.has(item.createdBy) && !activeTemplateKeys.has(item.templateKey),
        ),
      },
      {
        name: "game_journey_activity.noteKey -> game_journey_notes.key",
        checked: (tables.game_journey_activity || []).length,
        missing: (tables.game_journey_activity || []).filter((activity) => !noteKeys.has(activity.noteKey)),
      },
      {
        name: "user_roles.userKey -> users.key",
        checked: (tables.user_roles || []).length,
        missing: (tables.user_roles || []).filter((row) => !userKeys.has(row.userKey)),
      },
      {
        name: "user_roles.roleKey -> roles.key",
        checked: (tables.user_roles || []).length,
        missing: (tables.user_roles || []).filter((row) => !roleKeys.has(row.roleKey)),
      },
      {
        name: "tool_state_samples.userKey -> users.key",
        checked: userOwnedToolStateSamples.length,
        missing: userOwnedToolStateSamples.filter((sample) => !userKeys.has(sample.userKey)),
      },
      {
        name: "palette_colors.gameId -> project_workspace_palette_globals.gameId",
        checked: (tables.palette_colors || []).length,
        missing: (tables.palette_colors || []).filter((row) => !paletteGlobals.has(row.gameId)),
      },
      {
        name: "palette_swatch_usages.swatchKey -> palette_colors.swatchKey",
        checked: (tables.palette_swatch_usages || []).length,
        missing: (tables.palette_swatch_usages || []).filter((row) => !paletteColorKeys.has(`${row.gameId}:${row.swatchKey}`)),
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
    const notesByKey = new Map((tables.game_journey_notes || []).map((note) => [note.key, note]));
    const findings = [];
    (tables.game_journey_items || []).forEach((item) => {
      const note = notesByKey.get(item.noteKey);
      if (note && note.gameKey !== item.gameKey) {
        findings.push(`${item.key} gameKey ${item.gameKey} does not match note ${note.key} gameKey ${note.gameKey}.`);
      }
    });
    (tables.game_journey_activity || []).forEach((activity) => {
      const note = notesByKey.get(activity.noteKey);
      if (note && note.gameKey !== activity.gameKey) {
        findings.push(`${activity.key} gameKey ${activity.gameKey} does not match note ${note.key} gameKey ${note.gameKey}.`);
      }
    });
    return findings;
  }

  staleDisplayFindings(tables, groups) {
    const groupTableNames = new Set(groups.flatMap((group) => group.tableNames));
    const unownedTables = Object.keys(tables).filter((tableName) => !groupTableNames.has(tableName));
    if (unownedTables.length) {
      return unownedTables.map((tableName) => `${tableName} has live data but no ${this.modeLabel} filter owner.`);
    }
    return ["No stale display data detected; tables are rendered from current configured snapshots."];
  }

  renderList(messages, dataName) {
    const list = this.createElement("ul");
    list.dataset[dataName] = "";
    messages.forEach((message) => {
      list.append(this.createElement("li", { text: message }));
    });
    return list;
  }

  diagnosticMessage(diagnostic) {
    if (typeof diagnostic === "string") {
      return diagnostic;
    }
    if (!diagnostic || typeof diagnostic !== "object") {
      return "Configured database source reported an unreadable table.";
    }
    const message = diagnostic.message || `${diagnostic.tableName || "A configured table"} could not be read.`;
    return diagnostic.remediation ? `${message} ${diagnostic.remediation}` : message;
  }

  sourceDiagnostics(snapshot = {}) {
    const diagnostics = [
      ...(Array.isArray(snapshot.tableDiagnostics) ? snapshot.tableDiagnostics : []),
      ...(Array.isArray(snapshot.diagnostics?.tableReadFailures) ? snapshot.diagnostics.tableReadFailures : []),
    ];
    const messages = diagnostics.map((diagnostic) => this.diagnosticMessage(diagnostic));
    return [...new Set(messages)];
  }

  renderDiagnostics(tables, groups, sourceDiagnostics = []) {
    this.diagnostics.replaceChildren();
    const auditFindings = this.auditFindings(tables);
    const bleedFindings = this.tableBleedFindings(tables);
    const staleFindings = this.staleDisplayFindings(tables, groups);
    const auditSummary = auditFindings.length
      ? auditFindings
      : [`All current ${this.modeLabel} tables include createdAt, updatedAt, createdBy, and updatedBy.`];
    const bleedSummary = bleedFindings.length ? bleedFindings : ["No table bleed detected."];
    if (sourceDiagnostics.length) {
      this.diagnostics.append(
        this.renderList(sourceDiagnostics, "adminDbSourceFindings"),
      );
    }
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
      relationship.missing.map((record) => `${relationship.name} missing for ${record.tableName ? `${record.tableName}.` : ""}${this.recordId(record)}.`),
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

  renderLoadError(error) {
    const message = error instanceof Error ? error.message : String(error || `Unknown ${this.modeLabel} error.`);
    this.diagnostics?.replaceChildren(
      this.renderList([`${this.modeLabel} could not render current data: ${message}`], "adminDbAuditFindings"),
    );
    this.relationships?.replaceChildren(
      this.renderList([`Relationships could not be checked until the ${this.modeLabel} data error is fixed.`], "adminDbMissingLinks"),
    );
    this.tablesRoot?.replaceChildren();
    if (this.status) {
      this.status.textContent = this.canWrite
        ? `${this.modeLabel} data error. Fix the invalid record ownership, then restore baseline records.`
        : `${this.modeLabel} data error. Fix the configured connection, then reload DB Viewer.`;
    }
  }

  render() {
    let snapshot;
    try {
      snapshot = this.collectSnapshot();
    } catch (error) {
      this.renderLoadError(error);
      return;
    }
    this.applyProviderInfo(snapshot.providerInfo);
    this.renderModeChrome(snapshot.providerInfo);
    const group = this.activeGroup(snapshot.groups);
    const visibleTables = Object.fromEntries(
      group.tableNames
        .filter((tableName) => Object.hasOwn(snapshot.tables, tableName))
        .map((tableName) => [tableName, snapshot.tables[tableName]]),
    );
    this.renderFilters(snapshot.groups);
    this.renderClearSeedButton(snapshot.cleared);
    this.renderDiagnostics(snapshot.tables, snapshot.groups, snapshot.sourceDiagnostics);
    this.renderRelationships(snapshot.tables);
    this.renderTables(visibleTables, snapshot.schemas);
    if (this.status) {
      const recordCount = Object.values(visibleTables).reduce((total, rows) => total + rows.length, 0);
      this.status.textContent = `${this.modeLabel} loaded ${Object.keys(visibleTables).length} table${Object.keys(visibleTables).length === 1 ? "" : "s"} and ${recordCount} record${recordCount === 1 ? "" : "s"} for ${group.label}.`;
    }
  }
}

export function startDbViewer(documentRef = document, options = {}) {
  new AdminDbViewer(documentRef, options).start();
}

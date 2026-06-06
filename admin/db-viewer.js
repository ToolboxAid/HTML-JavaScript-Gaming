import { createProjectJourneyMockRepository } from "../toolbox/project-journey/project-journey-mock-repository.js";

const AUDIT_FIELDS = ["createdAt", "updatedAt", "createdByType", "updatedByType"];

class AdminDbViewer {
  constructor(documentRef = document) {
    this.document = documentRef;
    this.repository = createProjectJourneyMockRepository();
    this.status = documentRef.querySelector("[data-admin-db-status]");
    this.diagnostics = documentRef.querySelector("[data-admin-db-diagnostics]");
    this.relationships = documentRef.querySelector("[data-admin-db-relationships]");
    this.tablesRoot = documentRef.querySelector("[data-admin-db-tables]");
  }

  start() {
    this.repository.openProject("demo-project");
    const tables = this.repository.getTables();
    this.renderDiagnostics(tables);
    this.renderRelationships(tables);
    this.renderTables(tables);
    if (this.status) {
      this.status.textContent = "Read-only mock DB dump loaded for Demo Project.";
    }
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
    const noteTypeKeys = new Set(tables.project_journey_note_types.map((type) => type.key));
    const noteKeys = new Set(tables.project_journey_notes.map((note) => note.key));
    const activeTemplateKeys = new Set(
      tables.project_journey_templates
        .filter((template) => template.isActive)
        .map((template) => template.key),
    );
    return [
      {
        name: "project_journey_notes.typeKey -> project_journey_note_types.key",
        checked: tables.project_journey_notes.length,
        missing: tables.project_journey_notes.filter((note) => !noteTypeKeys.has(note.typeKey)),
      },
      {
        name: "project_journey_items.noteKey -> project_journey_notes.key",
        checked: tables.project_journey_items.length,
        missing: tables.project_journey_items.filter((item) => !noteKeys.has(item.noteKey)),
      },
      {
        name: "system project_journey_items.templateKey -> active project_journey_templates.key",
        checked: tables.project_journey_items.filter((item) => item.createdByType === "system").length,
        missing: tables.project_journey_items.filter(
          (item) => item.createdByType === "system" && !activeTemplateKeys.has(item.templateKey),
        ),
      },
      {
        name: "project_journey_activity.noteKey -> project_journey_notes.key",
        checked: tables.project_journey_activity.length,
        missing: tables.project_journey_activity.filter((activity) => !noteKeys.has(activity.noteKey)),
      },
    ];
  }

  tableBleedFindings(tables) {
    const notesByKey = new Map(tables.project_journey_notes.map((note) => [note.key, note]));
    const findings = [];
    tables.project_journey_items.forEach((item) => {
      const note = notesByKey.get(item.noteKey);
      if (note && note.projectKey !== item.projectKey) {
        findings.push(`${item.key} projectKey ${item.projectKey} does not match note ${note.key} projectKey ${note.projectKey}.`);
      }
    });
    tables.project_journey_activity.forEach((activity) => {
      const note = notesByKey.get(activity.noteKey);
      if (note && note.projectKey !== activity.projectKey) {
        findings.push(`${activity.key} projectKey ${activity.projectKey} does not match note ${note.key} projectKey ${note.projectKey}.`);
      }
    });
    return findings;
  }

  renderList(messages, dataName) {
    const list = this.createElement("ul");
    list.dataset[dataName] = "";
    messages.forEach((message) => {
      list.append(this.createElement("li", { text: message }));
    });
    return list;
  }

  renderDiagnostics(tables) {
    this.diagnostics.replaceChildren();
    const auditFindings = this.auditFindings(tables);
    const bleedFindings = this.tableBleedFindings(tables);
    const auditSummary = auditFindings.length
      ? auditFindings
      : ["All Project Journey mock DB tables include createdAt, updatedAt, createdByType, and updatedByType."];
    const bleedSummary = bleedFindings.length ? bleedFindings : ["No table bleed detected."];
    this.diagnostics.append(
      this.renderList(auditSummary, "adminDbAuditFindings"),
      this.renderList(bleedSummary, "adminDbBleedFindings"),
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
}

new AdminDbViewer().start();

export class SessionInspectorV2App {
  constructor({
    accordions,
    deleteAllButton,
    details,
    entryList,
    filters,
    refreshButton,
    runtimeContract,
    statusLog,
    storageService
  }) {
    this.accordions = accordions;
    this.deleteAllButton = deleteAllButton;
    this.details = details;
    this.entries = [];
    this.entryList = entryList;
    this.filters = filters;
    this.refreshButton = refreshButton;
    this.runtimeContract = runtimeContract || { storageAccess: "read-only" };
    this.statusLog = statusLog;
    this.storageService = storageService;
    this.selectedId = "";
  }

  start() {
    this.accordions.forEach((accordion) => accordion.mount());
    this.statusLog.mount();
    this.filters.mount({
      onFilterChanged: () => this.refresh({ silent: true })
    });
    this.entryList.mount({
      onDelete: (entryId) => this.deleteEntry(entryId),
      onSelected: (entryId) => this.selectEntry(entryId)
    });
    this.refreshButton.addEventListener("click", () => this.refresh());
    this.deleteAllButton.addEventListener("click", () => this.deleteAllShownEntries());
    this.refresh({ silent: true });
    this.statusLog.ok(`Session Inspector V2 ready. Storage is ${this.runtimeContract.storageAccess}.`);
  }

  refresh({ silent = false } = {}) {
    this.entries = this.storageService.readEntries({
      filterText: this.filters.filterText(),
      scope: this.filters.scope()
    });
    if (!this.entries.some((entry) => entry.id === this.selectedId)) {
      this.selectedId = this.entries[0]?.id || "";
    }
    this.entryList.render(this.entries, this.selectedId);
    this.details.render(this.entries.find((entry) => entry.id === this.selectedId));
    this.filters.setSummary(this.summaryText());
    if (!silent) {
      this.statusLog.ok(`Loaded ${this.entries.length} matching storage entries.`);
    }
  }

  summaryText() {
    const sessionCount = this.entries.filter((entry) => entry.storageType === "sessionStorage").length;
    const localCount = this.entries.filter((entry) => entry.storageType === "localStorage").length;
    const totalCount = this.entries.length;
    return `${totalCount} entries shown. sessionStorage: ${sessionCount}. localStorage: ${localCount}.`;
  }

  selectEntry(entryId) {
    this.selectedId = entryId;
    this.entryList.render(this.entries, this.selectedId);
    const entry = this.entries.find((candidate) => candidate.id === entryId);
    this.details.render(entry);
    if (entry) {
      this.statusLog.info(`Selected ${entry.storageType}:${entry.key}.`);
    }
  }

  deleteEntry(entryId) {
    const entry = this.entries.find((candidate) => candidate.id === entryId);
    if (!entry) {
      this.statusLog.warn(`Delete skipped: storage entry ${entryId || "(empty)"} is no longer shown.`);
      this.refresh({ silent: true });
      return;
    }
    const result = this.storageService.deleteEntry(entry);
    if (result.ok) {
      this.statusLog.ok(`Deleted ${entry.storageType}:${entry.key}.`);
    } else {
      this.statusLog.fail(`Delete failed for ${entry.storageType}:${entry.key}: ${result.message}`);
    }
    this.refresh({ silent: true });
  }

  deleteAllShownEntries() {
    if (!this.entries.length) {
      this.statusLog.warn("Delete All skipped: no matching storage entries are shown.");
      return;
    }
    const result = this.storageService.deleteEntries(this.entries);
    if (result.failed.length) {
      result.deleted.forEach((entry) => {
        this.statusLog.ok(`Deleted ${entry.storageType}:${entry.key}.`);
      });
      result.failed.forEach(({ entry, message }) => {
        this.statusLog.fail(`Delete failed for ${entry.storageType}:${entry.key}: ${message}`);
      });
    } else {
      this.statusLog.ok(`Deleted ${result.deleted.length} shown storage entr${result.deleted.length === 1 ? "y" : "ies"}.`);
    }
    this.selectedId = "";
    this.refresh({ silent: true });
  }
}

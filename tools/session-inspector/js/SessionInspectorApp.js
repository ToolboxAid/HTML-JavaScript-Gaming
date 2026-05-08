export class SessionInspectorApp {
  constructor({
    accordions,
    details,
    entryList,
    filters,
    refreshButton,
    statusLog,
    storageService
  }) {
    this.accordions = accordions;
    this.details = details;
    this.entries = [];
    this.entryList = entryList;
    this.filters = filters;
    this.refreshButton = refreshButton;
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
      onSelected: (entryId) => this.selectEntry(entryId)
    });
    this.refreshButton.addEventListener("click", () => this.refresh());
    this.refresh({ silent: true });
    this.statusLog.ok("Session Inspector ready. Storage is read-only.");
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
}

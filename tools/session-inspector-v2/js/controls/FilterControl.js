export class FilterControl {
  constructor({ filterInput, scopeSelect, summary }) {
    this.filterInput = filterInput;
    this.scopeSelect = scopeSelect;
    this.summary = summary;
  }

  mount({ onFilterChanged }) {
    this.filterInput.addEventListener("input", () => {
      onFilterChanged();
    });
    this.scopeSelect.addEventListener("change", () => {
      onFilterChanged();
    });
  }

  filterText() {
    return String(this.filterInput.value || "").trim();
  }

  scope() {
    return String(this.scopeSelect.value || "sessionStorage");
  }

  setSummary({ localCount = 0, sessionCount = 0, totalCount = 0 } = {}) {
    const lines = [
      `(${totalCount}) Entries shown.`,
      `(${sessionCount}) SessionStorage.`,
      `(${localCount}) LocalStorage.`
    ];
    const documentRef = this.summary.ownerDocument || document;
    this.summary.replaceChildren(...lines.map((line) => {
      const item = documentRef.createElement("span");
      item.textContent = line;
      return item;
    }));
  }
}

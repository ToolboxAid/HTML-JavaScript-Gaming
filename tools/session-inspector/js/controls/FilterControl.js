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

  setSummary(value) {
    this.summary.textContent = value;
  }
}

export class EntryListControl {
  constructor({ container }) {
    this.container = container;
    this.entries = [];
    this.onSelected = () => {};
    this.selectedId = "";
  }

  mount({ onSelected }) {
    this.onSelected = onSelected;
  }

  render(entries, selectedId = "") {
    this.entries = entries.map((entry) => ({ ...entry }));
    this.selectedId = selectedId;
    if (!this.entries.length) {
      const empty = document.createElement("p");
      empty.className = "session-inspector__empty";
      empty.textContent = "No matching storage entries.";
      this.container.replaceChildren(empty);
      return;
    }
    this.container.replaceChildren(...this.entries.map((entry) => this.entryButton(entry)));
  }

  entryButton(entry) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-inspector__entry-button";
    button.classList.toggle("is-selected", entry.id === this.selectedId);
    button.dataset.sessionInspectorEntryId = entry.id;

    const key = document.createElement("span");
    key.className = "session-inspector__entry-key";
    key.textContent = entry.key;

    const meta = document.createElement("span");
    meta.className = "session-inspector__entry-meta";
    meta.textContent = `${entry.storageType} | ${entry.valueType} | ${entry.sizeBytes} bytes`;

    const preview = document.createElement("span");
    preview.className = "session-inspector__entry-preview";
    preview.textContent = entry.preview;

    button.append(key, meta, preview);
    button.addEventListener("click", () => {
      this.selectedId = entry.id;
      this.onSelected(entry.id);
    });
    return button;
  }
}

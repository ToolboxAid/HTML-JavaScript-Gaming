export class EntryListControl {
  constructor({ container }) {
    this.container = container;
    this.entries = [];
    this.onDelete = () => {};
    this.onSelected = () => {};
    this.selectedId = "";
  }

  mount({ onDelete, onSelected }) {
    this.onDelete = onDelete;
    this.onSelected = onSelected;
  }

  render(entries, selectedId = "") {
    this.entries = entries.map((entry) => ({ ...entry }));
    this.selectedId = selectedId;
    if (!this.entries.length) {
      const empty = document.createElement("p");
      empty.className = "session-inspector-v2__empty";
      empty.textContent = "No matching storage entries.";
      this.container.replaceChildren(empty);
      return;
    }
    this.container.replaceChildren(...this.entries.map((entry) => this.entryCard(entry)));
  }

  entryCard(entry) {
    const card = document.createElement("article");
    card.className = "session-inspector-v2__entry-card";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-inspector-v2__entry-button";
    button.classList.toggle("is-selected", entry.id === this.selectedId);
    button.dataset.sessionInspectorV2EntryId = entry.id;

    const key = document.createElement("span");
    key.className = "session-inspector-v2__entry-key";
    key.textContent = entry.key;

    const storageType = document.createElement("span");
    storageType.className = "session-inspector-v2__entry-storage-type";
    storageType.textContent = entry.storageType;

    const valueSize = document.createElement("span");
    valueSize.className = "session-inspector-v2__entry-value-size";
    valueSize.textContent = `${entry.valueType} | ${entry.sizeBytes} bytes`;

    button.append(key, storageType, valueSize);
    button.addEventListener("click", () => {
      this.selectedId = entry.id;
      this.onSelected(entry.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "session-inspector-v2__entry-delete-button";
    deleteButton.dataset.sessionInspectorV2DeleteEntryId = entry.id;
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${entry.storageType} entry ${entry.key}`);
    deleteButton.addEventListener("click", () => {
      this.onDelete(entry.id);
    });

    card.append(button, deleteButton);
    return card;
  }
}

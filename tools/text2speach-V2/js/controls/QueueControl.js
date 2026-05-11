function tileMeta(item) {
  return [
    item.language || "no language",
    item.characterPreset || "manual",
    item.voiceAge || "any"
  ].join(" / ");
}

export class QueueControl {
  constructor({
    addButton,
    deleteButton,
    duplicateButton,
    queueTiles
  }) {
    this.addButton = addButton;
    this.deleteButton = deleteButton;
    this.duplicateButton = duplicateButton;
    this.queue = [];
    this.queueTiles = queueTiles;
    this.selectedItemId = "";
  }

  populate(queue, selectedItemId = "") {
    this.queue = queue.map((item) => ({ ...item }));
    this.selectedItemId = selectedItemId && this.queue.some((item) => item.id === selectedItemId)
      ? selectedItemId
      : this.queue[0]?.id || "";
    this.render();
  }

  render() {
    this.queueTiles.replaceChildren(...this.queue.map((item) => {
      const tile = document.createElement("button");
      tile.type = "button";
      tile.className = "text2speach-V2__queue-tile";
      tile.dataset.speechItemId = item.id;
      tile.setAttribute("role", "option");
      tile.setAttribute("aria-selected", String(item.id === this.selectedItemId));

      const name = document.createElement("span");
      name.className = "text2speach-V2__queue-tile-name";
      name.textContent = item.name;

      const meta = document.createElement("span");
      meta.className = "text2speach-V2__queue-tile-meta";
      meta.textContent = tileMeta(item);

      tile.append(name, meta);
      return tile;
    }));
  }

  mount({ onAdd, onChange, onDelete, onDuplicate }) {
    this.queueTiles.addEventListener("click", (event) => {
      const tile = event.target.closest("[data-speech-item-id]");
      if (!tile) {
        return;
      }
      this.selectItem(tile.dataset.speechItemId || "");
      onChange(this.selectedItem());
    });
    this.addButton.addEventListener("click", () => {
      onAdd();
    });
    this.duplicateButton.addEventListener("click", () => {
      onDuplicate(this.selectedItem());
    });
    this.deleteButton.addEventListener("click", () => {
      onDelete(this.selectedItem());
    });
  }

  selectItem(itemId) {
    if (!this.queue.some((item) => item.id === itemId)) {
      return;
    }
    this.selectedItemId = itemId;
    this.render();
  }

  addItem(item) {
    this.queue.push({ ...item });
    this.selectedItemId = item.id;
    this.render();
  }

  replaceSelectedItem(item) {
    const index = this.queue.findIndex((entry) => entry.id === this.selectedItemId);
    if (index < 0) {
      return;
    }
    this.queue[index] = { ...item };
    this.selectedItemId = item.id;
    this.render();
  }

  deleteSelectedItem(replacementItem = null) {
    const index = this.queue.findIndex((item) => item.id === this.selectedItemId);
    if (index < 0) {
      return null;
    }
    this.queue.splice(index, 1);
    if (this.queue.length === 0 && replacementItem) {
      this.queue.push({ ...replacementItem });
      this.selectedItemId = replacementItem.id;
    } else {
      this.selectedItemId = this.queue[Math.min(index, this.queue.length - 1)]?.id || "";
    }
    this.render();
    return this.selectedItem();
  }

  selectedItem() {
    return this.queue.find((item) => item.id === this.selectedItemId) || null;
  }

  selectedQueue() {
    return this.queue.map((item) => ({ ...item }));
  }
}

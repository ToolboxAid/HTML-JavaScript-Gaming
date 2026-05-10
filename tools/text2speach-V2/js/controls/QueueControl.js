export class QueueControl {
  constructor({ queueSelect }) {
    this.queue = [];
    this.queueSelect = queueSelect;
  }

  populate(queue) {
    this.queue = queue.map((item) => ({ ...item }));
    this.queueSelect.replaceChildren(...this.queue.map((item) => {
      const node = document.createElement("option");
      node.value = item.id;
      node.textContent = item.name;
      return node;
    }));
  }

  mount({ onChange }) {
    this.queueSelect.addEventListener("change", () => {
      onChange(this.selectedItem());
    });
  }

  selectedItem() {
    return this.queue.find((item) => item.id === this.queueSelect.value) || null;
  }

  selectedQueue() {
    return this.queue.map((item) => ({ ...item }));
  }
}

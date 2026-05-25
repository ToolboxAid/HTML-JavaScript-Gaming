export class PreviewPanelControl {
  constructor(output) {
    this.output = output;
  }

  clear() {
    this.output.replaceChildren(this.createEmptyState());
  }

  render(payload) {
    const card = document.createElement("article");
    card.className = "tool-starter__preview-card";

    const title = document.createElement("h2");
    title.textContent = "Rendered Preview";

    const body = document.createElement("p");
    body.textContent = payload.sourceValue;

    card.append(title, body);
    this.output.replaceChildren(card);
  }

  createEmptyState() {
    const emptyState = document.createElement("p");
    emptyState.textContent = "No preview rendered yet.";
    return emptyState;
  }
}


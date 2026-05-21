export class SourceInventoryControl {
  constructor(container) {
    this.container = container;
  }

  render(sources) {
    this.container.replaceChildren(...sources.map((source) => {
      const card = document.createElement("article");
      card.className = "input-mapping-v2__source-card";

      const title = document.createElement("strong");
      title.textContent = source.name;

      const detail = document.createElement("p");
      detail.textContent = source.detail;

      const engine = document.createElement("code");
      engine.textContent = source.engine;

      card.append(title, detail, engine);
      return card;
    }));
  }
}

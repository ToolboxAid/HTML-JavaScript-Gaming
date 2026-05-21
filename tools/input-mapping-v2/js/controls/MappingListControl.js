export class MappingListControl {
  constructor(container) {
    this.container = container;
  }

  render(actions, selectedActionId) {
    if (!this.container) {
      return;
    }
    if (!actions.length) {
      this.container.textContent = "No actions are configured.";
      return;
    }
    this.container.replaceChildren(...actions.map((action) => this.createActionCard(action, action.id === selectedActionId)));
  }

  createActionCard(action, selected) {
    const card = document.createElement("article");
    card.className = "input-mapping-v2__mapping-card";
    card.dataset.selected = selected ? "true" : "false";

    const title = document.createElement("div");
    title.className = "input-mapping-v2__mapping-title";
    const label = document.createElement("span");
    label.textContent = action.label;
    const count = document.createElement("span");
    count.textContent = `${action.inputs.length} input${action.inputs.length === 1 ? "" : "s"}`;
    title.append(label, count);

    const inputs = document.createElement("div");
    inputs.className = "input-mapping-v2__mapping-inputs";
    if (!action.inputs.length) {
      const empty = document.createElement("span");
      empty.className = "input-mapping-v2__mapping-chip";
      empty.textContent = "Unmapped";
      inputs.append(empty);
    } else {
      inputs.append(...action.inputs.map((input) => {
        const chip = document.createElement("span");
        chip.className = "input-mapping-v2__mapping-chip";
        chip.textContent = input.label;
        chip.title = `${input.type}: ${input.code}`;
        return chip;
      }));
    }

    card.append(title, inputs);
    return card;
  }
}

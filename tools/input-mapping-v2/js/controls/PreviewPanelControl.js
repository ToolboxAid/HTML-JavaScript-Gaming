export class PreviewPanelControl {
  constructor(output) {
    this.output = output;
    this.onDeleteBinding = () => {};
  }

  mount({ onDeleteBinding }) {
    this.onDeleteBinding = onDeleteBinding;
  }

  render(actions) {
    const mappedActions = actions.filter((action) => action.inputs.length > 0);
    if (!mappedActions.length) {
      this.output.replaceChildren(this.createEmptyState());
      return;
    }
    this.output.replaceChildren(...mappedActions.map((action) => this.createActionCard(action)));
  }

  createActionCard(action) {
    const card = document.createElement("article");
    card.className = "input-mapping-v2__mapping-card";

    const title = document.createElement("h2");
    title.textContent = action.label;

    const tokens = document.createElement("div");
    tokens.className = "input-mapping-v2__token-list";
    tokens.append(...action.inputs.map((input) => this.createInputToken(action.id, input)));

    card.append(title, tokens);
    return card;
  }

  createInputToken(actionId, input) {
    const token = document.createElement("button");
    token.type = "button";
    token.className = "input-mapping-v2__input-token";
    token.textContent = input.label;
    token.title = `Delete ${input.label}`;
    token.dataset.inputMappingActionId = actionId;
    token.dataset.inputMappingBinding = input.binding;
    token.addEventListener("click", () => {
      this.onDeleteBinding({ actionId, binding: input.binding });
    });
    return token;
  }

  createEmptyState() {
    const emptyState = document.createElement("p");
    emptyState.textContent = "No inputs captured yet.";
    return emptyState;
  }
}

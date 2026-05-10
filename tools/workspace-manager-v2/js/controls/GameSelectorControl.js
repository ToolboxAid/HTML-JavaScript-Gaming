export class GameSelectorControl {
  constructor({ select, summary }) {
    this.select = select;
    this.summary = summary;
  }

  mount({ games, onGameSelected }) {
    this.setGames(games);
    this.select.addEventListener("change", () => {
      onGameSelected(this.select.value);
    });
  }

  setGames(games = []) {
    if (!games.length) {
      this.clear();
      return;
    }
    this.select.replaceChildren(this.placeholderOption(), ...games.map((game) => this.gameOption(game)));
    this.select.disabled = false;
    this.select.value = "";
  }

  clear() {
    this.select.replaceChildren();
    this.select.disabled = true;
  }

  placeholderOption() {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Select a game";
    return option;
  }

  gameOption(game) {
    const option = document.createElement("option");
    option.value = game.id;
    option.textContent = game.name;
    return option;
  }

  setSummary(value) {
    this.summary.textContent = value;
  }

  setSelectionLocked(isLocked) {
    this.select.disabled = Boolean(isLocked) || !this.select.options.length;
  }

  setValue(value, label = "") {
    const nextValue = String(value || "");
    if (nextValue && !Array.from(this.select.options).some((option) => option.value === nextValue)) {
      const option = this.gameOption({
        id: nextValue,
        name: label || nextValue
      });
      option.dataset.temporaryWorkspaceGame = "true";
      this.select.append(option);
      this.select.disabled = false;
    }
    this.select.value = nextValue;
  }
}

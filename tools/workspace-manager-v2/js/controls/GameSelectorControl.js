export class GameSelectorControl {
  constructor({ select, summary }) {
    this.select = select;
    this.summary = summary;
  }

  mount({ games, onGameSelected }) {
    this.select.replaceChildren(this.placeholderOption(), ...games.map((game) => this.gameOption(game)));
    this.select.addEventListener("change", () => {
      onGameSelected(this.select.value);
    });
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
}

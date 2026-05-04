import { SwatchRow } from "../modules/SwatchRow.js";

export class UserPaletteControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.renderSortOptions();
    this.renderSizeOptions();
    this.refs.userSwatchSizeSelect.addEventListener("change", () => {
      this.app.setSwatchSize(this.refs.userSwatchSizeSelect.value);
    });
  }

  render() {
    const swatches = this.app.getUserSwatches();
    this.refs.userPaletteCount.textContent = `${swatches.length} user swatches`;
    this.refs.userSwatchSizeSelect.value = this.app.getSwatchSize();
    this.refs.userSwatchList.dataset.swatchSize = this.app.getSwatchSize();
    this.renderActiveSortButton();
    this.refs.userSwatchList.replaceChildren();

    if (swatches.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No user swatches.";
      this.refs.userSwatchList.appendChild(empty);
      return;
    }

    this.app.getVisibleUserSwatchRows().forEach(({ swatch, index }) => {
      this.refs.userSwatchList.appendChild(SwatchRow.createUserTile(this.document, swatch, {
        pinned: true,
        selected: index === this.app.getSelectedUserIndex(),
        onSelect: () => this.app.selectUserSwatch(index),
        onTack: () => this.app.removeUserSwatch(index)
      }));
    });
  }

  renderSortOptions() {
    this.refs.userPaletteSortControls.replaceChildren();
    this.app.getSortModes().forEach((mode) => {
      const button = this.document.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__sort-button";
      button.dataset.sortMode = mode.value;
      button.setAttribute("role", "radio");
      button.textContent = mode.label;
      button.addEventListener("click", () => {
        this.app.setUserSortMode(mode.value);
      });
      this.refs.userPaletteSortControls.appendChild(button);
    });
    this.renderActiveSortButton();
  }

  renderSizeOptions() {
    this.refs.userSwatchSizeSelect.replaceChildren();
    this.app.getSwatchSizeOptions().forEach((size) => {
      const option = this.document.createElement("option");
      option.value = size.value;
      option.textContent = size.label;
      this.refs.userSwatchSizeSelect.appendChild(option);
    });
  }

  renderActiveSortButton() {
    const activeMode = this.app.getUserSortMode();
    this.refs.userPaletteSortControls.querySelectorAll("[data-sort-mode]").forEach((button) => {
      const isActive = button.dataset.sortMode === activeMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });
  }
}

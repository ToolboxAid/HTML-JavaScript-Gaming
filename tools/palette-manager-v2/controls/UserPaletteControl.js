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
  }

  render() {
    const swatches = this.app.getUserSwatches();
    this.refs.userPaletteCount.textContent = `${swatches.length} user swatches`;
    this.refs.userSwatchList.dataset.swatchSize = this.app.getUserSwatchSize();
    this.renderActiveSortButton();
    this.renderActiveSizeButton();
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
    this.refs.userSwatchSizeControls.replaceChildren();
    this.app.getSwatchSizeOptions().forEach((size) => {
      const button = this.document.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__sort-button palette-manager-v2__size-button";
      button.dataset.swatchSize = size.value;
      button.setAttribute("role", "radio");
      button.textContent = size.label;
      button.addEventListener("click", () => {
        this.app.setUserSwatchSize(size.value);
      });
      this.refs.userSwatchSizeControls.appendChild(button);
    });
    this.renderActiveSizeButton();
  }

  renderActiveSortButton() {
    const activeMode = this.app.getUserSortMode();
    this.refs.userPaletteSortControls.querySelectorAll("[data-sort-mode]").forEach((button) => {
      const isActive = button.dataset.sortMode === activeMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });
  }

  renderActiveSizeButton() {
    const activeSize = this.app.getUserSwatchSize();
    this.refs.userSwatchSizeControls.querySelectorAll("[data-swatch-size]").forEach((button) => {
      const isActive = button.dataset.swatchSize === activeSize;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });
  }
}

import { SwatchRow } from "../modules/SwatchRow.js";

export class UserPaletteControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.renderSortOptions();
    this.refs.userPaletteSortSelect.addEventListener("change", () => {
      this.app.setUserSortMode(this.refs.userPaletteSortSelect.value);
    });
  }

  render() {
    const swatches = this.app.getUserSwatches();
    this.refs.userPaletteCount.textContent = `${swatches.length} user swatches`;
    this.refs.userPaletteSortSelect.value = this.app.getUserSortMode();
    this.refs.userSwatchList.replaceChildren();

    if (swatches.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No user swatches.";
      this.refs.userSwatchList.appendChild(empty);
      return;
    }

    this.app.getVisibleUserSwatchRows().forEach(({ swatch, index }) => {
      this.refs.userSwatchList.appendChild(SwatchRow.create(this.document, swatch, {
        pinned: true,
        selected: index === this.app.getSelectedUserIndex(),
        onSelect: () => this.app.selectUserSwatch(index),
        onTack: () => this.app.removeUserSwatch(index)
      }));
    });
  }

  renderSortOptions() {
    this.refs.userPaletteSortSelect.replaceChildren();
    this.app.getSortModes().forEach((mode) => {
      const option = this.document.createElement("option");
      option.value = mode.value;
      option.textContent = mode.label;
      this.refs.userPaletteSortSelect.appendChild(option);
    });
  }
}

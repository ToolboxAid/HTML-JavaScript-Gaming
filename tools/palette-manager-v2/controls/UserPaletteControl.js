import { SwatchRow } from "../modules/SwatchRow.js";

export class UserPaletteControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {}

  render() {
    const swatches = this.app.getUserSwatches();
    this.refs.userPaletteCount.textContent = `${swatches.length} user swatches`;
    this.refs.userSwatchList.replaceChildren();

    if (swatches.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No user swatches.";
      this.refs.userSwatchList.appendChild(empty);
      return;
    }

    swatches.forEach((swatch, index) => {
      this.refs.userSwatchList.appendChild(SwatchRow.create(this.document, swatch, {
        pinned: true,
        selected: index === this.app.getSelectedUserIndex(),
        onSelect: () => this.app.selectUserSwatch(index),
        onTack: () => this.app.removeUserSwatch(index)
      }));
    });
  }
}

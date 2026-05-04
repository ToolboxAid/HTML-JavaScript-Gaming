import { SwatchRow } from "../modules/SwatchRow.js";

export class SourcePaletteBrowserControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.renderSourceOptions();
    this.refs.sourcePaletteSelect.addEventListener("change", () => {
      this.app.setSourcePaletteId(this.refs.sourcePaletteSelect.value);
    });
    this.refs.sourceSearchInput.addEventListener("input", () => {
      this.app.setSourceSearch(this.refs.sourceSearchInput.value);
    });
  }

  render() {
    this.refs.sourcePaletteSelect.value = this.app.getCurrentSourcePaletteId();
    this.refs.sourceSearchInput.value = this.app.getSourceSearch();
    this.refs.sourceSwatchList.replaceChildren();

    const visibleSwatches = this.app.getVisibleSourceSwatches();
    if (visibleSwatches.length === 0) {
      const empty = this.document.createElement("p");
      empty.className = "palette-manager-v2__meta";
      empty.textContent = "No source swatches match the search.";
      this.refs.sourceSwatchList.appendChild(empty);
      return;
    }

    visibleSwatches.forEach((swatch) => {
      const userIndex = this.app.findUserSwatchIndex(swatch);
      this.refs.sourceSwatchList.appendChild(SwatchRow.createSourceTile(this.document, swatch, {
        pinned: userIndex >= 0,
        onSelect: () => this.app.browseSourceSwatch(swatch),
        onTack: () => {
          if (userIndex >= 0) {
            this.app.removeUserSwatch(userIndex);
            return;
          }
          this.app.pinSourceSwatch(swatch, this.app.getCurrentSourcePaletteId());
        }
      }));
    });
  }

  renderSourceOptions() {
    this.refs.sourcePaletteSelect.replaceChildren();
    this.app.getSourcePaletteIds().forEach((sourceId) => {
      const option = this.document.createElement("option");
      option.value = sourceId;
      option.textContent = this.app.getSourcePaletteLabel(sourceId);
      this.refs.sourcePaletteSelect.appendChild(option);
    });
  }
}

import { SwatchRow } from "../modules/SwatchRow.js";

export class SourcePaletteBrowserControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {
    this.renderSourceOptions();
    this.renderSortOptions();
    this.renderSizeOptions();
    this.refs.sourcePaletteSelect.addEventListener("change", () => {
      this.app.setSourcePaletteId(this.refs.sourcePaletteSelect.value);
    });
    this.refs.sourceSearchInput.addEventListener("input", () => {
      this.app.setSourceSearch(this.refs.sourceSearchInput.value);
    });
    this.refs.pinAllSourceButton.addEventListener("click", () => {
      this.preserveSourceScrollDuring(() => this.app.pinVisibleSourceSwatches());
    });
  }

  preserveSourceScrollDuring(action) {
    const sourceScrollTop = this.refs.sourceSwatchList.scrollTop;
    action();
    requestAnimationFrame(() => {
      this.refs.sourceSwatchList.scrollTop = sourceScrollTop;
    });
  }

  render() {
    this.refs.sourcePaletteSelect.value = this.app.getCurrentSourcePaletteId();
    this.refs.sourceSearchInput.value = this.app.getSourceSearch();
    this.refs.sourceSwatchList.dataset.swatchSize = this.app.getSourceSwatchSize();
    this.renderActiveSortButton();
    this.renderActiveSizeButton();
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
      const userIndex = this.app.findDuplicateUserSwatchIndex(swatch);
      this.refs.sourceSwatchList.appendChild(SwatchRow.createSourceTile(this.document, swatch, {
        pinned: userIndex >= 0,
        onSelect: () => this.app.browseSourceSwatch(swatch),
        onTack: () => {
          this.preserveSourceScrollDuring(() => {
            if (userIndex >= 0) {
              this.app.removeUserSwatch(userIndex);
              return;
            }
            this.app.pinSourceSwatch(swatch, this.app.getCurrentSourcePaletteId());
          });
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

  renderSortOptions() {
    this.refs.sourcePaletteSortControls.replaceChildren();
    this.app.getSourceSortOptions().forEach((option) => {
      const button = this.document.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__sort-button";
      button.dataset.sortKey = option.value;
      button.dataset.sortLabel = option.label;
      button.setAttribute("role", "radio");
      button.textContent = option.label;
      button.addEventListener("click", () => {
        this.app.setSourceSortKey(option.value);
      });
      this.refs.sourcePaletteSortControls.appendChild(button);
    });
    this.renderActiveSortButton();
  }

  renderSizeOptions() {
    this.refs.sourceSwatchSizeControls.replaceChildren();
    this.app.getSwatchSizeOptions().forEach((size) => {
      const button = this.document.createElement("button");
      button.type = "button";
      button.className = "palette-manager-v2__sort-button palette-manager-v2__size-button";
      button.dataset.swatchSize = size.value;
      button.setAttribute("role", "radio");
      button.textContent = size.label;
      button.addEventListener("click", () => {
        this.app.setSourceSwatchSize(size.value);
      });
      this.refs.sourceSwatchSizeControls.appendChild(button);
    });
    this.renderActiveSizeButton();
  }

  renderActiveSortButton() {
    const activeKey = this.app.getSourceSortKey();
    const directionIndicator = this.app.getSourceSortDirection() === "descending" ? "▼" : "▲";
    this.refs.sourcePaletteSortControls.querySelectorAll("[data-sort-key]").forEach((button) => {
      const isActive = button.dataset.sortKey === activeKey;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
      button.textContent = isActive ? `${button.dataset.sortLabel} ${directionIndicator}` : button.dataset.sortLabel;
    });
  }

  renderActiveSizeButton() {
    const activeSize = this.app.getSourceSwatchSize();
    this.refs.sourceSwatchSizeControls.querySelectorAll("[data-swatch-size]").forEach((button) => {
      const isActive = button.dataset.swatchSize === activeSize;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-checked", String(isActive));
    });
  }
}

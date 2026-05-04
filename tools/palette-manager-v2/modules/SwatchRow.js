export class SwatchRow {
  static create(documentRef, swatch, options = {}) {
    const row = documentRef.createElement("div");
    row.className = "palette-manager-v2__swatch-row";
    if (options.selected) {
      row.classList.add("is-selected");
    }

    const chip = documentRef.createElement("span");
    chip.className = "palette-manager-v2__swatch-chip";
    chip.style.background = swatch.hex;

    const copy = documentRef.createElement("div");
    copy.className = "palette-manager-v2__swatch-copy";

    const name = documentRef.createElement("p");
    name.className = "palette-manager-v2__swatch-name";
    name.textContent = swatch.name;

    const meta = documentRef.createElement("p");
    meta.className = "palette-manager-v2__swatch-meta";
    meta.textContent = `${swatch.symbol} | ${swatch.hex} | ${swatch.source}`;

    copy.append(name, meta);

    const tack = documentRef.createElement("button");
    tack.type = "button";
    tack.className = "palette-manager-v2__pin-button";
    tack.classList.toggle("is-pinned", Boolean(options.pinned));
    tack.textContent = "Tack";
    tack.title = options.pinned ? "Remove pinned swatch" : "Pin to user palette";
    tack.setAttribute("aria-label", tack.title);
    tack.addEventListener("click", (event) => {
      event.stopPropagation();
      if (typeof options.onTack === "function") {
        options.onTack();
      }
    });

    row.append(chip, copy, tack);
    if (typeof options.onSelect === "function") {
      row.addEventListener("click", options.onSelect);
    }
    return row;
  }
}

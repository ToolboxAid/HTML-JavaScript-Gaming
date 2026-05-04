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
    chip.title = SwatchRow.createTooltipText(swatch);

    const copy = documentRef.createElement("div");
    copy.className = "palette-manager-v2__swatch-copy";

    const name = documentRef.createElement("p");
    name.className = "palette-manager-v2__swatch-name";
    name.textContent = swatch.name;

    const meta = SwatchRow.createDetailsBlock(documentRef, swatch, "palette-manager-v2__swatch-meta");

    copy.append(name, meta);

    const tack = SwatchRow.createTackButton(documentRef, options);

    row.title = SwatchRow.createTooltipText(swatch);
    row.append(chip, copy, tack);
    if (typeof options.onSelect === "function") {
      row.addEventListener("click", options.onSelect);
    }
    return row;
  }

  static createSourceTile(documentRef, swatch, options = {}) {
    return SwatchRow.createTile(documentRef, swatch, {
      ...options,
      ariaLabel: `Browse ${swatch.name}`,
      variantClassName: "palette-manager-v2__source-tile"
    });
  }

  static createUserTile(documentRef, swatch, options = {}) {
    return SwatchRow.createTile(documentRef, swatch, {
      ...options,
      ariaLabel: `Edit ${swatch.name}`,
      variantClassName: "palette-manager-v2__user-tile"
    });
  }

  static createTile(documentRef, swatch, options = {}) {
    const tile = documentRef.createElement("div");
    tile.className = `palette-manager-v2__swatch-tile ${options.variantClassName || ""}`.trim();
    if (options.selected) {
      tile.classList.add("is-selected");
    }
    tile.tabIndex = 0;
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", options.ariaLabel || `Select ${swatch.name}`);
    tile.style.setProperty("--swatch-color", swatch.hex);
    tile.title = SwatchRow.createTooltipText(swatch);
    tile.addEventListener("click", () => {
      if (typeof options.onSelect === "function") {
        options.onSelect();
      }
    });
    tile.addEventListener("keydown", (event) => {
      if (event.target !== tile) {
        return;
      }
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      if (typeof options.onSelect === "function") {
        options.onSelect();
      }
    });

    const chip = documentRef.createElement("span");
    chip.className = "palette-manager-v2__swatch-tile-chip";
    chip.setAttribute("aria-hidden", "true");

    const tack = SwatchRow.createTackButton(documentRef, options);
    tack.classList.add("palette-manager-v2__pin-button--tile");

    tile.append(chip, tack);
    return tile;
  }

  static createTooltipText(swatch) {
    return [
      `Name: ${swatch.name}`,
      `Symbol: ${swatch.symbol}`,
      `Hex: ${swatch.hex}`,
      `Source: ${swatch.source}`,
      `Tags: ${Array.isArray(swatch.tags) && swatch.tags.length > 0 ? swatch.tags.join(", ") : "None"}`
    ].join("\n");
  }

  static createDetailsBlock(documentRef, swatch, className) {
    const details = documentRef.createElement("dl");
    details.className = className;
    [
      ["Name", swatch.name],
      ["Symbol", swatch.symbol],
      ["Hex", swatch.hex],
      ["Source", swatch.source],
      ["Tags", Array.isArray(swatch.tags) && swatch.tags.length > 0 ? swatch.tags.join(", ") : "None"]
    ].forEach(([label, value]) => {
      const term = documentRef.createElement("dt");
      term.textContent = label;
      const description = documentRef.createElement("dd");
      description.textContent = value;
      details.append(term, description);
    });
    return details;
  }

  static createTackButton(documentRef, options = {}) {
    const tack = documentRef.createElement("button");
    tack.type = "button";
    tack.className = "palette-manager-v2__pin-button";
    tack.classList.toggle("is-pinned", Boolean(options.pinned));
    tack.title = options.pinned ? "Remove pinned swatch" : "Pin to user palette";
    tack.setAttribute("aria-label", tack.title);
    tack.appendChild(SwatchRow.createThumbtackIcon(documentRef));
    tack.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof options.onTack === "function") {
        options.onTack();
      }
    });
    return tack;
  }

  static createThumbtackIcon(documentRef) {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = documentRef.createElementNS(namespace, "svg");
    svg.setAttribute("class", "palette-manager-v2__pin-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const path = documentRef.createElementNS(namespace, "path");
    path.setAttribute("class", "palette-manager-v2__pin-icon-shape");
    path.setAttribute("d", "M8.7 3.5h6.6l-.7 5.2 3.7 3.7v2.2h-5.1L12 21.2 10.8 14.6H5.7v-2.2l3.7-3.7-.7-5.2Z");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("stroke", "#000000");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("stroke-width", "1.8");
    svg.appendChild(path);
    return svg;
  }
}

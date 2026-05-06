function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class AssetCatalogControl {
  constructor({ countText, list, preview }) {
    this.countText = countText;
    this.list = list;
    this.preview = preview;
    this.onSelect = null;
    this.onDelete = null;
  }

  mount({ onDelete, onSelect }) {
    this.onDelete = onDelete;
    this.onSelect = onSelect;
    this.list.addEventListener("click", (event) => {
      const deleteButton = event.target.closest("button[data-delete-asset-id]");
      if (deleteButton) {
        this.onDelete?.(deleteButton.dataset.deleteAssetId);
        return;
      }
      const button = event.target.closest("button[data-asset-id]");
      if (!button) {
        return;
      }
      this.onSelect?.(button.dataset.assetId);
    });
  }

  render(assets, selectedAssetId) {
    const entries = this.sortedEntries(assets);
    this.countText.textContent = `${entries.length} assets`;
    if (!entries.length) {
      this.list.innerHTML = "";
      this.preview.innerHTML = "<p>No asset selected.</p>";
      return;
    }

    this.list.innerHTML = entries.map(([assetId, entry]) => `
      <article class="asset-manager-v2__asset-tile ${assetId === selectedAssetId ? "is-selected" : ""}">
        <button type="button" data-asset-id="${escapeHtml(assetId)}" class="asset-manager-v2__asset-select">
          <span class="asset-manager-v2__asset-type-role">${escapeHtml(entry.kind)}:${escapeHtml(entry.role || "")}</span>
          <strong>${escapeHtml(assetId)}</strong>
        </button>
        <button type="button" data-delete-asset-id="${escapeHtml(assetId)}" class="asset-manager-v2__asset-delete">Delete</button>
      </article>
    `).join("");

    const selectedEntry = assets[selectedAssetId] || assets[entries[0][0]];
    const selectedId = assets[selectedAssetId] ? selectedAssetId : entries[0][0];
    this.preview.innerHTML = `
      <h2>${escapeHtml(selectedId)}</h2>
      <p>Kind: ${escapeHtml(selectedEntry.kind)}</p>
      ${selectedEntry.role ? `<p>Role: ${escapeHtml(selectedEntry.role)}</p>` : ""}
      <p>Path: ${escapeHtml(selectedEntry.path)}</p>
      <p>Source: ${escapeHtml(selectedEntry.source)}</p>
    `;
  }

  sortedEntries(assets) {
    return Object.entries(assets).sort(([leftId, leftEntry], [rightId, rightEntry]) => (
      String(leftEntry.kind || "").localeCompare(String(rightEntry.kind || ""))
      || String(leftEntry.role || "").localeCompare(String(rightEntry.role || ""))
      || leftId.localeCompare(rightId)
    ));
  }
}

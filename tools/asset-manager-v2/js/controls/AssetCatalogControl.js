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
  }

  mount({ onSelect }) {
    this.onSelect = onSelect;
    this.list.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-asset-id]");
      if (!button) {
        return;
      }
      this.onSelect?.(button.dataset.assetId);
    });
  }

  render(assets, selectedAssetId) {
    const entries = Object.entries(assets);
    this.countText.textContent = `${entries.length} approved assets`;
    if (!entries.length) {
      this.list.innerHTML = "";
      this.preview.innerHTML = "<p>No asset selected.</p>";
      return;
    }

    this.list.innerHTML = entries.map(([assetId, entry]) => `
      <button type="button" data-asset-id="${escapeHtml(assetId)}" class="${assetId === selectedAssetId ? "is-selected" : ""}">
        <strong>${escapeHtml(assetId)}</strong>
        <span class="asset-manager-v2__asset-kind">${escapeHtml(entry.role ? `${entry.kind}:${entry.role}` : entry.kind)}</span>
        <span>${escapeHtml(entry.path)}</span>
      </button>
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
}

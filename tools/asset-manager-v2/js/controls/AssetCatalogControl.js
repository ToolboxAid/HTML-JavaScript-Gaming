import { renderAssetPreview } from "../../../../src/shared/assets/assetPreviewHelpers.js";

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
      const deleteControl = event.target.closest("[data-delete-asset-id]");
      if (deleteControl) {
        event.preventDefault();
        event.stopPropagation();
        this.onDelete?.(deleteControl.dataset.deleteAssetId);
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
      renderAssetPreview(this.preview, "", null);
      return;
    }
    const selectedEntry = selectedAssetId && assets[selectedAssetId] ? assets[selectedAssetId] : null;
    renderAssetPreview(this.preview, selectedEntry ? selectedAssetId : "", selectedEntry);

    this.list.innerHTML = entries.map(([assetId, entry]) => {
      const detailTooltip = [
        `id: ${assetId}`,
        `type: ${entry.type || ""}`,
        `kind: ${entry.kind || ""}`,
        `role: ${entry.role || ""}`,
        `path: ${entry.path || ""}`
      ].join("\n");
      return `
      <article class="asset-manager-v2__asset-tile ${assetId === selectedAssetId ? "is-selected" : ""}" title="${escapeHtml(detailTooltip)}">
        <button type="button" data-asset-id="${escapeHtml(assetId)}" class="asset-manager-v2__asset-select">
          <span data-delete-asset-id="${escapeHtml(assetId)}" class="asset-manager-v2__asset-delete" aria-label="Delete ${escapeHtml(assetId)}" title="Delete ${escapeHtml(assetId)}">X</span>
          <span class="asset-manager-v2__asset-copy">
            <span class="asset-manager-v2__asset-type-role">${escapeHtml(entry.type)}:${escapeHtml(entry.role || "")}</span>
            <strong>${escapeHtml(assetId)}</strong>
          </span>
        </button>
      </article>
    `;
    }).join("");
  }

  sortedEntries(assets) {
    return Object.entries(assets).sort(([leftId, leftEntry], [rightId, rightEntry]) => (
      String(leftEntry.type || "").localeCompare(String(rightEntry.type || ""))
      || String(leftEntry.role || "").localeCompare(String(rightEntry.role || ""))
      || leftId.localeCompare(rightId)
    ));
  }
}

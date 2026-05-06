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
  constructor({ countText, detail, list, preview }) {
    this.countText = countText;
    this.detail = detail;
    this.list = list;
    this.preview = preview;
    this.onSelect = null;
    this.onDelete = null;
    this.previewOptions = {};
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
      this.renderSelectedDetail("", null);
      renderAssetPreview(this.preview, "", null);
      return;
    }
    const selectedEntry = selectedAssetId && assets[selectedAssetId] ? assets[selectedAssetId] : null;
    this.renderSelectedDetail(selectedEntry ? selectedAssetId : "", selectedEntry);
    renderAssetPreview(this.preview, selectedEntry ? selectedAssetId : "", selectedEntry, this.previewOptions);

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

  setPreviewOptions(options = {}) {
    this.previewOptions = { ...options };
  }

  renderSelectedDetail(assetId, entry) {
    if (!this.detail) {
      return;
    }
    if (!assetId || !entry) {
      this.detail.innerHTML = '<p class="asset-manager-v2__hint">Select an asset tile to inspect details.</p>';
      return;
    }
    const type = entry.type || "";
    const kind = entry.kind || "";
    const rows = [
      ["type/kind", `${type}${kind ? `/${kind}` : ""}`],
      ["ID", assetId],
      ["Type", type],
      ["Kind", kind],
      ["Role", entry.role || ""],
      ["Path", entry.path || ""],
      ["Final ID", assetId]
    ];
    this.detail.innerHTML = `<dl>${rows.map(([label, value]) => `
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    `).join("")}</dl>`;
  }

  sortedEntries(assets) {
    return Object.entries(assets).sort(([leftId, leftEntry], [rightId, rightEntry]) => (
      String(leftEntry.type || "").localeCompare(String(rightEntry.type || ""))
      || String(leftEntry.role || "").localeCompare(String(rightEntry.role || ""))
      || leftId.localeCompare(rightId)
    ));
  }
}

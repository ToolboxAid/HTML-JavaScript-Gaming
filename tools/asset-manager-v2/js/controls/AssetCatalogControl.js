import { renderAssetPreview } from "../assetPreviewHelpers.js";

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
    this.onPreviewStatus = null;
    this.pendingFocusAssetId = "";
    this.previewOptions = {};
    this.lastPreviewError = "";
  }

  mount({ onDelete, onPreviewStatus, onSelect }) {
    this.onDelete = onDelete;
    this.onPreviewStatus = onPreviewStatus;
    this.onSelect = onSelect;
    this.list.tabIndex = 0;
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
    this.list.addEventListener("keydown", (event) => this.handleKeyboardSelection(event));
  }

  render(assets, selectedAssetId, missingFileAssetIds = new Set()) {
    const entries = this.sortedEntries(assets);
    this.countText.textContent = `${entries.length} assets`;
    if (!entries.length) {
      this.list.innerHTML = "";
      this.renderSelectedDetail("", null);
      renderAssetPreview(this.preview, "", null);
      this.reportPreviewStatus(null);
      return;
    }
    const selectedEntry = selectedAssetId && assets[selectedAssetId] ? assets[selectedAssetId] : null;
    this.renderSelectedDetail(selectedEntry ? selectedAssetId : "", selectedEntry);
    const previewModel = renderAssetPreview(this.preview, selectedEntry ? selectedAssetId : "", selectedEntry, {
      ...this.previewOptions,
      onPreviewStatus: (level, message) => this.reportAsyncPreviewStatus(level, message)
    });
    this.reportPreviewStatus(previewModel);

    this.list.innerHTML = entries.map(([assetId, entry]) => {
      const isSelected = assetId === selectedAssetId;
      const isMissingFile = missingFileAssetIds.has(assetId);
      const detailTooltip = [
        `id: ${assetId}`,
        `type: ${entry.type || ""}`,
        `kind: ${entry.kind || ""}`,
        `role: ${entry.role || ""}`,
        `path: ${entry.path || ""}`
      ].join("\n");
      return `
      <article class="asset-manager-v2__asset-tile ${isSelected ? "is-selected" : ""} ${isMissingFile ? "is-missing-file" : ""}" data-asset-tile-id="${escapeHtml(assetId)}" tabindex="${isSelected ? "0" : "-1"}" title="${escapeHtml(detailTooltip)}">
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
    this.focusPendingSelection();
  }

  handleKeyboardSelection(event) {
    const handledKeys = new Set(["ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUp", "End", "Enter", "Home", "PageDown", "PageUp"]);
    if (!handledKeys.has(event.key)) {
      return;
    }
    const buttons = Array.from(this.list.querySelectorAll("button[data-asset-id]"));
    if (!buttons.length) {
      return;
    }
    const currentButton = this.currentKeyboardButton(event, buttons);
    const currentIndex = Math.max(0, buttons.indexOf(currentButton));
    const nextIndex = this.nextKeyboardIndex(event.key, currentIndex, buttons.length);
    const nextButton = buttons[nextIndex];
    event.preventDefault();
    if (!nextButton) {
      currentButton?.focus({ preventScroll: true });
      return;
    }
    if (event.key === "Enter") {
      this.pendingFocusAssetId = nextButton.dataset.assetId || "";
      this.onSelect?.(this.pendingFocusAssetId);
      return;
    }
    if (nextButton === currentButton) {
      nextButton.focus({ preventScroll: true });
      return;
    }
    this.pendingFocusAssetId = nextButton.dataset.assetId || "";
    this.onSelect?.(this.pendingFocusAssetId);
  }

  currentKeyboardButton(event, buttons) {
    const focusedButton = event.target.closest?.("button[data-asset-id]");
    if (focusedButton && buttons.includes(focusedButton)) {
      return focusedButton;
    }
    const focusedTile = event.target.closest?.("[data-asset-tile-id]");
    if (focusedTile) {
      const tileButton = buttons.find((button) => button.dataset.assetId === focusedTile.dataset.assetTileId);
      if (tileButton) {
        return tileButton;
      }
    }
    return buttons.find((button) => button.closest(".asset-manager-v2__asset-tile")?.classList.contains("is-selected")) || buttons[0];
  }

  nextKeyboardIndex(key, currentIndex, count) {
    if (key === "Home") {
      return 0;
    }
    if (key === "End") {
      return count - 1;
    }
    if (key === "ArrowLeft" || key === "ArrowUp" || key === "PageUp") {
      return Math.max(0, currentIndex - 1);
    }
    if (key === "ArrowRight" || key === "ArrowDown" || key === "PageDown") {
      return Math.min(count - 1, currentIndex + 1);
    }
    return currentIndex;
  }

  focusPendingSelection() {
    if (!this.pendingFocusAssetId) {
      return;
    }
    const button = Array.from(this.list.querySelectorAll("button[data-asset-id]"))
      .find((candidate) => candidate.dataset.assetId === this.pendingFocusAssetId);
    this.pendingFocusAssetId = "";
    button?.focus({ preventScroll: true });
  }

  setPreviewOptions(options = {}) {
    this.previewOptions = { ...options };
  }

  reportPreviewStatus(previewModel) {
    const message = previewModel?.previewError || "";
    if (!message) {
      this.lastPreviewError = "";
      return;
    }
    this.reportAsyncPreviewStatus("fail", message);
  }

  reportAsyncPreviewStatus(level, message) {
    if (!message) {
      return;
    }
    if (message === this.lastPreviewError) {
      return;
    }
    this.lastPreviewError = message;
    this.onPreviewStatus?.(level, message);
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
    this.detail.innerHTML = `
      <div class="asset-manager-v2__selected-detail-line">
        <span><b>ID</b> ${escapeHtml(assetId)}</span>
        <span><b>type/kind</b> ${escapeHtml(`${type}${kind ? `/${kind}` : ""}`)}</span>
        <span><b>Role</b> ${escapeHtml(entry.role || "")}</span>
      </div>
      <div class="asset-manager-v2__selected-detail-path">
        <b>Path</b> ${escapeHtml(entry.path || "")}
      </div>
    `;
  }

  sortedEntries(assets) {
    return Object.entries(assets).sort(([leftId, leftEntry], [rightId, rightEntry]) => (
      String(leftEntry.type || "").localeCompare(String(rightEntry.type || ""))
      || String(leftEntry.role || "").localeCompare(String(rightEntry.role || ""))
      || leftId.localeCompare(rightId)
    ));
  }
}

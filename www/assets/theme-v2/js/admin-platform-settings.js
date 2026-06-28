import {
    readAdminPlatformBanner,
    updateAdminPlatformBanner
} from "../../../../src/api/platform-settings-api-client.js";

class AdminPlatformSettingsController {
    constructor(root) {
        this.root = root;
        this.activeInput = root.querySelector("[data-platform-banner-active]");
        this.diagnostics = root.querySelector("[data-platform-banner-diagnostics]");
        this.messageInput = root.querySelector("[data-platform-banner-message]");
        this.preview = root.querySelector("[data-platform-banner-preview]");
        this.status = root.querySelector("[data-platform-settings-status]");
        this.toneInput = root.querySelector("[data-platform-banner-tone]");
        this.saveButton = root.querySelector("[data-platform-banner-save]");
    }

    updatePreviewTone(tone) {
        this.preview.classList.remove("platform-banner--info", "platform-banner--warning", "platform-banner--danger");
        this.preview.classList.add("platform-banner--" + (["info", "warning", "danger"].includes(tone) ? tone : "info"));
    }

    init() {
        if (!this.activeInput || !this.diagnostics || !this.messageInput || !this.preview || !this.status || !this.toneInput || !this.saveButton) {
            return;
        }
        this.saveButton.addEventListener("click", () => this.save());
        [this.activeInput, this.messageInput, this.toneInput].forEach((control) => {
            control.addEventListener("input", () => this.renderPreview(this.currentBanner()));
            control.addEventListener("change", () => this.renderPreview(this.currentBanner()));
        });
        this.load();
    }

    setStatus(message) {
        this.status.textContent = message;
    }

    currentBanner() {
        return {
            active: this.activeInput.checked,
            message: this.messageInput.value.trim(),
            tone: this.toneInput.value
        };
    }

    applyBanner(banner) {
        this.activeInput.checked = banner.active === true;
        this.messageInput.value = banner.message || "";
        this.toneInput.value = banner.tone || "info";
        this.renderPreview(this.currentBanner());
    }

    setDiagnostics(diagnostics = {}) {
        const active = diagnostics.active === true;
        const message = typeof diagnostics.message === "string" && diagnostics.message
            ? diagnostics.message
            : "(empty)";
        const sourceTableRowKey = typeof diagnostics.sourceTableRowKey === "string" && diagnostics.sourceTableRowKey
            ? diagnostics.sourceTableRowKey
            : "(missing)";
        this.diagnostics.textContent = `Active: ${active}. Message: ${message}. Source row: ${sourceTableRowKey}.`;
    }

    renderPreview(banner) {
        this.preview.dataset.platformBannerPreviewTone = banner.tone || "info";
        this.updatePreviewTone(banner.tone);
        if (!banner.active || !banner.message) {
            this.preview.textContent = "No active banner.";
            return;
        }
        const message = document.createElement("span");
        message.className = "platform-banner__message";
        message.textContent = banner.message;
        this.preview.replaceChildren(message);
    }

    load() {
        try {
            const payload = readAdminPlatformBanner();
            this.applyBanner(payload.banner || {});
            this.setDiagnostics(payload.diagnostics || payload.banner || {});
            this.setStatus("Platform banner settings loaded.");
        } catch (error) {
            this.setStatus(error instanceof Error ? error.message : "Platform banner settings are unavailable.");
        }
    }

    save() {
        try {
            const payload = updateAdminPlatformBanner(this.currentBanner());
            this.applyBanner(payload.banner || {});
            this.setDiagnostics(payload.diagnostics || payload.banner || {});
            this.setStatus("Platform banner settings saved.");
            window.dispatchEvent(new CustomEvent("gamefoundry:platform-settings-changed"));
        } catch (error) {
            this.setStatus(error instanceof Error ? error.message : "Platform banner settings could not be saved.");
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("[data-admin-platform-settings]");
    if (!root) {
        return;
    }
    new AdminPlatformSettingsController(root).init();
});

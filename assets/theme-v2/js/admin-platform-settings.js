import {
    readAdminPlatformBanner,
    updateAdminPlatformBanner
} from "../../../src/engine/api/platform-settings-api-client.js";

class AdminPlatformSettingsController {
    constructor(root) {
        this.root = root;
        this.enabledInput = root.querySelector("[data-platform-banner-enabled]");
        this.kindInput = root.querySelector("[data-platform-banner-kind]");
        this.messageInput = root.querySelector("[data-platform-banner-message]");
        this.preview = root.querySelector("[data-platform-banner-preview]");
        this.status = root.querySelector("[data-platform-settings-status]");
        this.toneInput = root.querySelector("[data-platform-banner-tone]");
        this.saveButton = root.querySelector("[data-platform-banner-save]");
    }

    init() {
        if (!this.enabledInput || !this.kindInput || !this.messageInput || !this.preview || !this.status || !this.toneInput || !this.saveButton) {
            return;
        }
        this.saveButton.addEventListener("click", () => this.save());
        [this.enabledInput, this.kindInput, this.messageInput, this.toneInput].forEach((control) => {
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
            enabled: this.enabledInput.checked,
            kind: this.kindInput.value,
            message: this.messageInput.value.trim(),
            tone: this.toneInput.value
        };
    }

    applyBanner(banner) {
        this.enabledInput.checked = banner.enabled === true;
        this.kindInput.value = banner.kind || "general";
        this.messageInput.value = banner.message || "";
        this.toneInput.value = banner.tone || "info";
        this.renderPreview(this.currentBanner());
    }

    renderPreview(banner) {
        this.preview.dataset.platformBannerPreviewTone = banner.tone || "info";
        this.preview.textContent = banner.enabled && banner.message
            ? banner.message
            : "No active banner.";
    }

    load() {
        try {
            const payload = readAdminPlatformBanner();
            this.applyBanner(payload.banner || {});
            this.setStatus("Platform banner settings loaded.");
        } catch (error) {
            this.setStatus(error instanceof Error ? error.message : "Platform banner settings are unavailable.");
        }
    }

    save() {
        try {
            const payload = updateAdminPlatformBanner(this.currentBanner());
            this.applyBanner(payload.banner || {});
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

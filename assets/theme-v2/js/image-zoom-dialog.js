class ImageZoomDialog {
    constructor(dialog) {
        this.dialog = dialog;
        this.triggers = Array.from(document.querySelectorAll(`[data-image-zoom-target="${dialog.id}"]`));
    }

    init() {
        if (!this.dialog.id || typeof this.dialog.showModal !== "function") {
            return;
        }
        this.triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => this.open());
        });
        this.dialog.addEventListener("click", (event) => {
            if (event.target === this.dialog) {
                this.dialog.close();
            }
        });
    }

    open() {
        if (!this.dialog.open) {
            this.dialog.showModal();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-image-zoom-dialog]").forEach((dialog) => {
        new ImageZoomDialog(dialog).init();
    });
});

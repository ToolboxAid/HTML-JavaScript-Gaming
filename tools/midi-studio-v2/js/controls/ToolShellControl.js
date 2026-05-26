export class ToolShellControl {
  constructor({ documentRef = document } = {}) {
    this.document = documentRef;
    this.toolId = "midi-studio-v2";
  }

  mount() {
    this.document.body.dataset.toolId = this.toolId;
    this.document.querySelectorAll("[data-tool-id]").forEach((element) => {
      element.setAttribute("data-tool-id", this.toolId);
    });
  }
}

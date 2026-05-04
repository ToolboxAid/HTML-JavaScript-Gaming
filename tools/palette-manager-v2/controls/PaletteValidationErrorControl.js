export class PaletteValidationErrorControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
    this.clearedViewerRevision = -1;
  }

  bind() {
    this.refs.clearValidationViewerButton.addEventListener("click", () => {
      this.clearedViewerRevision = this.app.getValidationViewerRevision();
      this.renderViewer("", []);
    });
  }

  render() {
    if (this.app.getValidationViewerRevision() === this.clearedViewerRevision) {
      this.renderViewer("", []);
      return;
    }
    this.renderViewer(this.app.getStatus(), this.app.getVisibleErrors());
  }

  renderViewer(status, errors) {
    this.refs.paletteStatus.textContent = status;
    this.refs.paletteErrorList.replaceChildren();

    errors.forEach((error) => {
      const item = this.document.createElement("li");
      item.textContent = error;
      this.refs.paletteErrorList.appendChild(item);
    });
  }
}

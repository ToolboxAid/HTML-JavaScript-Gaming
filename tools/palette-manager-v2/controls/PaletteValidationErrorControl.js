export class PaletteValidationErrorControl {
  constructor({ documentRef, refs, app }) {
    this.document = documentRef;
    this.refs = refs;
    this.app = app;
  }

  bind() {}

  render() {
    this.refs.paletteStatus.textContent = this.app.getStatus();
    this.refs.paletteErrorList.replaceChildren();

    this.app.getVisibleErrors().forEach((error) => {
      const item = this.document.createElement("li");
      item.textContent = error;
      this.refs.paletteErrorList.appendChild(item);
    });
  }
}

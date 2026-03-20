export class Theme {
  constructor(tokens) {
    this.tokens = tokens;
  }

  getColor(name) {
    return this.tokens.color[name];
  }

  applyDocumentTheme() {
    const doc = this.tokens.document;
    if (!doc) return;

    // Ensure full height
    document.documentElement.style.height = doc.height;
    document.body.style.height = doc.height;

    // Reset default margin
    document.body.style.margin = '0';

    // Apply gradient
    document.body.style.background = doc.background;
  }
}
/*
Toolbox Aid
David Quesenberry
03/21/2026
Theme.js
*/
export class Theme {
  constructor(tokens) {
    this.tokens = tokens;
  }

  getColor(name) {
    return this.tokens.color[name];
  }

  applyDocumentTheme() {
    const doc = this.tokens.document;
    const color = this.tokens.color;

    if (!doc) return;

    document.documentElement.style.height = doc.height;
    document.body.style.height = doc.height;
    document.body.style.margin = '0';

    // background
    document.body.style.background = doc.background;

    // text color
    if (color?.textPrimary) {
      document.body.style.color = color.textPrimary;
    }
  }
}
export class Theme {
  constructor(tokens) {
    this.tokens = tokens;
  }

  getColor(name) {
    return this.tokens.color[name];
  }
}
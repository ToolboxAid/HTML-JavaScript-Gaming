export class CollisionInspectorV2Logger {
  constructor({ logElement, maxLines = 80 }) {
    this.logElement = logElement;
    this.maxLines = maxLines;
    this.lines = [];
  }

  write(message) {
    this.lines.push(message);
    if (this.lines.length > this.maxLines) {
      this.lines.splice(0, this.lines.length - this.maxLines);
    }
    this.sync();
  }

  clear() {
    this.lines = [];
    this.sync();
  }

  sync() {
    this.logElement.value = this.lines.join("\n");
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }
}

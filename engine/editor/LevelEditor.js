/*
Toolbox Aid
David Quesenberry
03/22/2026
LevelEditor.js
*/
export default class LevelEditor {
  constructor({ width = 8, height = 6, fill = 0 } = {}) {
    this.width = width;
    this.height = height;
    this.cells = Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
  }

  setCell(x, y, value) {
    if (this.cells[y] && typeof this.cells[y][x] !== 'undefined') {
      this.cells[y][x] = value;
    }
  }

  getCell(x, y) {
    return this.cells[y]?.[x] ?? null;
  }

  exportLevel() {
    return {
      width: this.width,
      height: this.height,
      cells: this.cells.map((row) => [...row]),
    };
  }
}

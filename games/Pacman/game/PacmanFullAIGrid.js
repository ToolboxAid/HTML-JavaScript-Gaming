/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIGrid.js
*/
const ROWS = [
  '###################',
  '#o........#......o#',
  '#.###.###.#.###.###',
  '#.................#',
  '#.###.#.#####.#.###',
  '#.....#...#...#...#',
  '#####.###.#.###.###',
  '#.......#.#.......#',
  '#.#####.#.#.#####.#',
  '#.......#.#.......#',
  '#.#####.#.#.#####.#',
  '#...#...#.#...#...#',
  '###.#.###.###.#.###',
  '#...#.........#...#',
  '#.###.###.###.###.#',
  '#.....#.......#...#',
  '#.###.#.#####.#.###',
  '#o....#.......#..o#',
  '###################',
];

export default class PacmanFullAIGrid {
  constructor({ tileSize = 32 } = {}) {
    this.tileSize = tileSize;
    this.rows = ROWS;
    this.height = ROWS.length;
    this.width = ROWS[0].length;
    this.pellets = new Set();
    this.powerPellets = new Set();
    this.seedPellets();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  isInside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isWalkable(x, y) {
    if (!this.isInside(x, y)) return false;
    return this.rows[y][x] !== '#';
  }

  tileToWorld(x, y) {
    const c = this.tileSize * 0.5;
    return { x: (x * this.tileSize) + c, y: (y * this.tileSize) + c };
  }

  worldToTile(px, py) {
    return { x: Math.floor(px / this.tileSize), y: Math.floor(py / this.tileSize) };
  }

  seedPellets() {
    this.pellets.clear();
    this.powerPellets.clear();
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const ch = this.rows[y][x];
        if (ch === '.') this.pellets.add(this.key(x, y));
        if (ch === 'o') this.powerPellets.add(this.key(x, y));
      }
    }
  }

  hasPellet(x, y) {
    return this.pellets.has(this.key(x, y));
  }

  hasPowerPellet(x, y) {
    return this.powerPellets.has(this.key(x, y));
  }

  consumePellet(x, y) {
    return this.pellets.delete(this.key(x, y));
  }

  consumePowerPellet(x, y) {
    return this.powerPellets.delete(this.key(x, y));
  }

  pelletCount() {
    return this.pellets.size + this.powerPellets.size;
  }
}

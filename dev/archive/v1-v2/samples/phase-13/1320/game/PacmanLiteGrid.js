/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteGrid.js
*/
const ROWS = [
  '#################',
  '#...............#',
  '#.###.#####.###.#',
  '#.#...#...#...#.#',
  '#.#.###.#.###.#.#',
  '#...#...#...#...#',
  '###.#.#####.#.###',
  '#...#...#...#...#',
  '#.#####.#.#####.#',
  '#.......#.......#',
  '#.#####.#.#####.#',
  '#...#...#...#...#',
  '###.#.#####.#.###',
  '#...#...#...#...#',
  '#.#.###.#.###.#.#',
  '#.#...#...#...#.#',
  '#.###.#####.###.#',
  '#...............#',
  '#################',
];

export default class PacmanLiteGrid {
  constructor({ tileSize = 32 } = {}) {
    this.tileSize = tileSize;
    this.rows = ROWS;
    this.height = this.rows.length;
    this.width = this.rows[0].length;
    this.pellets = new Set();
    this.seedPellets();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  seedPellets() {
    this.pellets.clear();
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        if (this.isWalkable(x, y)) {
          this.pellets.add(this.key(x, y));
        }
      }
    }
  }

  isInside(x, y) {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  isWalkable(x, y) {
    if (!this.isInside(x, y)) {
      return false;
    }
    return this.rows[y][x] !== '#';
  }

  tileToWorld(x, y) {
    const center = this.tileSize * 0.5;
    return {
      x: (x * this.tileSize) + center,
      y: (y * this.tileSize) + center,
    };
  }

  worldToTile(px, py) {
    return {
      x: Math.floor(px / this.tileSize),
      y: Math.floor(py / this.tileSize),
    };
  }

  hasPellet(x, y) {
    return this.pellets.has(this.key(x, y));
  }

  consumePellet(x, y) {
    return this.pellets.delete(this.key(x, y));
  }

  pelletCount() {
    return this.pellets.size;
  }
}

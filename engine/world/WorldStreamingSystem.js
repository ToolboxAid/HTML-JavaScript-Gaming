/*
Toolbox Aid
David Quesenberry
03/22/2026
WorldStreamingSystem.js
*/
export default class WorldStreamingSystem {
  constructor({ chunkWidth = 320, radius = 1 } = {}) {
    this.chunkWidth = chunkWidth;
    this.radius = radius;
    this.loaded = new Set();
  }

  update(positionX) {
    const centerChunk = Math.floor(positionX / this.chunkWidth);
    const next = new Set();

    for (let index = centerChunk - this.radius; index <= centerChunk + this.radius; index += 1) {
      next.add(index);
    }

    this.loaded = next;
    return [...this.loaded].sort((a, b) => a - b);
  }
}

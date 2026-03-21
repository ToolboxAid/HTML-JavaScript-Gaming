/*
Toolbox Aid
David Quesenberry
03/21/2026
TilemapRenderSystem.js
*/
export function renderTilemap(renderer, tilemap, screen = { x: 0, y: 0 }) {
  for (let row = 0; row < tilemap.height; row += 1) {
    for (let col = 0; col < tilemap.width; col += 1) {
      const tile = tilemap.getTile(col, row);
      const x = screen.x + col * tilemap.tileSize;
      const y = screen.y + row * tilemap.tileSize;
      const color = tilemap.palette[tile] || '#111827';

      renderer.drawRect(x, y, tilemap.tileSize, tilemap.tileSize, color);
      renderer.strokeRect(x, y, tilemap.tileSize, tilemap.tileSize, '#ffffff', 1);
    }
  }
}

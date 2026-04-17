/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteDebugOverlay.js
*/
export default class PacmanLiteDebugOverlay {
  render(renderer, { world }) {
    const info = [
      `P TILE: ${world.debug.playerTile.x},${world.debug.playerTile.y}`,
      `G TILE: ${world.debug.ghostTile.x},${world.debug.ghostTile.y}`,
      `QUEUE: ${world.debug.queuedDirection || '-'}`,
      `TARGET: ${world.debug.targetTile.x},${world.debug.targetTile.y}`,
      `PELLETS: ${world.grid.pelletCount()}`,
    ];
    renderer.drawRect(622, 64, 300, 166, 'rgba(2, 6, 23, 0.86)');
    renderer.strokeRect(622, 64, 300, 166, '#334155', 1);
    info.forEach((line, index) => {
      renderer.drawText(line, 638, 82 + (index * 28), {
        color: '#94a3b8',
        font: '15px monospace',
        textBaseline: 'top',
      });
    });
  }
}

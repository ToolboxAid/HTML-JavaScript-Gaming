/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIDebugOverlay.js
*/
export default class PacmanFullAIDebugOverlay {
  render(renderer, { world }) {
    renderer.drawRect(592, 48, 350, 286, 'rgba(2, 6, 23, 0.86)');
    renderer.strokeRect(592, 48, 350, 286, '#334155', 1);
    renderer.drawText(`MODE: ${world.modeState.mode.toUpperCase()}`, 608, 64, {
      color: '#e2e8f0', font: '15px monospace', textBaseline: 'top',
    });
    renderer.drawText(`FRIGHT MS: ${Math.round(world.modeState.frightenedMs)}`, 608, 90, {
      color: '#94a3b8', font: '14px monospace', textBaseline: 'top',
    });
    const pacTile = world.grid.worldToTile(world.player.x, world.player.y);
    renderer.drawText(
      `PACMAN: ${world.player.direction || '-'} T(${pacTile.x},${pacTile.y})`,
      608,
      122,
      { color: '#facc15', font: '13px monospace', textBaseline: 'top' },
    );
    world.ghosts.forEach((g, i) => {
      renderer.drawText(
        `${g.name}: ${g.direction || '-'} T(${g.targetTile.x},${g.targetTile.y}) ${g.inHouse ? 'HOUSE' : g.eaten ? 'EYES' : 'ROAM'}`,
        608,
        154 + (i * 32),
        { color: '#94a3b8', font: '13px monospace', textBaseline: 'top' },
      );
    });
  }
}

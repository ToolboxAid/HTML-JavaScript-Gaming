/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIDebugOverlay.js
*/
export default class PacmanFullAIDebugOverlay {
  render(renderer, { world }) {
    const panelWidth = 195;
    const panelHeight = 286;
    const panelX = 960 - panelWidth - 12;
    const panelY = 48;
    const textX = panelX + 16;
    renderer.drawRect(panelX, panelY, panelWidth, panelHeight, 'rgba(2, 6, 23, 0.86)');
    renderer.strokeRect(panelX, panelY, panelWidth, panelHeight, '#334155', 1);
    const pacTile = world.grid.worldToTile(world.player.x, world.player.y);
    renderer.drawText(
      `PACMAN: ${world.player.direction || '-'} T(${pacTile.x},${pacTile.y})`,
      textX,
      64,
      { color: '#facc15', font: '13px monospace', textBaseline: 'top' },
    );
    renderer.drawText(`MODE: ${world.modeState.mode.toUpperCase()}`, textX, 100, {
      color: '#e2e8f0', font: '15px monospace', textBaseline: 'top',
    });
    renderer.drawText(`FRIGHT MS: ${Math.round(world.modeState.frightenedMs)}`, textX, 126, {
      color: '#94a3b8', font: '14px monospace', textBaseline: 'top',
    });
    world.ghosts.forEach((g, i) => {
      renderer.drawText(
        `${g.name}: ${g.direction || '-'} T(${g.targetTile.x},${g.targetTile.y}) ${g.inHouse ? 'HOUSE' : g.eaten ? 'EYES' : 'ROAM'}`,
        textX,
        154 + (i * 32),
        { color: '#94a3b8', font: '13px monospace', textBaseline: 'top' },
      );
    });
  }
}

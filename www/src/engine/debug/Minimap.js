/*
Toolbox Aid
David Quesenberry
03/21/2026
Minimap.js
*/
export function drawMinimap(
  renderer,
  {
    panel,
    world,
    camera,
    player,
    blocks = [],
    title = 'Minimap',
  },
) {
  renderer.drawRect(panel.x, panel.y, panel.width, panel.height, 'rgba(20, 24, 38, 0.92)');
  renderer.strokeRect(panel.x, panel.y, panel.width, panel.height, '#d8d5ff', 2);

  renderer.drawText(title, panel.x + 12, panel.y + 24, {
    color: '#ffffff',
    font: '16px monospace',
  });

  const scaleX = (panel.width - 24) / world.width;
  const scaleY = (panel.height - 48) / world.height;
  const mapX = panel.x + 12;
  const mapY = panel.y + 34;
  const mapWidth = panel.width - 24;
  const mapHeight = panel.height - 46;

  renderer.strokeRect(mapX, mapY, mapWidth, mapHeight, '#ffffff', 1);

  blocks.forEach((block) => {
    renderer.drawRect(
      mapX + block.x * scaleX,
      mapY + block.y * scaleY,
      Math.max(2, block.width * scaleX),
      Math.max(2, block.height * scaleY),
      '#8888ff'
    );
  });

  renderer.drawRect(
    mapX + player.x * scaleX,
    mapY + player.y * scaleY,
    Math.max(3, player.width * scaleX),
    Math.max(3, player.height * scaleY),
    '#ffd166'
  );

  renderer.strokeRect(
    mapX + camera.x * scaleX,
    mapY + camera.y * scaleY,
    camera.viewportWidth * scaleX,
    camera.viewportHeight * scaleY,
    '#ff6666',
    1
  );
}

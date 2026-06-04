/*
Toolbox Aid
David Quesenberry
03/21/2026
demoSpriteFactory.js
*/
export function createDemoSpriteSheet() {
  const frameSize = 16;
  const canvas = document.createElement('canvas');
  canvas.width = frameSize * 4;
  canvas.height = frameSize;
  const ctx = canvas.getContext('2d');

  const frames = [
    {
      body: '#38bdf8',
      accent: '#e0f2fe',
      visor: '#0f172a',
      boots: '#1e293b',
    },
    {
      body: '#22c55e',
      accent: '#dcfce7',
      visor: '#064e3b',
      boots: '#14532d',
    },
    {
      body: '#f59e0b',
      accent: '#fef3c7',
      visor: '#78350f',
      boots: '#92400e',
    },
    {
      body: '#ef4444',
      accent: '#fee2e2',
      visor: '#7f1d1d',
      boots: '#991b1b',
    },
  ];

  frames.forEach((palette, index) => drawActorFrame(ctx, index * frameSize, 0, frameSize, palette));
  return canvas;
}

function drawActorFrame(ctx, x, y, size, palette) {
  ctx.clearRect(x, y, size, size);
  ctx.fillStyle = palette.body;
  ctx.fillRect(x + 4, y + 3, 8, 8);
  ctx.fillRect(x + 5, y + 11, 2, 4);
  ctx.fillRect(x + 9, y + 11, 2, 4);
  ctx.fillStyle = palette.accent;
  ctx.fillRect(x + 5, y + 4, 6, 2);
  ctx.fillStyle = palette.visor;
  ctx.fillRect(x + 5, y + 7, 6, 2);
  ctx.fillStyle = palette.boots;
  ctx.fillRect(x + 4, y + 14, 3, 1);
  ctx.fillRect(x + 9, y + 14, 3, 1);
}

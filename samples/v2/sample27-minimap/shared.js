export function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function drawFrame(renderer, theme, titleLines) {
  const { width, height } = renderer.getCanvasSize();
  renderer.clear(theme.getColor('canvasBackground'));
  renderer.strokeRect(10, 10, width - 20, height - 20, '#dddddd', 2);

  titleLines.forEach((line, index) => {
    renderer.drawText(line, 40, 40 + index * 24, {
      color: theme.getColor('textCanvs'),
      font: '16px monospace',
    });
  });
}

export function drawPanel(renderer, x, y, width, height, title, lines) {
  renderer.drawRect(x, y, width, height, 'rgba(20, 24, 38, 0.92)');
  renderer.strokeRect(x, y, width, height, '#d8d5ff', 2);
  renderer.drawText(title, x + 12, y + 24, {
    color: '#ffffff',
    font: '16px monospace',
  });

  lines.forEach((line, index) => {
    renderer.drawText(line, x + 12, y + 52 + index * 20, {
      color: '#d0d5ff',
      font: '14px monospace',
    });
  });
}

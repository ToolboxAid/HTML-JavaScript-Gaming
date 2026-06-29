/*
Toolbox Aid
David Quesenberry
03/22/2026
ActionInputDebugOverlay.js
*/
export function drawActionInputDebugOverlay(renderer, input, {
  x = 620,
  y = 34,
  width = 300,
  height = 200,
  title = 'Input Debug',
  actions = null,
  chains = [],
} = {}) {
  renderer.drawRect(x, y, width, height, 'rgba(20, 24, 38, 0.92)');
  renderer.strokeRect(x, y, width, height, '#d8d5ff', 2);

  renderer.drawText(title, x + 12, y + 22, {
    color: '#ffffff',
    font: '16px monospace',
  });

  const snapshot = typeof input.getActionDebugSnapshot === 'function'
    ? input.getActionDebugSnapshot(actions)
    : [];

  snapshot.forEach((entry, index) => {
    const line = `${entry.action}: D${entry.down ? 1 : 0} P${entry.pressed ? 1 : 0} B${entry.buffered ? 1 : 0} Q${entry.queued ? 1 : 0} W${entry.windowOpen ? 1 : 0} C${entry.cooldown ? 1 : 0}`;
    renderer.drawText(line, x + 12, y + 48 + index * 18, {
      color: '#d0d5ff',
      font: '13px monospace',
    });
  });

  const queue = typeof input.getQueuedActions === 'function' ? input.getQueuedActions() : [];
  const queueText = queue.length > 0
    ? queue.map((entry) => `${entry.action}:${entry.priority}`).join(', ')
    : 'empty';
  renderer.drawText(`Queue: ${queueText}`, x + 12, y + height - 46, {
    color: '#fef3c7',
    font: '13px monospace',
  });

  const chainText = chains.length > 0
    ? chains.map((name) => {
      const progress = typeof input.getActionChainProgress === 'function' ? input.getActionChainProgress(name) : 0;
      const complete = typeof input.isActionChainComplete === 'function' ? input.isActionChainComplete(name) : false;
      return `${name}:${progress}${complete ? '*' : ''}`;
    }).join(', ')
    : 'none';
  renderer.drawText(`Chains: ${chainText}`, x + 12, y + height - 24, {
    color: '#fef3c7',
    font: '13px monospace',
  });
}

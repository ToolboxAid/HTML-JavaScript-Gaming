/*
Toolbox Aid
David Quesenberry
03/21/2026
Validation.js
*/
export function validateWorldEntities(world, rules = []) {
  const issues = [];

  rules.forEach((rule) => {
    const entities = world.getEntitiesWith(...rule.require);
    entities.forEach((entityId) => {
      (rule.alsoRequire || []).forEach((name) => {
        if (!world.hasComponent(entityId, name)) {
          issues.push(`Entity ${entityId} matched [${rule.require.join(', ')}] but is missing "${name}"`);
        }
      });
    });
  });

  return issues;
}

export function drawValidationPanel(renderer, issues, x = 620, y = 28, width = 300, height = 146) {
  renderer.drawRect(x, y, width, height, 'rgba(48, 18, 18, 0.94)');
  renderer.strokeRect(x, y, width, height, '#ff8888', 2);
  renderer.drawText('Validation', x + 12, y + 24, {
    color: '#ffffff',
    font: '16px monospace',
  });

  const lines = issues.length === 0 ? ['No validation issues'] : issues.slice(0, 5);

  lines.forEach((line, index) => {
    renderer.drawText(line, x + 12, y + 52 + index * 20, {
      color: '#ffd6d6',
      font: '14px monospace',
    });
  });
}

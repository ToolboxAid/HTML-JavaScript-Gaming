/*
Toolbox Aid
David Quesenberry
03/21/2026
InputControlSystem.js
*/
import { getSystemEntities, requireSystemComponents } from './SystemUtils.js';

export function applyInputControl(world, input, bindings = {}) {
  const {
    left = 'ArrowLeft',
    right = 'ArrowRight',
    up = 'ArrowUp',
    down = 'ArrowDown',
  } = bindings;

  const controlled = getSystemEntities(world, ['velocity', 'speed', 'inputControlled']);

  controlled.forEach((entityId) => {
    const [velocity, speed, inputControlled] = requireSystemComponents(world, entityId, [
      'velocity',
      'speed',
      'inputControlled',
    ]);

    if (!inputControlled.enabled) {
      velocity.x = 0;
      velocity.y = 0;
      return;
    }

    velocity.x = 0;
    velocity.y = 0;

    if (input.isDown(left)) velocity.x -= speed.value;
    if (input.isDown(right)) velocity.x += speed.value;
    if (input.isDown(up)) velocity.y -= speed.value;
    if (input.isDown(down)) velocity.y += speed.value;
  });
}

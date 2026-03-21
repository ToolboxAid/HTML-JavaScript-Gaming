export function applyInputControl(world, input, bindings = {}) {
  const {
    left = 'ArrowLeft',
    right = 'ArrowRight',
    up = 'ArrowUp',
    down = 'ArrowDown',
  } = bindings;

  const controlled = world.getEntitiesWith('velocity', 'speed', 'inputControlled');

  controlled.forEach((entityId) => {
    const velocity = world.getComponent(entityId, 'velocity');
    const speed = world.getComponent(entityId, 'speed').value;

    velocity.x = 0;
    velocity.y = 0;

    if (input.isDown(left)) velocity.x -= speed;
    if (input.isDown(right)) velocity.x += speed;
    if (input.isDown(up)) velocity.y -= speed;
    if (input.isDown(down)) velocity.y += speed;
  });
}

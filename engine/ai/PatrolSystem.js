/*
Toolbox Aid
David Quesenberry
03/21/2026
PatrolSystem.js
*/
export function updatePatrolEntity(entity, dt) {
  if (!entity.patrol || !entity.transform || !entity.size) {
    return;
  }

  const patrol = entity.patrol;
  const targetX = patrol.direction > 0 ? patrol.maxX : patrol.minX;
  const dx = targetX - entity.transform.x;
  const step = patrol.speed * dt * Math.sign(dx || patrol.direction);

  entity.transform.x += step;

  if (patrol.direction > 0 && entity.transform.x >= patrol.maxX) {
    entity.transform.x = patrol.maxX;
    patrol.direction = -1;
  }

  if (patrol.direction < 0 && entity.transform.x <= patrol.minX) {
    entity.transform.x = patrol.minX;
    patrol.direction = 1;
  }
}

export function isWithinDetectionRange(a, b, range) {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy) <= range;
}

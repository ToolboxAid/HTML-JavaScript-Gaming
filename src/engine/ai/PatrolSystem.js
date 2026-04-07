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

export function advancePatrolRoute(actor, route = [], dt, {
  speed = actor?.speed ?? 100,
  tolerance = 4,
  loop = true,
} = {}) {
  if (!actor || route.length === 0) {
    return { reached: false, index: 0 };
  }

  actor.routeIndex = actor.routeIndex ?? 0;
  const target = route[actor.routeIndex];
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= tolerance) {
    actor.routeIndex = loop
      ? (actor.routeIndex + 1) % route.length
      : Math.min(route.length - 1, actor.routeIndex + 1);
    return { reached: true, index: actor.routeIndex };
  }

  const step = Math.min(speed * dt, distance);
  actor.x += (dx / Math.max(distance, 1)) * step;
  actor.y += (dy / Math.max(distance, 1)) * step;
  actor.velocityX = distance > 0 ? (dx / distance) * speed : 0;
  actor.velocityY = distance > 0 ? (dy / distance) * speed : 0;
  return { reached: false, index: actor.routeIndex };
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

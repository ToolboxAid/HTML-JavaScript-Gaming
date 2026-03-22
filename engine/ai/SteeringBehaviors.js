/*
Toolbox Aid
David Quesenberry
03/22/2026
SteeringBehaviors.js
*/
function moveActor(actor, dx, dy, dt, speed) {
  const distance = Math.hypot(dx, dy);
  if (distance <= 0.0001) {
    actor.velocityX = 0;
    actor.velocityY = 0;
    return distance;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  actor.velocityX = nx * speed;
  actor.velocityY = ny * speed;
  actor.x += actor.velocityX * dt;
  actor.y += actor.velocityY * dt;
  return distance;
}

export function stepChaseBehavior(actor, target, dt, {
  speed = 100,
  stopDistance = 0,
} = {}) {
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= stopDistance) {
    actor.velocityX = 0;
    actor.velocityY = 0;
    return { distance, chasing: false };
  }

  moveActor(actor, dx, dy, dt, speed);
  return { distance, chasing: true };
}

export function stepEvadeBehavior(actor, threat, dt, {
  speed = 100,
  desiredDistance = 160,
} = {}) {
  const dx = actor.x - threat.x;
  const dy = actor.y - threat.y;
  const distance = Math.hypot(dx, dy);

  if (distance >= desiredDistance) {
    actor.velocityX = 0;
    actor.velocityY = 0;
    return { distance, evading: false };
  }

  moveActor(actor, dx, dy, dt, speed);
  return { distance, evading: true };
}

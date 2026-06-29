/*
Toolbox Aid
David Quesenberry
03/21/2026
InteractionSystem.js
*/
import { isColliding } from '../collision/aabb.js';

export function findNearestInteractable(subject, interactables, maxDistance = 80) {
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  interactables.forEach((item) => {
    const sx = subject.x + subject.width / 2;
    const sy = subject.y + subject.height / 2;
    const ix = item.x + item.width / 2;
    const iy = item.y + item.height / 2;
    const dx = sx - ix;
    const dy = sy - iy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= maxDistance && distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  });

  return best;
}

export function resolveInteraction(subject, interactables, onInteract, maxDistance = 80) {
  const target = findNearestInteractable(subject, interactables, maxDistance);
  if (target && typeof onInteract === 'function') {
    onInteract(target);
  }
  return target;
}

export function getTriggerOverlaps(subject, triggers = []) {
  return triggers.filter((trigger) => isColliding(subject, trigger));
}

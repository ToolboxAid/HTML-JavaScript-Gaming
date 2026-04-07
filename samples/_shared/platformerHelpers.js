/*
Toolbox Aid
David Quesenberry
03/21/2026
platformerHelpers.js
*/
import { worldRectToScreen } from '../../src/engine/camera/index.js';

export function overlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function containsPoint(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function drawWorldRect(renderer, camera, rect, screen, fill, stroke = '#ffffff') {
  const view = worldRectToScreen(camera, rect, screen.x, screen.y);
  renderer.drawRect(view.x, view.y, view.width, view.height, fill);
  renderer.strokeRect(view.x, view.y, view.width, view.height, stroke, 1);
}

export function drawWorldLabel(renderer, camera, rect, screen, text, color = '#ffffff') {
  const view = worldRectToScreen(camera, rect, screen.x, screen.y);
  renderer.drawText(text, view.x + 4, view.y - 6, { color, font: '12px Arial' });
}

export function moveAgainstSolids(entity, dx, dy, solids) {
  entity.onGround = false;

  if (dx !== 0) {
    entity.x += dx;
    for (const solid of solids) {
      if (!overlap(entity, solid)) continue;
      if (dx > 0) {
        entity.x = solid.x - entity.width;
      } else {
        entity.x = solid.x + solid.width;
      }
      entity.vx = 0;
    }
  }

  if (dy !== 0) {
    entity.y += dy;
    for (const solid of solids) {
      if (!overlap(entity, solid)) continue;
      if (dy > 0) {
        entity.y = solid.y - entity.height;
        entity.onGround = true;
      } else {
        entity.y = solid.y + solid.height;
      }
      entity.vy = 0;
    }
  }
}

export function moveAgainstOneWayPlatforms(entity, dy, oneWays, previousBottom) {
  if (dy <= 0) {
    entity.y += dy;
    return;
  }

  entity.y += dy;
  for (const platform of oneWays) {
    const horizontalOverlap =
      entity.x < platform.x + platform.width &&
      entity.x + entity.width > platform.x;
    const crossedTop =
      previousBottom <= platform.y &&
      entity.y + entity.height >= platform.y;
    if (horizontalOverlap && crossedTop) {
      entity.y = platform.y - entity.height;
      entity.vy = 0;
      entity.onGround = true;
    }
  }
}

export function snapToRamp(entity, ramp) {
  const centerX = entity.x + entity.width * 0.5;
  if (centerX < ramp.x || centerX > ramp.x + ramp.width) {
    return false;
  }
  const t = (centerX - ramp.x) / ramp.width;
  const surfaceY =
    ramp.direction === 'up-right'
      ? ramp.y + ramp.height - ramp.height * t
      : ramp.y + ramp.height * t;
  const footY = entity.y + entity.height;
  const tolerance = Math.max(10, Math.abs(entity.vy) + 8);
  const insideVerticalBand = footY >= surfaceY - tolerance && footY <= ramp.y + ramp.height + tolerance;

  if (insideVerticalBand && entity.vy >= 0) {
    entity.y = surfaceY - entity.height;
    entity.vy = 0;
    entity.onGround = true;
    return true;
  }
  return false;
}

export function carryWithPlatform(entity, platform, previousPlatformY) {
  const wasStanding =
    Math.abs(entity.y + entity.height - previousPlatformY) <= 4 &&
    entity.x + entity.width > platform.x &&
    entity.x < platform.x + platform.width;
  if (wasStanding) {
    entity.x += platform.deltaX;
    entity.y += platform.deltaY;
  }
}

export function getSurfaceUnderPlayer(entity, surfaces) {
  const probe = {
    x: entity.x + 2,
    y: entity.y + entity.height - 2,
    width: Math.max(1, entity.width - 4),
    height: 4,
  };
  return surfaces.find((surface) => overlap(probe, surface)) || null;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

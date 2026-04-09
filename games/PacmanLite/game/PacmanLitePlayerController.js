/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLitePlayerController.js
*/
import { DIRS, canMoveDirection } from './PacmanLiteNavigator.js';
import { clamp } from '/src/engine/utils/math.js';

function near(a, b, epsilon = 1.2) {
  return Math.abs(a - b) <= epsilon;
}

export default class PacmanLitePlayerController {
  constructor({ speed = 128 } = {}) {
    this.speed = speed;
  }

  update(dtSeconds, { grid, actor }) {
    const tile = grid.worldToTile(actor.x, actor.y);
    const center = grid.tileToWorld(tile.x, tile.y);
    const atCenter = near(actor.x, center.x) && near(actor.y, center.y);

    if (atCenter) {
      actor.x = center.x;
      actor.y = center.y;
      if (actor.nextDirection && canMoveDirection(grid, tile.x, tile.y, actor.nextDirection)) {
        actor.direction = actor.nextDirection;
      } else if (!canMoveDirection(grid, tile.x, tile.y, actor.direction)) {
        actor.direction = null;
      }
    }

    if (!actor.direction) {
      return;
    }

    const vec = DIRS[actor.direction];
    actor.x += vec.x * this.speed * dtSeconds;
    actor.y += vec.y * this.speed * dtSeconds;
    actor.x = clamp(actor.x, grid.tileSize * 0.5, (grid.width * grid.tileSize) - (grid.tileSize * 0.5));
    actor.y = clamp(actor.y, grid.tileSize * 0.5, (grid.height * grid.tileSize) - (grid.tileSize * 0.5));
  }
}

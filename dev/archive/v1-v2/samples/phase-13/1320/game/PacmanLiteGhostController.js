/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanLiteGhostController.js
*/
import { DIRS, chooseDirectionTowardTarget } from './PacmanLiteNavigator.js';

function near(a, b, epsilon = 1.2) {
  return Math.abs(a - b) <= epsilon;
}

export default class PacmanLiteGhostController {
  constructor({ speed = 120 } = {}) {
    this.speed = speed;
  }

  update(dtSeconds, { grid, ghost, playerTile }) {
    const ghostTile = grid.worldToTile(ghost.x, ghost.y);
    const center = grid.tileToWorld(ghostTile.x, ghostTile.y);
    const atCenter = near(ghost.x, center.x) && near(ghost.y, center.y);

    if (atCenter) {
      ghost.x = center.x;
      ghost.y = center.y;
      const next = chooseDirectionTowardTarget(
        grid,
        ghostTile.x,
        ghostTile.y,
        ghost.direction,
        playerTile.x,
        playerTile.y,
      );
      if (next) {
        ghost.direction = next;
      }
    }

    if (!ghost.direction) {
      return;
    }
    const vec = DIRS[ghost.direction];
    ghost.x += vec.x * this.speed * dtSeconds;
    ghost.y += vec.y * this.speed * dtSeconds;
  }
}

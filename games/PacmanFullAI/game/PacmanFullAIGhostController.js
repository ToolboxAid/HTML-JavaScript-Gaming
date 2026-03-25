/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIGhostController.js
*/
import { chooseDirectionTowardTarget, DIRS, opposite } from './PacmanFullAINavigator.js';
import { computeTargetTile } from './PacmanFullAITargeting.js';

function near(a, b, epsilon = 0.5) {
  return Math.abs(a - b) <= epsilon;
}

function speedForGhost(cfg, mode, ghost, tileX, tileY) {
  if (ghost.eaten) return cfg.ghostSpeedEaten;
  if (mode === 'frightened') return cfg.ghostSpeedFrightened;
  if ((tileX <= 1 || tileX >= 17) && tileY === 9) return cfg.ghostSpeedTunnel;
  return cfg.ghostSpeedNormal;
}

export default class PacmanFullAIGhostController {
  constructor({ config }) {
    this.config = config;
    this.frightenedSeed = 0;
    this.housePhaseMs = 0;
  }

  reverseAll(ghosts) {
    ghosts.forEach((g) => {
      if (g.inHouse || g.eaten) return;
      g.direction = opposite(g.direction) || g.direction;
    });
  }

  update(dtSeconds, { grid, ghosts, mode, playerTile, playerDirection, houseDoorTile }) {
    this.housePhaseMs += dtSeconds * 1000;
    const blinky = ghosts.find((g) => g.id === 'blinky') || ghosts[0];
    const blinkyTile = grid.worldToTile(blinky.x, blinky.y);
    this.frightenedSeed += 1;

    ghosts.forEach((ghost) => {
      const tile = grid.worldToTile(ghost.x, ghost.y);
      const center = grid.tileToWorld(tile.x, tile.y);
      const atCenter = near(ghost.x, center.x) && near(ghost.y, center.y);
      const ghostMode = ghost.eaten ? 'eaten' : mode;
      const targetTile = ghost.eaten
        ? houseDoorTile
        : computeTargetTile({
          ghostId: ghost.id,
          mode: ghostMode,
          ghostTile: tile,
          playerTile,
          playerDirection,
          blinkyTile,
          scatterTargets: this.config.scatterTargets,
          frightenedSeed: this.frightenedSeed + tile.x + tile.y,
        });
      ghost.targetTile = { ...targetTile };

      if (ghost.inHouse) {
        ghost.direction = 'up';
        ghost.x = center.x;
        ghost.y = center.y + Math.sin((this.housePhaseMs % 800) / 800 * Math.PI * 2) * 4;
        return;
      }

      if (atCenter) {
        ghost.x = center.x;
        ghost.y = center.y;
        const next = chooseDirectionTowardTarget(
          grid,
          tile.x,
          tile.y,
          ghost.direction,
          targetTile,
          this.config.tieBreakOrder,
        );
        if (next) ghost.direction = next;
      }

      const vec = DIRS[ghost.direction] || { x: 0, y: 0 };
      const speed = speedForGhost(this.config, mode, ghost, tile.x, tile.y);
      if (vec.x !== 0) {
        ghost.y = center.y;
      } else if (vec.y !== 0) {
        ghost.x = center.x;
      }
      const nextX = ghost.x + (vec.x * speed * dtSeconds);
      const nextY = ghost.y + (vec.y * speed * dtSeconds);
      const nextTile = grid.worldToTile(nextX, nextY);
      if (!grid.isWalkable(nextTile.x, nextTile.y)) {
        ghost.x = center.x;
        ghost.y = center.y;
        const reroute = chooseDirectionTowardTarget(
          grid,
          tile.x,
          tile.y,
          ghost.direction,
          targetTile,
          this.config.tieBreakOrder,
        );
        if (reroute) {
          ghost.direction = reroute;
        }
      } else {
        ghost.x = nextX;
        ghost.y = nextY;
      }

      if (ghost.eaten && tile.x === houseDoorTile.x && tile.y === houseDoorTile.y) {
        ghost.eaten = false;
        ghost.inHouse = true;
      }
    });
  }
}

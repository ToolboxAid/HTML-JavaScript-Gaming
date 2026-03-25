/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAITargeting.js
*/
import { DIRS } from './PacmanFullAINavigator.js';

function aheadTile(tile, direction, steps) {
  const v = DIRS[direction] || { x: 0, y: 0 };
  return {
    x: tile.x + (v.x * steps),
    y: tile.y + (v.y * steps),
  };
}

export function computeTargetTile({
  ghostId,
  mode,
  ghostTile,
  playerTile,
  playerDirection,
  blinkyTile,
  scatterTargets,
  frightenedSeed = 0,
}) {
  if (mode === 'scatter') {
    return scatterTargets[ghostId] || scatterTargets.blinky;
  }

  if (mode === 'frightened') {
    const wobble = (frightenedSeed % 3) - 1;
    return { x: playerTile.x + wobble, y: playerTile.y - wobble };
  }

  if (ghostId === 'blinky') {
    return { ...playerTile };
  }
  if (ghostId === 'pinky') {
    return aheadTile(playerTile, playerDirection, 4);
  }
  if (ghostId === 'inky') {
    const twoAhead = aheadTile(playerTile, playerDirection, 2);
    const vx = twoAhead.x - blinkyTile.x;
    const vy = twoAhead.y - blinkyTile.y;
    return { x: twoAhead.x + vx, y: twoAhead.y + vy };
  }
  if (ghostId === 'clyde') {
    const source = ghostTile || blinkyTile;
    const dx = playerTile.x - source.x;
    const dy = playerTile.y - source.y;
    const distSq = (dx * dx) + (dy * dy);
    if (distSq <= 64) {
      return scatterTargets.clyde;
    }
    return { ...playerTile };
  }
  return { ...playerTile };
}

/*
Toolbox Aid
David Quesenberry
03/21/2026
minimalJump.js
*/

// Sample 56 local jump helper.
// Keeps jump logic inside this sample so the behavior stays related to gravity zones.

export function applyMinimalJump(player, jumpPressed, gravity, jumpStrength) {
  if (!jumpPressed || !player.onGround) {
    return false;
  }

  player.vx -= gravity.x * jumpStrength;
  player.vy -= gravity.y * jumpStrength;
  player.onGround = false;
  return true;
}

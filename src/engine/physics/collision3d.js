/*
Toolbox Aid
David Quesenberry
04/15/2026
collision3d.js
*/
function toFinite(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

function getAabb3D(bounds) {
  return {
    x: toFinite(bounds?.x, 0),
    y: toFinite(bounds?.y, 0),
    z: toFinite(bounds?.z, 0),
    width: Math.max(0, toFinite(bounds?.width, 0)),
    height: Math.max(0, toFinite(bounds?.height, 0)),
    depth: Math.max(0, toFinite(bounds?.depth, 0)),
  };
}

export function isAabbColliding3D(a, b) {
  const left = getAabb3D(a);
  const right = getAabb3D(b);

  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y &&
    left.z < right.z + right.depth &&
    left.z + left.depth > right.z
  );
}

export function resolveAabbCollision3D(body, obstacle) {
  if (!body || !obstacle || body === obstacle) {
    return {
      collided: false,
      axis: null,
      overlap: 0,
    };
  }

  const moving = getAabb3D(body);
  const fixed = getAabb3D(obstacle);

  if (!isAabbColliding3D(moving, fixed)) {
    return {
      collided: false,
      axis: null,
      overlap: 0,
    };
  }

  const movingCenterX = moving.x + moving.width / 2;
  const movingCenterY = moving.y + moving.height / 2;
  const movingCenterZ = moving.z + moving.depth / 2;
  const fixedCenterX = fixed.x + fixed.width / 2;
  const fixedCenterY = fixed.y + fixed.height / 2;
  const fixedCenterZ = fixed.z + fixed.depth / 2;

  const deltaX = movingCenterX - fixedCenterX;
  const deltaY = movingCenterY - fixedCenterY;
  const deltaZ = movingCenterZ - fixedCenterZ;
  const overlapX = (moving.width + fixed.width) / 2 - Math.abs(deltaX);
  const overlapY = (moving.height + fixed.height) / 2 - Math.abs(deltaY);
  const overlapZ = (moving.depth + fixed.depth) / 2 - Math.abs(deltaZ);

  let axis = 'x';
  let overlap = overlapX;

  if (overlapY < overlap) {
    axis = 'y';
    overlap = overlapY;
  }

  if (overlapZ < overlap) {
    axis = 'z';
    overlap = overlapZ;
  }

  if (axis === 'x') {
    body.x += deltaX < 0 ? -overlap : overlap;
    body.velocityX = 0;
  } else if (axis === 'y') {
    body.y += deltaY < 0 ? -overlap : overlap;
    body.velocityY = 0;
  } else {
    body.z += deltaZ < 0 ? -overlap : overlap;
    body.velocityZ = 0;
  }

  return {
    collided: true,
    axis,
    overlap,
  };
}

export function resolveAabbCollisions3D(body, obstacles = []) {
  if (!Array.isArray(obstacles) || obstacles.length === 0) {
    return {
      collided: false,
      collisionCount: 0,
      axes: [],
    };
  }

  const axes = [];
  for (const obstacle of obstacles) {
    const result = resolveAabbCollision3D(body, obstacle);
    if (result.collided) {
      axes.push(result.axis);
    }
  }

  return {
    collided: axes.length > 0,
    collisionCount: axes.length,
    axes,
  };
}

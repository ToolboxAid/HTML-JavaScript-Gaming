export function createPlayerPrefab({ x, y, color = '#34d399', label = 'player' } = {}) {
  return {
    x,
    y,
    width: 44,
    height: 44,
    speed: 250,
    color,
    label,
  };
}

export function createEnemyPrefab({ x, y, minX, maxX, color = '#8888ff', label = 'enemy' } = {}) {
  return {
    x,
    y,
    width: 52,
    height: 52,
    color,
    label,
    patrol: {
      minX,
      maxX,
      speed: 150,
      direction: 1,
    },
    detectionRange: 150,
    alive: true,
  };
}

export function createPickupPrefab({ x, y, color = '#ffd166', label = 'pickup' } = {}) {
  return {
    x,
    y,
    width: 24,
    height: 24,
    color,
    label,
    active: true,
  };
}

export function createProjectilePrefab({ x, y, velocityX = 420, velocityY = 0, color = '#ffd166', label = 'projectile' } = {}) {
  return {
    x,
    y,
    width: 16,
    height: 12,
    velocityX,
    velocityY,
    color,
    label,
    life: 1.5,
  };
}

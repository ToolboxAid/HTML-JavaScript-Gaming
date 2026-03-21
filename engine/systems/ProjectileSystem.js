export function spawnProjectile(projectiles, { x, y, width = 12, height = 12, velocityX = 0, velocityY = 0, life = 1.5, color = '#ffd166' }) {
  projectiles.push({
    x,
    y,
    width,
    height,
    velocityX,
    velocityY,
    life,
    color,
  });
}

export function updateProjectiles(projectiles, dt, bounds = null) {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = projectiles[i];
    projectile.x += projectile.velocityX * dt;
    projectile.y += projectile.velocityY * dt;
    projectile.life -= dt;

    if (bounds) {
      const outside =
        projectile.x + projectile.width < bounds.x ||
        projectile.y + projectile.height < bounds.y ||
        projectile.x > bounds.x + bounds.width ||
        projectile.y > bounds.y + bounds.height;

      if (outside) {
        projectiles.splice(i, 1);
        continue;
      }
    }

    if (projectile.life <= 0) {
      projectiles.splice(i, 1);
    }
  }
}

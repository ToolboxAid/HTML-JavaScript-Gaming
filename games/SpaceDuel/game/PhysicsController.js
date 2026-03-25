/*
Toolbox Aid
David Quesenberry
03/25/2026
PhysicsController.js
*/
export default class PhysicsController {
  constructor({ width = 960, height = 720 } = {}) {
    this.bounds = { width, height };
  }

  wrap(body, radius = 0) {
    const wrapped = body;
    if (wrapped.x < -radius) {
      wrapped.x = this.bounds.width + radius;
    } else if (wrapped.x > this.bounds.width + radius) {
      wrapped.x = -radius;
    }

    if (wrapped.y < -radius) {
      wrapped.y = this.bounds.height + radius;
    } else if (wrapped.y > this.bounds.height + radius) {
      wrapped.y = -radius;
    }

    return wrapped;
  }

  getWrappedDelta(a, b) {
    const width = this.bounds.width;
    const height = this.bounds.height;
    let dx = a.x - b.x;
    let dy = a.y - b.y;

    if (Math.abs(dx) > width * 0.5) {
      dx -= Math.sign(dx) * width;
    }
    if (Math.abs(dy) > height * 0.5) {
      dy -= Math.sign(dy) * height;
    }

    return { dx, dy };
  }

  advanceBody(body, dtSeconds) {
    body.x += body.vx * dtSeconds;
    body.y += body.vy * dtSeconds;
    this.wrap(body, body.radius ?? 0);
    return body;
  }

  updateBullets(bullets, dtSeconds) {
    for (let index = bullets.length - 1; index >= 0; index -= 1) {
      const bullet = bullets[index];
      bullet.ttl -= dtSeconds;
      bullet.x += bullet.vx * dtSeconds;
      bullet.y += bullet.vy * dtSeconds;
      this.wrap(bullet, bullet.radius ?? 0);

      if (bullet.ttl <= 0) {
        bullets.splice(index, 1);
      }
    }
  }

  clampMagnitude(body, maxMagnitude) {
    const speedSq = (body.vx * body.vx) + (body.vy * body.vy);
    if (speedSq <= maxMagnitude * maxMagnitude) {
      return;
    }

    const speed = Math.sqrt(speedSq) || 1;
    body.vx = (body.vx / speed) * maxMagnitude;
    body.vy = (body.vy / speed) * maxMagnitude;
  }

  collidesCircle(a, b) {
    const { dx, dy } = this.getWrappedDelta(a, b);
    const radius = (a.radius ?? 0) + (b.radius ?? 0);
    return (dx * dx) + (dy * dy) <= radius * radius;
  }

  findNearestTarget(origin, candidates) {
    let nearest = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;

    candidates.forEach((target) => {
      if (!target || !target.alive) {
        return;
      }

      const delta = this.getWrappedDelta(target, origin);
      const dx = delta.dx;
      const dy = delta.dy;
      const distanceSq = (dx * dx) + (dy * dy);
      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearest = target;
      }
    });

    return nearest;
  }
}

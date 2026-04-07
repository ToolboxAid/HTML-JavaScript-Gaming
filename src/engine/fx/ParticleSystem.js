/*
Toolbox Aid
David Quesenberry
03/22/2026
ParticleSystem.js
*/
export default class ParticleSystem {
  constructor({ random = Math.random } = {}) {
    this.particles = [];
    this.random = typeof random === 'function' ? random : Math.random;
  }

  static colorWithAlpha(color, alpha) {
    if (typeof color !== 'string') {
      return color;
    }

    if (color.startsWith('#')) {
      const normalized = color.length === 4
        ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
        : color;
      const red = Number.parseInt(normalized.slice(1, 3), 16);
      const green = Number.parseInt(normalized.slice(3, 5), 16);
      const blue = Number.parseInt(normalized.slice(5, 7), 16);
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }

    return color;
  }

  spawnExplosion({
    x,
    y,
    count = 16,
    speed = 120,
    color = '#f59e0b',
    lifeSeconds = 0.8,
    randomize = false,
    shape = 'square',
    minSize = null,
    maxSize = null,
  } = {}) {
    for (let index = 0; index < count; index += 1) {
      const baseAngle = (Math.PI * 2 * index) / count;
      const angle = randomize
        ? baseAngle + ((this.random() * 2) - 1) * (Math.PI / 5)
        : baseAngle;
      const velocity = randomize
        ? speed * (0.35 + this.random() * 1.05)
        : speed * (0.6 + (index % 4) * 0.15);
      const generatedSize = randomize
        ? 2 + this.random() * 7
        : 4 + (index % 3) * 2;
      const size = minSize !== null || maxSize !== null
        ? Math.max(
          minSize ?? generatedSize,
          Math.min(maxSize ?? generatedSize, generatedSize),
        )
        : generatedSize;
      this.particles.push({
        x,
        y,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        color,
        shape,
        lifeSeconds,
        maxLifeSeconds: lifeSeconds,
        size,
      });
    }
  }

  update(dtSeconds) {
    for (let index = this.particles.length - 1; index >= 0; index -= 1) {
      const particle = this.particles[index];
      particle.x += particle.velocityX * dtSeconds;
      particle.y += particle.velocityY * dtSeconds;
      particle.velocityY += 80 * dtSeconds;
      particle.lifeSeconds -= dtSeconds;
      if (particle.lifeSeconds <= 0) {
        this.particles.splice(index, 1);
      }
    }
  }

  render(renderer) {
    for (const particle of this.particles) {
      if (particle.shape === 'circle') {
        const lifeRatio = particle.maxLifeSeconds > 0
          ? Math.max(0, particle.lifeSeconds / particle.maxLifeSeconds)
          : 0;
        const currentSize = Math.max(0.5, particle.size * lifeRatio);
        renderer.drawCircle(
          particle.x + currentSize * 0.5,
          particle.y + currentSize * 0.5,
          currentSize * 0.5,
          ParticleSystem.colorWithAlpha(particle.color, Math.max(0.08, lifeRatio)),
        );
        continue;
      }

      if (particle.shape === 'diamond') {
        const halfSize = particle.size * 0.5;
        renderer.drawRect(
          particle.x + halfSize * 0.2,
          particle.y + halfSize * 0.2,
          particle.size * 0.6,
          particle.size * 0.6,
          particle.color,
        );
        renderer.drawCircle(
          particle.x + halfSize,
          particle.y + halfSize,
          Math.max(1, particle.size * 0.18),
          particle.color,
        );
        continue;
      }

      renderer.drawRect(particle.x, particle.y, particle.size, particle.size, particle.color);
    }
  }

  getSnapshot() {
    return this.particles.map((particle) => ({ ...particle }));
  }
}

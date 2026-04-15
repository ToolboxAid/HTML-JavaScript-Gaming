/*
Toolbox Aid
David Quesenberry
04/15/2026
SpaceShooter3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { isAabbColliding3D } from '/src/engine/physics/index.js';
import { createProjectionViewport, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createAsteroid(seed) {
  const x = ((seed * 37) % 120) / 10 - 6;
  const y = ((seed * 29) % 60) / 10 - 1.2;
  const z = 20 + (seed % 7) * 3.4;
  return {
    transform3D: { x, y, z },
    size3D: { width: 1.3, height: 1.3, depth: 1.3 },
    driftX: ((seed * 11) % 10 - 5) * 0.2,
    driftY: ((seed * 7) % 8 - 4) * 0.12,
  };
}

export default class SpaceShooter3DScene extends Scene {
  constructor() {
    super();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.ship = {
      transform3D: { x: 0, y: 0, z: 6.5 },
      size3D: { width: 1.0, height: 0.7, depth: 1.8 },
    };
    this.bullets = [];
    this.asteroids = [1, 2, 3, 4, 5, 6].map((seed) => createAsteroid(seed));
    this.shipSpeed = 8.4;
    this.bulletSpeed = 26;
    this.asteroidSpeed = 7.5;
    this.fireCooldown = 0;
    this.score = 0;
    this.misses = 0;
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.syncCamera();
  }

  syncCamera() {
    if (!this.camera3D) {
      return;
    }

    this.camera3D.setPosition({
      x: this.ship.transform3D.x,
      y: this.ship.transform3D.y + 2.4,
      z: this.ship.transform3D.z - 9.2,
    });
    this.camera3D.setRotation({
      x: -0.08,
      y: 0,
      z: 0,
    });
  }

  resetAsteroid(asteroid, seedOffset = 0) {
    const seed = Math.floor((this.score + this.misses + seedOffset + 3) * 17);
    asteroid.transform3D.x = ((seed * 23) % 120) / 10 - 6;
    asteroid.transform3D.y = ((seed * 31) % 60) / 10 - 1.2;
    asteroid.transform3D.z = 26 + (seed % 10) * 1.8;
    asteroid.driftX = ((seed * 13) % 12 - 6) * 0.18;
    asteroid.driftY = ((seed * 5) % 10 - 5) * 0.11;
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const moveX = (input?.isDown('KeyD') ? 1 : 0) - (input?.isDown('KeyA') ? 1 : 0);
    const moveY = (input?.isDown('KeyW') ? 1 : 0) - (input?.isDown('KeyS') ? 1 : 0);
    const moveLength = Math.hypot(moveX, moveY) || 1;

    this.ship.transform3D.x += (moveX / moveLength) * this.shipSpeed * dt;
    this.ship.transform3D.y += (moveY / moveLength) * this.shipSpeed * dt;
    this.ship.transform3D.x = clamp(this.ship.transform3D.x, -6.5, 6.5);
    this.ship.transform3D.y = clamp(this.ship.transform3D.y, -2.0, 3.4);

    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    const firePressed = input?.isDown('Space') === true;
    if (firePressed && this.fireCooldown <= 0) {
      this.bullets.push({
        transform3D: {
          x: this.ship.transform3D.x + 0.38,
          y: this.ship.transform3D.y + 0.2,
          z: this.ship.transform3D.z + 1.7,
        },
        size3D: { width: 0.25, height: 0.25, depth: 0.8 },
      });
      this.fireCooldown = 0.13;
    }

    this.bullets.forEach((bullet) => {
      bullet.transform3D.z += this.bulletSpeed * dt;
    });
    this.bullets = this.bullets.filter((bullet) => bullet.transform3D.z < 40);

    this.asteroids.forEach((asteroid, asteroidIndex) => {
      asteroid.transform3D.z -= this.asteroidSpeed * dt;
      asteroid.transform3D.x += asteroid.driftX * dt;
      asteroid.transform3D.y += asteroid.driftY * dt;
      asteroid.transform3D.x = clamp(asteroid.transform3D.x, -7.2, 7.2);
      asteroid.transform3D.y = clamp(asteroid.transform3D.y, -2.5, 4.0);

      if (asteroid.transform3D.z < 4.6) {
        this.misses += 1;
        this.resetAsteroid(asteroid, asteroidIndex);
      }
    });

    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex -= 1) {
      const bullet = this.bullets[bulletIndex];
      let hit = false;
      for (let asteroidIndex = 0; asteroidIndex < this.asteroids.length; asteroidIndex += 1) {
        const asteroid = this.asteroids[asteroidIndex];
        const collided = isAabbColliding3D(
          {
            x: bullet.transform3D.x,
            y: bullet.transform3D.y,
            z: bullet.transform3D.z,
            width: bullet.size3D.width,
            height: bullet.size3D.height,
            depth: bullet.size3D.depth,
          },
          {
            x: asteroid.transform3D.x,
            y: asteroid.transform3D.y,
            z: asteroid.transform3D.z,
            width: asteroid.size3D.width,
            height: asteroid.size3D.height,
            depth: asteroid.size3D.depth,
          },
        );

        if (collided) {
          this.score += 1;
          this.resetAsteroid(asteroid, asteroidIndex + bulletIndex);
          hit = true;
          break;
        }
      }

      if (hit) {
        this.bullets.splice(bulletIndex, 1);
      }
    }

    this.syncCamera();
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1607 - 3D Space Shooter',
      'Pilot a ship lane, fire at incoming asteroids, and track score.',
      'Move: W A S D | Fire: Space',
      'Keep the asteroid lane clear before misses stack up.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 2.4, z: -2.7 },
      rotation: { x: -0.08, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawWireBox(
      renderer,
      { x: -7.4, y: -2.5, z: 5.8 },
      { width: 14.8, height: 7.0, depth: 30.4 },
      cameraState,
      projectionViewport,
      '#334155',
      1,
    );

    drawWireBox(renderer, this.ship.transform3D, this.ship.size3D, cameraState, projectionViewport, '#7dd3fc', 2);

    this.bullets.forEach((bullet) => {
      drawWireBox(renderer, bullet.transform3D, bullet.size3D, cameraState, projectionViewport, '#fde68a', 2);
    });

    this.asteroids.forEach((asteroid) => {
      drawWireBox(renderer, asteroid.transform3D, asteroid.size3D, cameraState, projectionViewport, '#fb7185', 2);
    });

    drawPanel(renderer, 620, 34, 300, 126, 'Shooter Runtime', [
      `Ship: x=${this.ship.transform3D.x.toFixed(2)} y=${this.ship.transform3D.y.toFixed(2)} z=${this.ship.transform3D.z.toFixed(2)}`,
      `Bullets: ${this.bullets.length} | Cooldown: ${this.fireCooldown.toFixed(2)} s`,
      `Asteroids: ${this.asteroids.length}`,
      `Score: ${this.score}`,
      `Misses: ${this.misses}`,
    ]);
  }
}


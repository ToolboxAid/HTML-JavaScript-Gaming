/*
Toolbox Aid
David Quesenberry
04/15/2026
PhysicsPlayground3DScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { createProjectionViewport, drawGroundGrid, drawWireBox } from '../shared/threeDWireframe.js';

const theme = new Theme(ThemeTokens);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createBody(id, x, y, z, color, vx, vy, vz) {
  return {
    id,
    color,
    transform3D: { x, y, z },
    size3D: { width: 1.1, height: 1.1, depth: 1.1 },
    velocity: { x: vx, y: vy, z: vz },
    bounce: 0.62,
  };
}

export default class PhysicsPlayground3DScene extends Scene {
  constructor() {
    super();
    this.viewport = {
      x: 40,
      y: 170,
      width: 860,
      height: 320,
      focalLength: 460,
    };
    this.arena = {
      minX: -9,
      maxX: 9,
      minY: -0.2,
      maxY: 8,
      minZ: 7,
      maxZ: 25,
    };
    this.gravity = -22;
    this.gravityScale = 1;
    this.gravityToggleLatch = false;
    this.impulseCooldown = 0;
    this.simulatedSeconds = 0;

    this.bodies = [
      createBody('alpha', -4.2, 4.8, 10.0, '#7dd3fc', 2.8, -1.0, 3.2),
      createBody('beta', 0.1, 6.5, 14.2, '#fbbf24', -2.2, 0.0, 2.0),
      createBody('gamma', 3.8, 5.2, 19.0, '#86efac', 1.7, -2.0, -2.6),
    ];
  }

  setCamera3D(camera3D) {
    this.camera3D = camera3D;
    this.camera3D.setPosition({ x: 0, y: 8.5, z: 1.2 });
    this.camera3D.setRotation({ x: -0.42, y: 0, z: 0 });
  }

  step3DPhysics(dt, engine) {
    const input = engine.input;
    const gravityTogglePressed = input?.isDown('KeyG') === true;
    if (gravityTogglePressed && !this.gravityToggleLatch) {
      this.gravityScale = this.gravityScale === 1 ? 0.35 : 1;
    }
    this.gravityToggleLatch = gravityTogglePressed;

    this.impulseCooldown = Math.max(0, this.impulseCooldown - dt);
    if (input?.isDown('Space') && this.impulseCooldown <= 0) {
      this.bodies[0].velocity.y += 9.5;
      this.impulseCooldown = 0.2;
    }

    if (input?.isDown('KeyA')) this.bodies[0].velocity.x -= 8 * dt;
    if (input?.isDown('KeyD')) this.bodies[0].velocity.x += 8 * dt;
    if (input?.isDown('KeyW')) this.bodies[0].velocity.z += 8 * dt;
    if (input?.isDown('KeyS')) this.bodies[0].velocity.z -= 8 * dt;

    this.bodies.forEach((body) => {
      body.velocity.y += this.gravity * this.gravityScale * dt;
      body.transform3D.x += body.velocity.x * dt;
      body.transform3D.y += body.velocity.y * dt;
      body.transform3D.z += body.velocity.z * dt;

      const maxX = this.arena.maxX - body.size3D.width;
      const maxY = this.arena.maxY - body.size3D.height;
      const maxZ = this.arena.maxZ - body.size3D.depth;

      if (body.transform3D.y < this.arena.minY) {
        body.transform3D.y = this.arena.minY;
        if (body.velocity.y < 0) body.velocity.y = -body.velocity.y * body.bounce;
      } else if (body.transform3D.y > maxY) {
        body.transform3D.y = maxY;
        if (body.velocity.y > 0) body.velocity.y = -body.velocity.y * body.bounce;
      }

      if (body.transform3D.x < this.arena.minX) {
        body.transform3D.x = this.arena.minX;
        if (body.velocity.x < 0) body.velocity.x = -body.velocity.x * body.bounce;
      } else if (body.transform3D.x > maxX) {
        body.transform3D.x = maxX;
        if (body.velocity.x > 0) body.velocity.x = -body.velocity.x * body.bounce;
      }

      if (body.transform3D.z < this.arena.minZ) {
        body.transform3D.z = this.arena.minZ;
        if (body.velocity.z < 0) body.velocity.z = -body.velocity.z * body.bounce;
      } else if (body.transform3D.z > maxZ) {
        body.transform3D.z = maxZ;
        if (body.velocity.z > 0) body.velocity.z = -body.velocity.z * body.bounce;
      }

      body.velocity.x *= 0.996;
      body.velocity.y *= 0.998;
      body.velocity.z *= 0.996;
      body.velocity.x = clamp(body.velocity.x, -12, 12);
      body.velocity.y = clamp(body.velocity.y, -20, 20);
      body.velocity.z = clamp(body.velocity.z, -12, 12);
    });

    this.simulatedSeconds += dt;
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Sample 1606 - 3D Physics Playground',
      'Inspect gravity, bounce, and impulse behavior with multiple 3D bodies.',
      'Impulse: Space | Nudge alpha body: W A S D | Toggle gravity: G',
      'Observe velocity damping and rebound inside arena bounds.',
    ]);

    renderer.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, '#d8d5ff', 2);

    const cameraState = this.camera3D?.getState?.() ?? {
      position: { x: 0, y: 8.5, z: 1.2 },
      rotation: { x: -0.42, y: 0, z: 0 },
    };
    const projectionViewport = createProjectionViewport(this.viewport);

    drawGroundGrid(
      renderer,
      {
        minX: -10,
        maxX: 10,
        minZ: 7,
        maxZ: 26,
        y: -0.2,
        step: 1.5,
      },
      cameraState,
      projectionViewport,
    );

    drawWireBox(
      renderer,
      { x: this.arena.minX, y: this.arena.minY, z: this.arena.minZ },
      {
        width: this.arena.maxX - this.arena.minX,
        height: this.arena.maxY - this.arena.minY,
        depth: this.arena.maxZ - this.arena.minZ,
      },
      cameraState,
      projectionViewport,
      '#64748b',
      1,
    );

    this.bodies.forEach((body) => {
      drawWireBox(renderer, body.transform3D, body.size3D, cameraState, projectionViewport, body.color, 2);
    });

    const alpha = this.bodies[0];
    drawPanel(renderer, 620, 34, 300, 126, 'Physics Runtime', [
      `Alpha pos: x=${alpha.transform3D.x.toFixed(2)} y=${alpha.transform3D.y.toFixed(2)} z=${alpha.transform3D.z.toFixed(2)}`,
      `Alpha vel: vx=${alpha.velocity.x.toFixed(2)} vy=${alpha.velocity.y.toFixed(2)} vz=${alpha.velocity.z.toFixed(2)}`,
      `Gravity scale: ${this.gravityScale.toFixed(2)}`,
      `Impulse cooldown: ${this.impulseCooldown.toFixed(2)} s`,
      `Sim time: ${this.simulatedSeconds.toFixed(1)} s`,
    ]);
  }
}


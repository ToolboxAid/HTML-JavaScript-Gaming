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

function createBody({
  id,
  x,
  y,
  z,
  color,
  vx,
  vy,
  vz,
  width = 1.1,
  height = 1.1,
  depth = 1.1,
  bounce = 0.62,
  mass = 1,
}) {
  return {
    id,
    color,
    transform3D: { x, y, z },
    size3D: { width, height, depth },
    velocity: { x: vx, y: vy, z: vz },
    bounce,
    mass,
  };
}

function getBodyCenter(body) {
  return {
    x: body.transform3D.x + body.size3D.width * 0.5,
    y: body.transform3D.y + body.size3D.height * 0.5,
    z: body.transform3D.z + body.size3D.depth * 0.5,
  };
}

function resolveBodyCollision(bodyA, bodyB) {
  const aMinX = bodyA.transform3D.x;
  const aMaxX = bodyA.transform3D.x + bodyA.size3D.width;
  const aMinY = bodyA.transform3D.y;
  const aMaxY = bodyA.transform3D.y + bodyA.size3D.height;
  const aMinZ = bodyA.transform3D.z;
  const aMaxZ = bodyA.transform3D.z + bodyA.size3D.depth;

  const bMinX = bodyB.transform3D.x;
  const bMaxX = bodyB.transform3D.x + bodyB.size3D.width;
  const bMinY = bodyB.transform3D.y;
  const bMaxY = bodyB.transform3D.y + bodyB.size3D.height;
  const bMinZ = bodyB.transform3D.z;
  const bMaxZ = bodyB.transform3D.z + bodyB.size3D.depth;

  const overlapX = Math.min(aMaxX, bMaxX) - Math.max(aMinX, bMinX);
  const overlapY = Math.min(aMaxY, bMaxY) - Math.max(aMinY, bMinY);
  const overlapZ = Math.min(aMaxZ, bMaxZ) - Math.max(aMinZ, bMinZ);

  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) {
    return false;
  }

  let axis = 'x';
  let minOverlap = overlapX;
  if (overlapY < minOverlap) {
    axis = 'y';
    minOverlap = overlapY;
  }
  if (overlapZ < minOverlap) {
    axis = 'z';
    minOverlap = overlapZ;
  }

  const centerA = getBodyCenter(bodyA);
  const centerB = getBodyCenter(bodyB);
  const sign = centerA[axis] >= centerB[axis] ? 1 : -1;
  const correction = minOverlap * 0.5 + 0.0001;
  bodyA.transform3D[axis] += correction * sign;
  bodyB.transform3D[axis] -= correction * sign;

  const massA = Math.max(0.2, bodyA.mass ?? 1);
  const massB = Math.max(0.2, bodyB.mass ?? 1);
  const restitution = Math.min(bodyA.bounce, bodyB.bounce);
  const velA = bodyA.velocity[axis];
  const velB = bodyB.velocity[axis];
  const combinedMass = massA + massB;
  const nextVelA = ((velA * (massA - massB) + 2 * massB * velB) / combinedMass) * restitution;
  const nextVelB = ((velB * (massB - massA) + 2 * massA * velA) / combinedMass) * restitution;
  bodyA.velocity[axis] = nextVelA;
  bodyB.velocity[axis] = nextVelB;

  if (axis !== 'x') {
    bodyA.velocity.x *= 0.985;
    bodyB.velocity.x *= 0.985;
  }
  if (axis !== 'y') {
    bodyA.velocity.y *= 0.985;
    bodyB.velocity.y *= 0.985;
  }
  if (axis !== 'z') {
    bodyA.velocity.z *= 0.985;
    bodyB.velocity.z *= 0.985;
  }

  return true;
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
    this.gravity = -30;
    this.gravityScale = 1;
    this.gravityToggleLatch = false;
    this.impulseCooldown = 0;
    this.simulatedSeconds = 0;
    this.bodyCollisionHits = 0;

    this.bodies = [
      createBody({
        id: 'alpha',
        x: -5.8,
        y: 6.8,
        z: 9.8,
        color: '#7dd3fc',
        vx: 4.2,
        vy: -1.6,
        vz: 4.9,
        width: 1.0,
        height: 1.0,
        depth: 1.0,
        bounce: 0.72,
        mass: 0.9,
      }),
      createBody({
        id: 'beta',
        x: -0.2,
        y: 2.8,
        z: 14.0,
        color: '#fbbf24',
        vx: 0.5,
        vy: 3.4,
        vz: 1.3,
        width: 1.4,
        height: 1.4,
        depth: 1.4,
        bounce: 0.88,
        mass: 0.65,
      }),
      createBody({
        id: 'gamma',
        x: 4.4,
        y: 7.1,
        z: 19.6,
        color: '#86efac',
        vx: -3.8,
        vy: -0.8,
        vz: -3.4,
        width: 1.6,
        height: 1.6,
        depth: 1.6,
        bounce: 0.56,
        mass: 1.35,
      }),
      createBody({
        id: 'delta',
        x: 0.9,
        y: 4.0,
        z: 13.5,
        color: '#f472b6',
        vx: -2.2,
        vy: 1.5,
        vz: 2.8,
        width: 0.9,
        height: 0.9,
        depth: 0.9,
        bounce: 0.92,
        mass: 0.45,
      }),
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

    let bodyCollisionHits = 0;
    for (let i = 0; i < this.bodies.length - 1; i += 1) {
      for (let j = i + 1; j < this.bodies.length; j += 1) {
        if (resolveBodyCollision(this.bodies[i], this.bodies[j])) {
          bodyCollisionHits += 1;
        }
      }
    }
    this.bodyCollisionHits = bodyCollisionHits;

    this.bodies.forEach((body) => {
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
      `Body collisions/frame: ${this.bodyCollisionHits}`,
      `Impulse cooldown: ${this.impulseCooldown.toFixed(2)} s`,
      `Sim time: ${this.simulatedSeconds.toFixed(1)} s`,
    ]);
  }
}

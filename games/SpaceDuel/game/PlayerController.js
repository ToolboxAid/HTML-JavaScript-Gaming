/*
Toolbox Aid
David Quesenberry
03/25/2026
PlayerController.js
*/
const PLAYER_DEFS = {
  1: {
    color: '#ffffff',
    spawn: { x: 300, y: 560, angle: -Math.PI / 2 },
    actions: {
      left: 'p1Left',
      right: 'p1Right',
      thrust: 'p1Thrust',
      fire: 'p1Fire',
    },
  },
  2: {
    color: '#9ae6b4',
    spawn: { x: 660, y: 560, angle: -Math.PI / 2 },
    actions: {
      left: 'p2Left',
      right: 'p2Right',
      thrust: 'p2Thrust',
      fire: 'p2Fire',
    },
  },
};

const ROTATION_SPEED = 4.45;
const THRUST_ACCELERATION = 328;
const MAX_SPEED = 300;
const SHIP_RADIUS = 12;
const FIRE_COOLDOWN_SECONDS = 0.2;
const RESPAWN_DELAY_SECONDS = 1.2;
const INVULNERABLE_SECONDS = 1.7;
const BULLET_SPEED = 560;
const BULLET_TTL = 1.1;

function createShipForPlayer(playerId) {
  const definition = PLAYER_DEFS[playerId];
  return {
    id: playerId,
    x: definition.spawn.x,
    y: definition.spawn.y,
    angle: definition.spawn.angle,
    vx: 0,
    vy: 0,
    radius: SHIP_RADIUS,
    color: definition.color,
    actions: definition.actions,
    alive: true,
    thrusting: false,
    fireCooldown: 0,
    respawnTimer: 0,
    invulnerableTimer: 0,
  };
}

export default class PlayerController {
  constructor({ physics }) {
    this.physics = physics;
    this.players = [];
    this.nextBulletId = 1;
  }

  createPlayers(playerCount = 1) {
    this.players = [];
    for (let id = 1; id <= playerCount; id += 1) {
      this.players.push(createShipForPlayer(id));
    }
    return this.players;
  }

  respawn(player) {
    const definition = PLAYER_DEFS[player.id];
    player.x = definition.spawn.x;
    player.y = definition.spawn.y;
    player.angle = definition.spawn.angle;
    player.vx = 0;
    player.vy = 0;
    player.alive = true;
    player.thrusting = false;
    player.invulnerableTimer = INVULNERABLE_SECONDS;
    player.fireCooldown = 0;
  }

  destroy(player) {
    player.alive = false;
    player.thrusting = false;
    player.respawnTimer = RESPAWN_DELAY_SECONDS;
    player.fireCooldown = 0;
  }

  update({ dtSeconds, input, bullets }) {
    const events = {
      firedBy: [],
      thrustingBy: [],
    };

    this.players.forEach((player) => {
      if (player.invulnerableTimer > 0) {
        player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dtSeconds);
      }

      if (!player.alive) {
        if (player.respawnTimer > 0) {
          player.respawnTimer = Math.max(0, player.respawnTimer - dtSeconds);
        }
        return;
      }

      if (player.fireCooldown > 0) {
        player.fireCooldown = Math.max(0, player.fireCooldown - dtSeconds);
      }

      const turningLeft = input?.isActionDown?.(player.actions.left);
      const turningRight = input?.isActionDown?.(player.actions.right);
      const thrusting = input?.isActionDown?.(player.actions.thrust);
      const firePressed = input?.isActionPressed?.(player.actions.fire);

      if (turningLeft) {
        player.angle -= ROTATION_SPEED * dtSeconds;
      }
      if (turningRight) {
        player.angle += ROTATION_SPEED * dtSeconds;
      }

      player.thrusting = Boolean(thrusting);
      if (player.thrusting) {
        const ax = Math.cos(player.angle) * THRUST_ACCELERATION;
        const ay = Math.sin(player.angle) * THRUST_ACCELERATION;
        player.vx += ax * dtSeconds;
        player.vy += ay * dtSeconds;
        this.physics.clampMagnitude(player, MAX_SPEED);
        events.thrustingBy.push(player.id);
      }

      this.physics.advanceBody(player, dtSeconds);

      if (firePressed && player.fireCooldown <= 0) {
        player.fireCooldown = FIRE_COOLDOWN_SECONDS;
        bullets.push(this.createBullet(player));
        events.firedBy.push(player.id);
      }
    });

    return events;
  }

  createBullet(player) {
    return {
      id: this.nextBulletId++,
      ownerId: player.id,
      x: player.x + (Math.cos(player.angle) * (player.radius + 8)),
      y: player.y + (Math.sin(player.angle) * (player.radius + 8)),
      vx: player.vx + (Math.cos(player.angle) * BULLET_SPEED),
      vy: player.vy + (Math.sin(player.angle) * BULLET_SPEED),
      radius: 2,
      ttl: BULLET_TTL,
    };
  }
}

/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyController.js
*/
import AITargetDummyConfig from './AITargetDummyConfig.js';
import AITargetDummyStateMachine from './AITargetDummyStateMachine.js';
import { clamp } from '../../../src/engine/utils/math.js';
import { safeNormalize } from '../../../src/shared/math/vectorNormalizeUtils.js';

export default class AITargetDummyController {
  constructor({ config = AITargetDummyConfig } = {}) {
    this.config = config;
    this.machine = new AITargetDummyStateMachine(config);
    this.waypoints = [
      { x: 0.65, y: 0.35 },
      { x: 0.75, y: 0.55 },
      { x: 0.58, y: 0.68 },
      { x: 0.48, y: 0.45 },
    ];
    this.waypointIndex = 0;
    this.lastKnownTarget = null;
  }

  reset(dummy) {
    dummy.state = 'idle';
    dummy.vx = 0;
    dummy.vy = 0;
    dummy.headingRad = 0;
    this.waypointIndex = 0;
    this.lastKnownTarget = null;
    this.machine.state = 'idle';
    this.machine.stateElapsedMs = 0;
    this.machine.cooldownMs = 0;
    this.machine.targetLostMs = 0;
    this.machine.lastDecisionTimeMs = 0;
  }

  resolveWaypoint(playfield) {
    const wp = this.waypoints[this.waypointIndex % this.waypoints.length];
    return {
      x: playfield.left + ((playfield.right - playfield.left) * wp.x),
      y: playfield.top + ((playfield.bottom - playfield.top) * wp.y),
    };
  }

  update(dtSeconds, { dummy, player, playfield }) {
    const dtMs = Math.max(0, dtSeconds * 1000);
    const toPlayer = safeNormalize(player.x - dummy.x, player.y - dummy.y);
    const hasTarget = true;
    if (hasTarget) {
      this.lastKnownTarget = { x: player.x, y: player.y };
    }

    const decision = this.machine.step(dtMs, {
      distanceToTarget: toPlayer.length,
      hasTarget,
      hasPatrolWaypoint: true,
    });
    dummy.state = decision.state;

    let desired = { x: 0, y: 0 };
    if (dummy.state === 'pursue') {
      desired = { x: toPlayer.x, y: toPlayer.y };
    } else if (dummy.state === 'evade') {
      desired = { x: -toPlayer.x, y: -toPlayer.y };
    } else if (dummy.state === 'patrol') {
      const waypoint = this.resolveWaypoint(playfield);
      const toWaypoint = safeNormalize(waypoint.x - dummy.x, waypoint.y - dummy.y);
      desired = { x: toWaypoint.x, y: toWaypoint.y };
      if (toWaypoint.length <= this.config.patrolWaypointTolerance) {
        this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      }
    }

    const desiredHeading = Math.atan2(desired.y, desired.x);
    if (Number.isFinite(desiredHeading) && (Math.abs(desired.x) > 1e-4 || Math.abs(desired.y) > 1e-4)) {
      let delta = desiredHeading - dummy.headingRad;
      while (delta <= -Math.PI) delta += Math.PI * 2;
      while (delta > Math.PI) delta -= Math.PI * 2;
      const maxTurn = this.config.maxTurnRateRadPerSec * dtSeconds;
      dummy.headingRad += clamp(delta, -maxTurn, maxTurn);
    }

    const maxSpeed = this.config.maxSpeedByState[dummy.state] ?? 0;
    const damping = this.config.dampingByState[dummy.state] ?? 0.15;
    const accel = this.config.accelPerSec * dtSeconds;
    const headingVec = { x: Math.cos(dummy.headingRad), y: Math.sin(dummy.headingRad) };
    const targetVel = { x: headingVec.x * maxSpeed, y: headingVec.y * maxSpeed };
    const velDelta = safeNormalize(targetVel.x - dummy.vx, targetVel.y - dummy.vy);
    const stepAccel = Math.min(accel, velDelta.length);
    dummy.vx += velDelta.x * stepAccel;
    dummy.vy += velDelta.y * stepAccel;
    dummy.vx *= Math.max(0, 1 - (damping * dtSeconds));
    dummy.vy *= Math.max(0, 1 - (damping * dtSeconds));

    dummy.x += dummy.vx * dtSeconds;
    dummy.y += dummy.vy * dtSeconds;
    dummy.x = clamp(dummy.x, playfield.left + dummy.radius, playfield.right - dummy.radius);
    dummy.y = clamp(dummy.y, playfield.top + dummy.radius, playfield.bottom - dummy.radius);

    dummy.lastDistance = toPlayer.length;
    return {
      stateChanged: decision.changed,
      dummyState: dummy.state,
      playerDistance: toPlayer.length,
      decisionTimeMs: this.machine.lastDecisionTimeMs,
      velocity: Math.hypot(dummy.vx, dummy.vy),
      lastKnownTarget: this.lastKnownTarget,
    };
  }
}

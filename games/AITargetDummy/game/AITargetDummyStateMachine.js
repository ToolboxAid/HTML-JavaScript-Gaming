/*
Toolbox Aid
David Quesenberry
03/25/2026
AITargetDummyStateMachine.js
*/
export default class AITargetDummyStateMachine {
  constructor({
    pursueEnterDist,
    pursueExitDist,
    evadeEnterDist,
    evadeExitDist,
    minStateMs,
    stateCooldownMs,
    lostTargetTimeoutMs,
  }) {
    this.cfg = {
      pursueEnterDist,
      pursueExitDist,
      evadeEnterDist,
      evadeExitDist,
      minStateMs,
      stateCooldownMs,
      lostTargetTimeoutMs,
    };
    this.state = 'idle';
    this.stateElapsedMs = 0;
    this.cooldownMs = 0;
    this.targetLostMs = 0;
    this.lastDecisionTimeMs = 0;
  }

  step(dtMs, {
    distanceToTarget,
    hasTarget,
    hasPatrolWaypoint,
  }) {
    this.stateElapsedMs += dtMs;
    this.cooldownMs = Math.max(0, this.cooldownMs - dtMs);
    if (hasTarget) {
      this.targetLostMs = 0;
    } else {
      this.targetLostMs += dtMs;
    }

    if (this.stateElapsedMs < this.cfg.minStateMs || this.cooldownMs > 0) {
      return { changed: false, state: this.state };
    }

    const hasRecentTarget = hasTarget || this.targetLostMs <= this.cfg.lostTargetTimeoutMs;
    let next = this.state;

    if (hasRecentTarget && distanceToTarget <= this.cfg.evadeEnterDist) {
      next = 'evade';
    } else if (this.state === 'evade' && distanceToTarget < this.cfg.evadeExitDist) {
      next = 'evade';
    } else if (hasRecentTarget && distanceToTarget <= this.cfg.pursueEnterDist) {
      next = 'pursue';
    } else if (this.state === 'pursue' && distanceToTarget < this.cfg.pursueExitDist) {
      next = 'pursue';
    } else if (hasPatrolWaypoint) {
      next = 'patrol';
    } else {
      next = 'idle';
    }

    if (next !== this.state) {
      this.state = next;
      this.stateElapsedMs = 0;
      this.cooldownMs = this.cfg.stateCooldownMs;
      this.lastDecisionTimeMs += dtMs;
      return { changed: true, state: this.state };
    }

    this.lastDecisionTimeMs += dtMs;
    return { changed: false, state: this.state };
  }
}

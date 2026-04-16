/*
Toolbox Aid
David Quesenberry
04/16/2026
FinalReferenceGameScene.js
*/
import { createBottomRightDebugPanelStack, drawStackedDebugPanel } from '/src/engine/debug/index.js';
import GameplayMetricsTelemetryScene from '/samples/phase-17/1712/GameplayMetricsTelemetryScene.js';
import { LEVEL17_OVERLAY_CYCLE_KEY } from '/samples/phase-17/shared/overlayCycleInput.js';
const OVERLAY_UI_LAYER = 'ui-layer';
const OVERLAY_MISSION_FEED = 'mission-feed';
const OVERLAY_MISSION_READY = 'mission-ready';
const OVERLAY_FINAL_REFERENCE_RUNTIME = 'final-reference-runtime';
const DEBUG_OVERLAY_PERSISTENCE_KEY = 'phase17:1713:overlay-index';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeReferenceRank(scene) {
  if (scene.gameState === 'lost') {
    return 'D';
  }
  if (scene.gameState !== 'won') {
    return 'N/A';
  }

  const objectiveRatio = clamp(scene.score / Math.max(1, scene.targetScore), 0, 1);
  const healthRatio = clamp(scene.health / Math.max(1, scene.maxHealth), 0, 1);
  const timeRatio = clamp(scene.timeLeft / Math.max(1, scene.roundSeconds), 0, 1);
  const collisionPenalty = Math.min(0.35, scene.telemetry.collisionsTotal * 0.01);
  const weightedScore = objectiveRatio * 0.6 + healthRatio * 0.25 + timeRatio * 0.15 - collisionPenalty;

  if (weightedScore >= 0.9) return 'S';
  if (weightedScore >= 0.78) return 'A';
  if (weightedScore >= 0.63) return 'B';
  return 'C';
}

function isBetterRank(candidate, baseline) {
  const rankOrder = ['S', 'A', 'B', 'C', 'D', 'N/A'];
  return rankOrder.indexOf(candidate) < rankOrder.indexOf(baseline);
}

export default class FinalReferenceGameScene extends GameplayMetricsTelemetryScene {
  constructor() {
    super();

    this.maxHealth = 4;
    this.targetScore = 8;
    this.roundSeconds = 70;
    this.playerSpeed = 8.8;
    this.hitCooldownSeconds = 0.95;
    this.resetMatch({ toReady: true });

    this.referenceRuntime = {
      runCount: 0,
      activeSeconds: 0,
      missionRank: 'N/A',
      bestRank: 'N/A',
      bestScore: 0,
      bestTimeRemaining: 0,
      completionBonus: 0,
      phase: 'briefing',
    };
    this.setDebugOverlayCycleKey(LEVEL17_OVERLAY_CYCLE_KEY);
    this.setDebugOverlayPersistenceKey(DEBUG_OVERLAY_PERSISTENCE_KEY);
    this.setDebugOverlayCycleMap([
      { id: OVERLAY_UI_LAYER, label: 'UI Layer' },
      { id: OVERLAY_MISSION_FEED, label: 'Mission Feed' },
      { id: OVERLAY_MISSION_READY, label: 'MISSION READY' },
      { id: OVERLAY_FINAL_REFERENCE_RUNTIME, label: 'Final Reference Runtime' },
    ], OVERLAY_UI_LAYER);
  }

  step3DPhysics(dtSeconds, engine) {
    const dt = Math.max(0, Math.min(0.05, Number(dtSeconds) || 0));
    const previousState = this.gameState;
    const input = engine?.input;

    if (previousState === 'ready') {
      const wantsMovement =
        input?.isDown('KeyW') === true ||
        input?.isDown('KeyA') === true ||
        input?.isDown('KeyS') === true ||
        input?.isDown('KeyD') === true;
      if (wantsMovement) {
        this.startMatch();
      }
    }

    super.step3DPhysics(dt, engine);

    if (this.gameState === 'running') {
      if (previousState !== 'running') {
        this.referenceRuntime.runCount += 1;
        this.referenceRuntime.activeSeconds = 0;
        this.referenceRuntime.phase = 'active';
      }
      this.referenceRuntime.activeSeconds += dt;
      this.referenceRuntime.missionRank = 'N/A';
      this.referenceRuntime.completionBonus = 0;
      return;
    }

    if (this.gameState === 'ready') {
      this.referenceRuntime.phase = 'briefing';
      this.referenceRuntime.activeSeconds = 0;
      this.referenceRuntime.missionRank = 'N/A';
      this.referenceRuntime.completionBonus = 0;
      return;
    }

    if (previousState !== this.gameState) {
      this.referenceRuntime.phase = this.gameState === 'won' ? 'complete' : 'failed';
      this.referenceRuntime.missionRank = computeReferenceRank(this);
      this.referenceRuntime.completionBonus = this.gameState === 'won'
        ? Math.max(0, Math.floor(this.timeLeft * 4 + this.health * 25))
        : 0;

      if (this.gameState === 'won') {
        if (this.score > this.referenceRuntime.bestScore) {
          this.referenceRuntime.bestScore = this.score;
          this.referenceRuntime.bestTimeRemaining = this.timeLeft;
        } else if (this.score === this.referenceRuntime.bestScore) {
          this.referenceRuntime.bestTimeRemaining = Math.max(this.referenceRuntime.bestTimeRemaining, this.timeLeft);
        }

        if (
          this.referenceRuntime.bestRank === 'N/A' ||
          isBetterRank(this.referenceRuntime.missionRank, this.referenceRuntime.bestRank)
        ) {
          this.referenceRuntime.bestRank = this.referenceRuntime.missionRank;
        }
      }
    }
  }

  render(renderer) {
    super.render(renderer);
    if (!this.isDebugOverlayActive(OVERLAY_FINAL_REFERENCE_RUNTIME)) {
      return;
    }

    const debugStack = this.debugOverlayStack ?? createBottomRightDebugPanelStack(renderer);
    drawStackedDebugPanel(renderer, debugStack, 228, 248, 'Final Reference Runtime', [
      `profile=final-reference`,
      `phase=${this.referenceRuntime.phase}`,
      `runs=${this.referenceRuntime.runCount}`,
      `activeSeconds=${this.referenceRuntime.activeSeconds.toFixed(1)}`,
      `missionRank=${this.referenceRuntime.missionRank}`,
      `bestRank=${this.referenceRuntime.bestRank}`,
      `bestScore=${this.referenceRuntime.bestScore}/${this.targetScore}`,
      `bestTimeLeft=${this.referenceRuntime.bestTimeRemaining.toFixed(1)}s`,
      `completionBonus=${this.referenceRuntime.completionBonus}`,
      'restart=R after mission outcome',
    ]);
  }
}

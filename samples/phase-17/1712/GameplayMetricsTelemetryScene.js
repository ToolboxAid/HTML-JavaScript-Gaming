/*
Toolbox Aid
David Quesenberry
04/16/2026
GameplayMetricsTelemetryScene.js
*/
import { createBottomRightDebugPanelStack, drawStackedDebugPanel } from '/src/engine/debug/index.js';
import RealGameplayMiniGameScene from '/samples/phase-17/1708/RealGameplayMiniGameScene.js';
const OVERLAY_UI_LAYER = 'ui-layer';
const OVERLAY_MISSION_FEED = 'mission-feed';
const OVERLAY_MISSION_READY = 'mission-ready';
const OVERLAY_TELEMETRY = 'telemetry';
const DEBUG_CYCLE_KEY = 'KeyG';

function pushSample(history, value, limit = 48) {
  history.push(Number.isFinite(value) ? Number(value) : 0);
  if (history.length > limit) {
    history.splice(0, history.length - limit);
  }
}

function drawTelemetrySparkline(renderer, x, y, width, height, samples, color) {
  renderer.drawRect(x, y, width, height, 'rgba(2, 6, 23, 0.72)');
  renderer.strokeRect(x, y, width, height, '#334155', 1);

  if (!Array.isArray(samples) || samples.length < 2) {
    return;
  }

  const maxValue = Math.max(1, ...samples);
  const stepX = (width - 4) / Math.max(1, samples.length - 1);
  for (let i = 1; i < samples.length; i += 1) {
    const prev = samples[i - 1];
    const curr = samples[i];
    const x1 = x + 2 + (i - 1) * stepX;
    const x2 = x + 2 + i * stepX;
    const y1 = y + height - 2 - (Math.max(0, prev) / maxValue) * (height - 4);
    const y2 = y + height - 2 - (Math.max(0, curr) / maxValue) * (height - 4);
    renderer.drawLine(x1, y1, x2, y2, color, 1.5);
  }
}

export default class GameplayMetricsTelemetryScene extends RealGameplayMiniGameScene {
  constructor() {
    super();
    this.telemetry = {
      frames: 0,
      rawFps: 60,
      avgFps: 60,
      playerSpeed: 0,
      maxPlayerSpeed: 0,
      collisionsTotal: 0,
      actionEvents: 0,
      stateTransitions: 0,
      speedHistory: [],
      fpsHistory: [],
      collisionHistory: [],
    };
    this.setDebugOverlayCycleKey(DEBUG_CYCLE_KEY);
    this.setDebugOverlayCycleMap([
      { id: OVERLAY_UI_LAYER, label: 'UI Layer' },
      { id: OVERLAY_MISSION_FEED, label: 'Mission Feed' },
      { id: OVERLAY_MISSION_READY, label: 'MISSION READY' },
      { id: OVERLAY_TELEMETRY, label: 'Telemetry Overlay' },
    ], OVERLAY_UI_LAYER);
  }

  step3DPhysics(dtSeconds, engine) {
    const dt = Math.max(0.001, Math.min(0.05, Number(dtSeconds) || 0.016));
    const beforeScore = this.score;
    const beforeHealth = this.health;
    const beforeState = this.gameState;
    const beforeX = this.player.x;
    const beforeZ = this.player.z;

    super.step3DPhysics(dt, engine);

    const dx = this.player.x - beforeX;
    const dz = this.player.z - beforeZ;
    const speed = Math.hypot(dx, dz) / dt;
    const rawFps = 1 / dt;

    this.telemetry.frames += 1;
    this.telemetry.rawFps = rawFps;
    this.telemetry.avgFps = this.telemetry.avgFps * 0.9 + rawFps * 0.1;
    this.telemetry.playerSpeed = speed;
    this.telemetry.maxPlayerSpeed = Math.max(this.telemetry.maxPlayerSpeed, speed);
    this.telemetry.collisionsTotal += this.lastCollisionCount;

    const actionDelta = Math.max(0, this.score - beforeScore) + Math.max(0, beforeHealth - this.health);
    this.telemetry.actionEvents += actionDelta;
    if (beforeState !== this.gameState) {
      this.telemetry.stateTransitions += 1;
    }

    pushSample(this.telemetry.speedHistory, speed);
    pushSample(this.telemetry.fpsHistory, this.telemetry.avgFps);
    pushSample(this.telemetry.collisionHistory, this.lastCollisionCount);
  }

  render(renderer) {
    super.render(renderer);
    if (!this.isDebugOverlayActive(OVERLAY_TELEMETRY)) {
      return;
    }

    const remainingCores = this.cores.filter((core) => core.collected === false).length;
    const objectCount = this.obstacles.length + this.enemies.length + this.cores.length + 1;
    const panelW = 228;
    const panelH = 244;
    const debugStack = this.debugOverlayStack ?? createBottomRightDebugPanelStack(renderer);
    const panelRect = drawStackedDebugPanel(renderer, debugStack, panelW, panelH, 'Telemetry Overlay', [
      `state=${this.gameState}`,
      `fps=${this.telemetry.avgFps.toFixed(1)} raw=${this.telemetry.rawFps.toFixed(1)}`,
      `playerSpeed=${this.telemetry.playerSpeed.toFixed(2)}`,
      `maxSpeed=${this.telemetry.maxPlayerSpeed.toFixed(2)}`,
      `objects=${objectCount} coresRemaining=${remainingCores}`,
      `collisions=${this.telemetry.collisionsTotal}`,
      `actions=${this.telemetry.actionEvents}`,
      `stateTransitions=${this.telemetry.stateTransitions}`,
    ]);

    drawTelemetrySparkline(
      renderer,
      panelRect.x + 12,
      panelRect.y + panelRect.height - 44,
      panelW - 24,
      30,
      this.telemetry.speedHistory,
      '#38bdf8'
    );
  }
}

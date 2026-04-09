/*
Toolbox Aid
David Quesenberry
03/24/2026
ProjectileLabModel.js
*/
import { spawnProjectile, updateProjectiles } from '/src/engine/systems/index.js';

const PRESET_ORDER = ['single', 'fast', 'slow', 'burst', 'angled'];

const PRESETS = {
  single: {
    label: 'Single Shot',
    description: 'Balanced baseline projectile for travel and cleanup checks.',
    cooldown: 0.18,
    spawn(originX, originY) {
      return [{
        x: originX,
        y: originY,
        width: 18,
        height: 10,
        velocityX: 420,
        velocityY: 0,
        life: 1.55,
        color: '#fbbf24',
      }];
    },
  },
  fast: {
    label: 'Fast Short-Life',
    description: 'High speed with quick expiry to validate cleanup under pressure.',
    cooldown: 0.1,
    spawn(originX, originY) {
      return [{
        x: originX,
        y: originY,
        width: 16,
        height: 8,
        velocityX: 720,
        velocityY: 0,
        life: 0.55,
        color: '#fb7185',
      }];
    },
  },
  slow: {
    label: 'Slow Long-Life',
    description: 'Low speed and extended lifetime for long-run stability checks.',
    cooldown: 0.26,
    spawn(originX, originY) {
      return [{
        x: originX,
        y: originY,
        width: 20,
        height: 12,
        velocityX: 180,
        velocityY: 0,
        life: 3.2,
        color: '#34d399',
      }];
    },
  },
  burst: {
    label: 'Burst',
    description: 'Three-shot spread for repeated spawning and cleanup density.',
    cooldown: 0.32,
    spawn(originX, originY) {
      return [
        { x: originX, y: originY - 14, width: 14, height: 8, velocityX: 420, velocityY: -70, life: 1.2, color: '#60a5fa' },
        { x: originX, y: originY, width: 14, height: 8, velocityX: 440, velocityY: 0, life: 1.2, color: '#fbbf24' },
        { x: originX, y: originY + 14, width: 14, height: 8, velocityX: 420, velocityY: 70, life: 1.2, color: '#c084fc' },
      ];
    },
  },
  angled: {
    label: 'Angled Shot',
    description: 'Launches diagonally to demonstrate multi-axis projectile travel.',
    cooldown: 0.18,
    spawn(originX, originY) {
      return [{
        x: originX,
        y: originY,
        width: 16,
        height: 10,
        velocityX: 360,
        velocityY: -180,
        life: 1.8,
        color: '#f472b6',
      }];
    },
  },
};

function createBounds(width, height) {
  return {
    x: 72,
    y: 150,
    width: 492,
    height: height - 234,
  };
}

function createLauncher(bounds) {
  return {
    x: bounds.x + 44,
    y: bounds.y + (bounds.height / 2) - 24,
    width: 48,
    height: 48,
  };
}

export default class ProjectileLabModel {
  constructor({ width = 960, height = 540 } = {}) {
    this.width = width;
    this.height = height;
    this.bounds = createBounds(width, height);
    this.launcher = createLauncher(this.bounds);
    this.projectiles = [];
    this.totalFired = 0;
    this.elapsedSeconds = 0;
    this.fireCooldown = 0;
    this.selectedPresetId = PRESET_ORDER[0];
    this.statusMessage = 'Select a preset and fire to compare projectile behavior.';
  }

  reset() {
    this.projectiles = [];
    this.totalFired = 0;
    this.elapsedSeconds = 0;
    this.fireCooldown = 0;
    this.selectedPresetId = PRESET_ORDER[0];
    this.statusMessage = 'Select a preset and fire to compare projectile behavior.';
  }

  getPresetIds() {
    return [...PRESET_ORDER];
  }

  getSelectedPreset() {
    return PRESETS[this.selectedPresetId];
  }

  selectPreset(presetId) {
    if (!PRESETS[presetId]) {
      return false;
    }

    this.selectedPresetId = presetId;
    this.statusMessage = `Preset: ${PRESETS[presetId].label}`;
    return true;
  }

  update(dt, controls = {}) {
    const safeDt = Math.max(0, Number(dt) || 0);
    this.elapsedSeconds += safeDt;
    this.fireCooldown = Math.max(0, this.fireCooldown - safeDt);

    if (controls.resetPressed) {
      const selectedPresetId = this.selectedPresetId;
      this.reset();
      this.selectedPresetId = selectedPresetId;
      this.statusMessage = `Reset to ${this.getSelectedPreset().label}.`;
      return;
    }

    if (controls.presetPressed) {
      this.selectPreset(controls.presetPressed);
    }

    if (controls.fireDown && this.fireCooldown <= 0) {
      this.fireSelectedPreset();
    }

    updateProjectiles(this.projectiles, safeDt, this.bounds);
  }

  fireSelectedPreset() {
    const preset = this.getSelectedPreset();
    const originX = this.launcher.x + this.launcher.width;
    const originY = this.launcher.y + (this.launcher.height / 2) - 5;
    const projectiles = preset.spawn(originX, originY);

    projectiles.forEach((projectile) => {
      spawnProjectile(this.projectiles, projectile);
    });

    this.totalFired += projectiles.length;
    this.fireCooldown = preset.cooldown;
    this.statusMessage = `${preset.label} fired.`;
  }
}

export { PRESET_ORDER, PRESETS };

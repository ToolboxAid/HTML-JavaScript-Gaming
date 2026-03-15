// ToolboxAid.com
// David Quesenberry
// global.js
// 03/15/2026

export const canvasConfig = {
  width: 1024,
  height: 768,
  scale: 0.35,
  backgroundColor: '#24114d',
  borderColor: '#ed9700',
  borderSize: 15,
};

export const uiFont = Object.freeze({
  display: 'Segoe UI',
  ui: 'Segoe UI',
  mono: 'monospace'
});

export const fullscreenConfig = {
  color: '#ed9700',
  font: `28px ${uiFont.ui}`,
  text: 'Click the canvas to toggle fullscreen.',
  x: 220,
  y: 730
};

export const performanceConfig = {
  show: true,
  size: 18,
  font: uiFont.mono,
  colorLow: 'green',
  colorMed: '#ed9700',
  colorHigh: '#ff5f57',
  backgroundColor: '#999999cc',
  x: 50,
  y: 600,
};

export const particleSampleUi = {
  page: {
    title: 'Particle',
    subtitle: 'Timed explosion waves using the engine particle renderer in a refreshed sample shell.'
  },
  theme: {
    panelX: 36,
    panelY: 36,
    panelWidth: 952,
    panelHeight: 696,
    panelBorderSize: 4,
    panelColor: '#2b1658',
    panelBorderColor: '#ed9700',
    panelBackdrop: '#140826'
  },
  canvasText: {
    title: 'Particle Waves',
    subtitle: 'Repeating circle and square explosions driven by the engine renderer.',
    help: 'Wave timing is automatic. Watch particle size, spread, and cleanup.',
    titleY: 103,
    subtitleY: 148,
    helpY: 174,
    colors: {
      textPrimary: '#ffffff',
      textSecondary: '#f3d8ab',
      muted: '#cdbbe9'
    }
  },
  wave: [
    { x: 200, y: 350, startRadius: 0, endRadius: 50, durationSeconds: 1.5 },
    { x: 300, y: 350, startRadius: 0, endRadius: 50, durationSeconds: 3.5, particleRadius: 1.5 },
    { x: 500, y: 350, startRadius: 0, endRadius: 10, durationSeconds: 1.5, particleRadius: 1.5 },
    { x: 600, y: 350, startRadius: 10, endRadius: 60, durationSeconds: 4.5, particleRadius: 2.5, shape: 'square' },
    { x: 750, y: 350, startRadius: 8, endRadius: 110, durationSeconds: 2.4, particleRadius: 2.0 },
    { x: 400, y: 450, startRadius: 2, endRadius: 100, durationSeconds: 1.5, particleRadius: 2.5 },
    { x: 700, y: 550, startRadius: 4, endRadius: 200, durationSeconds: 1.5, particleRadius: 1.5 }
  ]
};

export const particleSampleConfig = {
  explosionIntervalMs: 4000
};

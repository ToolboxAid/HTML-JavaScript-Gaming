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
  x: 14,
  y: 300,
};

export const particleSampleUi = {
  page: {
    title: 'Particle',
    subtitle: 'Timed explosion waves using the engine particle renderer in a refreshed sample shell.'
  }
};


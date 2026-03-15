// ToolboxAid.com
// David Quesenberry
// global.js
// 03/15/2026

export const canvasConfig = {
  width: 1024,
  height: 768,
  scale: 400 / 1024,
  backgroundColor: '#030611',
  borderColor: '#ed9700',
  borderSize: 10,
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
  x: 210,
  y: 730
};

export const solarSystemUi = {
  page: {
    title: 'Solar System',
    subtitle: 'Orbit simulation, camera focus, and engine-driven state flow in one sample shell.'
  }
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

export const solarSystemConfig = {
  meta: {
    title: "Solar System Sample",
    subtitle: "Orbit simulation built with engine classes"
  },
  states: {
    attract: "attract",
    simulation: "simulation",
    paused: "paused"
  },
  simulation: {
    sunRadius: 30,
    speedMultiplier: 1,
    minSpeedMultiplier: 0.25,
    maxSpeedMultiplier: 5,
    speedStep: 0.25,
    zoomDefault: 1,
    minZoom: 0.5,
    maxZoom: 2.5,
    zoomStep: 0.1
  },
  controls: {
    startKeys: ["Enter", "NumpadEnter", "Space"],
    pauseKeys: ["KeyP"],
    resetKeys: ["KeyR"],
    speedUpKeys: ["Equal", "NumpadAdd"],
    speedDownKeys: ["Minus", "NumpadSubtract"],
    toggleOrbitKeys: ["KeyO"],
    toggleLabelKeys: ["KeyL"],
    zoomInKeys: ["BracketRight"],
    zoomOutKeys: ["BracketLeft"],
    focusNextKeys: ["Period"],
    focusPrevKeys: ["Comma"]
  },
  display: {
    orbitStroke: "rgba(170, 180, 200, 0.35)",
    moonColor: "white",
    hudColor: "#dfe7f5",
    hudAccentColor: "#8ec5ff",
    hudMutedColor: "#9fb0c9",
    labelColor: "#f7f3b2"
  }
};

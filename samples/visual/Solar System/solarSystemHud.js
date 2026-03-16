// ToolboxAid.com
// David Quesenberry
// solarSystemHud.js
// 03/15/2026

import CanvasUtils from '../../../engine/core/canvasUtils.js';
import { solarSystemConfig, uiFont } from './global.js';
import { getActiveBodies, getFocusedBody, getFocusLabel, renderBodies } from './solarSystemRuntime.js';

export function drawHudLine(text, x, y, color = solarSystemConfig.display.hudColor, size = 24) {
  const ctx = CanvasUtils.ctx;
  ctx.fillStyle = color;
  ctx.font = `${size}px ${uiFont.ui}`;
  ctx.fillText(text, x, y);
}

export function renderAttractHud() {
  drawHudLine(solarSystemConfig.meta.title, 28, 44, solarSystemConfig.display.hudAccentColor, 30);
  drawHudLine(solarSystemConfig.meta.subtitle, 28, 76, solarSystemConfig.display.hudMutedColor, 18);
  drawHudLine('Press Enter or Space to start the simulation', 28, 122);
  drawHudLine('Press P to pause once running', 28, 152, solarSystemConfig.display.hudMutedColor, 18);
  drawHudLine('O: orbits  L: labels  [ ]: zoom  < >: focus', 28, 178, solarSystemConfig.display.hudMutedColor, 18);
}

export function renderPausedHud() {
  drawHudLine('Paused', 28, 44, solarSystemConfig.display.hudAccentColor, 30);
  drawHudLine('Press P to resume', 28, 80);
  drawHudLine('R: reset  +/-: speed  O: orbits  L: labels', 28, 110, solarSystemConfig.display.hudMutedColor, 18);
}

export function renderSimulationHud(simulationSpeed, focusLabel, zoom, showOrbits, showLabels) {
  drawHudLine('Simulation running', 28, 38, solarSystemConfig.display.hudAccentColor, 22);
  drawHudLine(`Speed: ${simulationSpeed.toFixed(2)}x`, 28, 66, solarSystemConfig.display.hudMutedColor, 16);
  drawHudLine(`Focus: ${focusLabel}  Zoom: ${zoom.toFixed(2)}x`, 28, 88, solarSystemConfig.display.hudMutedColor, 16);
  drawHudLine(`Orbits: ${showOrbits ? 'on' : 'off'}  Labels: ${showLabels ? 'on' : 'off'}`, 28, 110, solarSystemConfig.display.hudMutedColor, 16);
  drawHudLine('P: pause  R: reset  +/-: speed  O: orbits  L: labels  [ ]: zoom  < >: focus', 28, 132, solarSystemConfig.display.hudMutedColor, 14);
}

function renderScene(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels) {
  const activeBodies = getActiveBodies(gameObjectSystem);
  renderBodies(activeBodies, focusIndex, zoom, showOrbits, showLabels);
  return activeBodies;
}

export function renderAttractScreen(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels) {
  renderScene(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels);
  renderAttractHud();
}

export function renderPausedScreen(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels) {
  renderScene(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels);
  renderPausedHud();
}

export function renderSimulationScreen(gameObjectSystem, simulationSpeed, focusIndex, zoom, showOrbits, showLabels) {
  const activeBodies = renderScene(gameObjectSystem, focusIndex, zoom, showOrbits, showLabels);
  renderSimulationHud(
    simulationSpeed,
    getFocusLabel(getFocusedBody(activeBodies, focusIndex)),
    zoom,
    showOrbits,
    showLabels
  );
}


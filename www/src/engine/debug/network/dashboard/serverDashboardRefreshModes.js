/*
Toolbox Aid
David Quesenberry
04/06/2026
serverDashboardRefreshModes.js
*/

import { asNumber, asObject, sanitizeText } from "../shared/networkDebugUtils.js";

export const SERVER_DASHBOARD_REFRESH_MODES = Object.freeze({
  MANUAL: "manual",
  NORMAL: "normal",
  FAST: "fast"
});

const DEFAULT_MODE = SERVER_DASHBOARD_REFRESH_MODES.NORMAL;

const MODE_DEFINITIONS = Object.freeze({
  [SERVER_DASHBOARD_REFRESH_MODES.MANUAL]: Object.freeze({
    mode: SERVER_DASHBOARD_REFRESH_MODES.MANUAL,
    intervalMs: 0,
    label: "Manual"
  }),
  [SERVER_DASHBOARD_REFRESH_MODES.NORMAL]: Object.freeze({
    mode: SERVER_DASHBOARD_REFRESH_MODES.NORMAL,
    intervalMs: 1000,
    label: "Normal"
  }),
  [SERVER_DASHBOARD_REFRESH_MODES.FAST]: Object.freeze({
    mode: SERVER_DASHBOARD_REFRESH_MODES.FAST,
    intervalMs: 250,
    label: "Fast"
  })
});

export function listServerDashboardRefreshModes() {
  return Object.keys(MODE_DEFINITIONS);
}

export function normalizeServerDashboardRefreshMode(mode, fallback = DEFAULT_MODE) {
  const normalizedFallback = sanitizeText(fallback).toLowerCase();
  const fallbackMode = MODE_DEFINITIONS[normalizedFallback] ? normalizedFallback : DEFAULT_MODE;
  const normalizedMode = sanitizeText(mode).toLowerCase();
  return MODE_DEFINITIONS[normalizedMode] ? normalizedMode : fallbackMode;
}

export function getServerDashboardRefreshModeDefinition(mode, options = {}) {
  const source = asObject(options);
  const normalizedMode = normalizeServerDashboardRefreshMode(mode);
  const definition = MODE_DEFINITIONS[normalizedMode] || MODE_DEFINITIONS[DEFAULT_MODE];
  const customInterval = asNumber(source.intervalMs, definition.intervalMs);
  const intervalMs = normalizedMode === SERVER_DASHBOARD_REFRESH_MODES.MANUAL
    ? 0
    : Math.max(250, Math.floor(customInterval));

  return {
    mode: definition.mode,
    intervalMs,
    label: definition.label
  };
}

export function resolveServerDashboardRefreshIntervalMs(mode, options = {}) {
  const source = asObject(options);
  const modeOptions = asObject(source.modes);
  const normalizedMode = normalizeServerDashboardRefreshMode(mode, source.fallbackMode);
  const perModeOptions = asObject(modeOptions[normalizedMode]);
  return getServerDashboardRefreshModeDefinition(normalizedMode, {
    intervalMs: perModeOptions.intervalMs
  }).intervalMs;
}

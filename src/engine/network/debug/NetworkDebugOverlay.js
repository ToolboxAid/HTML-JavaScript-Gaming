/*
Toolbox Aid
David Quesenberry
03/22/2026
NetworkDebugOverlay.js
*/
import { drawPanel } from '../../debug/index.js';

export function drawNetworkDebugOverlay(renderer, layer, {
  x = 610,
  y = 40,
  width = 300,
  height = 220,
  title = 'Network Overlay',
} = {}) {
  const state = layer.getState();
  drawPanel(renderer, x, y, width, height, title, [
    `State: ${state.connectionState}`,
    `Player: ${state.playerId}`,
    `Session: ${state.sessionId}`,
    `Ping: ${state.pingMs}ms`,
    `Sent: ${state.sent}`,
    `Received: ${state.received}`,
    `Dropped: ${state.dropped}`,
    `Last Message: ${state.lastMessageType}`,
  ]);
}

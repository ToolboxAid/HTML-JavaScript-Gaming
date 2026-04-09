/*
Toolbox Aid
David Quesenberry
04/09/2026
PromotionGatePanel.js
*/

import { drawPanel } from '../DebugPanel.js';

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function resolvePromotionStatus(source) {
  const snapshot = asObject(source);
  const evaluation = asObject(snapshot.lastEvaluation);
  const status = asObject(snapshot.status);
  const handoff = asObject(status.handoff).toMode ? status.handoff : asObject(evaluation.handoff);
  const abort = asObject(status.abort).decisionPath ? status.abort : asObject(evaluation.abort);
  const mode = typeof status.mode === 'string' && status.mode
    ? status.mode
    : (typeof evaluation.mode === 'string' && evaluation.mode ? evaluation.mode : 'passive');
  return {
    mode,
    handoff,
    abort,
    reason: String(snapshot.lastReason || evaluation.reason || ''),
    stability: asObject(evaluation.stability)
  };
}

export function getPromotionGatePanelLines(promotionState) {
  const status = resolvePromotionStatus(promotionState);
  const handoffLabel = status.handoff.toMode
    ? `${String(status.handoff.fromMode || 'passive')} -> ${String(status.handoff.toMode)}`
    : 'n/a';
  const abortVisible = status.abort.rollbackTriggered === true || status.abort.aborted === true;
  const abortLabel = abortVisible
    ? `${status.abort.aborted === true ? 'ABORTED' : 'VISIBLE'} (${String(status.abort.reason || 'rollback')})`
    : 'no';

  return [
    `Mode: ${status.mode}`,
    `Handoff: ${handoffLabel}`,
    `Abort: ${abortLabel}`,
    `Stable: ${Number(status.stability.currentFrames || 0)}/${Number(status.stability.requiredFrames || 0)}`,
    `Reason: ${status.reason || 'n/a'}`
  ];
}

export function drawPromotionGatePanel(renderer, promotionState, {
  x = 620,
  y = 184,
  width = 300,
  height = 146,
  title = 'Promotion Gate'
} = {}) {
  drawPanel(renderer, x, y, width, height, title, getPromotionGatePanelLines(promotionState));
}

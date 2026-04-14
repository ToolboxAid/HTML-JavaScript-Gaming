/*
Toolbox Aid
David Quesenberry
03/22/2026
ClientPredictionReconciliationScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { PredictionReconciler } from '/src/engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class ClientPredictionReconciliationScene extends Scene {
  constructor() {
    super();
    this.reconciler = new PredictionReconciler({
      applyInput: (state, input) => ({ ...state, x: state.x + input.dx, y: state.y }),
    });
    this.reset();
  }

  reset() {
    this.reconciler.setState({ x: 120, y: 290 });
    this.lastResult = null;
    this.status = 'Predict a move, then apply an authoritative correction.';
  }

  predictMove() {
    this.lastResult = this.reconciler.predict({ dx: 32 });
    this.status = 'Local client moved immediately using prediction.';
  }

  applyAuthority() {
    const result = this.reconciler.reconcile({ x: 140, y: 290 }, 1);
    this.lastResult = result;
    this.status = result.corrected
      ? `Authoritative correction applied and ${result.replayedInputs} input(s) replayed.`
      : 'Authoritative state already matched prediction.';
  }

  render(renderer) {
    const state = this.reconciler.getState();
    drawFrame(renderer, theme, [
      'Engine Sample 1304',
      'Prediction keeps local movement immediate while reconciliation pulls back to authority.',
      this.status,
    ]);
    renderer.drawRect(120, 230, 600, 120, '#0f172a');
    renderer.drawRect(state.x, state.y, 38, 38, '#f59e0b');
    drawPanel(renderer, 640, 40, 250, 180, 'Prediction', [
      `Client X: ${Math.round(state.x)}`,
      `Corrected: ${this.lastResult?.corrected ?? false}`,
      `Replayed: ${this.lastResult?.replayedInputs ?? 0}`,
      `Seq: ${this.reconciler.sequence}`,
    ]);
  }
}

/*
Toolbox Aid
David Quesenberry
03/22/2026
RollbackReplayDiagnosticsScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { PredictionReconciler, RollbackDiagnostics } from '../../../engine/network/index.js';

const theme = new Theme(ThemeTokens);

export default class RollbackReplayDiagnosticsScene extends Scene {
  constructor() {
    super();
    this.reconciler = new PredictionReconciler({
      applyInput: (state, input) => ({ ...state, x: state.x + input.dx }),
    });
    this.diagnostics = new RollbackDiagnostics();
    this.reset();
  }

  reset() {
    this.reconciler.setState({ x: 140, y: 290 });
    this.diagnostics = new RollbackDiagnostics();
    this.frame = 0;
    this.status = 'Predict twice, then apply a rollback correction.';
  }

  predictTwice() {
    this.reconciler.predict({ dx: 24 });
    this.reconciler.predict({ dx: 24 });
    this.status = 'Two local inputs predicted ahead of authority.';
  }

  rollback() {
    this.frame += 1;
    const result = this.reconciler.reconcile({ x: 152, y: 290 }, 1);
    this.diagnostics.record({
      frame: this.frame,
      corrected: result.corrected,
      replayedInputs: result.replayedInputs,
      before: result.before,
      after: result.state,
    });
    this.status = `Rollback recorded with ${result.replayedInputs} replayed input(s).`;
  }

  render(renderer) {
    const state = this.reconciler.getState();
    const summary = this.diagnostics.getSummary();
    drawFrame(renderer, theme, [
      'Engine Sample158',
      'Rollback diagnostics expose correction and replay behavior for multiplayer validation.',
      this.status,
    ]);
    renderer.drawRect(100, 230, 600, 130, '#0f172a');
    renderer.drawRect(state.x, state.y, 34, 34, '#ef4444');
    drawPanel(renderer, 620, 40, 270, 220, 'Rollback Summary', [
      `Corrections: ${summary.corrections}`,
      `Replayed Inputs: ${summary.replayedInputs}`,
      `Events: ${summary.events.length}`,
      ...(summary.events.slice(-3).map((event) => `F${event.frame}: replay ${event.replayedInputs}`)),
    ]);
  }
}

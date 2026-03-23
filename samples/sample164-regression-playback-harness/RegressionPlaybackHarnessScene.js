/*
Toolbox Aid
David Quesenberry
03/22/2026
RegressionPlaybackHarnessScene.js
*/
import { Scene } from '../../engine/scenes/index.js'; import { drawFrame, drawPanel } from '../../engine/debug/index.js'; import { Theme, ThemeTokens } from '../../engine/theme/index.js'; import { RegressionPlaybackHarness } from '../../engine/automation/index.js';
const theme = new Theme(ThemeTokens);
export default class RegressionPlaybackHarnessScene extends Scene {
  constructor() { super(); this.harness = new RegressionPlaybackHarness(); this.harness.register('run-right', [{ x: 140 }, { x: 180 }, { x: 220 }, { x: 260 }]); this.frames = []; this.index = 0; this.actorX = 140; this.status = 'Play a stored regression path.'; }
  play() { this.frames = this.harness.play('run-right'); this.index = 0; this.status = 'Regression playback started.'; }
  update() { if (this.frames[this.index]) { this.actorX = this.frames[this.index].x; this.index += 1; } }
  render(renderer) { drawFrame(renderer, theme, ['Engine Sample164', 'Regression playback turns prior scenarios into repeatable validation assets.', this.status]); renderer.drawRect(100, 250, 500, 80, '#0f172a'); renderer.drawRect(this.actorX, 275, 28, 28, '#34d399'); drawPanel(renderer, 640, 40, 220, 150, 'Playback', [`Frames: ${this.frames.length}`, `Index: ${this.index}`]); }
}

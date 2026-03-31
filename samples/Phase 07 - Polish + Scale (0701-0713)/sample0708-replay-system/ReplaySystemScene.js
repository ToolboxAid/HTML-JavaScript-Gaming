/*
Toolbox Aid
David Quesenberry
03/22/2026
ReplaySystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { ReplaySystem } from '../../../engine/replay/index.js';

const theme = new Theme(ThemeTokens);

export default class ReplaySystemScene extends Scene {
  constructor() {
    super();
    this.actor = { x: 120, y: 280, width: 34, height: 34 };
    this.replay = new ReplaySystem();
  }

  update(dt, engine) {
    if (engine.input.isActionPressed('record')) {
      this.actor.x = 120;
      this.replay.startRecording();
    }

    if (this.replay.recording) {
      this.actor.x += 140 * dt;
      this.replay.recordFrame({ x: this.actor.x });
      if (this.actor.x >= 760) {
        this.replay.stopRecording();
        this.replay.startPlayback();
        this.actor.x = 120;
      }
    } else if (this.replay.playing) {
      const frame = this.replay.nextFrame();
      if (frame) {
        this.actor.x = frame.x;
      }
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample116',
      'Replay capture and playback are engine-owned instead of scene-specific recording hacks.',
      'Press R to record a short run and watch playback.',
    ]);
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#34d399');
    drawPanel(renderer, 620, 34, 300, 126, 'Replay System', [
      `Recording: ${this.replay.recording}`,
      `Playing: ${this.replay.playing}`,
      `Frames: ${this.replay.frames.length}`,
      'Recorded motion replays deterministically.',
    ]);
  }
}

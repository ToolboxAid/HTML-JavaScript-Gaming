/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { AnimationController } from '/src/engine/animation/index.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-02/0207/sample-0207-sprite-editor.json';

export default class AnimationSystemScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.actor = { x: 180, y: 300, width: 60, height: 60, speed: 260 };
    this.animation = new AnimationController({
      animations: {
        idle: {
          frameDuration: 0.45,
          frames: [{ color: '#7dd3fc', spriteFrame: 'idle_0' }, { color: '#60a5fa', spriteFrame: 'idle_1' }],
        },
        move: {
          frameDuration: 0.12,
          frames: [
            { color: '#34d399', spriteFrame: 'move_0' },
            { color: '#10b981', spriteFrame: 'move_1' },
            { color: '#059669', spriteFrame: 'move_2' }
          ],
        },
      },
      initial: 'idle',
    });
    this.spriteProject = null;
    this.spriteStatus = 'loading';
    this.spriteError = '';
    void this.loadSpriteProject();
  }

  async loadSpriteProject() {
    try {
      this.spriteProject = await loadSpriteProjectPreset(SPRITE_PRESET_PATH);
      this.spriteStatus = 'loaded';
      this.spriteError = '';
    } catch (error) {
      this.spriteProject = null;
      this.spriteStatus = 'fallback';
      this.spriteError = error instanceof Error ? error.message : 'unknown preset error';
    }
  }

  resolveFrameIndex(frameName) {
    const frameMap = {
      idle_0: 0,
      idle_1: 1,
      move_0: 2,
      move_1: 3,
      move_2: 4
    };
    const numericIndex = frameMap[frameName];
    if (!Number.isInteger(numericIndex)) {
      return 0;
    }
    if (!this.spriteProject || !Array.isArray(this.spriteProject.frames) || this.spriteProject.frames.length === 0) {
      return numericIndex;
    }
    return numericIndex % this.spriteProject.frames.length;
  }

  update(dt, engine) {
    let moving = false;
    const move = this.actor.speed * dt;

    if (engine.input.isDown('ArrowLeft')) { this.actor.x -= move; moving = true; }
    if (engine.input.isDown('ArrowRight')) { this.actor.x += move; moving = true; }
    if (engine.input.isDown('ArrowUp')) { this.actor.y -= move; moving = true; }
    if (engine.input.isDown('ArrowDown')) { this.actor.y += move; moving = true; }

    this.actor.x = clamp(this.actor.x, this.bounds.x, this.bounds.x + this.bounds.width - this.actor.width);
    this.actor.y = clamp(this.actor.y, this.bounds.y, this.bounds.y + this.bounds.height - this.actor.height);

    this.animation.play(moving ? 'move' : 'idle');
    this.animation.update(dt);
  }

  render(renderer) {
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0207-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;
    drawFrame(renderer, theme, [
      'Engine Sample 0207',
      'Demonstrates animation playback with idle and move states',
      'This sample and Sprite Editor load the same sample-0207-sprite-editor.json source',
      'Use Arrow keys to move the actor and switch animation state',
      `Current animation: ${this.animation.getStateName()}`,
      presetStatus
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    const frame = this.animation.getFrame() || { color: theme.getColor('actorFill') };
    if (this.spriteProject) {
      const frameName = typeof frame.spriteFrame === 'string' ? frame.spriteFrame : 'idle_0';
      const pixelSize = Math.max(2, Math.floor(this.actor.width / this.spriteProject.width));
      drawSpriteProjectFrame(renderer, this.spriteProject, this.resolveFrameIndex(frameName), {
        x: this.actor.x,
        y: this.actor.y,
        pixelSize
      });
      renderer.drawText(this.animation.getStateName(), this.actor.x + ((this.spriteProject.width * pixelSize) / 2), this.actor.y + (this.spriteProject.height * pixelSize) + 14, {
        color: '#ffffff',
        font: '12px sans-serif',
        align: 'center',
      });
    } else {
      renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, frame.color);
      renderer.strokeRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#ffffff', 1);
    }

    drawPanel(renderer, 640, 184, 280, 126, 'Animation State', [
      `State: ${this.animation.getStateName()}`,
      `Frame color: ${frame.color}`,
      this.spriteProject ? 'Source: sample-0207-sprite-editor.json' : 'Idle = slower loop',
      this.spriteProject ? 'Move sample frame set is active' : 'Move = faster loop',
    ]);
  }
}

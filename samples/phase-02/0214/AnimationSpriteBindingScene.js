/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationSpriteBindingScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { AnimationController } from '/src/engine/animation/index.js';
import { renderSpriteReadyEntities } from '/src/engine/rendering/index.js';
import { drawSpriteProjectFrame, loadSpriteProjectPreset } from '/samples/shared/spritePresetRuntime.js';

const theme = new Theme(ThemeTokens);
const SPRITE_PRESET_PATH = '/samples/phase-02/0214/sample-0214-sprite-editor.json';

export default class AnimationSpriteBindingScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.actor = { x: 180, y: 290, width: 60, height: 60, label: 'actor', speed: 260 };
    this.animation = new AnimationController({
      animations: {
        idle: { frameDuration: 0.45, frames: [{ id: 'idle-0', color: '#7dd3fc' }, { id: 'idle-1', color: '#60a5fa' }] },
        move: { frameDuration: 0.12, frames: [{ id: 'move-0', color: '#34d399' }, { id: 'move-1', color: '#10b981' }, { id: 'move-2', color: '#059669' }] },
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

  resolvePresetFrameIndex(animationFrameId) {
    if (!this.spriteProject || !Array.isArray(this.spriteProject.frames) || this.spriteProject.frames.length === 0) {
      return 0;
    }
    const match = String(animationFrameId || '').match(/(\d+)$/);
    const numericIndex = match ? Number.parseInt(match[1], 10) : 0;
    return Math.max(0, numericIndex) % this.spriteProject.frames.length;
  }

  update(dt, engine) {
    let moving = false
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
    const frame = this.animation.getFrame() || { id: 'fallback', color: theme.getColor('actorFill') };
    const presetStatus = this.spriteStatus === 'loaded'
      ? 'Sprite preset loaded from sample-0214-sprite-editor.json'
      : this.spriteStatus === 'loading'
        ? 'Loading shared sprite preset...'
        : `Sprite preset unavailable (${this.spriteError || 'using fallback'})`;

    drawFrame(renderer, theme, [
      'Engine Sample 0214',
      'Demonstrates binding animation state to sprite-frame-like output',
      'Use Arrow keys to move and switch between animation frame sets',
      `Frame id: ${frame.id}`,
      'This sample and Sprite Editor load the same sample-0214-sprite-editor.json source',
      presetStatus
    ]);

    if (this.spriteProject) {
      const frameIndex = this.resolvePresetFrameIndex(frame.id);
      const pixelSize = Math.max(2, Math.floor(this.actor.height / this.spriteProject.height));
      drawSpriteProjectFrame(renderer, this.spriteProject, frameIndex, {
        x: this.actor.x,
        y: this.actor.y,
        pixelSize
      });
      renderer.drawText(this.actor.label, this.actor.x + ((this.spriteProject.width * pixelSize) / 2), this.actor.y + (this.spriteProject.height * pixelSize) + 20, {
        color: '#d8d5ff',
        font: '14px monospace',
        textAlign: 'center'
      });
    } else {
      renderSpriteReadyEntities(renderer, [{
        ...this.actor,
        spriteColor: frame.color,
      }], { label: true, labelOffsetY: 82 });
    }

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    drawPanel(renderer, 620, 184, 300, 126, 'Animation Binding', [
      `State: ${this.animation.getStateName()}`,
      `Frame: ${frame.id}`,
      this.spriteProject ? 'Rendering preset frame pixels' : `Color fallback: ${frame.color}`,
      'Source: sample-0214-sprite-editor.json',
    ]);
  }
}

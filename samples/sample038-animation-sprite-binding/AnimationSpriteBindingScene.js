/*
Toolbox Aid
David Quesenberry
03/21/2026
AnimationSpriteBindingScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { AnimationController } from '../../engine/animation/index.js';
import { renderSpriteReadyEntities } from '../../engine/render/index.js';

const theme = new Theme(ThemeTokens);

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

    drawFrame(renderer, theme, [
      'Engine Sample38',
      'Demonstrates binding animation state to sprite-frame-like output',
      'Use Arrow keys to move and switch between animation frame sets',
      `Frame id: ${frame.id}`,
      'This sample connects animation output to the render path',
    ]);

    renderSpriteReadyEntities(renderer, [{
      ...this.actor,
      spriteColor: frame.color,
    }], { label: true, labelOffsetY: 82 });

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    drawPanel(renderer, 620, 184, 300, 126, 'Animation Binding', [
      `State: ${this.animation.getStateName()}`,
      `Frame: ${frame.id}`,
      `Color: ${frame.color}`,
      'Next step: atlas frame lookup',
    ]);
  }
}

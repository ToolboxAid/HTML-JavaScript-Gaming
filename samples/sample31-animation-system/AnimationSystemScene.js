import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { clamp } from '../../engine/utils/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { AnimationController } from '../../engine/animation/index.js';

const theme = new Theme(ThemeTokens);

export default class AnimationSystemScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.actor = { x: 180, y: 300, width: 60, height: 60, speed: 260 };
    this.animation = new AnimationController({
      animations: {
        idle: {
          frameDuration: 0.45,
          frames: [{ color: '#7dd3fc' }, { color: '#60a5fa' }],
        },
        move: {
          frameDuration: 0.12,
          frames: [{ color: '#34d399' }, { color: '#10b981' }, { color: '#059669' }],
        },
      },
      initial: 'idle',
    });
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
    drawFrame(renderer, theme, [
      'Engine V2 Sample31',
      'Demonstrates animation playback with idle and move states',
      'Use Arrow keys to move the actor and switch animation state',
      `Current animation: ${this.animation.getStateName()}`,
      'This sample establishes the engine animation controller boundary',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    const frame = this.animation.getFrame() || { color: theme.getColor('actorFill') };
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, frame.color);
    renderer.strokeRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, '#ffffff', 1);

    drawPanel(renderer, 640, 184, 280, 126, 'Animation State', [
      `State: ${this.animation.getStateName()}`,
      `Frame color: ${frame.color}`,
      'Idle = slower loop',
      'Move = faster loop',
    ]);
  }
}

/*
Toolbox Aid
David Quesenberry
03/21/2026
InteractionSystemScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { clamp } from '/src/engine/utils/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { findNearestInteractable, resolveInteraction } from '/src/engine/interaction/index.js';

const theme = new Theme(ThemeTokens);

export default class InteractionSystemScene extends Scene {
  constructor() {
    super();
    this.bounds = { x: 60, y: 170, width: 840, height: 300 };
    this.player = { x: 150, y: 280, width: 48, height: 48, speed: 250 };
    this.interactables = [
      { id: 'console', x: 260, y: 260, width: 60, height: 60, label: 'Console', active: false },
      { id: 'door', x: 540, y: 250, width: 70, height: 90, label: 'Door', active: false },
    ];
    this.lastInteractPressed = false;
    this.message = 'Move near an object and press KeyE.';
  }

  update(dt, engine) {
    const move = this.player.speed * dt;

    if (engine.input.isDown('ArrowLeft')) this.player.x -= move;
    if (engine.input.isDown('ArrowRight')) this.player.x += move;
    if (engine.input.isDown('ArrowUp')) this.player.y -= move;
    if (engine.input.isDown('ArrowDown')) this.player.y += move;

    this.player.x = clamp(this.player.x, this.bounds.x, this.bounds.x + this.bounds.width - this.player.width);
    this.player.y = clamp(this.player.y, this.bounds.y, this.bounds.y + this.bounds.height - this.player.height);

    const interactPressed = engine.input.isDown('KeyE');

    if (interactPressed && !this.lastInteractPressed) {
      resolveInteraction(this.player, this.interactables, (target) => {
        target.active = !target.active;
        this.message = `${target.label} toggled ${target.active ? 'on' : 'off'}.`;
      });
    }

    this.lastInteractPressed = interactPressed;
  }

  render(renderer) {
    const nearest = findNearestInteractable(this.player, this.interactables, 90);

    drawFrame(renderer, theme, [
      'Engine Sample 0209',
      'Demonstrates prompt-based interactions using engine interaction helpers',
      'Use Arrow keys to move near an object, then press KeyE',
      `Nearest interactable: ${nearest ? nearest.label : 'none'}`,
      'This sample defines the interaction boundary for future gameplay systems',
    ]);

    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, '#d8d5ff', 3);

    this.interactables.forEach((item) => {
      const color = item.active ? '#34d399' : (nearest && nearest.id === item.id ? '#ffd166' : '#8888ff');
      renderer.drawRect(item.x, item.y, item.width, item.height, color);
      renderer.strokeRect(item.x, item.y, item.width, item.height, '#ffffff', 1);
      renderer.drawText(item.label, item.x - 6, item.y - 10, { color: '#ffffff', font: '14px monospace' });
    });

    renderer.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, theme.getColor('actorFill'));
    renderer.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height, '#ffffff', 1);

    drawPanel(renderer, 620, 184, 300, 126, 'Interaction', [
      'Action key: KeyE',
      `Message: ${this.message}`,
      `Prompt: ${nearest ? 'Press KeyE' : 'Move closer'}`,
    ]);
  }
}

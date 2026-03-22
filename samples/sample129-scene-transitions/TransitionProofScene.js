/*
Toolbox Aid
David Quesenberry
03/22/2026
TransitionProofScene.js
*/
import Scene from '../../engine/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class TransitionProofScene extends Scene {
  constructor({ label, color, controller, createNextScene } = {}) {
    super();
    this.label = label;
    this.color = color;
    this.controller = controller;
    this.createNextScene = createNextScene;
  }

  transition(engine) {
    this.controller.transitionTo(engine, {
      fromScene: this,
      toScene: this.createNextScene(),
      durationSeconds: 0.5,
    });
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample129',
      'Scene handoff uses a reusable transition controller and transition scene.',
      `Current scene: ${this.label}`,
    ]);

    renderer.drawRect(110, 210, 460, 190, this.color);
    drawPanel(renderer, 620, 34, 300, 150, 'Scene Transition', [
      `Current: ${this.label}`,
      'Use the button below to transition.',
      'The fade orchestration stays engine-owned.',
    ]);
  }
}

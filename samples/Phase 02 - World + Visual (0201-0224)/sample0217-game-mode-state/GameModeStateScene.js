/*
Toolbox Aid
David Quesenberry
03/21/2026
GameModeStateScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { GameModeState } from '/src/engine/game/index.js';

const theme = new Theme(ThemeTokens);

export default class GameModeStateScene extends Scene {
  constructor() {
    super();
    this.gameMode = new GameModeState('title');
    this.lastEnter = false;
    this.lastPause = false;
    this.lastWin = false;
    this.lastLose = false;
  }

  update(dt, engine) {
    const enterPressed = engine.input.isDown('Enter');
    const pausePressed = engine.input.isDown('KeyP');
    const winPressed = engine.input.isDown('KeyW');
    const losePressed = engine.input.isDown('KeyL');

    if (enterPressed && !this.lastEnter) {
      if (this.gameMode.is('title')) this.gameMode.setMode('play');
      else if (this.gameMode.is('win') || this.gameMode.is('lose')) this.gameMode.setMode('title');
    }

    if (pausePressed && !this.lastPause) {
      if (this.gameMode.is('play')) this.gameMode.setMode('pause');
      else if (this.gameMode.is('pause')) this.gameMode.setMode('play');
    }

    if (winPressed && !this.lastWin && this.gameMode.is('play')) {
      this.gameMode.setMode('win');
    }

    if (losePressed && !this.lastLose && this.gameMode.is('play')) {
      this.gameMode.setMode('lose');
    }

    this.lastEnter = enterPressed;
    this.lastPause = pausePressed;
    this.lastWin = winPressed;
    this.lastLose = losePressed;
  }

  render(renderer) {
    const mode = this.gameMode.getMode();

    drawFrame(renderer, theme, [
      'Engine  0217',
      'Demonstrates higher-level game mode flow outside per-entity state',
      'Enter starts or resets, KeyP toggles pause, KeyW wins, KeyL loses',
      `Current mode: ${mode}`,
      'This sample defines the runtime game-flow boundary for future titles',
    ]);

    const colorMap = {
      title: '#60a5fa',
      play: '#34d399',
      pause: '#fbbf24',
      win: '#22c55e',
      lose: '#f87171',
    };

    renderer.drawRect(260, 240, 420, 140, colorMap[mode] || '#8888ff');
    renderer.strokeRect(260, 240, 420, 140, '#ffffff', 2);
    renderer.drawText(mode.toUpperCase(), 430, 320, { color: '#ffffff', font: '28px monospace' });

    drawPanel(renderer, 620, 184, 300, 146, 'Game Modes', [
      'Enter: title -> play',
      'KeyP: play/pause',
      'KeyW: win',
      'KeyL: lose',
      'Enter on end state: reset',
    ]);
  }
}

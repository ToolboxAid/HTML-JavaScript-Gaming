/*
Toolbox Aid
David Quesenberry
03/25/2026
PlayerManager.js
*/
export default class PlayerManager {
  constructor({ world }) {
    this.world = world;
  }

  getHudSnapshot() {
    const player1Score = String(this.world.getPlayerScore(0)).padStart(4, '0');
    const player2Score = String(this.world.getPlayerScore(1)).padStart(4, '0');
    const hiScore = String(this.world.hiScore).padStart(4, '0');
    const blinkActive = Boolean(this.world.pendingTurnSwitch) || this.world.introBlinkTimer > 0;
    const blinkOff = blinkActive && !this.world.getPlayerSwapBlinkVisible();
    const blinkTargetIndex = this.world.getBlinkTargetIndex();

    return {
      player1Score,
      player2Score,
      hiScore,
      player1ScoreVisible: !(blinkOff && blinkTargetIndex === 0),
      player2ScoreVisible: !(blinkOff && blinkTargetIndex === 1),
      lives: Math.max(0, this.world.lives),
      currentPlayerIndex: this.world.currentPlayerIndex,
    };
  }

  getOverlayState({ isPaused }) {
    if (this.world.status === 'menu') {
      return {
        kind: 'menu',
        title: 'SPACE INVADERS',
        prompt: `${this.world.selectedPlayerCount} PLAYER${this.world.selectedPlayerCount > 1 ? 'S' : ''} SELECTED`,
        lines: ['PRESS 1 OR 2 TO CHOOSE', 'PRESS SPACE OR ENTER TO START'],
        textOffsetY: -20,
        startOffsetY: 10,
        controlsOffsetY: 0,
      };
    }

    if (this.world.status === 'game-over') {
      return {
        kind: 'game-over',
        title: 'GAME OVER',
        prompt: 'PRESS SPACE OR ENTER FOR PLAYER SELECT',
        lines: [],
        textOffsetY: -20,
        startOffsetY: 0,
        controlsOffsetY: -20,
      };
    }

    if (isPaused) {
      return {
        kind: 'paused',
        title: 'PAUSED',
        prompt: 'PRESS P TO RESUME',
        lines: ['PRESS X FOR MENU'],
        textOffsetY: 0,
        startOffsetY: 0,
        controlsOffsetY: 0,
      };
    }

    return null;
  }
}

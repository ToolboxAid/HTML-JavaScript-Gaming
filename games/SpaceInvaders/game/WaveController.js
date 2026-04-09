/*
Toolbox Aid
David Quesenberry
03/25/2026
WaveController.js
*/
export default class WaveController {
  constructor({ world }) {
    this.world = world;
  }

  getBoundaryY() {
    return this.world.playerBaseY + 21;
  }

  getBottomHudWaveText() {
    return `WAVE ${this.world.wave}`;
  }

  getCenterBanner() {
    if (this.world.pendingTurnSwitch) {
      return {
        title: `PLAYER ${this.world.pendingTurnSwitch.targetIndex + 1}`,
        subtitle: '',
      };
    }

    if (this.world.entryDelay > 0 || this.world.turnAnnouncementTimer > 0) {
      return {
        title: this.world.statusMessage,
        subtitle: this.world.statusMessage === 'EXTRA LIFE' ? 'BONUS SHIP AWARDED' : '',
      };
    }

    return null;
  }
}

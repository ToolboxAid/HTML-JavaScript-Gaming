/*
Toolbox Aid
David Quesenberry
03/25/2026
UfoController.js
*/
export default class UfoController {
  constructor({ world, audio }) {
    this.world = world;
    this.audio = audio;
  }

  playSfx(event) {
    event.sfx.forEach((effectId) => this.audio.play(effectId));
  }

  syncLoop({ isPaused }) {
    const allowUfoLoop = !isPaused
      && this.world.status === 'playing'
      && !this.world.isWaveTransition
      && !this.world.gameOver
      && Boolean(this.world.ufo);

    if (allowUfoLoop) {
      this.audio.startUfoLoop(this.world.ufoDirection);
    } else {
      this.audio.stopUfoLoop();
    }
  }

  stopLoop() {
    this.audio.stopUfoLoop();
  }
}

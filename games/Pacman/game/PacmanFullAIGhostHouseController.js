/*
Toolbox Aid
David Quesenberry
03/25/2026
PacmanFullAIGhostHouseController.js
*/
export default class PacmanFullAIGhostHouseController {
  constructor({ releaseCfg }) {
    this.releaseCfg = releaseCfg;
    this.elapsedMs = 0;
  }

  reset() {
    this.elapsedMs = 0;
  }

  update(dtMs, { ghosts, pelletsEaten }) {
    this.elapsedMs += dtMs;
    ghosts.forEach((ghost) => {
      if (!ghost.inHouse) return;
      if (ghost.id === 'blinky') {
        ghost.inHouse = false;
        return;
      }
      if (ghost.id === 'pinky' && this.elapsedMs >= this.releaseCfg.pinkyMs) {
        ghost.inHouse = false;
        return;
      }
      if (ghost.id === 'inky' && pelletsEaten >= this.releaseCfg.inkyPellets) {
        ghost.inHouse = false;
        return;
      }
      if (ghost.id === 'clyde' && pelletsEaten >= this.releaseCfg.clydePellets) {
        ghost.inHouse = false;
      }
    });
  }
}

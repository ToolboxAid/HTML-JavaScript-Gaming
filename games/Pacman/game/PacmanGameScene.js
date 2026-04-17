import { PACMAN_GAME_OVER_AUTO_EXIT_SECONDS, PACMAN_GAME_OVER_RETURN_MODE } from "../rules/flowRules.js";
import { PACMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export default class PacmanGameScene {
  constructor(options = {}) {
    this.gameOverAutoExitSeconds = Number.isFinite(Number(options.gameOverAutoExitSeconds))
      ? Number(options.gameOverAutoExitSeconds)
      : PACMAN_GAME_OVER_AUTO_EXIT_SECONDS;
    this.mode = PACMAN_GAME_OVER_RETURN_MODE;
    this.status = PACMAN_GAME_OVER_RETURN_STATUS;
  }

  returnToIntroAttract() {
    this.mode = PACMAN_GAME_OVER_RETURN_MODE;
    this.status = PACMAN_GAME_OVER_RETURN_STATUS;
  }
}


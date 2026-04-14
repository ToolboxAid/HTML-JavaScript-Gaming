import { PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS, PUCKMAN_GAME_OVER_RETURN_MODE } from "../rules/flowRules.js";
import { PUCKMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export default class PuckmanGameScene {
  constructor(options = {}) {
    this.gameOverAutoExitSeconds = Number.isFinite(Number(options.gameOverAutoExitSeconds))
      ? Number(options.gameOverAutoExitSeconds)
      : PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS;
    this.mode = PUCKMAN_GAME_OVER_RETURN_MODE;
    this.status = PUCKMAN_GAME_OVER_RETURN_STATUS;
  }

  returnToIntroAttract() {
    this.mode = PUCKMAN_GAME_OVER_RETURN_MODE;
    this.status = PUCKMAN_GAME_OVER_RETURN_STATUS;
  }
}


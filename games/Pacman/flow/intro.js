import { PACMAN_FLOW_IDS, PACMAN_GAME_OVER_AUTO_EXIT_SECONDS, PACMAN_GAME_OVER_RETURN_MODE, PACMAN_GAME_OVER_RETURN_RESET_IDLE, createPacmanFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_FLOW_LABELS, PACMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PACMAN_INTRO_FLOW_NEXT_ID = PACMAN_FLOW_IDS.highscore;

export const introFlow = createPacmanFlowDescriptor(PACMAN_FLOW_IDS.intro, {
  label: PACMAN_FLOW_LABELS.intro,
  nextFlowId: PACMAN_INTRO_FLOW_NEXT_ID,
  autoAdvanceSeconds: PACMAN_GAME_OVER_AUTO_EXIT_SECONDS,
  statusText: PACMAN_GAME_OVER_RETURN_STATUS,
  returnMode: PACMAN_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PACMAN_GAME_OVER_RETURN_RESET_IDLE
});


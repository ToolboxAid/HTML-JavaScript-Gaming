import { PUCKMAN_FLOW_IDS, PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS, PUCKMAN_GAME_OVER_RETURN_MODE, PUCKMAN_GAME_OVER_RETURN_RESET_IDLE, createPuckmanFlowDescriptor } from "../rules/flowRules.js";
import { PUCKMAN_FLOW_LABELS, PUCKMAN_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PUCKMAN_INTRO_FLOW_NEXT_ID = PUCKMAN_FLOW_IDS.highscore;

export const introFlow = createPuckmanFlowDescriptor(PUCKMAN_FLOW_IDS.intro, {
  label: PUCKMAN_FLOW_LABELS.intro,
  nextFlowId: PUCKMAN_INTRO_FLOW_NEXT_ID,
  autoAdvanceSeconds: PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS,
  statusText: PUCKMAN_GAME_OVER_RETURN_STATUS,
  returnMode: PUCKMAN_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PUCKMAN_GAME_OVER_RETURN_RESET_IDLE
});


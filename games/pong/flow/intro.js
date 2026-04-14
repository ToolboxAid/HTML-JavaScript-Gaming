import { PONG_FLOW_IDS, PONG_GAME_OVER_AUTO_EXIT_SECONDS, PONG_GAME_OVER_RETURN_MODE, PONG_GAME_OVER_RETURN_RESET_IDLE, createFlowDescriptor } from "../rules/flowRules.js";
import { PONG_FLOW_LABELS, PONG_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const PONG_INTRO_FLOW_NEXT_ID = PONG_FLOW_IDS.highscore;

export const introFlow = createFlowDescriptor(PONG_FLOW_IDS.intro, {
  label: PONG_FLOW_LABELS.intro,
  nextFlowId: PONG_INTRO_FLOW_NEXT_ID,
  autoAdvanceSeconds: PONG_GAME_OVER_AUTO_EXIT_SECONDS,
  statusText: PONG_GAME_OVER_RETURN_STATUS,
  returnMode: PONG_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: PONG_GAME_OVER_RETURN_RESET_IDLE
});


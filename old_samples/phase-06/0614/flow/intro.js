import { ORBIT_FLOW_IDS, ORBIT_GAME_OVER_AUTO_EXIT_SECONDS, ORBIT_GAME_OVER_RETURN_MODE, ORBIT_GAME_OVER_RETURN_RESET_IDLE, createORBITFlowDescriptor } from "../rules/flowRules.js";
import { ORBIT_FLOW_LABELS, ORBIT_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const ORBIT_INTRO_FLOW_NEXT_ID = ORBIT_FLOW_IDS.highscore;

export const introFlow = createORBITFlowDescriptor(ORBIT_FLOW_IDS.intro, {
  label: ORBIT_FLOW_LABELS.intro,
  nextFlowId: ORBIT_INTRO_FLOW_NEXT_ID,
  autoAdvanceSeconds: ORBIT_GAME_OVER_AUTO_EXIT_SECONDS,
  statusText: ORBIT_GAME_OVER_RETURN_STATUS,
  returnMode: ORBIT_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: ORBIT_GAME_OVER_RETURN_RESET_IDLE
});


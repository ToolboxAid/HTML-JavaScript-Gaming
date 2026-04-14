import {
  ORBIT_FLOW_IDS,
  ORBIT_FLOW_LABELS,
  ORBIT_GAME_OVER_RETURN_MODE,
  ORBIT_GAME_OVER_RETURN_RESET_IDLE,
  ORBIT_GAME_OVER_RETURN_STATUS,
  createORBITFlowDescriptor
} from "../rules/gameFlowRules.js";

export const ORBIT_ATTRACT_FLOW_NEXT_ID = ORBIT_FLOW_IDS.intro;

export const attractFlow = createORBITFlowDescriptor(ORBIT_FLOW_IDS.attract, {
  label: ORBIT_FLOW_LABELS.attract,
  nextFlowId: ORBIT_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: ORBIT_GAME_OVER_RETURN_STATUS,
  returnMode: ORBIT_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: ORBIT_GAME_OVER_RETURN_RESET_IDLE
});

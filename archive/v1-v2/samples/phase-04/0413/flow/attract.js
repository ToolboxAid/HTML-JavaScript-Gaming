import { THRUSTER_FLOW_IDS, THRUSTER_GAME_OVER_RETURN_MODE, THRUSTER_GAME_OVER_RETURN_RESET_IDLE, createTHRUSTERFlowDescriptor } from "../rules/flowRules.js";
import { THRUSTER_FLOW_LABELS, THRUSTER_GAME_OVER_RETURN_STATUS } from "../rules/flowContent.js";

export const THRUSTER_ATTRACT_FLOW_NEXT_ID = THRUSTER_FLOW_IDS.intro;

export const attractFlow = createTHRUSTERFlowDescriptor(THRUSTER_FLOW_IDS.attract, {
  label: THRUSTER_FLOW_LABELS.attract,
  nextFlowId: THRUSTER_ATTRACT_FLOW_NEXT_ID,
  autoAdvanceSeconds: null,
  statusText: THRUSTER_GAME_OVER_RETURN_STATUS,
  returnMode: THRUSTER_GAME_OVER_RETURN_MODE,
  resetIdleOnReturn: THRUSTER_GAME_OVER_RETURN_RESET_IDLE
});


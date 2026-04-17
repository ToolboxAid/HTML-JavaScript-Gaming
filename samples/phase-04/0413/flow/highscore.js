import { THRUSTER_FLOW_IDS, THRUSTER_HIGHSCORE_AUTO_EXIT_SECONDS, createTHRUSTERFlowDescriptor } from "../rules/flowRules.js";
import { THRUSTER_FLOW_LABELS, THRUSTER_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const THRUSTER_HIGHSCORE_FLOW_NEXT_ID = THRUSTER_FLOW_IDS.attract;

export const highscoreFlow = createTHRUSTERFlowDescriptor(THRUSTER_FLOW_IDS.highscore, {
  label: THRUSTER_FLOW_LABELS.highscore,
  nextFlowId: THRUSTER_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: THRUSTER_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: THRUSTER_HIGHSCORE_STATUS
});


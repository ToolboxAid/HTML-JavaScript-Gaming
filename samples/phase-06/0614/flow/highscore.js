import { ORBIT_FLOW_IDS, ORBIT_HIGHSCORE_AUTO_EXIT_SECONDS, createORBITFlowDescriptor } from "../rules/flowRules.js";
import { ORBIT_FLOW_LABELS, ORBIT_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const ORBIT_HIGHSCORE_FLOW_NEXT_ID = ORBIT_FLOW_IDS.attract;

export const highscoreFlow = createORBITFlowDescriptor(ORBIT_FLOW_IDS.highscore, {
  label: ORBIT_FLOW_LABELS.highscore,
  nextFlowId: ORBIT_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: ORBIT_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: ORBIT_HIGHSCORE_STATUS
});


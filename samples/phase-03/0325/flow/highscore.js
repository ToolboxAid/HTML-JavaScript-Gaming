import { GRAVITY_FLOW_IDS, GRAVITY_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { GRAVITY_FLOW_LABELS, GRAVITY_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const GRAVITY_HIGHSCORE_FLOW_NEXT_ID = GRAVITY_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(GRAVITY_FLOW_IDS.highscore, {
  label: GRAVITY_FLOW_LABELS.highscore,
  nextFlowId: GRAVITY_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: GRAVITY_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: GRAVITY_HIGHSCORE_STATUS
});


import { GRAVITY_WELL_FLOW_IDS, GRAVITY_WELL_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { GRAVITY_WELL_FLOW_LABELS, GRAVITY_WELL_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const GRAVITY_WELL_HIGHSCORE_FLOW_NEXT_ID = GRAVITY_WELL_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(GRAVITY_WELL_FLOW_IDS.highscore, {
  label: GRAVITY_WELL_FLOW_LABELS.highscore,
  nextFlowId: GRAVITY_WELL_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: GRAVITY_WELL_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: GRAVITY_WELL_HIGHSCORE_STATUS
});


import { BREAKOUT_FLOW_IDS, BREAKOUT_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { BREAKOUT_FLOW_LABELS, BREAKOUT_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const BREAKOUT_HIGHSCORE_FLOW_NEXT_ID = BREAKOUT_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(BREAKOUT_FLOW_IDS.highscore, {
  label: BREAKOUT_FLOW_LABELS.highscore,
  nextFlowId: BREAKOUT_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: BREAKOUT_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: BREAKOUT_HIGHSCORE_STATUS
});


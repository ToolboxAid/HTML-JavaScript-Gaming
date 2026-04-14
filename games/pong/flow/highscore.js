import { PONG_FLOW_IDS, PONG_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { PONG_FLOW_LABELS, PONG_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const PONG_HIGHSCORE_FLOW_NEXT_ID = PONG_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(PONG_FLOW_IDS.highscore, {
  label: PONG_FLOW_LABELS.highscore,
  nextFlowId: PONG_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PONG_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PONG_HIGHSCORE_STATUS
});


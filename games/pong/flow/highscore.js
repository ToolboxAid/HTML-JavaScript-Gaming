import {
  PONG_FLOW_IDS,
  PONG_FLOW_LABELS,
  PONG_HIGHSCORE_AUTO_EXIT_SECONDS,
  PONG_HIGHSCORE_STATUS,
  createFlowDescriptor
} from "../rules/gameFlowRules.js";

export const PONG_HIGHSCORE_FLOW_NEXT_ID = PONG_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(PONG_FLOW_IDS.highscore, {
  label: PONG_FLOW_LABELS.highscore,
  nextFlowId: PONG_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PONG_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PONG_HIGHSCORE_STATUS
});

import { BOUNCING_BALL_FLOW_IDS, BOUNCING_BALL_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { BOUNCING_BALL_FLOW_LABELS, BOUNCING_BALL_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const BOUNCING_BALL_HIGHSCORE_FLOW_NEXT_ID = BOUNCING_BALL_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(BOUNCING_BALL_FLOW_IDS.highscore, {
  label: BOUNCING_BALL_FLOW_LABELS.highscore,
  nextFlowId: BOUNCING_BALL_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: BOUNCING_BALL_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: BOUNCING_BALL_HIGHSCORE_STATUS
});


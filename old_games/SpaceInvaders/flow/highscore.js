import { SPACE_INVADERS_FLOW_IDS, SPACE_INVADERS_HIGHSCORE_AUTO_EXIT_SECONDS, createSpaceInvadersFlowDescriptor } from "../rules/flowRules.js";
import { SPACE_INVADERS_FLOW_LABELS, SPACE_INVADERS_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const SPACE_INVADERS_HIGHSCORE_FLOW_NEXT_ID = SPACE_INVADERS_FLOW_IDS.attract;

export const highscoreFlow = createSpaceInvadersFlowDescriptor(SPACE_INVADERS_FLOW_IDS.highscore, {
  label: SPACE_INVADERS_FLOW_LABELS.highscore,
  nextFlowId: SPACE_INVADERS_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: SPACE_INVADERS_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: SPACE_INVADERS_HIGHSCORE_STATUS
});


import { PROJECTILE_LAB_FLOW_IDS, PROJECTILE_LAB_HIGHSCORE_AUTO_EXIT_SECONDS, createFlowDescriptor } from "../rules/flowRules.js";
import { PROJECTILE_LAB_FLOW_LABELS, PROJECTILE_LAB_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const PROJECTILE_LAB_HIGHSCORE_FLOW_NEXT_ID = PROJECTILE_LAB_FLOW_IDS.attract;

export const highscoreFlow = createFlowDescriptor(PROJECTILE_LAB_FLOW_IDS.highscore, {
  label: PROJECTILE_LAB_FLOW_LABELS.highscore,
  nextFlowId: PROJECTILE_LAB_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PROJECTILE_LAB_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PROJECTILE_LAB_HIGHSCORE_STATUS
});


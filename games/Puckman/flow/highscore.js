import {
  PUCKMAN_FLOW_IDS,
  PUCKMAN_FLOW_LABELS,
  PUCKMAN_HIGHSCORE_AUTO_EXIT_SECONDS,
  PUCKMAN_HIGHSCORE_STATUS,
  createPuckmanFlowDescriptor
} from "../rules/gameFlowRules.js";

export const PUCKMAN_HIGHSCORE_FLOW_NEXT_ID = PUCKMAN_FLOW_IDS.attract;

export const highscoreFlow = createPuckmanFlowDescriptor(PUCKMAN_FLOW_IDS.highscore, {
  label: PUCKMAN_FLOW_LABELS.highscore,
  nextFlowId: PUCKMAN_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PUCKMAN_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PUCKMAN_HIGHSCORE_STATUS
});

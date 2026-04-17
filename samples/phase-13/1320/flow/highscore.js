import { PACMAN_LITE_FLOW_IDS, PACMAN_LITE_HIGHSCORE_AUTO_EXIT_SECONDS, createPACMANLITEFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_LITE_FLOW_LABELS, PACMAN_LITE_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const PACMAN_LITE_HIGHSCORE_FLOW_NEXT_ID = PACMAN_LITE_FLOW_IDS.attract;

export const highscoreFlow = createPACMANLITEFlowDescriptor(PACMAN_LITE_FLOW_IDS.highscore, {
  label: PACMAN_LITE_FLOW_LABELS.highscore,
  nextFlowId: PACMAN_LITE_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PACMAN_LITE_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PACMAN_LITE_HIGHSCORE_STATUS
});


import { PACMAN_FLOW_IDS, PACMAN_HIGHSCORE_AUTO_EXIT_SECONDS, createPacmanFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_FLOW_LABELS, PACMAN_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const PACMAN_HIGHSCORE_FLOW_NEXT_ID = PACMAN_FLOW_IDS.attract;

export const highscoreFlow = createPacmanFlowDescriptor(PACMAN_FLOW_IDS.highscore, {
  label: PACMAN_FLOW_LABELS.highscore,
  nextFlowId: PACMAN_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PACMAN_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PACMAN_HIGHSCORE_STATUS
});


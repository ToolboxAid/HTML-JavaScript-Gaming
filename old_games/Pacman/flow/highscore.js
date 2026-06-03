import { PACMAN_FULL_AI_FLOW_IDS, PACMAN_FULL_AI_HIGHSCORE_AUTO_EXIT_SECONDS, createPACMANFULLAIFlowDescriptor } from "../rules/flowRules.js";
import { PACMAN_FULL_AI_FLOW_LABELS, PACMAN_FULL_AI_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const PACMAN_FULL_AI_HIGHSCORE_FLOW_NEXT_ID = PACMAN_FULL_AI_FLOW_IDS.attract;

export const highscoreFlow = createPACMANFULLAIFlowDescriptor(PACMAN_FULL_AI_FLOW_IDS.highscore, {
  label: PACMAN_FULL_AI_FLOW_LABELS.highscore,
  nextFlowId: PACMAN_FULL_AI_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: PACMAN_FULL_AI_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: PACMAN_FULL_AI_HIGHSCORE_STATUS
});


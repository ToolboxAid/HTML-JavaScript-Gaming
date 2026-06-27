import { SPACE_DUEL_FLOW_IDS, SPACE_DUEL_HIGHSCORE_AUTO_EXIT_SECONDS, createSPACEDUELFlowDescriptor } from "../rules/flowRules.js";
import { SPACE_DUEL_FLOW_LABELS, SPACE_DUEL_HIGHSCORE_STATUS } from "../rules/flowContent.js";

export const SPACE_DUEL_HIGHSCORE_FLOW_NEXT_ID = SPACE_DUEL_FLOW_IDS.attract;

export const highscoreFlow = createSPACEDUELFlowDescriptor(SPACE_DUEL_FLOW_IDS.highscore, {
  label: SPACE_DUEL_FLOW_LABELS.highscore,
  nextFlowId: SPACE_DUEL_HIGHSCORE_FLOW_NEXT_ID,
  autoAdvanceSeconds: SPACE_DUEL_HIGHSCORE_AUTO_EXIT_SECONDS,
  statusText: SPACE_DUEL_HIGHSCORE_STATUS
});


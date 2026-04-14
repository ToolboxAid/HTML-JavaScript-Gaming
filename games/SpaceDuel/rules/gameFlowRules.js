export const SPACE_DUEL_FLOW_CONTRACT_VERSION = "1";

export const SPACE_DUEL_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const SPACE_DUEL_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const SPACE_DUEL_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const SPACE_DUEL_GAME_OVER_RETURN_MODE = "menu";
export const SPACE_DUEL_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const SPACE_DUEL_GAME_OVER_RETURN_RESET_IDLE = true;

export const SPACE_DUEL_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const SPACE_DUEL_HIGHSCORE_STATUS = "Space Duel high scores";

export function createSPACEDUELFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: SPACE_DUEL_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || SPACE_DUEL_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || SPACE_DUEL_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? SPACE_DUEL_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

export const VECTOR_ARCADE_SAMPLE_FLOW_CONTRACT_VERSION = "1";

export const VECTOR_ARCADE_SAMPLE_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const VECTOR_ARCADE_SAMPLE_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const VECTOR_ARCADE_SAMPLE_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const VECTOR_ARCADE_SAMPLE_GAME_OVER_RETURN_MODE = "menu";
export const VECTOR_ARCADE_SAMPLE_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const VECTOR_ARCADE_SAMPLE_GAME_OVER_RETURN_RESET_IDLE = true;

export const VECTOR_ARCADE_SAMPLE_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const VECTOR_ARCADE_SAMPLE_HIGHSCORE_STATUS = "Vector Arcade Sample high scores";

export function createVECTORARCADESAMPLEFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: VECTOR_ARCADE_SAMPLE_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || VECTOR_ARCADE_SAMPLE_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || VECTOR_ARCADE_SAMPLE_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? VECTOR_ARCADE_SAMPLE_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

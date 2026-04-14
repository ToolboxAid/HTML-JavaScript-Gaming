export const PONG_FLOW_CONTRACT_VERSION = "1";

export const PONG_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const PONG_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const PONG_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const PONG_GAME_OVER_RETURN_MODE = "menu";
export const PONG_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const PONG_GAME_OVER_RETURN_RESET_IDLE = true;

export const PONG_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const PONG_HIGHSCORE_STATUS = "Pong high scores";

export function createFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: PONG_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || PONG_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || PONG_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? PONG_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

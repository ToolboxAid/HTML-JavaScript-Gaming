export const PUCKMAN_FLOW_CONTRACT_VERSION = "1";

export const PUCKMAN_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const PUCKMAN_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const PUCKMAN_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const PUCKMAN_GAME_OVER_RETURN_MODE = "menu";
export const PUCKMAN_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const PUCKMAN_GAME_OVER_RETURN_RESET_IDLE = true;

export const PUCKMAN_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const PUCKMAN_HIGHSCORE_STATUS = "High scores";

export function createPuckmanFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: PUCKMAN_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || PUCKMAN_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || PUCKMAN_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? PUCKMAN_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

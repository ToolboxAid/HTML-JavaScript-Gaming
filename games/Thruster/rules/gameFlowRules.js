export const THRUSTER_FLOW_CONTRACT_VERSION = "1";

export const THRUSTER_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const THRUSTER_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const THRUSTER_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const THRUSTER_GAME_OVER_RETURN_MODE = "menu";
export const THRUSTER_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const THRUSTER_GAME_OVER_RETURN_RESET_IDLE = true;

export const THRUSTER_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const THRUSTER_HIGHSCORE_STATUS = "Thruster high scores";

export function createTHRUSTERFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: THRUSTER_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || THRUSTER_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || THRUSTER_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? THRUSTER_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

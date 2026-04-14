export const ORBIT_FLOW_CONTRACT_VERSION = "1";

export const ORBIT_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const ORBIT_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const ORBIT_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const ORBIT_GAME_OVER_RETURN_MODE = "menu";
export const ORBIT_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const ORBIT_GAME_OVER_RETURN_RESET_IDLE = true;

export const ORBIT_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const ORBIT_HIGHSCORE_STATUS = "Orbit high scores";

export function createORBITFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: ORBIT_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || ORBIT_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || ORBIT_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? ORBIT_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

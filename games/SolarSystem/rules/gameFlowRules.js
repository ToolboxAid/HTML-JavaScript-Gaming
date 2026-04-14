export const SOLAR_SYSTEM_FLOW_CONTRACT_VERSION = "1";

export const SOLAR_SYSTEM_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const SOLAR_SYSTEM_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const SOLAR_SYSTEM_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const SOLAR_SYSTEM_GAME_OVER_RETURN_MODE = "menu";
export const SOLAR_SYSTEM_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const SOLAR_SYSTEM_GAME_OVER_RETURN_RESET_IDLE = true;

export const SOLAR_SYSTEM_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const SOLAR_SYSTEM_HIGHSCORE_STATUS = "Solar System high scores";

export function createSOLARSYSTEMFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: SOLAR_SYSTEM_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || SOLAR_SYSTEM_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || SOLAR_SYSTEM_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? SOLAR_SYSTEM_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

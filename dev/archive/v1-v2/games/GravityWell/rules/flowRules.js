export const GRAVITY_WELL_FLOW_CONTRACT_VERSION = "1";
export const GRAVITY_WELL_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const GRAVITY_WELL_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const GRAVITY_WELL_GAME_OVER_RETURN_MODE = "menu";
export const GRAVITY_WELL_GAME_OVER_RETURN_RESET_IDLE = true;
export const GRAVITY_WELL_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: GRAVITY_WELL_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || GRAVITY_WELL_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || GRAVITY_WELL_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? GRAVITY_WELL_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


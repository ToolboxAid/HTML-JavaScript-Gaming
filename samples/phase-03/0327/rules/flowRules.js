export const MULTI_BALL_CHAOS_FLOW_CONTRACT_VERSION = "1";
export const MULTI_BALL_CHAOS_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const MULTI_BALL_CHAOS_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const MULTI_BALL_CHAOS_GAME_OVER_RETURN_MODE = "menu";
export const MULTI_BALL_CHAOS_GAME_OVER_RETURN_RESET_IDLE = true;
export const MULTI_BALL_CHAOS_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createMULTIBALLCHAOSFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: MULTI_BALL_CHAOS_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || MULTI_BALL_CHAOS_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || MULTI_BALL_CHAOS_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? MULTI_BALL_CHAOS_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


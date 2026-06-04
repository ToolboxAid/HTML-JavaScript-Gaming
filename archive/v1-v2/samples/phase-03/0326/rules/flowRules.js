export const PADDLE_INTERCEPT_FLOW_CONTRACT_VERSION = "1";
export const PADDLE_INTERCEPT_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const PADDLE_INTERCEPT_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const PADDLE_INTERCEPT_GAME_OVER_RETURN_MODE = "menu";
export const PADDLE_INTERCEPT_GAME_OVER_RETURN_RESET_IDLE = true;
export const PADDLE_INTERCEPT_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createPADDLEINTERCEPTFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: PADDLE_INTERCEPT_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || PADDLE_INTERCEPT_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || PADDLE_INTERCEPT_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? PADDLE_INTERCEPT_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


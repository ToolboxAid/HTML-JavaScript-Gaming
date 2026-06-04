export const AI_TARGET_DUMMY_FLOW_CONTRACT_VERSION = "1";
export const AI_TARGET_DUMMY_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const AI_TARGET_DUMMY_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const AI_TARGET_DUMMY_GAME_OVER_RETURN_MODE = "menu";
export const AI_TARGET_DUMMY_GAME_OVER_RETURN_RESET_IDLE = true;
export const AI_TARGET_DUMMY_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createAITARGETDUMMYFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: AI_TARGET_DUMMY_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || AI_TARGET_DUMMY_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || AI_TARGET_DUMMY_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? AI_TARGET_DUMMY_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


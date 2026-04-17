export const PACMAN_FULL_AI_FLOW_CONTRACT_VERSION = "1";
export const PACMAN_FULL_AI_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const PACMAN_FULL_AI_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const PACMAN_FULL_AI_GAME_OVER_RETURN_MODE = "menu";
export const PACMAN_FULL_AI_GAME_OVER_RETURN_RESET_IDLE = true;
export const PACMAN_FULL_AI_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createPACMANFULLAIFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: PACMAN_FULL_AI_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || PACMAN_FULL_AI_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || PACMAN_FULL_AI_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? PACMAN_FULL_AI_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


export const SPACE_INVADERS_FLOW_CONTRACT_VERSION = "1";
export const SPACE_INVADERS_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});
export const SPACE_INVADERS_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const SPACE_INVADERS_GAME_OVER_RETURN_MODE = "menu";
export const SPACE_INVADERS_GAME_OVER_RETURN_RESET_IDLE = true;
export const SPACE_INVADERS_HIGHSCORE_AUTO_EXIT_SECONDS = 12;

export function createSpaceInvadersFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: SPACE_INVADERS_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || SPACE_INVADERS_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || SPACE_INVADERS_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? SPACE_INVADERS_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}


export const BOUNCING_BALL_FLOW_CONTRACT_VERSION = "1";

export const BOUNCING_BALL_FLOW_IDS = Object.freeze({
  attract: "attract",
  intro: "intro",
  highscore: "highscore"
});

export const BOUNCING_BALL_FLOW_LABELS = Object.freeze({
  attract: "Attract",
  intro: "Intro",
  highscore: "Highscore"
});

export const BOUNCING_BALL_GAME_OVER_AUTO_EXIT_SECONDS = 30;
export const BOUNCING_BALL_GAME_OVER_RETURN_MODE = "menu";
export const BOUNCING_BALL_GAME_OVER_RETURN_STATUS = "Press 1 for one player or 2 for two players.";
export const BOUNCING_BALL_GAME_OVER_RETURN_RESET_IDLE = true;

export const BOUNCING_BALL_HIGHSCORE_AUTO_EXIT_SECONDS = 12;
export const BOUNCING_BALL_HIGHSCORE_STATUS = "Bouncing Ball high scores";

export function createFlowDescriptor(id, options = {}) {
  return Object.freeze({
    id,
    label: options.label || id,
    contractVersion: BOUNCING_BALL_FLOW_CONTRACT_VERSION,
    nextFlowId: options.nextFlowId || BOUNCING_BALL_FLOW_IDS.attract,
    autoAdvanceSeconds: options.autoAdvanceSeconds ?? null,
    statusText: options.statusText || "",
    returnMode: options.returnMode || BOUNCING_BALL_GAME_OVER_RETURN_MODE,
    resetIdleOnReturn: options.resetIdleOnReturn ?? BOUNCING_BALL_GAME_OVER_RETURN_RESET_IDLE,
    debugPluginFactory: options.debugPluginFactory || null
  });
}

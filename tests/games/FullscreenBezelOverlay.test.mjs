import assert from "node:assert/strict";
import FullscreenBezelOverlay, {
  DEFAULT_FULLSCREEN_BEZEL_ASSET_PATH,
  FULLSCREEN_BEZEL_DRAW_MODES,
  normalizeFullscreenBezelDrawMode
} from "../../games/Asteroids/game/FullscreenBezelOverlay.js";

function createRendererSpy() {
  const calls = [];
  return {
    calls,
    getCanvasSize() {
      return { width: 960, height: 720 };
    },
    drawImageFrame(...args) {
      calls.push(args);
    }
  };
}

export function run() {
  assert.equal(DEFAULT_FULLSCREEN_BEZEL_ASSET_PATH, "games/Asteroids/assets/images/bezel.png");
  assert.equal(DEFAULT_FULLSCREEN_BEZEL_ASSET_PATH.includes("/parallax/"), false);
  assert.deepEqual(FULLSCREEN_BEZEL_DRAW_MODES, ["overlay", "underlay"]);
  assert.equal(normalizeFullscreenBezelDrawMode("UNDERLAY"), "underlay");
  assert.equal(normalizeFullscreenBezelDrawMode("unknown"), "overlay");

  const overlay = new FullscreenBezelOverlay({
    image: { width: 1920, height: 1080 },
    drawMode: "overlay"
  });
  const renderer = createRendererSpy();
  const contract = overlay.getContract();

  assert.equal(contract.fullscreenOnly, true);
  assert.equal(contract.coordinateSpace, "screen-space");
  assert.equal(contract.assetPath, DEFAULT_FULLSCREEN_BEZEL_ASSET_PATH);
  assert.equal(contract.drawMode, "overlay");

  const blocked = overlay.render(renderer, {
    fullscreenActive: false,
    stage: "overlay"
  });
  assert.equal(blocked.drawn, false);
  assert.equal(blocked.reason, "fullscreen-inactive");
  assert.equal(renderer.calls.length, 0);

  const stageMismatch = overlay.render(renderer, {
    fullscreenActive: true,
    stage: "underlay"
  });
  assert.equal(stageMismatch.drawn, false);
  assert.equal(stageMismatch.reason, "draw-mode-mismatch");
  assert.equal(renderer.calls.length, 0);

  const rendered = overlay.render(renderer, {
    fullscreenActive: true,
    stage: "overlay"
  });
  assert.equal(rendered.drawn, true);
  assert.equal(renderer.calls.length, 1);
}

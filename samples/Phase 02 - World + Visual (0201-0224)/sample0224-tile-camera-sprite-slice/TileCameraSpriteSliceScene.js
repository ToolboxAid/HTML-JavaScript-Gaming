/*
Toolbox Aid
David Quesenberry
03/21/2026
TileCameraSpriteSliceScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Camera2D, followCameraTarget, worldRectToScreen } from '../../../engine/camera/index.js';
import { Tilemap, renderTilemap, resolveRectVsTilemap } from '../../../engine/tilemap/index.js';
import { SpriteAtlas } from '../../../engine/assets/index.js';
import { renderSpriteReadyEntities } from '../../../engine/render/index.js';
import { serializeWorldState, deserializeWorldState } from '../../../engine/persistence/index.js';

const theme = new Theme(ThemeTokens);

export default class TileCameraSpriteSliceScene extends Scene {
  constructor() {
    super();
    this.screen = { x: 60, y: 180 };
    this.tilemap = new Tilemap({
      tileSize: 48,
      tiles: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,0,1,0,0,1,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
        [1,0,0,1,1,0,0,1,0,0,1,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      ],
      palette: { 0: '#1f2937', 1: '#4f46e5' },
    });
    this.worldOffset = { x: 0, y: 0 };
    this.world = {
      width: this.tilemap.width * this.tilemap.tileSize,
      height: this.tilemap.height * this.tilemap.tileSize,
    };
    this.camera = new Camera2D({
      viewportWidth: 860,
      viewportHeight: 300,
      worldWidth: this.world.width,
      worldHeight: this.world.height,
    });

    this.atlas = new SpriteAtlas({
      frames: {
        idle_0: { color: '#7dd3fc' },
        move_0: { color: '#34d399' },
      },
    });

    this.player = { x: 56, y: 56, width: 34, height: 34, speed: 220, frame: 'idle_0' };
    this.goal = { x: 630, y: 195, width: 36, height: 36 };
    this.message = 'Reach the goal.';
    this.saved = '';
    this.lastK = false;
    this.lastL = false;
  }

  update(dt, engine) {
    const move = this.player.speed * dt;
    let dx = 0;
    let dy = 0;

    if (engine.input.isActionDown('move_left')) {
      dx -= move;
    }
    if (engine.input.isActionDown('move_right')) {
      dx += move;
    }
    if (engine.input.isActionDown('move_up')) {
      dy -= move;
    }
    if (engine.input.isActionDown('move_down')) {
      dy += move;
    }

    const moving = dx !== 0 || dy !== 0;
    this.player.frame = moving ? 'move_0' : 'idle_0';

    if (dx !== 0) {
      this.player.x += dx;
      const hitX = resolveRectVsTilemap(this.player, this.tilemap, this.worldOffset);
      if (hitX) {
        if (dx > 0) {
          this.player.x = hitX.x - this.player.width;
        } else {
          this.player.x = hitX.x + hitX.width;
        }
      }
    }

    if (dy !== 0) {
      this.player.y += dy;
      const hitY = resolveRectVsTilemap(this.player, this.tilemap, this.worldOffset);
      if (hitY) {
        if (dy > 0) {
          this.player.y = hitY.y - this.player.height;
        } else {
          this.player.y = hitY.y + hitY.height;
        }
      }
    }

    followCameraTarget(this.camera, this.player, true);

    const savePressed = engine.input.isDown('KeyK');
    const loadPressed = engine.input.isDown('KeyL');

    if (savePressed && !this.lastK) {
      this.saved = serializeWorldState({ player: this.player });
      this.message = 'Saved snapshot.';
    }

    if (loadPressed && !this.lastL && this.saved) {
      const state = deserializeWorldState(this.saved);
      this.player = { ...this.player, ...state.player };
      this.message = 'Loaded snapshot.';
    }

    this.lastK = savePressed;
    this.lastL = loadPressed;

    const reachedGoal =
      this.player.x < this.goal.x + this.goal.width &&
      this.player.x + this.player.width > this.goal.x &&
      this.player.y < this.goal.y + this.goal.height &&
      this.player.y + this.player.height > this.goal.y;

    if (reachedGoal) {
      this.message = 'Goal reached.';
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 0224',
      'Combines tilemap, camera, action input, sprite-style frames, and snapshots',
      'Use Arrow keys or WASD to move, KeyK to save, KeyL to load',
      this.message,
      'This sample is the first tile + camera + sprite-style playable slice',
    ]);

    renderer.strokeRect(this.screen.x, this.screen.y, this.camera.viewportWidth, this.camera.viewportHeight, '#d8d5ff', 2);

    const tileScreen = {
      x: this.screen.x - this.camera.x,
      y: this.screen.y - this.camera.y,
    };
    renderTilemap(renderer, this.tilemap, tileScreen);

    const goalRect = worldRectToScreen(this.camera, this.goal, this.screen.x, this.screen.y);
    renderer.drawRect(goalRect.x, goalRect.y, goalRect.width, goalRect.height, '#fbbf24');
    renderer.strokeRect(goalRect.x, goalRect.y, goalRect.width, goalRect.height, '#ffffff', 1);

    const playerRect = worldRectToScreen(this.camera, this.player, this.screen.x, this.screen.y);
    renderSpriteReadyEntities(renderer, [{
      ...playerRect,
      spriteColor: this.atlas.getFrame(this.player.frame)?.color || theme.getColor('actorFill'),
      label: this.player.frame,
    }], { label: true, labelOffsetY: -8 });

    drawPanel(renderer, 620, 34, 300, 126, 'Slice', [
      `Frame: ${this.player.frame}`,
      `Camera: ${this.camera.x.toFixed(1)}, ${this.camera.y.toFixed(1)}`,
      `Saved text: ${this.saved.length}`,
      'Goal is the yellow tile',
    ]);
  }
}

/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraLookAheadScene.js
*/
import Scene from "../../engine/scenes/Scene.js";
import { Theme, ThemeTokens } from "../../engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraLookAheadScene extends Scene {
  constructor() {
    super();
    this.bounds = {
      x: 60,
      y: 180,
      width: 840,
      height: 280,
    };

    this.world = {
      width: 1600,
      height: 800,
    };

    this.actor = {
      x: 180,
      y: 320,
      width: 34,
      height: 34,
      speed: 240,
      velocityX: 1,
      velocityY: 0,
    };

    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
    this.note = "The camera box sits ahead of the actor's movement.";
    this.lookAhead = {
      x: 0,
      y: 0,
    };
  }

  update(dtSeconds) {
    this.actor.x += this.actor.velocityX * this.actor.speed * dtSeconds;
    this.actor.y += this.actor.velocityY * this.actor.speed * dtSeconds;

    const minX = this.bounds.x + 20;
    const maxX = this.bounds.x + this.bounds.width - this.actor.width - 20;
    const minY = this.bounds.y + 20;
    const maxY = this.bounds.y + this.bounds.height - this.actor.height - 20;

    if (this.actor.x <= minX) {
      this.actor.x = minX;
      this.actor.velocityX = 1;
    }

    if (this.actor.x >= maxX) {
      this.actor.x = maxX;
      this.actor.velocityX = -1;
    }

    if (this.actor.y <= minY) {
      this.actor.y = minY;
      this.actor.velocityY = 1;
    }

    if (this.actor.y >= maxY) {
      this.actor.y = maxY;
      this.actor.velocityY = -1;
    }

    const aheadOffset = this.actor.velocityX > 0 ? 88 : -88;
    this.lookAhead.x = this.actor.x + aheadOffset;
    this.lookAhead.y = this.actor.y - 8;
    this.note = this.actor.velocityX > 0 ? 'Look-ahead shifts forward to the right.' : 'Look-ahead shifts forward to the left.';
  }

  render(renderer) {
    const { width, height } = renderer.getCanvasSize();
    const canvasBackground = theme.getColor('canvasBackground');
    const panel = theme.getColor('panelFill');
    const border = theme.getColor('panelBorder');
    const text = theme.getColor('textCanvs');
    const actorFill = theme.getColor('actorFill');

    renderer.clear(canvasBackground);
    renderer.strokeRect(10, 10, width - 20, height - 20, "#dddddd", 2);
    renderer.drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, panel);
    renderer.strokeRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, border, 3);

    renderer.strokeRect(this.bounds.x + 20, this.bounds.y + 20, this.bounds.width - 40, this.bounds.height - 40, '#dddddd', 2);
    renderer.strokeRect(this.lookAhead.x - 18, this.lookAhead.y - 18, 70, 70, '#fbbf24', 4);
    renderer.drawRect(this.lookAhead.x, this.lookAhead.y, 34, 34, 'rgba(251, 191, 36, 0.45)');
    renderer.drawRect(this.lookAhead.x + 10, this.lookAhead.y + 10, 14, 14, '#fbbf24');
    const connectorX = Math.min(this.actor.x + 34, this.lookAhead.x + 17);
    const connectorWidth = Math.abs(this.lookAhead.x - (this.actor.x + 34)) + 2;
    renderer.drawRect(connectorX, this.actor.y + 24, connectorWidth, 2, '#fbbf24');

    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, actorFill);

    const lines = [
      "Sample74 - Camera Look Ahead",
      this.note,
      "The yellow box shows the area the camera peeks into.",
      "It moves in front of the actor instead of sitting on top of it.",
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }
  }
}

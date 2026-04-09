/*
Toolbox Aid
David Quesenberry
03/21/2026
CameraZoomScene.js
*/
import { Scene } from "/src/engine/scenes/index.js";
import { Theme, ThemeTokens } from "/src/engine/theme/index.js";

const theme = new Theme(ThemeTokens);

export default class CameraZoomScene extends Scene {
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
      y: 300,
      width: 34,
      height: 34,
      speed: 240,
      velocityX: 1,
      velocityY: 0,
    };

    this.textStartX = 40;
    this.textStartY = 48;
    this.textLineHeight = 24;
    this.note = "The camera is zooming on the actor and nearby world details.";
    this.zoomViews = [
      {
        x: 80,
        y: 230,
        width: 230,
        height: 170,
        zoom: 0.65,
        title: "Wide view",
        accent: "#22c55e",
      },
      {
        x: 365,
        y: 230,
        width: 230,
        height: 170,
        zoom: 1.2,
        title: "Normal view",
        accent: "#fbbf24",
      },
      {
        x: 650,
        y: 230,
        width: 230,
        height: 170,
        zoom: 2.1,
        title: "Tight view",
        accent: "#60a5fa",
      },
    ];
  }

  drawWorldBackdrop(renderer, actorFill) {
    const ctx = renderer.ctx;

    ctx.fillStyle = '#1b1245';
    ctx.fillRect(0, 0, this.world.width, this.world.height);

    for (let x = 0; x <= 800; x += 40) {
      ctx.strokeStyle = 'rgba(221, 221, 221, 0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 540);
      ctx.stroke();
    }

    for (let y = 0; y <= 540; y += 40) {
      ctx.strokeStyle = 'rgba(221, 221, 221, 0.10)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    renderer.drawRect(80, 360, 220, 18, '#22c55e');
    renderer.drawRect(360, 300, 140, 18, '#60a5fa');
    renderer.drawRect(520, 410, 180, 18, '#fbbf24');
    renderer.drawRect(680, 250, 120, 18, '#ef4444');

    renderer.strokeRect(150, 250, 170, 130, 'rgba(221, 221, 221, 0.18)', 2);
    renderer.strokeRect(470, 220, 110, 90, 'rgba(251, 191, 36, 0.28)', 2);

    renderer.drawCircle(this.actor.x + 17, this.actor.y + 17, 28, 'rgba(237, 151, 0, 0.20)');
    renderer.drawRect(this.actor.x - 8, this.actor.y - 8, this.actor.width + 16, this.actor.height + 16, 'rgba(237, 151, 0, 0.14)');
    renderer.drawRect(this.actor.x, this.actor.y, this.actor.width, this.actor.height, actorFill);
    renderer.strokeRect(this.actor.x - 12, this.actor.y - 12, this.actor.width + 24, this.actor.height + 24, '#dddddd', 2);
  }

  drawZoomPanel(renderer, panel, zoom, title, accent, actorFill, textColor) {
    const ctx = renderer.ctx;
    const focusX = this.actor.x + this.actor.width / 2;
    const focusY = this.actor.y + this.actor.height / 2;

    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, panel.y, panel.width, panel.height);
    ctx.clip();

    ctx.save();
    ctx.translate(panel.x + panel.width / 2, panel.y + panel.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-focusX, -focusY);
    this.drawWorldBackdrop(renderer, actorFill);
    ctx.restore();

    ctx.restore();

    renderer.strokeRect(panel.x, panel.y, panel.width, panel.height, accent, 4);
    renderer.drawText(title, panel.x + 10, panel.y + 18, {
      color: textColor,
      font: 'bold 15px monospace',
    });
    renderer.drawText(`${zoom.toFixed(2)}x zoom on actor`, panel.x + 10, panel.y + panel.height - 12, {
      color: textColor,
      font: '14px monospace',
    });
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

    const lines = [
      "Sample78 - Camera Zoom",
      this.note,
      "Each panel shows the same actor-centered scene at a different zoom level.",
      "Wide view = more world. Tight view = less world, larger target.",
    ];

    for (let i = 0; i < lines.length; i += 1) {
      renderer.drawText(lines[i], this.textStartX, this.textStartY + (i * this.textLineHeight), {
        color: text,
        font: "16px monospace",
      });
    }

    this.zoomViews.forEach((view) => {
      this.drawZoomPanel(renderer, view, view.zoom, view.title, view.accent, actorFill, text);
    });
  }
}

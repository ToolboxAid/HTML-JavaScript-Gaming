/*
Toolbox Aid
David Quesenberry
03/22/2026
index.js
*/
import { Theme, ThemeTokens } from '../../engine/theme/index.js';

const theme = new Theme(ThemeTokens);

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
theme.applyDocumentTheme();

function draw() {
  ctx.fillStyle = theme.getColor('canvasBackground');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = theme.getColor('actorFill');
  ctx.fillRect(140, 90, 120, 120);
}

draw();

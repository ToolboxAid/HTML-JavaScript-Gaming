/*
Toolbox Aid
David Quesenberry
03/21/2026
index.js
*/
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';

const theme = new Theme(ThemeTokens);

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
theme.applyDocumentTheme();

function draw() {
  const background = theme.getColor('canvasBackground');
  const actor = theme.getColor('actorFill');

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = actor;
  ctx.fillRect(150, 100, 100, 100);
}

draw();

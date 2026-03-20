import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';

const theme = new Theme(ThemeTokens);

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

function draw() {
  ctx.fillStyle = theme.getColor('brandPrimary');
  ctx.fillRect(0, 0, 400, 300);

  ctx.fillStyle = theme.getColor('brandAccent');
  ctx.fillRect(150, 100, 100, 100);
}

draw();
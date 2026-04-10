/*
Toolbox Aid
David Quesenberry
03/22/2026
index.js
*/
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#334155';
ctx.fillRect(40, 50, 320, 180);
ctx.fillStyle = '#60a5fa';
for (let index = 0; index < 8; index += 1) {
  ctx.fillRect(70 + index * 30, 80 + (index % 4) * 18, 2, 16);
}
ctx.fillStyle = '#e2e8f0';
for (let index = 0; index < 4; index += 1) {
  ctx.fillRect(80 + index * 62, 170 + (index % 2) * 12, 32, 3);
}

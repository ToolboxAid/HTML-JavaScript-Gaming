/*
Toolbox Aid
David Quesenberry
03/22/2026
index.js
*/
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#f59e0b';
for (let index = 0; index < 12; index += 1) {
  ctx.fillRect(180 + Math.cos(index) * 40, 150 + Math.sin(index) * 40, 6, 6);
}

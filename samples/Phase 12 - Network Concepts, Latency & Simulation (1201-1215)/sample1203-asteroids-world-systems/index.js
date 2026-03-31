/*
Toolbox Aid
David Quesenberry
03/29/2026
index.js
*/
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 260;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#60a5fa';
ctx.beginPath();
ctx.arc(200, 130, 10, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#f59e0b';
for (let i = 0; i < 5; i += 1) {
  ctx.beginPath();
  ctx.arc(40 + i * 70, 65 + ((i % 2) * 80), 14, 0, Math.PI * 2);
  ctx.fill();
}

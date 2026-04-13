/*
Toolbox Aid
David Quesenberry
03/29/2026
index.js
*/
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.createElement('canvas');
canvas.width = 420;
canvas.height = 260;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#facc15';
ctx.beginPath();
ctx.arc(210, 130, 12, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#22c55e';
ctx.fillRect(90, 70, 18, 18);
ctx.fillRect(300, 70, 18, 18);
ctx.fillStyle = '#f8fafc';
for (let i = 0; i < 8; i += 1) {
  ctx.beginPath();
  ctx.arc(40 + i * 45, 200, 3, 0, Math.PI * 2);
  ctx.fill();
}

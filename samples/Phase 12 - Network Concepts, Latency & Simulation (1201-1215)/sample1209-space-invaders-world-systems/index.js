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
canvas.width = 420;
canvas.height = 260;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#22c55e';
for (let r = 0; r < 2; r += 1) {
  for (let c = 0; c < 5; c += 1) {
    ctx.fillRect(30 + c * 72, 36 + r * 40, 24, 14);
  }
}
ctx.fillStyle = '#60a5fa';
ctx.fillRect(198, 224, 24, 10);

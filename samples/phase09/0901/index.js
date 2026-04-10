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
ctx.strokeStyle = '#38bdf8';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(200, 80);
ctx.lineTo(250, 200);
ctx.lineTo(200, 170);
ctx.lineTo(150, 200);
ctx.closePath();
ctx.stroke();

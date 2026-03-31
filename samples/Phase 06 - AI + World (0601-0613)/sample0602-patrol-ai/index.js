/*
Toolbox Aid
David Quesenberry
03/22/2026
index.js
*/
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#60a5fa';
ctx.beginPath();
ctx.arc(90, 120, 8, 0, Math.PI * 2);
ctx.arc(170, 90, 8, 0, Math.PI * 2);
ctx.arc(260, 140, 8, 0, Math.PI * 2);
ctx.fill();

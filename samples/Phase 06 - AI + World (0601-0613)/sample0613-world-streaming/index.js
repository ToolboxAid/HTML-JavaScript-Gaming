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
ctx.strokeStyle = '#60a5fa';
ctx.strokeRect(30, 90, 100, 80);
ctx.strokeRect(140, 90, 100, 80);
ctx.strokeRect(250, 90, 100, 80);

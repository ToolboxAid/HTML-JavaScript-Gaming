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
ctx.fillStyle = '#0f172a';
ctx.fillRect(50, 70, 300, 170);
ctx.fillStyle = '#34d399';
ctx.fillRect(70, 100, 220, 18);
ctx.fillStyle = '#ef4444';
ctx.fillRect(70, 140, 260, 18);

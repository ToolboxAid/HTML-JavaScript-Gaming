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
ctx.fillStyle = '#34d399';
ctx.fillRect(120, 130, 34, 34);
ctx.fillStyle = '#f97316';
ctx.fillRect(240, 100, 34, 34);
ctx.fillStyle = '#60a5fa';
ctx.fillRect(240, 170, 34, 34);

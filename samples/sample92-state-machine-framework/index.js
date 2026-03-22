/*
Toolbox Aid
David Quesenberry
03/22/2026
index.js
*/
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
ctx.fillStyle = theme.getColor('canvasBackground');
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = '#7dd3fc';
ctx.fillRect(80, 130, 42, 42);
ctx.fillStyle = '#34d399';
ctx.fillRect(170, 130, 42, 42);
ctx.fillStyle = '#f59e0b';
ctx.fillRect(260, 130, 42, 42);

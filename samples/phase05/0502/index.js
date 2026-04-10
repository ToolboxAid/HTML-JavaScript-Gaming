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
ctx.fillStyle = '#60a5fa';
ctx.fillRect(40, 170, 100, 16);
ctx.fillStyle = '#fbbf24';
ctx.fillRect(150, 170, 80, 16);
ctx.fillStyle = '#f97316';
ctx.fillRect(240, 170, 120, 16);

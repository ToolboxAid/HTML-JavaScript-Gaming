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
ctx.fillStyle = '#34d399';
ctx.fillRect(80, 132, 40, 40);
ctx.fillStyle = '#ef4444';
ctx.fillRect(260, 120, 52, 58);
ctx.strokeStyle = '#fbbf24';
ctx.strokeRect(120, 138, 34, 24);
ctx.strokeStyle = '#ef4444';
ctx.strokeRect(269, 128, 34, 40);

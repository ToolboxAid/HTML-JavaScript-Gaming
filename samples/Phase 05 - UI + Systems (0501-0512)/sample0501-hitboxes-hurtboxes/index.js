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
ctx.fillRect(70, 120, 40, 40);
ctx.strokeStyle = '#ef4444';
ctx.strokeRect(270, 102, 36, 56);
ctx.strokeStyle = '#fbbf24';
ctx.strokeRect(110, 126, 36, 26);

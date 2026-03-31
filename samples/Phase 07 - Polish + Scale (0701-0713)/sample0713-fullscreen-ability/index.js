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
ctx.strokeStyle = '#d8d5ff';
ctx.lineWidth = 3;
ctx.strokeRect(40, 60, 320, 180);
ctx.fillStyle = '#7dd3fc';
ctx.fillRect(110, 130, 68, 68);
ctx.fillStyle = '#34d399';
ctx.fillRect(220, 130, 68, 68);

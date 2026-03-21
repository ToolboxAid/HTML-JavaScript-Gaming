/*
Toolbox Aid
David Quesenberry
03/21/2026
theme.test.js
*/
import { Theme } from '../engine/theme/Theme.js';
import { ThemeTokens } from '../engine/theme/ThemeTokens.js';

const theme = new Theme(ThemeTokens);

if (theme.getColor('canvasBackground') !== '#7a00df') {
  throw new Error('canvasBackground mismatch');
}

if (theme.getColor('actorFill') !== '#ed9700') {
  throw new Error('actorFill mismatch');
}

console.log('theme tests passed');

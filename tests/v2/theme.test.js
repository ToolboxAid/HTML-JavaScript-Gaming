import { Theme } from '../../engine/v2/theme/Theme.js';
import { ThemeTokens } from '../../engine/v2/theme/ThemeTokens.js';

const theme = new Theme(ThemeTokens);

if (theme.getColor('canvasBackground') !== '#7a00df') {
  throw new Error('canvasBackground mismatch');
}

if (theme.getColor('actorFill') !== '#ed9700') {
  throw new Error('actorFill mismatch');
}

console.log('theme tests passed');

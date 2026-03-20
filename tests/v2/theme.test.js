import { Theme } from '../../engine/v2/theme/Theme.js';
import { ThemeTokens } from '../../engine/v2/theme/ThemeTokens.js';

const theme = new Theme(ThemeTokens);

if (theme.getColor('brandPrimary') !== '#7a00df') {
  throw new Error('brandPrimary mismatch');
}

if (theme.getColor('brandAccent') !== '#ed9700') {
  throw new Error('brandAccent mismatch');
}

console.log('theme tests passed');
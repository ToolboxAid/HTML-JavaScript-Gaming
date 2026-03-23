/*
Toolbox Aid
David Quesenberry
03/22/2026
LocalizationSystemScene.js
*/
import { Scene } from '../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../engine/debug/index.js';
import { LocalizationService } from '../../engine/localization/index.js';

const theme = new Theme(ThemeTokens);

export default class LocalizationSystemScene extends Scene {
  constructor() {
    super();
    this.localization = new LocalizationService({
      en: { title: 'Hello Explorer', hint: 'Press L to switch language.' },
      es: { title: 'Hola Explorador', hint: 'Presiona L para cambiar idioma.' },
    });
  }

  update(_dt, engine) {
    if (engine.input.isActionPressed('toggle_language')) {
      this.localization.setLanguage(this.localization.language === 'en' ? 'es' : 'en');
    }
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample119',
      'Localized text resolves through engine-owned language lookup instead of scene string switches.',
      this.localization.t('hint'),
    ]);
    drawPanel(renderer, 620, 34, 300, 126, 'Localization', [
      `Language: ${this.localization.language}`,
      `Title: ${this.localization.t('title')}`,
      `Hint: ${this.localization.t('hint')}`,
      'Press L to toggle.',
    ]);
  }
}

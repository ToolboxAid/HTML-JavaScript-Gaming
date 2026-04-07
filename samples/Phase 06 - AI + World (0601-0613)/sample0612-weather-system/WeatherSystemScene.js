/*
Toolbox Aid
David Quesenberry
03/22/2026
WeatherSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { WeatherSystem } from '../../../engine/world/index.js';

const theme = new Theme(ThemeTokens);

export default class WeatherSystemScene extends Scene {
  constructor() {
    super();
    this.weather = new WeatherSystem(['clear', 'rain', 'wind']);
  }

  update(dt) {
    this.weather.update(dt, 2.2);
  }

  render(renderer) {
    const current = this.weather.getCurrent();
    drawFrame(renderer, theme, [
      'Engine sample 0611',
      'Weather state is managed by a reusable engine-owned system and fed into world presentation.',
      `Current weather: ${current}`,
    ]);

    if (current === 'rain') {
      for (let i = 0; i < 20; i += 1) {
        renderer.drawRect(120 + i * 34, 180 + (i % 4) * 28, 2, 18, '#60a5fa');
      }
    } else if (current === 'wind') {
      for (let i = 0; i < 8; i += 1) {
        renderer.drawRect(140 + i * 80, 240 + (i % 3) * 34, 40, 4, '#e2e8f0');
      }
    } else {
      renderer.drawCircle(200, 220, 26, '#fbbf24');
    }

    drawPanel(renderer, 620, 34, 300, 126, 'Weather System', [
      `State: ${current}`,
      `Pattern length: ${this.weather.pattern.length}`,
      `Index: ${this.weather.index}`,
      'Presentation changes with weather state.',
    ]);
  }
}

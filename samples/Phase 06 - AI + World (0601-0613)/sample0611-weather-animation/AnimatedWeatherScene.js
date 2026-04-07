/*
Toolbox Aid
David Quesenberry
03/22/2026
AnimatedWeatherScene.js
*/
import { Scene } from '../../../src/engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../src/engine/debug/index.js';
import { WeatherSystem } from '../../../src/engine/world/index.js';

const theme = new Theme(ThemeTokens);

function wrapValue(value, max) {
  let next = value % max;
  if (next < 0) {
    next += max;
  }
  return next;
}

export default class AnimatedWeatherScene extends Scene {
  constructor() {
    super();
    this.weather = new WeatherSystem(['clear', 'rain', 'wind', 'storm']);
    this.cloudOffset = 0;
    this.cloudTravel = 0;
    this.kiteBaseX = 250;
    this.kiteX = this.kiteBaseX;
    this.kiteY = 205;
    this.raindrops = Array.from({ length: 30 }, (_, index) => ({
      x: 110 + (index % 10) * 48,
      y: 150 + Math.floor(index / 10) * 70,
      baseX: 110 + (index % 10) * 48,
      speed: 180 + (index % 5) * 24,
      length: 12 + (index % 4) * 4,
    }));
    this.gusts = Array.from({ length: 10 }, (_, index) => ({
      x: 110 + index * 82,
      y: 168 + (index % 5) * 36,
      width: 36 + (index % 3) * 12,
      speed: 90 + (index % 4) * 22,
    }));
  }

  update(dt) {
    this.weather.update(dt, 2.5);

    const current = this.weather.getCurrent();
    const hasWind = current === 'wind' || current === 'storm';
    const hasRain = current === 'rain' || current === 'storm';
    const cloudSpeed = hasWind ? 34 : -18;
    this.cloudTravel = wrapValue(this.cloudTravel + cloudSpeed * dt, 220);
    this.cloudOffset = this.cloudTravel;

    if (hasRain) {
      this.kiteX += (this.kiteBaseX - this.kiteX) * Math.min(1, dt * 3);
      for (const raindrop of this.raindrops) {
        raindrop.y = wrapValue(raindrop.y + raindrop.speed * dt - 110, 290) + 110;
        const drift = hasWind ? (raindrop.speed * 0.18) * dt : 0;
        raindrop.x = wrapValue(raindrop.x + drift - 110, 480) + 110;
        if (raindrop.y <= 112) {
          raindrop.x = wrapValue(raindrop.baseX + (hasWind ? this.cloudOffset * 0.55 : 0) - 110, 480) + 110;
        }
      }
    }

    if (hasWind) {
      this.kiteX += (330 - this.kiteX) * Math.min(1, dt * 4);
      for (const gust of this.gusts) {
        gust.x = wrapValue(gust.x + gust.speed * dt - 110, 760) + 110;
      }
      return;
    }

    this.kiteX += (this.kiteBaseX - this.kiteX) * Math.min(1, dt * 2.5);
  }

  render(renderer) {
    const current = this.weather.getCurrent();
    const hasWind = current === 'wind' || current === 'storm';
    const hasRain = current === 'rain' || current === 'storm';
    drawFrame(renderer, theme, [
      'Engine sample 0612',
      'Animated weather layers build on the reusable weather state system.',
      `Current weather: ${current}`,
    ]);

    const world = { x: 90, y: 140, width: 480, height: 280 };
    const skyColor = hasRain ? '#223449' : hasWind ? '#334155' : '#3b82f6';
    const groundColor = hasRain ? '#2f513d' : '#3f6212';
    renderer.drawRect(world.x, world.y, world.width, world.height, skyColor);
    renderer.drawRect(world.x, world.y + 208, world.width, 72, groundColor);

    renderer.drawCircle(160, 186, 24, current === 'clear' ? '#fbbf24' : '#94a3b8');
    renderer.drawRect(world.x, world.y + 180, world.width, 4, 'rgba(255,255,255,0.08)');

    for (let index = 0; index < 3; index += 1) {
      const cloudX = world.x + 70 + index * 130 + this.cloudOffset + index * 18;
      const cloudY = world.y + 36 + index * 16;
      renderer.drawCircle(cloudX, cloudY, 18, 'rgba(241,245,249,0.9)');
      renderer.drawCircle(cloudX + 18, cloudY + 4, 20, 'rgba(241,245,249,0.9)');
      renderer.drawCircle(cloudX + 40, cloudY, 16, 'rgba(241,245,249,0.9)');
    }

    renderer.drawRect(world.x + 110, world.y + 188, 14, 72, '#7c5a3c');
    renderer.drawRect(this.kiteX, this.kiteY, 18, 18, '#f87171');
    renderer.drawRect(this.kiteX + 7, this.kiteY + 18, 2, 40, '#e2e8f0');

    if (hasRain) {
      for (const raindrop of this.raindrops) {
        const dragX = hasWind ? raindrop.length * 0.35 : 0;
        renderer.drawRect(raindrop.x, raindrop.y, 2 + dragX, raindrop.length, '#60a5fa');
      }
      renderer.drawRect(world.x, world.y, world.width, world.height, 'rgba(15, 23, 42, 0.14)');
    }

    if (hasWind) {
      for (const gust of this.gusts) {
        renderer.drawRect(gust.x, gust.y, gust.width, 3, 'rgba(226, 232, 240, 0.9)');
      }
    }

    drawPanel(renderer, 620, 34, 300, 146, 'Weather Animation', [
      `State: ${current}`,
      `Rain streaks: ${this.raindrops.length}`,
      `Wind gusts: ${this.gusts.length}`,
      `Cloud drift: ${hasWind ? 'right / fast' : 'left / calm'}`,
      `Kite X: ${this.kiteX.toFixed(0)}`,
      'Storm combines rain and wind in the same view.',
    ]);
  }
}

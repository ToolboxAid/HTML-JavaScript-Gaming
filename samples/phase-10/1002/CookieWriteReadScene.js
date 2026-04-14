/*
Toolbox Aid
David Quesenberry
03/22/2026
CookieWriteReadScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class CookieWriteReadScene extends Scene {
  constructor(cookieStore) {
    super();
    this.cookieStore = cookieStore;
    this.status = 'Write, read, and clear a cookie through the engine-owned wrapper.';
    this.lastValue = null;
  }

  write(value) {
    this.cookieStore.set('sample139-theme', value);
    this.status = `Cookie written: ${value}`;
  }

  read() {
    this.lastValue = this.cookieStore.get('sample139-theme', 'none');
    this.status = `Cookie read: ${this.lastValue}`;
  }

  clear() {
    this.cookieStore.remove('sample139-theme');
    this.lastValue = null;
    this.status = 'Cookie cleared.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine sample 1002',
      'Cookie persistence is wrapped in an engine-owned service.',
      this.status,
    ]);

    renderer.drawRect(90, 240, 480, 140, '#0f172a');
    renderer.drawRect(120, 290, 180, 40, '#34d399');
    renderer.drawRect(340, 290, 180, 40, '#38bdf8');

    drawPanel(renderer, 620, 34, 300, 160, 'Cookie Write / Read', [
      `Supported: ${this.cookieStore.isSupported()}`,
      `Current Value: ${this.cookieStore.get('sample139-theme', 'none')}`,
      `Last Read: ${this.lastValue ?? 'none'}`,
      'Use the buttons below to prove persistence behavior.',
    ]);
  }
}

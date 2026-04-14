/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetBrowserScene.js
*/
import { Scene } from '/src/engine/scenes/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme, ThemeTokens } from '/src/engine/theme/index.js';
import { AssetBrowser } from '/src/engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class AssetBrowserScene extends Scene {
  constructor() {
    super();
    this.browser = new AssetBrowser([
      { id: 'hero-texture', category: 'texture', path: 'samples/phase-15/1505/assets/images/hero.png' },
      { id: 'menu-theme', category: 'audio', path: 'samples/phase-15/1505/assets/audio/menu.mp3' },
    ]);
    this.status = 'Select an asset category entry.';
  }

  select(id) {
    this.browser.select(id);
    this.status = `Selected ${id}.`;
  }

  render(renderer) {
    const selected = this.browser.getSelected();
    drawFrame(renderer, theme, [
      'Engine Sample 1505',
      'The asset browser exposes project content without coupling browsing logic to runtime scenes.',
      this.status,
    ]);
    drawPanel(renderer, 120, 220, 360, 180, 'Asset List', this.browser.list().map((asset) => `${asset.id} (${asset.category})`));
    drawPanel(renderer, 560, 40, 320, 180, 'Selected Asset', [
      `Id: ${selected?.id || 'none'}`,
      `Category: ${selected?.category || 'none'}`,
      `Path: ${selected?.path || 'none'}`,
    ]);
  }
}

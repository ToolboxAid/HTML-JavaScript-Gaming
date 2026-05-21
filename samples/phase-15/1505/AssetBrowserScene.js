/*
Toolbox Aid
David Quesenberry
03/22/2026
AssetBrowserScene.js
*/
import { Scene } from '/src/engine/scene/index.js';
import { drawFrame, drawPanel } from '/src/engine/debug/index.js';
import { Theme } from '/src/engine/theme/Theme.js';
import { ThemeTokens } from '/src/engine/theme/ThemeTokens.js';
import AssetBrowser from '/tools/shared/tooling/AssetBrowser.js';

const theme = new Theme(ThemeTokens);

export default class AssetBrowserScene extends Scene {
  constructor(options = {}) {
    super();
    const canonicalAssets = Array.isArray(options.assets) ? options.assets : [];
    this.browser = new AssetBrowser(canonicalAssets);
    this.status = typeof options.sourceStatus === 'string' && options.sourceStatus
      ? options.sourceStatus
      : 'Select an asset category entry.';
  }

  select(id) {
    if (!id) {
      this.status = 'No explicit JSON asset is mapped to this control.';
      return;
    }
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

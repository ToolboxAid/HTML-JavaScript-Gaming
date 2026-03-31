/*
Toolbox Aid
David Quesenberry
03/22/2026
PackagingBuildSystemScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';

const theme = new Theme(ThemeTokens);

export default class PackagingBuildSystemScene extends Scene {
  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample120',
      'The repo now has a repeatable manifest-generation build step for packaging sample outputs.',
      'This sample surfaces the build direction rather than re-implementing packaging in scene code.',
    ]);
    drawPanel(renderer, 60, 180, 840, 180, 'Packaging / Build System', [
      'npm run build:manifest',
      'scripts/generate-sample-manifest.mjs',
      'docs/build/sample-manifest.json',
      'Build flow is repo-owned and repeatable.',
    ]);
  }
}

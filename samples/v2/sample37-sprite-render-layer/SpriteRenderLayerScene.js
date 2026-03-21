import Scene from '../../../engine/v2/scenes/Scene.js';
import { Theme, ThemeTokens } from '../../../engine/v2/theme/index.js';
import { drawFrame, drawPanel } from '../../../engine/v2/debug/index.js';
import { renderSpriteReadyEntities } from '../../../engine/v2/render/index.js';

const theme = new Theme(ThemeTokens);

export default class SpriteRenderLayerScene extends Scene {
  constructor() {
    super();
    this.entities = [
      { x: 140, y: 250, width: 58, height: 58, color: theme.getColor('actorFill'), label: 'colorRect' },
      { x: 300, y: 250, width: 58, height: 58, spriteColor: '#60a5fa', label: 'spriteReady' },
      { x: 460, y: 250, width: 58, height: 58, spriteColor: '#f59e0b', label: 'frameProxy' },
    ];
  }

  update() {}

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine V2 Sample37',
      'Demonstrates a sprite-ready render path with fallback rendering',
      'Entities can provide a sprite-ready color proxy or a plain fallback color',
      'This sample establishes the render boundary for future image-based sprites',
      'Labels identify the current render source style',
    ]);

    renderSpriteReadyEntities(renderer, this.entities, { label: true, labelOffsetY: 80 });

    drawPanel(renderer, 620, 184, 300, 126, 'Sprite Render Layer', [
      'Fallback: color',
      'Sprite-ready: spriteColor',
      'Future step: real atlas frames',
      'Current output uses safe proxies',
    ]);
  }
}

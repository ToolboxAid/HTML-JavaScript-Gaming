/*
Toolbox Aid
David Quesenberry
03/22/2026
SceneGraphEntityHierarchyViewerScene.js
*/
import { Scene } from '../../../engine/scenes/index.js';
import { drawFrame, drawPanel } from '../../../engine/debug/index.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { SceneGraphViewer } from '../../../engine/tooling/index.js';

const theme = new Theme(ThemeTokens);

export default class SceneGraphEntityHierarchyViewerScene extends Scene {
  constructor() {
    super();
    this.viewer = new SceneGraphViewer();
    this.rows = [];
    this.status = 'Refresh the scene graph to inspect hierarchy relationships.';
  }

  refresh() {
    this.rows = this.viewer.flatten([
      {
        id: 'root',
        label: 'Root',
        children: [
          { id: 'player', label: 'Player', children: [] },
          { id: 'camera-rig', label: 'CameraRig', children: [{ id: 'camera', label: 'Camera', children: [] }] },
        ],
      },
    ]);
    this.status = 'Hierarchy refreshed from the scene graph viewer.';
  }

  render(renderer) {
    drawFrame(renderer, theme, [
      'Engine Sample 1506',
      'Hierarchy inspection is handled by a reusable scene graph viewer instead of custom per-scene tree code.',
      this.status,
    ]);
    drawPanel(renderer, 120, 200, 420, 260, 'Hierarchy', this.rows.length > 0
      ? this.rows.map((row) => `${' '.repeat(row.depth * 2)}${row.label} (${row.childCount})`)
      : ['No hierarchy loaded yet.']);
  }
}

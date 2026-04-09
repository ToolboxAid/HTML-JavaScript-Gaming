/*
Toolbox Aid
David Quesenberry
03/22/2026
DeveloperToolingSystems.test.mjs
*/
import assert from 'node:assert/strict';
import {
  AssetBrowser,
  DeveloperConsole,
  LiveTuningService,
  PropertyEditor,
  RuntimeInspector,
  SceneGraphViewer,
} from '/src/engine/tooling/index.js';

export async function run() {
  const consoleTool = new DeveloperConsole();
  consoleTool.register('echo', (args) => args.join(' '));
  assert.equal(consoleTool.execute('echo hello world').output, 'hello world');

  const inspector = new RuntimeInspector();
  assert.deepEqual(inspector.inspect({ x: 3, y: 4 }, ['x']), { x: 3 });

  const editor = new PropertyEditor();
  const target = { hp: 3 };
  editor.set(target, 'hp', 5);
  assert.equal(target.hp, 5);

  const tuning = new LiveTuningService({ speed: 2 });
  let observed = 0;
  tuning.onChange('speed', (value) => {
    observed = value;
  });
  tuning.set('speed', 4);
  assert.equal(observed, 4);

  const browser = new AssetBrowser([
    { id: 'hero', category: 'texture' },
    { id: 'theme', category: 'audio' },
  ]);
  browser.select('theme');
  assert.equal(browser.getSelected().id, 'theme');
  assert.equal(browser.list('texture').length, 1);

  const graph = new SceneGraphViewer();
  const flattened = graph.flatten([
    {
      id: 'root',
      children: [{ id: 'child-a', children: [] }, { id: 'child-b', children: [{ id: 'leaf', children: [] }] }],
    },
  ]);
  assert.equal(flattened.length, 4);
  assert.equal(flattened[3].depth, 2);
}

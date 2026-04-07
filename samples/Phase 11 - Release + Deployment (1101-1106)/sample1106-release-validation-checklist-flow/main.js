/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../src/engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../src/engine/theme/index.js';
import { ReleaseValidationChecklist } from '../../../src/engine/release/index.js';
import ReleaseValidationChecklistScene from './ReleaseValidationChecklistScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const checklist = new ReleaseValidationChecklist([
  {
    id: 'manifest',
    label: 'Manifest',
    run: (context) => ({ passed: context.manifestUpdated, detail: context.manifestUpdated ? 'Updated.' : 'Needs rebuild.' }),
  },
  {
    id: 'tests',
    label: 'Tests',
    run: (context) => ({ passed: context.testsPassing, detail: context.testsPassing ? 'Passing.' : 'Failures detected.' }),
  },
  {
    id: 'packaging',
    label: 'Packaging',
    run: (context) => ({ passed: context.packageReady, detail: context.packageReady ? 'Ready.' : 'Artifacts missing.' }),
  },
  {
    id: 'notes',
    label: 'Release Notes',
    required: false,
    run: (context) => ({ passed: context.releaseNotes, detail: context.releaseNotes ? 'Attached.' : 'Optional.' }),
  },
]);
const scene = new ReleaseValidationChecklistScene(checklist);
engine.setScene(scene);
engine.start();

document.getElementById('validation-ready')?.addEventListener('click', () => {
  scene.validate({
    manifestUpdated: true,
    testsPassing: true,
    packageReady: true,
    releaseNotes: true,
  }, 'Ready build');
});

document.getElementById('validation-blocked')?.addEventListener('click', () => {
  scene.validate({
    manifestUpdated: true,
    testsPassing: false,
    packageReady: false,
    releaseNotes: false,
  }, 'Blocked build');
});

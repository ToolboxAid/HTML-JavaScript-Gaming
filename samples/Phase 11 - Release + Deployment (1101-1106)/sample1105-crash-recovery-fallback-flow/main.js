/*
Toolbox Aid
David Quesenberry
03/22/2026
main.js
*/
import Engine from '../../../engine/core/Engine.js';
import { Theme, ThemeTokens } from '../../../engine/theme/index.js';
import { Logger } from '../../../engine/logging/index.js';
import { CrashRecoveryManager } from '../../../engine/release/index.js';
import CrashRecoveryScene from './CrashRecoveryScene.js';

const theme = new Theme(ThemeTokens);
theme.applyDocumentTheme();

const canvas = document.getElementById('game');
const engine = new Engine({ canvas, width: 960, height: 540 });
const logger = new Logger({ channel: 'sample145', level: 'debug' });
const recovery = new CrashRecoveryManager({
  namespace: 'toolboxaid:sample145',
  logger,
  fallbackFactory: (crash) => ({ screen: 'fallback', reason: crash.label }),
});
const scene = new CrashRecoveryScene(recovery);
engine.setScene(scene);
engine.start();

document.getElementById('recovery-safe')?.addEventListener('click', () => scene.runSafe());
document.getElementById('recovery-crash')?.addEventListener('click', () => scene.triggerCrash());
document.getElementById('recovery-restore')?.addEventListener('click', () => scene.restore());
document.getElementById('recovery-clear')?.addEventListener('click', () => scene.clear());

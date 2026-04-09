/*
Toolbox Aid
David Quesenberry
03/22/2026
FinalSystems.test.mjs
*/
import assert from 'node:assert/strict';
import { compressJson, decompressJson } from '/src/engine/persistence/index.js';
import { ReplaySystem } from '/src/engine/replay/index.js';
import { AchievementSystem } from '/src/engine/world/index.js';
import { LocalizationService } from '/src/engine/localization/index.js';

export function run() {
  const compressed = compressJson({ hp: 3, coins: 12 });
  const restored = decompressJson(compressed);
  assert.equal(restored.coins, 12);

  const replay = new ReplaySystem();
  replay.startRecording();
  replay.recordFrame({ x: 10 });
  replay.recordFrame({ x: 20 });
  replay.stopRecording();
  replay.startPlayback();
  assert.deepEqual(replay.nextFrame(), { x: 10 });
  assert.deepEqual(replay.nextFrame(), { x: 20 });

  const achievements = new AchievementSystem([
    { id: 'win', condition: ({ score }) => score >= 10 },
  ]);
  achievements.evaluate({ score: 12 });
  assert.equal(achievements.getAll()[0].unlocked, true);

  const localization = new LocalizationService({
    en: { hello: 'Hello' },
    es: { hello: 'Hola' },
  });
  localization.setLanguage('es');
  assert.equal(localization.t('hello'), 'Hola');
}

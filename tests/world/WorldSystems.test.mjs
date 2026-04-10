/*
Toolbox Aid
David Quesenberry
03/22/2026
WorldSystems.test.mjs
*/
import assert from 'node:assert/strict';
import EventBus from '../../src/engine/events/EventBus.js';
import {
  CutsceneSystem,
  DayNightCycle,
  EventScriptSystem,
  QuestSystem,
  SpawnSystem,
  WeatherSystem,
  WorldStreamingSystem,
} from '../../src/engine/world/index.js';

export function run() {
  const quests = new QuestSystem([{ id: 'collect', required: 2 }]);
  quests.advance('collect');
  quests.advance('collect');
  assert.equal(quests.get('collect').completed, true);

  const bus = new EventBus();
  const seen = [];
  const scripts = new EventScriptSystem({
    bus,
    scripts: [{
      event: 'lever',
      actions: [
        (payload) => seen.push(payload.state),
      ],
    }],
  });
  bus.emit('lever', { state: 'on' });
  assert.deepEqual(seen, ['on']);
  scripts.dispose();

  let entered = 0;
  let exited = 0;
  const cutscene = new CutsceneSystem({
    steps: [{
      duration: 0.1,
      enter: () => { entered += 1; },
      exit: () => { exited += 1; },
    }],
  });
  cutscene.update(0.2, {});
  assert.equal(entered, 1);
  assert.equal(exited, 1);
  assert.equal(cutscene.active, false);

  const spawnSystem = new SpawnSystem([{ id: 'orb', interval: 0.2, limit: 2 }]);
  const spawned = [];
  spawned.push(...spawnSystem.update(0.2, (rule) => rule.id));
  spawned.push(...spawnSystem.update(0.2, (rule) => rule.id));
  assert.equal(spawned.length, 2);

  const cycle = new DayNightCycle({ durationSeconds: 4 });
  cycle.update(1);
  assert.equal(cycle.getPhaseRatio() > 0, true);

  const weather = new WeatherSystem(['clear', 'rain']);
  weather.update(2, 1);
  assert.equal(weather.getCurrent(), 'rain');

  const streaming = new WorldStreamingSystem({ chunkWidth: 100, radius: 1 });
  assert.deepEqual(streaming.update(250), [1, 2, 3]);
}

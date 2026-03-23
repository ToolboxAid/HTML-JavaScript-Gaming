/*
 Toolbox Aid
 David Quesenberry
 03/23/2026
 ParticleSystem.test.mjs
*/
import assert from 'node:assert/strict';
import { ParticleSystem } from '../../engine/fx/index.js';

function createSequenceRandom(values) {
  let index = 0;

  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

export function run() {
  const sequence = [0.1, 0.7, 0.25, 0.9, 0.4, 0.6, 0.2, 0.8, 0.3];
  const first = new ParticleSystem({ random: createSequenceRandom(sequence) });
  const second = new ParticleSystem({ random: createSequenceRandom(sequence) });

  first.spawnExplosion({
    x: 40,
    y: 55,
    count: 3,
    speed: 140,
    lifeSeconds: 1.1,
    randomize: true,
    shape: 'circle',
    color: '#ffaa00',
  });
  second.spawnExplosion({
    x: 40,
    y: 55,
    count: 3,
    speed: 140,
    lifeSeconds: 1.1,
    randomize: true,
    shape: 'circle',
    color: '#ffaa00',
  });

  assert.deepEqual(first.getSnapshot(), second.getSnapshot());

  const fallbackRandomSystem = new ParticleSystem({ random: 'invalid' });
  fallbackRandomSystem.spawnExplosion({ x: 10, y: 20, count: 2, randomize: true });
  assert.equal(fallbackRandomSystem.getSnapshot().length, 2);
}

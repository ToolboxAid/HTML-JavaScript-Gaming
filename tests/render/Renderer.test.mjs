/*
Toolbox Aid
David Quesenberry
03/21/2026
Renderer.test.mjs
*/
import assert from 'node:assert/strict';
import { CanvasRenderer } from '../../engine/render/index.js';

function createFakeContext() {
  const calls = [];
  const canvas = { width: 320, height: 180 };
  const ctx = {
    canvas,
    calls,
    fillStyle: '#000000',
    strokeStyle: '#000000',
    lineWidth: 1,
    font: '10px sans-serif',
    textAlign: 'start',
    textBaseline: 'alphabetic',
    fillRect(...args) { calls.push(['fillRect', ...args]); },
    clearRect(...args) { calls.push(['clearRect', ...args]); },
    strokeRect(...args) { calls.push(['strokeRect', ...args]); },
    beginPath() { calls.push(['beginPath']); },
    arc(...args) { calls.push(['arc', ...args]); },
    fill() { calls.push(['fill']); },
    fillText(...args) { calls.push(['fillText', ...args]); },
  };
  return ctx;
}

{
  const ctx = createFakeContext();
  const renderer = new CanvasRenderer(ctx);
  renderer.clear('#112233');
  assert.deepEqual(ctx.calls[0], ['fillRect', 0, 0, 320, 180]);
}

{
  const ctx = createFakeContext();
  const renderer = new CanvasRenderer(ctx);
  renderer.drawRect(1, 2, 3, 4, '#abcdef');
  assert.equal(ctx.fillStyle, '#abcdef');
  assert.deepEqual(ctx.calls[0], ['fillRect', 1, 2, 3, 4]);
}

{
  const ctx = createFakeContext();
  const renderer = new CanvasRenderer(ctx);
  renderer.drawText('hello', 10, 20, { color: '#dddddd', font: '16px monospace', textAlign: 'center', textBaseline: 'middle' });
  assert.equal(ctx.fillStyle, '#dddddd');
  assert.equal(ctx.font, '16px monospace');
  assert.deepEqual(ctx.calls[0], ['fillText', 'hello', 10, 20]);
  assert.equal(ctx.textAlign, 'start');
  assert.equal(ctx.textBaseline, 'alphabetic');
}

console.log('Renderer.test.mjs passed');

/*
Toolbox Aid
David Quesenberry
03/21/2026
Renderer.test.mjs
*/
import assert from 'node:assert/strict';
import { CanvasRenderer } from '../../src/engine/rendering/index.js';

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
    moveTo(...args) { calls.push(['moveTo', ...args]); },
    lineTo(...args) { calls.push(['lineTo', ...args]); },
    closePath() { calls.push(['closePath']); },
    stroke() { calls.push(['stroke']); },
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

{
  const ctx = createFakeContext();
  const renderer = new CanvasRenderer(ctx);
  renderer.drawLine(1, 2, 3, 4, '#ffffff', 2);
  assert.deepEqual(ctx.calls.slice(0, 4), [
    ['beginPath'],
    ['moveTo', 1, 2],
    ['lineTo', 3, 4],
    ['stroke'],
  ]);
}

{
  const ctx = createFakeContext();
  const renderer = new CanvasRenderer(ctx);
  renderer.drawPolygon([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 }], { fillColor: '#333333', strokeColor: '#ffffff' });
  assert.equal(ctx.calls.some((entry) => entry[0] === 'closePath'), true);
  assert.equal(ctx.calls.some((entry) => entry[0] === 'fill'), true);
  assert.equal(ctx.calls.some((entry) => entry[0] === 'stroke'), true);
}

console.log('Renderer.test.mjs passed');

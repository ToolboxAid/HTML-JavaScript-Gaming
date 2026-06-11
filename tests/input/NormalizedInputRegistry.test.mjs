/*
Toolbox Aid
David Quesenberry
06/10/2026
NormalizedInputRegistry.test.mjs
*/
import assert from 'node:assert/strict';
import {
  defaultNormalizedInputForPhysicalInput,
  normalizeNormalizedInput,
  normalizeProfileInputMappings,
  normalizedInputOptions,
  physicalInputIsAnalog,
} from '../../src/engine/input/NormalizedInputRegistry.js';

function testRegistryContainsPlayableNormalizedInputs() {
  assert.deepEqual(normalizedInputOptions().map((option) => option.value), [
    'move.x',
    'move.y',
    'aim.x',
    'aim.y',
    'button.south',
    'button.east',
    'button.west',
    'button.north',
    'dpad.up',
    'dpad.down',
    'dpad.left',
    'dpad.right',
    'trigger.left',
    'trigger.right',
    'start',
    'select',
  ]);
}

function testPhysicalDefaultsRouteThroughNormalizedInputs() {
  assert.equal(defaultNormalizedInputForPhysicalInput('Button0'), 'button.south');
  assert.equal(defaultNormalizedInputForPhysicalInput('Button1'), 'button.east');
  assert.equal(defaultNormalizedInputForPhysicalInput('DPad Up'), 'dpad.up');
  assert.equal(defaultNormalizedInputForPhysicalInput('Trigger Right'), 'trigger.right');
  assert.equal(defaultNormalizedInputForPhysicalInput('Axis0'), 'move.x');
  assert.equal(defaultNormalizedInputForPhysicalInput('Axis3'), 'aim.y');
  assert.equal(defaultNormalizedInputForPhysicalInput('KeyW'), 'move.y');
  assert.equal(defaultNormalizedInputForPhysicalInput('MouseX'), 'aim.x');
}

function testProfileInputMappingsPreserveAnalogSettings() {
  assert.equal(physicalInputIsAnalog('Axis0'), true);
  assert.equal(physicalInputIsAnalog('Button0'), false);
  assert.deepEqual(normalizeProfileInputMappings(
    ['Button0', 'Axis0'],
    [{ deadzone: 0.35, invert: true, normalizedInput: 'aim.x', physicalInput: 'Axis0' }],
  ), [
    { deadzone: 0.2, invert: false, normalizedInput: 'button.south', physicalInput: 'Button0' },
    { deadzone: 0.35, invert: true, normalizedInput: 'aim.x', physicalInput: 'Axis0' },
  ]);
}

function testInvalidNormalizedInputDoesNotSilentlyBecomeAction() {
  assert.equal(normalizeNormalizedInput('fire', 'button.south'), 'button.south');
  assert.equal(normalizeNormalizedInput('move.x', 'button.south'), 'move.x');
}

export function run() {
  testRegistryContainsPlayableNormalizedInputs();
  testPhysicalDefaultsRouteThroughNormalizedInputs();
  testProfileInputMappingsPreserveAnalogSettings();
  testInvalidNormalizedInputDoesNotSilentlyBecomeAction();
}

run();
console.log('NormalizedInputRegistry tests passed');

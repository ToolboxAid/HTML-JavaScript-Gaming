/*
Toolbox Aid
David Quesenberry
06/10/2026
NormalizedInputRegistry.test.mjs
*/
import assert from 'node:assert/strict';
import {
  defaultNormalizedInputForPhysicalInput,
  defaultNormalizedInputDirectionsForPhysicalInput,
  normalizeNormalizedInput,
  normalizeProfileInputMappings,
  normalizedInputOptions,
  physicalInputSensitivityDescriptor,
  physicalInputIsAnalog,
  resolveNormalizedInputProfile,
  resolvePhysicalAxisNormalizedInput,
  systemDefaultProfileForDevice,
} from '../../../www/src/engine/input/NormalizedInputRegistry.js';

function testRegistryContainsPlayableNormalizedInputs() {
  assert.deepEqual(normalizedInputOptions().map((option) => option.value), [
    'move.x-',
    'move.x+',
    'move.y-',
    'move.y+',
    'aim.x-',
    'aim.x+',
    'aim.y-',
    'aim.y+',
    'action.primary',
    'action.secondary',
    'action.tertiary',
    'action.quaternary',
    'action.confirm',
    'action.cancel',
    'action.menu',
    'action.start',
    'action.select',
    'action.pause',
    'dpad.up',
    'dpad.down',
    'dpad.left',
    'dpad.right',
    'trigger.left',
    'trigger.right',
  ]);
}

function testPhysicalDefaultsRouteThroughNormalizedInputs() {
  assert.equal(defaultNormalizedInputForPhysicalInput('Button0'), 'action.primary');
  assert.equal(defaultNormalizedInputForPhysicalInput('Button1'), 'action.secondary');
  assert.equal(defaultNormalizedInputForPhysicalInput('DPad Up'), 'move.y-');
  assert.equal(defaultNormalizedInputForPhysicalInput('DPad Down'), 'move.y+');
  assert.equal(defaultNormalizedInputForPhysicalInput('DPad Left'), 'move.x-');
  assert.equal(defaultNormalizedInputForPhysicalInput('DPad Right'), 'move.x+');
  assert.equal(defaultNormalizedInputForPhysicalInput('Trigger Left'), 'action.primary');
  assert.equal(defaultNormalizedInputForPhysicalInput('Trigger Right'), 'action.secondary');
  assert.equal(defaultNormalizedInputForPhysicalInput('Axis0'), 'move.x+');
  assert.equal(defaultNormalizedInputForPhysicalInput('Axis3'), 'aim.y+');
  assert.equal(defaultNormalizedInputForPhysicalInput('KeyW'), 'move.y-');
  assert.equal(defaultNormalizedInputForPhysicalInput('Space'), 'action.primary');
  assert.equal(defaultNormalizedInputForPhysicalInput('MouseX'), 'aim.x+');
  assert.deepEqual(defaultNormalizedInputDirectionsForPhysicalInput('Axis0'), {
    negative: 'move.x-',
    positive: 'move.x+',
  });
}

function testProfileInputMappingsPreserveAnalogSettings() {
  assert.equal(physicalInputIsAnalog('Axis0'), true);
  assert.equal(physicalInputIsAnalog('Button0'), false);
  assert.deepEqual(normalizeProfileInputMappings(
    ['Button0', 'Axis0'],
    [{ deadzone: 0.35, invert: true, negativeNormalizedInput: 'aim.x-', physicalInput: 'Axis0', positiveNormalizedInput: 'aim.x+' }],
  ), [
    { deadzone: 0.2, invert: false, negativeNormalizedInput: '', normalizedInput: 'action.primary', physicalInput: 'Button0', positiveNormalizedInput: '', sensitivity: undefined },
    { deadzone: 0.35, invert: true, negativeNormalizedInput: 'aim.x-', normalizedInput: 'aim.x+', physicalInput: 'Axis0', positiveNormalizedInput: 'aim.x+', sensitivity: 100 },
  ]);
}

function testPhysicalSensitivityDescriptors() {
  assert.equal(physicalInputSensitivityDescriptor('MouseX').label, 'Mouse movement sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('MouseWheelUp').label, 'Mouse wheel sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('Potentiometer0').label, 'Potentiometer/analog knob sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('Knob0').label, 'Potentiometer/analog knob sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('Axis0').label, 'Joystick/gamepad axis sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('LT').label, 'Trigger sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('RT').label, 'Trigger sensitivity');
  assert.equal(physicalInputSensitivityDescriptor('Button0'), null);
}

function testInvalidNormalizedInputDoesNotSilentlyBecomeAction() {
  assert.equal(normalizeNormalizedInput('fire', 'action.primary'), 'action.primary');
  assert.equal(normalizeNormalizedInput('move.x-', 'action.primary'), 'move.x-');
}

function testSystemDefaultProfilesAreVisibleFallbackContracts() {
  const gamepadDefault = systemDefaultProfileForDevice('Gamepad');
  const keyboardMouseDefault = systemDefaultProfileForDevice('Keyboard/Mouse');
  assert.equal(gamepadDefault.mappingProfile, 'System Default Gamepad');
  assert.equal(keyboardMouseDefault.mappingProfile, 'System Default Keyboard/Mouse');
  assert.equal(gamepadDefault.systemDefault, true);
  assert.equal(keyboardMouseDefault.systemDefault, true);
  assert.equal(gamepadDefault.inputMappings.find((mapping) => mapping.physicalInput === 'Button0').normalizedInput, 'action.primary');
  assert.equal(keyboardMouseDefault.inputMappings.find((mapping) => mapping.physicalInput === 'Space').normalizedInput, 'action.primary');
  assert.deepEqual(gamepadDefault.inputMappings.find((mapping) => mapping.physicalInput === 'Axis0'), {
    deadzone: 0.2,
    invert: false,
    negativeNormalizedInput: 'move.x-',
    normalizedInput: 'move.x+',
    physicalInput: 'Axis0',
    positiveNormalizedInput: 'move.x+',
    sensitivity: 100,
  });
}

function testAxisDirectionResolutionUsesSharedDeadzoneAndInvert() {
  const mapping = {
    deadzone: 0.35,
    invert: false,
    negativeNormalizedInput: 'move.x-',
    positiveNormalizedInput: 'move.x+',
  };
  assert.equal(resolvePhysicalAxisNormalizedInput(mapping, 0.2), '');
  assert.equal(resolvePhysicalAxisNormalizedInput(mapping, -0.7), 'move.x-');
  assert.equal(resolvePhysicalAxisNormalizedInput(mapping, 0.7), 'move.x+');
  assert.equal(resolvePhysicalAxisNormalizedInput({ ...mapping, invert: true }, -0.7), 'move.x+');
}

function testRuntimeLookupOrder() {
  const keyboardMouseProfile = {
    controllerId: 'keyboard-mouse',
    deviceType: 'Keyboard/Mouse',
    mappingProfile: 'My Keyboard/Mouse',
  };
  const exactGamepadProfile = {
    controllerId: 'Arcade Pad',
    deviceType: 'Gamepad',
    mappingProfile: 'My Arcade Pad',
  };
  assert.equal(resolveNormalizedInputProfile({
    device: { controllerId: 'Arcade Pad', deviceType: 'Gamepad' },
    profiles: [keyboardMouseProfile, exactGamepadProfile],
  }).lookupStep, 1);
  assert.equal(resolveNormalizedInputProfile({
    device: { controllerId: 'Other Pad', deviceType: 'Gamepad' },
    profiles: [keyboardMouseProfile],
  }).lookupStep, 2);
  const gamepadDefault = resolveNormalizedInputProfile({
    device: { controllerId: 'Other Pad', deviceType: 'Gamepad' },
    profiles: [],
  });
  assert.equal(gamepadDefault.lookupStep, 3);
  assert.equal(gamepadDefault.status, 'Using Default Gamepad Mapping');
  const keyboardDefault = resolveNormalizedInputProfile({
    device: { controllerId: 'keyboard-mouse', deviceType: 'Keyboard/Mouse' },
    profiles: [],
  });
  assert.equal(keyboardDefault.lookupStep, 4);
  assert.equal(keyboardDefault.status, 'Using Default Keyboard/Mouse Mapping');
  assert.equal(resolveNormalizedInputProfile({ device: null, profiles: [] }).lookupStep, 5);
}

export function run() {
  testRegistryContainsPlayableNormalizedInputs();
  testPhysicalDefaultsRouteThroughNormalizedInputs();
  testProfileInputMappingsPreserveAnalogSettings();
  testPhysicalSensitivityDescriptors();
  testInvalidNormalizedInputDoesNotSilentlyBecomeAction();
  testSystemDefaultProfilesAreVisibleFallbackContracts();
  testAxisDirectionResolutionUsesSharedDeadzoneAndInvert();
  testRuntimeLookupOrder();
}

run();
console.log('NormalizedInputRegistry tests passed');

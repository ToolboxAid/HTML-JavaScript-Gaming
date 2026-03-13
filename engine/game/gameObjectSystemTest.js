// ToolboxAid.com
// David Quesenberry
// 03/13/2026
// gameObjectSystemTest.js

import GameObjectManager from '../gameObjectManager.js';
import GameObjectRegistry from '../gameObjectRegistry.js';
import GameObjectSystem from '../gameObjectSystem.js';

export function testGameObjectSystem(assert) {
    testManager(assert);
    testRegistry(assert);
    testSystem(assert);
}

function testManager(assert) {
    const manager = new GameObjectManager(false);
    const a = createMockGameObject('a');

    assert(manager.getCount() === 0, 'manager should start empty');
    assert(manager.addGameObject(a) === true, 'manager should add object');
    assert(manager.getCount() === 1, 'manager count should increment');
    assert(manager.addGameObject(a) === false, 'manager should reject duplicate object');
    assert(manager.findGameObjectById('a') === a, 'manager should find object by id');
    assert(manager.removeGameObject(a) === true, 'manager should remove object');
    assert(a.destroyCalls === 1, 'manager remove should destroy object once');
    assert(manager.getCount() === 0, 'manager count should decrement');
    assert(manager.destroy() === true, 'manager destroy should succeed');
}

function testRegistry(assert) {
    const registry = new GameObjectRegistry(false);
    const a = createMockGameObject('a');

    assert(registry.register(a) === true, 'registry should register object');
    assert(registry.getById('a') === a, 'registry should return object by id');
    assert(registry.hasId('a') === true, 'registry should report id present');
    assert(registry.unregister(a) === true, 'registry should unregister existing object');
    assert(registry.getById('a') === null, 'registry should return null for missing object');

    assertThrows(() => {
        registry.register(a);
        registry.register(a);
    }, 'Duplicate GameObject ID detected');
}

function testSystem(assert) {
    const system = new GameObjectSystem(false);
    const a = createMockGameObject('a');
    const b = createMockGameObject('b');
    const duplicateId = createMockGameObject('a');

    assert(system.addGameObject(a) === true, 'system should add first object');
    assert(system.addGameObject(b) === true, 'system should add second object');
    assert(system.getCount() === 2, 'system count should be two after adds');
    assert(system.hasGameObjectById('a') === true, 'system should expose registry membership');

    assert(system.addGameObject(duplicateId) === false, 'system should gracefully reject duplicate id');
    assert(duplicateId.destroyCalls === 1, 'duplicate object should be destroyed during rollback');
    assert(system.getCount() === 2, 'duplicate id should not change system count');

    assert(system.removeGameObject(a) === true, 'system should remove object');
    assert(a.destroyCalls === 1, 'system remove should destroy object once');
    assert(system.getCount() === 1, 'system count should decrement after remove');

    assert(system.clear() === true, 'system clear should succeed');
    assert(system.getCount() === 0, 'system clear should empty manager');
    assert(b.destroyCalls === 1, 'system clear should destroy remaining objects');
}

function createMockGameObject(id) {
    return {
        ID: id,
        type: 'mock',
        destroyCalls: 0,
        destroy() {
            this.destroyCalls += 1;
            return true;
        }
    };
}

function assertThrows(fn, expectedMessage) {
    let threw = false;

    try {
        fn();
    } catch (error) {
        threw = true;
        if (expectedMessage && !String(error.message).includes(expectedMessage)) {
            throw new Error(`Expected error message to include "${expectedMessage}", got "${error.message}".`);
        }
    }

    if (!threw) {
        throw new Error('Expected function to throw.');
    }
}

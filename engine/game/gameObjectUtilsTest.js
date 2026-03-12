// ToolboxAid.com
// David Quesenberry
// 03/12/2026
// gameObjectUtilsTest.js

import GameObjectUtils from './gameObjectUtils.js';
import GameObject from '../gameObject.js';

export function testGameObjectUtils(assert) {
    GameObjectUtils.validateConstructorArgs({
        x: 10,
        y: 20,
        imagePath: './sprite.png',
        spriteWidth: 16,
        spriteHeight: 16,
        type: 'Player',
        debug: false
    });

    let threw = false;
    try {
        GameObjectUtils.validateConstructorArgs({
            x: 10,
            y: 20,
            imagePath: '',
            spriteWidth: 16,
            spriteHeight: 16,
            type: 'Player',
            debug: false
        });
    } catch (error) {
        threw = true;
    }

    assert(threw, 'validateConstructorArgs should reject an empty imagePath');

    const target = {};
    GameObjectUtils.initializeMetadata(target, { type: 'Car0', debug: true });
    assert(target.type === 'Car0', 'initializeMetadata should assign type');
    assert(target.debug === true, 'initializeMetadata should assign debug');

    GameObjectUtils.destroyMetadata(target);
    assert(target.type === null, 'destroyMetadata should clear type');
    assert(target.debug === true, 'destroyMetadata should preserve debug');

    const mockGameObject = { ID: 42 };
    Object.setPrototypeOf(mockGameObject, GameObject.prototype);

    GameObjectUtils.validateGameObject(mockGameObject);
    assert(GameObjectUtils.getObjectId(mockGameObject) === 42, 'getObjectId should return the game object ID');

    GameObjectUtils.validateId('player-1');
    GameObjectUtils.validateId(7);

    threw = false;
    try {
        GameObjectUtils.validateId('');
    } catch (error) {
        threw = true;
    }

    assert(threw, 'validateId should reject an empty string');
}

/*
Toolbox Aid
David Quesenberry
03/21/2026
Entity.test.mjs
*/
import Entity from '/src/engine/entity/Entity.js';
import Transform from '/src/engine/entity/Transform.js';
import Velocity from '/src/engine/entity/Velocity.js';
import Bounds from '/src/engine/entity/Bounds.js';

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function run() {
    const entity = new Entity({
        transform: new Transform({ x: 10, y: 20 }),
        velocity: new Velocity({ x: 30, y: -10 }),
        bounds: new Bounds({ width: 40, height: 20 }),
    });

    entity.snapshot();
    assert(entity.transform.previousPosition.x === 10, 'snapshot should capture x.');
    assert(entity.transform.previousPosition.y === 20, 'snapshot should capture y.');

    entity.integrate(0.5);
    assert(entity.transform.position.x === 25, 'integrate should update x from velocity.');
    assert(entity.transform.position.y === 15, 'integrate should update y from velocity.');

    entity.bounds.clampCenter(entity.transform.position, {
        x: 0,
        y: 0,
        width: 30,
        height: 30,
    });

    assert(entity.transform.position.x === 20, 'clampCenter should clamp x inside area.');
    assert(entity.transform.position.y === 15, 'clampCenter should preserve in-range y.');
}

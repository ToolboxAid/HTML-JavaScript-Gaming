import ObjectStatic from './objectStatic.js';
import ObjectDynamic from './objectDynamic.js';
import ObjectKillable from './objectKillable.js';

function testObjectStatic(assert) {
    const objectStatic = new ObjectStatic(1, 2, 3, 4);

    assert(objectStatic.ID !== null, 'ObjectStatic should assign an ID');
    assert(objectStatic.isDestroyed === false, 'ObjectStatic should start as not destroyed');

    const destroyed = objectStatic.destroy();
    assert(destroyed === true, 'ObjectStatic destroy should succeed once');
    assert(objectStatic.isDestroyed === true, 'ObjectStatic should be marked destroyed');
    assert(objectStatic.destroy() === false, 'ObjectStatic destroy should be idempotent');
}

function testObjectDynamic(assert) {
    const objectDynamic = new ObjectDynamic(10, 20, 5, 6, 2, -3);
    objectDynamic.update(2);

    assert(objectDynamic.x === 14, 'ObjectDynamic update should advance x by velocity * deltaTime');
    assert(objectDynamic.y === 14, 'ObjectDynamic update should advance y by velocity * deltaTime');

    objectDynamic.stop();
    assert(objectDynamic.velocityX === 0, 'ObjectDynamic stop should zero x velocity');
    assert(objectDynamic.velocityY === 0, 'ObjectDynamic stop should zero y velocity');

    const destroyed = objectDynamic.destroy();
    assert(destroyed === true, 'ObjectDynamic destroy should succeed once');
    assert(objectDynamic.destroy() === false, 'ObjectDynamic destroy should be idempotent');
}

class ProbeKillable extends ObjectKillable {
    constructor(x = 0, y = 0, width = 1, height = 1, velocityX = 1, velocityY = 0) {
        super(x, y, width, height, velocityX, velocityY);
        this.statusCalls = [];
    }

    handleAliveStatus(deltaTime, incFrame = false) {
        this.statusCalls.push('alive');
        super.handleAliveStatus(deltaTime, incFrame);
    }

    handleDyingStatus(deltaTime, incFrame = false) {
        this.statusCalls.push('dying');
        super.handleDyingStatus(deltaTime, incFrame);
    }

    handleDeadStatus(deltaTime, incFrame = false) {
        this.statusCalls.push('dead');
        super.handleDeadStatus(deltaTime, incFrame);
    }
}

function testObjectKillable(assert) {
    const objectKillable = new ProbeKillable();

    objectKillable.update(1, true);
    assert(objectKillable.statusCalls.includes('alive'), 'ObjectKillable should route alive updates');

    objectKillable.setIsDying();
    objectKillable.update(1, true);
    assert(objectKillable.statusCalls.includes('dying'), 'ObjectKillable should route dying updates');

    objectKillable.setIsDead();
    assert(objectKillable.velocityX === 0, 'ObjectKillable setIsDead should stop x velocity');
    assert(objectKillable.velocityY === 0, 'ObjectKillable setIsDead should stop y velocity');
    objectKillable.update(1, true);
    assert(objectKillable.statusCalls.includes('dead'), 'ObjectKillable should route dead updates');

    const destroyed = objectKillable.destroy();
    assert(destroyed === true, 'ObjectKillable destroy should succeed once');
    assert(objectKillable.status === null, 'ObjectKillable destroy should clear status');
    assert(objectKillable.destroy() === false, 'ObjectKillable destroy should be idempotent');
}

export function testObjectBaseClass(assert) {
    testObjectStatic(assert);
    testObjectDynamic(assert);
    testObjectKillable(assert);
}

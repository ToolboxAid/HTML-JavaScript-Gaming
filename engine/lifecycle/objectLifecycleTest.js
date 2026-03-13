import ObjectLifecycle from './objectLifecycle.js';

function testLifecycleTransitions(assert) {
    const lifecycle = new ObjectLifecycle(['alive', 'dying', 'dead'], 'alive');

    assert(lifecycle.status === 'alive', 'ObjectLifecycle should initialize with initial status');
    assert(lifecycle.currentFrameIndex === 0, 'ObjectLifecycle should initialize currentFrameIndex to zero');
    assert(lifecycle.delayCounter === 0, 'ObjectLifecycle should initialize delayCounter to zero');

    lifecycle.currentFrameIndex = 3;
    lifecycle.delayCounter = 5;
    const changed = lifecycle.setStatus('dying');
    assert(changed === true, 'ObjectLifecycle setStatus should report changes');
    assert(lifecycle.status === 'dying', 'ObjectLifecycle should update status');
    assert(lifecycle.currentFrameIndex === 0, 'ObjectLifecycle should reset currentFrameIndex on status change');
    assert(lifecycle.delayCounter === 0, 'ObjectLifecycle should reset delayCounter on status change');

    lifecycle.currentFrameIndex = 2;
    lifecycle.delayCounter = 4;
    const unchanged = lifecycle.setStatus('dying', { resetCounters: false });
    assert(unchanged === false, 'ObjectLifecycle setStatus should report unchanged status');
    assert(lifecycle.currentFrameIndex === 2, 'ObjectLifecycle should preserve counters when status is unchanged');
    assert(lifecycle.delayCounter === 4, 'ObjectLifecycle should preserve delay when status is unchanged');
}

function testLifecycleDestroyGuards(assert) {
    const lifecycle = new ObjectLifecycle(['alive', 'dead'], 'alive');
    const destroyed = lifecycle.destroy();
    assert(destroyed === true, 'ObjectLifecycle destroy should succeed once');
    assert(lifecycle.destroy() === false, 'ObjectLifecycle destroy should be idempotent');

    let setStatusThrew = false;
    try {
        lifecycle.setStatus('dead');
    } catch (error) {
        setStatusThrew = error.message.includes('destroyed');
    }
    assert(setStatusThrew, 'ObjectLifecycle should reject setStatus after destroy');

    let resetThrew = false;
    try {
        lifecycle.resetCounters();
    } catch (error) {
        resetThrew = error.message.includes('destroyed');
    }
    assert(resetThrew, 'ObjectLifecycle should reject resetCounters after destroy');
}

export function testObjectLifecycleCore(assert) {
    testLifecycleTransitions(assert);
    testLifecycleDestroyGuards(assert);
}

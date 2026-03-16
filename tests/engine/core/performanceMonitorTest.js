import PerformanceMonitor from '../../../engine/core/performanceMonitor.js';

export function testPerformanceMonitor(assert) {
    const originalState = {
        availableTimeMs: PerformanceMonitor.availableTimeMs,
        totalTimeSpentMs: PerformanceMonitor.totalTimeSpentMs,
        frameSampleCount: PerformanceMonitor.frameSampleCount,
        gfxPercentUsage: PerformanceMonitor.gfxPercentUsage,
        monitorIntervalId: PerformanceMonitor.monitorIntervalId
    };
    const originalSetInterval = globalThis.setInterval;
    const originalClearInterval = globalThis.clearInterval;

    try {
        PerformanceMonitor.availableTimeMs = 16.67;
        PerformanceMonitor.totalTimeSpentMs = 0;
        PerformanceMonitor.frameSampleCount = 0;
        PerformanceMonitor.gfxPercentUsage = 0;
        PerformanceMonitor.monitorIntervalId = null;

        PerformanceMonitor.updateGFX(10);
        PerformanceMonitor.updateGFX(20);
        PerformanceMonitor.calcGFX();

        const expectedAverage = 15;
        const expectedUsage = (expectedAverage / PerformanceMonitor.availableTimeMs) * 100;
        assert(
            Math.abs(PerformanceMonitor.gfxPercentUsage - expectedUsage) < 0.001,
            'PerformanceMonitor.calcGFX should average only collected frame samples'
        );
        assert(PerformanceMonitor.frameSampleCount === 0, 'PerformanceMonitor.calcGFX should reset frame sample count');
        assert(PerformanceMonitor.totalTimeSpentMs === 0, 'PerformanceMonitor.calcGFX should reset accumulated frame time');

        PerformanceMonitor.calcGFX();
        assert(PerformanceMonitor.gfxPercentUsage === 0, 'PerformanceMonitor.calcGFX should return 0 usage when no frame samples were collected');

        let scheduledInterval = null;
        let clearedInterval = null;
        globalThis.setInterval = (callback, delay) => {
            scheduledInterval = { callback, delay, id: 42 };
            return 42;
        };
        globalThis.clearInterval = (intervalId) => {
            clearedInterval = intervalId;
        };

        assert(PerformanceMonitor.startMonitoring() === true, 'PerformanceMonitor.startMonitoring should start exactly once');
        assert(scheduledInterval?.delay === 1000, 'PerformanceMonitor.startMonitoring should use a 1 second cadence');
        assert(PerformanceMonitor.startMonitoring() === false, 'PerformanceMonitor.startMonitoring should not duplicate the interval');
        assert(PerformanceMonitor.stopMonitoring() === true, 'PerformanceMonitor.stopMonitoring should clear the active interval');
        assert(clearedInterval === 42, 'PerformanceMonitor.stopMonitoring should clear the scheduled interval');
        assert(PerformanceMonitor.monitorIntervalId === null, 'PerformanceMonitor.stopMonitoring should clear the stored interval id');
        assert(PerformanceMonitor.stopMonitoring() === false, 'PerformanceMonitor.stopMonitoring should no-op when already stopped');
    } finally {
        PerformanceMonitor.availableTimeMs = originalState.availableTimeMs;
        PerformanceMonitor.totalTimeSpentMs = originalState.totalTimeSpentMs;
        PerformanceMonitor.frameSampleCount = originalState.frameSampleCount;
        PerformanceMonitor.gfxPercentUsage = originalState.gfxPercentUsage;
        PerformanceMonitor.monitorIntervalId = originalState.monitorIntervalId;
        globalThis.setInterval = originalSetInterval;
        globalThis.clearInterval = originalClearInterval;
    }
}

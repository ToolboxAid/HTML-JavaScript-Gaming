import PerformanceMonitor from '../../../engine/core/performanceMonitor.js';

export function testPerformanceMonitor(assert) {
    const originalState = {
        availableTimeMs: PerformanceMonitor.availableTimeMs,
        totalTimeSpentMs: PerformanceMonitor.totalTimeSpentMs,
        frameSampleCount: PerformanceMonitor.frameSampleCount,
        gfxPercentUsage: PerformanceMonitor.gfxPercentUsage
    };

    try {
        PerformanceMonitor.availableTimeMs = 16.67;
        PerformanceMonitor.totalTimeSpentMs = 0;
        PerformanceMonitor.frameSampleCount = 0;
        PerformanceMonitor.gfxPercentUsage = 0;

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
    } finally {
        PerformanceMonitor.availableTimeMs = originalState.availableTimeMs;
        PerformanceMonitor.totalTimeSpentMs = originalState.totalTimeSpentMs;
        PerformanceMonitor.frameSampleCount = originalState.frameSampleCount;
        PerformanceMonitor.gfxPercentUsage = originalState.gfxPercentUsage;
    }
}

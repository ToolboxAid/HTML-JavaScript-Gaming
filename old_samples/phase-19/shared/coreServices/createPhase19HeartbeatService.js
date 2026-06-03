/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19HeartbeatService.js
*/
export default function createPhase19HeartbeatService({ intervalSeconds = 0.5 } = {}) {
  const safeInterval = Math.max(0.05, Number(intervalSeconds) || 0.5);
  let running = false;
  let elapsed = 0;
  let ticks = 0;
  let lastBeatSeconds = 0;

  return {
    id: 'phase19.heartbeat',
    onStart() {
      running = true;
      elapsed = 0;
      ticks = 0;
      lastBeatSeconds = 0;
    },
    onUpdate(dtSeconds, context = {}) {
      if (!running) return;
      const dt = Math.max(0, Number(dtSeconds) || 0);
      elapsed += dt;
      while (elapsed >= safeInterval) {
        elapsed -= safeInterval;
        ticks += 1;
        lastBeatSeconds += safeInterval;
        const channel = context.getService?.('phase19.channel');
        if (channel && typeof channel.publish === 'function') {
          channel.publish('phase19.heartbeat', {
            tick: ticks,
            t: Number(lastBeatSeconds.toFixed(3)),
          });
        }
      }
    },
    onStop() {
      running = false;
    },
    getSnapshot() {
      return {
        running,
        intervalSeconds: safeInterval,
        ticks,
        lastBeatSeconds: Number(lastBeatSeconds.toFixed(3)),
      };
    },
  };
}

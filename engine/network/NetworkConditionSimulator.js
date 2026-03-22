/*
Toolbox Aid
David Quesenberry
03/22/2026
NetworkConditionSimulator.js
*/
export default class NetworkConditionSimulator {
  constructor({
    baseLatencyMs = 0,
    jitterMs = 0,
    lossRate = 0,
  } = {}) {
    this.baseLatencyMs = baseLatencyMs;
    this.jitterMs = jitterMs;
    this.lossRate = lossRate;
    this.timeMs = 0;
    this.queue = [];
    this.stats = {
      sent: 0,
      delivered: 0,
      dropped: 0,
    };
  }

  configure({ baseLatencyMs, jitterMs, lossRate } = {}) {
    if (typeof baseLatencyMs === 'number') {
      this.baseLatencyMs = baseLatencyMs;
    }
    if (typeof jitterMs === 'number') {
      this.jitterMs = jitterMs;
    }
    if (typeof lossRate === 'number') {
      this.lossRate = lossRate;
    }
  }

  transmit(packet, deliver) {
    this.stats.sent += 1;
    if (Math.random() < this.lossRate) {
      this.stats.dropped += 1;
      return false;
    }

    const jitter = this.jitterMs > 0
      ? (Math.random() * this.jitterMs * 2) - this.jitterMs
      : 0;
    const delayMs = Math.max(0, this.baseLatencyMs + jitter);
    this.queue.push({
      deliverAtMs: this.timeMs + delayMs,
      deliver,
      packet,
      delayMs,
    });
    return true;
  }

  update(dtSeconds) {
    this.timeMs += dtSeconds * 1000;
    const ready = [];
    this.queue = this.queue.filter((entry) => {
      if (entry.deliverAtMs <= this.timeMs) {
        ready.push(entry);
        return false;
      }
      return true;
    });

    ready.forEach((entry) => {
      entry.deliver({
        ...entry.packet,
        simulatedDelayMs: entry.delayMs,
      });
      this.stats.delivered += 1;
    });
  }

  getStats() {
    return {
      ...this.stats,
      queued: this.queue.length,
      baseLatencyMs: this.baseLatencyMs,
      jitterMs: this.jitterMs,
      lossRate: this.lossRate,
    };
  }
}

/*
Toolbox Aid
David Quesenberry
03/22/2026
RemoteInterpolationBuffer.js
*/
function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default class RemoteInterpolationBuffer {
  constructor() {
    this.snapshots = [];
  }

  push(snapshot) {
    this.snapshots.push({
      tick: snapshot.tick,
      state: { ...snapshot.state },
    });
    this.snapshots.sort((a, b) => a.tick - b.tick);
    this.snapshots = this.snapshots.slice(-6);
  }

  sample(renderTick) {
    if (this.snapshots.length === 0) {
      return null;
    }

    if (this.snapshots.length === 1 || renderTick <= this.snapshots[0].tick) {
      return { ...this.snapshots[0].state };
    }

    for (let index = 0; index < this.snapshots.length - 1; index += 1) {
      const current = this.snapshots[index];
      const next = this.snapshots[index + 1];
      if (renderTick >= current.tick && renderTick <= next.tick) {
        const t = (renderTick - current.tick) / Math.max(1, next.tick - current.tick);
        return {
          x: lerp(current.state.x, next.state.x, t),
          y: lerp(current.state.y, next.state.y, t),
        };
      }
    }

    return { ...this.snapshots[this.snapshots.length - 1].state };
  }
}

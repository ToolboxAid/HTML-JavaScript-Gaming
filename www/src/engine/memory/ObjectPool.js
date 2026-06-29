/*
Toolbox Aid
David Quesenberry
03/22/2026
ObjectPool.js
*/
export default class ObjectPool {
  constructor(factory = () => ({}), reset = () => {}) {
    this.factory = factory;
    this.reset = reset;
    this.items = [];
    this.inUse = 0;
  }

  acquire() {
    const item = this.items.pop() ?? this.factory();
    this.inUse += 1;
    return item;
  }

  release(item) {
    this.reset(item);
    this.items.push(item);
    this.inUse = Math.max(0, this.inUse - 1);
  }

  stats() {
    return {
      pooled: this.items.length,
      inUse: this.inUse,
    };
  }
}

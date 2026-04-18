/*
Toolbox Aid
David Quesenberry
03/29/2026
EventsSystem.js
*/
export class EventsSystem {
  constructor(events = []) {
    this.events = Array.isArray(events) ? events.map((e) => ({ ...e, fired: false })) : [];
  }

  update(ctx, applyAction) {
    const fired = [];
    for (let i = 0; i < this.events.length; i += 1) {
      const event = this.events[i];
      const okTime = typeof event.time === 'number' ? ctx.elapsed >= event.time : true;
      const okPhase = event.phase ? ctx.phase === event.phase : true;
      const okWave = typeof event.waveIndex === 'number' ? ctx.waveIndex === event.waveIndex : true;
      if (!(okTime && okPhase && okWave)) continue;
      if (!event.repeat && event.fired) continue;
      applyAction(event.action);
      event.fired = true;
      fired.push(event.id || `event-${i}`);
    }
    return fired;
  }
}

/*
Toolbox Aid
David Quesenberry
03/22/2026
SampleWorldEventsSystem.js
*/
export class SampleWorldEventsSystem {
  constructor(events = []) {
    this.events = Array.isArray(events)
      ? events.map((event) => ({ ...event, fired: false }))
      : [];
  }

  update(context, applyAction) {
    const triggered = [];
    for (let i = 0; i < this.events.length; i += 1) {
      const event = this.events[i];
      const matchesTime = typeof event.time === 'number' ? context.elapsed >= event.time : true;
      const matchesPhase = event.phase ? context.phase === event.phase : true;
      const matchesWave = typeof event.waveIndex === 'number' ? context.waveIndex === event.waveIndex : true;
      if (!(matchesTime && matchesPhase && matchesWave)) continue;
      if (!event.repeat && event.fired) continue;
      applyAction(event.action, context);
      event.fired = true;
      triggered.push(event.id || `event-${i}`);
    }
    return triggered;
  }
}

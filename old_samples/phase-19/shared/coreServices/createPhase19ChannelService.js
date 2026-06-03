/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19ChannelService.js
*/
import EventBus from '/src/engine/events/EventBus.js';

export default function createPhase19ChannelService() {
  const bus = new EventBus();
  let running = false;
  let publishedCount = 0;
  let lastChannel = 'none';

  function publish(channel, payload = {}) {
    if (!running || typeof channel !== 'string' || channel.length === 0) {
      return 0;
    }
    lastChannel = channel;
    publishedCount += 1;
    return bus.emit(channel, payload);
  }

  function subscribe(channel, handler) {
    return bus.on(channel, handler);
  }

  return {
    id: 'phase19.channel',
    publish,
    subscribe,
    getSnapshot() {
      return {
        running,
        publishedCount,
        lastChannel,
      };
    },
    onStart() {
      running = true;
    },
    onStop() {
      running = false;
      bus.clear();
    },
  };
}

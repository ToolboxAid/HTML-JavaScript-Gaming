/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase18CoreServices.js
*/
import createPhase18ServiceRegistry from './createPhase18ServiceRegistry.js';
import createPhase18ChannelService from './createPhase18ChannelService.js';
import createPhase18HeartbeatService from './createPhase18HeartbeatService.js';

export default function createPhase18CoreServices() {
  const registry = createPhase18ServiceRegistry();
  registry.register(createPhase18ChannelService());
  registry.register(createPhase18HeartbeatService());
  return registry;
}

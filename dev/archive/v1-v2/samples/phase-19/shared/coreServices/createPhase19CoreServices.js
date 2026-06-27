/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19CoreServices.js
*/
import createPhase19ServiceRegistry from './createPhase19ServiceRegistry.js';
import createPhase19ChannelService from './createPhase19ChannelService.js';
import createPhase19HeartbeatService from './createPhase19HeartbeatService.js';

export default function createPhase19CoreServices() {
  const registry = createPhase19ServiceRegistry();
  registry.register(createPhase19ChannelService());
  registry.register(createPhase19HeartbeatService());
  return registry;
}

/*
Toolbox Aid
David Quesenberry
04/16/2026
createPhase19ServiceRegistry.js
*/
import { assertValidPhase19Service } from './phase19ServiceContract.js';

export default function createPhase19ServiceRegistry() {
  const servicesById = new Map();
  const serviceOrder = [];
  let running = false;

  function withContext(context = {}) {
    return {
      ...context,
      serviceRegistry: api,
      getService: get,
      listServiceIds,
    };
  }

  function register(service) {
    assertValidPhase19Service(service);
    if (servicesById.has(service.id)) {
      throw new Error(`Duplicate service id: ${service.id}`);
    }
    servicesById.set(service.id, service);
    serviceOrder.push(service.id);
    if (typeof service.onRegister === 'function') {
      service.onRegister(withContext());
    }
    return service;
  }

  function get(serviceId) {
    return servicesById.get(serviceId) || null;
  }

  function listServiceIds() {
    return [...serviceOrder];
  }

  function start(context = {}) {
    if (running) return false;
    running = true;
    const ctx = withContext(context);
    for (let i = 0; i < serviceOrder.length; i += 1) {
      const service = servicesById.get(serviceOrder[i]);
      if (service && typeof service.onStart === 'function') {
        service.onStart(ctx);
      }
    }
    return true;
  }

  function update(dtSeconds, context = {}) {
    if (!running) return 0;
    const ctx = withContext(context);
    let updated = 0;
    for (let i = 0; i < serviceOrder.length; i += 1) {
      const service = servicesById.get(serviceOrder[i]);
      if (service && typeof service.onUpdate === 'function') {
        service.onUpdate(dtSeconds, ctx);
        updated += 1;
      }
    }
    return updated;
  }

  function stop(context = {}) {
    if (!running) return false;
    const ctx = withContext(context);
    for (let i = serviceOrder.length - 1; i >= 0; i -= 1) {
      const service = servicesById.get(serviceOrder[i]);
      if (service && typeof service.onStop === 'function') {
        service.onStop(ctx);
      }
    }
    running = false;
    return true;
  }

  function getLifecycleState() {
    return {
      running,
      serviceCount: serviceOrder.length,
      serviceIds: listServiceIds(),
    };
  }

  const api = {
    register,
    get,
    listServiceIds,
    start,
    update,
    stop,
    getLifecycleState,
  };
  return api;
}

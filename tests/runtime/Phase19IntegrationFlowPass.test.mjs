/*
Toolbox Aid
David Quesenberry
04/16/2026
Phase19IntegrationFlowPass.test.mjs
*/
import assert from 'node:assert/strict';
import createPhase19IntegrationFlow from '../../samples/phase-19/shared/integration/createPhase19IntegrationFlow.js';

function assertIntegrationFlowLifecycleAndDataFlow() {
  const flow = createPhase19IntegrationFlow();

  assert.equal(flow.getState(), flow.states.IDLE, 'Integration flow should start in idle state.');
  assert.equal(flow.start({ source: 'integration-test' }), true, 'Integration flow should start once.');

  flow.update(0.25, { source: 'integration-test' });
  flow.update(0.25, { source: 'integration-test' });
  flow.update(0.5, { source: 'integration-test' });

  const runningSnapshot = flow.getSnapshot();
  assert.equal(runningSnapshot.runtime.state, flow.states.RUNNING, 'Runtime state should be running after start.');
  assert.equal(runningSnapshot.runtime.tickCount >= 3, true, 'Runtime tick count should advance through updates.');
  assert.equal(runningSnapshot.flow.heartbeatEvents >= 1, true, 'Heartbeat events should flow through integration layer.');
  assert.equal(runningSnapshot.flow.runtimeStateEvents >= 1, true, 'Runtime state events should flow through integration layer.');
  assert.equal(runningSnapshot.flow.lastRuntimeState, flow.states.RUNNING, 'Last runtime state should reflect running during active updates.');

  assert.equal(flow.stop({ source: 'integration-test' }), true, 'Integration flow should stop cleanly.');
  const stoppedSnapshot = flow.getSnapshot();
  assert.equal(stoppedSnapshot.runtime.state, flow.states.STOPPED, 'Runtime state should be stopped after stop.');
  assert.equal(stoppedSnapshot.flow.subscriptionsActive, false, 'Integration flow subscriptions should detach after stop.');
  assert.equal(
    flow.getCoreServices().getLifecycleState().running,
    false,
    'Core services should be stopped when integration flow stops.'
  );
}

export function run() {
  assertIntegrationFlowLifecycleAndDataFlow();
}

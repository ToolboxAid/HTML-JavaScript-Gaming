/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2AiBehaviorFixture.mjs
*/

export function createEngineV2AiBehaviorFixture() {
  return {
    runtimeObjects: [
      {
        instanceId: "patroller.1",
        objectType: "dynamic",
        capabilities: ["dynamic"],
        tags: ["patrolUnit"],
        position: { x: 0, y: 0 },
        size: { width: 10, height: 10 },
      },
      {
        instanceId: "target.1",
        objectType: "dynamic",
        capabilities: ["dynamic"],
        tags: ["target"],
        position: { x: 60, y: 0 },
        size: { width: 10, height: 10 },
      },
      {
        instanceId: "observer.1",
        objectType: "static",
        capabilities: ["static"],
        tags: ["observer"],
        position: { x: 10, y: 10 },
        size: { width: 10, height: 10 },
      },
    ],
    patrolDefinitions: [
      {
        behaviorId: "patrol.loop",
        instanceId: "patroller.1",
        mode: "loop",
        speed: 20,
        tolerance: 1,
        waypoints: [
          { x: 0, y: 0, pauseMs: 250 },
          { x: 40, y: 0, pauseMs: 0 },
        ],
      },
      {
        behaviorId: "patrol.pingpong",
        instanceId: "target.1",
        mode: "pingPong",
        speed: 20,
        tolerance: 1,
        waypoints: [
          { x: 60, y: 0, pauseMs: 0 },
          { x: 80, y: 0, pauseMs: 100 },
          { x: 100, y: 0, pauseMs: 0 },
        ],
      },
    ],
    patrolStates: [
      {
        behaviorId: "patrol.loop",
        waypointIndex: 0,
        direction: 1,
        pauseRemainingMs: 0,
      },
      {
        behaviorId: "patrol.pingpong",
        waypointIndex: 2,
        direction: 1,
        pauseRemainingMs: 0,
      },
    ],
    chaseFleeDefinitions: [
      {
        behaviorId: "chase.target",
        behaviorType: "chase",
        instanceId: "patroller.1",
        targetSelector: {
          selectorType: "instanceId",
          instanceId: "target.1",
        },
        speed: 30,
        stopDistance: 5,
        desiredDistance: 30,
      },
      {
        behaviorId: "flee.target",
        behaviorType: "flee",
        instanceId: "target.1",
        targetSelector: {
          selectorType: "tag",
          tag: "patrolUnit",
        },
        speed: 40,
        stopDistance: 5,
        desiredDistance: 80,
      },
    ],
    grid: {
      width: 5,
      height: 5,
      cells: [
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0],
        [0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
      ],
    },
    pathRequests: [
      {
        requestId: "path.patroller.to.target",
        instanceId: "patroller.1",
        start: { x: 0, y: 0 },
        goal: { x: 4, y: 4 },
      },
    ],
  };
}

/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PersistenceRuntimeFixture.mjs
*/

export function createEngineV2PersistenceRuntimeFixture() {
  return {
    runtimeState: {
      inventory: [{ inventoryId: "inventory.hero", slots: [{ itemId: "item.potion", quantity: 4 }] }],
      equipment: [{ equipmentId: "equipment.hero", equipped: [{ slotId: "weapon", itemId: "item.sword" }] }],
      currency: [{ ownerInstanceId: "hero.1", currencyId: "gold", amount: 65 }],
      state: { flags: { doorOpen: true }, scores: { coins: 10 } },
      checkpoints: { activeCheckpointId: "checkpoint.start" },
      profile: { profileId: "profile.hero", values: { discoveries: 2 } },
      runtimeOnly: { frame: 100 },
    },
    saveDefinition: {
      saveStateId: "save.hero.1",
      ownerInstanceId: "hero.1",
      projectId: "project.game.1",
      version: "1.0.0",
      persistedSurfaces: ["inventory", "equipment", "currency", "state", "checkpoints", "profile"],
    },
    persistenceDefinition: {
      projectId: "project.game.1",
      persistedSurfaces: ["inventory", "equipment", "currency", "state"],
    },
    checkpointDefinitions: [
      { checkpointId: "checkpoint.start", sceneId: "scene.start", position: { x: 4, y: 8 }, stateKeys: ["doorOpen"] },
    ],
    checkpointState: { ownerInstanceId: "hero.1", activeCheckpointId: null },
    checkpointActions: [
      { actionId: "checkpoint.activate", actionType: "activate", checkpointId: "checkpoint.start" },
      { actionId: "checkpoint.restore", actionType: "restore", checkpointId: "checkpoint.start" },
    ],
    profileDefinitions: [
      { profileKey: "discoveries", valueType: "number" },
      { profileKey: "tutorialComplete", valueType: "boolean" },
      { profileKey: "title", valueType: "string" },
    ],
    profileState: { profileId: "profile.hero", values: { discoveries: 2, tutorialComplete: false } },
    profileActions: [
      { actionId: "profile.increment", actionType: "increment", profileKey: "discoveries", amount: 1 },
      { actionId: "profile.unlock", actionType: "unlock", profileKey: "tutorialComplete" },
      { actionId: "profile.set", actionType: "set", profileKey: "title", value: "Pathfinder" },
    ],
  };
}

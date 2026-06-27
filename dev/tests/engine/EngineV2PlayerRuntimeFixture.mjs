/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2PlayerRuntimeFixture.mjs
*/

export function createEngineV2PlayerRuntimeFixture() {
  const objectiveDefinitions = [
    { objectiveId: "objective.collect.gems", objectiveType: "collect", criteria: { itemId: "item.gem" }, requiredValue: 3 },
    { objectiveId: "objective.defeat.scouts", objectiveType: "defeat", criteria: { targetType: "enemy.scout" }, requiredValue: 2 },
    { objectiveId: "objective.reach.gate", objectiveType: "reach", criteria: { locationId: "location.gate" }, requiredValue: 1 },
    { objectiveId: "objective.survive.storm", objectiveType: "survive", criteria: {}, requiredValue: 30000 },
    { objectiveId: "objective.timer.escape", objectiveType: "timer", criteria: {}, requiredValue: 30000 },
    { objectiveId: "objective.score.rank", objectiveType: "score", criteria: { scoreKey: "renown" }, requiredValue: 100 },
    { objectiveId: "objective.interact.elder", objectiveType: "interact", criteria: { interactionId: "interact.talk.elder" }, requiredValue: 1 },
  ];

  return {
    objectiveDefinitions,
    objectiveStates: objectiveDefinitions.map((definition) => ({
      objectiveId: definition.objectiveId,
      progress: 0,
      completed: false,
    })),
    objectiveEvents: [
      { objectiveType: "collect", itemId: "item.gem", amount: 3 },
      { objectiveType: "defeat", targetType: "enemy.scout", amount: 2 },
      { objectiveType: "reach", locationId: "location.gate", amount: 1 },
      { objectiveType: "interact", interactionId: "interact.talk.elder", amount: 1 },
    ],
    runtimeState: {
      elapsedMs: 30000,
      scores: {
        renown: 120,
      },
    },
    questDefinitions: [
      {
        questId: "quest.tutorial",
        prerequisiteQuestIds: [],
        triggerIds: ["trigger.elder.intro"],
        steps: [
          { stepId: "step.collect", objectiveId: "objective.collect.gems" },
          { stepId: "step.interact", objectiveId: "objective.interact.elder" },
        ],
        rewards: {
          inventoryActions: [
            { actionId: "reward.potion", actionType: "add", inventoryId: "inventory.hero", itemId: "item.potion", quantity: 1 },
          ],
          economyActions: [
            { actionId: "reward.gold", actionType: "add", ownerInstanceId: "hero.1", currencyId: "gold", amount: 25 },
          ],
          triggerIds: ["trigger.quest.completed"],
        },
      },
      {
        questId: "quest.followup",
        prerequisiteQuestIds: ["quest.tutorial"],
        triggerIds: [],
        steps: [
          { stepId: "step.score", objectiveId: "objective.score.rank" },
        ],
        rewards: {
          inventoryActions: [],
          economyActions: [],
          triggerIds: ["trigger.followup.completed"],
        },
      },
    ],
    questStates: [
      { questId: "quest.tutorial", status: "active" },
      { questId: "quest.followup", status: "locked" },
    ],
    triggerEvents: [
      { triggerId: "trigger.elder.intro" },
    ],
    dialogueDefinitions: [
      {
        dialogueId: "dialogue.elder",
        npcId: "npc.elder",
        nodes: [
          {
            nodeId: "start",
            text: "Bring me proof of your path.",
            choices: [
              {
                choiceId: "accept",
                label: "I have it.",
                conditionIds: ["objective.collect.gems"],
                actionIds: ["quest.tutorial.advance"],
                nextNodeId: "reward",
              },
              {
                choiceId: "leave",
                label: "Later.",
                conditionIds: [],
                actionIds: [],
                nextNodeId: "start",
              },
            ],
          },
          {
            nodeId: "reward",
            text: "Then your work is done.",
            choices: [],
          },
        ],
      },
    ],
    dialogueStates: [
      { dialogueId: "dialogue.elder", currentNodeId: "start" },
    ],
    dialogueRequests: [
      { requestId: "dialogue.show", dialogueId: "dialogue.elder", actorInstanceId: "hero.1" },
      { requestId: "dialogue.choice", dialogueId: "dialogue.elder", actorInstanceId: "hero.1", nodeId: "start", choiceId: "accept" },
    ],
    conditionMatches: [
      { conditionId: "objective.collect.gems" },
    ],
  };
}

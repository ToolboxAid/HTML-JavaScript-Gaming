/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2CombatRuntimeFixture.mjs
*/

export function createEngineV2CombatRuntimeFixture() {
  return {
    abilityDefinitions: [
      {
        abilityId: "ability.firebolt",
        abilityType: "active",
        ownerInstanceId: "mage.1",
        cooldownId: "cooldown.firebolt.mage",
        trigger: {
          triggerType: "event",
          eventType: "event.castFirebolt",
        },
        actionIds: ["action.spawn.firebolt"],
      },
      {
        abilityId: "ability.thorns",
        abilityType: "passive",
        ownerInstanceId: "mage.1",
        trigger: {
          triggerType: "action",
          actionType: "damage",
        },
        actionIds: ["action.apply.burn"],
      },
      {
        abilityId: "ability.poisonCloud",
        abilityType: "passive",
        ownerInstanceId: "mage.1",
        trigger: {
          triggerType: "condition",
          conditionId: "condition.poison.tick",
        },
        actionIds: ["action.apply.poison"],
      },
    ],
    abilityStates: [
      {
        abilityId: "ability.firebolt",
        enabled: true,
      },
      {
        abilityId: "ability.thorns",
        enabled: true,
      },
      {
        abilityId: "ability.poisonCloud",
        enabled: true,
      },
    ],
    conditionMatches: [
      {
        conditionId: "condition.poison.tick",
        conditionType: "timer",
        eventType: "event.poisonTick",
        payload: {},
      },
    ],
    runtimeEvents: [
      {
        eventId: "event.cast.1",
        eventType: "event.castFirebolt",
      },
    ],
    actionOutcomes: [
      {
        actionId: "action.damage.hit",
        actionType: "damage",
        targetInstanceId: "target.1",
      },
    ],
    cooldownResult: {
      acceptedRequests: [
        {
          requestId: "request.firebolt.1",
          cooldownId: "cooldown.firebolt.mage",
        },
      ],
      blockedRequests: [],
    },
    projectileDefinitions: [
      {
        projectileDefinitionId: "projectile.firebolt",
        ownerInstanceId: "mage.1",
        speed: 100,
        lifetimeMs: 1000,
        size: { width: 8, height: 8 },
        collisionAction: {
          damageAmount: 15,
          statusEffectIds: ["status.burn"],
        },
      },
    ],
    projectileRequests: [
      {
        requestId: "projectile.request.1",
        projectileDefinitionId: "projectile.firebolt",
        sourceInstanceId: "mage.1",
        position: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
      },
    ],
    projectileRecords: [
      {
        projectileInstanceId: "projectile.existing.1",
        projectileDefinitionId: "projectile.firebolt",
        sourceInstanceId: "mage.1",
        position: { x: 10, y: 0 },
        size: { width: 8, height: 8 },
        velocity: { x: 100, y: 0 },
        remainingMs: 500,
      },
    ],
    projectileCollisionEvents: [
      {
        projectileInstanceId: "projectile.existing.1",
        targetInstanceId: "target.1",
      },
    ],
    statusEffectDefinitions: [
      {
        statusEffectId: "status.poison",
        effectType: "poison",
        displayName: "Poison",
        durationMs: 3000,
        tickIntervalMs: 1000,
        damagePerTick: 5,
      },
      {
        statusEffectId: "status.stun",
        effectType: "stun",
        displayName: "Stun",
        durationMs: 500,
        movementMultiplier: 0,
      },
      {
        statusEffectId: "status.freeze",
        effectType: "freeze",
        displayName: "Freeze",
        durationMs: 500,
        movementMultiplier: 0,
      },
      {
        statusEffectId: "status.burn",
        effectType: "burn",
        displayName: "Burn",
        durationMs: 2000,
        tickIntervalMs: 1000,
        damagePerTick: 4,
      },
      {
        statusEffectId: "status.slow",
        effectType: "slow",
        displayName: "Slow",
        durationMs: 1200,
        movementMultiplier: 0.5,
      },
      {
        statusEffectId: "status.haste",
        effectType: "haste",
        displayName: "Haste",
        durationMs: 1200,
        movementMultiplier: 1.5,
      },
      {
        statusEffectId: "status.custom.shield",
        effectType: "custom",
        displayName: "Shield",
        durationMs: 1500,
      },
    ],
    statusApplications: [
      {
        applicationId: "status.apply.slow",
        statusEffectId: "status.slow",
        targetInstanceId: "target.1",
        sourceId: "weapon.staff",
      },
    ],
    activeStatusEffects: [
      {
        effectInstanceId: "status.active.poison",
        statusEffectId: "status.poison",
        targetInstanceId: "target.1",
        remainingMs: 2000,
        elapsedSinceTickMs: 900,
      },
    ],
    healthRecords: [
      {
        instanceId: "target.1",
        health: 40,
        maxHealth: 40,
        invulnerableUntilMs: 0,
        alive: true,
      },
      {
        instanceId: "target.2",
        health: 30,
        maxHealth: 30,
        invulnerableUntilMs: 0,
        alive: true,
      },
    ],
    weaponDefinitions: [
      {
        weaponId: "weapon.fireStaff",
        weaponType: "ranged",
        ownerInstanceId: "mage.1",
        abilityIds: ["ability.firebolt"],
        projectileDefinitionIds: ["projectile.firebolt"],
        statusEffectIds: ["status.burn"],
        damageAmount: 0,
      },
      {
        weaponId: "weapon.blade",
        weaponType: "melee",
        ownerInstanceId: "mage.1",
        abilityIds: ["ability.thorns"],
        projectileDefinitionIds: [],
        statusEffectIds: ["status.slow"],
        damageAmount: 10,
      },
      {
        weaponId: "weapon.wave",
        weaponType: "area",
        ownerInstanceId: "mage.1",
        abilityIds: ["ability.poisonCloud"],
        projectileDefinitionIds: [],
        statusEffectIds: ["status.poison"],
        damageAmount: 3,
      },
      {
        weaponId: "weapon.custom",
        weaponType: "custom",
        ownerInstanceId: "mage.1",
        abilityIds: ["ability.thorns"],
        projectileDefinitionIds: [],
        statusEffectIds: ["status.custom.shield"],
        damageAmount: 0,
      },
    ],
    weaponRequests: [
      {
        requestId: "weapon.request.fireStaff",
        weaponId: "weapon.fireStaff",
        ownerInstanceId: "mage.1",
        position: { x: 0, y: 0 },
        direction: { x: 1, y: 0 },
      },
      {
        requestId: "weapon.request.blade",
        weaponId: "weapon.blade",
        ownerInstanceId: "mage.1",
        targetInstanceId: "target.1",
      },
      {
        requestId: "weapon.request.wave",
        weaponId: "weapon.wave",
        ownerInstanceId: "mage.1",
        targetInstanceIds: ["target.1", "target.2"],
      },
      {
        requestId: "weapon.request.custom",
        weaponId: "weapon.custom",
        ownerInstanceId: "mage.1",
        targetInstanceId: "target.1",
      },
    ],
  };
}

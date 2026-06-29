/*
Toolbox Aid
David Quesenberry
06/10/2026
objectModelRegistry.js
*/

export const OBJECT_MODEL_TYPE_IDS = Object.freeze({
  STATIC: "Static",
  DYNAMIC: "Dynamic",
  COLLECTIBLE: "Collectible",
  HAZARD: "Hazard",
  GOAL: "Goal",
});

export const OBJECT_MODEL_TRAIT_IDS = Object.freeze({
  MOVABLE: "movable",
  DAMAGEABLE: "damageable",
  KILLABLE: "killable",
  PLAYER_CONTROLLED: "playerControlled",
  COLLIDES: "collides",
  SCORES: "scores",
  COLLECTIBLE: "collectible",
  HAZARD: "hazard",
  GOAL: "goal",
});

const STATIC_OBJECT_TYPE = Object.freeze({
  bodyKind: "fixed",
  description: "Fixed body for boundaries, walls, platforms, or other non-moving playfield objects.",
  id: OBJECT_MODEL_TYPE_IDS.STATIC,
  label: "Static",
  traits: Object.freeze([OBJECT_MODEL_TRAIT_IDS.COLLIDES]),
});

const DYNAMIC_OBJECT_TYPE = Object.freeze({
  bodyKind: "moving",
  description: "Moving body for actors, projectiles, platforms, or other motion-capable objects.",
  id: OBJECT_MODEL_TYPE_IDS.DYNAMIC,
  label: "Dynamic",
  traits: Object.freeze([OBJECT_MODEL_TRAIT_IDS.MOVABLE, OBJECT_MODEL_TRAIT_IDS.COLLIDES]),
});

const COLLECTIBLE_OBJECT_TYPE = Object.freeze({
  bodyKind: "pickup",
  description: "Pickup body for score, inventory, or progress collection.",
  id: OBJECT_MODEL_TYPE_IDS.COLLECTIBLE,
  label: "Collectible",
  traits: Object.freeze([OBJECT_MODEL_TRAIT_IDS.COLLECTIBLE, OBJECT_MODEL_TRAIT_IDS.SCORES]),
});

const HAZARD_OBJECT_TYPE = Object.freeze({
  bodyKind: "danger",
  description: "Danger body for failure, reset, or damage-producing objects.",
  id: OBJECT_MODEL_TYPE_IDS.HAZARD,
  label: "Hazard",
  traits: Object.freeze([OBJECT_MODEL_TRAIT_IDS.HAZARD, OBJECT_MODEL_TRAIT_IDS.DAMAGEABLE]),
});

const GOAL_OBJECT_TYPE = Object.freeze({
  bodyKind: "completion",
  description: "Completion body for exits, win targets, scoring targets, or level goals.",
  id: OBJECT_MODEL_TYPE_IDS.GOAL,
  label: "Goal",
  traits: Object.freeze([OBJECT_MODEL_TRAIT_IDS.GOAL, OBJECT_MODEL_TRAIT_IDS.SCORES]),
});

export const OBJECT_MODEL_TYPE_REGISTRY = Object.freeze({
  [OBJECT_MODEL_TYPE_IDS.STATIC]: STATIC_OBJECT_TYPE,
  [OBJECT_MODEL_TYPE_IDS.DYNAMIC]: DYNAMIC_OBJECT_TYPE,
  [OBJECT_MODEL_TYPE_IDS.COLLECTIBLE]: COLLECTIBLE_OBJECT_TYPE,
  [OBJECT_MODEL_TYPE_IDS.HAZARD]: HAZARD_OBJECT_TYPE,
  [OBJECT_MODEL_TYPE_IDS.GOAL]: GOAL_OBJECT_TYPE,
});

export const OBJECT_MODEL_TYPE_LIST = Object.freeze(Object.values(OBJECT_MODEL_TYPE_REGISTRY));

const MOVABLE_TRAIT = Object.freeze({
  description: "Object position can be changed by authoring logic, input, or simulation.",
  id: OBJECT_MODEL_TRAIT_IDS.MOVABLE,
  label: "Movable",
});

const DAMAGEABLE_TRAIT = Object.freeze({
  description: "Object can receive damage or damaging interactions.",
  id: OBJECT_MODEL_TRAIT_IDS.DAMAGEABLE,
  label: "Damageable",
});

const KILLABLE_TRAIT = Object.freeze({
  description: "Object can be defeated, removed, or failed by authored conditions.",
  id: OBJECT_MODEL_TRAIT_IDS.KILLABLE,
  label: "Killable",
});

const PLAYER_CONTROLLED_TRAIT = Object.freeze({
  description: "Object is intended to respond to player control mapping.",
  id: OBJECT_MODEL_TRAIT_IDS.PLAYER_CONTROLLED,
  label: "Player Controlled",
});

const COLLIDES_TRAIT = Object.freeze({
  description: "Object participates in collision checks or blocking interactions.",
  id: OBJECT_MODEL_TRAIT_IDS.COLLIDES,
  label: "Collides",
});

const SCORES_TRAIT = Object.freeze({
  description: "Object can affect score, progress, or completion counters.",
  id: OBJECT_MODEL_TRAIT_IDS.SCORES,
  label: "Scores",
});

const COLLECTIBLE_TRAIT = Object.freeze({
  description: "Object can be collected by another authored object.",
  id: OBJECT_MODEL_TRAIT_IDS.COLLECTIBLE,
  label: "Collectible",
});

const HAZARD_TRAIT = Object.freeze({
  description: "Object represents danger or failure pressure.",
  id: OBJECT_MODEL_TRAIT_IDS.HAZARD,
  label: "Hazard",
});

const GOAL_TRAIT = Object.freeze({
  description: "Object represents a win, exit, or completion target.",
  id: OBJECT_MODEL_TRAIT_IDS.GOAL,
  label: "Goal",
});

export const OBJECT_MODEL_TRAIT_REGISTRY = Object.freeze({
  [OBJECT_MODEL_TRAIT_IDS.MOVABLE]: MOVABLE_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.DAMAGEABLE]: DAMAGEABLE_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.KILLABLE]: KILLABLE_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.PLAYER_CONTROLLED]: PLAYER_CONTROLLED_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.COLLIDES]: COLLIDES_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.SCORES]: SCORES_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.COLLECTIBLE]: COLLECTIBLE_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.HAZARD]: HAZARD_TRAIT,
  [OBJECT_MODEL_TRAIT_IDS.GOAL]: GOAL_TRAIT,
});

export const OBJECT_MODEL_TRAIT_LIST = Object.freeze(Object.values(OBJECT_MODEL_TRAIT_REGISTRY));

export function getObjectModelType(typeId) {
  return OBJECT_MODEL_TYPE_REGISTRY[registryKey(typeId)] || null;
}

export function getObjectModelTrait(traitId) {
  return OBJECT_MODEL_TRAIT_REGISTRY[registryKey(traitId)] || null;
}

export function isObjectModelType(typeId) {
  return getObjectModelType(typeId) !== null;
}

export function isObjectModelTrait(traitId) {
  return getObjectModelTrait(traitId) !== null;
}

function registryKey(value) {
  return typeof value === "string" ? value.trim() : "";
}

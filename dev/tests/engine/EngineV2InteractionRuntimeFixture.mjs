/*
Toolbox Aid
David Quesenberry
06/03/2026
EngineV2InteractionRuntimeFixture.mjs
*/

import { createEngineV2PossessionRuntimeFixture } from "./EngineV2PossessionRuntimeFixture.mjs";

export function createEngineV2InteractionRuntimeFixture() {
  const possession = createEngineV2PossessionRuntimeFixture();

  return {
    ...possession,
    runtimeObjects: [
      { instanceId: "hero.1", objectType: "dynamic" },
      { instanceId: "chest.1", objectType: "static" },
      { instanceId: "npc.vendor.1", objectType: "static" },
      { instanceId: "altar.1", objectType: "trigger" },
      { instanceId: "berry.1", objectType: "collectible" },
      { instanceId: "sign.1", objectType: "static" },
      { instanceId: "door.1", objectType: "trigger" },
    ],
    interactionDefinitions: [
      { interactionId: "interact.open.chest", interactionType: "open", targetInstanceId: "chest.1", actionIds: ["container.open"] },
      { interactionId: "interact.use.door", interactionType: "use", targetInstanceId: "door.1", actionIds: ["door.use"] },
      { interactionId: "interact.activate.altar", interactionType: "activate", targetInstanceId: "altar.1", actionIds: ["altar.activate"] },
      { interactionId: "interact.talk.vendor", interactionType: "talk", targetInstanceId: "npc.vendor.1", actionIds: ["vendor.talk"] },
      { interactionId: "interact.collect.berry", interactionType: "collect", targetInstanceId: "berry.1", actionIds: ["berry.collect"] },
      { interactionId: "interact.inspect.sign", interactionType: "inspect", targetInstanceId: "sign.1", actionIds: ["sign.inspect"] },
    ],
    interactionRequests: [
      { requestId: "request.open.chest", interactionId: "interact.open.chest", actorInstanceId: "hero.1" },
      { requestId: "request.use.door", interactionId: "interact.use.door", actorInstanceId: "hero.1" },
      { requestId: "request.activate.altar", interactionId: "interact.activate.altar", actorInstanceId: "hero.1" },
      { requestId: "request.talk.vendor", interactionId: "interact.talk.vendor", actorInstanceId: "hero.1" },
      { requestId: "request.collect.berry", interactionId: "interact.collect.berry", actorInstanceId: "hero.1" },
      { requestId: "request.inspect.sign", interactionId: "interact.inspect.sign", actorInstanceId: "hero.1" },
    ],
    containerDefinitions: [
      { containerId: "container.chest", containerType: "chest", inventoryId: "inventory.chest" },
      { containerId: "container.storage", containerType: "storage", inventoryId: "inventory.chest" },
      { containerId: "container.crate", containerType: "crate", inventoryId: "inventory.chest" },
    ],
    containerStates: [
      { containerId: "container.chest", isOpen: false },
      { containerId: "container.storage", isOpen: true },
      { containerId: "container.crate", isOpen: false },
    ],
    containerActions: [
      { actionId: "container.open", actionType: "open", containerId: "container.chest" },
      { actionId: "container.deposit", actionType: "deposit", containerId: "container.chest", actorInventoryId: "inventory.hero", itemId: "item.potion", quantity: 1 },
      { actionId: "container.withdraw", actionType: "withdraw", containerId: "container.chest", actorInventoryId: "inventory.hero", itemId: "item.gem", quantity: 1 },
    ],
    vendorDefinitions: [
      {
        vendorId: "vendor.market",
        ownerInstanceId: "npc.vendor.1",
        offers: [
          { offerId: "offer.buy.sword", itemId: "item.sword", currencyId: "gold", price: 50, quantity: 1 },
          { offerId: "offer.sell.gem", itemId: "item.gem", currencyId: "gold", price: 10, quantity: 1 },
          { offerId: "offer.exchange", itemId: "item.gem", currencyId: "gold", price: 20, quantity: 1, targetCurrencyId: "gem", targetAmount: 2 },
        ],
      },
    ],
    vendorRequests: [
      { requestId: "vendor.buy", actionType: "buy", vendorId: "vendor.market", offerId: "offer.buy.sword", actorInstanceId: "hero.1", actorInventoryId: "inventory.hero" },
      { requestId: "vendor.sell", actionType: "sell", vendorId: "vendor.market", offerId: "offer.sell.gem", actorInstanceId: "hero.1", actorInventoryId: "inventory.hero" },
      { requestId: "vendor.exchange", actionType: "exchange", vendorId: "vendor.market", offerId: "offer.exchange", actorInstanceId: "hero.1", actorInventoryId: "inventory.hero" },
    ],
    recipeDefinitions: [
      {
        recipeId: "recipe.sword",
        inputs: [{ itemId: "item.iron", quantity: 2 }],
        outputs: [{ itemId: "item.sword", quantity: 1 }],
      },
    ],
    craftingRequests: [{ requestId: "craft.sword", recipeId: "recipe.sword", inventoryId: "inventory.hero" }],
  };
}

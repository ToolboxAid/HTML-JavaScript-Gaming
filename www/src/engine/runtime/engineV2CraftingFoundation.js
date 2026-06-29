/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2CraftingFoundation.js
*/

export const ENGINE_V2_CRAFTING_ERRORS = Object.freeze({
  RECIPES_INVALID: "ENGINE_V2_CRAFTING_RECIPES_INVALID",
  REQUESTS_INVALID: "ENGINE_V2_CRAFTING_REQUESTS_INVALID",
  ITEMS_INVALID: "ENGINE_V2_CRAFTING_ITEMS_INVALID",
  RECIPE_INVALID: "ENGINE_V2_CRAFTING_RECIPE_INVALID",
  REQUEST_INVALID: "ENGINE_V2_CRAFTING_REQUEST_INVALID",
  RECIPE_MISSING: "ENGINE_V2_CRAFTING_RECIPE_MISSING",
  ITEM_MISSING: "ENGINE_V2_CRAFTING_ITEM_MISSING",
});

export function resolveEngineV2Crafting({ recipeDefinitions, craftingRequests, itemDefinitions }) {
  const errors = [];

  if (!Array.isArray(recipeDefinitions)) {
    errors.push(createCraftingError(ENGINE_V2_CRAFTING_ERRORS.RECIPES_INVALID, "Crafting foundation requires recipeDefinitions array.", "recipeDefinitions"));
  }

  if (!Array.isArray(craftingRequests)) {
    errors.push(createCraftingError(ENGINE_V2_CRAFTING_ERRORS.REQUESTS_INVALID, "Crafting foundation requires craftingRequests array.", "craftingRequests"));
  }

  if (!Array.isArray(itemDefinitions)) {
    errors.push(createCraftingError(ENGINE_V2_CRAFTING_ERRORS.ITEMS_INVALID, "Crafting foundation requires itemDefinitions array.", "itemDefinitions"));
  }

  if (errors.length > 0) {
    return createCraftingResult({ craftingEvents: [], inventoryActions: [], errors });
  }

  recipeDefinitions.forEach((recipe, index) => validateRecipe(recipe, `recipeDefinitions[${index}]`).forEach((error) => errors.push(error)));
  craftingRequests.forEach((request, index) => validateRequest(request, `craftingRequests[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createCraftingResult({ craftingEvents: [], inventoryActions: [], errors });
  }

  const recipesById = new Map(recipeDefinitions.map((recipe) => [recipe.recipeId, recipe]));
  const itemIds = new Set(itemDefinitions.map((item) => item.itemId));
  const craftingEvents = [];
  const inventoryActions = [];

  craftingRequests.forEach((request, index) => {
    const path = `craftingRequests[${index}]`;
    const recipe = recipesById.get(request.recipeId);

    if (!recipe) {
      errors.push(createCraftingError(ENGINE_V2_CRAFTING_ERRORS.RECIPE_MISSING, "Crafting request references missing recipe.", `${path}.recipeId`));
      return;
    }

    const missingItem = [...recipe.inputs, ...recipe.outputs].find((entry) => !itemIds.has(entry.itemId));

    if (missingItem) {
      errors.push(createCraftingError(ENGINE_V2_CRAFTING_ERRORS.ITEM_MISSING, "Crafting recipe references missing item definition.", `recipeDefinitions.${recipe.recipeId}`));
      return;
    }

    recipe.inputs.forEach((input) => {
      inventoryActions.push(Object.freeze({ actionId: `${request.requestId}.input.${input.itemId}`, actionType: "remove", inventoryId: request.inventoryId, itemId: input.itemId, quantity: input.quantity }));
    });
    recipe.outputs.forEach((output) => {
      inventoryActions.push(Object.freeze({ actionId: `${request.requestId}.output.${output.itemId}`, actionType: "add", inventoryId: request.inventoryId, itemId: output.itemId, quantity: output.quantity }));
    });
    craftingEvents.push(Object.freeze({ requestId: request.requestId, recipeId: recipe.recipeId, inventoryId: request.inventoryId }));
  });

  if (errors.length > 0) {
    return createCraftingResult({ craftingEvents: [], inventoryActions: [], errors });
  }

  return createCraftingResult({ craftingEvents, inventoryActions, errors });
}

function validateRecipe(recipe, path) {
  if (!isRecord(recipe) || !hasNonEmptyString(recipe.recipeId) || !Array.isArray(recipe.inputs) || !Array.isArray(recipe.outputs)) {
    return [createCraftingError(ENGINE_V2_CRAFTING_ERRORS.RECIPE_INVALID, "Recipe definition requires recipeId, inputs, and outputs.", path)];
  }

  if (![...recipe.inputs, ...recipe.outputs].every((entry) => isRecord(entry) && hasNonEmptyString(entry.itemId) && Number.isInteger(entry.quantity) && entry.quantity > 0)) {
    return [createCraftingError(ENGINE_V2_CRAFTING_ERRORS.RECIPE_INVALID, "Recipe input/output entries require itemId and positive quantity.", path)];
  }

  return [];
}

function validateRequest(request, path) {
  if (!isRecord(request) || !hasNonEmptyString(request.requestId) || !hasNonEmptyString(request.recipeId) || !hasNonEmptyString(request.inventoryId)) {
    return [createCraftingError(ENGINE_V2_CRAFTING_ERRORS.REQUEST_INVALID, "Crafting request requires requestId, recipeId, and inventoryId.", path)];
  }

  return [];
}

function createCraftingResult({ craftingEvents, inventoryActions, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    craftingEvents: Object.freeze(craftingEvents),
    inventoryActions: Object.freeze(inventoryActions),
    errors: Object.freeze(errors),
  });
}

function createCraftingError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

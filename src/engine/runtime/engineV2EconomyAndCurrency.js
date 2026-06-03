/*
Toolbox Aid
David Quesenberry
06/03/2026
engineV2EconomyAndCurrency.js
*/

export const ENGINE_V2_ECONOMY_ACTIONS = Object.freeze({
  ADD: "add",
  SPEND: "spend",
  EXCHANGE: "exchange",
});

export const ENGINE_V2_ECONOMY_ERRORS = Object.freeze({
  CURRENCIES_INVALID: "ENGINE_V2_CURRENCIES_INVALID",
  BALANCES_INVALID: "ENGINE_V2_CURRENCY_BALANCES_INVALID",
  ACTIONS_INVALID: "ENGINE_V2_ECONOMY_ACTIONS_INVALID",
  CURRENCY_INVALID: "ENGINE_V2_CURRENCY_INVALID",
  BALANCE_INVALID: "ENGINE_V2_CURRENCY_BALANCE_INVALID",
  ACTION_INVALID: "ENGINE_V2_ECONOMY_ACTION_INVALID",
  CURRENCY_MISSING: "ENGINE_V2_CURRENCY_MISSING",
  BALANCE_UNAVAILABLE: "ENGINE_V2_CURRENCY_BALANCE_UNAVAILABLE",
});

export function resolveEngineV2EconomyAndCurrency({ currencyDefinitions, currencyBalances, economyActions }) {
  const errors = [];

  if (!Array.isArray(currencyDefinitions)) {
    errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.CURRENCIES_INVALID, "Economy system requires currencyDefinitions array.", "currencyDefinitions"));
  }

  if (!Array.isArray(currencyBalances)) {
    errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.BALANCES_INVALID, "Economy system requires currencyBalances array.", "currencyBalances"));
  }

  if (!Array.isArray(economyActions)) {
    errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.ACTIONS_INVALID, "Economy system requires economyActions array.", "economyActions"));
  }

  if (errors.length > 0) {
    return createEconomyResult({ currencyBalances: [], economyEvents: [], errors });
  }

  currencyDefinitions.forEach((definition, index) => validateCurrency(definition, `currencyDefinitions[${index}]`).forEach((error) => errors.push(error)));
  currencyBalances.forEach((balance, index) => validateBalance(balance, `currencyBalances[${index}]`).forEach((error) => errors.push(error)));
  economyActions.forEach((action, index) => validateEconomyAction(action, `economyActions[${index}]`).forEach((error) => errors.push(error)));

  if (errors.length > 0) {
    return createEconomyResult({ currencyBalances: [], economyEvents: [], errors });
  }

  const currencyIds = new Set(currencyDefinitions.map((definition) => definition.currencyId));
  const nextBalances = currencyBalances.map((balance) => ({ ...balance }));
  const economyEvents = [];

  economyActions.forEach((action, index) => {
    const path = `economyActions[${index}]`;

    if (!currencyIds.has(action.currencyId)) {
      errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.CURRENCY_MISSING, "Economy action references missing currency definition.", `${path}.currencyId`));
      return;
    }

    if (action.actionType === ENGINE_V2_ECONOMY_ACTIONS.EXCHANGE) {
      applyExchange({ action, currencyIds, nextBalances, path, errors, economyEvents });
      return;
    }

    const balance = findOrCreateBalance(nextBalances, action.ownerInstanceId, action.currencyId);

    if (action.actionType === ENGINE_V2_ECONOMY_ACTIONS.SPEND && balance.amount < action.amount) {
      errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.BALANCE_UNAVAILABLE, "Spend action requires available currency balance.", `${path}.amount`));
      return;
    }

    balance.amount += action.actionType === ENGINE_V2_ECONOMY_ACTIONS.ADD ? action.amount : -action.amount;
    economyEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, ownerInstanceId: action.ownerInstanceId, currencyId: action.currencyId, amount: action.amount }));
  });

  if (errors.length > 0) {
    return createEconomyResult({ currencyBalances: [], economyEvents: [], errors });
  }

  return createEconomyResult({
    currencyBalances: nextBalances.map((balance) => Object.freeze(balance)),
    economyEvents,
    errors,
  });
}

function applyExchange({ action, currencyIds, nextBalances, path, errors, economyEvents }) {
  if (!currencyIds.has(action.targetCurrencyId)) {
    errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.CURRENCY_MISSING, "Exchange action references missing target currency definition.", `${path}.targetCurrencyId`));
    return;
  }

  const sourceBalance = findOrCreateBalance(nextBalances, action.ownerInstanceId, action.currencyId);

  if (sourceBalance.amount < action.amount) {
    errors.push(createEconomyError(ENGINE_V2_ECONOMY_ERRORS.BALANCE_UNAVAILABLE, "Exchange action requires available source currency.", `${path}.amount`));
    return;
  }

  const targetBalance = findOrCreateBalance(nextBalances, action.ownerInstanceId, action.targetCurrencyId);
  sourceBalance.amount -= action.amount;
  targetBalance.amount += action.targetAmount;
  economyEvents.push(Object.freeze({ actionId: action.actionId, actionType: action.actionType, ownerInstanceId: action.ownerInstanceId, currencyId: action.currencyId, amount: action.amount, targetCurrencyId: action.targetCurrencyId, targetAmount: action.targetAmount }));
}

function findOrCreateBalance(balances, ownerInstanceId, currencyId) {
  const balance = balances.find((entry) => entry.ownerInstanceId === ownerInstanceId && entry.currencyId === currencyId);

  if (balance) {
    return balance;
  }

  const created = { ownerInstanceId, currencyId, amount: 0 };
  balances.push(created);
  return created;
}

function validateCurrency(definition, path) {
  if (!isRecord(definition) || !hasNonEmptyString(definition.currencyId) || !hasNonEmptyString(definition.displayName) || !Number.isInteger(definition.precision) || definition.precision < 0) {
    return [createEconomyError(ENGINE_V2_ECONOMY_ERRORS.CURRENCY_INVALID, "Currency definition requires currencyId, displayName, and precision.", path)];
  }

  return [];
}

function validateBalance(balance, path) {
  if (!isRecord(balance) || !hasNonEmptyString(balance.ownerInstanceId) || !hasNonEmptyString(balance.currencyId) || !Number.isFinite(balance.amount) || balance.amount < 0) {
    return [createEconomyError(ENGINE_V2_ECONOMY_ERRORS.BALANCE_INVALID, "Currency balance requires ownerInstanceId, currencyId, and non-negative amount.", path)];
  }

  return [];
}

function validateEconomyAction(action, path) {
  if (!isRecord(action) || !hasNonEmptyString(action.actionId) || !hasNonEmptyString(action.ownerInstanceId) || !hasNonEmptyString(action.currencyId) || !Object.values(ENGINE_V2_ECONOMY_ACTIONS).includes(action.actionType) || !Number.isFinite(action.amount) || action.amount <= 0) {
    return [createEconomyError(ENGINE_V2_ECONOMY_ERRORS.ACTION_INVALID, "Economy action requires actionId, ownerInstanceId, currencyId, actionType, and positive amount.", path)];
  }

  if (action.actionType === ENGINE_V2_ECONOMY_ACTIONS.EXCHANGE && (!hasNonEmptyString(action.targetCurrencyId) || !Number.isFinite(action.targetAmount) || action.targetAmount <= 0)) {
    return [createEconomyError(ENGINE_V2_ECONOMY_ERRORS.ACTION_INVALID, "Exchange action requires targetCurrencyId and positive targetAmount.", path)];
  }

  return [];
}

function createEconomyResult({ currencyBalances, economyEvents, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    currencyBalances: Object.freeze(currencyBalances),
    economyEvents: Object.freeze(economyEvents),
    errors: Object.freeze(errors),
  });
}

function createEconomyError(code, message, path) {
  return Object.freeze({ code, message, path });
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

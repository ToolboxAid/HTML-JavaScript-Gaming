/*
Toolbox Aid
David Quesenberry
04/14/2026
networkPromotionRecommendation.js
*/

import { asBoolean, asObject } from "../shared/networkDebugUtils.js";

function normalizeChecks(input = {}) {
  const source = asObject(input);
  return {
    providerValidation: asBoolean(source.providerValidation, false),
    panelValidation: asBoolean(source.panelValidation, false),
    operatorCommandValidation: asBoolean(source.operatorCommandValidation, false),
    debugOnlyGatingValidation: asBoolean(source.debugOnlyGatingValidation, false)
  };
}

export function createNetworkPromotionRecommendation(checks = {}) {
  const normalized = normalizeChecks(checks);
  const allPassing = Object.values(normalized).every((value) => value === true);

  return {
    readyForPromotion: allPassing,
    recommendation: allPassing ? "promote" : "hold",
    checks: normalized,
    lines: [
      `providerValidation=${normalized.providerValidation}`,
      `panelValidation=${normalized.panelValidation}`,
      `operatorCommandValidation=${normalized.operatorCommandValidation}`,
      `debugOnlyGatingValidation=${normalized.debugOnlyGatingValidation}`,
      `recommendation=${allPassing ? "promote" : "hold"}`
    ]
  };
}

/*
Toolbox Aid
David Quesenberry
06/02/2026
runtimeRuleAttachment.js
*/

export const RUNTIME_RULE_ATTACHMENT_ERRORS = Object.freeze({
  OBJECTS_INVALID: "RUNTIME_RULE_ATTACHMENT_OBJECTS_INVALID",
  RULES_INVALID: "RUNTIME_RULE_ATTACHMENT_RULES_INVALID",
  RULE_MISSING: "RUNTIME_RULE_ATTACHMENT_RULE_MISSING",
});

export function attachRuntimeRules(runtimeObjects, ruleDefinitions) {
  const errors = [];

  if (!Array.isArray(runtimeObjects)) {
    errors.push(createRuleAttachmentError(
      RUNTIME_RULE_ATTACHMENT_ERRORS.OBJECTS_INVALID,
      "Rule attachment requires runtimeObjects array.",
      "runtimeObjects"
    ));
  }

  if (!Array.isArray(ruleDefinitions)) {
    errors.push(createRuleAttachmentError(
      RUNTIME_RULE_ATTACHMENT_ERRORS.RULES_INVALID,
      "Rule attachment requires ruleDefinitions array.",
      "ruleDefinitions"
    ));
  }

  if (errors.length > 0) {
    return createRuleAttachmentResult({ runtimeObjects: [], errors });
  }

  const rulesById = new Map(ruleDefinitions.map((rule) => [rule.ruleId, rule]));
  const attachedObjects = [];

  runtimeObjects.forEach((runtimeObject) => {
    const attachedRules = [];

    runtimeObject.rules.forEach((ruleId) => {
      const ruleDefinition = rulesById.get(ruleId);

      if (!ruleDefinition) {
        errors.push(createRuleAttachmentError(
          RUNTIME_RULE_ATTACHMENT_ERRORS.RULE_MISSING,
          "Runtime object references a missing rule definition.",
          `${runtimeObject.instanceId}.rules.${ruleId}`
        ));
        return;
      }

      attachedRules.push(Object.freeze({
        ruleId: ruleDefinition.ruleId,
        ruleType: ruleDefinition.ruleType,
        parameters: ruleDefinition.parameters,
      }));
    });

    attachedObjects.push(Object.freeze({
      ...runtimeObject,
      attachedRules: Object.freeze(attachedRules),
    }));
  });

  return createRuleAttachmentResult({
    runtimeObjects: errors.length === 0 ? attachedObjects : [],
    errors,
  });
}

function createRuleAttachmentResult({ runtimeObjects, errors }) {
  return Object.freeze({
    valid: errors.length === 0,
    runtimeObjects: Object.freeze(runtimeObjects),
    errors: Object.freeze(errors),
  });
}

function createRuleAttachmentError(code, message, path) {
  return Object.freeze({ code, message, path });
}

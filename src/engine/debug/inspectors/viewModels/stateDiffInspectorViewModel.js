/*
Toolbox Aid
David Quesenberry
04/06/2026
stateDiffInspectorViewModel.js
*/

import {
  asPositiveInteger,
  asObject
} from "../shared/inspectorUtils.js";
import { stringifyValue } from "../../../../shared/utils/stringifyValueUtils.js";

export function createStateDiffInspectorViewModel(options = {}) {
  const source = asObject(options);
  const previousState = asObject(source.previousState);
  const currentState = asObject(source.currentState);
  const limit = asPositiveInteger(source.limit, 20);

  const keys = new Set([
    ...Object.keys(previousState),
    ...Object.keys(currentState)
  ]);
  const orderedKeys = Array.from(keys).sort((left, right) => left.localeCompare(right));

  const changes = [];
  orderedKeys.forEach((key) => {
    const hasBefore = Object.prototype.hasOwnProperty.call(previousState, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(currentState, key);

    if (!hasBefore && hasAfter) {
      changes.push({
        kind: "added",
        key,
        before: undefined,
        after: currentState[key]
      });
      return;
    }
    if (hasBefore && !hasAfter) {
      changes.push({
        kind: "removed",
        key,
        before: previousState[key],
        after: undefined
      });
      return;
    }

    const before = stringifyValue(previousState[key]);
    const after = stringifyValue(currentState[key]);
    if (before !== after) {
      changes.push({
        kind: "changed",
        key,
        before: previousState[key],
        after: currentState[key]
      });
    }
  });

  const selectedChanges = changes.slice(0, limit);
  const lines = [
    `totalChanges=${changes.length}`,
    `shown=${selectedChanges.length}`,
    `truncated=${Math.max(0, changes.length - selectedChanges.length)}`
  ];
  selectedChanges.forEach((change) => {
    lines.push(`${change.kind}:${change.key}:${stringifyValue(change.before)}->${stringifyValue(change.after)}`);
  });
  if (selectedChanges.length === 0) {
    lines.push("No state changes detected.");
  }

  return {
    inspectorId: "inspector.stateDiff",
    title: "State Diff Viewer",
    totalChanges: changes.length,
    changes: selectedChanges,
    lines
  };
}


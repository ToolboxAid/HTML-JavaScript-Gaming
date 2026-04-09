/*
Toolbox Aid
David Quesenberry
04/07/2026
createPromotionGate.js
*/

import { asFiniteNumber, asPositiveInteger } from '../../shared/utils/numberUtils.js';
import { isPlainObject } from '../../shared/utils/objectUtils.js';
import { getState as getPromotionPublicState } from '../../shared/state/getState.js';

function normalizeCriteriaMap(input, requiredCriteria = []) {
  const normalized = {};
  if (isPlainObject(input)) {
    const keys = Object.keys(input);
    for (let i = 0; i < keys.length; i += 1) {
      normalized[String(keys[i])] = Boolean(input[keys[i]]);
    }
  }

  for (let i = 0; i < requiredCriteria.length; i += 1) {
    const key = requiredCriteria[i];
    if (!(key in normalized)) normalized[key] = false;
  }

  return normalized;
}

function sanitizeRequiredCriteria(requiredCriteria) {
  if (!Array.isArray(requiredCriteria)) return [];
  const seen = new Set();
  const out = [];
  for (let i = 0; i < requiredCriteria.length; i += 1) {
    const key = String(requiredCriteria[i] || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

function createHandoffDecision({ promoted, promotedNow }) {
  return {
    decisionPath: 'PROMOTION_GATE_HANDOFF',
    fromMode: promotedNow ? 'passive' : (promoted ? 'authoritative' : 'passive'),
    toMode: promoted ? 'authoritative' : 'passive',
    shouldHandoff: Boolean(promotedNow)
  };
}

function resolveGateMode({ promoted }) {
  return promoted ? 'authoritative' : 'passive';
}

function createAbortVisibility({ rollbackTriggered, promoted, reason }) {
  const aborted = Boolean(rollbackTriggered);
  return {
    decisionPath: 'PROMOTION_GATE_ABORT_VISIBILITY',
    rollbackTriggered: Boolean(rollbackTriggered),
    aborted,
    reason: aborted
      ? (promoted ? 'ROLLBACK_ABORT_VISIBLE' : 'ROLLBACK_ABORTED_PROMOTION')
      : String(reason || '')
  };
}

function createValidationChecklist(evaluation, cycleState) {
  const modeVisible = typeof evaluation?.mode === 'string' && evaluation.mode.length > 0;
  const handoffVisible = isPlainObject(evaluation?.handoff)
    && evaluation.handoff.decisionPath === 'PROMOTION_GATE_HANDOFF';
  const abortVisible = isPlainObject(evaluation?.abort)
    && evaluation.abort.decisionPath === 'PROMOTION_GATE_ABORT_VISIBILITY';

  cycleState.passiveSeen = cycleState.passiveSeen || evaluation.mode === 'passive';
  cycleState.authoritativeSeen = cycleState.authoritativeSeen || evaluation.mode === 'authoritative';
  cycleState.abortSeen = cycleState.abortSeen || evaluation.abort?.aborted === true;
  cycleState.fullCycleReached = cycleState.passiveSeen && cycleState.authoritativeSeen && cycleState.abortSeen;

  return {
    checklistPath: 'PROMOTION_GATE_VALIDATION_CLOSEOUT',
    modeVisible,
    handoffVisible,
    abortVisible,
    passiveSeen: cycleState.passiveSeen,
    authoritativeSeen: cycleState.authoritativeSeen,
    abortSeen: cycleState.abortSeen,
    fullCycleReached: cycleState.fullCycleReached
  };
}

function createPromotionGate(options = {}) {
  const now = typeof options.now === 'function' ? options.now : () => Date.now();
  const requiredCriteria = sanitizeRequiredCriteria(options.requiredCriteria);
  const stabilityWindowFrames = asPositiveInteger(options.stabilityWindowFrames, 3);
  const logger = typeof options.logger === 'function' ? options.logger : null;
  const onEvaluation = typeof options.onEvaluation === 'function' ? options.onEvaluation : null;
  const onValidation = typeof options.onValidation === 'function' ? options.onValidation : null;

  let promoted = Boolean(options.initiallyPromoted);
  let stableFrames = promoted ? stabilityWindowFrames : 0;
  let lastReason = promoted ? 'ALREADY_PROMOTED' : 'AWAITING_CRITERIA';
  let lastEvaluation = null;

  const metrics = {
    evaluations: 0,
    stableEvaluations: 0,
    blockedEvaluations: 0,
    rollbackAborts: 0,
    promotions: promoted ? 1 : 0,
    lastEvaluationAtMs: null,
    lastPromotionAtMs: promoted ? Number(now()) : null
  };
  const validationCycle = {
    passiveSeen: !promoted,
    authoritativeSeen: promoted,
    abortSeen: false,
    fullCycleReached: false
  };

  function getMetrics() {
    return {
      ...metrics,
      promoted,
      stableFrames,
      stabilityWindowFrames
    };
  }

  function evaluate({
    criteria = {},
    rollbackTriggered = false,
    transitionName = '',
    frame = null
  } = {}) {
    metrics.evaluations += 1;
    const timestampMs = Number(now());
    metrics.lastEvaluationAtMs = timestampMs;

    const normalizedCriteria = normalizeCriteriaMap(criteria, requiredCriteria);
    const criteriaKeys = Object.keys(normalizedCriteria);
    const unmetCriteria = [];
    for (let i = 0; i < criteriaKeys.length; i += 1) {
      const key = criteriaKeys[i];
      if (!normalizedCriteria[key]) unmetCriteria.push(key);
    }

    const hasCriteria = criteriaKeys.length > 0;
    const allCriteriaMet = hasCriteria && unmetCriteria.length === 0;

    let promotedNow = false;
    if (rollbackTriggered && !promoted) {
      stableFrames = 0;
      lastReason = 'ROLLBACK_ABORTED_PROMOTION';
      metrics.rollbackAborts += 1;
      metrics.blockedEvaluations += 1;
    } else if (promoted) {
      lastReason = 'ALREADY_PROMOTED';
      stableFrames = stabilityWindowFrames;
      metrics.stableEvaluations += 1;
    } else if (!hasCriteria) {
      stableFrames = 0;
      lastReason = 'PROMOTION_CRITERIA_MISSING';
      metrics.blockedEvaluations += 1;
    } else if (!allCriteriaMet) {
      stableFrames = 0;
      lastReason = 'PROMOTION_CRITERIA_UNMET';
      metrics.blockedEvaluations += 1;
    } else {
      stableFrames += 1;
      metrics.stableEvaluations += 1;
      lastReason = stableFrames >= stabilityWindowFrames
        ? 'PROMOTION_READY'
        : 'PROMOTION_STABILIZING';
      if (stableFrames >= stabilityWindowFrames) {
        promoted = true;
        promotedNow = true;
        metrics.promotions += 1;
        metrics.lastPromotionAtMs = timestampMs;
        lastReason = 'PROMOTED';
      }
    }

    const readiness = promoted
      ? 'authoritative'
      : (allCriteriaMet ? 'stabilizing' : 'passive');
    const mode = resolveGateMode({ promoted });
    const handoff = createHandoffDecision({ promoted, promotedNow });
    const abort = createAbortVisibility({
      rollbackTriggered,
      promoted,
      reason: lastReason
    });
    const evaluation = {
      transitionName: String(transitionName || ''),
      frame: frame !== undefined && frame !== null ? Number(frame) : null,
      timestampMs,
      readiness,
      mode,
      promoted,
      promotedNow,
      rollbackTriggered: Boolean(rollbackTriggered),
      stability: {
        currentFrames: stableFrames,
        requiredFrames: stabilityWindowFrames
      },
      criteria: {
        values: normalizedCriteria,
        unmet: unmetCriteria,
        allMet: allCriteriaMet
      },
      handoff,
      abort,
      reason: lastReason,
      metrics: getMetrics()
    };
    evaluation.validation = createValidationChecklist(evaluation, validationCycle);

    lastEvaluation = evaluation;

    if (logger) {
      logger(
        `[promotion-gate] readiness=${readiness} promoted=${String(promoted)} ` +
        `stable=${stableFrames}/${stabilityWindowFrames} reason=${lastReason}`
      );
    }
    if (onEvaluation) {
      onEvaluation(evaluation);
    }
    if (onValidation) {
      onValidation(evaluation.validation, evaluation);
    }

    return evaluation;
  }

  function reset(reason = 'MANUAL_RESET') {
    promoted = false;
    stableFrames = 0;
    lastReason = String(reason || 'MANUAL_RESET');
    lastEvaluation = null;
  }

  return {
    evaluate,
    getMetrics,
    getState() {
      return getPromotionPublicState({
        promoted,
        stableFrames,
        stabilityWindowFrames,
        lastReason,
        lastEvaluation,
        cloneLastEvaluation: (value) => (value ? { ...value } : null)
      });
    },
    reset
  };
}

export { createPromotionGate };

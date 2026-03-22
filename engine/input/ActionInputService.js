/*
Toolbox Aid
David Quesenberry
03/22/2026
ActionInputService.js
*/
import ActionInputMap from './ActionInputMap.js';

export default class ActionInputService {
  constructor({
    actionMap = new ActionInputMap(),
    actionBufferDurations = {},
    actionQueueDurations = {},
    actionPriorities = {},
    actionCooldownDurations = {},
    actionChains = [],
  } = {}) {
    this.actionMap = actionMap;
    this.down = new Set();
    this.pressedCodes = new Set();
    this.framePressedCodes = new Set();
    this.pressedActions = new Set();

    this.actionBuffers = new Map();
    this.actionBufferDurations = new Map(Object.entries(actionBufferDurations));

    this.actionQueue = [];
    this.actionQueueDurations = new Map(Object.entries(actionQueueDurations));
    this.actionPriorities = new Map(Object.entries(actionPriorities));
    this.queueSequence = 0;

    this.actionWindows = new Map();
    this.actionWindowHits = new Set();

    this.actionCooldowns = new Map();
    this.actionCooldownDurations = new Map(Object.entries(actionCooldownDurations));

    this.actionChains = new Map();
    this.completedChains = new Set();
    this.actionHistory = [];
    this.historySequence = 0;
    this.setActionChains(actionChains);

    this._onKeyDown = (event) => {
      if (!this.down.has(event.code)) {
        this.pressedCodes.add(event.code);
      }

      this.down.add(event.code);
    };
    this._onKeyUp = (event) => this.down.delete(event.code);
  }

  attach() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.down.clear();
    this.pressedCodes.clear();
    this.framePressedCodes.clear();
    this.pressedActions.clear();
    this.actionBuffers.clear();
    this.actionQueue = [];
    this.actionWindows.clear();
    this.actionWindowHits.clear();
    this.actionCooldowns.clear();
    this.completedChains.clear();
    this.actionHistory = [];
  }

  update(dtSeconds = 0) {
    this.framePressedCodes = new Set(this.pressedCodes);
    this.pressedActions.clear();
    this.actionWindowHits.clear();
    this.completedChains.clear();

    if (dtSeconds > 0) {
      this.updateTimers(dtSeconds);
    }

    for (const action of this.actionMap.getActions()) {
      const keys = this.actionMap.getKeys(action);
      const wasPressed = keys.some((code) => this.framePressedCodes.has(code));

      if (!wasPressed) {
        continue;
      }

      this.pressedActions.add(action);
      this.enqueueAction(action);
      this.bufferAction(action);
      this.registerActionWindowHit(action);
      this.recordActionHistory(action);
    }

    this.evaluateChains();
    this.pressedCodes.clear();
  }

  updateTimers(dtSeconds) {
    this.decayMap(this.actionBuffers, dtSeconds);
    this.decayMap(this.actionWindows, dtSeconds);
    this.decayMap(this.actionCooldowns, dtSeconds);

    this.actionQueue = this.actionQueue
      .map((entry) => ({ ...entry, remaining: entry.remaining - dtSeconds }))
      .filter((entry) => entry.remaining > 0);

    const maxChainWindow = this.getMaxChainWindow();
    if (maxChainWindow > 0) {
      this.actionHistory = this.actionHistory
        .map((entry) => ({ ...entry, age: entry.age + dtSeconds }))
        .filter((entry) => entry.age <= maxChainWindow);
    } else {
      this.actionHistory = [];
    }
  }

  decayMap(map, dtSeconds) {
    for (const [key, remaining] of map.entries()) {
      const next = remaining - dtSeconds;
      if (next > 0) {
        map.set(key, next);
      } else {
        map.delete(key);
      }
    }
  }

  enqueueAction(action) {
    const duration = this.getActionQueueDuration(action);
    if (duration <= 0) {
      return;
    }

    this.actionQueue.push({
      action,
      priority: this.getActionPriority(action),
      remaining: duration,
      sequence: this.queueSequence++,
    });
  }

  bufferAction(action) {
    const duration = this.getActionBufferDuration(action);
    if (duration > 0) {
      this.actionBuffers.set(action, duration);
    }
  }

  registerActionWindowHit(action) {
    if (this.isActionWindowOpen(action)) {
      this.actionWindowHits.add(action);
    }
  }

  recordActionHistory(action) {
    this.actionHistory.push({
      action,
      age: 0,
      sequence: this.historySequence++,
    });
  }

  evaluateChains() {
    for (const [name, chain] of this.actionChains.entries()) {
      if (this.historyMatchesSequence(chain.sequence, chain.windowSeconds)) {
        this.completedChains.add(name);
      }
    }
  }

  historyMatchesSequence(sequence, windowSeconds) {
    if (sequence.length === 0 || this.actionHistory.length < sequence.length) {
      return false;
    }

    const recent = this.actionHistory.slice(-sequence.length);
    const matches = recent.every((entry, index) => entry.action === sequence[index]);
    if (!matches) {
      return false;
    }

    return recent[0].age <= windowSeconds;
  }

  getMaxChainWindow() {
    let maxWindow = 0;
    for (const chain of this.actionChains.values()) {
      maxWindow = Math.max(maxWindow, chain.windowSeconds);
    }
    return maxWindow;
  }

  setActionChains(chains = []) {
    this.actionChains.clear();

    for (const chain of chains) {
      if (!chain || !chain.name || !Array.isArray(chain.sequence)) {
        continue;
      }

      this.actionChains.set(chain.name, {
        name: chain.name,
        sequence: [...chain.sequence],
        windowSeconds: Math.max(0, chain.windowSeconds ?? 0.75),
      });
    }
  }

  isDown(code) {
    return this.down.has(code);
  }

  isPressed(code) {
    return this.framePressedCodes.has(code);
  }

  isActionDown(action) {
    return this.actionMap.getKeys(action).some((code) => this.down.has(code));
  }

  isActionPressed(action) {
    return this.pressedActions.has(action);
  }

  isActionBuffered(action) {
    return (this.actionBuffers.get(action) ?? 0) > 0;
  }

  consumeActionBuffer(action) {
    if (!this.isActionBuffered(action)) {
      return false;
    }

    this.actionBuffers.delete(action);
    return true;
  }

  getActionBufferTime(action) {
    return Math.max(0, this.actionBuffers.get(action) ?? 0);
  }

  setActionBufferDuration(action, durationSeconds) {
    this.setDurationMapValue(this.actionBufferDurations, action, durationSeconds);
  }

  getActionBufferDuration(action) {
    return Math.max(0, this.actionBufferDurations.get(action) ?? 0);
  }

  setActionQueueDuration(action, durationSeconds) {
    this.setDurationMapValue(this.actionQueueDurations, action, durationSeconds);
  }

  getActionQueueDuration(action) {
    return Math.max(0, this.actionQueueDurations.get(action) ?? 0);
  }

  setActionPriority(action, priority) {
    this.actionPriorities.set(action, Number(priority) || 0);
  }

  getActionPriority(action) {
    return Number(this.actionPriorities.get(action) ?? 0);
  }

  getQueuedActions() {
    return [...this.actionQueue]
      .sort((a, b) => (b.priority - a.priority) || (a.sequence - b.sequence))
      .map((entry) => ({
        action: entry.action,
        priority: entry.priority,
        remaining: entry.remaining,
      }));
  }

  isActionQueued(action) {
    return this.actionQueue.some((entry) => entry.action === action);
  }

  consumeQueuedAction(allowedActions = null) {
    const allowed = Array.isArray(allowedActions) ? new Set(allowedActions) : null;
    let bestIndex = -1;

    for (let index = 0; index < this.actionQueue.length; index += 1) {
      const entry = this.actionQueue[index];
      if (allowed && !allowed.has(entry.action)) {
        continue;
      }

      if (bestIndex === -1) {
        bestIndex = index;
        continue;
      }

      const best = this.actionQueue[bestIndex];
      const isHigherPriority = entry.priority > best.priority;
      const isEarlierTie = entry.priority === best.priority && entry.sequence < best.sequence;
      if (isHigherPriority || isEarlierTie) {
        bestIndex = index;
      }
    }

    if (bestIndex === -1) {
      return null;
    }

    const [entry] = this.actionQueue.splice(bestIndex, 1);
    return {
      action: entry.action,
      priority: entry.priority,
      remaining: entry.remaining,
    };
  }

  openActionWindow(action, durationSeconds) {
    if (durationSeconds > 0) {
      this.actionWindows.set(action, durationSeconds);
      return;
    }

    this.actionWindows.delete(action);
  }

  isActionWindowOpen(action) {
    return (this.actionWindows.get(action) ?? 0) > 0;
  }

  getActionWindowTime(action) {
    return Math.max(0, this.actionWindows.get(action) ?? 0);
  }

  consumeActionWindowHit(action) {
    if (!this.actionWindowHits.has(action)) {
      return false;
    }

    this.actionWindowHits.delete(action);
    return true;
  }

  setActionCooldownDuration(action, durationSeconds) {
    this.setDurationMapValue(this.actionCooldownDurations, action, durationSeconds);
  }

  getActionCooldownDuration(action) {
    return Math.max(0, this.actionCooldownDurations.get(action) ?? 0);
  }

  triggerActionCooldown(action, durationSeconds = null) {
    const duration = durationSeconds ?? this.getActionCooldownDuration(action);
    if (duration > 0) {
      this.actionCooldowns.set(action, duration);
    }
  }

  isActionOnCooldown(action) {
    return (this.actionCooldowns.get(action) ?? 0) > 0;
  }

  getActionCooldownTime(action) {
    return Math.max(0, this.actionCooldowns.get(action) ?? 0);
  }

  getActionChainProgress(name) {
    const chain = this.actionChains.get(name);
    if (!chain) {
      return 0;
    }

    const recentActions = this.actionHistory.map((entry) => entry.action);
    const maxLength = Math.min(chain.sequence.length, recentActions.length);

    for (let length = maxLength; length > 0; length -= 1) {
      const historySlice = recentActions.slice(-length);
      const chainSlice = chain.sequence.slice(0, length);
      const matches = historySlice.every((action, index) => action === chainSlice[index]);
      if (matches) {
        return length;
      }
    }

    return 0;
  }

  isActionChainComplete(name) {
    return this.completedChains.has(name);
  }

  consumeActionChain(name) {
    if (!this.completedChains.has(name)) {
      return false;
    }

    this.completedChains.delete(name);
    return true;
  }

  getActionDebugSnapshot(actions = null) {
    const actionList = Array.isArray(actions) ? actions : this.actionMap.getActions();

    return actionList.map((action) => ({
      action,
      down: this.isActionDown(action),
      pressed: this.isActionPressed(action),
      buffered: this.isActionBuffered(action),
      bufferTime: this.getActionBufferTime(action),
      queued: this.isActionQueued(action),
      priority: this.getActionPriority(action),
      windowOpen: this.isActionWindowOpen(action),
      windowTime: this.getActionWindowTime(action),
      cooldown: this.isActionOnCooldown(action),
      cooldownTime: this.getActionCooldownTime(action),
    }));
  }

  setDurationMapValue(map, action, durationSeconds) {
    if (durationSeconds > 0) {
      map.set(action, durationSeconds);
      return;
    }

    map.delete(action);
  }
}
